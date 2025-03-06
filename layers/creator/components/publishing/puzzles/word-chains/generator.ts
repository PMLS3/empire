import type { WordChainsSettings, WordChainsPuzzle, WordChain } from './types'
import { getRandomItems, wordCategories, estimateWordDifficulty } from '../utils'

function findWordChain(start: string, end: string, wordList: string[], maxLength: number): WordChain | null {
  // Helper function to check if two words differ by one letter
  const differByOne = (word1: string, word2: string): string | null => {
    if (word1.length !== word2.length) return null
    let diffIndex = -1
    let diffCount = 0
    
    for (let i = 0; i < word1.length; i++) {
      if (word1[i] !== word2[i]) {
        diffCount++
        diffIndex = i
        if (diffCount > 1) return null
      }
    }
    
    return diffCount === 1 ? `Change letter ${diffIndex + 1} from '${word1[diffIndex]}' to '${word2[diffIndex]}'` : null
  }

  // Breadth-first search to find the shortest chain
  const queue: Array<{ word: string; path: string[]; connections: string[] }> = [
    { word: start, path: [start], connections: [] }
  ]
  const visited = new Set([start])

  while (queue.length > 0) {
    const { word, path, connections } = queue.shift()!

    if (word === end && path.length <= maxLength) {
      return { words: path, connections }
    }

    if (path.length >= maxLength) continue

    // Try all possible next words
    for (const nextWord of wordList) {
      if (!visited.has(nextWord)) {
        const connection = differByOne(word, nextWord)
        if (connection) {
          visited.add(nextWord)
          queue.push({
            word: nextWord,
            path: [...path, nextWord],
            connections: [...connections, connection]
          })
        }
      }
    }
  }

  return null
}

export async function generateWordChains(settings: WordChainsSettings): Promise<WordChainsPuzzle> {
  // Get words from the appropriate category
  const categoryWords = settings.category ? wordCategories[settings.category] : wordCategories.common
  
  // Filter words by difficulty and length
  const wordsByDifficulty = categoryWords.filter(word => 
    estimateWordDifficulty(word) === settings.difficulty &&
    word.length >= 3 && word.length <= 6
  )

  // Set chain length based on difficulty
  const chainLength = settings.chainLength || {
    easy: 3,
    medium: 4,
    hard: 5
  }[settings.difficulty]

  // Try to find a valid chain
  let chain: WordChain | null = null
  let attempts = 0
  const maxAttempts = 50

  while (!chain && attempts < maxAttempts) {
    attempts++
    const [startWord, endWord] = getRandomItems(wordsByDifficulty, 2)
    chain = findWordChain(startWord, endWord, wordsByDifficulty, chainLength)
  }

  if (!chain) {
    throw new Error('Could not generate a valid word chain')
  }

  // Generate hints based on difficulty
  const hints = settings.showHints ? chain.words.map((word, i) => {
    if (i === 0) return 'Start with: ' + word
    if (i === chain.words.length - 1) return 'End with: ' + word
    
    switch(settings.difficulty) {
      case 'easy':
        return chain.connections[i - 1]
      case 'medium':
        return `Word ${i + 1} has ${word.length} letters`
      case 'hard':
        return i === Math.floor(chain.words.length / 2) ? 
          `Middle word: ${word}` : 'Find the connecting word'
    }
  }) : undefined

  return {
    startWord: chain.words[0],
    endWord: chain.words[chain.words.length - 1],
    chain,
    hints,
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    timeEstimate: chainLength * 45, // 45 seconds per word in chain
    solution: chain.words
  }
}
