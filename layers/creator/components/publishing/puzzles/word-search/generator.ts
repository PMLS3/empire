import type { WordSearchSettings, WordSearchPuzzle, WordPosition, WordPlacement, GridCell } from './types'
import { Difficulty } from '../types'
import { shuffleArray } from '../utils'

// Sample word database
const wordSets: Record<string, Record<Difficulty, string[]>> = {
  animals: {
    easy: ['cat', 'dog', 'pig', 'cow', 'hen', 'rat'],
    medium: ['tiger', 'zebra', 'giraffe', 'monkey', 'panda'],
    hard: ['elephant', 'kangaroo', 'crocodile', 'penguin', 'dolphin'],
    expert: ['rhinoceros', 'hippopotamus', 'chimpanzee', 'orangutan', 'platypus']
  },
  countries: {
    easy: ['usa', 'uk', 'france', 'spain', 'italy'],
    medium: ['germany', 'russia', 'brazil', 'canada', 'japan'],
    hard: ['australia', 'argentina', 'singapore', 'portugal', 'thailand'],
    expert: ['kazakhstan', 'azerbaijan', 'mozambique', 'madagascar', 'zimbabwe']
  },
  space: {
    easy: ['sun', 'moon', 'star', 'mars', 'earth'],
    medium: ['venus', 'saturn', 'comet', 'planet', 'galaxy'],
    hard: ['jupiter', 'mercury', 'asteroid', 'nebula', 'supernova'],
    expert: ['constellation', 'gravitational', 'interstellar', 'neutronstar', 'blackhole']
  }
}

// Theme-based fill characters
const themeFillChars: Record<string, string> = {
  animals: 'abcdefghijklmnopqrstuvwxyz',
  countries: 'abcdefghijklmnopqrstuvwxyz',
  space: 'abcdefghijklmnopqrstuvwxyz123456789'
}

function getWords(
  settings: WordSearchSettings,
  count: number
): Array<{ word: string; category?: string }> {
  console.log('Generator getWords called with settings:', settings)
  
  // If custom words are provided, use those
  if (settings.words && settings.words.length > 0) {
    console.log('Using custom words:', settings.words)
    return settings.words.map(word => ({
      word: settings.caseSensitive ? word : word.toUpperCase(),
      category: settings.category
    }))
  }

  // Otherwise use theme-based words
  const themeWords = wordSets[settings.theme || 'animals']
  const difficultyWords = themeWords[settings.difficulty]
  
  // Filter by length if specified
  const validWords = difficultyWords.filter(word => {
    const len = word.length
    return (!settings.minWordLength || len >= settings.minWordLength) &&
           (!settings.maxWordLength || len <= settings.maxWordLength)
  })

  return shuffleArray(validWords)
    .slice(0, count)
    .map(word => ({
      word: settings.caseSensitive ? word : word.toUpperCase(),
      category: settings.category
    }))
}

function createEmptyGrid(rows: number, cols: number): GridCell[][] {
  return Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => ({
      char: '',
      isPartOfWord: false,
      words: [],
      highlighted: false
    }))
  )
}

function canPlaceWord(
  grid: GridCell[][],
  word: string,
  position: WordPosition
): boolean {
  const { row, col, direction } = position
  const rows = grid.length
  const cols = grid[0].length
  
  // Direction vectors
  const dirVectors: Record<WordPosition['direction'], { dr: number; dc: number }> = {
    'horizontal': { dr: 0, dc: 1 },
    'vertical': { dr: 1, dc: 0 },
    'diagonal-right': { dr: 1, dc: 1 },
    'diagonal-left': { dr: 1, dc: -1 }
  }
  
  const { dr, dc } = dirVectors[direction]
  
  // Check if word fits in grid
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dr
    const c = col + i * dc
    
    if (r < 0 || r >= rows || c < 0 || c >= cols) {
      return false
    }
    
    const cell = grid[r][c]
    if (cell.isPartOfWord && cell.char !== word[i]) {
      return false
    }
  }
  
  return true
}

function placeWord(
  grid: GridCell[][],
  word: string,
  position: WordPosition
): void {
  const { row, col, direction } = position
  const dirVectors: Record<WordPosition['direction'], { dr: number; dc: number }> = {
    'horizontal': { dr: 0, dc: 1 },
    'vertical': { dr: 1, dc: 0 },
    'diagonal-right': { dr: 1, dc: 1 },
    'diagonal-left': { dr: 1, dc: -1 }
  }
  
  const { dr, dc } = dirVectors[direction]
  
  for (let i = 0; i < word.length; i++) {
    const r = row + i * dr
    const c = col + i * dc
    const cell = grid[r][c]
    
    cell.char = word[i]
    cell.isPartOfWord = true
    cell.words.push(word)
  }
}

function findWordPosition(
  grid: GridCell[][],
  word: string,
  allowedDirections: WordPosition['direction'][]
): WordPosition | null {
  const rows = grid.length
  const cols = grid[0].length
  const positions: WordPosition[] = []
  
  // Try all possible positions
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      for (const direction of allowedDirections) {
        const position = { row, col, direction }
        if (canPlaceWord(grid, word, position)) {
          positions.push(position)
        }
      }
    }
  }
  
  return positions.length > 0
    ? positions[Math.floor(Math.random() * positions.length)]
    : null
}

function fillEmptyCells(
  grid: GridCell[][],
  settings: WordSearchSettings
): void {
  const theme = settings.theme || 'animals'
  const fillChars = settings.fillStyle === 'thematic'
    ? themeFillChars[theme]
    : settings.fillStyle === 'custom'
      ? settings.fillChars?.join('') || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      const cell = grid[row][col]
      if (!cell.isPartOfWord) {
        const randomChar = fillChars[Math.floor(Math.random() * fillChars.length)]
        cell.char = settings.caseSensitive ? randomChar : randomChar.toUpperCase()
      }
    }
  }
}

function generateHints(
  words: WordPlacement[],
  difficulty: Difficulty
): string[] {
  const hints: string[] = []
  
  // Add general hints
  switch (difficulty) {
    case 'easy':
      hints.push('Words can be found horizontally and vertically')
      hints.push(`Look for ${words.length} words`)
      break
      
    case 'medium':
      hints.push('Words can be found diagonally')
      hints.push('Some words might overlap')
      break
      
    case 'hard':
    case 'expert':
      hints.push('Words can be found in any direction')
      hints.push('Multiple words may share letters')
      break
  }
  
  // Add category-based hints
  const categories = new Set(words.map(w => w.category).filter(Boolean))
  if (categories.size > 1) {
    hints.push(`Words are from ${categories.size} different categories`)
  }
  
  return hints
}

function calculateComplexity(
  words: WordPlacement[],
  gridDensity: number,
  allowedDirections: string[]
): number {
  return Math.round(
    (words.length * 10) +
    (gridDensity * 50) +
    (allowedDirections.length * 15)
  )
}

export async function generateWordSearch(settings: WordSearchSettings): Promise<WordSearchPuzzle> {
  console.log('Generator received settings:', settings)

  // Use custom words if provided
  const customWords = settings.words && settings.words.length > 0
  
  // Determine grid size
  const defaultGridSize = {
    easy: { rows: 8, cols: 8 },
    medium: { rows: 12, cols: 12 },
    hard: { rows: 15, cols: 15 },
    expert: { rows: 20, cols: 20 }
  }[settings.difficulty]

  // Use size from settings or default grid size
  const gridSize = settings.size 
    ? { rows: settings.size, cols: settings.size }
    : defaultGridSize

  // Determine word count - only if using theme words
  const wordCount = customWords ? settings.words.length : {
    easy: 5,
    medium: 8,
    hard: 12,
    expert: 15
  }[settings.difficulty]

  const grid = createEmptyGrid(gridSize.rows, gridSize.cols)
  
  // Get words based on settings
  const words = customWords 
    ? settings.words.map(word => ({ 
        word: settings.caseSensitive ? word : word.toUpperCase(),
        category: settings.category 
      }))
    : getWords(settings, wordCount)
  
  console.log('Words to use:', words)
  
  // Determine allowed directions
  const directions: WordPosition['direction'][] = settings.allowedDirections || {
    easy: ['horizontal', 'vertical'],
    medium: ['horizontal', 'vertical', 'diagonal-right'],
    hard: ['horizontal', 'vertical', 'diagonal-right', 'diagonal-left'],
    expert: ['horizontal', 'vertical', 'diagonal-right', 'diagonal-left']
  }[settings.difficulty]

  // Place words
  const placements: WordPlacement[] = []
  
  for (const { word, category } of words) {
    const position = findWordPosition(grid, word, directions)
    if (position) {
      placeWord(grid, word, position)
      placements.push({
        word,
        position,
        category,
        found: false
      })
    }
  }

  // Fill empty cells
  fillEmptyCells(grid, settings)

  // Calculate grid density
  let usedCells = 0
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      if (grid[row][col].isPartOfWord) {
        usedCells++
      }
    }
  }
  const gridDensity = usedCells / (grid.length * grid[0].length)

  // Generate hints if enabled
  const hints = settings.showHints
    ? generateHints(placements, settings.difficulty)
    : []

  // Calculate time estimate
  const timeEstimate = {
    easy: 120,
    medium: 240,
    hard: 360,
    expert: 480
  }[settings.difficulty]

  return {
    grid,
    words: placements,
    hints,
    difficulty: settings.difficulty,
    category: settings.category,
    theme: settings.theme,
    timeEstimate,
    stats: {
      totalWords: placements.length,
      uniqueCategories: new Set(placements.map(p => p.category).filter(Boolean)).size,
      averageWordLength: placements.reduce((sum, p) => sum + p.word.length, 0) / placements.length,
      gridDensity,
      complexity: calculateComplexity(placements, gridDensity, directions)
    },
    rules: {
      directions: directions.map(d => `Words can be found ${d}ly`),
      scoringSystem: [
        'Points awarded for each word found',
        'Bonus points for finding words quickly',
        'Extra points for finding words without hints'
      ],
      bonusPoints: [
        'Find all words within time limit',
        'Find words in order of difficulty',
        'Complete puzzle without using hints'
      ]
    },
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    borderColor: settings.borderColor,
    locationsColor: settings.locationsColor,
    size: settings.size || gridSize.rows
  }
}
