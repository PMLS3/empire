import type { MusicNotesSettings, MusicNotesPuzzle, Note, Measure, MusicTheoryQuestion } from './types'
import { getRandomItems } from '../utils'

// Music theory constants
const PITCHES = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const OCTAVES = ['3', '4', '5']
const DURATIONS = [0.25, 0.5, 1, 2, 4] // sixteenth, eighth, quarter, half, whole
const KEY_SIGNATURES = ['C', 'G', 'D', 'F', 'Bb']
const TIME_SIGNATURES: Array<[number, number]> = [[4, 4], [3, 4], [2, 4], [6, 8]]

// Sample question database
const theoryQuestions: Record<MusicTheoryQuestion['type'], MusicTheoryQuestion[]> = {
  'note-reading': [
    {
      type: 'note-reading',
      question: 'What note is this?',
      options: ['C4', 'D4', 'E4', 'F4'],
      correctAnswer: 'C4',
      explanation: 'This note is C in the fourth octave (middle C)'
    },
    {
      type: 'note-reading',
      question: 'What is the name of this note?',
      options: ['G4', 'A4', 'B4', 'C5'],
      correctAnswer: 'G4',
      explanation: 'This note is G in the fourth octave'
    }
  ],
  'rhythm': [
    {
      type: 'rhythm',
      question: 'How many beats does this note get?',
      options: ['1', '2', '4', '1/2'],
      correctAnswer: '1',
      explanation: 'This is a quarter note, which gets one beat in 4/4 time'
    },
    {
      type: 'rhythm',
      question: 'What is this rhythm pattern?',
      options: ['Quarter-Eighth-Eighth', 'Eighth-Quarter-Eighth', 'Half-Quarter'],
      correctAnswer: 'Quarter-Eighth-Eighth',
      explanation: 'The pattern consists of one quarter note followed by two eighth notes'
    }
  ],
  'key-signature': [
    {
      type: 'key-signature',
      question: 'What key signature is this?',
      options: ['C major', 'G major', 'F major', 'D major'],
      correctAnswer: 'G major',
      explanation: 'This key signature has one sharp (F#), indicating G major'
    }
  ],
  'time-signature': [
    {
      type: 'time-signature',
      question: 'What does this time signature mean?',
      options: ['4 beats per measure', '3 beats per measure', '2 beats per measure'],
      correctAnswer: '4 beats per measure',
      explanation: '4/4 time means there are 4 quarter note beats per measure'
    }
  ]
}

function generateNote(settings: MusicNotesSettings): Note {
  const pitch = `${getRandomItems(PITCHES, 1)[0]}${getRandomItems(OCTAVES, 1)[0]}`
  const duration = getRandomItems(DURATIONS, 1)[0]
  
  // Add complexity based on difficulty
  const note: Note = {
    pitch,
    duration
  }

  if (settings.difficulty !== 'easy') {
    if (settings.includeRests && Math.random() < 0.2) {
      note.isRest = true
    }

    if (settings.includeAccidentals && Math.random() < 0.3) {
      note.accidental = getRandomItems(['sharp', 'flat', 'natural'], 1)[0]
    }

    if (settings.includeDottedNotes && Math.random() < 0.2) {
      note.dotted = true
    }

    if (settings.difficulty === 'hard' && settings.includeTies && Math.random() < 0.2) {
      note.tie = true
    }
  }

  return note
}

function generateMeasure(settings: MusicNotesSettings): Measure {
  const timeSignature = getRandomItems(TIME_SIGNATURES, 1)[0]
  const keySignature = getRandomItems(KEY_SIGNATURES, 1)[0]
  const clef = settings.clef || 'treble'
  
  // Calculate total beats needed
  const totalBeats = timeSignature[0]
  const notes: Note[] = []
  let currentBeats = 0

  while (currentBeats < totalBeats) {
    const note = generateNote(settings)
    const noteBeats = note.duration * (note.dotted ? 1.5 : 1)
    
    if (currentBeats + noteBeats <= totalBeats) {
      notes.push(note)
      currentBeats += noteBeats
    }
  }

  return {
    notes,
    timeSignature,
    keySignature,
    clef
  }
}

function calculateStats(measures: Measure[]): MusicNotesPuzzle['stats'] {
  const allNotes = measures.flatMap(m => m.notes)
  const uniquePitches = new Set(allNotes.filter(n => !n.isRest).map(n => n.pitch)).size

  // Calculate rhythmic complexity
  let rhythmicComplexity = 0
  allNotes.forEach(note => {
    rhythmicComplexity += note.dotted ? 2 : 0
    rhythmicComplexity += note.tie ? 3 : 0
    rhythmicComplexity += note.duration < 1 ? 2 : 0
  })

  // Calculate key complexity
  const keyComplexity = measures.reduce((complexity, measure) => {
    const sharpsFlats = {
      'C': 0, 'G': 1, 'D': 2, 'F': 1, 'Bb': 2
    }[measure.keySignature] || 0
    return complexity + sharpsFlats
  }, 0)

  return {
    totalNotes: allNotes.length,
    uniquePitches,
    rhythmicComplexity,
    keyComplexity
  }
}

function generateQuestions(
  measures: Measure[],
  settings: MusicNotesSettings
): MusicTheoryQuestion[] {
  const questionTypes = settings.questionTypes || ['note-reading', 'rhythm']
  const questionCount = {
    easy: 2,
    medium: 3,
    hard: 4
  }[settings.difficulty]

  return getRandomItems(
    questionTypes.flatMap(type => theoryQuestions[type]),
    questionCount
  )
}

export async function generateMusicNotes(settings: MusicNotesSettings): Promise<MusicNotesPuzzle> {
  // Generate measures
  const measureCount = settings.measureCount || {
    easy: 2,
    medium: 3,
    hard: 4
  }[settings.difficulty]

  const measures = Array(measureCount)
    .fill(null)
    .map(() => generateMeasure(settings))

  // Generate questions
  const questions = generateQuestions(measures, settings)

  // Calculate stats
  const stats = calculateStats(measures)

  // Generate learning points based on difficulty
  const learningPoints = {
    theory: [
      'Notes are named A through G',
      'Each line and space represents a different pitch',
      'The staff shows the relative pitch of notes'
    ],
    notation: [
      'Quarter notes have filled-in heads and stems',
      'Half notes have hollow heads and stems',
      'Whole notes have hollow heads and no stems'
    ],
    rhythm: [
      'A quarter note gets one beat in 4/4 time',
      'A half note gets two beats',
      'A whole note gets four beats'
    ],
    keySignatures: settings.difficulty !== 'easy' ? [
      'Sharp keys follow the circle of fifths',
      'Flat keys follow the circle of fourths',
      'C major has no sharps or flats'
    ] : undefined
  }

  return {
    measures,
    questions,
    hints: settings.showHints ? [
      'Look at the clef to determine note positions',
      'Count the beats in each measure',
      'Check the key signature for sharps or flats'
    ] : undefined,
    difficulty: settings.difficulty,
    category: settings.category,
    timeEstimate: measureCount * questions.length * {
      easy: 30,
      medium: 45,
      hard: 60
    }[settings.difficulty],
    solution: questions.map(q => q.correctAnswer),
    stats,
    learningPoints,
    assessment: {
      criteria: [
        'Note identification accuracy',
        'Rhythm understanding',
        'Key signature recognition',
        'Time signature comprehension'
      ],
      scoring: [
        {
          category: 'Note Reading',
          points: 2,
          description: 'Correctly identify notes on the staff'
        },
        {
          category: 'Rhythm',
          points: 2,
          description: 'Understand note durations and patterns'
        },
        {
          category: 'Key Signatures',
          points: 3,
          description: 'Recognize and interpret key signatures'
        },
        {
          category: 'Time Signatures',
          points: 3,
          description: 'Comprehend meter and beat groupings'
        }
      ]
    },
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor
  }
}
