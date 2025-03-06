import type { MathSequenceSettings, MathSequencePuzzle, SequenceRule } from './types'
import { getRandomItems } from '../utils'

// Sample sequence rules
const sequenceRules: SequenceRule[] = [
  {
    type: 'arithmetic',
    description: 'Add a constant number',
    parameters: {
      start: 2,
      difference: 3
    }
  },
  {
    type: 'geometric',
    description: 'Multiply by a constant number',
    parameters: {
      start: 2,
      ratio: 2
    }
  },
  {
    type: 'fibonacci',
    description: 'Each number is the sum of the two preceding ones',
    parameters: {
      start: 1
    }
  },
  {
    type: 'square',
    description: 'Square numbers',
    parameters: {
      customFn: (n: number) => n * n
    }
  },
  {
    type: 'cube',
    description: 'Cube numbers',
    parameters: {
      customFn: (n: number) => n * n * n
    }
  },
  {
    type: 'custom',
    description: 'Triangular numbers',
    formula: 'n * (n + 1) / 2',
    parameters: {
      customFn: (n: number) => (n * (n + 1)) / 2
    }
  }
]

function generateSequence(rule: SequenceRule, length: number, maxValue: number): number[] {
  const sequence: number[] = []
  
  switch (rule.type) {
    case 'arithmetic':
      if (rule.parameters?.start !== undefined && rule.parameters?.difference !== undefined) {
        for (let i = 0; i < length; i++) {
          const value = rule.parameters.start + i * rule.parameters.difference
          if (value > maxValue) break
          sequence.push(value)
        }
      }
      break

    case 'geometric':
      if (rule.parameters?.start !== undefined && rule.parameters?.ratio !== undefined) {
        for (let i = 0; i < length; i++) {
          const value = rule.parameters.start * Math.pow(rule.parameters.ratio, i)
          if (value > maxValue) break
          sequence.push(value)
        }
      }
      break

    case 'fibonacci':
      sequence.push(1, 1)
      for (let i = 2; i < length; i++) {
        const value = sequence[i - 1] + sequence[i - 2]
        if (value > maxValue) break
        sequence.push(value)
      }
      break

    case 'square':
    case 'cube':
    case 'custom':
      if (rule.parameters?.customFn) {
        for (let i = 1; i <= length; i++) {
          const value = rule.parameters.customFn(i)
          if (value > maxValue) break
          sequence.push(value)
        }
      }
      break
  }

  return sequence
}

function generateHints(rule: SequenceRule, difficulty: string): string[] {
  const hints: string[] = []

  switch (difficulty) {
    case 'easy':
      hints.push(rule.description)
      if (rule.formula) {
        hints.push(`Formula: ${rule.formula}`)
      }
      break

    case 'medium':
      hints.push(
        rule.type === 'arithmetic' ? 'Look for a constant difference between numbers' :
        rule.type === 'geometric' ? 'Look for a constant ratio between numbers' :
        rule.type === 'fibonacci' ? 'Each number is related to the previous two' :
        'Look for a pattern in how the numbers grow'
      )
      break

    case 'hard':
      hints.push('Analyze how the numbers change from one to the next')
      break
  }

  return hints
}

function generateExplanation(rule: SequenceRule, sequence: number[]): string {
  switch (rule.type) {
    case 'arithmetic':
      return `This is an arithmetic sequence where each number increases by ${rule.parameters?.difference}. Starting from ${rule.parameters?.start}, we add ${rule.parameters?.difference} each time.`

    case 'geometric':
      return `This is a geometric sequence where each number is multiplied by ${rule.parameters?.ratio}. Starting from ${rule.parameters?.start}, we multiply by ${rule.parameters?.ratio} each time.`

    case 'fibonacci':
      return 'This is a Fibonacci sequence where each number is the sum of the two numbers before it. Starting with 1, 1, each subsequent number is found by adding the previous two numbers.'

    case 'square':
      return 'These are square numbers. Each number is found by squaring its position in the sequence (1², 2², 3², etc.).'

    case 'cube':
      return 'These are cube numbers. Each number is found by cubing its position in the sequence (1³, 2³, 3³, etc.).'

    case 'custom':
      return `This is a special sequence using the formula: ${rule.formula}`

    default:
      return 'Look for the pattern in how the numbers change from one to the next.'
  }
}

export async function generateMathSequence(settings: MathSequenceSettings): Promise<MathSequencePuzzle> {
  // Determine sequence parameters based on difficulty
  const sequenceLength = settings.sequenceLength || {
    easy: 6,
    medium: 8,
    hard: 10
  }[settings.difficulty]

  const gapsCount = settings.gapsCount || {
    easy: 2,
    medium: 3,
    hard: 4
  }[settings.difficulty]

  const maxValue = settings.maxValue || {
    easy: 50,
    medium: 100,
    hard: 200
  }[settings.difficulty]

  // Select appropriate rules based on difficulty
  const availableRules = sequenceRules.filter(rule => {
    switch (settings.difficulty) {
      case 'easy':
        return ['arithmetic', 'square'].includes(rule.type)
      case 'medium':
        return ['arithmetic', 'geometric', 'square', 'fibonacci'].includes(rule.type)
      case 'hard':
        return true
    }
  })

  // Select a random rule
  const rule = getRandomItems(availableRules, 1)[0]

  // Generate the sequence
  const sequence = generateSequence(rule, sequenceLength, maxValue)

  // Select positions for gaps
  const gaps = getRandomItems(
    Array.from({ length: sequence.length }, (_, i) => i),
    gapsCount
  ).sort((a, b) => a - b)

  // Store solutions
  const solution = gaps.map(index => sequence[index])

  // Generate hints and explanation
  const hints = settings.showHints ? generateHints(rule, settings.difficulty) : undefined
  const explanation = generateExplanation(rule, sequence)

  return {
    sequence,
    gaps,
    rule,
    hints,
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    timeEstimate: gapsCount * {
      easy: 30,
      medium: 45,
      hard: 60
    }[settings.difficulty],
    solution,
    explanation
  }
}
