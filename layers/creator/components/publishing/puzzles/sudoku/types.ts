import { BaseContent } from '../types'

export interface SudokuCell {
  value: number
  given: boolean // True if this is a starting number
  notes?: number[] // Player's pencil marks
}

export interface SudokuSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  variant?: 'classic' | 'diagonal' | 'irregular' // Different Sudoku variants
  givenCount?: number // Number of starting numbers
  symmetrical?: boolean // Should given numbers be symmetrical
}

export interface SudokuPuzzle extends BaseContent {
  grid: SudokuCell[][]
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  solution: number[][]
  variant: string
  stats: {
    givenCount: number
    singleCandidates: number // Number of cells with only one possible value
    nakedPairs: number // Number of naked pair techniques needed
    hiddenPairs: number // Number of hidden pair techniques needed
    complexity: number // Overall solving complexity score
  }
  regions?: number[][] // For irregular Sudoku variants
}
