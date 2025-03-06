import type { RiddleSettings, RiddlePuzzle, RiddleClue, RiddleAnswer } from './types'
import { getRandomItems } from '../utils'

// Sample riddles database
interface RiddleTemplate {
  question: string
  clues: RiddleClue[]
  answer: RiddleAnswer
  theme: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const riddleTemplates: RiddleTemplate[] = [
  {
    question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. I have roads, but no cars. What am I?",
    clues: [
      {
        text: "You can fold me",
        type: "description",
        relevance: 0.7
      },
      {
        text: "I show you the way",
        type: "description",
        relevance: 0.9
      },
      {
        text: "I represent reality, but I'm not real",
        type: "metaphor",
        relevance: 0.8
      }
    ],
    answer: {
      text: "A map",
      alternativeAnswers: ["map", "atlas"],
      explanation: "A map contains representations of cities, mountains, water, and roads, but not the actual physical objects."
    },
    theme: "objects",
    difficulty: "easy"
  },
  {
    question: "The more you take, the more you leave behind. What am I?",
    clues: [
      {
        text: "I mark your journey",
        type: "metaphor",
        relevance: 0.8
      },
      {
        text: "I'm created by movement",
        type: "description",
        relevance: 0.7
      },
      {
        text: "'Step' into the answer",
        type: "wordplay",
        relevance: 0.6
      }
    ],
    answer: {
      text: "Footsteps",
      alternativeAnswers: ["footprints", "steps", "tracks"],
      explanation: "As you walk and take steps forward, you leave footsteps behind you."
    },
    theme: "concepts",
    difficulty: "medium"
  },
  {
    question: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?",
    clues: [
      {
        text: "I bring light and warmth",
        type: "description",
        relevance: 0.8
      },
      {
        text: "I dance but have no feet",
        type: "metaphor",
        relevance: 0.7
      },
      {
        text: "I can spread quickly",
        type: "description",
        relevance: 0.6
      }
    ],
    answer: {
      text: "Fire",
      alternativeAnswers: ["flame", "flames"],
      explanation: "Fire grows larger, needs air to burn, and is extinguished by water."
    },
    theme: "nature",
    difficulty: "medium"
  }
  // Add more riddles as needed
]

function generateHints(riddle: RiddleTemplate, difficulty: string): string[] {
  const hints: string[] = []
  const sortedClues = [...riddle.clues].sort((a, b) => b.relevance - a.relevance)

  switch (difficulty) {
    case 'easy':
      hints.push(sortedClues[0].text)
      hints.push(`Think about things that are ${riddle.theme}-related`)
      break

    case 'medium':
      if (sortedClues[0].type === 'wordplay') {
        hints.push('Look for word associations or double meanings')
      } else {
        hints.push(`Consider ${riddle.theme}-related items with these properties`)
      }
      break

    case 'hard':
      hints.push(`This is a ${riddle.theme}-themed riddle`)
      break
  }

  return hints
}

function filterRiddlesByDifficulty(
  templates: RiddleTemplate[],
  settings: RiddleSettings
): RiddleTemplate[] {
  return templates.filter(riddle => {
    // Filter by difficulty
    if (riddle.difficulty !== settings.difficulty) {
      return false
    }

    // Filter by theme if specified
    if (settings.theme && riddle.theme !== settings.theme) {
      return false
    }

    // Filter by clue types
    if (!settings.allowWordplay && riddle.clues.some(c => c.type === 'wordplay')) {
      return false
    }

    if (!settings.allowMetaphors && riddle.clues.some(c => c.type === 'metaphor')) {
      return false
    }

    return true
  })
}

function generateAdditionalInfo(riddle: RiddleTemplate): RiddlePuzzle['additionalInfo'] {
  const relatedRiddles = riddleTemplates
    .filter(r => 
      r.theme === riddle.theme && 
      r.question !== riddle.question
    )
    .map(r => r.question)

  const funFacts = {
    objects: [
      "Many everyday objects have multiple uses beyond their primary purpose",
      "The design of common objects often evolves based on user feedback"
    ],
    concepts: [
      "Abstract concepts can often be understood through concrete metaphors",
      "Many languages share similar concept-based riddles"
    ],
    nature: [
      "Natural phenomena have inspired many technological innovations",
      "Ancient cultures often used nature-based riddles in storytelling"
    ]
  }

  return {
    relatedRiddles: getRandomItems(relatedRiddles, 2),
    funFacts: funFacts[riddle.theme as keyof typeof funFacts],
    culturalContext: `Riddles about ${riddle.theme} are common across many cultures and time periods.`
  }
}

export async function generateRiddle(settings: RiddleSettings): Promise<RiddlePuzzle> {
  // Filter riddles based on settings
  const availableRiddles = filterRiddlesByDifficulty(riddleTemplates, settings)

  if (availableRiddles.length === 0) {
    throw new Error('No riddles match the specified criteria')
  }

  // Select a random riddle
  const selectedRiddle = getRandomItems(availableRiddles, 1)[0]

  // Select clues based on difficulty and settings
  const clueCount = settings.clueCount || {
    easy: 3,
    medium: 2,
    hard: 1
  }[settings.difficulty]

  const selectedClues = getRandomItems(selectedRiddle.clues, clueCount)

  // Generate hints if enabled
  const hints = settings.showHints
    ? generateHints(selectedRiddle, settings.difficulty)
    : undefined

  // Generate additional information
  const additionalInfo = generateAdditionalInfo(selectedRiddle)

  return {
    question: selectedRiddle.question,
    clues: selectedClues,
    hints,
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    timeEstimate: {
      easy: 60,
      medium: 120,
      hard: 180
    }[settings.difficulty],
    solution: selectedRiddle.answer,
    theme: selectedRiddle.theme,
    additionalInfo
  }
}
