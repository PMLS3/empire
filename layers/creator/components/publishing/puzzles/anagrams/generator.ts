import type { AnagramsSettings, AnagramsPuzzle } from './types'
import { shuffleArray, getRandomItems, wordCategories, estimateWordDifficulty } from '../utils'

export async function generateAnagrams(settings: AnagramsSettings): Promise<AnagramsPuzzle> {
  // Get words from the appropriate category
  const categoryWords = settings.category ? wordCategories[settings.category] : wordCategories.common
  
  // Filter words by difficulty
  const wordsByDifficulty = categoryWords.filter(word => 
    estimateWordDifficulty(word) === settings.difficulty
  )

  // Select random words
  const numWords = {
    easy: 5,
    medium: 8,
    hard: 12
  }[settings.difficulty]

  const selectedWords = getRandomItems(wordsByDifficulty, numWords)

  // Generate scrambled versions
  const scrambledWords = selectedWords.map(word => {
    let scrambled
    do {
      scrambled = shuffleArray(word.split('')).join('')
    } while (scrambled === word) // Ensure scrambled version is different
    return scrambled
  })

  // Generate hints based on difficulty
  const hints = settings.showHints ? selectedWords.map(word => {
    switch(settings.difficulty) {
      case 'easy':
        return `First letter: ${word[0]}`
      case 'medium':
        return `Contains ${new Set(word).size} unique letters`
      case 'hard':
        return `Length: ${word.length}`
    }
  }) : undefined

  return {
    words: selectedWords,
    scrambledWords,
    hints,
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    timeEstimate: numWords * 30 // 30 seconds per word
  }
}
