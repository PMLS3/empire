import { BaseContent } from '../types'

export interface SequenceRule {
  type: 'arithmetic' | 'geometric' | 'fibonacci' | 'square' | 'cube' | 'custom'
  description: string
  formula?: string // For custom sequences
  parameters?: {
    start?: number
    difference?: number // For arithmetic
    ratio?: number // For geometric
    customFn?: (n: number) => number // For custom
  }
}

export interface MathSequenceSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  sequenceLength?: number
  gapsCount?: number
  allowNegatives?: boolean
  maxValue?: number
}

export interface MathSequencePuzzle extends BaseContent {
  sequence: number[]
  gaps: number[] // Indices of numbers to hide
  rule: SequenceRule
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  solution: number[] // Numbers that fill the gaps
  explanation?: string // Detailed explanation of the sequence pattern
}
