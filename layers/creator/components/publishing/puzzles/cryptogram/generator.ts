import type { CryptogramSettings, CryptogramPuzzle, CipherKey, FrequencyAnalysis } from './types'
import { getRandomItems } from '../utils'

const LETTER_FREQUENCIES = {
  E: 12.7, T: 9.1, A: 8.2, O: 7.5, I: 7.0,
  N: 6.7, S: 6.3, H: 6.1, R: 6.0, D: 4.3,
  L: 4.0, C: 2.8, U: 2.8, M: 2.4, W: 2.4,
  F: 2.2, G: 2.0, Y: 2.0, P: 1.9, B: 1.5,
  V: 1.0, K: 0.8, J: 0.15, X: 0.15, Q: 0.10,
  Z: 0.07
}

// Sample text database
const textDatabase = {
  quotes: [
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      category: "inspiration"
    },
    {
      text: "In three words I can sum up everything I've learned about life: it goes on.",
      author: "Robert Frost",
      category: "life"
    }
  ],
  proverbs: [
    {
      text: "A journey of a thousand miles begins with a single step.",
      origin: "Chinese",
      category: "wisdom"
    },
    {
      text: "Actions speak louder than words.",
      origin: "English",
      category: "behavior"
    }
  ],
  facts: [
    {
      text: "The Great Wall of China is not visible from space with the naked eye.",
      category: "science"
    },
    {
      text: "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old.",
      category: "science"
    }
  ]
}

function generateCipherKey(settings: CryptogramSettings): CipherKey[] {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const substitutions = [...alphabet]
  
  // Shuffle based on difficulty
  if (settings.difficulty === 'easy') {
    // Keep some common letters similar
    const commonPairs = [['E', 'A'], ['T', 'S'], ['O', 'I']]
    commonPairs.forEach(([a, b]) => {
      if (Math.random() < 0.4) {
        const indexA = substitutions.indexOf(a)
        const indexB = substitutions.indexOf(b)
        ;[substitutions[indexA], substitutions[indexB]] = [substitutions[indexB], substitutions[indexA]]
      }
    })
    // Shuffle rest
    for (let i = substitutions.length - 1; i > 0; i--) {
      if (!commonPairs.flat().includes(substitutions[i])) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[substitutions[i], substitutions[j]] = [substitutions[j], substitutions[i]]
      }
    }
  } else {
    // Complete random shuffle for medium/hard
    for (let i = substitutions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[substitutions[i], substitutions[j]] = [substitutions[j], substitutions[i]]
    }
  }

  return alphabet.map((letter, index) => ({
    original: letter,
    substitution: settings.symbolSet === 'numbers' 
      ? String(index + 1).padStart(2, '0')
      : settings.symbolSet === 'symbols'
        ? String.fromCharCode(0x2200 + index)
        : substitutions[index]
  }))
}

function encryptText(text: string, cipherKey: CipherKey[], settings: CryptogramSettings): string {
  const substitutionMap = new Map(cipherKey.map(k => [k.original, k.substitution]))
  
  return text
    .split('')
    .map(char => {
      const upperChar = char.toUpperCase()
      if (/[A-Z]/.test(upperChar)) {
        const sub = substitutionMap.get(upperChar)
        return settings.caseSensitive 
          ? (char === upperChar ? sub : sub?.toLowerCase())
          : sub
      }
      return settings.preservePunctuation ? char : (settings.preserveSpaces && char === ' ' ? ' ' : '')
    })
    .join('')
}

function analyzeText(text: string): CryptogramPuzzle['analysis'] {
  const letterFrequency: FrequencyAnalysis[] = []
  const wordLengths: { [length: number]: number } = {}
  const words = text.toUpperCase().split(/\s+/)
  
  // Calculate letter frequency
  const letterCounts = new Map<string, number>()
  const totalLetters = text.toUpperCase().split('').filter(c => /[A-Z]/.test(c)).length
  
  text.toUpperCase().split('').forEach(char => {
    if (/[A-Z]/.test(char)) {
      letterCounts.set(char, (letterCounts.get(char) || 0) + 1)
    }
  })
  
  letterCounts.forEach((count, letter) => {
    letterFrequency.push({
      letter,
      frequency: +(count / totalLetters * 100).toFixed(1),
      commonWords: words.filter(word => word.includes(letter)).slice(0, 3)
    })
  })
  
  // Calculate word lengths
  words.forEach(word => {
    const length = word.length
    wordLengths[length] = (wordLengths[length] || 0) + 1
  })
  
  // Find common patterns
  const patterns = words
    .map(word => word.split('').map((_, i, arr) => 
      arr.indexOf(arr[i]) === i ? arr[i] : arr.indexOf(arr[i])
    ).join(''))
    .filter((pattern, index, self) => self.indexOf(pattern) === index)
  
  return {
    letterFrequency: letterFrequency.sort((a, b) => b.frequency - a.frequency),
    wordLengths,
    commonPatterns: patterns.slice(0, 5)
  }
}

function generateHints(
  text: string,
  cipherKey: CipherKey[],
  difficulty: string
): string[] {
  const hints: string[] = []
  const words = text.toUpperCase().split(/\s+/)
  
  switch (difficulty) {
    case 'easy':
      hints.push(`Most common letter in English is 'E'`)
      hints.push(`Look for single-letter words: 'A' or 'I'`)
      hints.push(`Most common three-letter word is 'THE'`)
      break
      
    case 'medium':
      hints.push(`Common letter pairs: TH, HE, AN, IN, ER`)
      hints.push(`Look for apostrophes and repeated patterns`)
      break
      
    case 'hard':
      hints.push(`Analyze letter frequencies`)
      hints.push(`Look for word patterns`)
      break
  }
  
  return hints
}

export async function generateCryptogram(settings: CryptogramSettings): Promise<CryptogramPuzzle> {
  // Select text based on theme and difficulty
  const theme = settings.theme || 'quotes'
  const texts = textDatabase[theme]
  const selectedText = getRandomItems(texts, 1)[0]
  
  // Ensure text meets length requirements
  const text = settings.maxLength 
    ? selectedText.text.slice(0, settings.maxLength)
    : selectedText.text
  
  // Generate cipher key
  const cipherKey = generateCipherKey(settings)
  
  // Encrypt text
  const encryptedText = encryptText(text, cipherKey, settings)
  
  // Analyze text for patterns
  const analysis = settings.difficulty === 'hard' 
    ? analyzeText(text)
    : undefined
  
  // Generate solution steps
  const solutionSteps = [
    {
      step: 1,
      description: "Identify common patterns and frequencies",
      reveals: ['E', 'T', 'A']
    },
    {
      step: 2,
      description: "Look for short words and apostrophes",
      reveals: ['I', 'A', 'S']
    },
    {
      step: 3,
      description: "Use word patterns to decode remaining letters",
      reveals: []
    }
  ]
  
  // Generate hints
  const hints = settings.showHints 
    ? generateHints(text, cipherKey, settings.difficulty)
    : undefined
  
  return {
    originalText: text,
    encryptedText,
    cipherKey,
    hints,
    difficulty: settings.difficulty,
    category: selectedText.category,
    timeEstimate: Math.round(text.length * {
      easy: 2,
      medium: 3,
      hard: 4
    }[settings.difficulty]),
    theme,
    analysis,
    solution: {
      text,
      steps: solutionSteps
    },
    learningPoints: {
      cryptographyFacts: [
        "Substitution ciphers were first used in ancient Rome",
        "Frequency analysis was developed by Arab scholars",
        "Modern encryption uses complex mathematical algorithms"
      ],
      languagePatterns: [
        "E is the most common letter in English",
        "Q is almost always followed by U",
        "Common word endings: -ING, -ED, -LY"
      ],
      historicalContext: theme === 'quotes' 
        ? `This quote by ${selectedText.author} reflects historical wisdom`
        : undefined
    },
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor
  }
}
