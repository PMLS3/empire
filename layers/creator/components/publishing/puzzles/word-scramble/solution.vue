<template>
  <div class="space-y-6">
    <!-- Solution List -->
    <div class="space-y-4">
      <div
        v-for="(word, index) in scrambledWords"
        :key="index"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="space-y-2">
          <!-- Scrambled to Original -->
          <div class="flex items-center gap-4">
            <div class="text-2xl font-mono tracking-wider text-gray-500 dark:text-gray-400 line-through">
              {{ word.scrambled }}
            </div>
            <div class="text-2xl">→</div>
            <div class="text-2xl font-mono tracking-wider text-primary-600 dark:text-primary-400">
              {{ word.original }}
            </div>
          </div>

          <!-- Hint if provided -->
          <div v-if="word.hint" class="text-sm">
            <span class="font-medium">Hint:</span>
            <span class="text-gray-600 dark:text-gray-400">{{ word.hint }}</span>
          </div>

          <!-- Letter Mapping -->
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Letter changes:
            {{ getLetterChanges(word.scrambled, word.original) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Total Words</div>
          <div class="mt-1 text-2xl font-semibold">{{ scrambledWords.length }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Average Length</div>
          <div class="mt-1 text-2xl font-semibold">{{ calculateAverageLength() }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Theme</div>
          <div class="mt-1 text-2xl font-semibold capitalize">{{ theme || 'None' }}</div>
        </div>
      </div>
    </div>

    <!-- Tips -->
    <div class="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 p-4 rounded-lg">
      <div class="flex items-center gap-2">
        <span class="material-icons">lightbulb</span>
        <span class="font-medium">Tips for Solving Word Scrambles:</span>
      </div>
      <ul class="mt-2 ml-8 list-disc space-y-1 text-sm">
        <li>Look for common prefixes and suffixes</li>
        <li>Try to identify vowels and consonant patterns</li>
        <li>Consider the theme for context clues</li>
        <li>Use hints when provided</li>
        <li>Break longer words into smaller chunks</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ScrambledWord {
  original: string
  scrambled: string
  hint?: string
}

const props = defineProps<{
  scrambledWords: ScrambledWord[]
  theme?: string
}>()

const getLetterChanges = (scrambled: string, original: string): string => {
  const changes: string[] = []
  for (let i = 0; i < scrambled.length; i++) {
    if (scrambled[i] !== original[i]) {
      changes.push(`${scrambled[i]}→${original[i]}`)
    }
  }
  return changes.join(', ')
}

const calculateAverageLength = (): number => {
  const totalLength = props.scrambledWords.reduce((sum, word) => sum + word.original.length, 0)
  return Math.round(totalLength / props.scrambledWords.length)
}
</script>
