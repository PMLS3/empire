<script setup lang="ts">

const props = defineProps<{
  element: {
    id: string
    text: {
      content: string
      font: string
      size: number
      color: string
      alignment: 'left' | 'center' | 'right'
      bold: boolean
      italic: boolean
      underline: boolean
      lineHeight: number
      letterSpacing: number
      opacity: number
      richText: {
        enabled: boolean
        content: string
        lists: {
          bullet: boolean
          ordered: boolean
          indent: number
        }
        links: {
          enabled: boolean
          url: string
          newTab: boolean
        }
      }
    }
  }
  isDragMode: boolean
}>()

const emit = defineEmits<{
  (e: 'update', updates: Partial<typeof props.element.text>): void
  (e: 'toggleMode', isDragMode: boolean): void
}>()

const { textState } = useTextTools()
const { updateElementText } = useEditor()

const selection = ref<Selection | null>(null)
const showLinkDialog = ref(false)
const linkUrl = ref('')
const linkNewTab = ref(true)

// Additional text formatting options
const textStyles = {
  'B': { command: 'bold', icon: 'ph:text-b-bold' },
  'I': { command: 'italic', icon: 'ph:text-italic-bold' },
  'U': { command: 'underline', icon: 'ph:text-underline-bold' },
  'S': { command: 'strikethrough', icon: 'ph:text-strikethrough-bold' },
  'H': { command: 'backColor', icon: 'ph:highlighter-bold' },
  'Sub': { command: 'subscript', icon: 'ph:arrow-square-down-bold' },
  'Sup': { command: 'superscript', icon: 'ph:arrow-square-up-bold' }
}

const showColorPicker = ref(false)
const colorType = ref<'text' | 'highlight'>('text')
const selectedColor = ref('#000000')

// Get current selection
const updateSelection = () => {
  selection.value = window.getSelection()
}

// Format selected text
const formatText = (command: string, value?: string) => {
  if (props.isDragMode) return
  document.execCommand(command, false, value)
  updateContent()
}

// Handle link creation
const handleLink = () => {
  if (selection.value?.toString()) {
    showLinkDialog.value = true
  }
}

const insertLink = () => {
  if (linkUrl.value) {
    formatText('createLink', linkUrl.value)
    if (linkNewTab.value) {
      const link = selection.value?.anchorNode?.parentElement
      if (link?.tagName === 'A') {
        link.setAttribute('target', '_blank')
        link.setAttribute('rel', 'noopener noreferrer')
      }
    }
    showLinkDialog.value = false
    linkUrl.value = ''
  }
}

const updateContent = () => {
  const content = props.element.text.content
  emit('update', { content })
}

// Watch for selection changes
onMounted(() => {
  document.addEventListener('selectionchange', updateSelection)
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', updateSelection)
})

const alignmentOptions = [
  { id: 'left', icon: 'ph:text-align-left' },
  { id: 'center', icon: 'ph:text-align-center' },
  { id: 'right', icon: 'ph:text-align-right' }
]

const updateProperty = (updates: Partial<typeof props.element.text>) => {
  emit('update', updates)
}

const handleColor = (type: 'text' | 'highlight') => {
  colorType.value = type
  showColorPicker.value = true
}

const applyColor = () => {
  if (colorType.value === 'text') {
    formatText('foreColor', selectedColor.value)
  } else {
    formatText('backColor', selectedColor.value)
  }
  showColorPicker.value = false
}

const toggleMode = () => {
  emit('toggleMode', !props.isDragMode)
}
</script>

<template>
  <div
    class="absolute top-0 left-0 transform -translate-y-full bg-gray-800 rounded shadow-lg p-2 flex gap-2 items-center"
  >
    <!-- Mode Toggle -->
    <button
      class="p-1.5 rounded hover:bg-gray-700"
      :class="{ 'bg-primary-500': !props.isDragMode }"
      @click="toggleMode"
      data-tooltip="Toggle Edit/Move Mode"
    >
      <Icon
        :name="props.isDragMode ? 'ph:arrows-out-bold' : 'ph:text-t-bold'"
        class="w-4 h-4 text-white"
      />
    </button>

    <div class="w-px h-4 bg-gray-700" />

    <!-- Text Style -->
    <div class="flex gap-1">
      <button
        v-for="(style, label) in textStyles"
        :key="label"
        :disabled="props.isDragMode"
        class="p-1.5 rounded hover:bg-gray-700"
        :class="{ 'opacity-50 cursor-not-allowed': props.isDragMode }"
        @click="formatText(style.command)"
        :data-tooltip="label"
      >
        <Icon :name="style.icon" class="w-4 h-4 text-white" />
      </button>
    </div>

    <div class="w-px h-4 bg-gray-700" />

    <!-- Text/Background Color -->
    <div class="flex gap-1">
      <button
        class="p-1.5 rounded hover:bg-gray-700"
        @click="handleColor('text')"
      >
        <Icon name="ph:text-color-bold" class="w-4 h-4 text-white" />
      </button>
      <button
        class="p-1.5 rounded hover:bg-gray-700"
        @click="handleColor('highlight')"
      >
        <Icon name="ph:highlighter-bold" class="w-4 h-4 text-white" />
      </button>
    </div>

    <div class="w-px h-4 bg-gray-700" />

    <!-- Lists -->
    <div class="flex gap-1">
      <button
        class="p-1.5 rounded hover:bg-gray-700"
        @click="formatText('insertUnorderedList')"
      >
        <Icon name="ph:list-bullets" class="w-4 h-4 text-white" />
      </button>
      <button
        class="p-1.5 rounded hover:bg-gray-700"
        @click="formatText('insertOrderedList')"
      >
        <Icon name="ph:list-numbers" class="w-4 h-4 text-white" />
      </button>
      <button
        class="p-1.5 rounded hover:bg-gray-700"
        @click="formatText('indent')"
      >
        <Icon name="ph:indent" class="w-4 h-4 text-white" />
      </button>
      <button
        class="p-1.5 rounded hover:bg-gray-700"
        @click="formatText('outdent')"
      >
        <Icon name="ph:outdent" class="w-4 h-4 text-white" />
      </button>
    </div>

    <div class="w-px h-4 bg-gray-700" />

    <!-- Text Alignment -->
    <div class="flex gap-1">
      <button
        v-for="align in ['left', 'center', 'right']"
        :key="align"
        class="p-1.5 rounded hover:bg-gray-700"
        @click="formatText('justify' + align)"
      >
        <Icon :name="`ph:text-align-${align}`" class="w-4 h-4 text-white" />
      </button>
    </div>

    <div class="w-px h-4 bg-gray-700" />

    <!-- Link -->
    <button
      class="p-1.5 rounded hover:bg-gray-700"
      @click="handleLink"
    >
      <Icon name="ph:link" class="w-4 h-4 text-white" />
    </button>

    <div class="w-px h-4 bg-gray-700" />

    <!-- Font Size -->
    <input
      :value="props.element.text.size"
      type="number"
      min="8"
      max="72"
      class="w-16 bg-gray-700 rounded px-2 py-1 text-white text-sm"
      @input="updateProperty({ size: Number($event.target.value) })"
    />

    <!-- Text Color -->
    <input
      :value="props.element.text.color"
      type="color"
      class="w-8 h-8 rounded bg-gray-700"
      @input="updateProperty({ color: $event.target.value })"
    />
  </div>

  <!-- Color Picker Dialog -->
  <Modal :open="showColorPicker" @close="showColorPicker = false">
    <div class="p-4 bg-gray-800 rounded-lg space-y-4">
      <h3 class="text-lg text-white font-medium">
        {{ colorType === 'text' ? 'Text Color' : 'Highlight Color' }}
      </h3>
      <div class="space-y-2">
        <input
          v-model="selectedColor"
          type="color"
          class="w-full h-10 rounded bg-gray-700"
        />
      </div>
      <div class="flex justify-end gap-2">
        <button
          class="px-4 py-2 rounded text-sm text-gray-400 hover:bg-gray-700"
          @click="showColorPicker = false"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-blue-600 rounded text-sm text-white hover:bg-blue-700"
          @click="applyColor"
        >
          Apply
        </button>
      </div>
    </div>
  </Modal>

  <!-- Link Dialog -->
  <Modal :open="showLinkDialog" @close="showLinkDialog = false">
    <div class="p-4 bg-gray-800 rounded-lg space-y-4">
      <h3 class="text-lg text-white font-medium">Insert Link</h3>
      <div class="space-y-2">
        <label class="text-sm text-gray-400">URL</label>
        <input
          v-model="linkUrl"
          type="url"
          class="w-full bg-gray-700 rounded p-2 text-white"
          placeholder="https://"
        />
      </div>
      <div class="flex items-center gap-2">
        <input
          v-model="linkNewTab"
          type="checkbox"
          id="newTab"
          class="rounded bg-gray-700"
        />
        <label for="newTab" class="text-sm text-gray-400">
          Open in new tab
        </label>
      </div>
      <div class="flex justify-end gap-2">
        <button
          class="px-4 py-2 rounded text-sm text-gray-400 hover:bg-gray-700"
          @click="showLinkDialog = false"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-blue-600 rounded text-sm text-white hover:bg-blue-700"
          @click="insertLink"
        >
          Insert
        </button>
      </div>
    </div>
  </Modal>
</template>
