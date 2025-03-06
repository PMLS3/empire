import { BaseContent } from '../types'

export interface ArtElement {
  type: 'shape' | 'line' | 'color' | 'texture' | 'pattern'
  value: string
  description: string
  difficulty: number // 1-10 scale
}

export interface ArtTask {
  instruction: string
  elements: ArtElement[]
  tips?: string[]
  requiredTools?: string[]
}

export interface ArtSolution {
  steps: string[]
  finalImage: string // Base64 encoded image or reference
  techniques: string[]
  variations?: string[]
}

export interface ArtSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  style?: string // e.g., 'abstract', 'realistic', 'cartoon'
  medium?: string // e.g., 'digital', 'pencil', 'watercolor'
  elementCount?: number
  includeColors?: boolean
  includeTextures?: boolean
  includePatterns?: boolean
  canvasSize?: {
    width: number
    height: number
  }
}

export interface ArtPuzzle extends BaseContent {
  tasks: ArtTask[]
  elements: ArtElement[]
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  solution: ArtSolution
  style?: string
  medium?: string
  stats: {
    totalElements: number
    complexityScore: number // Based on element difficulties
    techniquesRequired: number
    creativityLevel: number // 1-10 scale
  }
  learningPoints?: {
    techniques: string[]
    principles: string[]
    history?: string[]
    theory?: string[]
  }
  assessment?: {
    criteria: string[]
    rubric: {
      category: string
      points: number
      description: string
    }[]
  }
}
