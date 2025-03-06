import { BaseContent } from '../types'

export interface UmathUstorySettings {
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

export interface UmathUstoryPuzzle extends BaseContent {
  content: any // TODO: Define specific puzzle content
  difficulty: string
  category?: string
  timeEstimate?: number
}
