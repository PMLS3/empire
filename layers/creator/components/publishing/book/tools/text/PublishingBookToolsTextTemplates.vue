<script setup lang="ts">
import { ref } from 'vue'

const templates = ref([
  {
    id: 'heading-1',
    name: 'Heading 1',
    styles: {
      font: 'Arial',
      size: '24px',
      color: '#000000',
      weight: 'bold',
      lineHeight: 1.2
    }
  },
  {
    id: 'body-text',
    name: 'Body Text',
    styles: {
      font: 'Georgia',
      size: '16px',
      color: '#333333',
      weight: 'normal',
      lineHeight: 1.5
    }
  },
  {
    id: 'quote',
    name: 'Quote',
    styles: {
      font: 'Georgia',
      size: '18px',
      color: '#666666',
      weight: 'italic',
      lineHeight: 1.6
    }
  }
])

const emit = defineEmits(['apply-template'])

const applyTemplate = (template: any) => {
  emit('apply-template', template.styles)
}

const { customTemplates, saveAsTemplate, deleteTemplate } = useTextTemplates()
const { textState } = useTextTools()

const showSaveDialog = ref(false)
const newTemplateName = ref('')

const selectedCategory = ref('all')
const categories = [
  { id: 'all', label: 'All Templates' },
  { id: 'heading', label: 'Headings' },
  { id: 'body', label: 'Body Text' },
  { id: 'caption', label: 'Captions' },
  { id: 'custom', label: 'Custom' }
]

const filteredTemplates = computed(() => {
  const allTemplates = [...templates.value, ...customTemplates.value]
  if (selectedCategory.value === 'all') return allTemplates
  return allTemplates.filter(t => t.category === selectedCategory.value)
})

const handleSaveTemplate = () => {
  if (!newTemplateName.value.trim()) return
  saveAsTemplate(newTemplateName.value, { ...textState.value })
  newTemplateName.value = ''
  showSaveDialog.value = false
}
</script>

<template>
  <div class="space-y-4">
    <!-- Categories -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="category in categories"
        :key="category.id"
        class="px-3 py-1 rounded text-sm"
        :class="{
          'bg-gray-700 text-white': selectedCategory === category.id,
          'bg-gray-800 text-gray-400 hover:bg-gray-700': selectedCategory !== category.id
        }"
        @click="selectedCategory = category.id"
      >
        {{ category.label }}
      </button>
    </div>

    <!-- Templates List -->
    <div class="space-y-2">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
        @click="applyTemplate(template)"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-white">{{ template.name }}</span>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">{{ template.category }}</span>
            <button
              v-if="template.category === 'custom'"
              class="p-1 rounded hover:bg-gray-500"
              @click.stop="deleteTemplate(template.id)"
            >
              <Icon name="ph:trash" class="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        <div
          class="text-sm"
          :style="{
            fontFamily: template.styles.font,
            fontSize: `${template.styles.size}px`,
            fontWeight: template.styles.bold ? 'bold' : 'normal',
            fontStyle: template.styles.italic ? 'italic' : 'normal',
            lineHeight: template.styles.lineHeight,
            color: template.styles.color
          }"
        >
          {{ template.preview }}
        </div>
      </div>
    </div>

    <!-- Save Template Button -->
    <button
      class="w-full px-4 py-2 bg-gray-700 rounded text-sm text-white hover:bg-gray-600"
      @click="showSaveDialog = true"
    >
      Save Current Style as Template
    </button>

    <!-- Save Template Dialog -->
    <Modal :open="showSaveDialog" @close="showSaveDialog = false">
      <div class="p-4 bg-gray-800 rounded-lg space-y-4">
        <h3 class="text-lg text-white font-medium">Save as Template</h3>
        <div class="space-y-2">
          <label class="text-sm text-gray-400">Template Name</label>
          <input
            v-model="newTemplateName"
            type="text"
            class="w-full bg-gray-700 rounded p-2 text-white"
            placeholder="Enter template name"
          />
        </div>
        <div class="flex justify-end gap-2">
          <button
            class="px-4 py-2 rounded text-sm text-gray-400 hover:bg-gray-700"
            @click="showSaveDialog = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-blue-600 rounded text-sm text-white hover:bg-blue-700"
            @click="handleSaveTemplate"
          >
            Save Template
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>
