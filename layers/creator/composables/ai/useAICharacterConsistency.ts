import { ref } from 'vue'

export interface Character {
  id: string;
  name: string;
  referenceImages: string[];
  features: {
    face: string;
    hair: string;
    clothing: string[];
    accessories: string[];
    physicalAttributes: string[];
  };
  description: string;
}

export const useAICharacterConsistency = () => {
  const isProcessing = ref(false)
  const error = ref<string | null>(null)
  const characters = ref<Character[]>([])
  
  // Track character appearance across images
  const trackCharacterAppearance = async (
    characterId: string,
    newImageUrl: string
  ) => {
    isProcessing.value = true
    error.value = null
    
    try {
      const character = characters.value.find(c => c.id === characterId)
      if (!character) throw new Error('Character not found')
      
      const response = await fetch('/api/ai/character/track-appearance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId,
          referenceImages: character.referenceImages,
          features: character.features,
          newImage: newImageUrl
        })
      })
      
      if (!response.ok) throw new Error('Character tracking failed')
      
      const data = await response.json()
      return {
        consistencyScore: data.consistencyScore,
        detectedFeatures: data.detectedFeatures,
        recommendations: data.recommendations
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Character tracking failed'
      throw err
    } finally {
      isProcessing.value = false
    }
  }
  
  // Preserve facial features when generating new images
  const preserveFacialFeatures = async (
    characterId: string,
    prompt: string,
    styleParams?: any
  ) => {
    isProcessing.value = true
    error.value = null
    
    try {
      const character = characters.value.find(c => c.id === characterId)
      if (!character) throw new Error('Character not found')
      
      const response = await fetch('/api/ai/character/preserve-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId,
          referenceImages: character.referenceImages,
          features: character.features,
          prompt,
          styleParams
        })
      })
      
      if (!response.ok) throw new Error('Feature preservation failed')
      
      const data = await response.json()
      return data.resultImageUrl
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Feature preservation failed'
      throw err
    } finally {
      isProcessing.value = false
    }
  }
  
  // Maintain outfit and accessory consistency
  const maintainOutfitConsistency = async (
    characterId: string,
    prompt: string,
    outfitOverrides?: string[]
  ) => {
    isProcessing.value = true
    error.value = null
    
    try {
      const character = characters.value.find(c => c.id === characterId)
      if (!character) throw new Error('Character not found')
      
      const response = await fetch('/api/ai/character/outfit-consistency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId,
          referenceImages: character.referenceImages,
          features: character.features,
          prompt,
          outfitOverrides
        })
      })
      
      if (!response.ok) throw new Error('Outfit consistency failed')
      
      const data = await response.json()
      return data.resultImageUrl
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Outfit consistency failed'
      throw err
    } finally {
      isProcessing.value = false
    }
  }
  
  // Create or update character
  const saveCharacter = (character: Omit<Character, 'id'> & { id?: string }) => {
    const existingIndex = character.id ? characters.value.findIndex(c => c.id === character.id) : -1
    
    if (existingIndex >= 0) {
      // Update existing character
      characters.value[existingIndex] = { 
        ...characters.value[existingIndex],
        ...character,
        id: character.id as string
      }
    } else {
      // Create new character
      const newId = Date.now().toString()
      characters.value.push({
        ...character,
        id: newId
      })
    }
  }
  
  // Get character by ID
  const getCharacter = (characterId: string) => {
    return characters.value.find(c => c.id === characterId)
  }
  
  // Delete character
  const deleteCharacter = (characterId: string) => {
    characters.value = characters.value.filter(c => c.id !== characterId)
  }
  
  // Get all characters
  const getAllCharacters = () => {
    return characters.value
  }
  
  return {
    isProcessing,
    error,
    characters,
    trackCharacterAppearance,
    preserveFacialFeatures,
    maintainOutfitConsistency,
    saveCharacter,
    getCharacter,
    deleteCharacter,
    getAllCharacters
  }
}
