import type { GrammarFixSettings, GrammarFixPuzzle, GrammarError, GrammarSentence } from './types'
import { getRandomItems } from '../utils'

// Sample grammar error database
const grammarErrors: Record<GrammarError['type'], GrammarError[]> = {
  spelling: [
    {
      type: 'spelling',
      description: 'Common misspelling',
      incorrectText: 'recieve',
      correctText: 'receive',
      explanation: 'Remember the rule: i before e, except after c'
    },
    {
      type: 'spelling',
      description: 'Double consonant error',
      incorrectText: 'begining',
      correctText: 'beginning',
      explanation: 'Double the n when adding -ing to begin'
    }
  ],
  punctuation: [
    {
      type: 'punctuation',
      description: 'Missing comma in compound sentence',
      incorrectText: 'I love reading and she loves writing',
      correctText: 'I love reading, and she loves writing',
      explanation: 'Use a comma before coordinating conjunctions in compound sentences'
    },
    {
      type: 'punctuation',
      description: 'Incorrect apostrophe usage',
      incorrectText: 'The dogs tail',
      correctText: "The dog's tail",
      explanation: 'Use an apostrophe to show possession'
    }
  ],
  agreement: [
    {
      type: 'agreement',
      description: 'Subject-verb agreement',
      incorrectText: 'The team of players were excited',
      correctText: 'The team of players was excited',
      explanation: 'The subject (team) is singular, so use a singular verb (was)'
    },
    {
      type: 'agreement',
      description: 'Pronoun agreement',
      incorrectText: 'Each student must bring their book',
      correctText: 'Each student must bring his or her book',
      explanation: 'Each is singular, so use singular pronouns'
    }
  ],
  tense: [
    {
      type: 'tense',
      description: 'Inconsistent tense',
      incorrectText: 'Yesterday I go to the store and bought milk',
      correctText: 'Yesterday I went to the store and bought milk',
      explanation: 'Maintain consistent past tense throughout'
    },
    {
      type: 'tense',
      description: 'Wrong past participle',
      incorrectText: 'I have went to Paris',
      correctText: 'I have gone to Paris',
      explanation: 'Use gone, not went, with have/has/had'
    }
  ],
  structure: [
    {
      type: 'structure',
      description: 'Dangling modifier',
      incorrectText: 'Walking down the street, the trees were beautiful',
      correctText: 'Walking down the street, I saw the beautiful trees',
      explanation: 'The subject must be the one performing the action'
    },
    {
      type: 'structure',
      description: 'Run-on sentence',
      incorrectText: 'It was raining I stayed inside',
      correctText: 'It was raining, so I stayed inside',
      explanation: 'Join independent clauses with proper punctuation or conjunctions'
    }
  ]
}

function generateSentence(
  difficulty: string,
  errorTypes: GrammarError['type'][],
  showHints: boolean
): GrammarSentence {
  // Select number of errors based on difficulty
  const errorCount = {
    easy: 1,
    medium: 2,
    hard: 3
  }[difficulty]

  // Select random error types
  const selectedTypes = getRandomItems(errorTypes, errorCount)
  
  // Get random errors of selected types
  const errors = selectedTypes.map(type => 
    getRandomItems(grammarErrors[type], 1)[0]
  )

  // Combine errors into a single sentence
  let original = errors[0].incorrectText
  let corrected = errors[0].correctText

  if (errors.length > 1) {
    // For multiple errors, we'll use template sentences
    switch (errors.length) {
      case 2:
        original = `${errors[0].incorrectText} while ${errors[1].incorrectText}`
        corrected = `${errors[0].correctText} while ${errors[1].correctText}`
        break
      case 3:
        original = `${errors[0].incorrectText} while ${errors[1].incorrectText} and ${errors[2].incorrectText}`
        corrected = `${errors[0].correctText} while ${errors[1].correctText} and ${errors[2].correctText}`
        break
    }
  }

  // Generate hint based on difficulty
  let hint: string | undefined
  if (showHints) {
    switch (difficulty) {
      case 'easy':
        hint = errors.map(e => e.explanation).join(' ')
        break
      case 'medium':
        hint = `Look for ${errors.map(e => e.type).join(' and ')} errors`
        break
      case 'hard':
        hint = `Contains ${errors.length} grammar errors`
        break
    }
  }

  return {
    original,
    errors,
    corrected,
    hint
  }
}

export async function generateGrammarFix(settings: GrammarFixSettings): Promise<GrammarFixPuzzle> {
  // Determine which error types to include
  const availableTypes = settings.errorTypes || 
    Object.keys(grammarErrors) as GrammarError['type'][]

  // Determine number of sentences based on difficulty
  const sentenceCount = settings.sentenceCount || {
    easy: 2,
    medium: 3,
    hard: 4
  }[settings.difficulty]

  // Generate sentences
  const sentences = Array(sentenceCount).fill(null).map(() =>
    generateSentence(
      settings.difficulty,
      availableTypes,
      settings.showHints
    )
  )

  // Calculate total errors
  const totalErrors = sentences.reduce(
    (sum, sentence) => sum + sentence.errors.length,
    0
  )

  // Get unique error types used
  const errorTypes = new Set(
    sentences.flatMap(s => s.errors.map(e => e.type))
  )

  return {
    sentences,
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    timeEstimate: totalErrors * {
      easy: 30,
      medium: 45,
      hard: 60
    }[settings.difficulty],
    solution: sentences.map(s => s.corrected),
    totalErrors,
    errorTypes
  }
}
