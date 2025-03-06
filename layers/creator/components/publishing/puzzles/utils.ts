// Utility functions for puzzle generation

// Shuffle an array using Fisher-Yates algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Generate a random integer between min and max (inclusive)
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Create a 2D array with given dimensions
export function create2DArray<T>(rows: number, cols: number, defaultValue: T): T[][] {
  return Array(rows).fill(null).map(() => Array(cols).fill(defaultValue))
}

// Check if a string contains only letters
export function isAlphabetic(str: string): boolean {
  return /^[a-zA-Z]+$/.test(str)
}

// Convert a string to title case
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
}

// Get random items from an array
export function getRandomItems<T>(array: T[], count: number): T[] {
  return shuffleArray(array).slice(0, count)
}

// Check if two arrays are equal
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((val, idx) => val === b[idx])
}

// Generate a random color
export function randomColor(): string {
  return `#${Math.floor(Math.random()*16777215).toString(16)}`
}

// Calculate grid dimensions that best fit a given number of items
export function calculateGridDimensions(itemCount: number): { rows: number; cols: number } {
  const sqrt = Math.sqrt(itemCount)
  const cols = Math.ceil(sqrt)
  const rows = Math.ceil(itemCount / cols)
  return { rows, cols }
}

// Word difficulty estimator
export function estimateWordDifficulty(word: string): 'easy' | 'medium' | 'hard' {
  const length = word.length
  const uniqueLetters = new Set(word.toLowerCase()).size
  const complexityScore = length + uniqueLetters

  if (complexityScore <= 8) return 'easy'
  if (complexityScore <= 12) return 'medium'
  return 'hard'
}

// Generate a random mathematical expression with a target result
export function generateMathExpression(target: number, difficulty: 'easy' | 'medium' | 'hard'): {
  expression: string
  solution: number
} {
  const operators = {
    easy: ['+', '-'],
    medium: ['+', '-', '*'],
    hard: ['+', '-', '*', '/']
  }[difficulty]

  const maxNumber = {
    easy: 10,
    medium: 20,
    hard: 50
  }[difficulty]

  let num1 = randomInt(1, maxNumber)
  let num2 = randomInt(1, maxNumber)
  const operator = operators[randomInt(0, operators.length - 1)]

  // Ensure division results in whole numbers
  if (operator === '/') {
    num2 = randomInt(1, 10)
    num1 = num2 * randomInt(1, maxNumber / num2)
  }

  const expression = `${num1} ${operator} ${num2}`
  const solution = eval(expression)

  return { expression, solution }
}

// Format time duration in minutes and seconds
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Generate a random sentence
export function generateSentence(words: string[]): string {
  const length = randomInt(4, 8)
  const sentence = getRandomItems(words, length).join(' ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
}

// Check if a grid position is valid
export function isValidPosition(row: number, col: number, rows: number, cols: number): boolean {
  return row >= 0 && row < rows && col >= 0 && col < cols
}

// Get all possible directions for word placement
export function getDirections(): { dx: number; dy: number }[] {
  return [
    { dx: 1, dy: 0 },   // right
    { dx: 0, dy: 1 },   // down
    { dx: 1, dy: 1 },   // diagonal right-down
    { dx: -1, dy: 1 },  // diagonal left-down
  ]
}

// Create a deep copy of an object
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Check if two grids are equal
export function gridsEqual<T>(grid1: T[][], grid2: T[][]): boolean {
  if (grid1.length !== grid2.length) return false
  return grid1.every((row, i) => arraysEqual(row, grid2[i]))
}

// Convert degrees to radians
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Calculate distance between two points
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

// Word databases
export const commonWords = [
  'apple', 'banana', 'cat', 'dog', 'elephant', 'fish', 'giraffe', 'house',
  'ice', 'jacket', 'king', 'lion', 'monkey', 'nest', 'orange', 'penguin',
  'queen', 'rabbit', 'snake', 'tiger', 'umbrella', 'violin', 'whale',
  'xylophone', 'yellow', 'zebra'
]

export const scienceWords = [
  'atom', 'biology', 'cell', 'dna', 'energy', 'force', 'gravity', 'hydrogen',
  'isotope', 'joule', 'kelvin', 'laser', 'magnet', 'neutron', 'oxygen',
  'proton', 'quantum', 'radiation', 'solar', 'temperature', 'uranium',
  'voltage', 'wave', 'xray', 'yield', 'zinc'
]

export const mathWords = [
  'add', 'subtract', 'multiply', 'divide', 'equals', 'fraction', 'geometry',
  'hundred', 'integer', 'join', 'kilometer', 'length', 'measure', 'number',
  'odd', 'plus', 'quotient', 'ratio', 'sum', 'times', 'unit', 'value',
  'whole', 'x-axis', 'y-axis', 'zero'
]

export const historyWords = [
  'ancient', 'battle', 'castle', 'dynasty', 'empire', 'fortress', 'government',
  'history', 'invasion', 'justice', 'kingdom', 'leader', 'monarchy', 'nation',
  'palace', 'queen', 'revolution', 'sword', 'throne', 'unity', 'victory',
  'war', 'xanadu', 'year', 'zeus'
]

export const geographyWords = [
  'africa', 'border', 'continent', 'desert', 'earth', 'forest', 'glacier',
  'hill', 'island', 'jungle', 'lake', 'mountain', 'north', 'ocean',
  'peninsula', 'river', 'south', 'terrain', 'valley', 'water', 'west',
  'xerophyte', 'yield', 'zone'
]

export const musicWords = [
  'alto', 'bass', 'chord', 'drum', 'eighth', 'flute', 'guitar', 'harmony',
  'instrument', 'jazz', 'key', 'lyric', 'melody', 'note', 'octave',
  'piano', 'quarter', 'rhythm', 'song', 'tempo', 'unison', 'violin',
  'whole', 'xylophone', 'yodel', 'zinc'
]

export const artWords = [
  'abstract', 'brush', 'canvas', 'draw', 'easel', 'frame', 'gallery',
  'hue', 'ink', 'jade', 'kiln', 'line', 'mural', 'paint', 'quill',
  'red', 'sketch', 'texture', 'umber', 'value', 'wash', 'yellow',
  'zinc'
]

// Word categories mapping
export const wordCategories = {
  common: commonWords,
  science: scienceWords,
  math: mathWords,
  history: historyWords,
  geography: geographyWords,
  music: musicWords,
  art: artWords
}
