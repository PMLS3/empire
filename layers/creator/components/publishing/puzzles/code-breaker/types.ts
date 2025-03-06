import type { BaseContent, BasePuzzleSettings, FontSize } from '../types'

export interface CodeBreakerSymbol {
  value: string
  meaning: string
  category?: string
}

export interface CodeBreakerMessage {
  encoded: string
  decoded: string
  hint?: string
}

export interface CodeBreakerSettings extends BasePuzzleSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: FontSize
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  symbolSet?: 'basic' | 'advanced' | 'custom'
  customSymbols?: CodeBreakerSymbol[]
  messageLength?: number
  includeNumbers?: boolean
  includePunctuation?: boolean
  theme?: string // e.g., 'ancient', 'modern', 'sci-fi'
}

export interface CodeBreakerPuzzle extends BaseContent {
  message: CodeBreakerMessage
  symbols: CodeBreakerSymbol[]
  substitutionKey: Map<string, string>
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  solution: string
  theme?: string
  stats: {
    uniqueSymbols: number
    messageLength: number
    patternComplexity: number // Score based on word patterns and repetition
    decodingSteps: number // Estimated steps to solve
  }
  clues?: {
    givenLetters: string[]
    commonWords: string[]
    patternHints: string[]
  }
}
