interface RiddleSettings {
  difficulty: 'easy' | 'medium' | 'hard'
  category: 'general' | 'wordplay' | 'math' | 'logic'
  language: 'en' | 'es' | 'fr'
  ageGroup: 'children' | 'teens' | 'adults'
  textColor: string
  backgroundColor: string
  accentColor: string
  fontSize: 'small' | 'medium' | 'large'
  printLayout: 'compact' | 'spacious'
  showHints: boolean
  showWordBank: boolean
  maxLength: number
}

interface Riddle {
  question: string
  answer: string
  hints: string[]
  category: string
  difficulty: string
  wordBank?: string[]
  explanation?: string
  relatedWords?: string[]
  type: 'text' | 'wordplay' | 'math' | 'logic'
}

const riddleTemplates: Record<string, Riddle[]> = {
  general: [
    {
      question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
      answer: "An echo",
      hints: ["I repeat what others say", "You can find me in mountains", "Sound waves create me"],
      category: "general",
      difficulty: "easy",
      type: "text",
      explanation: "An echo is a reflection of sound that occurs when sound waves bounce off surfaces.",
      relatedWords: ["sound", "reflection", "wave", "mountains", "canyon"]
    },
    {
      question: "The more you take, the more you leave behind. What am I?",
      answer: "Footsteps",
      hints: ["I'm made when you walk", "I show where you've been", "I'm marks on the ground"],
      category: "general",
      difficulty: "easy",
      type: "text",
      explanation: "As you walk, you leave footsteps behind, so the more steps you take, the more footprints you leave.",
      relatedWords: ["walk", "path", "tracks", "prints", "journey"]
    }
  ],
  wordplay: [
    {
      question: "What has keys but no locks, space but no room, and you can enter but not go in?",
      answer: "A keyboard",
      hints: ["I help you type", "I'm connected to computers", "I have letters and numbers"],
      category: "wordplay",
      difficulty: "medium",
      type: "wordplay",
      wordBank: ["keys", "locks", "space", "enter", "type"],
      explanation: "This riddle plays with multiple meanings of words: keyboard keys vs. door keys, spacebar vs. room space, enter key vs. entering a room.",
      relatedWords: ["computer", "typing", "input", "device", "buttons"]
    }
  ],
  math: [
    {
      question: "If two's company and three's a crowd, what are four and five?",
      answer: "Nine",
      hints: ["Think about addition", "It's a simple math problem", "Company + crowd = ?"],
      category: "math",
      difficulty: "medium",
      type: "math",
      explanation: "This riddle combines wordplay with basic addition: 4 + 5 = 9",
      relatedWords: ["addition", "numbers", "sum", "equation", "mathematics"]
    }
  ],
  logic: [
    {
      question: "What belongs to you but others use it more than you do?",
      answer: "Your name",
      hints: ["It's given to you at birth", "It's how people identify you", "It's personal but public"],
      category: "logic",
      difficulty: "hard",
      type: "logic",
      explanation: "Your name is uniquely yours, but it's used more often by others referring to you than by yourself.",
      relatedWords: ["identity", "personal", "reference", "call", "address"]
    }
  ]
}

export class RiddleGenerator {
  private settings: RiddleSettings
  private riddles: Riddle[] = []

  constructor(settings: RiddleSettings) {
    this.settings = settings
    this.loadRiddles()
  }

  private loadRiddles(): void {
    // Load riddles based on category and difficulty
    const categoryRiddles = riddleTemplates[this.settings.category] || []
    this.riddles = categoryRiddles.filter(riddle => 
      riddle.difficulty === this.settings.difficulty ||
      (this.settings.difficulty === 'hard' && riddle.difficulty === 'medium')
    )
  }

  private formatRiddle(riddle: Riddle): Riddle {
    // Format riddle based on settings
    const formatted = { ...riddle }

    // Truncate question if needed
    if (this.settings.maxLength > 0) {
      formatted.question = this.truncateText(formatted.question, this.settings.maxLength)
    }

    // Add word bank if enabled
    if (this.settings.showWordBank && formatted.type === 'wordplay') {
      formatted.wordBank = formatted.wordBank || []
      formatted.wordBank.push(...(formatted.relatedWords || []).slice(0, 3))
    }

    // Add hints if enabled
    if (!this.settings.showHints) {
      formatted.hints = []
    }

    return formatted
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  generate(): Riddle {
    if (this.riddles.length === 0) {
      throw new Error(`No riddles found for category: ${this.settings.category} and difficulty: ${this.settings.difficulty}`)
    }

    // Select a random riddle
    const selectedRiddle = this.shuffleArray(this.riddles)[0]
    return this.formatRiddle(selectedRiddle)
  }

  generateSet(count: number): Riddle[] {
    if (this.riddles.length === 0) {
      throw new Error(`No riddles found for category: ${this.settings.category} and difficulty: ${this.settings.difficulty}`)
    }

    // Select multiple unique riddles
    const shuffled = this.shuffleArray(this.riddles)
    const selected = shuffled.slice(0, Math.min(count, shuffled.length))
    return selected.map(riddle => this.formatRiddle(riddle))
  }

  getFontSize(): string {
    const sizes = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.25rem'
    }
    return sizes[this.settings.fontSize]
  }

  getSpacing(): string {
    return this.settings.printLayout === 'compact' ? '1rem' : '1.5rem'
  }
}

export type { RiddleSettings, Riddle }
