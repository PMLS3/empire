<template>
  <div class="space-y-6">
    <!-- Matched Pairs -->
    <div class="space-y-4">
      <div
        v-for="(pair, index) in pairs"
        :key="index"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="flex items-center gap-4">
          <div class="flex-1 text-center p-3 bg-primary-50 dark:bg-primary-900 rounded-lg">
            <div class="text-lg text-primary-600 dark:text-primary-400">{{ pair.first }}</div>
          </div>
          <div class="flex items-center">
            <div class="w-12 h-0.5 bg-primary-200 dark:bg-primary-700"></div>
            <div class="material-icons text-primary-400">
              compare_arrows
            </div>
            <div class="w-12 h-0.5 bg-primary-200 dark:bg-primary-700"></div>
          </div>
          <div class="flex-1 text-center p-3 bg-primary-50 dark:bg-primary-900 rounded-lg">
            <div class="text-lg text-primary-600 dark:text-primary-400">{{ pair.second }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Total Pairs</div>
          <div class="mt-1 text-2xl font-semibold">{{ pairs.length }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Category</div>
          <div class="mt-1 text-2xl font-semibold capitalize">{{ category }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Theme</div>
          <div class="mt-1 text-2xl font-semibold capitalize">{{ theme || 'None' }}</div>
        </div>
      </div>
    </div>

    <!-- Relationship Explanation -->
    <div class="space-y-2">
      <h3 class="font-medium text-gray-900 dark:text-gray-100">Pair Relationships:</h3>
      <div class="space-y-2">
        <div
          v-for="(pair, index) in pairs"
          :key="index"
          class="flex items-start gap-2 text-sm"
        >
          <span class="material-icons text-primary-600 dark:text-primary-400 text-base">
            arrow_right
          </span>
          <span>
            <span class="font-medium">{{ pair.first }}</span>
            <span class="text-gray-500 dark:text-gray-400">
              {{ getRelationshipDescription(category, pair) }}
            </span>
            <span class="font-medium">{{ pair.second }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Tips -->
    <div class="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 p-4 rounded-lg">
      <div class="flex items-center gap-2">
        <span class="material-icons">lightbulb</span>
        <span class="font-medium">Tips for Finding Matches:</span>
      </div>
      <ul class="mt-2 ml-8 list-disc space-y-1 text-sm">
        <li>Consider the category and theme for context</li>
        <li>Look for logical connections between items</li>
        <li>Group similar items together first</li>
        <li>Use process of elimination for difficult pairs</li>
      </ul>
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
  category: string
  theme?: string
}>()

const getRelationshipDescription = (category: string, pair: MatchingPair): string => {
  switch (category.toLowerCase()) {
    case 'vocabulary':
      return ' means '
    case 'geography':
      return ' is located in '
    case 'science':
      return ' is related to '
    case 'math':
      return ' equals '
    case 'history':
      return ' occurred in '
    default:
      return ' matches with '
  }
}
</script>
