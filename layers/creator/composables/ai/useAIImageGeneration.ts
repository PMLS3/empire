import { ref } from 'vue'

export const useAIImageGeneration = () => {
  const isGenerating = ref(false)
  const error = ref<string | null>(null)

  const generateImage = async (prompt: string, options: {
    style?: string
    dimensions?: { width: number; height: number }
    colorPalette?: string[]
    characterConsistency?: {
      reference: string
      features: string[]
    }
  }) => {
    isGenerating.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/ai/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          ...options
        })
      })
      
      if (!response.ok) throw new Error('Failed to generate image')
      
      const data = await response.json()
      return data.imageUrl
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to generate image'
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  const generateIllustration = async (scene: string, style: string) => {
    return generateImage(scene, { style })
  }

  const generateCharacter = async (description: string, reference?: string) => {
    return generateImage(description, {
      characterConsistency: reference ? {
        reference,
        features: ['face', 'clothing', 'proportions']
      } : undefined
    })
  }

  const generateBackground = async (description: string, style: string) => {
    return generateImage(description, { style })
  }

  return {
    isGenerating,
    error,
    generateImage,
    generateIllustration,
    generateCharacter,
    generateBackground
  }
}
