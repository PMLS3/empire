import type { BaseContent, BasePuzzleSettings, Difficulty, FontSize, PrintLayout } from '../types'

export type WordSearchTheme = 'animals' | 'countries' | 'space'

export interface WordPosition {
  row: number
  col: number
  direction: 'horizontal' | 'vertical' | 'diagonal-right' | 'diagonal-left'
}

export interface WordPlacement {
  word: string
  position: WordPosition
  category?: string
  difficulty?: number
  hint?: string
  found: boolean
}

export interface GridCell {
  char: string
  isPartOfWord: boolean
  words: string[]
  highlighted: boolean
}

export interface WordSearchSettings extends BasePuzzleSettings {
  size?: number
  gridSize?: { rows: number; cols: number }
  theme?: WordSearchTheme
  category?: string
  words?: string[]
  direction?: 'horizontal' | 'vertical' | 'diagonal-right' | 'diagonal-left' | 'all'
  caseSensitive?: boolean
  allowOverlap?: boolean
  minWordLength?: number
  maxWordLength?: number
  allowedDirections?: Array<'horizontal' | 'vertical' | 'diagonal-right' | 'diagonal-left'>
  textColor?: string
  backgroundColor?: string
  borderColor?: string
  locationsColor?: string
  accentColor?: string
  highlightColor?: string
  difficulty: Difficulty
  fontSize: FontSize
  printLayout: PrintLayout
  showHints: boolean
}

export interface WordSearchPuzzle extends BaseContent {
  grid: GridCell[][]
  words: WordPlacement[]
  hints: string[]
  difficulty: Difficulty
  category?: string
  theme?: WordSearchTheme
  timeEstimate: number
  stats: {
    totalWords: number
    uniqueCategories: number
    averageWordLength: number
    gridDensity: number
    complexity: number
  }
  rules: {
    directions: string[]
    scoringSystem: string[]
    bonusPoints: string[]
  }
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  borderColor: string
  locationsColor: string
  size: number
}
