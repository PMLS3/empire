<script setup lang="ts">
const props = defineProps<{
  element: {
    id: string
    shape: {
      type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'polygon'
      fill: string
      stroke: string
      strokeWidth: number
      opacity: number
      cornerRadius?: number
      isFilled: boolean
      hasStroke: boolean
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

// Generate SVG path based on shape type
const shapePath = computed(() => {
  const width = parseInt(props.element.style.width)
  const height = parseInt(props.element.style.height)

  switch (props.element.shape.type) {
    case 'rectangle':
      return `M${props.element.shape.cornerRadius},0
              h${width - 2 * props.element.shape.cornerRadius || 0}
              a${props.element.shape.cornerRadius},${props.element.shape.cornerRadius} 0 0 1 ${props.element.shape.cornerRadius},${props.element.shape.cornerRadius}
              v${height - 2 * props.element.shape.cornerRadius || 0}
              a${props.element.shape.cornerRadius},${props.element.shape.cornerRadius} 0 0 1 -${props.element.shape.cornerRadius},${props.element.shape.cornerRadius}
              h-${width - 2 * props.element.shape.cornerRadius || 0}
              a${props.element.shape.cornerRadius},${props.element.shape.cornerRadius} 0 0 1 -${props.element.shape.cornerRadius},-${props.element.shape.cornerRadius}
              v-${height - 2 * props.element.shape.cornerRadius || 0}
              a${props.element.shape.cornerRadius},${props.element.shape.cornerRadius} 0 0 1 ${props.element.shape.cornerRadius},-${props.element.shape.cornerRadius}`
    case 'circle':
      const rx = width / 2
      const ry = height / 2
      return `M${width},${height/2}
              a${rx},${ry} 0 1,1 -${width},0
              a${rx},${ry} 0 1,1 ${width},0`
    case 'triangle':
      return `M${width/2},0 L${width},${height} L0,${height} Z`
    case 'line':
      return `M0,0 L${width},${height}`
    case 'polygon':
      // Default to pentagon
      const points = []
      const sides = 5
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
        const x = width/2 + (width/2) * Math.cos(angle)
        const y = height/2 + (height/2) * Math.sin(angle)
        points.push(`${x},${y}`)
      }
      return `M${points.join(' L')} Z`
  }
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
    @select="(e) => emit('select', e)"
    @move="(pos) => emit('move', pos)"
    @resize="(size) => emit('resize', size)"
    @rotate="(angle) => emit('rotate', angle)"
  >
    <svg
      class="w-full h-full"
      :viewBox="`0 0 ${element.style.width.replace('px', '')} ${element.style.height.replace('px', '')}`"
    >
      <path
        :d="shapePath"
        :fill="element.shape.isFilled ? element.shape.fill : 'none'"
        :stroke="element.shape.hasStroke ? element.shape.stroke : 'none'"
        :stroke-width="element.shape.strokeWidth"
        :opacity="element.shape.opacity"
      />
    </svg>
  </DraggableElement>
</template>
