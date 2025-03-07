<script setup lang="ts">
import { ref } from 'vue'
import { useAITextStyleAnalysis } from '../../../../../composables/ai/useAITextStyleAnalysis'
import { useAIReadingAnalysis } from '../../../../../composables/ai/useAIReadingAnalysis'

const {
  isAnalyzing: isStyleAnalyzing,
  analyzeVoiceAndTone,
  matchWritingStyle,
  checkVocabularyConsistency
} = useAITextStyleAnalysis()

const {
  isAnalyzing: isReadingAnalyzing,
  analyzeReadingLevel
} = useAIReadingAnalysis()

const props = defineProps<{
  text: string;
  contentType?: 'chapter' | 'scene' | 'paragraph';
}>()

const emit = defineEmits(['update'])

const analysisResults = ref<any>(null)
const readingLevelResults = ref<any>(null)
const activeTab = ref<'style' | 'reading'>('style')
const isAnalysisLoading = ref(false)

// Run a full text analysis
const runStyleAnalysis = async () => {
  if (!props.text || props.text.length < 20) {
    return
  }
  
  isAnalysisLoading.value = true
  
  try {
    const results = await analyzeVoiceAndTone(props.text)
    analysisResults.value = results
  } catch (error) {
    console.error('Analysis error:', error)
  } finally {
    isAnalysisLoading.value = false
  }
}

// Run reading level analysis
const runReadingLevelAnalysis = async () => {
  if (!props.text || props.text.length < 20) {
    return
  }
  
  isAnalysisLoading.value = true
  
  try {
    const results = await analyzeReadingLevel(props.text)
    readingLevelResults.value = results
  } catch (error) {
    console.error('Reading level analysis error:', error)
  } finally {
    isAnalysisLoading.value = false
  }
}

// Apply suggested changes
const applyChanges = (updatedText: string) => {
  emit('update', updatedText)
}

// Reset analysis results
const resetAnalysis = () => {
  analysisResults.value = null
  readingLevelResults.value = null
}

// Watch for significant text changes to reset analysis
watch(() => props.text, (newText, oldText) => {
  if (oldText && Math.abs(newText.length - oldText.length) > oldText.length * 0.1) {
    resetAnalysis()
  }
}, { deep: true })
</script>

<template>
  <div class="p-4 space-y-4 bg-gray-800">
    <div class="flex justify-between items-center">
      <h3 class="text-sm font-medium text-gray-200">Text Analysis</h3>
      <div class="flex space-x-2">
        <button 
          class="px-3 py-1 rounded text-xs" 
          :class="activeTab === 'style' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'" 
          @click="activeTab = 'style'"
        >
          Style
        </button>
        <button 
          class="px-3 py-1 rounded text-xs" 
          :class="activeTab === 'reading' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'" 
          @click="activeTab = 'reading'"
        >
          Reading Level
        </button>
      </div>
    </div>
    
    <!-- Style Analysis Tab -->
    <div v-if="activeTab === 'style'" class="space-y-4">
      <button
        class="w-full py-2 rounded bg-blue-600 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        :disabled="isStyleAnalyzing || !text || text.length < 20"
        @click="runStyleAnalysis"
      >
        {{ isStyleAnalyzing ? 'Analyzing...' : 'Analyze Style & Tone' }}
      </button>
      
      <div v-if="analysisResults" class="space-y-3 p-3 bg-gray-700 rounded">
        <div v-if="analysisResults.tone" class="space-y-1">
          <h4 class="text-xs font-medium text-white">Tone Analysis</h4>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="(score, tone) in analysisResults.tone"
              :key="tone"
              class="px-2 py-1 text-xs rounded"
              :class="`bg-blue-${Math.floor(score * 9)}00 bg-opacity-${Math.floor(score * 100)}`"
            >
              {{ tone }}: {{ (score * 100).toFixed(0) }}%
            </span>
          </div>
        </div>
        
        <div v-if="analysisResults.voice" class="space-y-1">
          <h4 class="text-xs font-medium text-white">Voice Characteristics</h4>
          <ul class="text-xs text-gray-300 ml-4 list-disc">
            <li v-for="(trait, index) in analysisResults.voice" :key="index">{{ trait }}</li>
          </ul>
        </div>
        
        <div v-if="analysisResults.suggestions" class="space-y-1">
          <h4 class="text-xs font-medium text-white">Style Suggestions</h4>
          <ul class="text-xs text-gray-300 ml-4 list-disc">
            <li v-for="(suggestion, index) in analysisResults.suggestions" :key="index">{{ suggestion }}</li>
          </ul>
        </div>
      </div>
      
      <div v-else-if="isAnalysisLoading" class="p-3 bg-gray-700 rounded text-center">
        <span class="text-sm text-gray-300">Analyzing your text...</span>
        <div class="mt-2 h-1 w-full bg-gray-600 rounded overflow-hidden">
          <div class="h-full bg-blue-600 animate-pulse"></div>
        </div>
      </div>
      
      <div v-else class="p-3 bg-gray-700 rounded text-center">
        <p class="text-sm text-gray-400">
          Click "Analyze Style & Tone" to evaluate your text's voice, tone, and consistency.
        </p>
      </div>
    </div>
    
    <!-- Reading Level Tab -->
    <div v-if="activeTab === 'reading'" class="space-y-4">
      <button
        class="w-full py-2 rounded bg-green-600 text-sm text-white hover:bg-green-700 disabled:opacity-50"
        :disabled="isReadingAnalyzing || !text || text.length < 20"
        @click="runReadingLevelAnalysis"
      >
        {{ isReadingAnalyzing ? 'Analyzing...' : 'Analyze Reading Level' }}
      </button>
      
      <div v-if="readingLevelResults" class="space-y-3 p-3 bg-gray-700 rounded">
        <div class="grid grid-cols-2 gap-2">
          <div class="p-2 bg-gray-800 rounded">
            <div class="text-xs text-gray-400">Grade Level</div>
            <div class="text-lg font-medium text-white">{{ readingLevelResults.gradeLevel }}</div>
          </div>
          <div class="p-2 bg-gray-800 rounded">
            <div class="text-xs text-gray-400">Age Range</div>
            <div class="text-lg font-medium text-white">{{ readingLevelResults.ageRange }}</div>
          </div>
        </div>
        
        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">Flesch Reading Ease</span>
            <span class="text-white">{{ readingLevelResults.fleschReadingEase.toFixed(1) }}</span>
          </div>
          <div class="w-full bg-gray-600 rounded-full h-1.5">
            <div class="bg-blue-600 h-1.5 rounded-full" :style="{ width: `${Math.min(100, readingLevelResults.fleschReadingEase)}%` }"></div>
          </div>
        </div>
        
        <div class="space-y-1">
          <h4 class="text-xs font-medium text-white">Vocabulary</h4>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="(word, index) in readingLevelResults.complexWords?.slice(0, 5)"
              :key="index"
              class="px-2 py-1 text-xs bg-yellow-700 bg-opacity-50 rounded"
            >
              {{ word }}
            </span>
          </div>
        </div>
        
        <div class="space-y-1" v-if="readingLevelResults.recommendations?.length">
          <h4 class="text-xs font-medium text-white">Recommendations</h4>
          <ul class="text-xs text-gray-300 ml-4 list-disc">
            <li v-for="(recommendation, index) in readingLevelResults.recommendations" :key="index">{{ recommendation }}</li>
          </ul>
        </div>
      </div>
      
      <div v-else-if="isAnalysisLoading" class="p-3 bg-gray-700 rounded text-center">
        <span class="text-sm text-gray-300">Calculating reading level...</span>
        <div class="mt-2 h-1 w-full bg-gray-600 rounded overflow-hidden">
          <div class="h-full bg-green-600 animate-pulse"></div>
        </div>
      </div>
      
      <div v-else class="p-3 bg-gray-700 rounded text-center">
        <p class="text-sm text-gray-400">
          Click "Analyze Reading Level" to evaluate the text complexity and appropriate age range.
        </p>
      </div>
    </div>
  </div>
</template>
