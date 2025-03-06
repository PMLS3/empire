import type { ArtSettings, ArtPuzzle, ArtElement, ArtTask, ArtSolution } from './types'
import { getRandomItems } from '../utils'

// Sample art elements database
const artElements: Record<ArtElement['type'], ArtElement[]> = {
  shape: [
    {
      type: 'shape',
      value: 'circle',
      description: 'A perfect round shape',
      difficulty: 2
    },
    {
      type: 'shape',
      value: 'square',
      description: 'A four-sided shape with equal sides',
      difficulty: 2
    },
    {
      type: 'shape',
      value: 'triangle',
      description: 'A three-sided shape',
      difficulty: 3
    },
    {
      type: 'shape',
      value: 'spiral',
      description: 'A continuous curve that winds around a center point',
      difficulty: 7
    }
  ],
  line: [
    {
      type: 'line',
      value: 'straight',
      description: 'A direct path between two points',
      difficulty: 1
    },
    {
      type: 'line',
      value: 'curved',
      description: 'A gently bending line',
      difficulty: 4
    },
    {
      type: 'line',
      value: 'zigzag',
      description: 'A line with sharp alternating turns',
      difficulty: 5
    }
  ],
  color: [
    {
      type: 'color',
      value: 'primary',
      description: 'Basic colors: red, blue, yellow',
      difficulty: 3
    },
    {
      type: 'color',
      value: 'secondary',
      description: 'Mixed colors: green, orange, purple',
      difficulty: 5
    },
    {
      type: 'color',
      value: 'monochromatic',
      description: 'Various shades of a single color',
      difficulty: 6
    }
  ],
  texture: [
    {
      type: 'texture',
      value: 'smooth',
      description: 'Even and consistent surface',
      difficulty: 4
    },
    {
      type: 'texture',
      value: 'rough',
      description: 'Uneven and varied surface',
      difficulty: 6
    },
    {
      type: 'texture',
      value: 'gradient',
      description: 'Gradual transition between values',
      difficulty: 7
    }
  ],
  pattern: [
    {
      type: 'pattern',
      value: 'repeating',
      description: 'Regular repetition of elements',
      difficulty: 5
    },
    {
      type: 'pattern',
      value: 'random',
      description: 'Irregular arrangement of elements',
      difficulty: 4
    },
    {
      type: 'pattern',
      value: 'symmetrical',
      description: 'Balanced arrangement around an axis',
      difficulty: 7
    }
  ]
}

// Sample tasks database
const taskTemplates: Record<string, string[]> = {
  abstract: [
    'Create a composition using geometric shapes',
    'Design a pattern using repeating elements',
    'Express an emotion through color and line'
  ],
  realistic: [
    'Draw a simple still life arrangement',
    'Sketch a basic landscape scene',
    'Create a portrait using basic shapes'
  ],
  cartoon: [
    'Design a simple character using basic shapes',
    'Create an expressive face using minimal lines',
    'Draw a simple scene with cartoon elements'
  ]
}

function generateTask(
  elements: ArtElement[],
  style: string,
  difficulty: string
): ArtTask {
  const instruction = getRandomItems(taskTemplates[style] || taskTemplates.abstract, 1)[0]
  const elementCount = {
    easy: 2,
    medium: 3,
    hard: 4
  }[difficulty]

  return {
    instruction,
    elements: getRandomItems(elements, elementCount),
    tips: [
      'Start with basic shapes',
      'Build complexity gradually',
      'Consider composition and balance'
    ],
    requiredTools: ['pencil', 'eraser', 'paper']
  }
}

function calculateComplexity(elements: ArtElement[]): number {
  const baseDifficulty = elements.reduce((sum, el) => sum + el.difficulty, 0)
  const interactionComplexity = Math.floor(elements.length * 1.5)
  return Math.min(10, Math.floor((baseDifficulty + interactionComplexity) / elements.length))
}

function generateSolution(
  tasks: ArtTask[],
  style: string,
  medium: string
): ArtSolution {
  const steps = tasks.flatMap(task => [
    `Start with the basic ${task.elements[0].type} elements`,
    `Add ${task.elements[1].type} details`,
    'Refine and adjust the composition'
  ])

  const techniques = [
    `Basic ${medium} techniques`,
    'Composition principles',
    'Element arrangement'
  ]

  return {
    steps,
    finalImage: 'placeholder-image-reference',
    techniques,
    variations: [
      'Try different color schemes',
      'Experiment with scale',
      'Adjust composition layout'
    ]
  }
}

function generateLearningPoints(
  elements: ArtElement[],
  style: string,
  medium: string
): ArtPuzzle['learningPoints'] {
  return {
    techniques: [
      `Basic ${medium} handling`,
      'Element composition',
      'Visual balance'
    ],
    principles: [
      'Unity and harmony',
      'Balance and proportion',
      'Rhythm and movement'
    ],
    history: style === 'abstract' ? [
      'Origins of abstract art',
      'Key abstract artists',
      'Modern art movements'
    ] : undefined,
    theory: [
      'Color theory basics',
      'Composition rules',
      'Design principles'
    ]
  }
}

export async function generateArt(settings: ArtSettings): Promise<ArtPuzzle> {
  // Determine available element types
  const availableTypes: ArtElement['type'][] = ['shape', 'line']
  if (settings.includeColors) availableTypes.push('color')
  if (settings.includeTextures) availableTypes.push('texture')
  if (settings.includePatterns) availableTypes.push('pattern')

  // Get elements based on difficulty
  const elements = availableTypes.flatMap(type =>
    artElements[type].filter(el => {
      switch (settings.difficulty) {
        case 'easy':
          return el.difficulty <= 4
        case 'medium':
          return el.difficulty <= 7
        case 'hard':
          return true
      }
    })
  )

  // Generate tasks
  const taskCount = {
    easy: 1,
    medium: 2,
    hard: 3
  }[settings.difficulty]

  const selectedElements = getRandomItems(elements, settings.elementCount || 5)
  const tasks = Array(taskCount)
    .fill(null)
    .map(() => generateTask(
      selectedElements,
      settings.style || 'abstract',
      settings.difficulty
    ))

  // Calculate complexity metrics
  const complexityScore = calculateComplexity(selectedElements)

  // Generate solution
  const solution = generateSolution(
    tasks,
    settings.style || 'abstract',
    settings.medium || 'digital'
  )

  // Generate learning points
  const learningPoints = generateLearningPoints(
    selectedElements,
    settings.style || 'abstract',
    settings.medium || 'digital'
  )

  return {
    tasks,
    elements: selectedElements,
    hints: settings.showHints ? [
      'Start with basic shapes and forms',
      'Build complexity gradually',
      'Consider the overall composition'
    ] : undefined,
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    timeEstimate: tasks.length * {
      easy: 300,
      medium: 600,
      hard: 900
    }[settings.difficulty],
    solution,
    style: settings.style,
    medium: settings.medium,
    stats: {
      totalElements: selectedElements.length,
      complexityScore,
      techniquesRequired: solution.techniques.length,
      creativityLevel: Math.min(10, Math.floor(complexityScore * 1.2))
    },
    learningPoints,
    assessment: {
      criteria: [
        'Technical execution',
        'Composition',
        'Creativity',
        'Element integration'
      ],
      rubric: [
        {
          category: 'Technical Skills',
          points: 3,
          description: 'Proper use of artistic elements and techniques'
        },
        {
          category: 'Composition',
          points: 3,
          description: 'Effective arrangement and balance of elements'
        },
        {
          category: 'Creativity',
          points: 2,
          description: 'Original and innovative use of elements'
        },
        {
          category: 'Element Integration',
          points: 2,
          description: 'Seamless combination of different elements'
        }
      ]
    }
  }
}
