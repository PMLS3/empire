import type { BasePuzzleSettings, Difficulty, FontSize, PrintLayout } from '../types'

export type MathOperation = 'addition' | 'subtraction' | 'multiplication' | 'division'

export interface MathGridSettings extends BasePuzzleSettings {
  gridSize: 4 | 5 | 6 | 7 | 8 | 9
  operations: MathOperation[]
  maxNumber: number
  showOperations: boolean
  showGrid: boolean
  allowNegatives: boolean
  allowDecimals: boolean
  showAnswerBank: boolean
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
