<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAITextGeneration } from '../../../../composables/ai/useAITextGeneration'
import { useAITextStyleAnalysis } from '../../../../composables/ai/useAITextStyleAnalysis'
import { useAIReadingAnalysis } from '../../../../composables/ai/useAIReadingAnalysis'

const {
  isGenerating,
  error,
  expandChapter,
  developScene,
  generateDialogue,
  enhanceDescription
} = useAITextGeneration()

const {
  matchWritingStyle
} = useAITextStyleAnalysis()

const {
  analyzeReadingLevel
} = useAIReadingAnalysis()

const emit = defineEmits(['textGenerated'])
const input = ref('')
const generationType = ref<'chapter' | 'scene' | 'dialogue' | 'description' | 'style-match' | 'reading-level'>('chapter')
const styleSourceText = ref('')
const targetReadingLevel = ref<'elementary' | 'middle-school' | 'high-school' | 'college'>('middle-school')

const generateText = async () => {
  if (!input.value.trim()) return
  
  try {
    let result: string
    
    switch (generationType.value) {
      case 'chapter':
        result = await expandChapter(input.value)
        break
      case 'scene':
        result = await developScene(input.value)
        break
      case 'dialogue':
        result = await generateDialogue(input.value)
        break
      case 'description':
        result = await enhanceDescription(input.value)
        break
      case 'style-match':
        if (!styleSourceText.value.trim()) {
          throw new Error('Please provide a style source text')
        }
        result = await matchWritingStyle(styleSourceText.value, input.value)
        break
      case 'reading-level':
        // Add parameters to specify reading level target
        const options = { targetReadingLevel: targetReadingLevel.value }
        result = await generateText(input.value, options)
        break
      default:
        return
    }
    
    emit('textGenerated', result)
    input.value = ''
  } catch (err) {
    console.error('Failed to generate text:', err)
  }
}

const showStyleOptions = computed(() => generationType.value === 'style-match')
const showReadingLevelOptions = computed(() => generationType.value === 'reading-level')

</script>

<template>
  <div class="p-4 space-y-4">
    <h3 class="text-sm font-medium text-gray-200">AI Text Generation</h3>
    
    <div class="space-y-2">
      <select
        v-model="generationType"
        class="w-full bg-gray-700 rounded p-2 text-sm text-white"
      >
        <option value="chapter">Expand Chapter</option>
        <option value="scene">Develop Scene</option>
        <option value="dialogue">Generate Dialogue</option>
        <option value="description">Enhance Description</option>
        <option value="style-match">Match Writing Style</option>
        <option value="reading-level">Adjust Reading Level</option>
      </select>
      
      <!-- Style matching options -->
      <div v-if="showStyleOptions" class="space-y-2">
        <label class="block text-xs text-gray-400">Reference Text (Style Source)</label>
        <textarea
          v-model="styleSourceText"
          placeholder="Paste text with the style you want to match"
          class="w-full h-24 bg-gray-700 rounded p-2 text-sm text-white"
        ></textarea>
      </div>
      
      <!-- Reading level options -->
      <div v-if="showReadingLevelOptions" class="space-y-2">
        <label class="block text-xs text-gray-400">Target Reading Level</label>
        <select
          v-model="targetReadingLevel"
          class="w-full bg-gray-700 rounded p-2 text-sm text-white"
        >
          <option value="elementary">Elementary School (Grades 1-5)</option>
          <option value="middle-school">Middle School (Grades 6-8)</option>
          <option value="high-school">High School (Grades 9-12)</option>
          <option value="college">College Level</option>
        </select>
      </div>
      
      <textarea
        v-model="input"
        :placeholder="'Enter ' + generationType + ' outline or description'"
        class="w-full h-32 bg-gray-700 rounded p-2 text-sm text-white"
      ></textarea>
    </div>
    
    <div class="flex justify-end">
      <button
        class="px-4 py-2 bg-primary-500 rounded text-white text-sm disabled:opacity-50"
        :disabled="isGenerating || !input.trim() || (showStyleOptions && !styleSourceText)"
        @click="generateText"
      >
        {{ isGenerating ? 'Generating...' : 'Generate' }}
      </button>
    </div>
    
    <div v-if="error" class="text-red-500 text-sm">
      {{ error }}
    </div>
  </div>
</template>
