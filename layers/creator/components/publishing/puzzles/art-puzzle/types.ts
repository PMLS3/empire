import { BaseContent } from '../types'

export interface ArtElement {
  type: 'shape' | 'line' | 'color' | 'pattern'
  properties: {
    name: string
    description: string
    difficulty: number // 1-10 scale
    examples?: string[]
  }
}

export interface ArtTask {
  instruction: string
  elements: ArtElement[]
  criteria: string[]
  hints?: string[]
}

export interface ArtPuzzleSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  theme?: string // e.g., 'nature', 'abstract', 'geometric'
  medium?: string // e.g., 'drawing', 'painting', 'digital'
  elementCount?: number
  allowColor?: boolean
  allowPatterns?: boolean
  timeLimit?: number
}

export interface ArtPuzzleSolution {
  description: string
  keyElements: string[]
  techniques: string[]
  variations: string[]
  commonMistakes: string[]
  tips: string[]
}

export interface ArtPuzzle extends BaseContent {
  task: ArtTask
  theme: string
  medium: string
  difficulty: string
  category?: string
  timeEstimate?: number
  solution: ArtPuzzleSolution
  learningObjectives: string[]
  artisticConcepts: {
    name: string
    description: string
    examples: string[]
  }[]
  progressiveSteps?: {
    step: number
    description: string
    focus: string[]
  }[]
  extensions?: {
    name: string
    description: string
    difficulty: number
  }[]
  assessment?: {
    criteria: string[]
    rubric: {
      category: string
      levels: {
        score: number
        description: string
      }[]
    }[]
  }
}
