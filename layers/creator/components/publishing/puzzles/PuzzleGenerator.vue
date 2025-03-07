<template>
  <div class="h-full grid grid-cols-12">
    <!-- Left side - Puzzle Types -->
    <div class="puzzle-sidebar col-span-3">
      <div class="p-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Puzzle Types</h3>
        <div class="space-y-2">
          <button
            v-for="puzzle in puzzleTypes"
            :key="puzzle.id"
            class="w-full text-left px-4 py-2 rounded-lg transition-colors"
            :class="{
              'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300': selectedPuzzle?.id === puzzle.id,
              'hover:bg-gray-50 dark:hover:bg-gray-800': selectedPuzzle?.id !== puzzle.id
            }"
            @click="selectPuzzle(puzzle)"
          >
            {{ puzzle.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Right side - Puzzle Configuration -->
    <BaseCard class="puzzle-content col-span-9">
      <template v-if="selectedPuzzle">
        <div class="mb-6">
          <h2 class="text-xl font-medium text-gray-900 dark:text-white mb-2">{{ selectedPuzzle.name }}</h2>
          <p class="text-gray-600 dark:text-gray-400">{{ selectedPuzzle.description }}</p>
        </div>

        <!-- Customization -->
        <div class="mb-6">
          <!-- Word Search Customization -->
          <template v-if="selectedPuzzle.id === 'word-search'">
            <PublishingPuzzlesWordSearchCustomize
              v-model="customization"
              @update:modelValue="(val) => {
                console.log('Received update from customize:', val)
                customization.value = {
                  ...customization.value,
                  ...val
                }
              }"
            />
          </template>

          <!-- Crossword Customization -->
          <template v-else-if="selectedPuzzle.id === 'crossword'">
            <PublishingPuzzlesCrosswordCustomize
              v-model="customization"
              @update:modelValue="(val) => {
                customization.value = {
                  ...customization.value,
                  ...val
                }
              }"
            />
          </template>

          <!-- Sudoku Customization -->
          <template v-else-if="selectedPuzzle.id === 'sudoku'">
            <PublishingPuzzlesSudokuCustomize
              v-model="customization"
              @update:modelValue="(val) => {
                customization.value = {
                  ...customization.value,
                  ...val
                }
              }"
            />
          </template>

          <!-- Maze Customization -->
          <template v-else-if="selectedPuzzle.id === 'maze'">
            <PublishingPuzzlesMazeCustomize
              v-model="customization"
              @update:modelValue="(val) => {
                customization.value = {
                  ...customization.value,
                  ...val
                }
              }"
            />
          </template>

          <!-- Word Scramble Customization -->
          <template v-else-if="selectedPuzzle.id === 'word-scramble'">
            <PublishingPuzzlesWordScrambleCustomize
              v-model="customization"
              @update:modelValue="(val) => {
                customization.value = {
                  ...customization.value,
                  ...val
                }
              }"
            />
          </template>

          <!-- Logic Grid Customization -->
          <template v-else-if="selectedPuzzle.id === 'logic-grid'">
            <PublishingPuzzlesLogicGridCustomize
              v-model="customization"
              @update:modelValue="(val) => {
                customization.value = {
                  ...customization.value,
                  ...val
                }
              }"
            />
          </template>
        </div>

        <!-- Generate Button -->
        <div class="mb-6 flex justify-between">
          <BaseButton
            :disabled="isGenerating"
            @click="generatePuzzle"
            color="primary"
          >
            {{ isGenerating ? 'Generating...' : 'Generate Puzzle' }}
          </BaseButton>

          <div class="flex gap-4" v-if="generatedPuzzle">
            <BaseButton
              color="primary"
              @click="handleAddToPage"
            >
              Add to Page
            </BaseButton>
            <BaseButton
              color="secondary"
              :class="{ 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700': showSolution }"
              @click="showSolution = !showSolution"
            >
              {{ showSolution ? 'Hide Solution' : 'Show Solution' }}
            </BaseButton>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="generatedPuzzle" class="space-y-6">
          <!-- Word Search -->
          <template v-if="generatedPuzzle.type === 'word-search'">
            <div v-if="!showSolution">
              <PublishingPuzzlesWordSearchPreview
                :grid="generatedPuzzle.content?.grid || generatedPuzzle.grid"
                :words="generatedPuzzle.content?.words || generatedPuzzle.words"
                :size="generatedPuzzle.content?.size || generatedPuzzle.size"
                :locations="generatedPuzzle.content?.locations || generatedPuzzle.locations"
                :text-color="generatedPuzzle.content?.textColor || generatedPuzzle.textColor"
                :background-color="generatedPuzzle.content?.backgroundColor || generatedPuzzle.backgroundColor"
                :border-color="generatedPuzzle.content?.borderColor || generatedPuzzle.borderColor"
              />
            </div>
            <div v-else>
              <PublishingPuzzlesWordSearchSolution
                :grid="generatedPuzzle.content?.grid || generatedPuzzle.grid"
                :words="generatedPuzzle.content?.words || generatedPuzzle.words"
                :size="generatedPuzzle.content?.size || generatedPuzzle.size"
                :locations="generatedPuzzle.content?.locations || generatedPuzzle.locations"
                :text-color="generatedPuzzle.content?.textColor || generatedPuzzle.textColor"
                :background-color="generatedPuzzle.content?.backgroundColor || generatedPuzzle.backgroundColor"
                :border-color="generatedPuzzle.content?.borderColor || generatedPuzzle.borderColor"
                :locations-color="generatedPuzzle.content?.locationsColor || generatedPuzzle.locationsColor"
              />
            </div>
          </template>

          <!-- Crossword -->
          <template v-else-if="generatedPuzzle.type === 'crossword'">
            <div v-if="!showSolution">
              <PublishingPuzzlesCrosswordPreview
                :grid="generatedPuzzle.content?.grid"
                :clues="generatedPuzzle.content?.clues"
                :text-color="generatedPuzzle.content?.textColor"
                :background-color="generatedPuzzle.content?.backgroundColor"
                :accent-color="generatedPuzzle.content?.accentColor"
                :highlight-color="generatedPuzzle.content?.highlightColor"
              />
            </div>
            <div v-else>
              <PublishingPuzzlesCrosswordSolution
                :grid="generatedPuzzle.content?.grid"
                :clues="generatedPuzzle.content?.clues"
                :solution="generatedPuzzle.content?.solution"
                :text-color="generatedPuzzle.content?.textColor"
                :background-color="generatedPuzzle.content?.backgroundColor"
                :accent-color="generatedPuzzle.content?.accentColor"
                :highlight-color="generatedPuzzle.content?.highlightColor"
              />
            </div>
          </template>

          <!-- Sudoku -->
          <template v-else-if="generatedPuzzle.type === 'sudoku'">
            <div v-if="!showSolution">
              <PublishingPuzzlesSudokuPreview
                :grid="generatedPuzzle.content?.grid"
                :text-color="generatedPuzzle.content?.textColor"
                :background-color="generatedPuzzle.content?.backgroundColor"
                :accent-color="generatedPuzzle.content?.accentColor"
                :highlight-color="generatedPuzzle.content?.highlightColor"
                :variant="generatedPuzzle.content?.variant"
              />
            </div>
            <div v-else>
              <PublishingPuzzlesSudokuSolution
                :grid="generatedPuzzle.content?.grid"
                :solution="generatedPuzzle.content?.solution"
                :text-color="generatedPuzzle.content?.textColor"
                :background-color="generatedPuzzle.content?.backgroundColor"
                :accent-color="generatedPuzzle.content?.accentColor"
                :highlight-color="generatedPuzzle.content?.highlightColor"
              />
            </div>
          </template>

          <!-- Maze -->
          <template v-else-if="generatedPuzzle.type === 'maze'">
            <div v-if="!showSolution">
              <PublishingPuzzlesMazePreview
                :grid="generatedPuzzle.content?.grid"
                :start="generatedPuzzle.content?.start"
                :end="generatedPuzzle.content?.end"
                :size="generatedPuzzle.content?.size"
                :wall-color="generatedPuzzle.content?.wallColor"
                :background-color="generatedPuzzle.content?.backgroundColor"
                :accent-color="generatedPuzzle.content?.accentColor"
              />
            </div>
            <div v-else>
              <PublishingPuzzlesMazeSolution
                :grid="generatedPuzzle.content?.grid"
                :solution="generatedPuzzle.content?.solution"
                :start="generatedPuzzle.content?.start"
                :end="generatedPuzzle.content?.end"
                :size="generatedPuzzle.content?.size"
                :wall-color="generatedPuzzle.content?.wallColor"
                :background-color="generatedPuzzle.content?.backgroundColor"
                :path-color="generatedPuzzle.content?.pathColor"
              />
            </div>
          </template>

          <!-- Word Scramble -->
          <template v-else-if="generatedPuzzle.type === 'word-scramble'">
            <div v-if="!showSolution">
              <PublishingPuzzlesWordScramblePreview
                :words="generatedPuzzle.content?.words"
                :scrambled-words="generatedPuzzle.content?.scrambledWords"
                :text-color="generatedPuzzle.content?.textColor"
                :background-color="generatedPuzzle.content?.backgroundColor"
                :accent-color="generatedPuzzle.content?.accentColor"
              />
            </div>
            <div v-else>
              <PublishingPuzzlesWordScrambleSolution
                :words="generatedPuzzle.content?.words"
                :scrambled-words="generatedPuzzle.content?.scrambledWords"
                :text-color="generatedPuzzle.content?.textColor"
                :background-color="generatedPuzzle.content?.backgroundColor"
                :accent-color="generatedPuzzle.content?.accentColor"
              />
            </div>
          </template>

          <!-- Logic Grid -->
          <template v-else-if="generatedPuzzle.type === 'logic-grid'">
            <div v-if="!showSolution">
              <PublishingPuzzlesLogicGridPreview
                :grid="generatedPuzzle.content?.grid"
                :clues="generatedPuzzle.content?.clues"
                :categories="generatedPuzzle.content?.categories"
                :text-color="generatedPuzzle.content?.textColor"
                :background-color="generatedPuzzle.content?.backgroundColor"
                :accent-color="generatedPuzzle.content?.accentColor"
              />
            </div>
            <div v-else>
              <PublishingPuzzlesLogicGridSolution
                :grid="generatedPuzzle.content?.grid"
                :solution="generatedPuzzle.content?.solution"
                :categories="generatedPuzzle.content?.categories"
                :text-color="generatedPuzzle.content?.textColor"
                :background-color="generatedPuzzle.content?.backgroundColor"
                :accent-color="generatedPuzzle.content?.accentColor"
              />
            </div>
          </template>
        </div>
      </template>
    </BaseCard>
  </div>
</template>

<script lang="ts" setup>
import type { FontSize, Difficulty, BasePuzzleSettings } from './types'
import type { WordSearchSettings, WordSearchTheme } from './word-search/types'
import type { CrosswordSettings } from './crossword/types'
import type { MazeSettings } from './maze/types'
import type { SudokuSettings } from './sudoku/types'
import type { WordScrambleSettings } from './word-scramble/types'
import type { WordLadderSettings, WordLadderCategory } from './word-ladder/types'
import type { CryptogramSettings } from './cryptogram/types'
import type { MathGridSettings, MathOperation } from './math-grid/types'
import type { AnagramsSettings } from './anagrams/types'
import type { NumberSequenceSettings } from './number-sequence/types'
import type { LogicGridSettings } from './logic-grid/types'
import type { CodeBreakerSettings } from './code-breaker/types'
import type { WordChainsSettings } from './word-chains/types'
import type { GrammarFixSettings } from './grammar-fix/types'
import type { GeographyQuizSettings } from './geography-quiz/types'
import type { HistoryTimelineSettings } from './history-timeline/types'
import type { SpellingBeeSettings } from './spelling-bee/types'
import type { MusicNotesSettings } from './music-notes/types'
import type { ArtPuzzleSettings } from './art-puzzle/types'
const { sendContextInfo } = useChatGemini()
interface PuzzleType {
  id: string
  name: string
  description: string
  icon: string
  difficulty: Difficulty
  customization: {
    size?: boolean
    words?: boolean
    theme?: boolean
    time?: boolean
    difficulty?: boolean
    language?: boolean
    elements?: boolean
    region?: boolean
    type?: boolean
    era?: boolean
    events?: boolean
    subject?: boolean
    labels?: boolean
    topic?: boolean
    letters?: boolean
    clef?: boolean
    symbols?: boolean
    period?: boolean
    style?: boolean
  }
}

const puzzleTypes = ref<PuzzleType[]>([
  {
    id: 'word-search',
    name: 'Word Search',
    description: 'Find hidden words in a grid of letters',
    icon: 'ph:text-columns',
    difficulty: 'easy',
    customization: {
      size: true,
      words: true,
      theme: true
    }
  },
  {
    id: 'crossword',
    name: 'Crossword',
    description: 'Fill in words based on clues across and down',
    icon: 'ph:grid-four',
    difficulty: 'medium',
    customization: {
      theme: true,
      difficulty: true
    }
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    description: 'Fill in numbers 1-9 in each row, column and square',
    icon: 'ph:number-square-nine',
    difficulty: 'medium',
    customization: {
      variant: true,
      difficulty: true
    }
  },
  {
    id: 'maze',
    name: 'Maze',
    description: 'Navigate from start to finish through a complex path',
    icon: 'ph:corners-out',
    difficulty: 'easy',
    customization: {
      size: true,
      difficulty: true
    }
  },
  {
    id: 'word-scramble',
    name: 'Word Scramble',
    description: 'Unscramble letters to form words',
    icon: 'ph:shuffle',
    difficulty: 'easy',
    customization: {
      words: true,
      theme: true
    }
  },
  {
    id: 'logic-grid',
    name: 'Logic Grid Puzzle',
    description: 'Use logical deduction to solve a grid of clues',
    icon: 'ph:squares-four',
    difficulty: 'hard',
    customization: {
      difficulty: true,
      theme: true
    }
  }
])

const selectedPuzzle = ref<PuzzleType | null>(null)
const showSolution = ref(false)
const generatedPuzzle = ref<any>(null)
const isGenerating = ref(false)

const emit = defineEmits<{
  (e: 'create', puzzle: any, solution: any): void
}>()

const gridSize = computed(() => {
  if (!generatedPuzzle.value) return 0
  return generatedPuzzle.value.content?.size || generatedPuzzle.value.size || 0
})

const selectPuzzle = (puzzle: PuzzleType) => {
  sendContextInfo(`Selected puzzle: ${puzzle.name}`)
  selectedPuzzle.value = puzzle
  generatedPuzzle.value = null
}

const handleAddToPage = () => {
  if (!generatedPuzzle.value || !selectedPuzzle.value) return

  emit('create', {
    ...generatedPuzzle.value,
    type: selectedPuzzle.value.id
  }, generatedPuzzle.value.content)
}

const customization = ref({
  difficulty: 'medium' as Difficulty,
  textColor: '#000000',
  backgroundColor: '#ffffff',
  accentColor: '#6366f1',
  highlightColor: '#4f46e5',
  fontSize: 'medium' as FontSize,
  printLayout: 'compact' as const,
  showHints: true,

  // Word Search settings
  size: 10,
  words: [] as string[],
  theme: 'animals' as WordSearchTheme,
  direction: 'all' as const,
  caseSensitive: false,
  allowOverlap: false,
  borderColor: '#000000',
  locationsColor: '#ff0000',

  // Word Ladder settings
  ageGroup: 'all',
  language: 'english',
  showWordBank: true,
  gridStyle: 'classic',
  startWord: '',
  endWord: '',
  wordLength: 4 as 3 | 4 | 5 | 6,
  maxSteps: 6,
  showStepNumbers: true,
  category: 'general' as WordLadderCategory,

  operations: ['addition', 'subtraction', 'multiplication', 'division'] as MathOperation[],
  maxNumber: 100,
  showOperations: true,
  showGrid: true,
  allowNegatives: false,
  allowDecimals: false,
  showAnswerBank: true,

  time: 300,
  elements: [] as string[],
  region: '',
  type: '',
  era: '',
  events: [] as string[],
  subject: '',
  labels: [] as string[],
  topic: '',
  letters: [] as string[],
  clef: '',
  symbols: [] as string[],
  period: '',
  style: '',
  showGuidelines: true,
  showCandidates: false,
  highlightRegions: true,
  cellSize: 'medium',
  symmetrical: true,
  variant: 'classic',
  numberColor: '#000000'
})

const resetCustomization = () => {
  customization.value = {
    difficulty: 'medium',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    accentColor: '#6366f1',
    highlightColor: '#4f46e5',
    fontSize: 'medium',
    printLayout: 'compact',
    showHints: true,

    size: 10,
    words: [],
    theme: 'animals' as WordSearchTheme,
    direction: 'all',
    caseSensitive: false,
    allowOverlap: false,
    borderColor: '#000000',
    locationsColor: '#ff0000',

    ageGroup: 'all',
    language: 'english',
    showWordBank: true,
    gridStyle: 'classic',
    startWord: '',
    endWord: '',
    wordLength: 4 as 3 | 4 | 5 | 6,
    maxSteps: 6,
    showStepNumbers: true,
    category: 'general' as WordLadderCategory,

    operations: ['addition', 'subtraction', 'multiplication', 'division'] as MathOperation[],
    maxNumber: 100,
    showOperations: true,
    showGrid: true,
    allowNegatives: false,
    allowDecimals: false,
    showAnswerBank: true,

    time: 300,
    elements: [],
    region: '',
    type: '',
    era: '',
    events: [],
    subject: '',
    labels: [],
    topic: '',
    letters: [],
    clef: '',
    symbols: [],
    period: '',
    style: '',
    showGuidelines: true,
    showCandidates: false,
    highlightRegions: true,
    cellSize: 'medium',
    symmetrical: true,
    variant: 'classic',
    numberColor: '#000000'
  }
}

watch(selectedPuzzle, () => {
  resetCustomization()
})

const generatePuzzle = async () => {
  if (!selectedPuzzle.value) return

  generatedPuzzle.value = null
  isGenerating.value = true

  try {
    const baseSettings = {
      difficulty: customization.value.difficulty,
      category: selectedPuzzle.value.id,
      textColor: customization.value.textColor,
      backgroundColor: customization.value.backgroundColor,
      accentColor: customization.value.accentColor,
      highlightColor: customization.value.highlightColor,
      fontSize: customization.value.fontSize,
      printLayout: customization.value.printLayout,
      showHints: customization.value.showHints
    }

    let content = null

    switch (selectedPuzzle.value.id) {
      case 'word-search': {
        const { generateWordSearch } = await import('./word-search/generator')
        console.log('PuzzleGenerator customization:', customization.value)
        const wordSearchSettings: WordSearchSettings = {
          ...baseSettings,
          size: customization.value.size,
          words: customization.value.words,
          theme: customization.value.theme as WordSearchTheme,
          direction: customization.value.direction,
          caseSensitive: customization.value.caseSensitive,
          allowOverlap: customization.value.allowOverlap,
          difficulty: customization.value.difficulty,
          category: customization.value.category || 'general',
          textColor: customization.value.textColor,
          backgroundColor: customization.value.backgroundColor,
          accentColor: customization.value.accentColor,
          highlightColor: customization.value.highlightColor,
          fontSize: customization.value.fontSize as FontSize,
          printLayout: customization.value.printLayout as PrintLayout,
          borderColor: customization.value.borderColor,
          locationsColor: customization.value.locationsColor,
          showHints: customization.value.showHints
        }
        content = await generateWordSearch(wordSearchSettings)
        break
      }
      case 'crossword': {
        const { generateCrossword } = await import('./crossword/generator')
        const crosswordSettings: CrosswordSettings = {
          ...baseSettings,
          symmetrical: true,
          maxWordLength: customization.value.maxWordLength,
          gridSize: customization.value.size || 10,
          theme: customization.value.theme || 'general',
          words: customization.value.words || []
        }
        content = await generateCrossword(crosswordSettings)
        break
      }
      case 'sudoku': {
        const { generateSudoku } = await import('./sudoku/generator')
        const sudokuSettings: SudokuSettings = {
          ...baseSettings,
          symmetrical: customization.value.symmetrical !== false,
          showGuidelines: customization.value.showGuidelines !== false,
          showCandidates: customization.value.showCandidates || false,
          highlightRegions: customization.value.highlightRegions !== false,
          cellSize: customization.value.cellSize || 'medium',
          variant: customization.value.variant || 'classic',
          numberColor: customization.value.numberColor || customization.value.textColor,
          size: 9
        }
        content = await generateSudoku(sudokuSettings)
        break
      }
      case 'maze': {
        const { generateMaze } = await import('./maze/generator')
        const mazeSettings: MazeSettings = {
          ...baseSettings,
          size: customization.value.size || 15,
          wallColor: customization.value.wallColor || '#000000',
          pathColor: customization.value.pathColor || '#4CAF50',
          style: customization.value.style || 'classic'
        }
        content = await generateMaze(mazeSettings)
        break
      }
      case 'word-ladder': {
        const { generateWordLadder } = await import('./word-ladder/generator')
        const wordLadderSettings: WordLadderSettings = {
          ...baseSettings,
          ageGroup: customization.value.ageGroup,
          language: customization.value.language,
          showWordBank: customization.value.showWordBank,
          gridStyle: customization.value.gridStyle,
          startWord: customization.value.startWord,
          endWord: customization.value.endWord,
          wordLength: customization.value.wordLength as 3 | 4 | 5 | 6,
          maxSteps: customization.value.maxSteps,
          showStepNumbers: customization.value.showStepNumbers,
          category: (customization.value.category || 'general') as WordLadderCategory
        }
        content = await generateWordLadder(wordLadderSettings)
        break
      }
      case 'word-scramble': {
        const { generateWordScramble } = await import('./word-scramble/generator')
        const wordScrambleSettings = {
          ...baseSettings,
          words: customization.value.words || [],
          theme: customization.value.theme || 'general',
          showClues: customization.value.showClues !== false
        }
        content = await generateWordScramble(wordScrambleSettings)
        break
      }
      case 'logic-grid': {
        const { generateLogicGrid } = await import('./logic-grid/generator')
        const logicGridSettings: LogicGridSettings = {
          ...baseSettings,
          categories: customization.value.categories || [],
          itemsPerCategory: customization.value.itemsPerCategory || 4,
          cluesCount: customization.value.cluesCount || 8
        }
        content = await generateLogicGrid(logicGridSettings)
        break
      }
      case 'math-grid': {
        const { generateMathGrid } = await import('./math-grid/generator')
        const mathGridSettings: MathGridSettings = {
          ...baseSettings,
          gridSize: customization.value.size as 4 | 5 | 6 | 7 | 8 | 9,
          operations: customization.value.operations as MathOperation[],
          maxNumber: customization.value.maxNumber,
          showOperations: customization.value.showOperations,
          showGrid: customization.value.showGrid,
          allowNegatives: customization.value.allowNegatives,
          allowDecimals: customization.value.allowDecimals,
          showAnswerBank: customization.value.showAnswerBank
        }
        content = await generateMathGrid(mathGridSettings)
        break
      }
    }

    if (content) {
      generatedPuzzle.value = {
        type: selectedPuzzle.value.id,
        name: selectedPuzzle.value.name,
        content
      }
    }
  } catch (error) {
    console.error('Failed to generate puzzle:', error)
  } finally {
    isGenerating.value = false
  }
}
</script>

<style scoped>
.inline-grid {
  display: inline-grid;
}

.puzzle-sidebar {
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid var(--color-border);
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.puzzle-sidebar::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.puzzle-content {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.puzzle-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>
