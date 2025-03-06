<template>
  <div 
    class="sudoku-preview"
    :class="[
      settings.printLayout,
      `text-${settings.fontSize}`,
      `cell-${settings.cellSize}`
    ]"
    :style="{
      '--text-color': settings.textColor,
      '--bg-color': settings.backgroundColor,
      '--accent-color': settings.accentColor,
      '--number-color': settings.numberColor
    }"
  >
    <!-- Header -->
    <div class="preview-header">
      <h3 class="title">{{ getTitle() }}</h3>
      <div class="metadata">
        <span>{{ settings.size }}×{{ settings.size }} Grid</span>
        <span>{{ capitalize(settings.difficulty) }}</span>
      </div>
    </div>

    <!-- Grid -->
    <div 
      class="grid"
      :class="settings.gridStyle"
      :style="{ 
        gridTemplateColumns: `repeat(${settings.size}, 1fr)`,
        gap: settings.printLayout === 'spacious' ? '2px' : '1px'
      }"
    >
      <template v-for="row in settings.size" :key="row">
        <template v-for="col in settings.size" :key="`${row}-${col}`">
          <div 
            class="cell"
            :class="{
              'given': puzzle?.grid[row - 1][col - 1].given,
              'highlight': settings.highlightRegions && shouldHighlightCell(row - 1, col - 1)
            }"
          >
            <template v-if="puzzle?.grid[row - 1][col - 1].value">
              {{ puzzle.grid[row - 1][col - 1].value }}
            </template>
            <template v-else-if="settings.showCandidates">
              <div class="candidates">
                <template v-for="n in puzzle?.grid[row - 1][col - 1].candidates" :key="n">
                  <span class="candidate">{{ n }}</span>
                </template>
              </div>
            </template>
          </div>
        </template>
      </template>
    </div>

    <!-- Guidelines -->
    <div v-if="settings.showGuidelines" class="guidelines">
      <h4>Solving Tips:</h4>
      <ul>
        <li>Each row must contain numbers 1-{{ settings.size }}</li>
        <li>Each column must contain numbers 1-{{ settings.size }}</li>
        <li>Each {{ Math.sqrt(settings.size) }}×{{ Math.sqrt(settings.size) }} box must contain numbers 1-{{ settings.size }}</li>
        <li>Look for single candidates in empty cells</li>
        <li>Use scanning techniques to eliminate possibilities</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SudokuSettings, SudokuPuzzle } from './generator'

const props = defineProps<{
  settings: SudokuSettings
  puzzle?: SudokuPuzzle
}>()

const getTitle = () => {
  const size = props.settings.size
  const type = size === 9 ? 'Classic' : size === 6 ? 'Intermediate' : 'Mini'
  return `${type} Sudoku Puzzle`
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const shouldHighlightCell = (row: number, col: number) => {
  const boxSize = Math.sqrt(props.settings.size)
  const boxRow = Math.floor(row / boxSize)
  const boxCol = Math.floor(col / boxSize)
  return (boxRow + boxCol) % 2 === 0
}
</script>

<style scoped>
.sudoku-preview {
  --cell-size-small: 32px;
  --cell-size-medium: 40px;
  --cell-size-large: 48px;
  
  color: var(--text-color);
  background-color: var(--bg-color);
  padding: 1.5rem;
  border-radius: 0.5rem;
  max-width: fit-content;
}

.preview-header {
  margin-bottom: 1rem;
  text-align: center;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.metadata {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.8;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.grid {
  display: grid;
  border: 2px solid var(--accent-color);
  background-color: var(--accent-color);
  padding: 2px;
  margin: 1rem 0;
}

.cell {
  aspect-ratio: 1;
  background-color: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  position: relative;
}

.cell.given {
  color: var(--number-color);
  font-weight: 600;
}

.cell.highlight {
  background-color: color-mix(in srgb, var(--accent-color) 5%, var(--bg-color));
}

.candidates {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  font-size: 0.6em;
  opacity: 0.7;
  padding: 2px;
}

.candidate {
  display: flex;
  align-items: center;
  justify-content: center;
}

.guidelines {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.9;
}

.guidelines h4 {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.guidelines ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.guidelines li {
  margin-bottom: 0.25rem;
}

/* Print Layout Variations */
.compact .cell {
  font-size: 0.9em;
}

.spacious .cell {
  font-size: 1.1em;
}

/* Cell Size Variations */
.cell-small .cell {
  width: var(--cell-size-small);
  height: var(--cell-size-small);
}

.cell-medium .cell {
  width: var(--cell-size-medium);
  height: var(--cell-size-medium);
}

.cell-large .cell {
  width: var(--cell-size-large);
  height: var(--cell-size-large);
}

/* Grid Styles */
.classic {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.modern {
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.minimal {
  background-color: transparent;
  border-color: var(--accent-color);
}

/* Print Media Styles */
@media print {
  .sudoku-preview {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .guidelines {
    break-before: avoid;
    page-break-before: avoid;
  }
}
</style>
