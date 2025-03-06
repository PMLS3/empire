<template>
  <div class="space-y-6">
    <div v-for="(word, index) in scrambledWords" :key="index" class="space-y-2">
      <div class="flex items-center gap-4">
        <div class="text-2xl font-mono tracking-wider">{{ word.scrambled }}</div>
        <div v-if="showAnswers" class="text-sm text-gray-500 dark:text-gray-400">
          → {{ word.original }}
        </div>
      </div>
      <div v-if="word.hint" class="text-sm text-gray-600 dark:text-gray-400">
        Hint: {{ word.hint }}
      </div>
    </div>

    <div v-if="!showAnswers" class="text-sm text-gray-600 dark:text-gray-400">
      Unscramble each set of letters to find the hidden words.
    </div>
  </div>
</template>

<script setup lang="ts">
interface ScrambledWord {
  original: string
  scrambled: string
  hint?: string
}

defineProps<{
  scrambledWords: ScrambledWord[]
  showAnswers?: boolean
}>()
</script>
