export interface BaseContent {
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'
export type FontSize = 'small' | 'medium' | 'large'
export type PrintLayout = 'compact' | 'spacious'

export interface BasePuzzleSettings {
  difficulty: Difficulty
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: FontSize
  printLayout: PrintLayout
  showHints: boolean
}
