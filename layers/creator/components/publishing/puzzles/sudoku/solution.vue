<template>
  <div 
    class="sudoku-solution"
    :class="[
      settings.printLayout,
      `text-${settings.fontSize}`
    ]"
    :style="{
      '--text-color': settings.textColor,
      '--bg-color': settings.backgroundColor,
      '--accent-color': settings.accentColor,
      '--number-color': settings.numberColor
    }"
  >
    <!-- Header -->
    <div class="solution-header">
      <h3 class="title">Solution Guide</h3>
      <div class="metadata">
        <span>{{ settings.size }}×{{ settings.size }} Grid</span>
        <span>{{ capitalize(settings.difficulty) }}</span>
      </div>
    </div>

    <!-- Grid Comparison -->
    <div class="grid-comparison">
      <!-- Original Puzzle -->
      <div class="puzzle-grid">
        <h4>Original Puzzle</h4>
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
                {{ puzzle?.grid[row - 1][col - 1].value || '' }}
              </div>
            </template>
          </template>
        </div>
      </div>

      <!-- Solution -->
      <div class="solution-grid">
        <h4>Complete Solution</h4>
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
                  'solved': !puzzle?.grid[row - 1][col - 1].given,
                  'highlight': settings.highlightRegions && shouldHighlightCell(row - 1, col - 1)
                }"
              >
                {{ puzzle?.solution[row - 1][col - 1] }}
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>

    <!-- Solution Analysis -->
    <div class="solution-analysis">
      <h4>Puzzle Analysis</h4>
      
      <!-- Difficulty Analysis -->
      <div class="analysis-section">
        <h5>Difficulty Level: {{ capitalize(settings.difficulty) }}</h5>
        <p>This {{ settings.size }}×{{ settings.size }} puzzle has {{ puzzle?.numGivens }} given numbers.</p>
        <ul>
          <li v-if="settings.difficulty === 'easy'">
            Perfect for beginners with straightforward solving techniques
          </li>
          <li v-if="settings.difficulty === 'medium'">
            Requires basic solving strategies and some logical deduction
          </li>
          <li v-if="settings.difficulty === 'hard'">
            Challenges players with advanced techniques and careful analysis
          </li>
          <li v-if="settings.difficulty === 'expert'">
            Tests mastery of advanced solving methods and deep logical thinking
          </li>
        </ul>
      </div>

      <!-- Solving Techniques -->
      <div class="analysis-section">
        <h5>Key Solving Techniques</h5>
        <ul>
          <li>Single Candidate: Look for cells with only one possible number</li>
          <li>Hidden Singles: Find numbers that can only go in one position</li>
          <li>Scanning: Check rows, columns, and boxes for patterns</li>
          <li>Block Interaction: Analyze how regions affect each other</li>
          <template v-if="settings.difficulty !== 'easy'">
            <li>Pairs and Triples: Look for number combinations</li>
            <li>X-Wing: Advanced pattern across rows and columns</li>
          </template>
        </ul>
      </div>

      <!-- Learning Points -->
      <div class="analysis-section">
        <h5>Learning Points</h5>
        <ul>
          <li>Practice systematic scanning of rows, columns, and boxes</li>
          <li>Learn to recognize common number patterns</li>
          <li>Develop strategies for eliminating possibilities</li>
          <li>Improve logical thinking and problem-solving skills</li>
        </ul>
      </div>
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
.sudoku-solution {
  color: var(--text-color);
  background-color: var(--bg-color);
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.solution-header {
  margin-bottom: 1.5rem;
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

.grid-comparison {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 1.5rem 0;
}

.puzzle-grid, .solution-grid {
  text-align: center;
}

.puzzle-grid h4, .solution-grid h4 {
  font-weight: 600;
  margin-bottom: 1rem;
}

.grid {
  display: grid;
  border: 2px solid var(--accent-color);
  background-color: var(--accent-color);
  padding: 2px;
  margin: 0 auto;
  max-width: fit-content;
}

.cell {
  aspect-ratio: 1;
  background-color: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  width: 32px;
  height: 32px;
}

.cell.given {
  color: var(--number-color);
  font-weight: 600;
}

.cell.solved {
  color: var(--accent-color);
  font-weight: 600;
}

.cell.highlight {
  background-color: color-mix(in srgb, var(--accent-color) 5%, var(--bg-color));
}

.solution-analysis {
  margin-top: 2rem;
  border-top: 1px solid color-mix(in srgb, var(--accent-color) 20%, var(--bg-color));
  padding-top: 1.5rem;
}

.solution-analysis h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.analysis-section {
  margin-bottom: 1.5rem;
}

.analysis-section h5 {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--accent-color);
}

.analysis-section p {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.analysis-section ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  line-height: 1.6;
}

.analysis-section li {
  margin-bottom: 0.25rem;
}

/* Print Layout Variations */
.compact {
  font-size: 0.9em;
}

.compact .cell {
  width: 28px;
  height: 28px;
}

.spacious {
  font-size: 1em;
}

.spacious .cell {
  width: 36px;
  height: 36px;
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
  .sudoku-solution {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .grid-comparison {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .solution-analysis {
    break-before: auto;
    page-break-before: auto;
  }

  .analysis-section {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
</style>
