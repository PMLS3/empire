# Preview component for word search puzzle
<template>
  <div class="space-y-6">
    <div
      class="inline-grid gap-1 w-full h-full"
      :style="{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        padding: '0.5rem'
      }"
    >
      <div
        v-for="(row, rowIndex) in grid"
        :key="rowIndex"
        class="contents"
      >
        <div
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          class="flex items-center justify-center aspect-square text-lg font-medium rounded"
          :style="{
            color: textColor,
            backgroundColor: backgroundColor,
            borderColor: borderColorComputed,
            border: '2px solid',
          }"
        >
          {{ cell.char }}
        </div>
      </div>
    </div>

    <!-- Words to Find -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 class="font-medium text-gray-900 dark:text-gray-100 mb-3">Words to Find:</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div v-for="word in words" :key="word.word" class="flex items-center space-x-2">
          <Icon name="mdi:check-circle" class="text-sm text-success-500" />
          <span>{{ word.word }}</span>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Total Words</div>
          <div class="mt-1 text-2xl font-semibold">{{ words.length }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Grid Size</div>
          <div class="mt-1 text-2xl font-semibold">{{ gridSize }}x{{ gridSize }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WordPosition, WordPlacement, GridCell } from './types'

const props = defineProps<{
  grid: GridCell[][]
  words: WordPlacement[]
  size?: number
  textColor?: string
  backgroundColor?: string
  borderColor?: string
}>()

console.log('PROPS PREVIEW', props)

const gridSize = computed(() => props.grid[0]?.length || 0)
const textColor = computed(() => props.textColor || '#000000')
const backgroundColor = computed(() => props.backgroundColor || '#ffffff')
const borderColorComputed = computed(() => props.borderColor || '#000000')
</script>

<style scoped>
/* No styles needed */
</style>
