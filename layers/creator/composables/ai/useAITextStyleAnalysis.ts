import { ref } from 'vue'

export const useAITextStyleAnalysis = () => {
  const isAnalyzing = ref(false)
  const error = ref<string | null>(null)
  
  // Analyze voice and tone of text
  const analyzeVoiceAndTone = async (text: string) => {
    isAnalyzing.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/ai/text/analyze-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, analysisType: 'voiceTone' })
      })
      
      if (!response.ok) throw new Error('Failed to analyze voice and tone')
      
      const data = await response.json()
      return data.analysis
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to analyze text'
      throw err
    } finally {
      isAnalyzing.value = false
    }
  }
  
  // Match writing style between texts
  const matchWritingStyle = async (sourceText: string, targetText: string) => {
    isAnalyzing.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/ai/text/match-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourceText, targetText })
      })
      
      if (!response.ok) throw new Error('Failed to match writing style')
      
      const data = await response.json()
      return data.result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to match styles'
      throw err
    } finally {
      isAnalyzing.value = false
    }
  }
  
  // Check vocabulary consistency across content
  const checkVocabularyConsistency = async (texts: string[]) => {
    isAnalyzing.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/ai/text/vocabulary-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texts })
      })
      
      if (!response.ok) throw new Error('Failed to check vocabulary consistency')
      
      const data = await response.json()
      return data.results
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to check vocabulary'
      throw err
    } finally {
      isAnalyzing.value = false
    }
  }
  
  return {
    isAnalyzing,
    error,
    analyzeVoiceAndTone,
    matchWritingStyle,
    checkVocabularyConsistency
  }
}
