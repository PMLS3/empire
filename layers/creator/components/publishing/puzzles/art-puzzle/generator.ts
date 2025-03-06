import type { ArtPuzzleSettings, ArtPuzzle, ArtElement, ArtTask } from './types'
import { getRandomItems } from '../utils'

// Art elements database
const artElements: ArtElement[] = [
  {
    type: 'shape',
    properties: {
      name: 'Circle',
      description: 'A perfect round shape',
      difficulty: 2,
      examples: ['sun', 'moon', 'ball']
    }
  },
  {
    type: 'shape',
    properties: {
      name: 'Square',
      description: 'A four-sided shape with equal sides',
      difficulty: 2,
      examples: ['window', 'box', 'tile']
    }
  },
  {
    type: 'shape',
    properties: {
      name: 'Triangle',
      description: 'A three-sided shape',
      difficulty: 3,
      examples: ['mountain', 'pyramid', 'arrow']
    }
  },
  {
    type: 'line',
    properties: {
      name: 'Straight Line',
      description: 'A direct path between two points',
      difficulty: 1,
      examples: ['horizon', 'pole', 'edge']
    }
  },
  {
    type: 'line',
    properties: {
      name: 'Curved Line',
      description: 'A flowing, bendable line',
      difficulty: 4,
      examples: ['wave', 'vine', 'river']
    }
  },
  {
    type: 'color',
    properties: {
      name: 'Primary Colors',
      description: 'Red, blue, and yellow',
      difficulty: 3,
      examples: ['rainbow', 'flag', 'flowers']
    }
  },
  {
    type: 'pattern',
    properties: {
      name: 'Repetition',
      description: 'Repeating elements in a sequence',
      difficulty: 5,
      examples: ['wallpaper', 'textile', 'tiles']
    }
  }
]

const themes = {
  nature: {
    elements: ['Circle', 'Curved Line', 'Primary Colors'],
    examples: ['landscapes', 'flowers', 'trees'],
    concepts: [
      {
        name: 'Organic Shapes',
        description: 'Irregular, flowing shapes found in nature',
        examples: ['leaf shapes', 'cloud formations', 'river paths']
      }
    ]
  },
  geometric: {
    elements: ['Circle', 'Square', 'Triangle', 'Straight Line'],
    examples: ['architecture', 'patterns', 'logos'],
    concepts: [
      {
        name: 'Symmetry',
        description: 'Balance and reflection in shapes',
        examples: ['mandalas', 'tessellations', 'geometric patterns']
      }
    ]
  },
  abstract: {
    elements: ['all'],
    examples: ['emotions', 'concepts', 'movement'],
    concepts: [
      {
        name: 'Expression',
        description: 'Using art elements to convey feelings or ideas',
        examples: ['abstract paintings', 'modern art', 'emotional artwork']
      }
    ]
  }
}

function generateTask(
  selectedElements: ArtElement[],
  theme: string,
  difficulty: string
): ArtTask {
  const instructions = {
    easy: [
      'Create a simple composition using basic shapes',
      'Draw a pattern using one type of line',
      'Fill shapes with primary colors'
    ],
    medium: [
      'Combine different shapes to create a recognizable object',
      'Use various line types to show movement',
      'Create a pattern with alternating shapes and colors'
    ],
    hard: [
      'Design a complex composition with multiple elements',
      'Create an abstract representation of an emotion',
      'Develop a pattern that transforms across the page'
    ]
  }

  const criteria = [
    'Use of selected elements',
    'Composition balance',
    'Technical execution'
  ]

  if (difficulty === 'medium' || difficulty === 'hard') {
    criteria.push('Creativity and originality')
  }

  if (difficulty === 'hard') {
    criteria.push('Conceptual depth')
  }

  const hints = {
    easy: [
      'Start with basic shapes',
      'Use light guidelines',
      'Take your time with each element'
    ],
    medium: [
      'Plan your composition first',
      'Consider negative space',
      'Look for natural connections between elements'
    ],
    hard: [
      'Experiment with different arrangements',
      'Think about the overall flow',
      'Consider multiple interpretations'
    ]
  }

  return {
    instruction: getRandomItems(instructions[difficulty], 1)[0],
    elements: selectedElements,
    criteria,
    hints: hints[difficulty]
  }
}

function generateSolution(task: ArtTask, theme: string): ArtPuzzle['solution'] {
  return {
    description: `A ${theme}-inspired composition using ${task.elements.map(e => e.properties.name).join(', ')}`,
    keyElements: task.elements.map(e => e.properties.name),
    techniques: [
      'Sketching basic shapes',
      'Building complexity gradually',
      'Maintaining proportions',
      'Checking composition balance'
    ],
    variations: [
      'Different size relationships',
      'Alternative color schemes',
      'Rotated orientations',
      'Mirror compositions'
    ],
    commonMistakes: [
      'Uneven proportions',
      'Overcrowding elements',
      'Poor spacing',
      'Inconsistent style'
    ],
    tips: [
      'Start with light sketches',
      'Use reference points',
      'Step back regularly to check overall composition',
      'Take breaks to maintain focus'
    ]
  }
}

function generateAssessment(difficulty: string): ArtPuzzle['assessment'] {
  return {
    criteria: [
      'Element usage',
      'Composition',
      'Technical skill',
      'Creativity',
      'Presentation'
    ],
    rubric: [
      {
        category: 'Element usage',
        levels: [
          { score: 1, description: 'Limited use of required elements' },
          { score: 2, description: 'Basic use of elements' },
          { score: 3, description: 'Proficient use of elements' },
          { score: 4, description: 'Masterful integration of elements' }
        ]
      },
      {
        category: 'Composition',
        levels: [
          { score: 1, description: 'Unbalanced arrangement' },
          { score: 2, description: 'Basic balance achieved' },
          { score: 3, description: 'Well-balanced composition' },
          { score: 4, description: 'Exceptional composition' }
        ]
      }
    ]
  }
}

export async function generateArtPuzzle(settings: ArtPuzzleSettings): Promise<ArtPuzzle> {
  // Select theme
  const theme = settings.theme || getRandomItems(['nature', 'geometric', 'abstract'], 1)[0]
  const medium = settings.medium || 'drawing'

  // Select elements based on difficulty and theme
  const elementCount = settings.elementCount || {
    easy: 2,
    medium: 3,
    hard: 4
  }[settings.difficulty]

  const availableElements = artElements.filter(element => {
    if (!settings.allowColor && element.type === 'color') return false
    if (!settings.allowPatterns && element.type === 'pattern') return false
    if (themes[theme].elements !== 'all' &&
        !themes[theme].elements.includes(element.properties.name)) {
      return false
    }
    return true
  })

  const selectedElements = getRandomItems(
    availableElements.filter(e =>
      settings.difficulty === 'easy' ? e.properties.difficulty <= 3 :
      settings.difficulty === 'medium' ? e.properties.difficulty <= 5 :
      true
    ),
    elementCount
  )

  // Generate task
  const task = generateTask(selectedElements, theme, settings.difficulty)

  // Calculate time estimate based on complexity
  const timeEstimate = Math.round(
    (selectedElements.reduce((sum, e) => sum + e.properties.difficulty, 0) * 5) +
    (settings.difficulty === 'easy' ? 10 : 
     settings.difficulty === 'medium' ? 20 : 
     30)
  )

  // Generate progressive steps
  const progressiveSteps = [
    {
      step: 1,
      description: 'Sketch basic shapes and layout',
      focus: ['Composition', 'Proportions']
    },
    {
      step: 2,
      description: 'Refine shapes and add details',
      focus: ['Precision', 'Detail work']
    },
    {
      step: 3,
      description: 'Add final touches and review',
      focus: ['Refinement', 'Overall effect']
    }
  ]

  return {
    task,
    theme,
    medium,
    difficulty: settings.difficulty,
    category: settings.category,
    timeEstimate,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    solution: generateSolution(task, theme),
    learningObjectives: [
      'Understanding basic art elements',
      'Developing composition skills',
      'Practicing technical execution',
      'Exploring creative expression'
    ],
    artisticConcepts: themes[theme].concepts,
    progressiveSteps,
    extensions: [
      {
        name: 'Color variation',
        description: 'Create the same composition with different color schemes',
        difficulty: 3
      },
      {
        name: 'Scale exploration',
        description: 'Recreate the composition at different sizes',
        difficulty: 2
      }
    ],
    assessment: generateAssessment(settings.difficulty)
  }
}
