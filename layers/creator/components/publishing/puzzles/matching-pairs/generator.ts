interface MatchingPair {
  first: string
  second: string
  id: number
}

interface MatchingPairsSettings {
  pairs: MatchingPair[]
  theme?: string
  category?: string
  columns?: number
  style?: 'numbered' | 'lettered' | 'symbols'
  textColor?: string
  backgroundColor?: string
  borderColor?: string
  fontSize?: 'small' | 'medium' | 'large'
  difficulty?: 'easy' | 'medium' | 'hard'
  printLayout?: 'sideBySide' | 'separated'
  showLines?: boolean
}

interface MatchingPairsPuzzle {
  leftItems: Array<{
    id: number
    content: string
    identifier: string
  }>
  rightItems: Array<{
    id: number
    content: string
    identifier: string
  }>
  theme?: string
  category?: string
  settings: MatchingPairsSettings
}

const SYMBOLS = ['★', '■', '●', '▲', '♦', '♥', '♠', '♣', '⬟', '⬡', '⬢', '⬣']

export const generateMatchingPairs = async (settings: MatchingPairsSettings): Promise<MatchingPairsPuzzle> => {
  const { 
    pairs = [], 
    theme = '', 
    category = 'vocabulary',
    style = 'numbered',
    difficulty = 'medium',
    printLayout = 'sideBySide'
  } = settings

  // Add IDs to pairs if not present
  const pairsWithIds = pairs.map((pair, index) => ({
    ...pair,
    id: index + 1
  }))

  // Generate identifiers based on style
  const generateIdentifier = (index: number): string => {
    switch (style) {
      case 'lettered':
        return String.fromCharCode(65 + index) // A, B, C, ...
      case 'symbols':
        return SYMBOLS[index % SYMBOLS.length]
      case 'numbered':
      default:
        return (index + 1).toString()
    }
  }

  // Create left and right items with identifiers
  const leftItems = pairsWithIds.map((pair, index) => ({
    id: pair.id,
    content: pair.first,
    identifier: generateIdentifier(index)
  }))

  const rightItems = pairsWithIds.map((pair, index) => ({
    id: pair.id,
    content: pair.second,
    identifier: generateIdentifier(index)
  }))

  // Shuffle based on difficulty
  const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // For 'easy' difficulty, keep some pairs closer together
  if (difficulty === 'easy') {
    // Shuffle in smaller chunks to keep some pairs relatively close
    const chunkSize = Math.ceil(rightItems.length / 3)
    const chunks = Array.from({ length: Math.ceil(rightItems.length / chunkSize) }, (_, i) =>
      rightItems.slice(i * chunkSize, (i + 1) * chunkSize)
    )
    const shuffledChunks = chunks.map(chunk => shuffleArray(chunk))
    rightItems.splice(0, rightItems.length, ...shuffledChunks.flat())
  } else {
    // For medium and hard, shuffle completely
    shuffleArray(rightItems)
  }

  return {
    leftItems,
    rightItems,
    theme,
    category,
    settings: {
      ...settings,
      style,
      difficulty,
      printLayout
    }
  }
}
