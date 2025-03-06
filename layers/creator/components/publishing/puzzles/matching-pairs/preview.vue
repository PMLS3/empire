<template>
  <div class="space-y-6">
    <!-- Grid of pairs -->
    <div class="grid gap-4" :style="{ 'grid-template-columns': `repeat(${columns}, minmax(0, 1fr))` }">
      <div
        v-for="(pair, index) in pairs"
        :key="index"
        class="flex flex-col gap-2"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          {{ pair.first }}
        </div>
        <div 
          v-if="showAnswers"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center"
        >
          {{ pair.second }}
        </div>
      </div>
    </div>

    <!-- Shuffled answers -->
    <div v-if="!showAnswers">
      <h4 class="font-medium mb-2">Match with:</h4>
      <div class="grid gap-2" :style="{ 'grid-template-columns': `repeat(${columns}, minmax(0, 1fr))` }">
        <div
          v-for="answer in shuffledAnswers"
          :key="answer"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center"
        >
          {{ answer }}
        </div>
      </div>
    </div>

    <div class="text-sm text-gray-600 dark:text-gray-400">
      Match each item in the top row with its corresponding pair in the bottom row.
    </div>
  </div>
</template>

<script setup lang="ts">
interface MatchingPair {
  first: string
  second: string
}

const props = defineProps<{
  pairs: MatchingPair[]
  showAnswers?: boolean
}>()

const columns = computed(() => Math.min(4, props.pairs.length))

const shuffledAnswers = computed(() => {
  const answers = props.pairs.map(p => p.second)
  return answers.sort(() => Math.random() - 0.5)
})
</script>
