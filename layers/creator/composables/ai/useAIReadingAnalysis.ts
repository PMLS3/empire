import { ref } from 'vue'

export interface ReadingLevelResult {
  fleschKincaidGradeLevel: number;
  fleschReadingEase: number;
  automatedReadabilityIndex: number;
  gradeLevel: string;
  ageRange: string;
  complexWords: string[];
  sentenceComplexityScore: number;
  vocabularyDiversity: number;
  recommendations: string[];
}

export const useAIReadingAnalysis = () => {
  const isAnalyzing = ref(false)
  const error = ref<string | null>(null)
  
  // Analyze reading level of text
  const analyzeReadingLevel = async (text: string): Promise<ReadingLevelResult> => {
    isAnalyzing.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/ai/text/reading-level', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      })
      
      if (!response.ok) throw new Error('Failed to analyze reading level')
      
      const data = await response.json()
      return data.analysis
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to analyze reading level'
      throw err
    } finally {
      isAnalyzing.value = false
    }
  }
  
  // Check age-appropriate vocabulary
  const checkAgeAppropriateVocabulary = async (text: string, targetAge: number) => {
    isAnalyzing.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/ai/text/age-appropriate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, targetAge })
      })
      
      if (!response.ok) throw new Error('Failed to check age-appropriate vocabulary')
      
      const data = await response.json()
      return {
        appropriate: data.appropriate,
        inappropriateWords: data.inappropriateWords,
        suggestions: data.suggestions
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to check vocabulary'
      throw err
    } finally {
      isAnalyzing.value = false
    }
  }
  
  // Analyze sentence complexity
  const analyzeSentenceComplexity = async (text: string) => {
    isAnalyzing.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/ai/text/sentence-complexity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      })
      
      if (!response.ok) throw new Error('Failed to analyze sentence complexity')
      
      const data = await response.json()
      return {
        complexityScore: data.complexityScore,
        sentenceAnalysis: data.sentenceAnalysis,
        recommendations: data.recommendations
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to analyze sentences'
      throw err
    } finally {
      isAnalyzing.value = false
    }
  }
  
  return {
    isAnalyzing,
    error,
    analyzeReadingLevel,
    checkAgeAppropriateVocabulary,
    analyzeSentenceComplexity
  }
}
