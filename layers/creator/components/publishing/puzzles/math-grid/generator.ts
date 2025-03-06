interface MathOperation {
  operator: '+' | '-' | '×' | '÷'
  difficulty: 'easy' | 'medium' | 'hard'
}

interface MathGridCell {
  value: number
  isGiven: boolean
  operation?: MathOperation
}

interface MathGridSettings {
  gridSize: 4 | 5 | 6 | 7 | 8 | 9
  operations: MathOperation[]
  difficulty: 'easy' | 'medium' | 'hard'
  textColor?: string
  backgroundColor?: string
  borderColor?: string
  fontSize?: 'small' | 'medium' | 'large'
  showHints?: boolean
  printLayout?: 'compact' | 'spacious'
  theme?: string
}

interface MathGridPuzzle {
  grid: MathGridCell[][]
  solution: number[][]
  operations: MathOperation[]
  settings: MathGridSettings
}

const generateNumberInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const applyOperation = (a: number, b: number, operation: MathOperation): number | null => {
  switch (operation.operator) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '×':
      return a * b
    case '÷':
      return b !== 0 && a % b === 0 ? a / b : null
  }
}

const getDifficultyRanges = (operation: MathOperation): { min: number; max: number } => {
  const ranges = {
    '+': {
      easy: { min: 1, max: 20 },
      medium: { min: 10, max: 50 },
      hard: { min: 20, max: 100 }
    },
    '-': {
      easy: { min: 1, max: 20 },
      medium: { min: 10, max: 50 },
      hard: { min: 20, max: 100 }
    },
    '×': {
      easy: { min: 1, max: 10 },
      medium: { min: 2, max: 12 },
      hard: { min: 5, max: 15 }
    },
    '÷': {
      easy: { min: 1, max: 10 },
      medium: { min: 2, max: 12 },
      hard: { min: 5, max: 15 }
    }
  }

  return ranges[operation.operator][operation.difficulty]
}

const generateValidOperation = (
  value: number,
  operation: MathOperation,
  existingValues: number[]
): { operand: number; result: number } | null => {
  const { min, max } = getDifficultyRanges(operation)
  const attempts = 20 // Prevent infinite loops

  for (let i = 0; i < attempts; i++) {
    const operand = generateNumberInRange(min, max)
    const result = applyOperation(value, operand, operation)

    if (
      result !== null &&
      result >= 0 &&
      Number.isInteger(result) &&
      !existingValues.includes(result)
    ) {
      return { operand, result }
    }
  }

  return null
}

const generateGrid = (settings: MathGridSettings): MathGridPuzzle => {
  const { gridSize, operations, difficulty } = settings
  const grid: MathGridCell[][] = Array(gridSize)
    .fill(null)
    .map(() =>
      Array(gridSize)
        .fill(null)
        .map(() => ({ value: 0, isGiven: false }))
    )
  const solution: number[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(0))

  // Generate initial values
  const usedValues = new Set<number>()
  const initialCells = Math.floor((gridSize * gridSize) / 3) // Start with ~1/3 of cells filled

  for (let i = 0; i < initialCells; i++) {
    let attempts = 20
    while (attempts > 0) {
      const row = Math.floor(Math.random() * gridSize)
      const col = Math.floor(Math.random() * gridSize)

      if (!grid[row][col].isGiven) {
        const value = generateNumberInRange(1, gridSize * 10)
        if (!usedValues.has(value)) {
          grid[row][col].value = value
          grid[row][col].isGiven = true
          solution[row][col] = value
          usedValues.add(value)
          break
        }
      }
      attempts--
    }
  }

  // Fill remaining cells with operations
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (!grid[row][col].isGiven) {
        const operation =
          operations[Math.floor(Math.random() * operations.length)]
        
        // Try to find a valid operation using nearby cells
        let validOperation = null
        const nearbyValues: number[] = []

        // Check horizontally and vertically adjacent cells
        if (col > 0) nearbyValues.push(solution[row][col - 1])
        if (row > 0) nearbyValues.push(solution[row - 1][col])

        for (const nearbyValue of nearbyValues) {
          validOperation = generateValidOperation(
            nearbyValue,
            operation,
            Array.from(usedValues)
          )
          if (validOperation) break
        }

        if (validOperation) {
          const { result } = validOperation
          grid[row][col].value = result
          grid[row][col].operation = operation
          solution[row][col] = result
          usedValues.add(result)
        } else {
          // Fallback: generate a random valid number
          let value = generateNumberInRange(1, gridSize * 10)
          while (usedValues.has(value)) {
            value = generateNumberInRange(1, gridSize * 10)
          }
          grid[row][col].value = value
          grid[row][col].isGiven = true
          solution[row][col] = value
          usedValues.add(value)
        }
      }
    }
  }

  return {
    grid,
    solution,
    operations,
    settings
  }
}

export const generateMathGrid = async (settings: MathGridSettings): Promise<MathGridPuzzle> => {
  return generateGrid(settings)
}
