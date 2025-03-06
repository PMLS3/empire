<template>
  <div class="space-y-6">
    <!-- Grid -->
    <div 
      class="grid gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
      :style="{ 'grid-template-columns': `repeat(${gridSize}, minmax(0, 1fr))` }"
    >
      <template v-for="(cell, index) in grid" :key="index">
        <div
          class="aspect-square flex items-center justify-center text-lg font-mono border border-gray-300 dark:border-gray-600 rounded"
          :class="{
            'bg-gray-100 dark:bg-gray-700': cell.isGiven,
            'text-primary-600 dark:text-primary-400': !cell.isGiven && showAnswers
          }"
        >
          {{ showAnswers || cell.isGiven ? cell.value : '?' }}
        </div>
      </template>
    </div>

    <!-- Operations -->
    <div class="space-y-2">
      <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Operations:</div>
      <div class="space-y-1">
        <div v-for="(operation, index) in operations" :key="index" class="text-sm text-gray-600 dark:text-gray-400">
          {{ operation }}
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="text-sm text-gray-600 dark:text-gray-400">
      Fill in the missing numbers so that all mathematical operations are correct.
      <div v-if="hint" class="mt-2">
        <span class="font-medium">Hint:</span> {{ hint }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface GridCell {
  value: number
  isGiven: boolean
}

defineProps<{
  grid: GridCell[]
  gridSize: number
  operations: string[]
  hint?: string
  showAnswers?: boolean
}>()
</script>
