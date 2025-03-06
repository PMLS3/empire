<template>
  <div class="space-y-6">
    <!-- Maze Grid -->
    <div 
      class="grid gap-px bg-gray-200 dark:bg-gray-700 p-px rounded-lg"
      :style="{ 'grid-template-columns': `repeat(${grid[0].length}, minmax(0, 1fr))` }"
    >
      <template v-for="(row, rowIndex) in grid" :key="rowIndex">
        <div
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          class="aspect-square relative"
          :class="{
            'bg-white dark:bg-gray-800': cell !== '#',
            'bg-gray-800 dark:bg-gray-900': cell === '#'
          }"
        >
          <!-- Path highlight -->
          <div
            v-if="isOnPath(rowIndex, colIndex)"
            class="absolute inset-0 bg-primary-500 opacity-30"
          />
          <!-- Start point -->
          <div
            v-if="isStart(rowIndex, colIndex)"
            class="absolute inset-0 flex items-center justify-center"
          >
            <div class="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <!-- End point -->
          <div
            v-if="isEnd(rowIndex, colIndex)"
            class="absolute inset-0 flex items-center justify-center"
          >
            <div class="w-3 h-3 rounded-full bg-red-500" />
          </div>
        </div>
      </template>
    </div>

    <!-- Statistics -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Maze Size</div>
          <div class="mt-1 text-2xl font-semibold">
            {{ grid.length }}x{{ grid[0].length }}
          </div>
        </div>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Path Length</div>
          <div class="mt-1 text-2xl font-semibold">{{ solution.length }} steps</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Difficulty</div>
          <div class="mt-1 text-2xl font-semibold capitalize">{{ difficulty }}</div>
        </div>
      </div>
    </div>

    <!-- Solution Steps -->
    <div class="space-y-2">
      <h3 class="font-medium text-gray-900 dark:text-gray-100">Solution Path:</h3>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(step, index) in solution"
          :key="index"
          class="px-3 py-1 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm"
        >
          {{ formatDirection(step) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Point {
  row: number
  col: number
}

const props = defineProps<{
  grid: string[][]
  start: Point
  end: Point
  solution: string[] // Array of directions: 'up', 'down', 'left', 'right'
  difficulty: string
}>()

const isStart = (row: number, col: number): boolean => {
  return row === props.start.row && col === props.start.col
}

const isEnd = (row: number, col: number): boolean => {
  return row === props.end.row && col === props.end.col
}

const isOnPath = (row: number, col: number): boolean => {
  let currentRow = props.start.row
  let currentCol = props.start.col
  
  // Check if the given cell is on the solution path
  return props.solution.some((direction, index) => {
    if (currentRow === row && currentCol === col) {
      return true
    }
    
    switch (direction) {
      case 'up':
        currentRow--
        break
      case 'down':
        currentRow++
        break
      case 'left':
        currentCol--
        break
      case 'right':
        currentCol++
        break
    }
    
    return currentRow === row && currentCol === col
  })
}

const formatDirection = (direction: string): string => {
  switch (direction) {
    case 'up':
      return '↑ Up'
    case 'down':
      return '↓ Down'
    case 'left':
      return '← Left'
    case 'right':
      return '→ Right'
    default:
      return direction
  }
}
</script>
