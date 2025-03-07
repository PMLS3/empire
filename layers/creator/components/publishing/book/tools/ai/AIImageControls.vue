<script setup lang="ts">
import { ref } from 'vue'
import { useAIImageGeneration } from '../../../../composables/ai/useAIImageGeneration'

const {
  isGenerating,
  error,
  generateIllustration,
  generateCharacter,
  generateBackground
} = useAIImageGeneration()

const emit = defineEmits(['imageGenerated'])
const prompt = ref('')
const generationType = ref<'illustration' | 'character' | 'background'>('illustration')
const stylePreset = ref('children-book')
const referenceImage = ref<string | null>(null)

const generateImage = async () => {
  if (!prompt.value.trim()) return
  
  try {
    let result: string
    switch (generationType.value) {
      case 'illustration':
        result = await generateIllustration(prompt.value, stylePreset.value)
        break
      case 'character':
        result = await generateCharacter(prompt.value, referenceImage.value || undefined)
        break
      case 'background':
        result = await generateBackground(prompt.value, stylePreset.value)
        break
      default:
        return
    }
    
    emit('imageGenerated', result)
    prompt.value = ''
  } catch (err) {
    console.error('Failed to generate image:', err)
  }
}
</script>

<template>
  <div class="p-4 space-y-4">
    <h3 class="text-sm font-medium text-gray-200">AI Image Generation</h3>
    
    <div class="space-y-2">
      <select
        v-model="generationType"
        class="w-full bg-gray-700 rounded p-2 text-sm text-white"
      >
        <option value="illustration">Generate Illustration</option>
        <option value="character">Create Character</option>
        <option value="background">Generate Background</option>
      </select>
      
      <select
        v-model="stylePreset"
        class="w-full bg-gray-700 rounded p-2 text-sm text-white"
      >
        <option value="children-book">Children's Book</option>
        <option value="watercolor">Watercolor</option>
        <option value="digital-art">Digital Art</option>
        <option value="realistic">Realistic</option>
      </select>
      
      <textarea
        v-model="prompt"
        :placeholder="'Describe the ' + generationType + ' you want to generate'"
        class="w-full h-32 bg-gray-700 rounded p-2 text-sm text-white"
      ></textarea>
      
      <div v-if="generationType === 'character'" class="space-y-2">
        <label class="block text-sm text-gray-400">Reference Image (Optional)</label>
        <input
          type="file"
          accept="image/*"
          class="w-full text-sm text-gray-400"
          @change="e => referenceImage = e.target.files?.[0] || null"
        />
      </div>
    </div>
    
    <div class="flex justify-end">
      <button
        class="px-4 py-2 bg-primary-500 rounded text-white text-sm disabled:opacity-50"
        :disabled="isGenerating || !prompt.trim()"
        @click="generateImage"
      >
        {{ isGenerating ? 'Generating...' : 'Generate' }}
      </button>
    </div>
    
    <div v-if="error" class="text-red-500 text-sm">
      {{ error }}
    </div>
  </div>
</template>
