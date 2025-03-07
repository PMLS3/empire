import { ref } from 'vue'

export interface StyleConsistencyOptions {
  referenceImage: string;
  targetElements: string[];
  styleStrength: number; // 0-1 range
}

export interface ColorPaletteOptions {
  colors: string[];
  paletteStrength: number; // 0-1 range
}

export const useAIImageStyleConsistency = () => {
  const isProcessing = ref(false)
  const error = ref<string | null>(null)
  
  // Apply style transfer between illustrations
  const applyStyleTransfer = async (
    sourceImageUrl: string, 
    targetImageUrl: string,
    options?: { strength?: number }
  ) => {
    isProcessing.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/ai/image/style-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceImage: sourceImageUrl,
          targetImage: targetImageUrl,
          strength: options?.strength || 0.8
        })
      })
      
      if (!response.ok) throw new Error('Style transfer failed')
      
      const data = await response.json()
      return data.resultImageUrl
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Style transfer failed'
      throw err
    } finally {
      isProcessing.value = false
    }
  }
  
  // Apply color palette to an image
  const applyColorPalette = async (
    imageUrl: string,
    colorPalette: string[],
    options?: { strength?: number }
  ) => {
    isProcessing.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/ai/image/apply-palette', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          colorPalette,
          strength: options?.strength || 0.8
        })
      })
      
      if (!response.ok) throw new Error('Color palette application failed')
      
      const data = await response.json()
      return data.resultImageUrl
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Color palette application failed'
      throw err
    } finally {
      isProcessing.value = false
    }
  }
  
  // Extract color palette from an image
  const extractColorPalette = async (imageUrl: string, colorCount: number = 5) => {
    isProcessing.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/ai/image/extract-palette', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          colorCount
        })
      })
      
      if (!response.ok) throw new Error('Color palette extraction failed')
      
      const data = await response.json()
      return data.colors // Array of hex colors
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Color palette extraction failed'
      throw err
    } finally {
      isProcessing.value = false
    }
  }
  
  // Match art style across multiple illustrations
  const matchArtStyle = async (
    referenceImageUrl: string,
    targetImagesUrls: string[],
    options?: { strength?: number }
  ) => {
    isProcessing.value = true
    error.value = null
    
    try {
      const response = await fetch('/api/ai/image/match-art-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referenceImage: referenceImageUrl,
          targetImages: targetImagesUrls,
          strength: options?.strength || 0.8
        })
      })
      
      if (!response.ok) throw new Error('Art style matching failed')
      
      const data = await response.json()
      return data.resultImages // Array of processed image URLs
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Art style matching failed'
      throw err
    } finally {
      isProcessing.value = false
    }
  }
  
  return {
    isProcessing,
    error,
    applyStyleTransfer,
    applyColorPalette,
    extractColorPalette,
    matchArtStyle
  }
}
