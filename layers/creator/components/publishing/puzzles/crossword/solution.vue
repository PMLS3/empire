<template>
  <div class="space-y-6">
    <!-- Grid -->
    <div class="grid gap-px bg-gray-300 dark:bg-gray-600 p-px rounded-lg">
      <div 
        class="grid"
        :style="{ 'grid-template-columns': `repeat(${grid[0].length}, minmax(0, 1fr))` }"
      >
        <template v-for="(row, rowIndex) in grid" :key="rowIndex">
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            class="aspect-square flex items-center justify-center relative bg-white dark:bg-gray-800"
            :class="{
              'bg-primary-50 dark:bg-primary-900': cell !== '#'
            }"
          >
            <template v-if="cell !== '#'">
              <!-- Number in top-left -->
              <div
                v-if="getClueNumber(rowIndex, colIndex)"
                class="absolute top-0.5 left-0.5 text-xs text-gray-500 dark:text-gray-400"
              >
                {{ getClueNumber(rowIndex, colIndex) }}
              </div>
              <!-- Letter -->
              <div class="text-lg font-mono text-primary-600 dark:text-primary-400">
                {{ cell }}
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>

    <!-- Clues -->
    <div class="grid sm:grid-cols-2 gap-6">
      <!-- Across -->
      <div>
        <h3 class="font-medium text-gray-900 dark:text-gray-100 mb-3">Across</h3>
        <div class="space-y-2">
          <div
            v-for="clue in acrossClues"
            :key="clue.number"
            class="flex space-x-2"
          >
            <div class="font-medium w-6">{{ clue.number }}.</div>
            <div class="flex-1">
              <div>{{ clue.clue }}</div>
              <div class="text-primary-600 dark:text-primary-400 text-sm mt-1">
                Answer: {{ clue.answer }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Down -->
      <div>
        <h3 class="font-medium text-gray-900 dark:text-gray-100 mb-3">Down</h3>
        <div class="space-y-2">
          <div
            v-for="clue in downClues"
            :key="clue.number"
            class="flex space-x-2"
          >
            <div class="font-medium w-6">{{ clue.number }}.</div>
            <div class="flex-1">
              <div>{{ clue.clue }}</div>
              <div class="text-primary-600 dark:text-primary-400 text-sm mt-1">
                Answer: {{ clue.answer }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Total Words</div>
          <div class="mt-1 text-2xl font-semibold">
            {{ acrossClues.length + downClues.length }}
          </div>
        </div>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Grid Size</div>
          <div class="mt-1 text-2xl font-semibold">
            {{ grid.length }}x{{ grid[0].length }}
          </div>
        </div>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Fill Rate</div>
          <div class="mt-1 text-2xl font-semibold">
            {{ calculateFillRate() }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CrosswordClue {
  number: number
  clue: string
  answer: string
  row: number
  col: number
}

const props = defineProps<{
  grid: string[][]
  acrossClues: CrosswordClue[]
  downClues: CrosswordClue[]
}>()

const getClueNumber = (row: number, col: number): number | null => {
  const acrossClue = props.acrossClues.find(c => c.row === row && c.col === col)
  const downClue = props.downClues.find(c => c.row === row && c.col === col)
  return acrossClue?.number || downClue?.number || null
}

const calculateFillRate = (): number => {
  let filledCells = 0
  let totalCells = 0
  
  props.grid.forEach(row => {
    row.forEach(cell => {
      totalCells++
      if (cell !== '#') filledCells++
    })
  })
  
  return Math.round((filledCells / totalCells) * 100)
}
</script>
