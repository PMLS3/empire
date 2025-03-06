<script lang="ts" setup>
interface Template {
  id: string
  title: string
  description: string
  category: string
  previewImage: string
  pages: any[] // Will be properly typed when we implement the full template system
  settings: {
    size: {
      width: number
      length: number
    }
    theme: {
      colors: string[]
      fonts: string[]
    }
  }
}

const templates = ref<Template[]>([
  {
    id: '1',
    title: 'Novel',
    description: 'Classic novel layout with chapter structure',
    category: 'Fiction',
    previewImage: '/templates/novel.jpg',
    pages: [],
    settings: {
      size: { width: 6, length: 9 },
      theme: {
        colors: ['#000000', '#333333'],
        fonts: ['Georgia', 'Times New Roman']
      }
    }
  },
  {
    id: '2',
    title: 'Children\'s Book',
    description: 'Colorful layout for children\'s stories',
    category: 'Children',
    previewImage: '/templates/children.jpg',
    pages: [],
    settings: {
      size: { width: 8.5, length: 8.5 },
      theme: {
        colors: ['#FF6B6B', '#4ECDC4'],
        fonts: ['Comic Sans MS', 'Arial']
      }
    }
  },
  {
    id: '3',
    title: 'Photo Book',
    description: 'Layout optimized for photo collections',
    category: 'Photography',
    previewImage: '/templates/photobook.jpg',
    pages: [],
    settings: {
      size: { width: 11, length: 8.5 },
      theme: {
        colors: ['#FFFFFF', '#000000'],
        fonts: ['Helvetica', 'Arial']
      }
    }
  },
  {
    id: '4',
    title: 'Cookbook',
    description: 'Recipe book layout with ingredient lists',
    category: 'Cooking',
    previewImage: '/templates/cookbook.jpg',
    pages: [],
    settings: {
      size: { width: 8.5, length: 11 },
      theme: {
        colors: ['#2C3E50', '#E74C3C'],
        fonts: ['Open Sans', 'Merriweather']
      }
    }
  },
  {
    id: '5',
    title: 'Poetry Collection',
    description: 'Elegant layout for poetry and verse',
    category: 'Poetry',
    previewImage: '/templates/poetry.jpg',
    pages: [],
    settings: {
      size: { width: 5.5, length: 8.5 },
      theme: {
        colors: ['#2C3E50', '#BDC3C7'],
        fonts: ['Garamond', 'Baskerville']
      }
    }
  },
  {
    id: '6',
    title: 'Academic Textbook',
    description: 'Professional layout for educational content',
    category: 'Education',
    previewImage: '/templates/textbook.jpg',
    pages: [],
    settings: {
      size: { width: 7, length: 10 },
      theme: {
        colors: ['#34495E', '#3498DB'],
        fonts: ['Roboto', 'Source Sans Pro']
      }
    }
  },
  {
    id: '7',
    title: 'Comic Book',
    description: 'Dynamic layout for comics and graphic novels',
    category: 'Comics',
    previewImage: '/templates/comic.jpg',
    pages: [],
    settings: {
      size: { width: 6.625, length: 10.25 },
      theme: {
        colors: ['#E74C3C', '#F1C40F'],
        fonts: ['Comic Neue', 'Bangers']
      }
    }
  },
  {
    id: '8',
    title: 'Art Portfolio',
    description: 'Showcase your artwork professionally',
    category: 'Art',
    previewImage: '/templates/portfolio.jpg',
    pages: [],
    settings: {
      size: { width: 12, length: 12 },
      theme: {
        colors: ['#FFFFFF', '#333333'],
        fonts: ['Montserrat', 'Lato']
      }
    }
  },
  {
    id: '9',
    title: 'Magazine',
    description: 'Modern magazine-style layout',
    category: 'Magazine',
    previewImage: '/templates/magazine.jpg',
    pages: [],
    settings: {
      size: { width: 8.5, length: 11 },
      theme: {
        colors: ['#9B59B6', '#3498DB'],
        fonts: ['Futura', 'Helvetica Neue']
      }
    }
  },
  {
    id: '10',
    title: 'Activity Book',
    description: 'Interactive layout for puzzles and activities',
    category: 'Education',
    previewImage: '/templates/activity.jpg',
    pages: [],
    settings: {
      size: { width: 8.5, length: 11 },
      theme: {
        colors: ['#27AE60', '#F1C40F'],
        fonts: ['Comic Sans MS', 'Verdana']
      }
    }
  }
])

const categories = computed(() => {
  const uniqueCategories = new Set(templates.value.map(t => t.category))
  return ['All', ...Array.from(uniqueCategories)]
})

const selectedCategory = ref('All')
const searchQuery = ref('')

const filteredTemplates = computed(() => {
  return templates.value.filter(template => {
    const matchesCategory = selectedCategory.value === 'All' || template.category === selectedCategory.value
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

const emit = defineEmits(['select'])

const selectTemplate = (template: Template) => {
  emit('select', template)
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Filters -->
    <div class="flex items-center gap-4">
      <BaseInput
        v-model="searchQuery"
        placeholder="Search templates..."
        class="w-64"
      >
        <template #prefix>
          <Icon name="ph:magnifying-glass" class="h-5 w-5 text-gray-400" />
        </template>
      </BaseInput>

      <BaseButtonGroup>
        <BaseButton
          v-for="category in categories"
          :key="category"
          :variant="selectedCategory === category ? 'solid' : 'ghost'"
          color="gray"
          @click="selectedCategory = category"
        >
          {{ category }}
        </BaseButton>
      </BaseButtonGroup>
    </div>

    <!-- Template Grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <BaseCard
        v-for="template in filteredTemplates"
        :key="template.id"
        class="cursor-pointer hover:shadow-lg transition-shadow duration-200"
        @click="selectTemplate(template)"
      >
        <!-- Preview Image -->
        <div class="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
          <img
            v-if="template.previewImage"
            :src="template.previewImage"
            :alt="template.title"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-gray-400"
          >
            <Icon name="ph:book-open" class="h-12 w-12" />
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <h3 class="font-medium text-gray-900 dark:text-white">{{ template.title }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ template.description }}</p>
          
          <!-- Template Details -->
          <div class="mt-4 flex flex-wrap gap-2">
            <BaseTag color="primary">
              {{ template.category }}
            </BaseTag>
            <BaseTag color="gray">
              {{ template.settings.size.width }}" × {{ template.settings.size.length }}"
            </BaseTag>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
