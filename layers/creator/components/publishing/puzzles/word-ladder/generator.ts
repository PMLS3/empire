import type { WordLadderSettings, WordLadderPuzzle, WordLadderStep } from './types'
import { shuffleArray } from '../utils'

// Sample word database
const wordSets: Record<string, Record<string, string[]>> = {
  general: {
    easy: ['cat', 'dog', 'pig', 'hat', 'mat', 'rat', 'bat', 'hot', 'dot', 'pot'],
    medium: ['word', 'work', 'fork', 'form', 'foam', 'fear', 'hear', 'head', 'heal', 'help'],
    hard: ['light', 'sight', 'fight', 'right', 'night', 'might', 'tight', 'teach', 'beach', 'reach'],
    expert: ['bright', 'flight', 'slight', 'height', 'weight', 'mighty', 'eighty', 'thirty']
  },
  science: {
    easy: ['atom', 'cell', 'gene', 'mass', 'wave', 'heat', 'beat', 'beam', 'team', 'stem'],
    medium: ['force', 'field', 'yield', 'metal', 'polar', 'solar', 'lunar', 'laser', 'layer', 'water'],
    hard: ['energy', 'matter', 'plasma', 'photon', 'proton', 'carbon', 'oxygen', 'nitrogen', 'hydrogen'],
    expert: ['quantum', 'nucleus', 'neutron', 'electron', 'isotope', 'polymer', 'catalyst']
  },
  nature: {
    easy: ['tree', 'leaf', 'seed', 'root', 'soil', 'rain', 'wind', 'bird', 'fish', 'bear'],
    medium: ['plant', 'grass', 'green', 'bloom', 'cloud', 'storm', 'river', 'ocean', 'beach', 'coast'],
    hard: ['forest', 'jungle', 'desert', 'valley', 'canyon', 'marine', 'arctic', 'tropic', 'alpine'],
    expert: ['mountain', 'volcano', 'glacier', 'tundra', 'savanna', 'wetland', 'plateau']
  }
}

// Pre-defined word pairs with solutions
const wordPairs: Record<string, Array<{
  start: string
  end: string
  solution: Array<{ word: string; hint: string }>
}>> = {
  easy: [
    {
      start: 'cat',
      end: 'dog',
      solution: [
        { word: 'cat', hint: 'Starting word' },
        { word: 'cot', hint: 'Change A to O' },
        { word: 'dot', hint: 'Change C to D' },
        { word: 'dog', hint: 'Change T to G' }
      ]
    }
  ],
  medium: [
    {
      start: 'word',
      end: 'help',
      solution: [
        { word: 'word', hint: 'Starting word' },
        { word: 'work', hint: 'Change D to K' },
        { word: 'walk', hint: 'Change OR to AL' },
        { word: 'talk', hint: 'Change W to T' },
        { word: 'help', hint: 'Rearrange letters' }
      ]
    }
  ],
  hard: [
    {
      start: 'light',
      end: 'dark',
      solution: [
        { word: 'light', hint: 'Starting word' },
        { word: 'night', hint: 'Change L to N' },
        { word: 'right', hint: 'Change N to R' },
        { word: 'dark', hint: 'Major transformation' }
      ]
    }
  ],
  expert: [
    {
      start: 'bright',
      end: 'shadow',
      solution: [
        { word: 'bright', hint: 'Starting word' },
        { word: 'blight', hint: 'Change R to L' },
        { word: 'slight', hint: 'Change B to S' },
        { word: 'shadow', hint: 'Major transformation' }
      ]
    }
  ]
}

function getWordPair(
  settings: WordLadderSettings,
  wordLength: number
): { start: string; end: string; solution: WordLadderStep[] } {
  const difficultyPairs = wordPairs[settings.difficulty] || []
  const validPairs = difficultyPairs.filter(
    pair => pair.start.length === wordLength
  )

  if (validPairs.length === 0) {
    throw new Error(`No word pairs available for length ${wordLength} and difficulty ${settings.difficulty}`)
  }

  const selectedPair = shuffleArray(validPairs)[0]
  return {
    start: selectedPair.start,
    end: selectedPair.end,
    solution: selectedPair.solution.map(step => ({
      word: step.word,
      hint: step.hint,
      revealed: false
    }))
  }
}

function calculateMinSteps(word1: string, word2: string, allowDiagonals: boolean): number {
  if (word1.length !== word2.length) {
    throw new Error('Words must be the same length')
  }

  let differences = 0
  for (let i = 0; i < word1.length; i++) {
    if (word1[i] !== word2[i]) {
      differences++
    }
  }

  return allowDiagonals ? Math.ceil(differences / 2) : differences
}

function getValidWords(
  wordLength: number,
  theme: string,
  difficulty: string
): string[] {
  const themeWords = wordSets[theme] || wordSets.general
  const difficultyWords = themeWords[difficulty] || []
  
  return difficultyWords.filter(word => word.length === wordLength)
}

function calculateBranchingFactor(
  word: string,
  validWords: string[],
  allowDiagonals: boolean
): number {
  let branches = 0

  for (const target of validWords) {
    if (target === word) continue

    let differences = 0
    for (let i = 0; i < word.length; i++) {
      if (word[i] !== target[i]) {
        differences++
      }
    }

    if (allowDiagonals ? differences <= 2 : differences === 1) {
      branches++
    }
  }

  return branches
}

function generateHints(
  solution: WordLadderStep[],
  difficulty: string,
  allowDiagonals: boolean
): string[] {
  const hints: string[] = []

  switch (difficulty) {
    case 'easy':
      hints.push('Change one letter at a time')
      hints.push(`Solution takes ${solution.length} steps`)
      break

    case 'medium':
      hints.push('Some steps might require rearranging letters')
      if (allowDiagonals) {
        hints.push('You can change up to two letters at once')
      }
      break

    case 'hard':
    case 'expert':
      hints.push('Think about word patterns and relationships')
      hints.push('Consider multiple possible paths')
      break
  }

  return hints
}

function generateRules(
  settings: WordLadderSettings,
  minSteps: number
): WordLadderPuzzle['rules'] {
  const allowedChanges: string[] = []
  const scoringSystem: string[] = []
  const bonusPoints: string[] = []

  // Allowed changes
  if (settings.allowDiagonals) {
    allowedChanges.push('Change one or two letters at a time')
  } else {
    allowedChanges.push('Change only one letter at a time')
  }
  allowedChanges.push('Each step must create a valid word')

  // Scoring system
  scoringSystem.push(`Perfect score: ${minSteps} steps`)
  scoringSystem.push('Fewer steps = better score')

  // Bonus points
  if (settings.allowDiagonals) {
    bonusPoints.push('Bonus for clever use of two-letter changes')
  }
  bonusPoints.push('Bonus for finding alternate solutions')

  return {
    allowedChanges,
    scoringSystem,
    bonusPoints
  }
}

export async function generateWordLadder(settings: WordLadderSettings): Promise<WordLadderPuzzle> {
  // Determine word length
  const wordLength = settings.wordLength || {
    easy: 3,
    medium: 4,
    hard: 5,
    expert: 6
  }[settings.difficulty] || 3

  // Get word pair and solution
  const { start, end, solution } = getWordPair(settings, wordLength)

  // Calculate minimum steps
  const minSteps = calculateMinSteps(start, end, settings.allowDiagonals || false)

  // Get valid words for the theme
  const theme = settings.theme || 'general'
  const validWords = getValidWords(wordLength, theme, settings.difficulty)

  // Calculate branching factor
  const branchingFactor = calculateBranchingFactor(start, validWords, settings.allowDiagonals || false)

  // Generate hints if enabled
  const hints = settings.showHints
    ? generateHints(solution, settings.difficulty, settings.allowDiagonals || false)
    : []

  // Calculate time estimate
  const timeEstimate = {
    easy: 120,
    medium: 180,
    hard: 300,
    expert: 420
  }[settings.difficulty] || 180

  return {
    startWord: start,
    endWord: end,
    solution,
    hints,
    difficulty: settings.difficulty,
    category: settings.category,
    theme: settings.theme,
    timeEstimate,
    stats: {
      wordLength,
      stepCount: solution.length,
      minSteps,
      averageBranchingFactor: branchingFactor,
      complexity: branchingFactor * minSteps
    },
    rules: generateRules(settings, minSteps),
    validWords,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor
  }
}

interface WordLadderSettings {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  wordLength: 3 | 4 | 5 | 6
  maxSteps: number
  category: 'general' | 'animals' | 'food' | 'nature' | 'science'
  ageGroup: 'children' | 'teens' | 'adults'
  language: 'en' | 'es' | 'fr'
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: 'small' | 'medium' | 'large'
  printLayout: 'compact' | 'spacious'
  showWordBank: boolean
  showHints: boolean
  showStepNumbers: boolean
  gridStyle: 'classic' | 'modern' | 'minimal'
}

interface WordLadderPuzzle {
  startWord: string
  endWord: string
  solution: WordLadderStep[]
  wordBank: string[]
  hints: string[]
  difficulty: string
  minSteps: number
  category: string
  uniqueSolution: boolean
}

interface WordLadderStep {
  word: string
  hint: string
  revealed: boolean
}
