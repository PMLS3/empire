import { ref } from 'vue'

export const useAITextGeneration = () => {
  const isGenerating = ref(false)
  const error = ref<string | null>(null)

  const generateText = async (prompt: string, options: {
    genre?: string
    style?: string
    readingLevel?: string
    tonePreference?: string
  }) => {
    isGenerating.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/ai/text/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          ...options
        })
      })
      
      if (!response.ok) throw new Error('Failed to generate text')
      
      const data = await response.json()
      return data.text
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to generate text'
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  const expandChapter = async (outline: string) => {
    return generateText(outline, { style: 'narrative' })
  }

  const developScene = async (summary: string) => {
    return generateText(summary, { style: 'descriptive' })
  }

  const generateDialogue = async (context: string) => {
    return generateText(context, { style: 'dialogue' })
  }

  const enhanceDescription = async (text: string) => {
    return generateText(text, { style: 'descriptive' })
  }

  return {
    isGenerating,
    error,
    generateText,
    expandChapter,
    developScene,
    generateDialogue,
    enhanceDescription
  }
}
