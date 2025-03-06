<script setup lang="ts">
import type { WordPlacement } from '../../puzzles/word-search/types'
import type { SudokuSettings, SudokuPuzzle } from '../../puzzles/sudoku/types'
import type { WordLadderSettings, WordLadderPuzzle } from '../../puzzles/word-ladder/types'
import type { WordScrambleSettings, WordScramblePuzzle, ScrambledWord } from '../../puzzles/word-scramble/types'

// Base content interface for shared properties
interface BaseContent {
  showSolution?: boolean
  textColor?: string
  backgroundColor?: string
  borderColor?: string
}

// Word Search specific content
interface WordSearchContent extends BaseContent {
  grid: string[][]
  words: string[]
  size: number
  locations?: WordPlacement[]
  locationsColor?: string
}

// Union type for all possible puzzle content types
type PuzzleContentType =
  | { type: 'word-search'; content: WordSearchContent; settings: Record<string, any> }
  | { type: 'sudoku'; content: SudokuPuzzle; settings: SudokuSettings }
  | { type: 'word-ladder'; content: WordLadderPuzzle; settings: WordLadderSettings }
  | { type: 'word-scramble'; content: WordScramblePuzzle; settings: WordScrambleSettings }

const props = defineProps<{
  puzzle?: PuzzleContentType
  style: {
    width: string
    height: string
    top: string
    left: string
    transform: string
  }
  selected: boolean
  canvasWidth: number
  canvasHeight: number
  gridSize: number
  snapToGrid: boolean
}>()

const emit = defineEmits<{
  (e: 'select', event: MouseEvent): void
  (e: 'resize', size: { width: number; height: number }): void
  (e: 'move', position: { x: number; y: number }): void
  (e: 'rotate', angle: number): void
}>()
</script>

<template>
  <DraggableElement
    :selected="selected"
    :style="style"
    :canvas-width="canvasWidth"
    :canvas-height="canvasHeight"
    :grid-size="gridSize"
    :snap-to-grid="snapToGrid"
    @select="(e) => emit('select', e)"
    @move="(pos) => emit('move', pos)"
    @resize="(size) => emit('resize', size)"
    @rotate="(angle) => emit('rotate', angle)"
  >
    <!-- Word Search -->
    <div v-if="props.puzzle?.type === 'word-search'" class="w-full h-full flex items-center justify-center">
      <div v-if="!props.puzzle?.content?.showSolution" class="w-full h-full">
        <PublishingPuzzlesWordSearchPreview
          :grid="props.puzzle.content.grid"
          :words="props.puzzle.content.words"
          :text-color="props.puzzle.content.textColor"
          :background-color="props.puzzle.content.backgroundColor"
          :border-color="props.puzzle.content.borderColor"
        />
      </div>
      <div v-else class="w-full h-full">
        <PublishingPuzzlesWordSearchSolution
          :grid="props.puzzle.content.grid"
          :words="props.puzzle.content.words"
          :locations="props.puzzle.content.locations"
          :text-color="props.puzzle.content.textColor"
          :background-color="props.puzzle.content.backgroundColor"
          :border-color="props.puzzle.content.borderColor"
          :locations-color="props.puzzle.content.locationsColor"
        />
      </div>
    </div>

    <!-- Sudoku -->
    <div v-else-if="props.puzzle?.type === 'sudoku'" class="w-full h-full">
      <div v-if="!props.puzzle?.content?.showSolution">
        <PublishingPuzzlesSudokuPreview
          :puzzle="props.puzzle.content.puzzle"
          :settings="props.puzzle.settings"
        />
      </div>
      <div v-else>
        <PublishingPuzzlesSudokuSolution
          :puzzle="props.puzzle.content.puzzle"
          :solution="props.puzzle.content.solution"
          :settings="props.puzzle.settings"
        />
      </div>
    </div>

    <!-- Word Ladder -->
    <div v-else-if="props.puzzle?.type === 'word-ladder'" class="w-full h-full">
      <div v-if="!props.puzzle?.content?.showSolution">
        <PublishingPuzzlesWordLadderPreview
          :puzzle="props.puzzle.content"
          :settings="props.puzzle.settings"
        />
      </div>
      <div v-else>
        <PublishingPuzzlesWordLadderSolution
          :puzzle="props.puzzle.content"
          :settings="props.puzzle.settings"
        />
      </div>
    </div>

    <!-- Word Scramble -->
    <div v-else-if="props.puzzle?.type === 'word-scramble'" class="w-full h-full">
      <div v-if="!props.puzzle?.content?.showSolution">
        <PublishingPuzzlesWordScramblePreview
          :puzzle="props.puzzle.content"
          :settings="props.puzzle.settings"
        />
      </div>
      <div v-else>
        <PublishingPuzzlesWordScrambleSolution
          :puzzle="props.puzzle.content"
          :settings="props.puzzle.settings"
        />
      </div>
    </div>
  </DraggableElement>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>
