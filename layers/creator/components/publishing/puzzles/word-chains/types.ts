import { BaseContent } from '../types'

export interface WordChainsSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  chainLength?: number
}

export interface WordChain {
  words: string[]
  connections: string[] // Describes how each word connects to the next
}

export interface WordChainsPuzzle extends BaseContent {
  startWord: string
  endWord: string
  chain: WordChain
  hints?: string[]
  difficulty: string
  category?: string
  timeEstimate?: number
  solution?: string[]
}
