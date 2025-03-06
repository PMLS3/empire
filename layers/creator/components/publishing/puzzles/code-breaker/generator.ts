import type { CodeBreakerSettings, CodeBreakerPuzzle, CodeBreakerSymbol, CodeBreakerMessage } from './types'
import { shuffleArray } from '../utils'

// Sample messages database
const messages = {
  easy: [
    { text: 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG', theme: 'general' },
    { text: 'HELLO WORLD HOW ARE YOU TODAY', theme: 'general' },
    { text: 'CODING IS FUN AND REWARDING', theme: 'technology' }
  ],
  medium: [
    { text: 'QUANTUM PHYSICS EXPLORES THE MYSTERIES OF REALITY', theme: 'science' },
    { text: 'ARTIFICIAL INTELLIGENCE TRANSFORMS THE FUTURE', theme: 'technology' },
    { text: 'DEMOCRACY REQUIRES ACTIVE PARTICIPATION', theme: 'history' }
  ],
  hard: [
    { text: 'CRYPTOGRAPHY PROTECTS SECRETS THROUGH MATHEMATICAL ALGORITHMS', theme: 'technology' },
    { text: 'CONSCIOUSNESS EMERGES FROM NEURAL COMPLEXITY', theme: 'science' },
    { text: 'PARADIGM SHIFTS REVOLUTIONIZE SCIENTIFIC UNDERSTANDING', theme: 'science' }
  ]
}

// Symbol sets
const symbolSets = {
  basic: [
    '☆', '★', '♠', '♣', '♥', '♦', '○', '●',
    '□', '■', '△', '▲', '▽', '▼', '◇', '◆',
    '→', '←', '↑', '↓', '↔', '↕', '⇄', '⇅',
    '≠', '≈', '∞', '∆', '∇', '∏', '∑', '√'
  ],
  advanced: [
    '⚀', '⚁', '⚂', '⚃', '⚄', '⚅', '⚈', '⚉',
    '⚊', '⚋', '⚌', '⚍', '⚎', '⚏', '⚐', '⚑',
    '⚒', '⚓', '⚔', '⚕', '⚖', '⚗', '⚘', '⚙',
    '⚚', '⚛', '⚜', '⚝', '⚞', '⚟', '⚠', '⚡'
  ]
}

function createSubstitutionKey(message: string, symbols: string[]): Map<string, string> {
  const uniqueChars = Array.from(new Set(message.split('')))
  const shuffledSymbols = shuffleArray([...symbols])
  const key = new Map<string, string>()

  uniqueChars.forEach((char, index) => {
    if (char !== ' ') {
      key.set(char, shuffledSymbols[index])
    }
  })

  return key
}

function encodeMessage(message: string, key: Map<string, string>): string {
  return message
    .split('')
    .map(char => char === ' ' ? ' ' : key.get(char))
    .join('')
}

function generatePatternHints(message: string): string[] {
  const hints: string[] = []
  const words = message.split(' ')

  // Find repeated words
  const wordFreq = new Map<string, number>()
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
  })

  const repeatedWords = Array.from(wordFreq.entries())
    .filter(([_, count]) => count > 1)

  if (repeatedWords.length > 0) {
    hints.push(`Look for repeated patterns - some words appear multiple times`)
  }

  // Find double letters
  const doubleLetters = message.match(/(.)\1/g)
  if (doubleLetters) {
    hints.push(`Look for double letters in words`)
  }

  // Find common word lengths
  const lengthFreq = new Map<number, number>()
  words.forEach(word => {
    lengthFreq.set(word.length, (lengthFreq.get(word.length) || 0) + 1)
  })

  const commonLengths = Array.from(lengthFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)

  hints.push(`Most common word lengths are: ${commonLengths.map(([len]) => len).join(', ')} letters`)

  return hints
}

function calculatePatternComplexity(message: string): number {
  let complexity = 0
  
  // Factor in unique characters
  const uniqueChars = new Set(message.replace(/\s/g, '')).size
  complexity += uniqueChars * 10

  // Factor in word length variety
  const words = message.split(' ')
  const wordLengths = new Set(words.map(w => w.length)).size
  complexity += wordLengths * 5

  // Factor in repeated patterns
  const wordFreq = new Map<string, number>()
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
  })
  const repeatedWords = Array.from(wordFreq.values()).filter(count => count > 1).length
  complexity -= repeatedWords * 3

  // Factor in double letters
  const doubleLetters = (message.match(/(.)\1/g) || []).length
  complexity += doubleLetters * 2

  return Math.max(complexity, 1)
}

function estimateDecodingSteps(message: string, difficulty: string): number {
  const baseSteps = {
    easy: 5,
    medium: 10,
    hard: 15
  }[difficulty]

  const words = message.split(' ')
  const uniqueChars = new Set(message.replace(/\s/g, '')).size
  const wordVariety = new Set(words).size / words.length

  return Math.round(
    baseSteps +
    uniqueChars * 0.5 +
    words.length * 0.3 +
    wordVariety * 5
  )
}

function generateCommonWords(message: string): string[] {
  const words = message.split(' ')
  const shortWords = words.filter(w => w.length <= 3)
  const commonWords = ['THE', 'AND', 'FOR', 'ARE', 'YOU']
  
  return shortWords
    .filter(w => commonWords.includes(w))
    .slice(0, 2)
}

export async function generateCodeBreaker(settings: CodeBreakerSettings): Promise<CodeBreakerPuzzle> {
  // Select message based on difficulty and theme
  const availableMessages = messages[settings.difficulty]
    .filter(m => !settings.theme || m.theme === settings.theme)

  if (availableMessages.length === 0) {
    throw new Error('No messages match the specified criteria')
  }

  const selectedMessage = shuffleArray(availableMessages)[0]
  const message = selectedMessage.text

  // Get appropriate symbol set
  const symbolSet = settings.symbolSet || 'basic'
  const symbols = settings.customSymbols?.map(s => s.value) ||
    symbolSets[symbolSet as keyof typeof symbolSets]

  // Create substitution key and encode message
  const substitutionKey = createSubstitutionKey(message, symbols)
  const encodedMessage = encodeMessage(message, substitutionKey)

  // Generate pattern hints
  const patternHints = generatePatternHints(message)

  // Calculate complexity metrics
  const patternComplexity = calculatePatternComplexity(message)
  const decodingSteps = estimateDecodingSteps(message, settings.difficulty)

  // Generate common words as clues
  const commonWords = generateCommonWords(message)

  // Create symbols array with meanings
  const symbolsArray: CodeBreakerSymbol[] = Array.from(substitutionKey.entries())
    .map(([char, symbol]) => ({
      value: symbol,
      meaning: char
    }))

  // Generate hints based on difficulty
  const hints: string[] = []
  if (settings.showHints) {
    switch (settings.difficulty) {
      case 'easy':
        hints.push('Look for common short words like "THE" and "AND"')
        hints.push(`Message contains ${message.split(' ').length} words`)
        break
      case 'medium':
        hints.push('Analyze letter patterns and frequencies')
        hints.push('Some symbols might represent common letter pairs')
        break
      case 'hard':
        hints.push('Consider the theme for context clues')
        hints.push('Look for grammatical patterns')
        break
    }
    hints.push(...patternHints)
  }

  return {
    message: {
      encoded: encodedMessage,
      decoded: message
    },
    symbols: symbolsArray,
    substitutionKey,
    hints,
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    timeEstimate: decodingSteps * {
      easy: 30,
      medium: 45,
      hard: 60
    }[settings.difficulty],
    solution: message,
    theme: settings.theme,
    stats: {
      uniqueSymbols: symbolsArray.length,
      messageLength: message.length,
      patternComplexity,
      decodingSteps
    },
    clues: {
      givenLetters: ['E', 'T'], // Most common letters in English
      commonWords,
      patternHints
    }
  }
}
