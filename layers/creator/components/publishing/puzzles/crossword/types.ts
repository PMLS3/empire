import type { BaseContent, BasePuzzleSettings } from '../types'

export interface CrosswordCell {
  letter: string
  number?: number // For clue reference
  isBlack?: boolean // Black cell that can't be filled
}

export interface CrosswordClue {
  number: number
  text: string
  answer: string
  direction: 'across' | 'down'
  startRow: number
  startCol: number
  length: number
}

export interface CrosswordSettings extends BasePuzzleSettings {
  words: string[]
  theme: string
  gridStyle: string
}

export interface CrosswordPuzzle extends BaseContent {
  grid: CrosswordCell[][]
  clues: CrosswordClue[]
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  solution: string[][] // 2D array of letters
  theme?: string
  stats?: {
    wordCount: number
    averageWordLength: number
    intersectionCount: number
  }
}
