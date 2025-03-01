import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { ToolsHandler } from "../tools";
import { LLMHandler } from "../llm";
import type { LLMProvider } from "../../types/llm";

export interface MultilingualSupportAgentConfig {
  // Twilio configuration
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  twilioWhatsAppNumber?: string;
  twilioVerifyServiceSid?: string;
  
  // SendGrid configuration
  sendgridApiKey?: string;
  sendgridFromEmail?: string;
  
  // LLM configuration
  llmProvider?: LLMProvider;
  llmModel?: string;
  
  // Agent configuration
  verbose?: boolean;
  maxIterations?: number;
  
  // Language configuration
  defaultLanguage?: string;
  supportedLanguages?: string[];
}

export class MultilingualSupportAgent {
  private config: MultilingualSupportAgentConfig;
  private tools: any[] = [];
  private model: any;
  private supportedLanguages: Map<string, string>;

  constructor(config: MultilingualSupportAgentConfig = {}) {
    this.config = config;
    
    // Initialize supported languages
    this.supportedLanguages = new Map<string, string>();
    
    // Default supported languages if not provided
    const defaultLanguages = [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'ar', name: 'Arabic' },
      { code: 'ru', name: 'Russian' },
      { code: 'hi', name: 'Hindi' }
    ];
    
    // If supported languages are provided, use them
    if (config.supportedLanguages && config.supportedLanguages.length > 0) {
      config.supportedLanguages.forEach(lang => {
        const parts = lang.split(':');
        if (parts.length === 2) {
          this.supportedLanguages.set(parts[0], parts[1]);
        } else {
          this.supportedLanguages.set(lang, lang);
        }
      });
    } else {
      // Otherwise use default languages
      defaultLanguages.forEach(lang => {
        this.supportedLanguages.set(lang.code, lang.name);
      });
    }
  }

  private async initializeTools() {
    try {
      const tools = [];
      
      // Initialize Twilio SMS tool if credentials are provided
      if (this.config.twilioAccountSid && this.config.twilioAuthToken && this.config.twilioPhoneNumber) {
        const twilioSMSToolHandler = new ToolsHandler({ 
          type: 'twilio_sms',
          options: {
            accountSid: this.config.twilioAccountSid,
            authToken: this.config.twilioAuthToken,
            defaultFrom: this.config.twilioPhoneNumber
          }
        });
        tools.push(twilioSMSToolHandler);
      }
      
      // Initialize Twilio WhatsApp tool if credentials are provided
      if (this.config.twilioAccountSid && this.config.twilioAuthToken && this.config.twilioWhatsAppNumber) {
        const twilioWhatsAppToolHandler = new ToolsHandler({ 
          type: 'twilio_whatsapp',
          options: {
            accountSid: this.config.twilioAccountSid,
            authToken: this.config.twilioAuthToken,
            defaultFrom: this.config.twilioWhatsAppNumber
          }
        });
        tools.push(twilioWhatsAppToolHandler);
      }
      
      // Initialize Twilio Voice tool if credentials are provided
      if (this.config.twilioAccountSid && this.config.twilioAuthToken && this.config.twilioPhoneNumber) {
        const twilioVoiceToolHandler = new ToolsHandler({ 
          type: 'twilio_voice',
          options: {
            accountSid: this.config.twilioAccountSid,
            authToken: this.config.twilioAuthToken,
            defaultFrom: this.config.twilioPhoneNumber
          }
        });
        tools.push(twilioVoiceToolHandler);
      }
      
      // Initialize Twilio Verify tool if credentials are provided
      if (this.config.twilioAccountSid && this.config.twilioAuthToken && this.config.twilioVerifyServiceSid) {
        const twilioVerifyToolHandler = new ToolsHandler({ 
          type: 'twilio_verify',
          options: {
            accountSid: this.config.twilioAccountSid,
            authToken: this.config.twilioAuthToken,
            serviceSid: this.config.twilioVerifyServiceSid
          }
        });
        tools.push(twilioVerifyToolHandler);
      }
      
      // Initialize SendGrid Email tool if credentials are provided
      if (this.config.sendgridApiKey && this.config.sendgridFromEmail) {
        const sendgridEmailToolHandler = new ToolsHandler({ 
          type: 'sendgrid_email',
          options: {
            apiKey: this.config.sendgridApiKey,
            defaultFrom: this.config.sendgridFromEmail
          }
        });
        tools.push(sendgridEmailToolHandler);
      }
      
      // Initialize SendGrid Template Email tool if credentials are provided
      if (this.config.sendgridApiKey && this.config.sendgridFromEmail) {
        const sendgridTemplateEmailToolHandler = new ToolsHandler({ 
          type: 'sendgrid_template_email',
          options: {
            apiKey: this.config.sendgridApiKey,
            defaultFrom: this.config.sendgridFromEmail
          }
        });
        tools.push(sendgridTemplateEmailToolHandler);
      }
      
      // Add language detection and translation tools
      const languageDetectionToolHandler = new ToolsHandler({ 
        type: 'language_detection'
      });
      tools.push(languageDetectionToolHandler);
      
      const translationToolHandler = new ToolsHandler({ 
        type: 'translation'
      });
      tools.push(translationToolHandler);
      
      this.tools = tools;
    } catch (error) {
      console.error('Error initializing tools:', error);
      throw error;
    }
  }

  private async initializeModel() {
    const llmHandler = new LLMHandler({
      provider: (this.config.llmProvider || 'openai') as LLMProvider,
      temperature: 0.2, // Slightly creative for better customer support responses
      model: this.config.llmModel
    });
    this.model = await llmHandler.getLLMModel();
  }

  private async createAgent() {
    // Create a custom prompt for the multilingual support agent
    const systemMessage = `You are a helpful, friendly multilingual customer support agent. You can communicate in the following languages: ${Array.from(this.supportedLanguages.entries()).map(([code, name]) => `${name} (${code})`).join(', ')}.

Your job is to:
1. Detect the language of the customer's message
2. Respond in the same language
3. Help solve their problems
4. Use the available tools to send emails, SMS, WhatsApp messages, or make phone calls when necessary

Always be polite, professional, and helpful. If you don't know the answer to a question, be honest about it and offer to connect the customer with a human agent if possible.

Default language: ${this.config.defaultLanguage || 'en'} (${this.supportedLanguages.get(this.config.defaultLanguage || 'en') || 'English'})`;

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemMessage],
      ["human", "{input}"],
    ]);

    // Create the agent
    const agent = await createOpenAIFunctionsAgent({
      llm: this.model,
      tools: this.tools,
      prompt
    });

    return AgentExecutor.fromAgentAndTools({
      agent,
      tools: this.tools,
      verbose: this.config.verbose || false,
      maxIterations: this.config.maxIterations || 5,
    });
  }

  async initialize() {
    await this.initializeTools();
    await this.initializeModel();
    return this.createAgent();
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const languageDetectionTool = this.tools.find(tool => tool.config.type === 'language_detection');
      if (!languageDetectionTool) {
        return this.config.defaultLanguage || 'en';
      }
      
      const result = await languageDetectionTool.run(JSON.stringify({ text }));
      
      if (!result.success) {
        console.warn("Language detection failed, using default language");
        return this.config.defaultLanguage || 'en';
      }
      
      const data = JSON.parse(result.data);
      return data.languageCode || this.config.defaultLanguage || 'en';
    } catch (error) {
      console.error('Error detecting language:', error);
      return this.config.defaultLanguage || 'en';
    }
  }

  async translate(text: string, targetLanguage: string, sourceLanguage?: string): Promise<string> {
    try {
      const translationTool = this.tools.find(tool => tool.config.type === 'translation');
      if (!translationTool) {
        return text;
      }
      
      const result = await translationTool.run(JSON.stringify({ 
        text, 
        targetLanguage,
        sourceLanguage
      }));
      
      if (!result.success) {
        console.warn("Translation failed, using original text");
        return text;
      }
      
      const data = JSON.parse(result.data);
      return data.translatedText || text;
    } catch (error) {
      console.error('Error translating text:', error);
      return text;
    }
  }

  async sendEmail(to: string, subject: string, body: string, language?: string): Promise<any> {
    try {
      const sendgridEmailTool = this.tools.find(tool => tool.config.type === 'sendgrid_email');
      if (!sendgridEmailTool) {
        throw new Error("SendGrid email tool not initialized");
      }
      
      // Translate subject and body if language is provided and different from default
      let translatedSubject = subject;
      let translatedBody = body;
      
      if (language && language !== (this.config.defaultLanguage || 'en')) {
        translatedSubject = await this.translate(subject, language);
        translatedBody = await this.translate(body, language);
      }
      
      const result = await sendgridEmailTool.run(JSON.stringify({
        to,
        subject: translatedSubject,
        text: translatedBody,
      }));
      
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendSMS(to: string, body: string, language?: string): Promise<any> {
    try {
      const twilioSMSTool = this.tools.find(tool => tool.config.type === 'twilio_sms');
      if (!twilioSMSTool) {
        throw new Error("Twilio SMS tool not initialized");
      }
      
      // Translate body if language is provided and different from default
      let translatedBody = body;
      
      if (language && language !== (this.config.defaultLanguage || 'en')) {
        translatedBody = await this.translate(body, language);
      }
      
      const result = await twilioSMSTool.run(JSON.stringify({
        to,
        body: translatedBody,
      }));
      
      return result;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  async sendWhatsApp(to: string, body: string, language?: string, mediaUrl?: string): Promise<any> {
    try {
      const twilioWhatsAppTool = this.tools.find(tool => tool.config.type === 'twilio_whatsapp');
      if (!twilioWhatsAppTool) {
        throw new Error("Twilio WhatsApp tool not initialized");
      }
      
      // Translate body if language is provided and different from default
      let translatedBody = body;
      
      if (language && language !== (this.config.defaultLanguage || 'en')) {
        translatedBody = await this.translate(body, language);
      }
      
      const result = await twilioWhatsAppTool.run(JSON.stringify({
        to,
        body: translatedBody,
        mediaUrl
      }));
      
      return result;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  async makeCall(to: string, twiml: string, language?: string): Promise<any> {
    try {
      const twilioVoiceTool = this.tools.find(tool => tool.config.type === 'twilio_voice');
      if (!twilioVoiceTool) {
        throw new Error("Twilio Voice tool not initialized");
      }
      
      // Translate TwiML if language is provided and different from default
      let translatedTwiml = twiml;
      
      if (language && language !== (this.config.defaultLanguage || 'en')) {
        // Extract the text from the TwiML
        const sayMatch = twiml.match(/<Say.*?>(.*?)<\/Say>/);
        if (sayMatch && sayMatch[1]) {
          const originalText = sayMatch[1];
          const translatedText = await this.translate(originalText, language);
          translatedTwiml = twiml.replace(originalText, translatedText);
        }
      }
      
      const result = await twilioVoiceTool.run(JSON.stringify({
        to,
        twiml: translatedTwiml,
      }));
      
      return result;
    } catch (error) {
      console.error('Error making call:', error);
      throw error;
    }
  }

  async handleMessage(message: string, contactInfo: {
    email?: string;
    phone?: string;
    preferredLanguage?: string;
    preferredChannel?: 'email' | 'sms' | 'whatsapp' | 'voice';
  }): Promise<any> {
    try {
      // Initialize the agent if not already initialized
      const executor = await this.initialize();
      
      // Detect the language of the message if not provided
      const language = contactInfo.preferredLanguage || await this.detectLanguage(message);
      
      // Create the input for the agent
      const input = {
        input: message,
        language,
        contactInfo
      };
      
      // Invoke the agent
      const result = await executor.invoke(input);
      
      return {
        success: true,
        response: result.output,
        language,
        intermediateSteps: result.intermediateSteps
      };
    } catch (error) {
      console.error('Error handling message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        intermediateSteps: []
      };
    }
  }
}
