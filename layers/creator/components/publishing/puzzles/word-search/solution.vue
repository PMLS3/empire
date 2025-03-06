<template>
  <div class="space-y-6">
    <!-- Grid -->
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
            borderColor: borderColorComputed,
            border: '2px solid',
            backgroundColor: isHighlighted(rowIndex, colIndex) ? locationsColorComputed : backgroundColor
          }"
        >
          {{ cell.char }}
        </div>
      </div>
    </div>

    <!-- Found Words List -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 class="font-medium text-gray-900 dark:text-gray-100 mb-3">Found Words:</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div v-for="word in words" :key="word.word"
          class="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
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
          <div class="mt-1 text-2xl font-semibold">{{ grid.length }}x{{ grid[0].length }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WordPosition, WordPlacement, GridCell } from './types'

interface WordLocation {
  word: string
  start: [number, number]
  end: [number, number]
}

const props = defineProps<{
  grid: GridCell[][]
  words: WordPlacement[]
  size?: number
  textColor?: string
  backgroundColor?: string
  borderColor?: string
  locationsColor?: string
}>()
onMounted(() => {
  console.log('PROPS', props)
})
const gridSize = computed(() => props.grid[0]?.length || 0)
const textColor = computed(() => props.textColor || '#000000')
const backgroundColor = computed(() => props.backgroundColor || '#ffffff')
const borderColorComputed = computed(() => props.borderColor || '#000000')
const locationsColorComputed = computed(() => props.locationsColor || '#ff0000')

const isHighlighted = (row: number, col: number): boolean => {
  return props.words.some((placement: WordPlacement) => {
    const { word, position } = placement
    const { row: startRow, col: startCol, direction } = position
    let endRow = startRow
    let endCol = startCol

    // Calculate end position based on direction
    switch (direction) {
      case 'horizontal':
        endCol = startCol + word.length - 1
        break
      case 'vertical':
        endRow = startRow + word.length - 1
        break
      case 'diagonal-right':
        endRow = startRow + word.length - 1
        endCol = startCol + word.length - 1
        break
      case 'diagonal-left':
        endRow = startRow + word.length - 1
        endCol = startCol - word.length + 1
        break
    }

    // Check if point is on the line between start and end
    if (startRow === endRow) {
      // Horizontal
      return row === startRow &&
        col >= Math.min(startCol, endCol) &&
        col <= Math.max(startCol, endCol)
    } else if (startCol === endCol) {
      // Vertical
      return col === startCol &&
        row >= Math.min(startRow, endRow) &&
        row <= Math.max(startRow, endRow)
    } else {
      // Diagonal
      const rowDiff = endRow - startRow
      const colDiff = endCol - startCol
      const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff))
      const rowStep = rowDiff / steps
      const colStep = colDiff / steps

      for (let i = 0; i <= steps; i++) {
        const checkRow = startRow + i * rowStep
        const checkCol = startCol + i * colStep
        if (row === checkRow && col === checkCol) {
          return true
        }
      }
      return false
    }
  })
}
</script>
