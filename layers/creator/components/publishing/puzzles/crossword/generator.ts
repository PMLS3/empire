import type { CrosswordSettings, CrosswordPuzzle, CrosswordCell, CrosswordClue } from './types'
import { shuffleArray, getRandomItems } from '../utils'

// Sample word database with clues
interface CrosswordEntry {
  word: string
  clue: string
  difficulty: 'easy' | 'medium' | 'hard'
  theme: string
}

const crosswordEntries: CrosswordEntry[] = [
  {
    word: 'PYTHON',
    clue: 'Popular programming language named after a snake',
    difficulty: 'easy',
    theme: 'technology'
  },
  {
    word: 'ALGORITHM',
    clue: 'Step-by-step procedure for calculations',
    difficulty: 'medium',
    theme: 'technology'
  },
  {
    word: 'DATABASE',
    clue: 'Organized collection of data',
    difficulty: 'easy',
    theme: 'technology'
  },
  {
    word: 'GALAXY',
    clue: 'Massive system of stars and planets',
    difficulty: 'easy',
    theme: 'science'
  },
  {
    word: 'QUANTUM',
    clue: 'Smallest discrete unit of a physical property',
    difficulty: 'hard',
    theme: 'science'
  },
  {
    word: 'DEMOCRACY',
    clue: 'Government by the people',
    difficulty: 'medium',
    theme: 'history'
  }
  // Add more entries as needed
]

function createEmptyGrid(size: number): CrosswordCell[][] {
  return Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => ({
      letter: '',
      isBlack: false
    }))
  )
}

function canPlaceWord(
  grid: CrosswordCell[][],
  word: string,
  row: number,
  col: number,
  direction: 'across' | 'down'
): boolean {
  const size = grid.length

  // Check if word fits in grid
  if (direction === 'across' && col + word.length > size) return false
  if (direction === 'down' && row + word.length > size) return false

  // Check each position
  for (let i = 0; i < word.length; i++) {
    const r = direction === 'down' ? row + i : row
    const c = direction === 'across' ? col + i : col

    // Check if cell is already filled with a different letter
    if (grid[r][c].letter !== '' && grid[r][c].letter !== word[i]) {
      return false
    }

    // Check adjacent cells (no words should touch side-by-side)
    if (direction === 'across') {
      if (r > 0 && grid[r - 1][c].letter !== '' && !grid[r - 1][c].isBlack) return false
      if (r < size - 1 && grid[r + 1][c].letter !== '' && !grid[r + 1][c].isBlack) return false
    } else {
      if (c > 0 && grid[r][c - 1].letter !== '' && !grid[r][c - 1].isBlack) return false
      if (c < size - 1 && grid[r][c + 1].letter !== '' && !grid[r][c + 1].isBlack) return false
    }
  }

  return true
}

function placeWord(
  grid: CrosswordCell[][],
  word: string,
  row: number,
  col: number,
  direction: 'across' | 'down'
): void {
  for (let i = 0; i < word.length; i++) {
    const r = direction === 'down' ? row + i : row
    const c = direction === 'across' ? col + i : col
    grid[r][c].letter = word[i]
  }
}

function makeSymmetrical(grid: CrosswordCell[][]): void {
  const size = grid.length
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j].isBlack) {
        grid[size - 1 - i][size - 1 - j].isBlack = true
      }
    }
  }
}

function fillBlackCells(grid: CrosswordCell[][], symmetrical: boolean): void {
  const size = grid.length
  const blackCellPercentage = 0.2 // 20% of cells should be black

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j].letter === '' && Math.random() < blackCellPercentage) {
        grid[i][j].isBlack = true
        if (symmetrical) {
          grid[size - 1 - i][size - 1 - j].isBlack = true
        }
      }
    }
  }
}

function numberGrid(grid: CrosswordCell[][]): void {
  const size = grid.length
  let number = 1

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j].isBlack) continue

      const needsNumber = (
        // Start of across word
        (j === 0 || grid[i][j - 1].isBlack) && 
        j < size - 1 && 
        !grid[i][j + 1].isBlack
      ) || (
        // Start of down word
        (i === 0 || grid[i - 1][j].isBlack) && 
        i < size - 1 && 
        !grid[i + 1][j].isBlack
      )

      if (needsNumber) {
        grid[i][j].number = number++
      }
    }
  }
}

function generateClues(
  grid: CrosswordCell[][],
  placedWords: Array<{
    word: string,
    row: number,
    col: number,
    direction: 'across' | 'down'
  }>,
  entries: CrosswordEntry[]
): CrosswordClue[] {
  const clues: CrosswordClue[] = []

  for (const { word, row, col, direction } of placedWords) {
    const entry = entries.find(e => e.word === word)
    if (entry && grid[row][col].number) {
      clues.push({
        number: grid[row][col].number!,
        text: entry.clue,
        answer: word,
        direction,
        startRow: row,
        startCol: col,
        length: word.length
      })
    }
  }

  return clues.sort((a, b) => 
    a.direction.localeCompare(b.direction) || a.number - b.number
  )
}

function calculateStats(
  grid: CrosswordCell[][],
  clues: CrosswordClue[]
): CrosswordPuzzle['stats'] {
  const wordCount = clues.length
  const totalLength = clues.reduce((sum, clue) => sum + clue.length, 0)
  const averageWordLength = totalLength / wordCount

  // Count intersections
  const intersectionCount = clues.reduce((count, clue) => {
    const otherClues = clues.filter(c => 
      c.direction !== clue.direction
    )

    for (const other of otherClues) {
      if (
        (clue.direction === 'across' && 
         other.startCol >= clue.startCol && 
         other.startCol < clue.startCol + clue.length &&
         clue.startRow >= other.startRow &&
         clue.startRow < other.startRow + other.length) ||
        (clue.direction === 'down' &&
         other.startRow >= clue.startRow &&
         other.startRow < clue.startRow + clue.length &&
         clue.startCol >= other.startCol &&
         clue.startCol < other.startCol + other.length)
      ) {
        count++
      }
    }
    return count
  }, 0)

  return {
    wordCount,
    averageWordLength,
    intersectionCount: intersectionCount / 2 // Each intersection is counted twice
  }
}

function generateHints(clues: CrosswordClue[], difficulty: string): string[] {
  const hints: string[] = []

  switch (difficulty) {
    case 'easy':
      hints.push('Some answers are common words you use every day')
      hints.push(`Look for ${clues.filter(c => c.direction === 'across').length} across words`)
      hints.push(`Look for ${clues.filter(c => c.direction === 'down').length} down words`)
      break

    case 'medium':
      hints.push('Pay attention to word length indicators in clues')
      hints.push('Fill in the shorter words first')
      break

    case 'hard':
      hints.push('Some clues may have multiple meanings')
      hints.push(`Average word length is ${Math.round(clues.reduce((sum, c) => sum + c.length, 0) / clues.length)} letters`)
      break
  }

  return hints
}

export async function generateCrossword(settings: CrosswordSettings): Promise<CrosswordPuzzle> {
  // Determine grid size based on difficulty
  const gridSize = settings.gridSize || {
    easy: 8,
    medium: 10,
    hard: 12
  }[settings.difficulty]

  // Filter words based on settings
  const availableWords = crosswordEntries.filter(entry => {
    if (entry.difficulty !== settings.difficulty) return false
    if (settings.theme && entry.theme !== settings.theme) return false
    if (settings.maxWordLength && entry.word.length > settings.maxWordLength) return false
    return true
  })

  if (availableWords.length === 0) {
    throw new Error('No words match the specified criteria')
  }

  // Create empty grid
  const grid = createEmptyGrid(gridSize)
  const placedWords: Array<{
    word: string,
    row: number,
    col: number,
    direction: 'across' | 'down'
  }> = []

  // Try to place words
  const shuffledWords = shuffleArray([...availableWords])
  for (const entry of shuffledWords) {
    const word = entry.word
    let placed = false
    let attempts = 0
    const maxAttempts = 50

    while (!placed && attempts < maxAttempts) {
      const direction = Math.random() < 0.5 ? 'across' : 'down'
      const row = Math.floor(Math.random() * gridSize)
      const col = Math.floor(Math.random() * gridSize)

      if (canPlaceWord(grid, word, row, col, direction)) {
        placeWord(grid, word, row, col, direction)
        placedWords.push({ word, row, col, direction })
        placed = true
      }

      attempts++
    }
  }

  // Fill remaining spaces with black cells
  fillBlackCells(grid, settings.symmetrical || false)
  if (settings.symmetrical) {
    makeSymmetrical(grid)
  }

  // Number the grid
  numberGrid(grid)

  // Generate clues
  const clues = generateClues(grid, placedWords, availableWords)

  // Calculate statistics
  const stats = calculateStats(grid, clues)

  // Generate hints if enabled
  const hints = settings.showHints
    ? generateHints(clues, settings.difficulty)
    : undefined

  // Create solution grid
  const solution = grid.map(row =>
    row.map(cell => cell.letter)
  )

  return {
    grid,
    clues,
    hints,
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    timeEstimate: clues.length * {
      easy: 30,
      medium: 45,
      hard: 60
    }[settings.difficulty],
    solution,
    theme: settings.theme,
    stats
  }
}
