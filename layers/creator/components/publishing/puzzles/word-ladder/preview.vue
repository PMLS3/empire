<template>
  <div class="space-y-6">
    <div class="flex flex-col items-center gap-2">
      <div class="text-2xl font-mono bg-white dark:bg-gray-800 px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
        {{ puzzle.startWord }}
      </div>
      <div class="h-6 border-l-2 border-gray-300 dark:border-gray-600" />
      
      <template v-if="showAnswers">
        <div 
          v-for="(step, index) in puzzle.solution" 
          :key="index"
          class="text-2xl font-mono bg-white dark:bg-gray-800 px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          {{ step.word }}
          <div v-if="step.hint" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ step.hint }}
          </div>
          <div v-if="index < puzzle.solution.length - 1" class="h-6 border-l-2 border-gray-300 dark:border-gray-600" />
        </div>
      </template>
      
      <template v-else>
        <div 
          v-for="index in puzzle.solution.length - 2" 
          :key="index"
          class="w-32 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
          :style="{ fontSize: getFontSize }"
        >
          ?
          <div v-if="index < puzzle.solution.length - 2" class="h-6 border-l-2 border-gray-300 dark:border-gray-600" />
        </div>
      </template>

      <div class="h-6 border-l-2 border-gray-300 dark:border-gray-600" />
      <div class="text-2xl font-mono bg-white dark:bg-gray-800 px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
        {{ puzzle.endWord }}
      </div>
    </div>

    <div class="text-sm text-gray-600 dark:text-gray-400">
      <div>Change one letter at a time to transform the first word into the last word. Each step must create a valid word.</div>
      <div v-if="puzzle.hints?.length" class="mt-2">
        <div v-for="(hint, index) in puzzle.hints" :key="index">
          <span class="font-medium">Hint {{ index + 1 }}:</span> {{ hint }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WordLadderSettings, WordLadderPuzzle } from './types'

const props = defineProps<{
  settings: WordLadderSettings
  puzzle: WordLadderPuzzle
  showAnswers?: boolean
}>()

const getFontSize = computed(() => {
  const sizes: Record<string, string> = {
    small: '0.875rem',
    medium: '1rem',
    large: '1.25rem'
  }
  return sizes[props.settings.fontSize] || sizes.medium
})
</script>
