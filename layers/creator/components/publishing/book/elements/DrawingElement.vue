<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  style: {
    width: string
    height: string
    top: string
    left: string
    transform: string
  }
  selected: boolean
  canvasWidth: number
  canvasHeight: number
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const isDrawing = ref(false)
const lastPoint = ref({ x: 0, y: 0 })
const canvasData = ref<string>('')

const { drawingState, saveState } = useDrawingTools()
const { editorState } = useEditor()

const emit = defineEmits<{
  (e: 'select', event: MouseEvent): void
  (e: 'update', canvas: string): void
}>()

// Initialize canvas
onMounted(() => {
  if (!canvas.value) return

  ctx.value = canvas.value.getContext('2d')
  if (!ctx.value) return

  // Set canvas size
  canvas.value.width = props.canvasWidth
  canvas.value.height = props.canvasHeight

  // Set initial styles
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'

  // Restore previous canvas data if it exists
  if (canvasData.value) {
    const img = new Image()
    img.onload = () => {
      ctx.value?.drawImage(img, 0, 0)
    }
    img.src = canvasData.value
  }
})

// Watch for canvas size changes
watch(() => [props.canvasWidth, props.canvasHeight], ([newWidth, newHeight]) => {
  if (!canvas.value || !ctx.value) return

  // Save current canvas state
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.value.width
  tempCanvas.height = canvas.value.height
  const tempCtx = tempCanvas.getContext('2d')
  tempCtx?.drawImage(canvas.value, 0, 0)

  // Resize canvas
  canvas.value.width = newWidth
  canvas.value.height = newHeight

  // Restore drawing with new size
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'
  ctx.value.drawImage(tempCanvas, 0, 0, newWidth, newHeight)
})

// Drawing functions
const startDrawing = (e: MouseEvent) => {
  if (!editorState.value.drawing.active) return
  isDrawing.value = true
  const rect = canvas.value?.getBoundingClientRect()
  if (!rect || !ctx.value) return

  lastPoint.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }

  // Set brush properties
  ctx.value.strokeStyle = drawingState.value.color
  ctx.value.lineWidth = drawingState.value.brushSize
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'
}

const draw = (e: MouseEvent) => {
  if (!editorState.value.drawing.active) return
  if (!isDrawing.value || !ctx.value || !canvas.value) return

  const rect = canvas.value.getBoundingClientRect()
  const currentPoint = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }

  ctx.value.beginPath()
  ctx.value.moveTo(lastPoint.value.x, lastPoint.value.y)
  ctx.value.lineTo(currentPoint.x, currentPoint.y)
  ctx.value.stroke()

  // Handle symmetry if enabled
  if (drawingState.value.symmetry) {
    const centerX = canvas.value.width / 2
    ctx.value.beginPath()
    ctx.value.moveTo(centerX + (centerX - lastPoint.value.x), lastPoint.value.y)
    ctx.value.lineTo(centerX + (centerX - currentPoint.x), currentPoint.y)
    ctx.value.stroke()
  }

  lastPoint.value = currentPoint
}

const stopDrawing = () => {
  if (isDrawing.value && canvas.value) {
    isDrawing.value = false
    const imageData = canvas.value.toDataURL()
    canvasData.value = imageData
    emit('update', imageData)
    saveState(imageData)
  }
}

// Watch for pressure sensitivity
watch(() => drawingState.value.pressure, (enabled) => {
  if (!canvas.value) return

  if (enabled) {
    canvas.value.addEventListener('pointerdown', (e: PointerEvent) => {
      if (ctx.value) {
        ctx.value.lineWidth = drawingState.value.brushSize * e.pressure
      }
    })
  }
})
</script>

<template>
  <div
    :style="style"
    class="absolute"
    @click="emit('select', $event)"
  >
    <canvas
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      class="w-full h-full border border-gray-200 dark:border-gray-700"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
    />
    <div
      v-if="selected"
      class="absolute inset-0 border-2 border-primary-500 pointer-events-none"
    />
  </div>
</template>
