import { BaseContent } from '../types'

export interface JigsawPiece {
  id: number
  position: {
    row: number
    col: number
  }
  currentPosition?: {
    row: number
    col: number
  }
  edges: {
    top: 'in' | 'out' | 'flat'
    right: 'in' | 'out' | 'flat'
    bottom: 'in' | 'out' | 'flat'
    left: 'in' | 'out' | 'flat'
  }
  rotation: 0 | 90 | 180 | 270
  image: {
    url: string
    x: number
    y: number
    width: number
    height: number
  }
  locked: boolean
  connected: number[] // IDs of connected pieces
}

export interface JigsawSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  gridSize?: {
    rows: number
    cols: number
  }
  imageUrl?: string
  allowRotation?: boolean
  showEdgeHints?: boolean // Show which pieces are edge pieces
  showCornerHints?: boolean // Show which pieces are corner pieces
  theme?: string
  timeLimit?: number
}

export interface JigsawPuzzle extends BaseContent {
  pieces: JigsawPiece[]
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  theme?: string
  imageUrl: string
  dimensions: {
    width: number
    height: number
    pieceWidth: number
    pieceHeight: number
  }
  stats: {
    totalPieces: number
    edgePieces: number
    cornerPieces: number
    innerPieces: number
    complexity: number
  }
  rules: {
    placement: string[]
    scoringSystem: string[]
    bonusPoints?: string[]
  }
  solution: {
    pieces: {
      id: number
      position: { row: number; col: number }
      rotation: number
    }[]
  }
}
