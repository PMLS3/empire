<template>
  <div class="space-y-4">
    <div class="inline-grid gap-px bg-gray-200 dark:bg-gray-700 p-px rounded-lg"
         :style="{ 'border-color': settings?.borderColor || '#cccccc' }">
      <template v-for="(row, y) in grid" :key="y">
        <div class="flex gap-px">
          <div
            v-for="(cell, x) in row"
            :key="`${y}-${x}`"
            class="w-10 h-10 flex items-center justify-center font-mono relative"
            :style="{
              backgroundColor: cell.letter ? (settings?.backgroundColor || '#ffffff') : 'transparent',
              color: settings?.textColor || '#000000',
              borderColor: settings?.borderColor || '#cccccc',
              borderWidth: '1px',
              borderStyle: 'solid'
            }"
            :class="[
              'dark:border-gray-600',
              { 'bg-gray-200 dark:bg-gray-700': !cell.letter }
            ]"
          >
            <span
              v-if="cell.number"
              class="absolute top-0.5 left-0.5 text-xs font-normal"
              :style="{ color: settings?.textColor || '#000000' }"
            >{{ cell.number }}</span>
            <span 
              v-if="cell.letter" 
              class="text-base"
              :style="{ color: settings?.textColor || '#000000' }"
            >{{ showAnswers ? cell.letter : '' }}</span>
          </div>
        </div>
      </template>
    </div>

    <div class="space-y-4">
      <div v-if="clues.across.length">
        <h4 class="font-medium mb-2 text-gray-900 dark:text-gray-100">Across</h4>
        <ul class="space-y-1">
          <li 
            v-for="clue in clues.across" 
            :key="clue.number" 
            class="text-sm text-gray-700 dark:text-gray-300"
          >
            <span class="font-medium">{{ clue.number }}.</span> {{ clue.clue }}
          </li>
        </ul>
      </div>

      <div v-if="clues.down.length">
        <h4 class="font-medium mb-2 text-gray-900 dark:text-gray-100">Down</h4>
        <ul class="space-y-1">
          <li 
            v-for="clue in clues.down" 
            :key="clue.number" 
            class="text-sm text-gray-700 dark:text-gray-300"
          >
            <span class="font-medium">{{ clue.number }}.</span> {{ clue.clue }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CrosswordCell {
  letter: string
  number?: number
}

interface CrosswordClue {
  number: number
  clue: string
  answer: string
  direction: 'across' | 'down'
}

interface CrosswordClues {
  across: CrosswordClue[]
  down: CrosswordClue[]
}

interface CrosswordSettings {
  textColor?: string
  backgroundColor?: string
  borderColor?: string
}

defineProps<{
  grid: CrosswordCell[][]
  clues: CrosswordClues
  showAnswers?: boolean
  settings?: CrosswordSettings
}>()
</script>
