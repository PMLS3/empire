import type { SpellingBeeSettings, SpellingBeePuzzle, SpellingBeeWord, SpellingBeeStats } from './types'
import { getRandomItems } from '../utils'

// Sample word database with definitions and examples
const wordDatabase = {
  nature: [
    {
      word: "GARDEN",
      definition: "A plot of ground where plants are cultivated",
      example: "She spent hours tending to her vegetable garden."
    },
    {
      word: "PETAL",
      definition: "A segment of the corolla of a flower",
      example: "The rose dropped its last petal."
    }
  ],
  science: [
    {
      word: "ATOM",
      definition: "The smallest unit of a chemical element",
      example: "The atom is composed of protons, neutrons, and electrons."
    },
    {
      word: "ENERGY",
      definition: "The capacity to do work",
      example: "Solar energy is a renewable resource."
    }
  ],
  general: [
    {
      word: "PANGRAM",
      definition: "A sentence using every letter of the alphabet",
      example: "The quick brown fox jumps over the lazy dog is a pangram."
    },
    {
      word: "PUZZLE",
      definition: "A game or problem that tests ingenuity",
      example: "She solved the crossword puzzle in record time."
    }
  ]
}

function calculateWordPoints(word: string, isPangram: boolean): number {
  if (word.length < 4) return 0
  if (isPangram) return word.length + 7
  return word.length
}

function isPangram(word: string, letters: string[]): boolean {
  const uniqueLetters = new Set(word.split(''))
  return letters.every(letter => uniqueLetters.has(letter))
}

function generateLetterSet(settings: SpellingBeeSettings): { center: string, outer: string[] } {
  const vowels = ['A', 'E', 'I', 'O', 'U']
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ'.split('')
  
  // Select center letter based on settings
  let centerLetter: string
  if (settings.centerLetterBias === 'common') {
    centerLetter = getRandomItems(vowels.concat(['R', 'S', 'T', 'N']), 1)[0]
  } else if (settings.centerLetterBias === 'uncommon') {
    centerLetter = getRandomItems(['J', 'Q', 'X', 'Z'], 1)[0]
  } else {
    centerLetter = getRandomItems(vowels.concat(consonants), 1)[0]
  }
  
  // Select outer letters ensuring good word possibilities
  const remainingLetters = [...vowels, ...consonants].filter(l => l !== centerLetter)
  const outerLetters: string[] = []
  
  // Ensure at least one vowel if center is consonant
  if (!vowels.includes(centerLetter)) {
    outerLetters.push(getRandomItems(vowels, 1)[0])
  }
  
  // Fill remaining spots
  while (outerLetters.length < 6) {
    const letter = getRandomItems(remainingLetters, 1)[0]
    if (!outerLetters.includes(letter)) {
      outerLetters.push(letter)
    }
  }
  
  return { center: centerLetter, outer: outerLetters }
}

function findValidWords(
  centerLetter: string,
  letters: string[],
  settings: SpellingBeeSettings
): SpellingBeeWord[] {
  const allLetters = [centerLetter, ...letters]
  const validWords: SpellingBeeWord[] = []
  
  // Get words from appropriate category/theme
  const categoryWords = settings.theme 
    ? wordDatabase[settings.theme]
    : Object.values(wordDatabase).flat()
  
  categoryWords.forEach(({ word, definition, example }) => {
    const upperWord = word.toUpperCase()
    
    // Check if word meets criteria
    if (
      upperWord.includes(centerLetter) &&
      upperWord.split('').every(letter => allLetters.includes(letter)) &&
      (!settings.minWordLength || upperWord.length >= settings.minWordLength) &&
      (!settings.maxWordLength || upperWord.length <= settings.maxWordLength)
    ) {
      const wordIsPangram = isPangram(upperWord, allLetters)
      if (!settings.requirePangrams || wordIsPangram) {
        validWords.push({
          word: upperWord,
          points: calculateWordPoints(upperWord, wordIsPangram),
          isPangram: wordIsPangram,
          definition: settings.showDefinitions ? definition : undefined,
          usageExample: settings.showDefinitions ? example : undefined
        })
      }
    }
  })
  
  return validWords
}

function calculateStats(words: SpellingBeeWord[]): SpellingBeeStats {
  const totalPoints = words.reduce((sum, word) => sum + word.points, 0)
  const pangramCount = words.filter(word => word.isPangram).length
  
  // Calculate letter distribution
  const letterCounts = new Map<string, number>()
  words.forEach(({ word }) => {
    word.split('').forEach(letter => {
      letterCounts.set(letter, (letterCounts.get(letter) || 0) + 1)
    })
  })
  
  return {
    totalWords: words.length,
    totalPoints,
    pangramCount,
    perfectScore: Math.ceil(totalPoints * 0.7),
    rankLevels: [
      { rank: "Beginner", minPoints: Math.ceil(totalPoints * 0.2), description: "Good start!" },
      { rank: "Good", minPoints: Math.ceil(totalPoints * 0.4), description: "You're getting there!" },
      { rank: "Amazing", minPoints: Math.ceil(totalPoints * 0.6), description: "Excellent work!" },
      { rank: "Genius", minPoints: Math.ceil(totalPoints * 0.8), description: "Outstanding!" },
      { rank: "Queen Bee", minPoints: totalPoints, description: "Perfect score!" }
    ],
    letterDistribution: Array.from(letterCounts.entries()).map(([letter, count]) => ({
      letter,
      count
    }))
  }
}

function generateProgressiveHints(
  words: SpellingBeeWord[],
  centerLetter: string,
  difficulty: string
): SpellingBeePuzzle['progressiveHints'] {
  const pangrams = words.filter(word => word.isPangram)
  const totalPoints = words.reduce((sum, word) => sum + word.points, 0)
  
  return [
    {
      level: 1,
      threshold: 0.2,
      hints: [
        `There are ${words.length} possible words`,
        `Words must contain the center letter: ${centerLetter}`
      ]
    },
    {
      level: 2,
      threshold: 0.4,
      hints: [
        `There ${pangrams.length === 1 ? 'is' : 'are'} ${pangrams.length} pangram${pangrams.length === 1 ? '' : 's'}`,
        `The longest word has ${Math.max(...words.map(w => w.length))} letters`
      ]
    },
    {
      level: 3,
      threshold: 0.6,
      hints: difficulty === 'easy' 
        ? [`Try: ${getRandomItems(words.filter(w => w.points < 5), 1)[0].word}`]
        : [`There are ${words.filter(w => w.length === 4).length} 4-letter words`]
    }
  ]
}

export async function generateSpellingBee(settings: SpellingBeeSettings): Promise<SpellingBeePuzzle> {
  // Generate letter set
  const { center, outer } = generateLetterSet(settings)
  
  // Find valid words
  const validWords = findValidWords(center, outer, settings)
  
  // Calculate statistics
  const stats = calculateStats(validWords)
  
  // Generate progressive hints
  const progressiveHints = generateProgressiveHints(validWords, center, settings.difficulty)
  
  // Generate bonus words (if any)
  const bonusWords = settings.difficulty === 'hard' ? validWords
    .filter(word => word.points > 6)
    .map(word => ({
      word: word.word,
      points: word.points * 2,
      category: word.isPangram ? 'pangram' : 'long-word'
    }))
    : undefined
  
  return {
    centerLetter: center,
    outerLetters: outer,
    validWords,
    hints: settings.showHints ? [
      `There are ${validWords.length} possible words`,
      `Total points possible: ${stats.totalPoints}`,
      `Look for words with ${center} as it's required`
    ] : undefined,
    difficulty: settings.difficulty,
    category: settings.category,
    timeEstimate: Math.round(validWords.length * {
      easy: 10,
      medium: 15,
      hard: 20
    }[settings.difficulty]),
    theme: settings.theme,
    stats,
    progressiveHints,
    bonusWords,
    learningPoints: {
      vocabulary: [
        "Words must be at least 4 letters long",
        "Pangrams use all available letters",
        "Proper nouns are not allowed"
      ],
      wordPatterns: [
        "Look for common prefixes: RE-, UN-, IN-",
        "Look for common suffixes: -ING, -ED, -LY",
        "Try building longer words from shorter ones"
      ],
      etymology: settings.difficulty === 'hard' ? [
        "Many English words have Latin or Greek roots",
        "Understanding word origins can help find related words",
        "Common root words often share meaning patterns"
      ] : undefined
    },
    assessment: {
      criteria: [
        "Word length (longer words = more points)",
        "Finding pangrams (extra points)",
        "Total unique words found",
        "Time taken to reach each rank"
      ],
      scoring: [
        {
          category: "4-letter words",
          points: 1,
          description: "Basic vocabulary building"
        },
        {
          category: "5+ letter words",
          points: 5,
          description: "Advanced vocabulary"
        },
        {
          category: "Pangrams",
          points: 7,
          description: "Expert pattern recognition"
        }
      ]
    },
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor
  }
}
