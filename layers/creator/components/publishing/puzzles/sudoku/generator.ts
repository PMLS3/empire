interface SudokuSettings {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  size: 9 | 4 | 6  // Standard 9x9, 4x4 for kids, 6x6 for intermediate
  textColor: string
  backgroundColor: string
  accentColor: string
  numberColor: string
  fontSize: 'small' | 'medium' | 'large'
  printLayout: 'compact' | 'spacious'
  showGuidelines: boolean
  showCandidates: boolean
  highlightRegions: boolean
  cellSize: 'small' | 'medium' | 'large'
  gridStyle: 'classic' | 'modern' | 'minimal'
  symmetrical: boolean
  showHints: boolean
  category: string
  variant: string
  highlightColor: string
}

interface SudokuCell {
  value: number
  given: boolean
  candidates: number[]
  row: number
  col: number
  block: number
}

interface SudokuPuzzle {
  grid: SudokuCell[][]
  solution: number[][]
  difficulty: string
  numGivens: number
  symmetrical: boolean
  uniqueSolution: boolean
  hints?: string[]
  category: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  timeEstimate: number
  stats: {
    givenCount: number
    singleCandidates: number
    nakedPairs: number
    hiddenPairs: number
    complexity: number
  }
  variant: string
}

export class SudokuGenerator {
  private settings: SudokuSettings
  private size: number
  private boxSize: number

  constructor(settings: SudokuSettings) {
    this.settings = settings
    this.size = settings.size
    this.boxSize = Math.sqrt(settings.size)
  }

  async generate(): Promise<SudokuPuzzle> {
    return await generateSudoku(this.settings)
  }

  getCellSize(): number {
    const sizes = {
      small: 32,
      medium: 40,
      large: 48
    }
    return sizes[this.settings.cellSize]
  }

  getFontSize(): string {
    const sizes = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.25rem'
    }
    return sizes[this.settings.fontSize]
  }

  getGridStyles(): Record<string, string> {
    const styles: Record<string, Record<string, string>> = {
      classic: {
        borderColor: this.settings.accentColor,
        backgroundColor: this.settings.backgroundColor,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      },
      modern: {
        borderColor: `${this.settings.accentColor}40`,
        backgroundColor: this.settings.backgroundColor,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      },
      minimal: {
        borderColor: this.settings.accentColor,
        backgroundColor: 'transparent',
        boxShadow: 'none'
      }
    }
    return styles[this.settings.gridStyle]
  }
}

async function generateSudoku(settings: SudokuSettings): Promise<SudokuPuzzle> {
  // Generate complete solution
  const solution = generateSolution()

  // Create initial grid with all numbers
  const grid = solution.map(row =>
    row.map(value => ({
      value,
      given: true
    }))
  )

  // Determine number of cells to remove
  const cellsToRemove = {
    easy: 40,
    medium: 50,
    hard: 60
  }[settings.difficulty]

  // Remove numbers while maintaining unique solution
  removeNumbers(
    grid,
    solution,
    cellsToRemove,
    settings.symmetrical || false
  )

  // Analyze puzzle complexity
  const stats = analyzeComplexity(grid, solution)

  // Generate hints if enabled
  const hints = settings.showHints
    ? generateHints(stats, settings.variant || 'classic', settings.difficulty)
    : undefined

  return {
    grid,
    hints,
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    timeEstimate: stats.complexity * {
      easy: 1,
      medium: 2,
      hard: 3
    }[settings.difficulty],
    solution: solution,
    variant: settings.variant || 'classic',
    stats
  }
}

function createEmptyGrid(): SudokuCell[][] {
  return Array(9).fill(null).map(() =>
    Array(9).fill(null).map(() => ({
      value: 0,
      given: false
    }))
  )
}

function isValid(grid: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false
  }

  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3
  const startCol = Math.floor(col / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num) return false
    }
  }

  // Check diagonal for diagonal variant
  if (grid[0][0] !== 0 && row === col) {
    for (let i = 0; i < 9; i++) {
      if (grid[i][i] === num) return false
    }
  }

  return true
}

function solveSudoku(grid: number[][]): boolean {
  let row = -1
  let col = -1
  let isEmpty = false

  // Find empty cell
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === 0) {
        row = i
        col = j
        isEmpty = true
        break
      }
    }
    if (isEmpty) break
  }

  // No empty cell found, puzzle is solved
  if (!isEmpty) return true

  // Try digits 1-9
  for (let num = 1; num <= 9; num++) {
    if (isValid(grid, row, col, num)) {
      grid[row][col] = num

      if (solveSudoku(grid)) {
        return true
      }

      grid[row][col] = 0
    }
  }

  return false
}

function generateSolution(): number[][] {
  const grid = Array(9).fill(0).map(() => Array(9).fill(0))
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  // Fill diagonal boxes first (they're independent)
  for (let box = 0; box < 9; box += 3) {
    const shuffledNumbers = shuffleArray([...numbers])
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        grid[box + i][box + j] = shuffledNumbers[i * 3 + j]
      }
    }
  }

  // Solve the rest
  solveSudoku(grid)
  return grid
}

function removeNumbers(
  grid: SudokuCell[][],
  solution: number[][],
  count: number,
  symmetrical: boolean
): void {
  const positions = []
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      positions.push([i, j])
    }
  }
  shuffleArray(positions)

  let removed = 0
  for (const [row, col] of positions) {
    if (removed >= count) break
    if (!grid[row][col].given) continue

    if (symmetrical) {
      const symRow = 8 - row
      const symCol = 8 - col
      if (!grid[symRow][symCol].given) continue

      grid[row][col].value = 0
      grid[row][col].given = false
      grid[symRow][symCol].value = 0
      grid[symRow][symCol].given = false
      removed += 2
    } else {
      grid[row][col].value = 0
      grid[row][col].given = false
      removed++
    }

    // Verify puzzle still has unique solution
    const testGrid = grid.map(row =>
      row.map(cell => cell.value)
    )
    const solutions = countSolutions(testGrid)
    
    if (solutions !== 1) {
      // Restore the number(s)
      grid[row][col].value = solution[row][col]
      grid[row][col].given = true
      if (symmetrical) {
        grid[8 - row][8 - col].value = solution[8 - row][8 - col]
        grid[8 - row][8 - col].given = true
      }
      removed -= symmetrical ? 2 : 1
    }
  }
}

function countSolutions(grid: number[][]): number {
  let count = 0
  const maxSolutions = 2 // We only need to know if there's more than one solution

  function solve(row: number, col: number): void {
    if (count >= maxSolutions) return
    
    if (row === 9) {
      count++
      return
    }

    const nextRow = col === 8 ? row + 1 : row
    const nextCol = col === 8 ? 0 : col + 1

    if (grid[row][col] !== 0) {
      solve(nextRow, nextCol)
    } else {
      for (let num = 1; num <= 9; num++) {
        if (isValid(grid, row, col, num)) {
          grid[row][col] = num
          solve(nextRow, nextCol)
          grid[row][col] = 0
        }
      }
    }
  }

  solve(0, 0)
  return count
}

function analyzeComplexity(
  grid: SudokuCell[][],
  solution: number[][]
): SudokuPuzzle['stats'] {
  let singleCandidates = 0
  let nakedPairs = 0
  let hiddenPairs = 0
  let complexity = 0

  // Count given numbers
  const givenCount = grid.reduce((count, row) =>
    count + row.filter(cell => cell.given).length,
    0
  )

  // Analyze each empty cell
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (!grid[row][col].given) {
        const candidates = []
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid.map(r => r.map(c => c.value)), row, col, num)) {
            candidates.push(num)
          }
        }

        if (candidates.length === 1) {
          singleCandidates++
        }
      }
    }
  }

  // Calculate overall complexity
  complexity = Math.round(
    (81 - givenCount) * 10 +
    (9 - singleCandidates) * 20 +
    nakedPairs * 30 +
    hiddenPairs * 40
  )

  return {
    givenCount,
    singleCandidates,
    nakedPairs,
    hiddenPairs,
    complexity
  }
}

function generateHints(
  stats: SudokuPuzzle['stats'],
  variant: string,
  difficulty: string
): string[] {
  const hints: string[] = []

  switch (difficulty) {
    case 'easy':
      hints.push('Look for cells with only one possible number')
      hints.push(`There are ${stats.singleCandidates} cells with only one possible value`)
      break

    case 'medium':
      hints.push('Use scanning techniques to find single candidates')
      hints.push('Look for naked pairs in rows and columns')
      break

    case 'hard':
      hints.push('Consider advanced techniques like hidden pairs')
      if (variant === 'diagonal') {
        hints.push('Remember that diagonals must also contain numbers 1-9')
      }
      break
  }

  return hints
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export { generateSudoku }
export type { SudokuSettings, SudokuCell, SudokuPuzzle }
