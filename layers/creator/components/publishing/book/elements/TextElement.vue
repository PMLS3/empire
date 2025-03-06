<script setup lang="ts">

const { editorState } = useEditor()

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
      effects: {
        shadow: {
          enabled: boolean
          color: string
          blur: number
          offsetX: number
          offsetY: number
        }
        outline: {
          enabled: boolean
          color: string
          width: number
        }
      }
      wrapping: {
        enabled: boolean
        mode: 'none' | 'around' | 'through'
        margin: number
        excludeElements: string[]  // IDs of elements to ignore for wrapping
      }
      transform: {
        rotate: number
        skewX: number
        skewY: number
        flipX: boolean
        flipY: boolean
      }
    }
    style: {
      width: string
      height: string
      top: string
      left: string
      transform: string
      zIndex?: string
    }
  }
  selected: boolean
  canvasWidth: number
  canvasHeight: number
  gridSize: number
  snapToGrid: boolean
}>()

const isEditing = ref(false)
const isDragMode = ref(true)  // Default to drag mode

const emit = defineEmits<{
  (e: 'select', event: MouseEvent): void
  (e: 'resize', size: { width: number; height: number }): void
  (e: 'move', position: { x: number; y: number }): void
  (e: 'rotate', angle: number): void
  (e: 'textChange', content: string): void
  (e: 'update', updates: Partial<typeof props.element.text>): void
  (e: 'toggleMode', isDragMode: boolean): void
}>()

const handleDoubleClick = (e: MouseEvent) => {
  if (!isDragMode.value) {  // Only handle double click in edit mode
    e.stopPropagation()
    isEditing.value = true
    editorState.value.text.isEditing = true
  }
}

const toggleMode = (newMode: boolean) => {
  isDragMode.value = newMode
  if (isDragMode.value) {
    isEditing.value = false
    editorState.value.text.isEditing = false
  }
}

const handleBlur = () => {
  isEditing.value = false
  editorState.value.text.isEditing = false
}

const textStyle = computed(() => ({
  fontFamily: props.element.text.font,
  fontSize: `${props.element.text.size}px`,
  color: props.element.text.color,
  textAlign: props.element.text.alignment,
  fontWeight: props.element.text.bold ? 'bold' : 'normal',
  fontStyle: props.element.text.italic ? 'italic' : 'normal',
  textDecoration: props.element.text.underline ? 'underline' : 'none',
  lineHeight: props.element.text.lineHeight,
  letterSpacing: `${props.element.text.letterSpacing}px`,
  opacity: props.element.text.opacity,
  cursor: isDragMode.value ? 'move' : 'text',
  userSelect: isDragMode.value ? 'none' : 'text',
  WebkitUserSelect: isDragMode.value ? 'none' : 'text',
  ...(props.element.text.effects.shadow.enabled && {
    textShadow: `${props.element.text.effects.shadow.offsetX}px ${props.element.text.effects.shadow.offsetY}px ${props.element.text.effects.shadow.blur}px ${props.element.text.effects.shadow.color}`
  }),
  ...(props.element.text.effects.outline.enabled && {
    WebkitTextStroke: `${props.element.text.effects.outline.width}px ${props.element.text.effects.outline.color}`,
    textStroke: `${props.element.text.effects.outline.width}px ${props.element.text.effects.outline.color}`
  }),
  transform: [
    `rotate(${props.element.text.transform.rotate}deg)`,
    `skew(${props.element.text.transform.skewX}deg, ${props.element.text.transform.skewY}deg)`,
    props.element.text.transform.flipX ? 'scaleX(-1)' : '',
    props.element.text.transform.flipY ? 'scaleY(-1)' : ''
  ].filter(Boolean).join(' ')
}))

const handleTextUpdate = (updates: Partial<typeof props.element.text>) => {
  emit('update', updates)
}

// Get all elements that could affect text wrapping
const wrappingElements = computed(() => {
  if (!props.element.text.wrapping.enabled) return []
  return editorState.value.elements.filter(el =>
    el.id !== props.element.id &&
    !props.element.text.wrapping.excludeElements.includes(el.id) &&
    ['shape', 'image', 'puzzle'].includes(el.type)
  )
})

// Calculate text wrapping path
const textWrapPath = computed(() => {
  if (!props.element.text.wrapping.enabled || wrappingElements.value.length === 0) {
    return null
  }

  // Create path for text to wrap around
  const paths = wrappingElements.value.map(el => {
    const rect = el.style
    const margin = props.element.text.wrapping.margin
    return `M${rect.left - margin},${rect.top - margin} h${rect.width + 2 * margin} v${rect.height + 2 * margin} h-${rect.width + 2 * margin}Z`
  })

  return paths.join(' ')
})
</script>

<template>
  <DraggableElement
    :selected="selected"
    :style="element.style"
    :canvas-width="canvasWidth"
    :canvas-height="canvasHeight"
    :grid-size="gridSize"
    :snap-to-grid="snapToGrid"
    :draggable="isDragMode"
    @select="(e) => emit('select', e)"
    @move="(pos) => emit('move', pos)"
    @resize="(size) => emit('resize', size)"
    @rotate="(angle) => emit('rotate', angle)"
  >
    <!-- Text Toolbar -->
    <PublishingBookToolsTextToolbar
      v-if="selected"
      :element="element"
      :is-drag-mode="isDragMode"
      @update="handleTextUpdate"
      @toggle-mode="toggleMode"
    />
    <div
      class="w-full h-full"
      :style="[
        textStyle,
        element.text.wrapping.enabled && {
          shapeOutside: textWrapPath ? `path('${textWrapPath}')` : 'none',
          shapeMargin: `${element.text.wrapping.margin}px`
        }
      ]"
      :contenteditable="!isDragMode"
      @click.stop="isDragMode.value && toggleMode(false)"
      @dblclick="handleDoubleClick"
      @blur="handleBlur"
      @input="(e) => emit('textChange', (e.target as HTMLElement).innerText)"
    >
      {{ element.text.content }}
    </div>
  </DraggableElement>
</template>
