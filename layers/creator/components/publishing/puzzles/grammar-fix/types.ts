import { BaseContent } from '../types'

export interface GrammarError {
  type: 'spelling' | 'punctuation' | 'agreement' | 'tense' | 'structure'
  description: string
  incorrectText: string
  correctText: string
  explanation: string
}

export interface GrammarFixSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  errorTypes?: GrammarError['type'][]
  sentenceCount?: number
}

export interface GrammarSentence {
  original: string
  errors: GrammarError[]
  corrected: string
  hint?: string
}

export interface GrammarFixPuzzle extends BaseContent {
  sentences: GrammarSentence[]
  difficulty: string
  category?: string
  timeEstimate?: number
  solution: string[]
  totalErrors: number
  errorTypes: Set<GrammarError['type']>
}
