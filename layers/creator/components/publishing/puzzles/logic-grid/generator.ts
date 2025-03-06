import type { LogicGridSettings, LogicGridPuzzle, LogicCategory, LogicClue, GridCell } from './types'
import { shuffleArray, getRandomItems } from '../utils'

// Sample categories and values
const sampleCategories: LogicCategory[] = [
  {
    name: 'Person',
    values: ['John', 'Mary', 'Peter', 'Sarah', 'David']
  },
  {
    name: 'Color',
    values: ['Red', 'Blue', 'Green', 'Yellow', 'Purple']
  },
  {
    name: 'Pet',
    values: ['Dog', 'Cat', 'Bird', 'Fish', 'Hamster']
  },
  {
    name: 'Hobby',
    values: ['Reading', 'Painting', 'Gaming', 'Cooking', 'Gardening']
  }
]

function createEmptyGrid(size: number): GridCell[][] {
  return Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => ({
      value: false,
      categories: [],
      values: []
    }))
  )
}

function generateSolution(categories: LogicCategory[]): boolean[][][] {
  const size = categories[0].values.length
  const solution = Array(categories.length - 1).fill(null).map(() =>
    Array(size).fill(null).map(() =>
      Array(size).fill(false)
    )
  )

  // Create a random valid solution
  const assignments = categories[0].values.map((_, i) => i)
  shuffleArray(assignments)

  // Fill the solution grid based on random assignments
  for (let catIdx = 0; catIdx < categories.length - 1; catIdx++) {
    for (let i = 0; i < size; i++) {
      solution[catIdx][i][assignments[i]] = true
    }
  }

  return solution
}

function generateClues(
  categories: LogicCategory[],
  solution: boolean[][][],
  difficulty: string
): LogicClue[] {
  const clues: LogicClue[] = []
  const size = categories[0].values.length

  // Generate positive clues (direct matches)
  const numPositiveClues = {
    easy: Math.floor(size * 0.5),
    medium: Math.floor(size * 0.3),
    hard: Math.floor(size * 0.2)
  }[difficulty]

  for (let catIdx = 0; catIdx < categories.length - 1; catIdx++) {
    for (let i = 0; i < size; i++) {
      const j = solution[catIdx][i].findIndex(val => val)
      if (Math.random() < numPositiveClues / size) {
        clues.push({
          type: 'positive',
          description: `${categories[0].values[i]} has ${categories[catIdx + 1].values[j]}`,
          categories: [categories[0].name, categories[catIdx + 1].name],
          values: [categories[0].values[i], categories[catIdx + 1].values[j]]
        })
      }
    }
  }

  // Generate negative clues
  const numNegativeClues = {
    easy: Math.floor(size * 0.3),
    medium: Math.floor(size * 0.4),
    hard: Math.floor(size * 0.5)
  }[difficulty]

  for (let catIdx = 0; catIdx < categories.length - 1; catIdx++) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!solution[catIdx][i][j] && Math.random() < numNegativeClues / (size * size)) {
          clues.push({
            type: 'negative',
            description: `${categories[0].values[i]} does not have ${categories[catIdx + 1].values[j]}`,
            categories: [categories[0].name, categories[catIdx + 1].name],
            values: [categories[0].values[i], categories[catIdx + 1].values[j]]
          })
        }
      }
    }
  }

  // Generate relative clues
  if (difficulty !== 'easy') {
    const numRelativeClues = {
      medium: Math.floor(size * 0.2),
      hard: Math.floor(size * 0.3)
    }[difficulty]

    for (let catIdx = 0; catIdx < categories.length - 1; catIdx++) {
      for (let i = 0; i < size - 1; i++) {
        if (Math.random() < numRelativeClues / size) {
          const j1 = solution[catIdx][i].findIndex(val => val)
          const j2 = solution[catIdx][i + 1].findIndex(val => val)
          clues.push({
            type: 'relative',
            description: `${categories[catIdx + 1].values[j1]} comes before ${categories[catIdx + 1].values[j2]}`,
            categories: [categories[catIdx + 1].name],
            values: [categories[catIdx + 1].values[j1], categories[catIdx + 1].values[j2]],
            relation: 'before'
          })
        }
      }
    }
  }

  return shuffleArray(clues)
}

function generatePartialSolution(
  solution: boolean[][][],
  difficulty: string
): boolean[][][] {
  const partial = JSON.parse(JSON.stringify(solution))
  const revealPercentage = {
    easy: 0.3,
    medium: 0.2,
    hard: 0.1
  }[difficulty]

  for (let i = 0; i < partial.length; i++) {
    for (let j = 0; j < partial[i].length; j++) {
      for (let k = 0; k < partial[i][j].length; k++) {
        if (Math.random() > revealPercentage) {
          partial[i][j][k] = false
        }
      }
    }
  }

  return partial
}

export async function generateLogicGrid(settings: LogicGridSettings): Promise<LogicGridPuzzle> {
  // Determine grid size based on difficulty
  const gridSize = settings.gridSize || {
    easy: 3,
    medium: 4,
    hard: 5
  }[settings.difficulty]

  // Select categories
  const categoryCount = settings.categoryCount || {
    easy: 3,
    medium: 3,
    hard: 4
  }[settings.difficulty]

  const selectedCategories = getRandomItems(sampleCategories, categoryCount)
    .map(cat => ({
      ...cat,
      values: getRandomItems(cat.values, gridSize)
    }))

  // Generate solution
  const solution = generateSolution(selectedCategories)

  // Generate clues
  const clues = generateClues(selectedCategories, solution, settings.difficulty)

  // Create empty grid
  const grid = createEmptyGrid(gridSize)

  // Generate partial solution for hints
  const partialSolution = settings.showHints
    ? generatePartialSolution(solution, settings.difficulty)
    : undefined

  // Generate hints
  const hints = settings.showHints ? [
    'Start by marking the definite matches from positive clues',
    'Use negative clues to eliminate possibilities',
    'Look for patterns in the relative clues',
    `There are ${clues.filter(c => c.type === 'positive').length} direct matches to find`
  ] : undefined

  return {
    categories: selectedCategories,
    clues,
    grid,
    hints,
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    timeEstimate: gridSize * clues.length * {
      easy: 15,
      medium: 20,
      hard: 30
    }[settings.difficulty],
    solution,
    partialSolution
  }
}
