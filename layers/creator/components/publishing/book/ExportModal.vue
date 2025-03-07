<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Book, ExportConfig } from '../../../types/book'
import { useBookExport } from '../../../composables/useBookExport'

const props = defineProps<{
  isOpen: boolean
  book: Book
  canvasRefs: HTMLElement[]
}>()

const emit = defineEmits(['close', 'export-complete'])

const activeTab = ref<'pdf' | 'epub'>('pdf')
const { exportToPdf, exportToEpub, loading, error } = useBookExport()

// Export configuration
const config = ref<ExportConfig>({
  format: 'pdf',
  quality: 'standard',
  includeBleed: false,
  includeTrimMarks: false,
  coverType: 'front-only',
  pageRange: 'all',
  customPageRange: '',
  resolution: 300,
  colorSpace: 'rgb',
  embedFonts: true
})

// Quality options
const qualityOptions = [
  { value: 'draft', label: 'Draft (Faster)' },
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High Quality (Slower)' }
]

// Color space options
const colorSpaceOptions = [
  { value: 'rgb', label: 'RGB (Screen/Digital)' },
  { value: 'cmyk', label: 'CMYK (Print)' }
]

// Page range validation
const pageRangeError = computed(() => {
  if (config.value.pageRange !== 'custom') return null
  
  const rangePattern = /^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/
  if (!rangePattern.test(config.value.customPageRange)) {
    return 'Invalid format. Use "1,3,5-7" format.'
  }
  
  // Check that page numbers are valid
  const totalPages = props.book.pages?.length || 0
  const ranges = config.value.customPageRange.split(',').map(r => r.trim())
  
  for (const range of ranges) {
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(Number)
      if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
        return `Page range ${range} is invalid. Pages must be between 1-${totalPages}.`
      }
    } else {
      const page = Number(range)
      if (isNaN(page) || page < 1 || page > totalPages) {
        return `Page ${page} is invalid. Pages must be between 1-${totalPages}.`
      }
    }
  }
  
  return null
})

// Export functions
const handleExport = async () => {
  if (activeTab.value === 'pdf') {
    const success = await exportToPdf(props.book, props.canvasRefs, config.value)
    if (success) {
      emit('export-complete', { format: 'pdf', success: true })
    }
  } else {
    const success = await exportToEpub(props.book, props.canvasRefs, config.value)
    if (success) {
      emit('export-complete', { format: 'epub', success: true })
    }
  }
}

// Reset form when changing tabs
const changeTab = (tab: 'pdf' | 'epub') => {
  activeTab.value = tab
  config.value.format = tab
  
  // Reset format-specific settings
  if (tab === 'epub') {
    config.value.includeBleed = false
    config.value.includeTrimMarks = false
    config.value.resolution = 150
  } else {
    config.value.resolution = 300
  }
}

// Compute available page range text
const pageRangeText = computed(() => {
  const totalPages = props.book.pages?.length || 0
  return `You can select from pages 1-${totalPages}`
})
</script>

<template>
  <Modal
    :open="isOpen"
    size="md"
    @close="emit('close')"
    :title="`Export ${book.title || 'Book'}`"
  >
    <div class="p-4">
      <!-- Format tabs -->
      <div class="flex border-b border-gray-200 mb-4">
        <button
          class="px-4 py-2 font-medium text-sm"
          :class="activeTab === 'pdf' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500'"
          @click="changeTab('pdf')"
        >
          PDF
        </button>
        <button
          class="px-4 py-2 font-medium text-sm"
          :class="activeTab === 'epub' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500'"
          @click="changeTab('epub')"
        >
          EPUB
        </button>
      </div>
      
      <!-- Configuration form -->
      <form @submit.prevent="handleExport" class="space-y-4">
        <!-- Quality -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Quality</label>
          <FormSelect
            v-model="config.quality"
            :options="qualityOptions"
            class="w-full"
          />
        </div>
        
        <!-- Page Range -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Page Range</label>
          <div class="flex items-center space-x-4">
            <FormRadio
              v-model="config.pageRange"
              value="all"
              name="page-range"
              label="All Pages"
            />
            <FormRadio
              v-model="config.pageRange"
              value="custom"
              name="page-range"
              label="Custom"
            />
          </div>
          
          <!-- Custom page range input -->
          <div v-if="config.pageRange === 'custom'" class="mt-2">
            <FormInput
              v-model="config.customPageRange"
              placeholder="e.g. 1-3, 5, 7-9"
              class="w-full"
            />
            <p class="text-xs text-gray-500 mt-1">{{ pageRangeText }}</p>
            <p v-if="pageRangeError" class="text-xs text-red-500 mt-1">{{ pageRangeError }}</p>
          </div>
        </div>
        
        <!-- PDF-specific options -->
        <template v-if="activeTab === 'pdf'">
          <!-- Resolution -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Resolution (DPI)</label>
            <FormSelect
              v-model="config.resolution"
              :options="[
                { value: 150, label: '150 DPI (Screen/Web)' },
                { value: 300, label: '300 DPI (Print - Recommended)' },
                { value: 600, label: '600 DPI (High Quality Print)' }
              ]"
              class="w-full"
            />
          </div>
          
          <!-- Color Space -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Color Space</label>
            <FormSelect
              v-model="config.colorSpace"
              :options="colorSpaceOptions"
              class="w-full"
            />
          </div>
          
          <!-- Print options -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Print Options</label>
            <div class="space-y-2">
              <FormCheckbox
                v-model="config.includeBleed"
                label="Include Bleed (0.125\" on all sides)"
              />
              <FormCheckbox
                v-model="config.includeTrimMarks"
                label="Include Trim Marks"
              />
              <FormCheckbox
                v-model="config.embedFonts"
                label="Embed Fonts"
              />
            </div>
          </div>
        </template>
        
        <!-- EPUB-specific options -->
        <template v-if="activeTab === 'epub'">
          <!-- Cover Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cover Type</label>
            <FormRadio
              v-model="config.coverType"
              value="front-only"
              name="cover-type"
              label="Front Cover Only"
            />
            <FormRadio
              v-model="config.coverType"
              value="full-wrap"
              name="cover-type"
              label="Full Wrap (Front, Spine, Back)"
            />
          </div>
          
          <!-- Embed Fonts -->
          <div>
            <FormCheckbox
              v-model="config.embedFonts"
              label="Embed Fonts"
            />
          </div>
        </template>
        
        <!-- Error message -->
        <div v-if="error" class="p-2 bg-red-100 text-red-700 text-sm rounded">
          {{ error }}
        </div>
        
        <!-- Submit button -->
        <div class="flex justify-end">
          <button
            type="button"
            class="btn btn-default mr-2"
            @click="emit('close')"
            :disabled="loading"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading || (config.pageRange === 'custom' && !!pageRangeError)"
          >
            <span v-if="loading">Exporting...</span>
            <span v-else>Export {{ activeTab.toUpperCase() }}</span>
          </button>
        </div>
      </form>
    </div>
  </Modal>
</template>