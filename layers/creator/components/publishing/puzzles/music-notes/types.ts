import { BaseContent } from '../types'

export interface Note {
  pitch: string // e.g., 'C4', 'D4', 'E4'
  duration: number // Duration in beats (1 = quarter note)
  isRest?: boolean
  accidental?: 'sharp' | 'flat' | 'natural'
  dotted?: boolean
  tie?: boolean
}

export interface Measure {
  notes: Note[]
  timeSignature: [number, number] // [beats per measure, beat unit]
  keySignature: string // e.g., 'C', 'G', 'F'
  clef: 'treble' | 'bass' | 'alto'
}

export interface MusicTheoryQuestion {
  type: 'note-reading' | 'rhythm' | 'key-signature' | 'time-signature'
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export interface MusicNotesSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  clef?: Measure['clef']
  questionTypes?: MusicTheoryQuestion['type'][]
  measureCount?: number
  includeAccidentals?: boolean
  includeRests?: boolean
  includeDottedNotes?: boolean
  includeTies?: boolean
}

export interface MusicNotesPuzzle extends BaseContent {
  measures: Measure[]
  questions: MusicTheoryQuestion[]
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  solution: string[]
  stats: {
    totalNotes: number
    uniquePitches: number
    rhythmicComplexity: number // Score based on note durations and patterns
    keyComplexity: number // Score based on key signature and accidentals
  }
  learningPoints?: {
    theory: string[]
    notation: string[]
    rhythm: string[]
    keySignatures?: string[]
  }
  assessment?: {
    criteria: string[]
    scoring: {
      category: string
      points: number
      description: string
    }[]
  }
}
