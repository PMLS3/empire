import type { NumberSequenceSettings, NumberSequencePuzzle, SequenceRule, NumberSequence } from './types'
import { getRandomItems } from '../utils'

// Sample sequence rules database
const sequenceRules: Record<SequenceRule['type'], SequenceRule[]> = {
  arithmetic: [
    {
      type: 'arithmetic',
      description: 'Add a constant difference',
      formula: 'an = a1 + (n-1)d',
      example: '2, 4, 6, 8, 10 (d=2)',
      complexity: 2
    },
    {
      type: 'arithmetic',
      description: 'Subtract a constant difference',
      formula: 'an = a1 - (n-1)d',
      example: '10, 7, 4, 1, -2 (d=3)',
      complexity: 2
    }
  ],
  geometric: [
    {
      type: 'geometric',
      description: 'Multiply by a constant ratio',
      formula: 'an = a1 * r^(n-1)',
      example: '2, 4, 8, 16, 32 (r=2)',
      complexity: 4
    },
    {
      type: 'geometric',
      description: 'Divide by a constant ratio',
      formula: 'an = a1 / r^(n-1)',
      example: '32, 16, 8, 4, 2 (r=2)',
      complexity: 4
    }
  ],
  fibonacci: [
    {
      type: 'fibonacci',
      description: 'Each number is the sum of the two preceding ones',
      formula: 'an = an-1 + an-2',
      example: '1, 1, 2, 3, 5, 8, 13',
      complexity: 6
    }
  ],
  square: [
    {
      type: 'square',
      description: 'Square numbers',
      formula: 'an = n^2',
      example: '1, 4, 9, 16, 25',
      complexity: 3
    }
  ],
  cube: [
    {
      type: 'cube',
      description: 'Cube numbers',
      formula: 'an = n^3',
      example: '1, 8, 27, 64, 125',
      complexity: 5
    }
  ],
  prime: [
    {
      type: 'prime',
      description: 'Prime numbers',
      formula: 'nth prime number',
      example: '2, 3, 5, 7, 11',
      complexity: 7
    }
  ],
  custom: [
    {
      type: 'custom',
      description: 'Alternating addition and multiplication',
      formula: 'Alternate between +n and *n',
      example: '2, 3, 6, 7, 14 (+1, *2)',
      complexity: 8
    }
  ]
}

function generateArithmeticSequence(
  length: number,
  settings: NumberSequenceSettings
): number[] {
  const start = Math.floor(Math.random() * (settings.maxStartNumber || 10))
  const difference = Math.floor(Math.random() * (settings.maxDifference || 5)) + 1
  
  return Array(length).fill(0).map((_, i) => 
    settings.allowNegatives || start >= 0
      ? start + i * difference
      : Math.abs(start + i * difference)
  )
}

function generateGeometricSequence(
  length: number,
  settings: NumberSequenceSettings
): number[] {
  const start = Math.floor(Math.random() * (settings.maxStartNumber || 5)) + 1
  const ratio = Math.floor(Math.random() * 2) + 2 // 2 or 3
  
  return Array(length).fill(0).map((_, i) => start * Math.pow(ratio, i))
}

function generateFibonacciSequence(length: number): number[] {
  const sequence = [1, 1]
  while (sequence.length < length) {
    sequence.push(sequence[sequence.length - 1] + sequence[sequence.length - 2])
  }
  return sequence
}

function generateSquareSequence(length: number): number[] {
  return Array(length).fill(0).map((_, i) => Math.pow(i + 1, 2))
}

function generateCubeSequence(length: number): number[] {
  return Array(length).fill(0).map((_, i) => Math.pow(i + 1, 3))
}

function generatePrimeSequence(length: number): number[] {
  const primes = [2]
  let num = 3
  
  while (primes.length < length) {
    if (primes.every(prime => num % prime !== 0)) {
      primes.push(num)
    }
    num += 2
  }
  
  return primes
}

function generateCustomSequence(
  length: number,
  settings: NumberSequenceSettings
): number[] {
  const start = Math.floor(Math.random() * (settings.maxStartNumber || 5)) + 1
  const addend = Math.floor(Math.random() * 3) + 1
  const multiplier = Math.floor(Math.random() * 2) + 2
  
  const sequence = [start]
  for (let i = 1; i < length; i++) {
    sequence.push(
      i % 2 === 0
        ? sequence[i - 1] + addend
        : sequence[i - 1] * multiplier
    )
  }
  
  return sequence
}

function generateSequence(
  rule: SequenceRule,
  settings: NumberSequenceSettings
): NumberSequence {
  const length = settings.sequenceLength || {
    easy: 5,
    medium: 7,
    hard: 9
  }[settings.difficulty]

  let numbers: number[]
  switch (rule.type) {
    case 'arithmetic':
      numbers = generateArithmeticSequence(length, settings)
      break
    case 'geometric':
      numbers = generateGeometricSequence(length, settings)
      break
    case 'fibonacci':
      numbers = generateFibonacciSequence(length)
      break
    case 'square':
      numbers = generateSquareSequence(length)
      break
    case 'cube':
      numbers = generateCubeSequence(length)
      break
    case 'prime':
      numbers = generatePrimeSequence(length)
      break
    case 'custom':
      numbers = generateCustomSequence(length, settings)
      break
    default:
      numbers = generateArithmeticSequence(length, settings)
  }

  // Generate missing indices
  const missingCount = settings.missingCount || {
    easy: 1,
    medium: 2,
    hard: 3
  }[settings.difficulty]

  const missingIndices = getRandomItems(
    Array(length).fill(0).map((_, i) => i),
    missingCount
  )

  return {
    numbers,
    missingIndices,
    rule,
    explanation: rule.description
  }
}

function calculateStats(sequences: NumberSequence[]): NumberSequencePuzzle['stats'] {
  const allNumbers = sequences.flatMap(s => s.numbers)
  const complexities = sequences.map(s => s.rule.complexity)
  
  return {
    totalSequences: sequences.length,
    averageComplexity: complexities.reduce((a, b) => a + b) / complexities.length,
    patternTypes: sequences.map(s => s.rule.type),
    numberRange: [Math.min(...allNumbers), Math.max(...allNumbers)]
  }
}

export async function generateNumberSequence(settings: NumberSequenceSettings): Promise<NumberSequencePuzzle> {
  // Select sequence rules based on difficulty
  const availableRules = settings.ruleTypes
    ? settings.ruleTypes.flatMap(type => sequenceRules[type])
    : Object.values(sequenceRules).flat()

  const ruleCount = {
    easy: 1,
    medium: 2,
    hard: 3
  }[settings.difficulty]

  // Filter rules by complexity based on difficulty
  const filteredRules = availableRules.filter(rule => {
    switch (settings.difficulty) {
      case 'easy':
        return rule.complexity <= 3
      case 'medium':
        return rule.complexity <= 6
      case 'hard':
        return true
    }
  })

  const selectedRules = getRandomItems(filteredRules, ruleCount)

  // Generate sequences
  const sequences = selectedRules.map(rule => 
    generateSequence(rule, settings)
  )

  // Calculate stats
  const stats = calculateStats(sequences)

  return {
    sequences,
    hints: settings.showHints ? sequences.map(s => 
      settings.difficulty === 'easy'
        ? s.rule.example
        : s.rule.description
    ) : undefined,
    difficulty: settings.difficulty,
    category: settings.category,
    timeEstimate: sequences.length * {
      easy: 60,
      medium: 90,
      hard: 120
    }[settings.difficulty],
    solution: sequences.map(s => 
      s.missingIndices.map(i => s.numbers[i])
    ),
    stats,
    learningPoints: {
      patterns: [
        'Look for constant differences or ratios',
        'Check if numbers are being squared or cubed',
        'Consider special sequences like Fibonacci'
      ],
      mathConcepts: [
        'Arithmetic sequences have constant differences',
        'Geometric sequences have constant ratios',
        'Some sequences follow mathematical formulas'
      ],
      problemSolving: [
        'Break down the pattern into steps',
        'Test your pattern with the given numbers',
        'Verify your answer fits the sequence'
      ],
      formulas: settings.includeFormulas ? sequences.map(s => s.rule.formula).filter(Boolean) : undefined
    },
    assessment: {
      criteria: [
        'Pattern recognition',
        'Mathematical reasoning',
        'Problem-solving approach',
        'Speed and accuracy'
      ],
      scoring: [
        {
          category: 'Pattern Identification',
          points: 2,
          description: 'Correctly identify the sequence pattern'
        },
        {
          category: 'Missing Numbers',
          points: 3,
          description: 'Find all missing numbers in the sequence'
        },
        {
          category: 'Time Management',
          points: 1,
          description: 'Complete within the estimated time'
        }
      ]
    },
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor
  }
}
