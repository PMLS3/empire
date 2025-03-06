import type { MemorySettings, MemoryPuzzle, MemoryCard, MemoryPair } from './types'
import { shuffleArray } from '../utils'

// Sample content database
const contentSets = {
  animals: {
    identical: [
      { content: '🐶', category: 'pets' },
      { content: '🐱', category: 'pets' },
      { content: '🐮', category: 'farm' },
      { content: '🐷', category: 'farm' },
      { content: '🦁', category: 'wild' },
      { content: '🐯', category: 'wild' }
    ],
    related: [
      { content1: '🐶', content2: '🦴', category: 'pets', hint: 'Dog and bone' },
      { content1: '🐱', content2: '🐟', category: 'pets', hint: 'Cat and fish' },
      { content1: '🐮', content2: '🥛', category: 'farm', hint: 'Cow and milk' }
    ]
  },
  vocabulary: {
    identical: [
      { content: 'Hello', category: 'greetings' },
      { content: 'Goodbye', category: 'greetings' },
      { content: 'Please', category: 'manners' },
      { content: 'Thanks', category: 'manners' }
    ],
    translation: [
      { content1: 'Hello', content2: 'Bonjour', category: 'greetings', hint: 'French greeting' },
      { content1: 'Goodbye', content2: 'Au revoir', category: 'greetings', hint: 'French farewell' },
      { content1: 'Please', content2: 'S\'il vous plaît', category: 'manners', hint: 'French please' }
    ]
  },
  math: {
    related: [
      { content1: '2 + 2', content2: '4', category: 'addition', hint: 'Basic addition' },
      { content1: '3 × 4', content2: '12', category: 'multiplication', hint: 'Times tables' },
      { content1: '10 ÷ 2', content2: '5', category: 'division', hint: 'Basic division' }
    ]
  }
}

function createPairs(
  settings: MemorySettings,
  theme: string,
  count: number
): MemoryPair[] {
  const matchType = settings.matchType || 'identical'
  const content = contentSets[theme as keyof typeof contentSets][
    matchType as keyof typeof contentSets[keyof typeof contentSets]
  ]

  if (!content || content.length === 0) {
    throw new Error(`No content available for theme "${theme}" with match type "${matchType}"`)
  }

  const shuffledContent = shuffleArray(content).slice(0, count)
  
  return shuffledContent.map((item, index) => {
    if ('content' in item) {
      // Identical matching
      return {
        card1: {
          id: index * 2,
          content: item.content,
          category: item.category,
          matched: false,
          flipped: false,
          position: { row: 0, col: 0 } // Will be set later
        },
        card2: {
          id: index * 2 + 1,
          content: item.content,
          category: item.category,
          matched: false,
          flipped: false,
          position: { row: 0, col: 0 } // Will be set later
        },
        difficulty: settings.difficulty === 'easy' ? 1 : 
                   settings.difficulty === 'medium' ? 2 : 3
      }
    } else {
      // Related or translation matching
      return {
        card1: {
          id: index * 2,
          content: item.content1,
          category: item.category,
          matched: false,
          flipped: false,
          position: { row: 0, col: 0 }
        },
        card2: {
          id: index * 2 + 1,
          content: item.content2,
          category: item.category,
          matched: false,
          flipped: false,
          position: { row: 0, col: 0 }
        },
        difficulty: settings.difficulty === 'easy' ? 2 : 
                   settings.difficulty === 'medium' ? 3 : 4,
        hint: item.hint
      }
    }
  })
}

function createGrid(
  pairs: MemoryPair[],
  rows: number,
  cols: number
): MemoryCard[][] {
  // Create array of all cards
  const allCards = pairs.flatMap(pair => [pair.card1, pair.card2])
  const shuffledCards = shuffleArray([...allCards])

  // Create grid
  const grid: MemoryCard[][] = Array(rows).fill(null).map(() =>
    Array(cols).fill(null)
  )

  // Place cards in grid
  let cardIndex = 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (cardIndex < shuffledCards.length) {
        const card = shuffledCards[cardIndex]
        card.position = { row, col }
        grid[row][col] = card
        cardIndex++
      }
    }
  }

  return grid
}

function calculateExpectedMoves(pairs: MemoryPair[]): number {
  const totalCards = pairs.length * 2
  const baseMoves = totalCards * 1.5 // Average case for perfect memory
  
  // Adjust for difficulty
  const avgDifficulty = pairs.reduce((sum, pair) => sum + pair.difficulty, 0) / pairs.length
  return Math.round(baseMoves * (1 + (avgDifficulty - 1) * 0.3))
}

function generateHints(pairs: MemoryPair[], difficulty: string): string[] {
  const hints: string[] = []

  // Add general hints based on difficulty
  switch (difficulty) {
    case 'easy':
      hints.push('Try to remember the position of each card you flip')
      hints.push('Start with cards that are close to each other')
      break
    case 'medium':
      hints.push('Look for patterns in card positions')
      hints.push('Try to match cards in the same category first')
      break
    case 'hard':
      hints.push('Pay attention to related pairs')
      if (pairs.some(p => p.hint)) {
        hints.push('Think about how pairs might be connected')
      }
      break
  }

  // Add specific hints for certain categories
  const categories = new Set(pairs.map(p => p.card1.category))
  if (categories.size > 1) {
    hints.push(`Cards are grouped into ${categories.size} categories`)
  }

  return hints
}

function generateRules(
  settings: MemorySettings,
  expectedMoves: number
): MemoryPuzzle['rules'] {
  const rules = {
    matchingCriteria: [],
    scoringSystem: [],
    timeBonus: settings.timeLimit
  }

  // Matching criteria
  switch (settings.matchType) {
    case 'identical':
      rules.matchingCriteria.push('Find pairs of identical cards')
      break
    case 'related':
      rules.matchingCriteria.push('Match cards that are related to each other')
      rules.matchingCriteria.push('Think about how the items might be connected')
      break
    case 'translation':
      rules.matchingCriteria.push('Match each word with its translation')
      break
  }

  // Scoring system
  rules.scoringSystem.push(`Perfect score: ${expectedMoves} moves`)
  rules.scoringSystem.push('Fewer moves = better score')
  
  if (settings.timeLimit) {
    rules.scoringSystem.push(`Time bonus for completing under ${settings.timeLimit} seconds`)
  }

  return rules
}

export async function generateMemoryMatch(settings: MemorySettings): Promise<MemoryPuzzle> {
  // Determine grid size based on difficulty
  const gridSize = settings.gridSize || {
    easy: { rows: 2, cols: 3 },
    medium: { rows: 3, cols: 4 },
    hard: { rows: 4, cols: 4 }
  }[settings.difficulty]

  const totalPairs = Math.floor((gridSize.rows * gridSize.cols) / 2)

  // Create pairs
  const pairs = createPairs(
    settings,
    settings.theme || 'animals',
    totalPairs
  )

  // Create grid
  const grid = createGrid(pairs, gridSize.rows, gridSize.cols)

  // Calculate stats
  const uniqueCategories = new Set(pairs.map(p => p.card1.category)).size
  const averageDifficulty = pairs.reduce((sum, p) => sum + p.difficulty, 0) / pairs.length
  const expectedMoves = calculateExpectedMoves(pairs)

  // Generate hints if enabled
  const hints = settings.showHints
    ? generateHints(pairs, settings.difficulty)
    : undefined

  // Generate rules
  const rules = generateRules(settings, expectedMoves)

  return {
    grid,
    pairs,
    hints,
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    timeEstimate: expectedMoves * {
      easy: 3,
      medium: 4,
      hard: 5
    }[settings.difficulty],
    solution: pairs,
    theme: settings.theme,
    stats: {
      totalPairs,
      uniqueCategories,
      averageDifficulty,
      expectedMoves
    },
    rules
  }
}
