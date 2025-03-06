import type { JigsawSettings, JigsawPuzzle, JigsawPiece } from './types'
import { shuffleArray } from '../utils'

// Sample image database
const imageSets = {
  nature: {
    easy: [
      { url: '/images/puzzles/nature/forest.jpg', width: 800, height: 600 },
      { url: '/images/puzzles/nature/beach.jpg', width: 800, height: 600 },
      { url: '/images/puzzles/nature/mountain.jpg', width: 800, height: 600 }
    ],
    medium: [
      { url: '/images/puzzles/nature/waterfall.jpg', width: 1024, height: 768 },
      { url: '/images/puzzles/nature/desert.jpg', width: 1024, height: 768 },
      { url: '/images/puzzles/nature/jungle.jpg', width: 1024, height: 768 }
    ],
    hard: [
      { url: '/images/puzzles/nature/aurora.jpg', width: 1280, height: 960 },
      { url: '/images/puzzles/nature/volcano.jpg', width: 1280, height: 960 },
      { url: '/images/puzzles/nature/reef.jpg', width: 1280, height: 960 }
    ]
  },
  art: {
    easy: [
      { url: '/images/puzzles/art/starry-night.jpg', width: 800, height: 600 },
      { url: '/images/puzzles/art/mona-lisa.jpg', width: 800, height: 600 },
      { url: '/images/puzzles/art/sunflowers.jpg', width: 800, height: 600 }
    ],
    medium: [
      { url: '/images/puzzles/art/persistence-of-memory.jpg', width: 1024, height: 768 },
      { url: '/images/puzzles/art/girl-with-pearl.jpg', width: 1024, height: 768 },
      { url: '/images/puzzles/art/scream.jpg', width: 1024, height: 768 }
    ],
    hard: [
      { url: '/images/puzzles/art/sistine-chapel.jpg', width: 1280, height: 960 },
      { url: '/images/puzzles/art/guernica.jpg', width: 1280, height: 960 },
      { url: '/images/puzzles/art/night-watch.jpg', width: 1280, height: 960 }
    ]
  }
}

function getImage(settings: JigsawSettings): { url: string; width: number; height: number } {
  if (settings.imageUrl) {
    // Use custom image if provided
    return {
      url: settings.imageUrl,
      width: 1024, // Default size, should be determined from actual image
      height: 768
    }
  }

  const theme = settings.theme || 'nature'
  const themeSet = imageSets[theme as keyof typeof imageSets]
  if (!themeSet) {
    throw new Error(`Theme "${theme}" not found`)
  }

  const difficultySet = themeSet[settings.difficulty]
  if (!difficultySet) {
    throw new Error(`Difficulty "${settings.difficulty}" not found for theme "${theme}"`)
  }

  return shuffleArray(difficultySet)[0]
}

function generateEdges(
  row: number,
  col: number,
  rows: number,
  cols: number
): JigsawPiece['edges'] {
  const edges: JigsawPiece['edges'] = {
    top: row === 0 ? 'flat' : Math.random() < 0.5 ? 'in' : 'out',
    right: col === cols - 1 ? 'flat' : Math.random() < 0.5 ? 'in' : 'out',
    bottom: row === rows - 1 ? 'flat' : Math.random() < 0.5 ? 'in' : 'out',
    left: col === 0 ? 'flat' : Math.random() < 0.5 ? 'in' : 'out'
  }

  return edges
}

function generatePieces(
  settings: JigsawSettings,
  image: { url: string; width: number; height: number }
): JigsawPiece[] {
  const gridSize = settings.gridSize || {
    easy: { rows: 3, cols: 4 },
    medium: { rows: 4, cols: 6 },
    hard: { rows: 6, cols: 8 }
  }[settings.difficulty]

  const { rows, cols } = gridSize
  const pieceWidth = image.width / cols
  const pieceHeight = image.height / rows
  const pieces: JigsawPiece[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = row * cols + col
      const edges = generateEdges(row, col, rows, cols)

      pieces.push({
        id,
        position: { row, col },
        edges,
        rotation: 0,
        image: {
          url: image.url,
          x: col * pieceWidth,
          y: row * pieceHeight,
          width: pieceWidth,
          height: pieceHeight
        },
        locked: false,
        connected: []
      })
    }
  }

  // Ensure matching edges
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const current = pieces[row * cols + col]
      
      // Match with right piece
      if (col < cols - 1) {
        const right = pieces[row * cols + col + 1]
        right.edges.left = current.edges.right === 'in' ? 'out' : 'in'
      }
      
      // Match with bottom piece
      if (row < rows - 1) {
        const bottom = pieces[(row + 1) * cols + col]
        bottom.edges.top = current.edges.bottom === 'in' ? 'out' : 'in'
      }
    }
  }

  return pieces
}

function generateHints(
  pieces: JigsawPiece[],
  settings: JigsawSettings
): string[] {
  const hints: string[] = []

  // Add general hints
  switch (settings.difficulty) {
    case 'easy':
      hints.push('Start with the corner pieces')
      hints.push('Build the border first')
      break

    case 'medium':
      hints.push('Look for distinct patterns or colors')
      hints.push('Group similar pieces together')
      break

    case 'hard':
      hints.push('Pay attention to subtle color changes')
      hints.push('Use edge patterns to confirm matches')
      break
  }

  // Add specific hints
  if (settings.showEdgeHints) {
    const edgePieces = pieces.filter(p =>
      Object.values(p.edges).includes('flat')
    )
    hints.push(`There are ${edgePieces.length} edge pieces`)
  }

  if (settings.showCornerHints) {
    const cornerPieces = pieces.filter(p =>
      Object.values(p.edges).filter(e => e === 'flat').length === 2
    )
    hints.push(`Look for the ${cornerPieces.length} corner pieces`)
  }

  return hints
}

function calculateComplexity(
  pieces: JigsawPiece[],
  settings: JigsawSettings
): number {
  const pieceFactor = pieces.length * 0.4
  const rotationFactor = settings.allowRotation ? 0.4 : 0
  const edgeFactor = settings.showEdgeHints ? -0.1 : 0
  const cornerFactor = settings.showCornerHints ? -0.1 : 0

  return Math.round(
    (pieceFactor + rotationFactor + edgeFactor + cornerFactor) * 100
  )
}

export async function generateJigsaw(settings: JigsawSettings): Promise<JigsawPuzzle> {
  // Get image
  const image = getImage(settings)

  // Generate pieces
  const pieces = generatePieces(settings, image)

  // Calculate statistics
  const edgePieces = pieces.filter(p =>
    Object.values(p.edges).includes('flat')
  ).length

  const cornerPieces = pieces.filter(p =>
    Object.values(p.edges).filter(e => e === 'flat').length === 2
  ).length

  const stats = {
    totalPieces: pieces.length,
    edgePieces,
    cornerPieces,
    innerPieces: pieces.length - edgePieces,
    complexity: calculateComplexity(pieces, settings)
  }

  // Generate hints if enabled
  const hints = settings.showHints
    ? generateHints(pieces, settings)
    : undefined

  // Generate rules
  const rules = {
    placement: [
      'Connect matching edges',
      'Pieces must align perfectly'
    ],
    scoringSystem: [
      `Complete the ${pieces.length}-piece puzzle`,
      'Faster completion = better score'
    ],
    bonusPoints: [
      'Bonus for completing without hints',
      'Bonus for minimal piece movements'
    ]
  }

  if (settings.allowRotation) {
    rules.placement.push('Pieces may need to be rotated')
  }

  // Create solution record
  const solution = {
    pieces: pieces.map(p => ({
      id: p.id,
      position: { ...p.position },
      rotation: 0
    }))
  }

  // Randomize piece positions for initial state
  pieces.forEach(piece => {
    if (settings.allowRotation) {
      piece.rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)] as 0 | 90 | 180 | 270
    }
    piece.currentPosition = {
      row: Math.floor(Math.random() * settings.gridSize!.rows),
      col: Math.floor(Math.random() * settings.gridSize!.cols)
    }
  })

  return {
    pieces,
    hints,
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    timeEstimate: stats.complexity * {
      easy: 30,
      medium: 60,
      hard: 120
    }[settings.difficulty],
    theme: settings.theme,
    imageUrl: image.url,
    dimensions: {
      width: image.width,
      height: image.height,
      pieceWidth: image.width / settings.gridSize!.cols,
      pieceHeight: image.height / settings.gridSize!.rows
    },
    stats,
    rules,
    solution
  }
}
