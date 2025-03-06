import type { GeographyQuizSettings, GeographyQuizPuzzle, Location, GeographyQuestion } from './types'
import { shuffleArray, getRandomItems } from '../utils'

// Sample geography database (in real implementation, this would be more extensive)
const geographyDatabase: Location[] = [
  {
    name: 'Paris',
    type: 'city',
    coordinates: [48.8566, 2.3522],
    facts: ['Capital of France', 'Home to the Eiffel Tower', 'Known as the City of Light']
  },
  {
    name: 'Mount Everest',
    type: 'mountain',
    coordinates: [27.9881, 86.9250],
    facts: ['Highest mountain on Earth', 'Located in the Himalayas', 'Height: 8,848 meters']
  },
  {
    name: 'Amazon River',
    type: 'river',
    coordinates: [-3.4653, -58.3800],
    facts: ['Longest river in South America', 'Flows through rainforest', 'Home to diverse wildlife']
  },
  {
    name: 'Great Wall of China',
    type: 'landmark',
    coordinates: [40.4319, 116.5704],
    facts: ['Ancient defensive wall', 'Over 21,000 kilometers long', 'UNESCO World Heritage site']
  },
  {
    name: 'Tokyo',
    type: 'city',
    coordinates: [35.6762, 139.6503],
    facts: ['Capital of Japan', 'Largest metropolitan area', 'Blend of modern and traditional']
  },
  // Add more locations as needed
]

function generateQuestion(
  location: Location,
  otherLocations: Location[],
  difficulty: string,
  showHints: boolean
): GeographyQuestion {
  const optionCount = {
    easy: 3,
    medium: 4,
    hard: 5
  }[difficulty]

  const wrongOptions = shuffleArray(
    otherLocations
      .filter(l => l.type === location.type && l.name !== location.name)
  ).slice(0, optionCount - 1)
  
  const options = shuffleArray([location.name, ...wrongOptions.map(o => o.name)])
  const correctIndex = options.indexOf(location.name)

  let hint: string | undefined
  if (showHints) {
    switch (difficulty) {
      case 'easy':
        hint = location.facts[0]
        break
      case 'medium':
        hint = `Located near ${location.coordinates[0].toFixed(1)}°N, ${location.coordinates[1].toFixed(1)}°E`
        break
      case 'hard':
        hint = location.facts[location.facts.length - 1]
        break
    }
  }

  return {
    location,
    options,
    correctIndex,
    hint
  }
}

export async function generateGeographyQuiz(settings: GeographyQuizSettings): Promise<GeographyQuizPuzzle> {
  // Filter locations by type if specified
  let availableLocations = settings.locationType
    ? geographyDatabase.filter(l => l.type === settings.locationType)
    : geographyDatabase

  // Determine number of questions based on difficulty
  const questionCount = settings.questionCount || {
    easy: 3,
    medium: 5,
    hard: 7
  }[settings.difficulty]

  // Select random locations for questions
  const selectedLocations = getRandomItems(availableLocations, questionCount)

  // Generate questions
  const questions = selectedLocations.map(location =>
    generateQuestion(
      location,
      availableLocations.filter(l => l !== location),
      settings.difficulty,
      settings.showHints
    )
  )

  // Calculate map center (average of all coordinates)
  const mapCenter: [number, number] = questions.reduce(
    (acc, q) => [
      acc[0] + q.location.coordinates[0] / questions.length,
      acc[1] + q.location.coordinates[1] / questions.length
    ],
    [0, 0]
  )

  // Calculate appropriate zoom level based on coordinate spread
  const latSpread = Math.max(...questions.map(q => q.location.coordinates[0])) -
                   Math.min(...questions.map(q => q.location.coordinates[0]))
  const lngSpread = Math.max(...questions.map(q => q.location.coordinates[1])) -
                   Math.min(...questions.map(q => q.location.coordinates[1]))
  const maxSpread = Math.max(latSpread, lngSpread)
  const mapZoom = Math.floor(Math.log2(360 / maxSpread)) - 1

  return {
    questions,
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    timeEstimate: questionCount * {
      easy: 20,
      medium: 30,
      hard: 45
    }[settings.difficulty],
    solution: questions.map(q => q.correctIndex),
    mapCenter,
    mapZoom
  }
}
