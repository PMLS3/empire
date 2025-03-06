import { BaseContent } from '../types'

export interface SequenceRule {
  type: 'arithmetic' | 'geometric' | 'fibonacci' | 'square' | 'cube' | 'prime' | 'custom'
  description: string
  formula?: string
  example?: string
  complexity: number // 1-10 scale
}

export interface NumberSequence {
  numbers: number[]
  missingIndices: number[]
  rule: SequenceRule
  explanation: string
}

export interface NumberSequenceSettings {
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
  missingCount?: number
  ruleTypes?: SequenceRule['type'][]
  allowNegatives?: boolean
  maxStartNumber?: number
  maxDifference?: number
  includeFormulas?: boolean
}

export interface NumberSequencePuzzle extends BaseContent {
  sequences: NumberSequence[]
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  solution: number[][]
  stats: {
    totalSequences: number
    averageComplexity: number
    patternTypes: SequenceRule['type'][]
    numberRange: [number, number] // [min, max]
  }
  learningPoints?: {
    patterns: string[]
    mathConcepts: string[]
    problemSolving: string[]
    formulas?: string[]
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
