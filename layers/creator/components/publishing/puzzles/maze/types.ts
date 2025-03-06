import type { BaseContent, BasePuzzleSettings } from '../types'

export interface MazeCell {
  row: number
  col: number
  walls: {
    top: boolean
    right: boolean
    bottom: boolean
    left: boolean
  }
  visited: boolean
  isStart: boolean
  isEnd: boolean
  isPath: boolean
  isHint?: boolean
  distanceFromStart?: number
  distanceFromEnd?: number
}

export interface MazeSettings extends BasePuzzleSettings {
  size: number
  theme: string
  gridStyle: string
}

export interface MazePuzzle extends BaseContent {
  grid: MazeCell[][]
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  theme?: string
  start: { row: number; col: number }
  end: { row: number; col: number }
  stats: {
    gridSize: { rows: number; cols: number }
    shortestPath: number // Length of shortest solution
    deadEnds: number // Number of dead ends
    branchingFactor: number // Average number of choices per junction
    complexity: number // Overall difficulty score
  }
  rules: {
    movement: string[]
    scoringSystem: string[]
    bonusPoints?: string[]
  }
  solution: {
    path: { row: number; col: number }[]
    alternativePaths?: { row: number; col: number }[][]
  }
  collectibles?: {
    position: { row: number; col: number }
    type: string
    value: number
    collected: boolean
  }[]
}
