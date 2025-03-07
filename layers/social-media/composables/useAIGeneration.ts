import { ref } from 'vue'
import { useAuth } from '../../auth/composables/auth'
import { useToaster } from '../../shared/composables/toaster'
import type { SocialPlatform, ContentType } from '../types'

interface GenerationOptions {
  tone?: string
  length?: string
  style?: string
  targetAudience?: string
  keywords?: string[]
  includeHashtags?: boolean
  includeEmojis?: boolean
}

interface OptimizationOptions {
  optimizationType: 'hashtags' | 'text' | 'image'
  platform: SocialPlatform
  constraints?: {
    maxLength?: number
    targetTone?: string
    optimizeFor?: 'engagement' | 'clicks' | 'shares'
  }
}

export function useAIGeneration() {
  const { isAuthenticated } = useAuth()
  const { showError } = useToaster()
  
  const generating = ref(false)
  const optimizing = ref(false)
  const error = ref<string | null>(null)

  // Generate content using AI
  const generateContent = async (
    prompt: string,
    platforms: SocialPlatform[],
    contentType: ContentType,
    options: GenerationOptions = {}
  ) => {
    if (!isAuthenticated.value) {
      error.value = 'Authentication required'
      return null
    }

    generating.value = true
    error.value = null

    try {
      // Call to AI Layer API
      const response = await $fetch('/api/ai/generate', {
        method: 'POST',
        body: {
          prompt,
          platforms,
          contentType,
          options
        }
      })

      if (!response.success) {
        throw new Error(response.error || 'Generation failed')
      }

      return response.results
    } catch (err: any) {
      console.error('Error generating content:', err)
      error.value = err.message || 'Failed to generate content'
      showError(error.value)
      return null
    } finally {
      generating.value = false
    }
  }

  // Optimize existing content
  const optimizeContent = async (
    contentId: string,
    originalText: string,
    options: OptimizationOptions
  ) => {
    if (!isAuthenticated.value) {
      error.value = 'Authentication required'
      return null
    }

    optimizing.value = true
    error.value = null

    try {
      const response = await $fetch('/api/ai/optimize', {
        method: 'POST',
        body: {
          contentId,
          originalText,
          optimizationType: options.optimizationType,
          platform: options.platform,
          constraints: options.constraints
        }
      })

      if (!response.success) {
        throw new Error(response.error || 'Optimization failed')
      }

      return response.result
    } catch (err: any) {
      console.error('Error optimizing content:', err)
      error.value = err.message || 'Failed to optimize content'
      showError(error.value)
      return null
    } finally {
      optimizing.value = false
    }
  }

  // Generate hashtag recommendations
  const generateHashtags = async (text: string, platform: SocialPlatform, count: number = 5) => {
    if (!isAuthenticated.value) {
      error.value = 'Authentication required'
      return null
    }

    generating.value = true
    error.value = null

    try {
      const response = await $fetch('/api/ai/hashtags', {
        method: 'POST',
        body: {
          text,
          platform,
          count
        }
      })

      if (!response.success) {
        throw new Error(response.error || 'Hashtag generation failed')
      }

      return response.hashtags
    } catch (err: any) {
      console.error('Error generating hashtags:', err)
      error.value = err.message || 'Failed to generate hashtags'
      showError(error.value)
      return null
    } finally {
      generating.value = false
    }
  }

  // Generate platform-specific variations
  const generateVariations = async (
    originalText: string,
    platforms: SocialPlatform[],
    options: GenerationOptions = {}
  ) => {
    if (!isAuthenticated.value) {
      error.value = 'Authentication required'
      return null
    }

    generating.value = true
    error.value = null

    try {
      const response = await $fetch('/api/ai/variations', {
        method: 'POST',
        body: {
          originalText,
          platforms,
          options
        }
      })

      if (!response.success) {
        throw new Error(response.error || 'Variation generation failed')
      }

      return response.variations
    } catch (err: any) {
      console.error('Error generating variations:', err)
      error.value = err.message || 'Failed to generate variations'
      showError(error.value)
      return null
    } finally {
      generating.value = false
    }
  }

  return {
    generating,
    optimizing,
    error,
    generateContent,
    optimizeContent,
    generateHashtags,
    generateVariations
  }
}