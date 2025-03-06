import { BaseContent } from '../types'

export interface MemoryCard {
  id: number
  content: string
  category?: string
  matched: boolean
  flipped: boolean
  position: {
    row: number
    col: number
  }
}

export interface MemoryPair {
  card1: MemoryCard
  card2: MemoryCard
  difficulty: number // How hard it is to associate these cards
  hint?: string
}

export interface MemorySettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  gridSize?: {
    rows: number
    cols: number
  }
  cardType?: 'text' | 'image' | 'mixed'
  matchType?: 'identical' | 'related' | 'translation' // How cards should match
  theme?: string // e.g., 'animals', 'vocabulary', 'math'
  timeLimit?: number // Optional time limit in seconds
}

export interface MemoryPuzzle extends BaseContent {
  grid: MemoryCard[][]
  pairs: MemoryPair[]
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  solution: MemoryPair[]
  theme?: string
  stats: {
    totalPairs: number
    uniqueCategories: number
    averageDifficulty: number
    expectedMoves: number
  }
  rules?: {
    matchingCriteria: string[]
    scoringSystem: string[]
    timeBonus?: number
  }
}
