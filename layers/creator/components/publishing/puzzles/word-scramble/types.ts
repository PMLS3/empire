import type { BaseContent, BasePuzzleSettings, FontSize } from '../types'

export interface ScrambledWord {
  original: string
  scrambled: string
  hint?: string
  category?: string
}

export interface WordScrambleSettings extends BasePuzzleSettings {
  ageGroup: string
  language: string
  showWordBank: boolean
  showStepNumbers: boolean
}

export interface WordScramblePuzzle extends BaseContent {
  words: ScrambledWord[]
  category?: string
  timeEstimate: number
  stats: {
    totalWords: number
    averageWordLength: number
    complexity: number
  }
}
