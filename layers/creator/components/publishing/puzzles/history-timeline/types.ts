import { BaseContent } from '../types'

export interface HistoricalEvent {
  title: string
  date: string // ISO date string or year
  description: string
  category: string
  importance: 'major' | 'minor'
  relatedEvents?: string[] // IDs of related events
}

export interface TimelinePeriod {
  start: string
  end: string
  label: string
  events: HistoricalEvent[]
}

export interface HistoryTimelineSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  period?: TimelinePeriod
  eventCount?: number
}

export interface HistoryTimelinePuzzle extends BaseContent {
  period: TimelinePeriod
  events: HistoricalEvent[]
  scrambledEvents: HistoricalEvent[]
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  solution: number[] // Indices mapping scrambled to correct order
  connections: Array<[number, number]> // Pairs of related event indices
}
