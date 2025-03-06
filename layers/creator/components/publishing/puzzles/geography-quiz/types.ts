import { BaseContent } from '../types'

export interface Location {
  name: string
  type: 'country' | 'city' | 'landmark' | 'river' | 'mountain'
  coordinates: [number, number] // [latitude, longitude]
  facts: string[]
}

export interface GeographyQuizSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  questionCount?: number
  locationType?: Location['type']
}

export interface GeographyQuestion {
  location: Location
  options: string[]
  correctIndex: number
  hint?: string
}

export interface GeographyQuizPuzzle extends BaseContent {
  questions: GeographyQuestion[]
  difficulty: string
  category?: string
  timeEstimate?: number
  solution: number[] // Array of correct indices
  mapCenter?: [number, number] // Center coordinates for map display
  mapZoom?: number
}
