<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  book: any
  currentPage?: any
}>()

const emit = defineEmits(['update'])

// Header/footer content types
const contentTypes = [
  { value: 'none', label: 'None' },
  { value: 'pageNumber', label: 'Page Number' },
  { value: 'chapterTitle', label: 'Chapter Title' },
  { value: 'bookTitle', label: 'Book Title' },
  { value: 'authorName', label: 'Author Name' },
  { value: 'custom', label: 'Custom Text' }
]

// Available sections
const sections = [
  { value: 'header-left', label: 'Left Header' },
  { value: 'header-center', label: 'Center Header' },
  { value: 'header-right', label: 'Right Header' },
  { value: 'footer-left', label: 'Left Footer' },
  { value: 'footer-center', label: 'Center Footer' },
  { value: 'footer-right', label: 'Right Footer' }
]

// Settings for current page or global defaults
const settings = ref({
  global: {
    header: {
      left: { type: 'none', content: '', style: {} },
      center: { type: 'bookTitle', content: '', style: {} },
      right: { type: 'pageNumber', content: '', style: {} }
    },
    footer: {
      left: { type: 'none', content: '', style: {} },
      center: { type: 'pageNumber', content: '', style: {} },
      right: { type: 'none', content: '', style: {} }
    }
  },
  alternatePages: {
    even: {
      header: {
        left: { type: 'pageNumber', content: '', style: {} },
        center: { type: 'bookTitle', content: '', style: {} },
        right: { type: 'none', content: '', style: {} }
      },
      footer: {
        left: { type: 'none', content: '', style: {} },
        center: { type: 'pageNumber', content: '', style: {} },
        right: { type: 'none', content: '', style: {} }
      }
    },
    odd: {
      header: {
        left: { type: 'none', content: '', style: {} },
        center: { type: 'bookTitle', content: '', style: {} },
        right: { type: 'pageNumber', content: '', style: {} }
      },
      footer: {
        left: { type: 'none', content: '', style: {} },
        center: { type: 'pageNumber', content: '', style: {} },
        right: { type: 'none', content: '', style: {} }
      }
    }
  },
  usesAlternatePages: true
})

// Get header/footer settings from book if available
watch(() => props.book, (newBook) => {
  if (newBook?.headerFooterSettings) {
    settings.value = { ...newBook.headerFooterSettings }
  } else if (newBook) {
    // Initialize with defaults
    emit('update', { headerFooterSettings: settings.value })
  }
}, { immediate: true })

// Selected section for editing
const selectedSection = ref('header-center')
const parsedSection = computed(() => {
  const [area, position] = selectedSection.value.split('-')
  return { area, position }
})

// Current editing value
const currentEditValue = computed(() => {
  const { area, position } = parsedSection.value
  
  if (isPageSpecific.value) {
    // Get page-specific setting
    return props.currentPage?.headerFooter?.[area]?.[position] || 
           settings.value.global[area][position]
  } else if (isAlternatingMode.value) {
    // Get even/odd page setting
    const pageType = isEvenPage.value ? 'even' : 'odd'
    return settings.value.alternatePages[pageType][area][position]
  } else {
    // Get global setting
    return settings.value.global[area][position]
  }
})

// Custom content text (for when type is 'custom')
const customText = ref('')

// When content type is 'custom', sync with the custom text field
watch(() => currentEditValue.value?.type, (newType) => {
  if (newType === 'custom') {
    customText.value = currentEditValue.value?.content || ''
  }
}, { immediate: true })

// Is the current page even or odd?
const isEvenPage = computed(() => {
  if (!props.currentPage?.pageNumber) return false
  return props.currentPage.pageNumber % 2 === 0
})

// Edit modes
const editMode = ref('global') // 'global', 'alternate', 'page'
const isGlobalMode = computed(() => editMode.value === 'global')
const isAlternatingMode = computed(() => editMode.value === 'alternate')
const isPageSpecific = computed(() => editMode.value === 'page')

// Update header/footer settings
const updateSettings = (value: any) => {
  const { area, position } = parsedSection.value
  
  if (isPageSpecific.value && props.currentPage) {
    // Update page-specific setting
    if (!props.currentPage.headerFooter) {
      props.currentPage.headerFooter = {
        header: { left: {}, center: {}, right: {} },
        footer: { left: {}, center: {}, right: {} }
      }
    }
    props.currentPage.headerFooter[area][position] = { ...value }
  } else if (isAlternatingMode.value) {
    // Update alternating page setting
    const pageType = isEvenPage.value ? 'even' : 'odd'
    settings.value.alternatePages[pageType][area][position] = { ...value }
  } else {
    // Update global setting
    settings.value.global[area][position] = { ...value }
  }
  
  // Emit updated settings
  emit('update', { headerFooterSettings: settings.value })
}

// Change content type
const changeContentType = (type: string) => {
  const currentSettings = { ...currentEditValue.value, type }
  
  // If type is 'custom', set the content from the text field
  if (type === 'custom') {
    currentSettings.content = customText.value
  }
  
  updateSettings(currentSettings)
}

// Update custom text
const updateCustomText = (text: string) => {
  customText.value = text
  
  if (currentEditValue.value?.type === 'custom') {
    const currentSettings = { ...currentEditValue.value, content: text }
    updateSettings(currentSettings)
  }
}

// Toggle alternating pages
const toggleAlternatingPages = (value: boolean) => {
  settings.value.usesAlternatePages = value
  emit('update', { headerFooterSettings: settings.value })
}

// Preview content based on content type
const getPreviewContent = (section: any) => {
  const { type, content } = section || { type: 'none', content: '' }
  
  switch (type) {
    case 'pageNumber':
      return props.currentPage?.pageNumber || '1'
    case 'chapterTitle':
      return props.currentPage?.chapterTitle || 'Chapter Name'
    case 'bookTitle':
      return props.book?.title || 'Book Title'
    case 'authorName':
      return props.book?.authorName || 'Author Name'
    case 'custom':
      return content || 'Custom Text'
    case 'none':
    default:
      return ''
  }
}

// Update font properties
const updateFontFamily = (value: string) => {
  if (!currentEditValue.value) return
  
  const style = currentEditValue.value.style || {}
  updateSettings({
    ...currentEditValue.value,
    style: { ...style, fontFamily: value }
  })
}

const updateFontSize = (value: string) => {
  if (!currentEditValue.value) return
  
  const style = currentEditValue.value.style || {}
  updateSettings({
    ...currentEditValue.value,
    style: { ...style, fontSize: value }
  })
}

const updateFontWeight = (value: string) => {
  if (!currentEditValue.value) return
  
  const style = currentEditValue.value.style || {}
  updateSettings({
    ...currentEditValue.value,
    style: { ...style, fontWeight: value }
  })
}

const updateColor = (value: string) => {
  if (!currentEditValue.value) return
  
  const style = currentEditValue.value.style || {}
  updateSettings({
    ...currentEditValue.value,
    style: { ...style, color: value }
  })
}

const updateAlignment = (value: string) => {
  if (!currentEditValue.value) return
  
  const style = currentEditValue.value.style || {}
  updateSettings({
    ...currentEditValue.value,
    style: { ...style, textAlign: value }
  })
}

// Apply settings to all pages
const applyToAllPages = () => {
  // This would be implemented based on the book structure
  // For now, we'll just update the global settings
  emit('update', { 
    headerFooterSettings: settings.value,
    applyToAll: true 
  })
}

// Reset to defaults
const resetToDefaults = () => {
  settings.value = {
    global: {
      header: {
        left: { type: 'none', content: '', style: {} },
        center: { type: 'bookTitle', content: '', style: {} },
        right: { type: 'pageNumber', content: '', style: {} }
      },
      footer: {
        left: { type: 'none', content: '', style: {} },
        center: { type: 'pageNumber', content: '', style: {} },
        right: { type: 'none', content: '', style: {} }
      }
    },
    alternatePages: {
      even: {
        header: {
          left: { type: 'pageNumber', content: '', style: {} },
          center: { type: 'bookTitle', content: '', style: {} },
          right: { type: 'none', content: '', style: {} }
        },
        footer: {
          left: { type: 'none', content: '', style: {} },
          center: { type: 'pageNumber', content: '', style: {} },
          right: { type: 'none', content: '', style: {} }
        }
      },
      odd: {
        header: {
          left: { type: 'none', content: '', style: {} },
          center: { type: 'bookTitle', content: '', style: {} },
          right: { type: 'pageNumber', content: '', style: {} }
        },
        footer: {
          left: { type: 'none', content: '', style: {} },
          center: { type: 'pageNumber', content: '', style: {} },
          right: { type: 'none', content: '', style: {} }
        }
      }
    },
    usesAlternatePages: true
  }
  
  emit('update', { headerFooterSettings: settings.value })
}

// Setup running heads - these are headers that change based on content
const setupRunningHeads = (enabled: boolean) => {
  if (enabled) {
    // Set up chapter title in header
    settings.value.global.header.center.type = 'chapterTitle'
  } else {
    // Revert to book title
    settings.value.global.header.center.type = 'bookTitle'
  }
  
  emit('update', { headerFooterSettings: settings.value })
}

// Running heads status
const hasRunningHeads = computed(() => {
  return settings.value.global.header.center.type === 'chapterTitle' ||
         settings.value.global.header.left.type === 'chapterTitle' ||
         settings.value.global.header.right.type === 'chapterTitle'
})

// Add first chapter / section detection
const isStartOfSection = (page: any): boolean => {
  if (!page || !page.pageNumber) return false
  
  // Check if this is the first page of a chapter
  if (page.isChapterStart) return true
  
  // Check if this is page 1
  if (page.pageNumber === 1) return true
  
  return false
}

// Special handling for section starts
const handleSectionStart = (enabled: boolean) => {
  if (!props.currentPage) return
  
  props.currentPage.suppressHeader = enabled
  emit('update', { currentPage: props.currentPage })
}

// Current section start status
const sectionStartSuppressHeader = computed({
  get: () => props.currentPage?.suppressHeader || false,
  set: (value) => handleSectionStart(value)
})
</script>

<template>
  <div class="header-footer-manager p-4 bg-gray-800 rounded-lg">
    <h3 class="text-lg text-white font-medium mb-4">Header & Footer Management</h3>
    
    <!-- Edit Mode Selection -->
    <div class="mb-4">
      <div class="flex space-x-4">
        <label class="flex items-center">
          <input
            type="radio"
            v-model="editMode"
            value="global"
            class="form-radio mr-2"
          />
          <span class="text-sm text-gray-300">Global Settings</span>
        </label>
        
        <label class="flex items-center">
          <input
            type="radio"
            v-model="editMode"
            value="alternate"
            class="form-radio mr-2"
          />
          <span class="text-sm text-gray-300">Alternate Pages</span>
        </label>
        
        <label class="flex items-center" :class="{ 'opacity-50': !currentPage }">
          <input
            type="radio"
            v-model="editMode"
            value="page"
            class="form-radio mr-2"
            :disabled="!currentPage"
          />
          <span class="text-sm text-gray-300">Current Page Only</span>
        </label>
      </div>
      
      <!-- Alternating Pages Toggle -->
      <div v-if="isAlternatingMode" class="mt-2">
        <label class="flex items-center">
          <input
            type="checkbox"
            v-model="settings.usesAlternatePages"
            class="form-checkbox mr-2"
            @change="toggleAlternatingPages($event.target.checked)"
          />
          <span class="text-sm text-gray-300">Use different headers/footers for odd and even pages</span>
        </label>
      </div>
      
      <!-- Page Type Indicator when in Alternating Mode -->
      <div v-if="isAlternatingMode && currentPage" class="mt-2">
        <span class="text-sm font-medium px-2 py-1 rounded" :class="isEvenPage ? 'bg-blue-600' : 'bg-green-600'">
          {{ isEvenPage ? 'Editing Even Page Settings' : 'Editing Odd Page Settings' }}
        </span>
      </div>
      
      <!-- Current Page Indicator -->
      <div v-if="currentPage" class="mt-2 text-xs text-gray-400">
        Current Page: {{ currentPage.name || `Page ${currentPage.pageNumber}` }}
      </div>
    </div>
    
    <!-- Layout Preview -->
    <div class="mb-6 bg-white rounded p-3">
      <!-- Header Preview -->
      <div class="flex border-b border-gray-300 py-2">
        <div 
          class="flex-1 px-2 text-sm cursor-pointer" 
          :class="{ 'bg-primary-500 bg-opacity-20 rounded': selectedSection === 'header-left' }"
          @click="selectedSection = 'header-left'"
        >
          {{ getPreviewContent(isPageSpecific ? (currentPage?.headerFooter?.header?.left || settings.global.header.left) : 
              (isAlternatingMode ? settings.alternatePages[isEvenPage ? 'even' : 'odd'].header.left : settings.global.header.left)) }}
        </div>
        <div 
          class="flex-1 px-2 text-center text-sm cursor-pointer" 
          :class="{ 'bg-primary-500 bg-opacity-20 rounded': selectedSection === 'header-center' }"
          @click="selectedSection = 'header-center'"
        >
          {{ getPreviewContent(isPageSpecific ? (currentPage?.headerFooter?.header?.center || settings.global.header.center) : 
              (isAlternatingMode ? settings.alternatePages[isEvenPage ? 'even' : 'odd'].header.center : settings.global.header.center)) }}
        </div>
        <div 
          class="flex-1 px-2 text-right text-sm cursor-pointer" 
          :class="{ 'bg-primary-500 bg-opacity-20 rounded': selectedSection === 'header-right' }"
          @click="selectedSection = 'header-right'"
        >
          {{ getPreviewContent(isPageSpecific ? (currentPage?.headerFooter?.header?.right || settings.global.header.right) : 
              (isAlternatingMode ? settings.alternatePages[isEvenPage ? 'even' : 'odd'].header.right : settings.global.header.right)) }}
        </div>
      </div>
      
      <!-- Page Content (placeholder) -->
      <div class="py-10 text-center text-gray-400 text-xs">
        Page Content
      </div>
      
      <!-- Footer Preview -->
      <div class="flex border-t border-gray-300 py-2">
        <div 
          class="flex-1 px-2 text-sm cursor-pointer" 
          :class="{ 'bg-primary-500 bg-opacity-20 rounded': selectedSection === 'footer-left' }"
          @click="selectedSection = 'footer-left'"
        >
          {{ getPreviewContent(isPageSpecific ? (currentPage?.headerFooter?.footer?.left || settings.global.footer.left) : 
              (isAlternatingMode ? settings.alternatePages[isEvenPage ? 'even' : 'odd'].footer.left : settings.global.footer.left)) }}
        </div>
        <div 
          class="flex-1 px-2 text-center text-sm cursor-pointer" 
          :class="{ 'bg-primary-500 bg-opacity-20 rounded': selectedSection === 'footer-center' }"
          @click="selectedSection = 'footer-center'"
        >
          {{ getPreviewContent(isPageSpecific ? (currentPage?.headerFooter?.footer?.center || settings.global.footer.center) : 
              (isAlternatingMode ? settings.alternatePages[isEvenPage ? 'even' : 'odd'].footer.center : settings.global.footer.center)) }}
        </div>
        <div 
          class="flex-1 px-2 text-right text-sm cursor-pointer" 
          :class="{ 'bg-primary-500 bg-opacity-20 rounded': selectedSection === 'footer-right' }"
          @click="selectedSection = 'footer-right'"
        >
          {{ getPreviewContent(isPageSpecific ? (currentPage?.headerFooter?.footer?.right || settings.global.footer.right) : 
              (isAlternatingMode ? settings.alternatePages[isEvenPage ? 'even' : 'odd'].footer.right : settings.global.footer.right)) }}
        </div>
      </div>
    </div>
    
    <!-- Section Editor -->
    <div class="bg-gray-700 rounded p-4">
      <div class="mb-3 flex items-center justify-between">
        <h4 class="text-white text-sm font-medium">
          Editing: {{ sections.find(s => s.value === selectedSection)?.label || 'Section' }}
        </h4>
        
        <div class="flex space-x-2">
          <select 
            v-model="selectedSection"
            class="text-xs bg-gray-900 text-white px-2 py-1 rounded border border-gray-600"
          >
            <option v-for="section in sections" :key="section.value" :value="section.value">
              {{ section.label }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Content Type Selection -->
      <div class="mb-3">
        <label class="block text-sm text-gray-300 mb-1">Content Type</label>
        <select
          :value="currentEditValue?.type || 'none'"
          @change="changeContentType($event.target.value)"
          class="w-full bg-gray-800 text-white rounded p-2 text-sm"
        >
          <option v-for="type in contentTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>
      
      <!-- Custom Text Input (when type is 'custom') -->
      <div v-if="currentEditValue?.type === 'custom'" class="mb-3">
        <label class="block text-sm text-gray-300 mb-1">Custom Text</label>
        <input
          v-model="customText"
          type="text"
          class="w-full bg-gray-800 text-white rounded p-2 text-sm"
          @input="updateCustomText($event.target.value)"
          placeholder="Enter custom text"
        />
      </div>
      
      <!-- Style Options -->
      <div v-if="currentEditValue?.type !== 'none'" class="space-y-3">
        <h5 class="text-sm text-gray-300 font-medium">Style Options</h5>
        
        <!-- Font Family -->
        <div>
          <label class="block text-xs text-gray-400 mb-1">Font Family</label>
          <select
            :value="currentEditValue.style?.fontFamily || 'Arial'"
            class="w-full bg-gray-800 text-white rounded p-2 text-sm"
            @change="updateFontFamily($event.target.value)"
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>
        
        <!-- Font Size -->
        <div>
          <label class="block text-xs text-gray-400 mb-1">Font Size</label>
          <select
            :value="currentEditValue.style?.fontSize || '12px'"
            class="w-full bg-gray-800 text-white rounded p-2 text-sm"
            @change="updateFontSize($event.target.value)"
          >
            <option value="10px">10px</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
          </select>
        </div>
        
        <!-- Font Weight -->
        <div>
          <label class="block text-xs text-gray-400 mb-1">Font Weight</label>
          <select
            :value="currentEditValue.style?.fontWeight || 'normal'"
            class="w-full bg-gray-800 text-white rounded p-2 text-sm"
            @change="updateFontWeight($event.target.value)"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="lighter">Lighter</option>
            <option value="bolder">Bolder</option>
          </select>
        </div>
        
        <!-- Text Color -->
        <div>
          <label class="block text-xs text-gray-400 mb-1">Text Color</label>
          <input
            :value="currentEditValue.style?.color || '#000000'"
            type="color"
            class="w-full h-8 bg-gray-800 rounded"
            @change="updateColor($event.target.value)"
          />
        </div>
        
        <!-- Text Alignment -->
        <div>
          <label class="block text-xs text-gray-400 mb-1">Alignment</label>
          <div class="flex items-center gap-2">
            <button
              v-for="align in ['left', 'center', 'right']"
              :key="align"
              class="flex-1 py-2 px-3 rounded flex justify-center items-center"
              :class="currentEditValue.style?.textAlign === align ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'"
              @click="updateAlignment(align)"
            >
              <Icon :name="`i-heroicons-text-align-${align}`" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Advanced Options -->
    <div class="mt-4 p-4 bg-gray-700 rounded">
      <h4 class="text-white text-sm font-medium mb-3">Advanced Options</h4>
      
      <!-- Running Heads -->
      <div class="flex items-center justify-between mb-3">
        <label class="text-sm text-gray-300">Running Heads</label>
        <div class="flex items-center">
          <button
            class="px-3 py-1 rounded text-xs"
            :class="hasRunningHeads ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'"
            @click="setupRunningHeads(!hasRunningHeads)"
          >
            {{ hasRunningHeads ? 'Enabled' : 'Disabled' }}
          </button>
        </div>
      </div>
      
      <!-- Special Page Treatment -->
      <div v-if="isPageSpecific && currentPage" class="mb-3">
        <label class="flex items-center">
          <input
            v-model="sectionStartSuppressHeader"
            type="checkbox"
            class="form-checkbox mr-2"
          />
          <span class="text-sm text-gray-300">Suppress header on this page</span>
          <span v-if="isStartOfSection(currentPage)" class="ml-2 px-2 py-0.5 bg-purple-700 text-white rounded-full text-xs">Section Start</span>
        </label>
      </div>
      
      <!-- Apply to All Pages -->
      <button 
        class="w-full mt-4 py-2 bg-blue-600 text-sm text-white rounded hover:bg-blue-700"
        @click="applyToAllPages"
      >
        Apply to All Pages
      </button>
      
      <!-- Reset to Defaults -->
      <button 
        class="w-full mt-2 py-2 bg-gray-600 text-sm text-white rounded hover:bg-gray-500"
        @click="resetToDefaults"
      >
        Reset to Defaults
      </button>
    </div>
  </div>
</template>

<style scoped>
.header-footer-manager {
  max-width: 700px;
  margin: 0 auto;
}
</style>
