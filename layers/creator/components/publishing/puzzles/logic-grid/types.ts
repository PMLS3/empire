import { BaseContent } from '../types'

export interface LogicCategory {
  name: string
  values: string[]
}

export interface LogicClue {
  type: 'positive' | 'negative' | 'relative'
  description: string
  categories: string[]
  values: string[]
  relation?: 'before' | 'after' | 'next-to'
}

export interface LogicGridSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  gridSize?: number
  categoryCount?: number
}

export interface GridCell {
  value: boolean
  categories: string[]
  values: string[]
}

export interface LogicGridPuzzle extends BaseContent {
  categories: LogicCategory[]
  clues: LogicClue[]
  grid: GridCell[][]
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  solution: boolean[][][] // 3D array: category x value x value
  partialSolution?: boolean[][][] // For hints
}
