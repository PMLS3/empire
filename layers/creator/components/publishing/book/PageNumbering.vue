<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  book: any
}>()

const emit = defineEmits(['update'])

// Page numbering styles
const numberingStyles = [
  { value: 'arabic', label: 'Arabic (1, 2, 3...)', example: '1, 2, 3...' },
  { value: 'roman', label: 'Roman (I, II, III...)', example: 'I, II, III...' },
  { value: 'roman-lower', label: 'Roman Lowercase (i, ii, iii...)', example: 'i, ii, iii...' },
  { value: 'alpha', label: 'Alphabetic (A, B, C...)', example: 'A, B, C...' },
  { value: 'alpha-lower', label: 'Alphabetic Lowercase (a, b, c...)', example: 'a, b, c...' }
]

// Page numbering settings
const settings = ref({
  style: 'arabic',
  startNumber: 1,
  displayFormat: '{0}', // {0} will be replaced with the number
  sectionNumbering: false,
  sections: [
    {
      startPage: 1,
      style: 'roman-lower',
      startNumber: 1,
      displayFormat: '{0}'
    }
  ]
})

// Get page numbering settings from book if available
if (props.book?.pageNumberingSettings) {
  settings.value = { ...props.book.pageNumberingSettings }
}

// Computed properties for sections
const sectionsWithInfo = computed(() => {
  return settings.value.sections.map((section, index) => {
    // Calculate end page (start page of next section - 1, or last page)
    const nextSection = settings.value.sections[index + 1]
    const endPage = nextSection ? nextSection.startPage - 1 : props.book?.pages?.length || 999
    
    return {
      ...section,
      endPage,
      pageCount: endPage - section.startPage + 1
    }
  })
})

// Add a new section
const addSection = () => {
  // Find the highest end page
  const lastEndPage = Math.max(...sectionsWithInfo.value.map(s => s.endPage))
  
  settings.value.sections.push({
    startPage: lastEndPage + 1,
    style: 'arabic',
    startNumber: 1,
    displayFormat: '{0}'
  })
  
  updateSettings()
}

// Remove a section
const removeSection = (index: number) => {
  settings.value.sections.splice(index, 1)
  updateSettings()
}

// Update settings
const updateSettings = () => {
  emit('update', { pageNumberingSettings: settings.value })
}

// Convert number to the selected style
const formatNumber = (num: number, style: string): string => {
  switch (style) {
    case 'roman':
      return toRoman(num)
    case 'roman-lower':
      return toRoman(num).toLowerCase()
    case 'alpha':
      return toAlpha(num).toUpperCase()
    case 'alpha-lower':
      return toAlpha(num)
    case 'arabic':
    default:
      return num.toString()
  }
}

// Helper function to convert number to Roman numerals
const toRoman = (num: number): string => {
  const romanNumerals = [
    { value: 1000, symbol: 'M' },
    { value: 900, symbol: 'CM' },
    { value: 500, symbol: 'D' },
    { value: 400, symbol: 'CD' },
    { value: 100, symbol: 'C' },
    { value: 90, symbol: 'XC' },
    { value: 50, symbol: 'L' },
    { value: 40, symbol: 'XL' },
    { value: 10, symbol: 'X' },
    { value: 9, symbol: 'IX' },
    { value: 5, symbol: 'V' },
    { value: 4, symbol: 'IV' },
    { value: 1, symbol: 'I' }
  ]
  
  let result = ''
  
  for (const { value, symbol } of romanNumerals) {
    while (num >= value) {
      result += symbol
      num -= value
    }
  }
  
  return result
}

// Helper function to convert number to alphabetic (a-z, then aa, ab, etc.)
const toAlpha = (num: number): string => {
  if (num <= 0) return ''
  
  let result = ''
  
  while (num > 0) {
    const remainder = (num - 1) % 26
    result = String.fromCharCode(97 + remainder) + result
    num = Math.floor((num - 1) / 26)
  }
  
  return result
}

// Preview page numbers
const previewPageNumbers = computed(() => {
  if (!settings.value.sectionNumbering) {
    // Simple consecutive numbering
    return Array.from({ length: 5 }, (_, i) => {
      const num = settings.value.startNumber + i
      return formatNumber(num, settings.value.style)
    })
  } else {
    // Section-based numbering
    return settings.value.sections.map(section => {
      return formatNumber(section.startNumber, section.style)
    })
  }
})

// Toggle section numbering
const toggleSectionNumbering = (value: boolean) => {
  settings.value.sectionNumbering = value
  updateSettings()
}

// Get page number for a specific page
const getPageNumber = (pageIndex: number): string => {
  if (!settings.value.sectionNumbering) {
    // Simple consecutive numbering
    const num = settings.value.startNumber + pageIndex
    return formatNumber(num, settings.value.style)
  } else {
    // Find which section this page belongs to
    for (const section of sectionsWithInfo.value) {
      if (pageIndex + 1 >= section.startPage && pageIndex + 1 <= section.endPage) {
        const offset = pageIndex + 1 - section.startPage
        const num = section.startNumber + offset
        return formatNumber(num, section.style)
      }
    }
    
    // Fallback to default
    return formatNumber(pageIndex + 1, 'arabic')
  }
}

// Format display with custom format (e.g., "Page {0}")
const formatDisplay = (number: string, format: string): string => {
  return format.replace('{0}', number)
}

// Update display format
const updateDisplayFormat = (format: string) => {
  settings.value.displayFormat = format
  updateSettings()
}
</script>

<template>
  <div class="p-4 bg-gray-800 rounded-lg">
    <h3 class="text-lg text-white font-medium mb-4">Page Numbering</h3>
    
    <!-- Global Numbering Settings -->
    <div class="mb-6">
      <label class="flex items-center justify-between mb-2">
        <span class="text-sm text-gray-300">Use Section Numbering</span>
        <label class="switch">
          <input 
            type="checkbox" 
            v-model="settings.sectionNumbering"
            @change="toggleSectionNumbering($event.target.checked)"
          >
          <span class="slider round"></span>
        </label>
      </label>
      
      <!-- Simple Numbering Settings -->
      <div v-if="!settings.sectionNumbering" class="space-y-4 bg-gray-700 p-3 rounded">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Numbering Style</label>
          <select
            v-model="settings.style"
            class="w-full bg-gray-800 text-white rounded p-2 text-sm"
            @change="updateSettings"
          >
            <option v-for="style in numberingStyles" :key="style.value" :value="style.value">
              {{ style.label }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-xs text-gray-400 mb-1">Start Number</label>
          <input
            v-model.number="settings.startNumber"
            type="number"
            min="1"
            class="w-full bg-gray-800 text-white rounded p-2 text-sm"
            @change="updateSettings"
          />
        </div>
        
        <div>
          <label class="block text-xs text-gray-400 mb-1">Display Format</label>
          <input
            v-model="settings.displayFormat"
            type="text"
            class="w-full bg-gray-800 text-white rounded p-2 text-sm"
            placeholder="{0}"
            @change="updateDisplayFormat($event.target.value)"
          />
          <p class="text-xs text-gray-500 mt-1">Use {0} as placeholder for the page number</p>
        </div>
        
        <!-- Preview -->
        <div>
          <label class="block text-xs text-gray-400 mb-1">Preview</label>
          <div class="flex space-x-2 mt-1">
            <div
              v-for="(num, index) in previewPageNumbers"
              :key="index"
              class="px-3 py-1 bg-gray-800 rounded text-sm text-white"
            >
              {{ formatDisplay(num, settings.displayFormat) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Section Numbering -->
    <div v-if="settings.sectionNumbering">
      <h4 class="text-sm font-medium text-white mb-2">Sections</h4>
      
      <!-- Section List -->
      <div class="space-y-4">
        <div
          v-for="(section, index) in sectionsWithInfo"
          :key="index"
          class="bg-gray-700 p-3 rounded"
        >
          <div class="flex justify-between items-center mb-3">
            <h5 class="text-sm font-medium text-white">
              Section {{ index + 1 }}: Pages {{ section.startPage }}-{{ section.endPage }}
            </h5>
            
            <button
              v-if="settings.sections.length > 1"
              class="p-1 rounded bg-red-500 hover:bg-red-600 text-white"
              @click="removeSection(index)"
            >
              <Icon name="ph:trash" class="w-4 h-4" />
            </button>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Start Page</label>
              <input
                v-model.number="section.startPage"
                type="number"
                min="1"
                class="w-full bg-gray-800 text-white rounded p-2 text-sm"
                @change="updateSettings"
              />
            </div>
            
            <div>
              <label class="block text-xs text-gray-400 mb-1">Start Number</label>
              <input
                v-model.number="section.startNumber"
                type="number"
                min="1"
                class="w-full bg-gray-800 text-white rounded p-2 text-sm"
                @change="updateSettings"
              />
            </div>
            
            <div>
              <label class="block text-xs text-gray-400 mb-1">Numbering Style</label>
              <select
                v-model="section.style"
                class="w-full bg-gray-800 text-white rounded p-2 text-sm"
                @change="updateSettings"
              >
                <option v-for="style in numberingStyles" :key="style.value" :value="style.value">
                  {{ style.label }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-xs text-gray-400 mb-1">Display Format</label>
              <input
                v-model="section.displayFormat"
                type="text"
                class="w-full bg-gray-800 text-white rounded p-2 text-sm"
                placeholder="{0}"
                @change="updateSettings"
              />
            </div>
          </div>
          
          <!-- Preview -->
          <div class="mt-3">
            <label class="block text-xs text-gray-400 mb-1">Preview</label>
            <div class="px-3 py-1 bg-gray-800 rounded text-sm text-white">
              {{ formatDisplay(formatNumber(section.startNumber, section.style), section.displayFormat) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Add Section Button -->
      <button
        class="w-full mt-4 py-2 bg-blue-600 rounded text-sm text-white hover:bg-blue-700"
        @click="addSection"
      >
        Add Section
      </button>
    </div>
    
    <!-- Page Number Placement Section -->
    <div class="mt-6">
      <h4 class="text-sm font-medium text-white mb-2">Page Number Placement</h4>
      <p class="text-xs text-gray-400 mb-3">
        Configure page number placement in the Header & Footer settings.
      </p>
      
      <button
        class="w-full py-2 bg-gray-700 rounded text-sm text-white hover:bg-gray-600"
        @click="$emit('openHeaderFooter')"
      >
        Open Header & Footer Settings
      </button>
    </div>
    
    <!-- Apply Settings -->
    <button
      class="w-full mt-6 py-2 bg-green-600 rounded text-sm text-white hover:bg-green-700"
      @click="updateSettings"
    >
      Apply Page Numbering Settings
    </button>
  </div>
</template>

<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #555;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #3B82F6;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
