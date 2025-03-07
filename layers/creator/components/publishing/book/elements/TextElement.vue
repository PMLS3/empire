<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'

const props = defineProps<{
  element: any
  selected: boolean
  canvasWidth: number
  canvasHeight: number
  gridSize: number
  snapToGrid: boolean
}>()

const emit = defineEmits(['select', 'move', 'resize', 'rotate', 'textChange', 'update'])

// Get required values from the element
const { id, style, text } = props.element

// Element positioning
const position = ref({
  x: parseInt(style.left) || 0,
  y: parseInt(style.top) || 0,
  width: parseInt(style.width) || 200,
  height: parseInt(style.height) || 100,
  rotation: style.transform ? parseFloat(style.transform.replace(/[^\d.-]/g, '')) || 0 : 0
})

// Text editing state
const isEditing = ref(false)
const textContent = ref(text?.content || '')
const textElement = ref<HTMLDivElement | null>(null)

// Watch for content changes to update the model
watch(textContent, (newValue) => {
  emit('textChange', newValue)
})

// Apply text styles
const textStyles = computed(() => {
  if (!text) return {}
  
  let styles = {
    fontFamily: text.font || 'Arial',
    fontSize: `${text.size || 16}px`,
    color: text.color || '#000000',
    textAlign: text.alignment || 'left',
    fontWeight: text.bold ? 'bold' : 'normal',
    fontStyle: text.italic ? 'italic' : 'normal',
    textDecoration: text.underline ? 'underline' : 'none',
    lineHeight: text.lineHeight || 1.5,
    letterSpacing: `${text.letterSpacing || 0}px`,
    opacity: text.opacity || 1,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }
  
  // Add text effects if enabled
  if (text.effects?.shadow?.enabled) {
    const shadow = text.effects.shadow
    styles.textShadow = `${shadow.offsetX || 2}px ${shadow.offsetY || 2}px ${shadow.blur || 4}px ${shadow.color || '#000000'}`
  }
  
  if (text.effects?.outline?.enabled) {
    const outline = text.effects.outline
    styles.WebkitTextStroke = `${outline.width || 1}px ${outline.color || '#000000'}`
  }
  
  return styles
})

// Handlers
const handleDragStart = (e: MouseEvent) => {
  // If we're editing text, don't start dragging
  if (isEditing.value) return
  
  e.stopPropagation()
  emit('select', e)
}

const handleDoubleClick = (e: MouseEvent) => {
  e.stopPropagation()
  isEditing.value = true
  nextTick(() => {
    // Focus and select all text when entering edit mode
    if (textElement.value) {
      textElement.value.focus()
    }
  })
}

const handleInputBlur = () => {
  isEditing.value = false
}

// Handle position updates from the parent
watch(() => props.element.style, (newStyle) => {
  position.value = {
    x: parseInt(newStyle.left) || 0,
    y: parseInt(newStyle.top) || 0,
    width: parseInt(newStyle.width) || 200,
    height: parseInt(newStyle.height) || 100,
    rotation: newStyle.transform ? parseFloat(newStyle.transform.replace(/[^\d.-]/g, '')) || 0 : 0
  }
}, { deep: true })

// Handle content updates from the parent
watch(() => props.element.text, (newText) => {
  if (newText && !isEditing.value) {
    textContent.value = newText.content || ''
  }
}, { deep: true })

// Implement text wrapping around other elements if enabled
const getTextWrapStyles = computed(() => {
  if (!text?.wrapping?.enabled) return {}
  
  return {
    flexWrap: 'wrap',
    flexDirection: 'column',
    alignContent: 'flex-start'
  }
})

// Handle content paste to strip formatting
const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  if (!e.clipboardData) return
  
  const text = e.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
}

// Helper to convert text alignment to flexbox alignment
const getAlignmentStyle = computed(() => {
  if (!text?.alignment) return 'flex-start'
  
  switch (text.alignment) {
    case 'center': return 'center'
    case 'right': return 'flex-end'
    default: return 'flex-start'
  }
})
</script>

<template>
  <div
    :id="id"
    class="absolute text-element"
    :class="{ selected: selected }"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`, 
      width: `${position.width}px`,
      height: 'auto',
      transform: `rotate(${position.rotation}deg)`,
      cursor: isEditing ? 'text' : 'move'
    }"
    @mousedown="handleDragStart"
    @dblclick="handleDoubleClick"
  >
    <!-- Text content -->
    <div
      ref="textElement"
      class="text-content"
      :style="{
        ...textStyles,
        ...getTextWrapStyles,
        outline: isEditing ? '2px solid #4CAF50' : 'none',
        minHeight: '1em',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: getAlignmentStyle
      }"
      :contenteditable="isEditing"
      @blur="handleInputBlur"
      @paste="handlePaste"
      v-html="textContent"
      @input="e => textContent = e.target.innerHTML"
    ></div>
    
    <!-- Resize handles -->
    <template v-if="selected && !isEditing">
      <div class="resize-handle top-left"></div>
      <div class="resize-handle top-right"></div>
      <div class="resize-handle bottom-left"></div>
      <div class="resize-handle bottom-right"></div>
      
      <!-- Rotation handle -->
      <div class="rotation-handle">
        <Icon name="ph:arrow-clockwise-bold" class="w-4 h-4 text-primary-500" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.text-element {
  position: absolute;
  user-select: none;
}

.text-element.selected {
  outline: 2px solid #4CAF50;
}

.text-content {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 4px;
}

.text-content[contenteditable="true"] {
  cursor: text;
  user-select: text;
  outline-offset: 2px;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: white;
  border: 1px solid #4CAF50;
  border-radius: 50%;
}

.top-left {
  top: -5px;
  left: -5px;
  cursor: nwse-resize;
}

.top-right {
  top: -5px;
  right: -5px;
  cursor: nesw-resize;
}

.bottom-left {
  bottom: -5px;
  left: -5px;
  cursor: nesw-resize;
}

.bottom-right {
  bottom: -5px;
  right: -5px;
  cursor: nwse-resize;
}

.rotation-handle {
  position: absolute;
  top: -30px;
  left: calc(50% - 10px);
  width: 20px;
  height: 20px;
  background-color: white;
  border: 1px solid #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/></svg>'), auto;
}
</style>
