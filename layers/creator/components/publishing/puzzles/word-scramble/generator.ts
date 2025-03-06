import { defineEventHandler } from 'h3'

export interface WordScrambleSettings {
  // Basic Settings
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  category: string
  ageGroup: string
  language: string
  
  // Visual Settings
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: 'small' | 'medium' | 'large'
  
  // Layout Settings
  printLayout: 'compact' | 'spacious'
  showWordBank: boolean
  showHints: boolean
  showStepNumbers: boolean
}

export interface WordScramblePuzzle {
  originalWord: string
  scrambledWord: string
  category: string
  difficulty: string
  hints: string[]
  wordBank: string[]
  solution: string
  minSteps: number
}

const defaultSettings: WordScrambleSettings = {
  difficulty: 'medium',
  category: 'general',
  ageGroup: 'all',
  language: 'english',
  textColor: '#1a1a1a',
  backgroundColor: '#ffffff',
  accentColor: '#4f46e5',
  highlightColor: '#10b981',
  fontSize: 'medium',
  printLayout: 'compact',
  showWordBank: true,
  showHints: true,
  showStepNumbers: true
}

const scrambleWord = (word: string): string => {
  const letters = word.split('')
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[letters[i], letters[j]] = [letters[j], letters[i]]
  }
  // Ensure the scrambled word is different from the original
  const scrambled = letters.join('')
  return scrambled === word ? scrambleWord(word) : scrambled
}

const generateHints = (word: string, difficulty: string): string[] => {
  const hints: string[] = []
  
  switch (difficulty) {
    case 'easy':
      hints.push(`The word has ${word.length} letters`)
      hints.push(`First letter: ${word[0]}`)
      hints.push(`Last letter: ${word[word.length - 1]}`)
      break
    case 'medium':
      hints.push(`The word has ${word.length} letters`)
      hints.push(`First letter: ${word[0]}`)
      break
    case 'hard':
      hints.push(`The word has ${word.length} letters`)
      break
    case 'expert':
      // No hints for expert difficulty
      break
  }
  
  return hints
}

const generateWordBank = (word: string, difficulty: string): string[] => {
  const wordBank: string[] = []
  
  // Add valid words that can be formed from the letters
  const letters = word.toLowerCase().split('')
  
  // Add some common words based on difficulty
  switch (difficulty) {
    case 'easy':
      // Add 5-7 similar words
      break
    case 'medium':
      // Add 3-5 similar words
      break
    case 'hard':
      // Add 1-2 similar words
      break
    case 'expert':
      // No word bank for expert difficulty
      break
  }
  
  return wordBank
}

const generatePuzzle = (settings: WordScrambleSettings = defaultSettings): WordScramblePuzzle => {
  // For demo, using a fixed word. In production, this would come from a word list
  const word = 'PUZZLE'
  
  return {
    originalWord: word,
    scrambledWord: scrambleWord(word),
    category: settings.category,
    difficulty: settings.difficulty,
    hints: generateHints(word, settings.difficulty),
    wordBank: generateWordBank(word, settings.difficulty),
    solution: word,
    minSteps: Math.ceil(word.length / 2) // Approximate minimum steps needed
  }
}

export { generatePuzzle as generateWordScramble }
export type { WordScrambleSettings, WordScramblePuzzle }

export default defineEventHandler(async (event) => {
  const settings = await readBody(event)
  return generatePuzzle(settings)
})
