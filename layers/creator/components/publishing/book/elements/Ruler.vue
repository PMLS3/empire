<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDraggable } from '@vueuse/core'

const props = defineProps<{
  orientation: 'horizontal' | 'vertical'
  length: number
  scale: number
  unit: 'px' | 'mm' | 'cm' | 'in'
}>()

const emit = defineEmits<{
  (e: 'guide-created', position: number, orientation: 'horizontal' | 'vertical'): void
}>()

const rulerRef = ref<HTMLDivElement | null>(null)
const showPreview = ref(false)
const previewPosition = ref(0)
const isDragging = ref(false)
const dragStartPosition = ref(0)
const currentDragPosition = ref(0)

// Calculate ruler ticks based on scale and unit
const ticks = computed(() => {
  console.log('[Ruler] Recalculating ticks with:', {
    length: props.length,
    scale: props.scale,
    unit: props.unit
  })

  const scaledLength = props.length * props.scale
  const step = props.unit === 'px' ? 50 : 10 // Remove scale multiplication
  const majorStep = props.unit === 'px' ? 100 : 50 // Remove scale multiplication

  const ticks = []
  for (let i = 0; i <= scaledLength; i += step) {
    const isMajor = i % majorStep === 0
    // Use actual measurement units for labels
    const labelValue = props.unit === 'px' ?
      Math.round(i) :
      (i / 96).toFixed(1) + '"' // Convert pixels to inches if needed

    ticks.push({
      position: i,
      isMajor,
      label: isMajor ? labelValue : ''
    })
  }
  return ticks
})

// Get style for individual tick marks
const getTickStyle = (tick: { position: number, isMajor: boolean }) => {
  return props.orientation === 'horizontal'
    ? { left: `${tick.position}px` }
    : { top: `${tick.position}px` }
}

// Handle mouse interactions for guide creation
const handleMouseDown = (e: MouseEvent) => {
  if (!rulerRef.value) return

  const canvas = document.querySelector('.canvas-container')
  const canvasRect = canvas?.getBoundingClientRect()
  if (!canvasRect) return

  let position = 0
  const guideOrientation = props.orientation === 'vertical' ? 'horizontal' : 'vertical'

  if (props.orientation === 'horizontal') {
    // Clicking on top ruler - use X position relative to canvas left
    const rawX = e.clientX - canvasRect.left
    position = Math.max(0, rawX) / props.scale
  } else {
    // Clicking on left ruler - use Y position relative to canvas top
    const rawY = e.clientY - canvasRect.top
    position = Math.max(0, rawY) / props.scale
  }

  console.log('[Ruler] Guide creation:', {
    rulerOrientation: props.orientation,
    guideOrientation,
    position,
    rawEvent: {
      clientX: e.clientX,
      clientY: e.clientY,
      canvasTop: canvasRect.top,
      canvasLeft: canvasRect.left
    }
  })

  // When clicking top ruler, emit X position for vertical guide
  // When clicking left ruler, emit Y position for horizontal guide
  emit('guide-created', position, guideOrientation)
  showPreview.value = false
}

// Track mouse position for guide preview
const updateGuidePreview = (e: MouseEvent) => {
  if (!rulerRef.value) return

  const canvas = document.querySelector('.canvas-container')
  const canvasRect = canvas?.getBoundingClientRect()
  if (!canvasRect) return

  let rawPos = 0
  if (props.orientation === 'horizontal') {
    // Preview for top ruler - use X position
    rawPos = e.clientX - canvasRect.left
  } else {
    // Preview for left ruler - use Y position
    rawPos = e.clientY - canvasRect.top
  }

  previewPosition.value = Math.max(0, rawPos) / props.scale
  showPreview.value = true
}

// Hide preview when mouse leaves ruler
const hideGuidePreview = () => {
  showPreview.value = false
}

// Add this function to handle guide dragging
const startGuideDrag = (e: MouseEvent) => {
  if (!rulerRef.value) return

  const canvas = document.querySelector('.canvas-container')
  const canvasRect = canvas?.getBoundingClientRect()
  if (!canvasRect) return

  isDragging.value = true
  if (props.orientation === 'horizontal') {
    dragStartPosition.value = e.clientX - canvasRect.left
  } else {
    dragStartPosition.value = e.clientY - canvasRect.top
  }
}

const updateGuideDrag = (e: MouseEvent) => {
  if (!isDragging.value || !rulerRef.value) return

  const canvas = document.querySelector('.canvas-container')
  const canvasRect = canvas?.getBoundingClientRect()
  if (!canvasRect) return

  let newPosition = 0
  if (props.orientation === 'horizontal') {
    newPosition = e.clientX - canvasRect.left
  } else {
    newPosition = e.clientY - canvasRect.top
  }

  currentDragPosition.value = newPosition
  previewPosition.value = Math.max(0, newPosition) / props.scale
}

const endGuideDrag = () => {
  if (!isDragging.value) return

  isDragging.value = false
  const guideOrientation = props.orientation === 'vertical' ? 'horizontal' : 'vertical'
  emit('guide-created', previewPosition.value, guideOrientation)
}
</script>

<template>
  <div
    ref="rulerRef"
    class="ruler"
    :class="[orientation]"
    @mousedown="handleMouseDown"
    @mousemove="(e) => { updateGuidePreview(e); updateGuideDrag(e) }"
    @mouseup="endGuideDrag"
    @mouseleave="() => { hideGuidePreview(); endGuideDrag() }"
  >
    <!-- Ruler ticks -->
    <div
      v-for="tick in ticks"
      :key="tick.position"
      class="tick"
      :class="{ major: tick.isMajor }"
      :style="getTickStyle(tick)"
    >
      <span v-if="tick.label" class="label">{{ tick.label }}</span>
    </div>

    <!-- Guide preview -->
    <div
      v-if="showPreview"
      class="guide-preview"
      :style="{
        [orientation === 'horizontal' ? 'top' : 'left']: `${previewPosition * props.scale}px`,
        cursor: isDragging ? (orientation === 'horizontal' ? 'row-resize' : 'col-resize') : 'default'
      }"
    />
  </div>
</template>

<style scoped>
.ruler {
  position: absolute;
  background: #1a1a1a;
  z-index: 100;
}

.ruler.horizontal {
  left: 30px;
  right: 0;
  height: 30px;
  top: 0;
  border-bottom: 1px solid #333;
  cursor: col-resize;
}

.ruler.vertical {
  top: 30px;
  bottom: 0;
  width: 30px;
  left: 0;
  border-right: 1px solid #333;

  cursor: row-resize;
}

.tick {
  position: absolute;
  background: #666;
  pointer-events: none;
}

.ruler.horizontal .tick {
  width: 1px;
  height: 8px;
  bottom: 0;
}

.ruler.horizontal .tick.major {
  height: 15px;
}

.ruler.vertical .tick {
  height: 1px;
  width: 8px;
  right: 0;
}

.ruler.vertical .tick.major {
  width: 15px;
}

.label {
  position: absolute;
  color: #fff;
  font-size: 10px;
  user-select: none;
}

.ruler.horizontal .label {
  left: 2px;
  bottom: 15px;
}

.ruler.vertical .label {
  right: 15px;
  top: -5px;
}

.guide-preview {
  position: absolute;
  background: var(--color-primary-500);
  opacity: 0.5;
  pointer-events: none;
  z-index: 1000;
  transition: all 0.1s ease;
  will-change: transform;
}

.ruler.horizontal .guide-preview {
  left: 0;
  right: 0;
  height: 1px;
}

.ruler.vertical .guide-preview {
  top: 0;
  bottom: 0;
  width: 1px;
}

.ruler {
  user-select: none;
}
</style>
