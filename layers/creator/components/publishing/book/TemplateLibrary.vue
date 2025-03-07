<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { BookTemplate } from '../../../types/book'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'select-template'])

const templates = ref<BookTemplate[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedCategory = ref('all')

// Categories for filtering
const categories = ref([
  { id: 'all', name: 'All Templates' },
  { id: 'novel', name: 'Novels & Text Books' },
  { id: 'children', name: 'Children\'s Books' },
  { id: 'photo', name: 'Photo Books' },
  { id: 'cookbook', name: 'Cookbooks' },
  { id: 'education', name: 'Educational & Workbooks' },
  { id: 'poetry', name: 'Poetry & Anthologies' },
  { id: 'magazine', name: 'Magazines & Periodicals' }
])

// Fetch templates from API or mock data
const fetchTemplates = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Mock data for development - in a real implementation, you would fetch this from your API
    const mockTemplates: BookTemplate[] = [
      {
        id: 'novel-standard',
        name: 'Standard Novel',
        description: 'Classic novel layout with clean typography and standard margins',
        thumbnail: 'https://via.placeholder.com/300x400',
        book_type: 'novel',
        pages: [],
        default_size: {
          label: '6" x 9"',
          dimensions: '6" x 9"',
          width: 15.24,
          length: 22.86
        },
        category: 'novel',
        tags: ['fiction', 'non-fiction', 'novel', 'text']
      },
      {
        id: 'children-picture',
        name: 'Picture Book',
        description: 'Colorful layout for children\'s picture books with large images and easy-to-read text',
        thumbnail: 'https://via.placeholder.com/300x300',
        book_type: 'children',
        pages: [],
        default_size: {
          label: '8.5" x 8.5"',
          dimensions: '8.5" x 8.5"',
          width: 21.59,
          length: 21.59
        },
        category: 'children',
        tags: ['children', 'picture book', 'illustrated']
      },
      {
        id: 'photo-album',
        name: 'Photo Album',
        description: 'Clean layout for photo books with minimal text and large image areas',
        thumbnail: 'https://via.placeholder.com/300x200',
        book_type: 'photo',
        pages: [],
        default_size: {
          label: '8.5" x 11"',
          dimensions: '8.5" x 11"',
          width: 21.59,
          length: 27.94
        },
        category: 'photo',
        tags: ['photo book', 'album', 'images']
      },
      {
        id: 'cookbook-standard',
        name: 'Standard Cookbook',
        description: 'Recipe-focused layout with space for ingredients, steps, and photos',
        thumbnail: 'https://via.placeholder.com/300x300',
        book_type: 'cookbook',
        pages: [],
        default_size: {
          label: '7" x 10"',
          dimensions: '7" x 10"',
          width: 17.78,
          length: 25.4
        },
        category: 'cookbook',
        tags: ['recipes', 'food', 'cooking']
      },
      {
        id: 'workbook-standard',
        name: 'Standard Workbook',
        description: 'Educational layout with space for exercises, notes, and instructional content',
        thumbnail: 'https://via.placeholder.com/300x400',
        book_type: 'education',
        pages: [],
        default_size: {
          label: '8.5" x 11"',
          dimensions: '8.5" x 11"',
          width: 21.59,
          length: 27.94
        },
        category: 'education',
        tags: ['education', 'workbook', 'exercises']
      }
    ]
    
    // In a real implementation, you would fetch from your API
    // const response = await fetch('/api/book-templates')
    // const data = await response.json()
    // templates.value = data
    
    // Use mock data instead
    templates.value = mockTemplates
    loading.value = false
  } catch (err) {
    console.error('Error fetching templates:', err)
    error.value = 'Failed to load templates. Please try again.'
    loading.value = false
  }
}

// Filter templates based on search and category
const filteredTemplates = computed(() => {
  let result = templates.value
  
  // Filter by category
  if (selectedCategory.value !== 'all') {
    result = result.filter(template => template.category === selectedCategory.value)
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(template => {
      return (
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      )
    })
  }
  
  return result
})

// Handle template selection
const selectTemplate = (template: BookTemplate) => {
  emit('select-template', template)
  emit('close')
}

// Load templates when component is mounted
onMounted(() => {
  fetchTemplates()
})
</script>

<template>
  <Modal
    :open="isOpen"
    size="lg"
    @close="emit('close')"
    title="Template Library"
  >
    <div class="p-4">
      <!-- Search and filters -->
      <div class="mb-6">
        <div class="flex space-x-4 mb-4">
          <FormInput
            v-model="searchQuery"
            placeholder="Search templates..."
            class="flex-1"
            icon="ph:magnifying-glass-bold"
          />
          <FormSelect
            v-model="selectedCategory"
            class="w-64"
          >
            <option 
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </FormSelect>
        </div>
      </div>
      
      <!-- Templates grid -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
      
      <div v-else-if="error" class="p-4 bg-red-100 text-red-700 text-sm rounded mb-4">
        {{ error }}
      </div>
      
      <div v-else-if="filteredTemplates.length === 0" class="py-8 text-center">
        <p class="text-gray-500">No templates found matching your criteria.</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          @click="selectTemplate(template)"
        >
          <!-- Template thumbnail -->
          <div class="h-48 bg-gray-200 relative">
            <img
              :src="template.thumbnail"
              alt="Template preview"
              class="w-full h-full object-cover"
            />
            <!-- Category badge -->
            <div class="absolute top-2 right-2 bg-primary-500 text-white text-xs py-1 px-2 rounded">
              {{ template.category.charAt(0).toUpperCase() + template.category.slice(1) }}
            </div>
          </div>
          
          <!-- Template info -->
          <div class="p-4">
            <h3 class="font-medium text-lg">{{ template.name }}</h3>
            <p class="text-gray-600 text-sm mt-1">{{ template.description }}</p>
            
            <!-- Size and tags -->
            <div class="mt-3 flex justify-between items-center">
              <span class="text-sm text-gray-500">{{ template.default_size.label }}</span>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="tag in template.tags.slice(0, 2)"
                  :key="tag"
                  class="text-xs px-2 py-1 bg-gray-200 rounded"
                >
                  {{ tag }}
                </span>
                <span
                  v-if="template.tags.length > 2"
                  class="text-xs px-2 py-1 bg-gray-200 rounded"
                >
                  +{{ template.tags.length - 2 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>