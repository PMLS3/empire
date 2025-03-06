<script setup lang="ts">
interface Template {
  id: string
  title: string
  description: string
  category: string
  subCategory?: string
  previewImage?: string
  tags: string[]
  type: 'line' | 'grid' | 'specialized'
  settings: {
    lineSpacing?: number
    gridSize?: number
    orientation?: 'portrait' | 'landscape'
    margins?: {
      top: number
      right: number
      bottom: number
      left: number
    }
    puzzleGrid?: {
      rows: number
      cols: number
      cellSize: number
    }
    recipeLayout?: {
      ingredientsWidth: number
      hasNutritionTable: boolean
      hasTimeInfo: boolean
    }
    photoLayout?: {
      columns: number
      spacing: number
      captionHeight: number
    }
    plannerLayout?: {
      type: 'daily' | 'weekly' | 'monthly'
      hasTimeSlots: boolean
      hasTrackers: boolean
    }
    childrenLayout?: {
      type: 'picture-book' | 'early-reader' | 'chapter-book'
      hasIllustrationArea: boolean
      hasTextArea: boolean
      textPosition: 'top' | 'bottom' | 'left' | 'right'
    }
    activityLayout?: {
      type: 'maze' | 'connect-dots' | 'coloring' | 'worksheet'
      difficulty: 'easy' | 'medium' | 'hard'
      hasInstructions: boolean
      hasAnswerArea: boolean
    }
  }
}

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', layout: Template): void
}>()

const selectedLayout = ref<Template | null>(null)
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedType = ref('all')

// Template categories
const categories = [
  { id: 'all', label: 'All Templates' },
  { id: 'educational', label: 'Educational', icon: 'ph:student-duotone' },
  { id: 'creative', label: 'Creative', icon: 'ph:paint-brush-duotone' },
  { id: 'business', label: 'Business', icon: 'ph:briefcase-duotone' },
  { id: 'personal', label: 'Personal', icon: 'ph:user-duotone' },
  { id: 'puzzle', label: 'Puzzle Books', icon: 'ph:puzzle-piece-duotone' },
  { id: 'cookbook', label: 'Cookbooks', icon: 'ph:cookie-duotone' },
  { id: 'photobook', label: 'Photo Books', icon: 'ph:camera-duotone' },
  { id: 'planner', label: 'Planners', icon: 'ph:calendar-duotone' },
  { id: 'children', label: 'Children\'s Books', icon: 'ph:baby-duotone' },
  { id: 'activity', label: 'Activity Books', icon: 'ph:pencil-duotone' }
]

// Template types
const types = [
  { id: 'all', label: 'All Types' },
  { id: 'line', label: 'Lined Paper' },
  { id: 'grid', label: 'Grid Paper' },
  { id: 'specialized', label: 'Specialized' }
]

// Template library
const templates = ref<Template[]>([
  // Line Types
  {
    id: 'wide-ruled',
    title: 'Wide Ruled',
    description: 'Standard wide-ruled paper with 11/32 inch spacing',
    category: 'educational',
    type: 'line',
    tags: ['lined', 'writing', 'notes'],
    settings: { lineSpacing: 0.34375 }
  },
  {
    id: 'college-ruled',
    title: 'College Ruled',
    description: 'College ruled paper with 9/32 inch spacing',
    category: 'educational',
    type: 'line',
    tags: ['lined', 'writing', 'notes'],
    settings: { lineSpacing: 0.28125 }
  },
  {
    id: 'narrow-ruled',
    title: 'Narrow Ruled',
    description: 'Narrow ruled paper with 1/4 inch spacing',
    category: 'educational',
    type: 'line',
    tags: ['lined', 'writing', 'notes'],
    settings: { lineSpacing: 0.25 }
  },
  {
    id: 'music-staff',
    title: 'Music Staff',
    description: 'Standard music staff paper with 5 lines per staff',
    category: 'creative',
    type: 'specialized',
    tags: ['music', 'composition', 'staff'],
    settings: { lineSpacing: 0.2 }
  },
  {
    id: 'guitar-tab',
    title: 'Guitar Tablature',
    description: '6-line guitar tablature paper',
    category: 'creative',
    type: 'specialized',
    tags: ['music', 'guitar', 'tab'],
    settings: { lineSpacing: 0.25 }
  },
  // Grid Types
  {
    id: 'dot-grid',
    title: 'Dot Grid',
    description: 'Dot grid paper with 5mm spacing',
    category: 'creative',
    type: 'grid',
    tags: ['grid', 'bullet journal', 'planning'],
    settings: { gridSize: 5 }
  },
  {
    id: 'graph-paper',
    title: 'Graph Paper',
    description: 'Standard graph paper with 4x4 grid per inch',
    category: 'educational',
    type: 'grid',
    tags: ['grid', 'math', 'engineering'],
    settings: { gridSize: 6.35 }
  },
  {
    id: 'isometric-grid',
    title: 'Isometric Grid',
    description: 'Isometric grid for 3D drawings',
    category: 'creative',
    type: 'grid',
    tags: ['grid', 'drawing', '3d'],
    settings: { gridSize: 10 }
  },
  // Specialized Templates
  {
    id: 'cornell-notes',
    title: 'Cornell Notes',
    description: 'Cornell note-taking system template',
    category: 'educational',
    type: 'specialized',
    tags: ['notes', 'study', 'organization'],
    settings: {
      margins: { top: 2, right: 2, bottom: 2, left: 6 }
    }
  },
  {
    id: 'bullet-journal',
    title: 'Bullet Journal',
    description: 'Bullet journal template with index and key',
    category: 'personal',
    type: 'specialized',
    tags: ['planning', 'organization', 'journaling'],
    settings: {
      margins: { top: 2, right: 2, bottom: 2, left: 2 }
    }
  },
  {
    id: 'meeting-notes',
    title: 'Meeting Notes',
    description: 'Professional meeting notes template',
    category: 'business',
    type: 'specialized',
    tags: ['notes', 'business', 'meetings'],
    settings: {
      margins: { top: 3, right: 2, bottom: 2, left: 2 }
    }
  },
  // Puzzle Book Templates
  {
    id: 'crossword-puzzle',
    title: 'Crossword Puzzle',
    description: '15x15 crossword puzzle grid with clue sections',
    category: 'puzzle',
    type: 'specialized',
    tags: ['puzzle', 'crossword', 'game'],
    settings: {
      puzzleGrid: { rows: 15, cols: 15, cellSize: 20 },
      margins: { top: 2, right: 2, bottom: 4, left: 2 }
    }
  },
  {
    id: 'sudoku-grid',
    title: 'Sudoku Grid',
    description: '9x9 sudoku puzzle with solution space',
    category: 'puzzle',
    type: 'specialized',
    tags: ['puzzle', 'sudoku', 'game'],
    settings: {
      puzzleGrid: { rows: 9, cols: 9, cellSize: 30 },
      margins: { top: 2, right: 2, bottom: 2, left: 2 }
    }
  },
  // Cookbook Templates
  {
    id: 'recipe-full',
    title: 'Full Recipe Page',
    description: 'Complete recipe layout with ingredients, steps, and nutrition info',
    category: 'cookbook',
    type: 'specialized',
    tags: ['recipe', 'cooking', 'food'],
    settings: {
      recipeLayout: {
        ingredientsWidth: 30,
        hasNutritionTable: true,
        hasTimeInfo: true
      },
      margins: { top: 2, right: 2, bottom: 2, left: 2 }
    }
  },
  {
    id: 'recipe-collection',
    title: 'Recipe Collection',
    description: 'Two recipes per page with shared ingredients list',
    category: 'cookbook',
    type: 'specialized',
    tags: ['recipe', 'cooking', 'collection'],
    settings: {
      recipeLayout: {
        ingredientsWidth: 25,
        hasNutritionTable: false,
        hasTimeInfo: true
      },
      margins: { top: 2, right: 2, bottom: 2, left: 2 }
    }
  },
  // Photo Book Templates
  {
    id: 'photo-grid-2x2',
    title: '2x2 Photo Grid',
    description: 'Four photos in a grid with captions',
    category: 'photobook',
    type: 'specialized',
    tags: ['photos', 'gallery', 'grid'],
    settings: {
      photoLayout: {
        columns: 2,
        spacing: 20,
        captionHeight: 40
      },
      margins: { top: 2, right: 2, bottom: 2, left: 2 }
    }
  },
  {
    id: 'photo-feature',
    title: 'Feature Photo',
    description: 'Single large photo with detailed caption',
    category: 'photobook',
    type: 'specialized',
    tags: ['photos', 'feature', 'showcase'],
    settings: {
      photoLayout: {
        columns: 1,
        spacing: 0,
        captionHeight: 60
      },
      margins: { top: 2, right: 2, bottom: 2, left: 2 }
    }
  },
  // Planner Templates
  {
    id: 'daily-planner',
    title: 'Daily Planner',
    description: 'Detailed daily schedule with tasks and notes',
    category: 'planner',
    type: 'specialized',
    tags: ['planner', 'daily', 'schedule'],
    settings: {
      plannerLayout: {
        type: 'daily',
        hasTimeSlots: true,
        hasTrackers: true
      },
      margins: { top: 2, right: 2, bottom: 2, left: 2 }
    }
  },
  {
    id: 'weekly-overview',
    title: 'Weekly Overview',
    description: 'Week at a glance with goals and habit tracking',
    category: 'planner',
    type: 'specialized',
    tags: ['planner', 'weekly', 'overview'],
    settings: {
      plannerLayout: {
        type: 'weekly',
        hasTimeSlots: false,
        hasTrackers: true
      },
      margins: { top: 2, right: 2, bottom: 2, left: 2 }
    }
  },
  // Children's Book Templates
  {
    id: 'picture-book-standard',
    title: 'Picture Book - Standard',
    description: 'Classic picture book layout with illustration area and text below',
    category: 'children',
    type: 'specialized',
    tags: ['children', 'picture book', 'illustration'],
    settings: {
      childrenLayout: {
        type: 'picture-book',
        hasIllustrationArea: true,
        hasTextArea: true,
        textPosition: 'bottom'
      },
      margins: { top: 2, right: 2, bottom: 2, left: 2 }
    }
  },
  {
    id: 'picture-book-full',
    title: 'Picture Book - Full Page',
    description: 'Full page illustration with text overlay area',
    category: 'children',
    type: 'specialized',
    tags: ['children', 'picture book', 'illustration'],
    settings: {
      childrenLayout: {
        type: 'picture-book',
        hasIllustrationArea: true,
        hasTextArea: true,
        textPosition: 'bottom'
      },
      margins: { top: 0, right: 0, bottom: 0, left: 0 }
    }
  },
  {
    id: 'early-reader',
    title: 'Early Reader',
    description: 'Split layout with illustration and large text for beginning readers',
    category: 'children',
    type: 'specialized',
    tags: ['children', 'early reader', 'learning'],
    settings: {
      childrenLayout: {
        type: 'early-reader',
        hasIllustrationArea: true,
        hasTextArea: true,
        textPosition: 'right'
      },
      margins: { top: 2, right: 2, bottom: 2, left: 2 }
    }
  },
  {
    id: 'chapter-book-start',
    title: 'Chapter Book - Chapter Start',
    description: 'Chapter opening page with illustration and title',
    category: 'children',
    type: 'specialized',
    tags: ['children', 'chapter book', 'illustration'],
    settings: {
      childrenLayout: {
        type: 'chapter-book',
        hasIllustrationArea: true,
        hasTextArea: true,
        textPosition: 'bottom'
      },
      margins: { top: 2, right: 2, bottom: 2, left: 2 }
    }
  },
  // Activity Book Templates
  {
    id: 'maze-simple',
    title: 'Simple Maze',
    description: 'Easy maze puzzle with wide paths',
    category: 'activity',
    type: 'specialized',
    tags: ['activity', 'maze', 'puzzle'],
    settings: {
      activityLayout: {
        type: 'maze',
        difficulty: 'easy',
        hasInstructions: true,
        hasAnswerArea: false
      },
      margins: { top: 2, right: 2, bottom: 2, left: 2 }
    }
  },
  {
    id: 'connect-dots',
    title: 'Connect the Dots',
    description: 'Connect-the-dots puzzle with numbers',
    category: 'activity',
    type: 'specialized',
    tags: ['activity', 'connect dots', 'puzzle'],
    settings: {
      activityLayout: {
        type: 'connect-dots',
        difficulty: 'medium',
        hasInstructions: true,
        hasAnswerArea: false
      },
      margins: { top: 2, right: 2, bottom: 2, left: 2 }
    }
  },
  {
    id: 'coloring-page',
    title: 'Coloring Page',
    description: 'Detailed coloring page with guidelines',
    category: 'activity',
    type: 'specialized',
    tags: ['activity', 'coloring', 'art'],
    settings: {
      activityLayout: {
        type: 'coloring',
        difficulty: 'medium',
        hasInstructions: true,
        hasAnswerArea: false
      },
      margins: { top: 2, right: 2, bottom: 2, left: 2 }
    }
  },
  {
    id: 'worksheet-mixed',
    title: 'Mixed Activities',
    description: 'Combination of different activities on one page',
    category: 'activity',
    type: 'specialized',
    tags: ['activity', 'worksheet', 'mixed'],
    settings: {
      activityLayout: {
        type: 'worksheet',
        difficulty: 'medium',
        hasInstructions: true,
        hasAnswerArea: true
      },
      margins: { top: 2, right: 2, bottom: 2, left: 2 }
    }
  },
  // Educational Templates
  {
    id: 'math-worksheet',
    title: 'Math Worksheet',
    description: 'Math problem solving template with work area and answer boxes',
    category: 'educational',
    type: 'specialized',
    tags: ['education', 'math', 'worksheet'],
    settings: {
      puzzleGrid: { rows: 10, cols: 2, cellSize: 30 },
      margins: { top: 2, right: 2, bottom: 2, left: 2 },
      activityLayout: {
        type: 'worksheet',
        difficulty: 'medium',
        hasInstructions: true,
        hasAnswerArea: true
      }
    }
  },
  {
    id: 'chemistry-lab',
    title: 'Chemistry Lab',
    description: 'Laboratory notebook with experiment sections and data tables',
    category: 'educational',
    type: 'specialized',
    tags: ['education', 'chemistry', 'science'],
    settings: {
      margins: { top: 2, right: 2, bottom: 2, left: 2 },
      gridSize: 5,
      activityLayout: {
        type: 'worksheet',
        difficulty: 'medium',
        hasInstructions: true,
        hasAnswerArea: false
      }
    }
  },
  {
    id: 'language-practice',
    title: 'Language Practice',
    description: 'Language learning template with vocabulary and grammar sections',
    category: 'educational',
    type: 'specialized',
    tags: ['education', 'language', 'learning'],
    settings: {
      margins: { top: 2, right: 2, bottom: 2, left: 2 },
      lineSpacing: 0.3,
      activityLayout: {
        type: 'worksheet',
        difficulty: 'medium',
        hasInstructions: true,
        hasAnswerArea: false
      }
    }
  },
  {
    id: 'timeline-template',
    title: 'Timeline Template',
    description: 'Historical timeline with event descriptions and dates',
    category: 'educational',
    type: 'specialized',
    tags: ['education', 'history', 'timeline'],
    settings: {
      margins: { top: 2, right: 2, bottom: 2, left: 2 },
      orientation: 'landscape'
    }
  },
  {
    id: 'observation-log',
    title: 'Scientific Observation',
    description: 'Scientific observation log with data collection areas',
    category: 'educational',
    type: 'specialized',
    tags: ['education', 'science', 'research'],
    settings: {
      margins: { top: 2, right: 2, bottom: 2, left: 2 },
      gridSize: 5,
      activityLayout: {
        type: 'worksheet',
        difficulty: 'medium',
        hasInstructions: true,
        hasAnswerArea: false
      }
    }
  },
  // Creative Templates
  {
    id: 'comic-page',
    title: 'Comic Page',
    description: '9-panel comic book layout with customizable grid',
    category: 'creative',
    type: 'specialized',
    tags: ['creative', 'comic', 'art'],
    settings: {
      puzzleGrid: { rows: 3, cols: 3, cellSize: 40 },
      margins: { top: 1, right: 1, bottom: 1, left: 1 }
    }
  },
  {
    id: 'storyboard',
    title: 'Storyboard',
    description: '6-frame storyboard with description areas',
    category: 'creative',
    type: 'specialized',
    tags: ['creative', 'storyboard', 'film'],
    settings: {
      puzzleGrid: { rows: 3, cols: 2, cellSize: 50 },
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      activityLayout: {
        type: 'worksheet',
        difficulty: 'medium',
        hasInstructions: true,
        hasAnswerArea: false
      }
    }
  },
  {
    id: 'manga-page',
    title: 'Manga Page',
    description: 'Flexible manga layout with dynamic panel arrangement',
    category: 'creative',
    type: 'specialized',
    tags: ['creative', 'manga', 'comic'],
    settings: {
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      orientation: 'portrait'
    }
  },
  {
    id: 'art-journal',
    title: 'Art Journal',
    description: 'Mixed media art journal with text and sketch areas',
    category: 'creative',
    type: 'specialized',
    tags: ['creative', 'art', 'journal'],
    settings: {
      margins: { top: 2, right: 2, bottom: 2, left: 2 },
      gridSize: 10,
      activityLayout: {
        type: 'coloring',
        difficulty: 'medium',
        hasInstructions: false,
        hasAnswerArea: false
      }
    }
  },
  {
    id: 'coloring-book',
    title: 'Coloring Book',
    description: 'Coloring book template with illustration area and border',
    category: 'creative',
    type: 'specialized',
    tags: ['creative', 'coloring', 'art'],
    settings: {
      margins: { top: 2, right: 2, bottom: 2, left: 2 },
      activityLayout: {
        type: 'coloring',
        difficulty: 'medium',
        hasInstructions: false,
        hasAnswerArea: false
      }
    }
  }
])

const { generatePreview } = useTemplatePreview()

// Generate previews for all templates
const previewWidth = 300
const previewHeight = 400

// Add previewImage to templates
templates.value = templates.value.map(template => ({
  ...template,
  previewImage: generatePreview(template, previewWidth, previewHeight)
}))

// Filtered templates
const filteredTemplates = computed(() => {
  return templates.value.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))

    const matchesCategory = selectedCategory.value === 'all' || template.category === selectedCategory.value
    const matchesType = selectedType.value === 'all' || template.type === selectedType.value

    return matchesSearch && matchesCategory && matchesType
  })
})

const showCustomizer = ref(false)
const selectedTemplate = ref<Template | null>(null)

const handleTemplateClick = (template: Template) => {
  selectedTemplate.value = template
  showCustomizer.value = true
}

const handleCustomizerClose = () => {
  showCustomizer.value = false
  selectedTemplate.value = null
}

const handleCustomizerApply = (template: Template) => {
  emit('select', template)
  emit('close')
}
</script>

<template>
  <Modal
    :open="open"
    size="7xl"
    footer-align="start"
    @close="emit('close')"
  >
    <template #header>
      <div class="flex w-full items-center justify-between p-4 md:p-6">
        <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
          Choose Template
        </h3>
        <BaseButtonClose @click="emit('close')" />
      </div>
    </template>

    <div class="p-4 md:p-6">
      <!-- Search and Filters -->
      <div class="mb-6 flex flex-wrap gap-4">
        <!-- Search -->
        <div class="flex-1">
          <FormInput
            v-model="searchQuery"
            placeholder="Search templates..."
            icon="ph:magnifying-glass"
          />
        </div>

        <!-- Category Filter -->
        <div class="w-48">
          <FormSelect
            v-model="selectedCategory"
            placeholder="Category"
          >
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.label }}
            </option>
          </FormSelect>
        </div>

        <!-- Type Filter -->
        <div class="w-48">
          <FormSelect
            v-model="selectedType"
            placeholder="Type"
          >
            <option
              v-for="type in types"
              :key="type.id"
              :value="type.id"
            >
              {{ type.label }}
            </option>
          </FormSelect>
        </div>
      </div>

      <!-- Template Grid -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="group relative cursor-pointer overflow-hidden rounded-lg border border-muted-200 bg-white transition-all duration-300 hover:border-primary-500 hover:shadow-lg dark:border-muted-700 dark:bg-muted-800"
          @click="handleTemplateClick(template)"
        >
          <!-- Preview Image -->
          <div class="aspect-[4/5] w-full bg-muted-100 dark:bg-muted-900">
            <img
              v-if="template.previewImage"
              :src="template.previewImage"
              :alt="template.title"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center"
            >
              <Icon
                :name="categories.find(c => c.id === template.category)?.icon || 'ph:file-text'"
                class="h-12 w-12 text-muted-400"
              />
            </div>
          </div>

          <!-- Template Info -->
          <div class="p-4">
            <h4 class="font-heading text-muted-900 mb-1 text-base font-medium dark:text-white">
              {{ template.title }}
            </h4>
            <p class="text-muted-500 line-clamp-2 text-sm dark:text-muted-400">
              {{ template.description }}
            </p>

            <!-- Tags -->
            <div class="mt-2 flex flex-wrap gap-1">
              <span
                v-for="tag in template.tags"
                :key="tag"
                class="text-muted-400 bg-muted-100 dark:bg-muted-700 dark:text-muted-300 rounded-full px-2 py-0.5 text-xs"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Selection Indicator -->
          <div
            class="absolute inset-0 flex items-center justify-center bg-primary-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <Icon
              name="ph:check-circle-fill"
              class="h-12 w-12 text-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  </Modal>

  <!-- Template Customizer -->
  <TemplateCustomizer
    v-if="selectedTemplate"
    :template="selectedTemplate"
    :open="showCustomizer"
    @close="handleCustomizerClose"
    @apply="handleCustomizerApply"
  />
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
