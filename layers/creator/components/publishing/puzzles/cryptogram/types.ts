import type { BaseContent, BasePuzzleSettings } from '../types'

export interface CipherKey {
  original: string
  substitution: string
}

export interface CryptogramSettings extends BasePuzzleSettings {
  theme: string
  language: string
  showSymbolHints?: boolean
  showLetterBank?: boolean
}

export interface FrequencyAnalysis {
  letter: string
  frequency: number
  commonWords?: string[]
}

export interface CryptogramPuzzle extends BaseContent {
  originalText: string
  encryptedText: string
  cipherKey: CipherKey[]
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  theme?: string
  analysis?: {
    letterFrequency: FrequencyAnalysis[]
    wordLengths: { [length: number]: number }
    commonPatterns: string[]
  }
  solution: {
    text: string
    steps?: {
      step: number
      description: string
      reveals: string[]
    }[]
  }
  learningPoints?: {
    cryptographyFacts: string[]
    languagePatterns: string[]
    historicalContext?: string
  }
}
