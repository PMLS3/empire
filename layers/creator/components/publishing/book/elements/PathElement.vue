<script setup lang="ts">


const props = defineProps<{
  element: {
    id: string
    path: {
      points: Array<{ x: number; y: number }>
      brushSize: number
      color: string
      opacity: number
      type: 'pencil' | 'marker' | 'airbrush'
      originalWidth?: number
      originalHeight?: number
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

const emit = defineEmits<{
  (e: 'select', event: MouseEvent): void
  (e: 'resize', size: { width: number; height: number }): void
  (e: 'move', position: { x: number; y: number }): void
  (e: 'rotate', angle: number): void
}>()

const { editorState } = useEditor()

// Calculate SVG path data and dimensions
const pathData = computed(() => {
  const points = props.element.path.points
  if (points.length < 2) return ''

  const commands: string[] = []
  commands.push(`M ${points[0].x} ${points[0].y}`)

  for (let i = 1; i < points.length; i++) {
    commands.push(`L ${points[i].x} ${points[i].y}`)
  }

  return commands.join(' ')
})

// Calculate SVG viewBox
const viewBox = computed(() => {
  const points = props.element.path.points
  if (points.length < 2) return '0 0 0 0'

  const minX = Math.min(...points.map(p => p.x))
  const minY = Math.min(...points.map(p => p.y))
  const maxX = Math.max(...points.map(p => p.x))
  const maxY = Math.max(...points.map(p => p.y))

  const padding = props.element.path.brushSize * 2
  return `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`
})
</script>

<template>
  <DraggableElement
    v-show="!editorState.drawing.isDrawing"
    :selected="selected"
    :style="element.style"
    :canvas-width="canvasWidth"
    :canvas-height="canvasHeight"
    :grid-size="gridSize"
    :snap-to-grid="snapToGrid"
    @select="(e) => emit('select', e)"
    @move="(pos) => emit('move', pos)"
    @resize="(size) => emit('resize', size)"
    @rotate="(angle) => emit('rotate', angle)"
  >
    <svg
      :viewBox="viewBox"
      preserveAspectRatio="xMidYMid meet"
      class="w-full h-full pointer-events-none"
    >
      <path
        :d="pathData"
        :stroke="element.path.color"
        :stroke-width="element.path.brushSize"
        :opacity="element.path.opacity"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </DraggableElement>
</template>
