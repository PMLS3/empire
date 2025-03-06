<script lang="ts" setup>
interface Layout {
  id: string
  name: string
  description: string
  category: string
  elements: any[]
  grid: {
    columns: number
    rows: number
  }
}

const presetLayouts: Layout[] = [
  {
    id: 'chapter-title',
    name: 'Chapter Title',
    description: 'Classic chapter opening layout',
    category: 'Chapter',
    elements: [
      {
        id: '1',
        type: 'heading',
        position: { x: 2, y: 2, width: 8, height: 2 },
        properties: { fontSize: 32, alignment: 'center' }
      },
      {
        id: '2',
        type: 'text',
        position: { x: 2, y: 4, width: 8, height: 4 },
        properties: { fontSize: 16, alignment: 'justify' }
      }
    ],
    grid: { columns: 12, rows: 12 }
  },
  {
    id: 'image-gallery',
    name: 'Image Gallery',
    description: 'Grid layout for multiple images',
    category: 'Gallery',
    elements: [
      {
        id: '1',
        type: 'image',
        position: { x: 1, y: 1, width: 4, height: 4 },
        properties: {}
      },
      {
        id: '2',
        type: 'image',
        position: { x: 7, y: 1, width: 4, height: 4 },
        properties: {}
      },
      {
        id: '3',
        type: 'image',
        position: { x: 1, y: 7, width: 4, height: 4 },
        properties: {}
      },
      {
        id: '4',
        type: 'image',
        position: { x: 7, y: 7, width: 4, height: 4 },
        properties: {}
      }
    ],
    grid: { columns: 12, rows: 12 }
  },
  {
    id: 'text-columns',
    name: 'Text Columns',
    description: 'Two-column text layout',
    category: 'Content',
    elements: [
      {
        id: '1',
        type: 'text',
        position: { x: 0, y: 0, width: 5, height: 12 },
        properties: { fontSize: 14, alignment: 'justify' }
      },
      {
        id: '2',
        type: 'text',
        position: { x: 7, y: 0, width: 5, height: 12 },
        properties: { fontSize: 14, alignment: 'justify' }
      }
    ],
    grid: { columns: 12, rows: 12 }
  },
  {
    id: 'title-page',
    name: 'Title Page',
    description: 'Book title page layout',
    category: 'Title',
    elements: [
      {
        id: '1',
        type: 'heading',
        position: { x: 2, y: 3, width: 8, height: 2 },
        properties: { fontSize: 42, alignment: 'center' }
      },
      {
        id: '2',
        type: 'text',
        position: { x: 3, y: 6, width: 6, height: 1 },
        properties: { fontSize: 18, alignment: 'center' }
      },
      {
        id: '3',
        type: 'text',
        position: { x: 4, y: 8, width: 4, height: 1 },
        properties: { fontSize: 14, alignment: 'center' }
      }
    ],
    grid: { columns: 12, rows: 12 }
  },
  {
    id: 'recipe-page',
    name: 'Recipe Page',
    description: 'Layout for cookbook recipes',
    category: 'Cookbook',
    elements: [
      {
        id: '1',
        type: 'heading',
        position: { x: 1, y: 0, width: 10, height: 1 },
        properties: { fontSize: 24, alignment: 'left' }
      },
      {
        id: '2',
        type: 'image',
        position: { x: 1, y: 1.5, width: 5, height: 5 },
        properties: {}
      },
      {
        id: '3',
        type: 'list',
        position: { x: 7, y: 1.5, width: 4, height: 5 },
        properties: { fontSize: 14, spacing: 8 }
      },
      {
        id: '4',
        type: 'text',
        position: { x: 1, y: 7, width: 10, height: 5 },
        properties: { fontSize: 14, alignment: 'left' }
      }
    ],
    grid: { columns: 12, rows: 12 }
  },
  {
    id: 'poetry-page',
    name: 'Poetry Page',
    description: 'Elegant layout for poems',
    category: 'Poetry',
    elements: [
      {
        id: '1',
        type: 'heading',
        position: { x: 2, y: 1, width: 8, height: 1 },
        properties: { fontSize: 24, alignment: 'center', fontFamily: 'Garamond' }
      },
      {
        id: '2',
        type: 'text',
        position: { x: 3, y: 3, width: 6, height: 7 },
        properties: { fontSize: 16, alignment: 'center', fontFamily: 'Garamond' }
      },
      {
        id: '3',
        type: 'text',
        position: { x: 8, y: 10, width: 3, height: 1 },
        properties: { fontSize: 12, alignment: 'right', fontFamily: 'Garamond' }
      }
    ],
    grid: { columns: 12, rows: 12 }
  },
  {
    id: 'comic-page',
    name: 'Comic Page',
    description: 'Grid layout for comic panels',
    category: 'Comics',
    elements: [
      {
        id: '1',
        type: 'image',
        position: { x: 0, y: 0, width: 6, height: 4 },
        properties: {}
      },
      {
        id: '2',
        type: 'image',
        position: { x: 6, y: 0, width: 6, height: 4 },
        properties: {}
      },
      {
        id: '3',
        type: 'image',
        position: { x: 0, y: 4, width: 12, height: 4 },
        properties: {}
      },
      {
        id: '4',
        type: 'image',
        position: { x: 0, y: 8, width: 4, height: 4 },
        properties: {}
      },
      {
        id: '5',
        type: 'image',
        position: { x: 4, y: 8, width: 4, height: 4 },
        properties: {}
      },
      {
        id: '6',
        type: 'image',
        position: { x: 8, y: 8, width: 4, height: 4 },
        properties: {}
      }
    ],
    grid: { columns: 12, rows: 12 }
  },
  {
    id: 'textbook-page',
    name: 'Textbook Page',
    description: 'Academic textbook layout',
    category: 'Education',
    elements: [
      {
        id: '1',
        type: 'heading',
        position: { x: 1, y: 0, width: 10, height: 1 },
        properties: { fontSize: 20, alignment: 'left' }
      },
      {
        id: '2',
        type: 'text',
        position: { x: 1, y: 1.5, width: 7, height: 4 },
        properties: { fontSize: 14, alignment: 'justify' }
      },
      {
        id: '3',
        type: 'image',
        position: { x: 8.5, y: 1.5, width: 3, height: 4 },
        properties: {}
      },
      {
        id: '4',
        type: 'text',
        position: { x: 1, y: 6, width: 10, height: 4 },
        properties: { fontSize: 14, alignment: 'justify' }
      },
      {
        id: '5',
        type: 'table',
        position: { x: 1, y: 10, width: 10, height: 2 },
        properties: { columns: 3, rows: 4 }
      }
    ],
    grid: { columns: 12, rows: 12 }
  },
  {
    id: 'magazine-spread',
    name: 'Magazine Spread',
    description: 'Dynamic magazine layout',
    category: 'Magazine',
    elements: [
      {
        id: '1',
        type: 'heading',
        position: { x: 1, y: 0, width: 6, height: 2 },
        properties: { fontSize: 36, alignment: 'left' }
      },
      {
        id: '2',
        type: 'image',
        position: { x: 7, y: 0, width: 5, height: 7 },
        properties: {}
      },
      {
        id: '3',
        type: 'text',
        position: { x: 1, y: 2.5, width: 5, height: 9.5 },
        properties: { fontSize: 14, alignment: 'justify' }
      },
      {
        id: '4',
        type: 'image',
        position: { x: 7, y: 7.5, width: 2.5, height: 4 },
        properties: {}
      },
      {
        id: '5',
        type: 'image',
        position: { x: 9.5, y: 7.5, width: 2.5, height: 4 },
        properties: {}
      }
    ],
    grid: { columns: 12, rows: 12 }
  },
  {
    id: 'activity-page',
    name: 'Activity Page',
    description: 'Interactive activity layout',
    category: 'Education',
    elements: [
      {
        id: '1',
        type: 'heading',
        position: { x: 1, y: 0, width: 10, height: 1 },
        properties: { fontSize: 24, alignment: 'center' }
      },
      {
        id: '2',
        type: 'text',
        position: { x: 1, y: 1.5, width: 10, height: 1.5 },
        properties: { fontSize: 16, alignment: 'left' }
      },
      {
        id: '3',
        type: 'spacer',
        position: { x: 1, y: 3, width: 10, height: 6 },
        properties: {}
      },
      {
        id: '4',
        type: 'text',
        position: { x: 1, y: 9.5, width: 10, height: 2 },
        properties: { fontSize: 14, alignment: 'left' }
      }
    ],
    grid: { columns: 12, rows: 12 }
  },
  {
    id: 'biography-intro',
    name: 'Biography Intro',
    description: 'Opening layout for biographies',
    category: 'Biography',
    elements: [
      {
        id: '1',
        type: 'image',
        position: { x: 1, y: 1, width: 4, height: 6 },
        properties: { borderRadius: '8px' }
      },
      {
        id: '2',
        type: 'heading',
        position: { x: 6, y: 1, width: 5, height: 1 },
        properties: { fontSize: 32, alignment: 'left' }
      },
      {
        id: '3',
        type: 'text',
        position: { x: 6, y: 2.5, width: 5, height: 1 },
        properties: { fontSize: 18, alignment: 'left', fontStyle: 'italic' }
      },
      {
        id: '4',
        type: 'text',
        position: { x: 6, y: 4, width: 5, height: 7 },
        properties: { fontSize: 14, alignment: 'justify' }
      }
    ],
    grid: { columns: 12, rows: 12 }
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Visual timeline layout',
    category: 'History',
    elements: [
      {
        id: '1',
        type: 'heading',
        position: { x: 1, y: 0, width: 10, height: 1 },
        properties: { fontSize: 24, alignment: 'center' }
      },
      {
        id: '2',
        type: 'timeline',
        position: { x: 1, y: 2, width: 10, height: 8 },
        properties: { orientation: 'vertical', points: 5 }
      },
      {
        id: '3',
        type: 'text',
        position: { x: 1, y: 10.5, width: 10, height: 1 },
        properties: { fontSize: 12, alignment: 'center', fontStyle: 'italic' }
      }
    ],
    grid: { columns: 12, rows: 12 }
  },
  {
    id: 'travel-guide',
    name: 'Travel Guide',
    description: 'Travel destination layout',
    category: 'Travel',
    elements: [
      {
        id: '1',
        type: 'image',
        position: { x: 0, y: 0, width: 12, height: 4 },
        properties: {}
      },
      {
        id: '2',
        type: 'heading',
        position: { x: 1, y: 4.5, width: 6, height: 1 },
        properties: { fontSize: 28, alignment: 'left' }
      },
      {
        id: '3',
        type: 'text',
        position: { x: 1, y: 6, width: 6, height: 5 },
        properties: { fontSize: 14, alignment: 'justify' }
      },
      {
        id: '4',
        type: 'list',
        position: { x: 8, y: 4.5, width: 3, height: 6.5 },
        properties: { fontSize: 14, listType: 'checklist' }
      }
    ],
    grid: { columns: 12, rows: 12 }
  },
  {
    id: 'cookbook-contents',
    name: 'Cookbook Contents',
    description: 'Recipe book contents page',
    category: 'Cookbook',
    elements: [
      {
        id: '1',
        type: 'heading',
        position: { x: 2, y: 1, width: 8, height: 1 },
        properties: { fontSize: 32, alignment: 'center' }
      },
      {
        id: '2',
        type: 'grid',
        position: { x: 2, y: 3, width: 8, height: 8 },
        properties: { 
          columns: 2, 
          rows: 4,
          gap: '1rem',
          itemType: 'recipe-card'
        }
      }
    ],
    grid: { columns: 12, rows: 12 }
  },
  {
    id: 'art-gallery',
    name: 'Art Gallery',
    description: 'Art portfolio layout',
    category: 'Art',
    elements: [
      {
        id: '1',
        type: 'image',
        position: { x: 1, y: 1, width: 10, height: 6 },
        properties: { aspectRatio: '16/9' }
      },
      {
        id: '2',
        type: 'heading',
        position: { x: 1, y: 7.5, width: 6, height: 1 },
        properties: { fontSize: 24, alignment: 'left' }
      },
      {
        id: '3',
        type: 'text',
        position: { x: 1, y: 9, width: 6, height: 2 },
        properties: { fontSize: 14, alignment: 'justify' }
      },
      {
        id: '4',
        type: 'metadata',
        position: { x: 8, y: 7.5, width: 3, height: 3.5 },
        properties: { fontSize: 12, fields: ['medium', 'size', 'year'] }
      }
    ],
    grid: { columns: 12, rows: 12 }
  },
  {
    id: 'sheet-music',
    name: 'Sheet Music',
    description: 'Musical score layout',
    category: 'Music',
    elements: [
      {
        id: '1',
        type: 'heading',
        position: { x: 1, y: 0, width: 10, height: 1 },
        properties: { fontSize: 24, alignment: 'center', fontFamily: 'Maestro' }
      },
      {
        id: '2',
        type: 'text',
        position: { x: 1, y: 1.2, width: 10, height: 0.8 },
        properties: { fontSize: 14, alignment: 'center', fontStyle: 'italic' }
      },
      {
        id: '3',
        type: 'staff',
        position: { x: 1, y: 2.5, width: 10, height: 8 },
        properties: { staves: 4, spacing: '1.5rem' }
      },
      {
        id: '4',
        type: 'text',
        position: { x: 1, y: 11, width: 10, height: 0.5 },
        properties: { fontSize: 12, alignment: 'right' }
      }
    ],
    grid: { columns: 12, rows: 12 }
  }
]

const savedLayouts = ref<Layout[]>([])
const selectedLayout = ref<Layout | null>(null)
const isEditorOpen = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('All')

const categories = computed(() => {
  const uniqueCategories = new Set(['All', ...presetLayouts.concat(savedLayouts.value).map(l => l.category)])
  return Array.from(uniqueCategories)
})

const filteredLayouts = computed(() => {
  const layouts = [...presetLayouts, ...savedLayouts.value]
  return layouts.filter(layout => {
    const matchesCategory = selectedCategory.value === 'All' || layout.category === selectedCategory.value
    const matchesSearch = layout.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         layout.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

const createNewLayout = () => {
  selectedLayout.value = null
  isEditorOpen.value = true
}

const editLayout = (layout: Layout) => {
  selectedLayout.value = layout
  isEditorOpen.value = true
}

const saveLayout = (layout: Layout) => {
  const existingIndex = savedLayouts.value.findIndex(l => l.id === layout.id)
  if (existingIndex !== -1) {
    savedLayouts.value[existingIndex] = layout
  } else {
    savedLayouts.value.push({
      ...layout,
      id: crypto.randomUUID()
    })
  }
  isEditorOpen.value = false
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Layout Library</h2>
        <button
          class="btn btn-primary"
          @click="createNewLayout"
        >
          <icon-ph-plus class="w-4 h-4" />
          <span>Create Layout</span>
        </button>
      </div>
      
      <!-- Search and Filter -->
      <div class="flex gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search layouts..."
          class="input"
        />
        <select v-model="selectedCategory" class="select">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
    </div>

    <!-- Layout Grid -->
    <div class="flex-1 overflow-auto p-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="layout in filteredLayouts"
          :key="layout.id"
          class="space-y-4"
        >
          <LayoutPreview
            :layout="layout"
            :interactive="true"
            @select="editLayout(layout)"
          />
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">{{ layout.name }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ layout.description }}</p>
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ layout.category }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
