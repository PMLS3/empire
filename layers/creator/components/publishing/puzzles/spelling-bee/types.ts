import { BaseContent } from '../types'

export interface SpellingBeeWord {
  word: string
  points: number
  isPangram: boolean
  definition?: string
  usageExample?: string
}

export interface SpellingBeeSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  theme?: string // e.g., 'nature', 'science', 'general'
  minWordLength?: number
  maxWordLength?: number
  requirePangrams?: boolean
  showDefinitions?: boolean
  centerLetterBias?: 'common' | 'uncommon' | 'random'
}

export interface SpellingBeeStats {
  totalWords: number
  totalPoints: number
  pangramCount: number
  perfectScore: number
  rankLevels: {
    rank: string
    minPoints: number
    description: string
  }[]
  letterDistribution: {
    letter: string
    count: number
  }[]
}

export interface SpellingBeePuzzle extends BaseContent {
  centerLetter: string
  outerLetters: string[]
  validWords: SpellingBeeWord[]
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  theme?: string
  stats: SpellingBeeStats
  progressiveHints: {
    level: number
    threshold: number // percentage of total points
    hints: string[]
  }[]
  bonusWords?: {
    word: string
    points: number
    category: string
  }[]
  learningPoints?: {
    vocabulary: string[]
    wordPatterns: string[]
    etymology?: string[]
  }
  assessment?: {
    criteria: string[]
    scoring: {
      category: string
      points: number
      description: string
    }[]
  }
}
