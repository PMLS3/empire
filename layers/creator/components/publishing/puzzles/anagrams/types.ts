import { BaseContent } from '../types'

export interface AnagramsSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
}

export interface AnagramsPuzzle extends BaseContent {
  words: string[]
  scrambledWords: string[]
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
}
