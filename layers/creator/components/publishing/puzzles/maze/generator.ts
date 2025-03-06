import type { MazeSettings, MazePuzzle, MazeCell } from './types'
import { shuffleArray } from '../utils'

// Theme-based collectible types
const collectibleSets = {
  fantasy: [
    { type: 'gem', value: 10 },
    { type: 'coin', value: 5 },
    { type: 'key', value: 15 },
    { type: 'potion', value: 20 }
  ],
  space: [
    { type: 'star', value: 10 },
    { type: 'meteor', value: 5 },
    { type: 'planet', value: 15 },
    { type: 'satellite', value: 20 }
  ],
  nature: [
    { type: 'flower', value: 10 },
    { type: 'leaf', value: 5 },
    { type: 'fruit', value: 15 },
    { type: 'crystal', value: 20 }
  ]
}

function createEmptyGrid(rows: number, cols: number): MazeCell[][] {
  return Array(rows).fill(null).map((_, row) =>
    Array(cols).fill(null).map((_, col) => ({
      row,
      col,
      walls: {
        top: true,
        right: true,
        bottom: true,
        left: true
      },
      visited: false,
      isStart: false,
      isEnd: false,
      isPath: false
    }))
  )
}

function getNeighbors(
  cell: MazeCell,
  grid: MazeCell[][],
  allowDiagonal: boolean
): MazeCell[] {
  const { row, col } = cell
  const rows = grid.length
  const cols = grid[0].length
  const neighbors: MazeCell[] = []

  // Orthogonal neighbors
  const directions = [
    { dr: -1, dc: 0 }, // top
    { dr: 0, dc: 1 },  // right
    { dr: 1, dc: 0 },  // bottom
    { dr: 0, dc: -1 }  // left
  ]

  if (allowDiagonal) {
    directions.push(
      { dr: -1, dc: -1 }, // top-left
      { dr: -1, dc: 1 },  // top-right
      { dr: 1, dc: -1 },  // bottom-left
      { dr: 1, dc: 1 }    // bottom-right
    )
  }

  for (const { dr, dc } of directions) {
    const newRow = row + dr
    const newCol = col + dc
    if (
      newRow >= 0 && newRow < rows &&
      newCol >= 0 && newCol < cols
    ) {
      neighbors.push(grid[newRow][newCol])
    }
  }

  return neighbors
}

function removeWall(cell1: MazeCell, cell2: MazeCell): void {
  const rowDiff = cell2.row - cell1.row
  const colDiff = cell2.col - cell1.col

  if (rowDiff === 1) {
    cell1.walls.bottom = false
    cell2.walls.top = false
  } else if (rowDiff === -1) {
    cell1.walls.top = false
    cell2.walls.bottom = false
  }

  if (colDiff === 1) {
    cell1.walls.right = false
    cell2.walls.left = false
  } else if (colDiff === -1) {
    cell1.walls.left = false
    cell2.walls.right = false
  }
}

function generateMazeDepthFirst(
  grid: MazeCell[][],
  start: MazeCell
): void {
  const stack: MazeCell[] = [start]
  start.visited = true

  while (stack.length > 0) {
    const current = stack[stack.length - 1]
    const unvisitedNeighbors = getNeighbors(current, grid, false)
      .filter(n => !n.visited)

    if (unvisitedNeighbors.length === 0) {
      stack.pop()
    } else {
      const next = shuffleArray(unvisitedNeighbors)[0]
      removeWall(current, next)
      next.visited = true
      stack.push(next)
    }
  }
}

function findPath(
  grid: MazeCell[][],
  start: MazeCell,
  end: MazeCell,
  allowDiagonal: boolean
): MazeCell[] {
  const queue: { cell: MazeCell; path: MazeCell[] }[] = [
    { cell: start, path: [start] }
  ]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const { cell, path } = queue.shift()!
    const key = `${cell.row},${cell.col}`

    if (cell === end) {
      return path
    }

    if (!visited.has(key)) {
      visited.add(key)
      const neighbors = getNeighbors(cell, grid, allowDiagonal)
        .filter(n => {
          const canMove = !visited.has(`${n.row},${n.col}`)
          if (!allowDiagonal) {
            // Check walls for orthogonal movement
            const rowDiff = n.row - cell.row
            const colDiff = n.col - cell.col
            if (rowDiff === 1) return !cell.walls.bottom
            if (rowDiff === -1) return !cell.walls.top
            if (colDiff === 1) return !cell.walls.right
            if (colDiff === -1) return !cell.walls.left
          }
          return canMove
        })

      for (const neighbor of neighbors) {
        queue.push({
          cell: neighbor,
          path: [...path, neighbor]
        })
      }
    }
  }

  return [] // No path found
}

function calculateBranchingFactor(grid: MazeCell[][]): number {
  let totalJunctions = 0
  let totalChoices = 0

  for (const row of grid) {
    for (const cell of row) {
      const choices = getNeighbors(cell, grid, false)
        .filter(n => {
          const rowDiff = n.row - cell.row
          const colDiff = n.col - cell.col
          if (rowDiff === 1) return !cell.walls.bottom
          if (rowDiff === -1) return !cell.walls.top
          if (colDiff === 1) return !cell.walls.right
          if (colDiff === -1) return !cell.walls.left
          return false
        })
        .length

      if (choices > 2) {
        totalJunctions++
        totalChoices += choices
      }
    }
  }

  return totalJunctions > 0
    ? totalChoices / totalJunctions
    : 1
}

function countDeadEnds(grid: MazeCell[][]): number {
  let deadEnds = 0

  for (const row of grid) {
    for (const cell of row) {
      const exits = getNeighbors(cell, grid, false)
        .filter(n => {
          const rowDiff = n.row - cell.row
          const colDiff = n.col - cell.col
          if (rowDiff === 1) return !cell.walls.bottom
          if (rowDiff === -1) return !cell.walls.top
          if (colDiff === 1) return !cell.walls.right
          if (colDiff === -1) return !cell.walls.left
          return false
        })
        .length

      if (exits === 1 && !cell.isStart && !cell.isEnd) {
        deadEnds++
      }
    }
  }

  return deadEnds
}

function generateHints(
  grid: MazeCell[][],
  solution: MazeCell[],
  settings: MazeSettings
): string[] {
  const hints: string[] = []

  // Add general hints
  switch (settings.difficulty) {
    case 'easy':
      hints.push('Follow the main path')
      hints.push('Avoid dead ends')
      break

    case 'medium':
      hints.push('Look for patterns in the walls')
      hints.push('Remember your path')
      break

    case 'hard':
      hints.push('Multiple paths may lead to the end')
      hints.push('Watch out for loops and backtracking')
      break
  }

  // Add specific hints
  if (settings.showDistances) {
    hints.push('Numbers show distance from start')
  }

  if (settings.collectibles) {
    hints.push('Collect items for bonus points')
  }

  return hints
}

function placeCollectibles(
  grid: MazeCell[][],
  solution: MazeCell[],
  settings: MazeSettings
): MazePuzzle['collectibles'] {
  if (!settings.collectibles) return undefined

  const theme = settings.theme || 'fantasy'
  const items = collectibleSets[theme as keyof typeof collectibleSets]
  if (!items) return undefined

  const collectibles: NonNullable<MazePuzzle['collectibles']> = []
  const solutionSet = new Set(solution.map(cell => `${cell.row},${cell.col}`))
  const positions = shuffleArray(
    grid.flat()
      .filter(cell => 
        !cell.isStart &&
        !cell.isEnd &&
        !solutionSet.has(`${cell.row},${cell.col}`)
      )
  ).slice(0, items.length)

  for (let i = 0; i < positions.length; i++) {
    const cell = positions[i]
    const item = items[i]
    collectibles.push({
      position: { row: cell.row, col: cell.col },
      ...item,
      collected: false
    })
  }

  return collectibles
}

export async function generateMaze(settings: MazeSettings): Promise<MazePuzzle> {
  // Determine grid size
  const gridSize = settings.gridSize || {
    easy: { rows: 8, cols: 8 },
    medium: { rows: 12, cols: 12 },
    hard: { rows: 16, cols: 16 }
  }[settings.difficulty]

  // Create grid
  const grid = createEmptyGrid(gridSize.rows, gridSize.cols)

  // Set start and end points
  const start = grid[0][0]
  const end = grid[gridSize.rows - 1][gridSize.cols - 1]
  start.isStart = true
  end.isEnd = true

  // Generate maze using selected algorithm
  const algorithm = settings.algorithm || 'depthFirst'
  switch (algorithm) {
    case 'depthFirst':
      generateMazeDepthFirst(grid, start)
      break
    // Add other algorithms as needed
  }

  // Find solution path
  const solution = findPath(
    grid,
    start,
    end,
    settings.allowDiagonal || false
  )

  // Mark solution path
  solution.forEach(cell => {
    cell.isPath = true
  })

  // Calculate statistics
  const branchingFactor = calculateBranchingFactor(grid)
  const deadEnds = countDeadEnds(grid)
  const complexity = Math.round(
    (gridSize.rows * gridSize.cols * 0.3) +
    (branchingFactor * 20) +
    (deadEnds * 5) +
    (settings.allowDiagonal ? 50 : 0)
  )

  // Generate hints if enabled
  const hints = settings.showHints
    ? generateHints(grid, solution, settings)
    : undefined

  // Place collectibles if enabled
  const collectibles = placeCollectibles(grid, solution, settings)

  // Generate rules
  const rules = {
    movement: [
      'Move from start to end',
      'Cannot pass through walls'
    ],
    scoringSystem: [
      'Faster completion = better score',
      `Perfect score: ${solution.length} moves`
    ],
    bonusPoints: []
  }

  if (settings.allowDiagonal) {
    rules.movement.push('Diagonal movement allowed')
  }

  if (settings.collectibles) {
    rules.movement.push('Collect items for bonus points')
    rules.bonusPoints!.push('Bonus for collecting all items')
  }

  return {
    grid,
    hints,
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    timeEstimate: complexity * {
      easy: 1,
      medium: 2,
      hard: 3
    }[settings.difficulty],
    theme: settings.theme,
    start: { row: start.row, col: start.col },
    end: { row: end.row, col: end.col },
    stats: {
      gridSize,
      shortestPath: solution.length,
      deadEnds,
      branchingFactor,
      complexity
    },
    rules,
    solution: {
      path: solution.map(cell => ({
        row: cell.row,
        col: cell.col
      }))
    },
    collectibles
  }
}
