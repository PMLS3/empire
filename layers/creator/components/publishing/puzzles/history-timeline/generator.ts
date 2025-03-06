import type { HistoryTimelineSettings, HistoryTimelinePuzzle, HistoricalEvent, TimelinePeriod } from './types'
import { shuffleArray, getRandomItems } from '../utils'

// Sample historical events database
const historicalEvents: HistoricalEvent[] = [
  {
    title: 'Declaration of Independence',
    date: '1776-07-04',
    description: 'American colonies declare independence from Great Britain',
    category: 'politics',
    importance: 'major'
  },
  {
    title: 'Constitution Ratified',
    date: '1788-06-21',
    description: 'United States Constitution is ratified',
    category: 'politics',
    importance: 'major',
    relatedEvents: ['Declaration of Independence']
  },
  {
    title: 'Louisiana Purchase',
    date: '1803-04-30',
    description: 'United States purchases Louisiana Territory from France',
    category: 'territory',
    importance: 'major'
  },
  {
    title: 'War of 1812 Begins',
    date: '1812-06-18',
    description: 'United States declares war on Great Britain',
    category: 'war',
    importance: 'major'
  },
  {
    title: 'Monroe Doctrine',
    date: '1823-12-02',
    description: 'US warns European nations against colonizing the Americas',
    category: 'politics',
    importance: 'major'
  },
  // Add more events as needed
]

// Sample time periods
const timePeriods: TimelinePeriod[] = [
  {
    start: '1775-01-01',
    end: '1783-12-31',
    label: 'American Revolution',
    events: []
  },
  {
    start: '1800-01-01',
    end: '1850-12-31',
    label: 'Early American Republic',
    events: []
  },
  // Add more periods as needed
]

function findRelatedEvents(events: HistoricalEvent[]): Array<[number, number]> {
  const connections: Array<[number, number]> = []
  
  events.forEach((event, i) => {
    if (event.relatedEvents) {
      events.forEach((otherEvent, j) => {
        if (i !== j && event.relatedEvents?.includes(otherEvent.title)) {
          connections.push([i, j])
        }
      })
    }
  })

  return connections
}

function generateHint(event: HistoricalEvent, difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return `This event occurred in ${event.date.slice(0, 4)}`
    case 'medium':
      return `This ${event.importance} event is related to ${event.category}`
    case 'hard':
      return event.category
  }
}

export async function generateHistoryTimeline(settings: HistoryTimelineSettings): Promise<HistoryTimelinePuzzle> {
  // Get or select a time period
  const period = settings.period || getRandomItems(timePeriods, 1)[0]

  // Filter events by time period
  const periodEvents = historicalEvents.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= new Date(period.start) && eventDate <= new Date(period.end)
  })

  // Select events based on difficulty
  const eventCount = settings.eventCount || {
    easy: 4,
    medium: 6,
    hard: 8
  }[settings.difficulty]

  // Ensure we have enough major events based on difficulty
  const majorEventCount = {
    easy: Math.ceil(eventCount * 0.75),
    medium: Math.ceil(eventCount * 0.5),
    hard: Math.ceil(eventCount * 0.25)
  }[settings.difficulty]

  const majorEvents = getRandomItems(
    periodEvents.filter(e => e.importance === 'major'),
    majorEventCount
  )

  const minorEvents = getRandomItems(
    periodEvents.filter(e => e.importance === 'minor'),
    eventCount - majorEvents.length
  )

  const events = [...majorEvents, ...minorEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Create scrambled version
  const scrambledEvents = shuffleArray([...events])

  // Find connections between events
  const connections = findRelatedEvents(events)

  // Generate hints if enabled
  const hints = settings.showHints
    ? events.map(event => generateHint(event, settings.difficulty))
    : undefined

  // Calculate solution mapping
  const solution = scrambledEvents.map(event => 
    events.findIndex(e => e.title === event.title)
  )

  return {
    period,
    events,
    scrambledEvents,
    hints,
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor,
    timeEstimate: eventCount * {
      easy: 30,
      medium: 45,
      hard: 60
    }[settings.difficulty],
    solution,
    connections
  }
}
