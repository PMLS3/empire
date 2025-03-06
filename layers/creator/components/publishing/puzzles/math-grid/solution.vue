<template>
  <div class="space-y-6">
    <!-- Grid -->
    <div 
      class="grid gap-px bg-gray-300 dark:bg-gray-600 p-px rounded-lg"
    >
      <div
        class="grid gap-px"
        :style="{ 'grid-template-columns': `repeat(${gridSize}, minmax(0, 1fr))` }"
      >
        <template v-for="(cell, index) in grid" :key="index">
          <div
            class="aspect-square flex items-center justify-center text-lg font-mono bg-white dark:bg-gray-800"
            :class="{
              'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400': !cell.isGiven,
              'font-bold': cell.isGiven
            }"
          >
            {{ cell.value }}
          </div>
        </template>
      </div>
    </div>

    <!-- Operations -->
    <div class="space-y-2">
      <h3 class="font-medium text-gray-900 dark:text-gray-100">Operations:</h3>
      <div class="grid sm:grid-cols-2 gap-4">
        <!-- Row Operations -->
        <div>
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rows:</div>
          <div class="space-y-1">
            <div
              v-for="(operation, index) in rowOperations"
              :key="index"
              class="flex items-center gap-2 text-sm"
            >
              <span class="material-icons text-primary-600 dark:text-primary-400 text-base">
                arrow_right
              </span>
              <span class="font-mono">{{ operation }}</span>
            </div>
          </div>
        </div>

        <!-- Column Operations -->
        <div>
          <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Columns:</div>
          <div class="space-y-1">
            <div
              v-for="(operation, index) in columnOperations"
              :key="index"
              class="flex items-center gap-2 text-sm"
            >
              <span class="material-icons text-primary-600 dark:text-primary-400 text-base">
                arrow_right
              </span>
              <span class="font-mono">{{ operation }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div class="grid grid-cols-4 gap-4">
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Grid Size</div>
          <div class="mt-1 text-2xl font-semibold">{{ gridSize }}x{{ gridSize }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Given Numbers</div>
          <div class="mt-1 text-2xl font-semibold">{{ countGivenNumbers() }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Operations</div>
          <div class="mt-1 text-2xl font-semibold">{{ operations.length }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Difficulty</div>
          <div class="mt-1 text-2xl font-semibold capitalize">{{ difficulty }}</div>
        </div>
      </div>
    </div>

    <!-- Solution Steps -->
    <div class="space-y-2">
      <h3 class="font-medium text-gray-900 dark:text-gray-100">Solution Steps:</h3>
      <div class="space-y-2">
        <div
          v-for="(step, index) in solutionSteps"
          :key="index"
          class="flex items-start gap-2 text-sm"
        >
          <span class="material-icons text-primary-600 dark:text-primary-400 text-base">
            arrow_right
          </span>
          <span>{{ step }}</span>
        </div>
      </div>
    </div>

    <!-- Tips -->
    <div class="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 p-4 rounded-lg">
      <div class="flex items-center gap-2">
        <span class="material-icons">lightbulb</span>
        <span class="font-medium">Math Grid Solving Tips:</span>
      </div>
      <ul class="mt-2 ml-8 list-disc space-y-1 text-sm">
        <li>Start with rows/columns that have more given numbers</li>
        <li>Use the operations to verify your answers</li>
        <li>Look for patterns in the numbers</li>
        <li>Cross-reference between rows and columns</li>
        <li>Double-check all calculations</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
interface GridCell {
  value: number
  isGiven: boolean
}

const props = defineProps<{
  grid: GridCell[]
  gridSize: number
  operations: string[]
  difficulty: string
}>()

// Split operations into rows and columns
const rowOperations = computed(() => 
  props.operations.filter(op => op.startsWith('Row'))
)

const columnOperations = computed(() => 
  props.operations.filter(op => op.startsWith('Column'))
)

const countGivenNumbers = (): number => {
  return props.grid.filter(cell => cell.isGiven).length
}

// Example solution steps based on operations
const solutionSteps = computed(() => {
  const steps: string[] = []
  
  // Add steps for each row and column
  rowOperations.value.forEach((op, index) => {
    steps.push(`Row ${index + 1}: Use given numbers and ${op.split(':')[1].trim()}`)
  })
  
  columnOperations.value.forEach((op, index) => {
    steps.push(`Column ${index + 1}: Use given numbers and ${op.split(':')[1].trim()}`)
  })
  
  // Add verification step
  steps.push('Verify all numbers satisfy both row and column operations')
  
  return steps
})
</script>
