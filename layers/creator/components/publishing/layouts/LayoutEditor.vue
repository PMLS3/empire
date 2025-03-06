<script lang="ts" setup>
interface Layout {
  id: string
  name: string
  description: string
  category: string
  elements: LayoutElement[]
  grid: {
    columns: number
    rows: number
  }
}

interface LayoutElement {
  id: string
  type: 'text' | 'image' | 'heading' | 'list' | 'table' | 'spacer'
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  properties: {
    fontSize?: number
    fontFamily?: string
    alignment?: 'left' | 'center' | 'right'
    columns?: number
    rows?: number
    spacing?: number
  }
}

const props = defineProps<{
  modelValue?: Layout
}>()

const emit = defineEmits(['update:modelValue', 'save'])

const layout = ref<Layout>(props.modelValue || {
  id: '',
  name: '',
  description: '',
  category: 'Custom',
  elements: [],
  grid: {
    columns: 12,
    rows: 12
  }
})

const selectedElement = ref<LayoutElement | null>(null)

const elementTypes = [
  { label: 'Text Block', value: 'text', icon: 'ph:text-t' },
  { label: 'Image', value: 'image', icon: 'ph:image' },
  { label: 'Heading', value: 'heading', icon: 'ph:text-h' },
  { label: 'List', value: 'list', icon: 'ph:list-bullets' },
  { label: 'Table', value: 'table', icon: 'ph:table' },
  { label: 'Spacer', value: 'spacer', icon: 'ph:dots-three-outline' }
]

const addElement = (type: string) => {
  const newElement: LayoutElement = {
    id: crypto.randomUUID(),
    type: type as LayoutElement['type'],
    position: {
      x: 0,
      y: 0,
      width: 4,
      height: 2
    },
    properties: {}
  }
  layout.value.elements.push(newElement)
  selectedElement.value = newElement
}

const updateElement = (element: LayoutElement) => {
  const index = layout.value.elements.findIndex(e => e.id === element.id)
  if (index !== -1) {
    layout.value.elements[index] = element
    emit('update:modelValue', layout.value)
  }
}

const removeElement = (elementId: string) => {
  layout.value.elements = layout.value.elements.filter(e => e.id !== elementId)
  if (selectedElement.value?.id === elementId) {
    selectedElement.value = null
  }
  emit('update:modelValue', layout.value)
}

const saveLayout = () => {
  emit('save', layout.value)
}

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    layout.value = JSON.parse(JSON.stringify(newValue))
  }
}, { deep: true })
</script>

<template>
  <div class="flex h-full">
    <!-- Layout Canvas -->
    <div class="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
      <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg aspect-[1/1.4142] relative">
        <!-- Grid Lines -->
        <div
          class="absolute inset-0"
          :style="{
            backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)',
            backgroundSize: `${100/layout.grid.columns}% ${100/layout.grid.rows}%`
          }"
        />

        <!-- Layout Elements -->
        <div
          v-for="element in layout.elements"
          :key="element.id"
          class="absolute border-2 rounded cursor-move"
          :class="{
            'border-primary-500': selectedElement?.id === element.id,
            'border-gray-200 dark:border-gray-700': selectedElement?.id !== element.id
          }"
          :style="{
            left: `${(element.position.x / layout.grid.columns) * 100}%`,
            top: `${(element.position.y / layout.grid.rows) * 100}%`,
            width: `${(element.position.width / layout.grid.columns) * 100}%`,
            height: `${(element.position.height / layout.grid.rows) * 100}%`
          }"
          @click="selectedElement = element"
        >
          <div class="flex items-center justify-center h-full">
            <Icon
              :name="elementTypes.find(t => t.value === element.type)?.icon || ''"
              class="h-6 w-6 text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="w-80 border-l border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <!-- Layout Settings -->
      <div>
        <h3 class="font-medium text-gray-700 dark:text-gray-300 mb-4">Layout Settings</h3>
        <div class="space-y-4">
          <FormInput
            v-model="layout.name"
            label="Name"
            placeholder="Enter layout name"
          />
          <FormTextarea
            v-model="layout.description"
            label="Description"
            placeholder="Describe your layout"
            rows="3"
          />
          <FormSelect
            v-model="layout.category"
            label="Category"
            :options="['Custom', 'Chapter', 'Title', 'Gallery', 'Content']"
          />
        </div>
      </div>

      <!-- Element Tools -->
      <div>
        <h3 class="font-medium text-gray-700 dark:text-gray-300 mb-4">Add Elements</h3>
        <div class="grid grid-cols-3 gap-2">
          <BaseButton
            v-for="type in elementTypes"
            :key="type.value"
            color="gray"
            variant="ghost"
            class="flex flex-col items-center p-2 h-auto"
            @click="addElement(type.value)"
          >
            <Icon :name="type.icon" class="h-5 w-5" />
            <span class="text-xs mt-1">{{ type.label }}</span>
          </BaseButton>
        </div>
      </div>

      <!-- Element Properties -->
      <div v-if="selectedElement">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-medium text-gray-700 dark:text-gray-300">Element Properties</h3>
          <BaseButton
            color="danger"
            variant="ghost"
            size="xs"
            @click="removeElement(selectedElement.id)"
          >
            <Icon name="ph:trash" class="h-4 w-4" />
          </BaseButton>
        </div>

        <div class="space-y-4">
          <!-- Position -->
          <div class="grid grid-cols-2 gap-2">
            <FormInput
              v-model="selectedElement.position.x"
              type="number"
              label="X Position"
              min="0"
              :max="layout.grid.columns - selectedElement.position.width"
            />
            <FormInput
              v-model="selectedElement.position.y"
              type="number"
              label="Y Position"
              min="0"
              :max="layout.grid.rows - selectedElement.position.height"
            />
            <FormInput
              v-model="selectedElement.position.width"
              type="number"
              label="Width"
              min="1"
              :max="layout.grid.columns - selectedElement.position.x"
            />
            <FormInput
              v-model="selectedElement.position.height"
              type="number"
              label="Height"
              min="1"
              :max="layout.grid.rows - selectedElement.position.y"
            />
          </div>

          <!-- Type-specific properties -->
          <template v-if="selectedElement.type === 'text' || selectedElement.type === 'heading'">
            <FormInput
              v-model="selectedElement.properties.fontSize"
              type="number"
              label="Font Size"
              min="8"
              max="72"
            />
            <FormSelect
              v-model="selectedElement.properties.fontFamily"
              label="Font Family"
              :options="['Arial', 'Times New Roman', 'Georgia', 'Helvetica']"
            />
            <FormSelect
              v-model="selectedElement.properties.alignment"
              label="Alignment"
              :options="['left', 'center', 'right']"
            />
          </template>

          <template v-if="selectedElement.type === 'table'">
            <FormInput
              v-model="selectedElement.properties.columns"
              type="number"
              label="Columns"
              min="1"
              max="10"
            />
            <FormInput
              v-model="selectedElement.properties.rows"
              type="number"
              label="Rows"
              min="1"
              max="10"
            />
          </template>

          <template v-if="selectedElement.type === 'list'">
            <FormInput
              v-model="selectedElement.properties.spacing"
              type="number"
              label="Item Spacing"
              min="0"
              max="24"
            />
          </template>
        </div>
      </div>

      <!-- Save Button -->
      <BaseButton
        color="primary"
        class="w-full"
        @click="saveLayout"
      >
        Save Layout
      </BaseButton>
    </div>
  </div>
</template>
