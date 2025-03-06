import { BaseContent } from '../types'

export interface RiddleClue {
  text: string
  type: 'wordplay' | 'metaphor' | 'description' | 'logic'
  relevance: number // 0-1, how relevant this clue is to solving the riddle
}

export interface RiddleAnswer {
  text: string
  alternativeAnswers?: string[] // Other acceptable answers
  explanation: string
}

export interface RiddleSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  theme?: string // e.g., 'nature', 'objects', 'concepts'
  clueCount?: number
  allowWordplay?: boolean
  allowMetaphors?: boolean
}

export interface RiddlePuzzle extends BaseContent {
  question: string
  clues: RiddleClue[]
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  solution: RiddleAnswer
  theme?: string
  additionalInfo?: {
    relatedRiddles?: string[]
    funFacts?: string[]
    culturalContext?: string
  }
}
