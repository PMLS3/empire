import { BaseContent } from '../types'

export interface UscienceUdiagramSettings {
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

export interface UscienceUdiagramPuzzle extends BaseContent {
  content: any // TODO: Define specific puzzle content
  difficulty: string
  category?: string
  timeEstimate?: number
}
