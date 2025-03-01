import { Tool } from "@langchain/core/tools";
import axios from "axios";

/**
 * LanguageDetectionTool - A tool for detecting the language of text
 */
export class LanguageDetectionTool extends Tool {
  name = "language_detection";
  description = "A tool for detecting the language of text. Input should be a JSON string with 'text' field.";
  
  private apiKey?: string;

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { text } = params;

      if (!text) {
        throw new Error("'text' field is required");
      }

      // If API key is provided, use a language detection service
      if (this.apiKey) {
        return await this.detectLanguageWithAPI(text);
      } else {
        // Otherwise use a simple heuristic approach
        return await this.detectLanguageHeuristic(text);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Language detection error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in language detection');
    }
  }

  private async detectLanguageWithAPI(text: string): Promise<string> {
    try {
      // This is a placeholder for an actual API call to a language detection service
      // Replace with your preferred service (Google Cloud Translation, Azure Translator, etc.)
      const response = await axios.post(
        "https://translation.googleapis.com/language/translate/v2/detect",
        {},
        {
          params: {
            q: text,
            key: this.apiKey,
          },
        }
      );

      const detectedLanguage = response.data.data.detections[0][0].language;
      
      return JSON.stringify({
        languageCode: detectedLanguage,
        confidence: response.data.data.detections[0][0].confidence,
      });
    } catch (error) {
      console.error("Error using language detection API:", error);
      // Fall back to heuristic approach
      return this.detectLanguageHeuristic(text);
    }
  }

  private async detectLanguageHeuristic(text: string): Promise<string> {
    // This is a very simple language detection heuristic based on common words
    // In a real implementation, you would use a more sophisticated approach
    
    const languagePatterns: Record<string, RegExp[]> = {
      en: [/\b(the|and|is|in|to|of|a|for|that|this)\b/gi],
      es: [/\b(el|la|los|las|y|es|en|de|un|una|que|este|esta)\b/gi],
      fr: [/\b(le|la|les|et|est|en|de|un|une|que|ce|cette)\b/gi],
      de: [/\b(der|die|das|und|ist|in|zu|von|ein|eine|dass|dieser|diese|dieses)\b/gi],
      it: [/\b(il|la|i|le|e|è|in|di|un|una|che|questo|questa)\b/gi],
      pt: [/\b(o|a|os|as|e|é|em|de|um|uma|que|este|esta)\b/gi],
      nl: [/\b(de|het|en|is|in|te|van|een|dat|dit|deze)\b/gi],
      ru: [/\b(и|в|не|на|я|что|тот|быть|для|это)\b/gi],
      ja: [/[\u3040-\u309F\u30A0-\u30FF]/g], // Hiragana and Katakana
      zh: [/[\u4E00-\u9FFF]/g], // Chinese characters
      ko: [/[\uAC00-\uD7AF]/g], // Korean characters
      ar: [/[\u0600-\u06FF]/g], // Arabic characters
      hi: [/[\u0900-\u097F]/g], // Devanagari (Hindi)
    };

    const scores: Record<string, number> = {};
    
    // Calculate scores for each language
    for (const [lang, patterns] of Object.entries(languagePatterns)) {
      scores[lang] = 0;
      for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
          scores[lang] += matches.length;
        }
      }
    }
    
    // Find the language with the highest score
    let maxScore = 0;
    let detectedLanguage = "en"; // Default to English
    
    for (const [lang, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedLanguage = lang;
      }
    }
    
    return JSON.stringify({
      languageCode: detectedLanguage,
      confidence: maxScore > 0 ? Math.min(maxScore / 10, 1) : 0.5, // Simple confidence score
    });
  }
}

/**
 * TranslationTool - A tool for translating text between languages
 */
export class TranslationTool extends Tool {
  name = "translation";
  description = "A tool for translating text between languages. Input should be a JSON string with 'text', 'targetLanguage', and optional 'sourceLanguage' fields.";
  
  private apiKey?: string;

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { text, targetLanguage, sourceLanguage } = params;

      if (!text) {
        throw new Error("'text' field is required");
      }

      if (!targetLanguage) {
        throw new Error("'targetLanguage' field is required");
      }

      // If API key is provided, use a translation service
      if (this.apiKey) {
        return await this.translateWithAPI(text, targetLanguage, sourceLanguage);
      } else {
        // Otherwise use a simple mock translation
        return await this.mockTranslation(text, targetLanguage, sourceLanguage);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Translation error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in translation');
    }
  }

  private async translateWithAPI(text: string, targetLanguage: string, sourceLanguage?: string): Promise<string> {
    try {
      // This is a placeholder for an actual API call to a translation service
      // Replace with your preferred service (Google Cloud Translation, Azure Translator, etc.)
      const response = await axios.post(
        "https://translation.googleapis.com/language/translate/v2",
        {},
        {
          params: {
            q: text,
            target: targetLanguage,
            ...(sourceLanguage && { source: sourceLanguage }),
            key: this.apiKey,
          },
        }
      );

      const translatedText = response.data.data.translations[0].translatedText;
      const detectedSourceLanguage = response.data.data.translations[0].detectedSourceLanguage || sourceLanguage;
      
      return JSON.stringify({
        translatedText,
        sourceLanguage: detectedSourceLanguage,
        targetLanguage,
      });
    } catch (error) {
      console.error("Error using translation API:", error);
      // Fall back to mock translation
      return this.mockTranslation(text, targetLanguage, sourceLanguage);
    }
  }

  private async mockTranslation(text: string, targetLanguage: string, sourceLanguage?: string): Promise<string> {
    // This is a mock translation that simply adds a language tag to the text
    // In a real implementation, you would use a proper translation service
    
    // Detect source language if not provided
    let detectedSourceLanguage = sourceLanguage;
    if (!detectedSourceLanguage) {
      const languageDetectionTool = new LanguageDetectionTool();
      const detectionResult = await languageDetectionTool._call(JSON.stringify({ text }));
      const detection = JSON.parse(detectionResult);
      detectedSourceLanguage = detection.languageCode;
    }
    
    // If source and target languages are the same, return the original text
    if (detectedSourceLanguage === targetLanguage) {
      return JSON.stringify({
        translatedText: text,
        sourceLanguage: detectedSourceLanguage,
        targetLanguage,
      });
    }
    
    // Mock translation by adding a language tag
    const translatedText = `[${targetLanguage}] ${text}`;
    
    return JSON.stringify({
      translatedText,
      sourceLanguage: detectedSourceLanguage,
      targetLanguage,
    });
  }
}
