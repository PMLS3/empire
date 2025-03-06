import type { BaseContent, BasePuzzleSettings, Difficulty, FontSize, PrintLayout } from '../types'

export type WordLadderCategory = 'general' | 'animals' | 'food' | 'nature' | 'science'

export interface WordLadderStep {
  word: string
  hint?: string
  revealed: boolean
}

export interface WordLadderSettings extends BasePuzzleSettings {
  ageGroup: string
  language: string
  showWordBank: boolean
  gridStyle: string
  startWord: string
  endWord: string
  wordLength: 3 | 4 | 5 | 6
  maxSteps: number
  showStepNumbers: boolean
  difficulty: Difficulty
  category: WordLadderCategory
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: FontSize
  printLayout: PrintLayout
  showHints: boolean
}

export interface WordLadderPuzzle extends BaseContent {
  startWord: string
  endWord: string
  solution: WordLadderStep[]
  hints?: string[]
  difficulty: string
  category: WordLadderCategory
  timeEstimate?: number
  theme?: string
  stats: {
    wordLength: number
    stepCount: number
    minSteps: number
    averageBranchingFactor: number
    complexity: number
  }
  rules: {
    allowedChanges: string[]
    scoringSystem: string[]
    bonusPoints: string[]
  }
  validWords?: string[]
}
