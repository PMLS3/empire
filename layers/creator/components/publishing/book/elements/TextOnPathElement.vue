<script setup lang="ts">
const props = defineProps<{
  element: {
    id: string
    text: {
      content: string
      font: string
      size: number
      color: string
      path: {
        type: 'arc' | 'wave' | 'circle' | 'custom'
        data: string
        offset: number
        spacing: number
        reverse: boolean
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

const emit = defineEmits<{
  (e: 'select', event: MouseEvent): void
  (e: 'resize', size: { width: number; height: number; }): void
  (e: 'move', position: { x: number; y: number; }): void
  (e: 'rotate', angle: number): void
  (e: 'update', updates: any): void
}>()

// Generate path data based on type
const pathData = computed(() => {
  const width = parseInt(props.element.style.width)
  const height = parseInt(props.element.style.height)

  switch (props.element.text.path.type) {
    case 'arc':
      return `M 0,${height/2} Q ${width/2},0 ${width},${height/2}`
    case 'wave':
      return `M 0,${height/2} Q ${width/4},0 ${width/2},${height/2} T ${width},${height/2}`
    case 'circle':
      return `M ${width},${height/2} A ${width/2},${height/2} 0 1,1 ${width},${height/2 + 0.1}`
    case 'custom':
      return props.element.text.path.data
  }
})

// Calculate text position along path
const textPath = computed(() => {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', pathData.value)

  const pathLength = path.getTotalLength()
  const spacing = props.element.text.path.spacing
  const offset = props.element.text.path.offset
  const text = props.element.text.content

  const positions = []
  for (let i = 0; i < text.length; i++) {
    const distance = offset + (i * spacing * pathLength / 100)
    const point = path.getPointAtLength(distance)
    const angle = getAngleAtLength(path, distance)
    positions.push({ x: point.x, y: point.y, angle, char: text[i] })
  }

  return positions
})

const getAngleAtLength = (path: SVGPathElement, length: number) => {
  const point1 = path.getPointAtLength(length - 1)
  const point2 = path.getPointAtLength(length + 1)
  return Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180 / Math.PI
}
</script>

<template>
  <DraggableElement
    :selected="selected"
    :style="element.style"
    :canvas-width="canvasWidth"
    :canvas-height="canvasHeight"
    :grid-size="gridSize"
    :snap-to-grid="snapToGrid"
    @select="(e: MouseEvent) => emit('select', e)"
    @move="(pos: { x: number; y: number; }) => emit('move', pos)"
    @resize="(size: { width: number; height: number; }) => emit('resize', size)"
    @rotate="(angle: number) => emit('rotate', angle)"
  >
    <svg
      class="w-full h-full"
      :viewBox="`0 0 ${element.style.width.replace('px', '')} ${element.style.height.replace('px', '')}`"
    >
      <!-- Guide Path (visible when selected) -->
      <path
        v-if="selected"
        :d="pathData"
        fill="none"
        stroke="#4F46E5"
        stroke-width="1"
        stroke-dasharray="4 4"
      />

      <!-- Text Characters -->
      <text
        v-for="(pos, i) in textPath"
        :key="i"
        :x="pos.x"
        :y="pos.y"
        :transform="`rotate(${pos.angle}, ${pos.x}, ${pos.y})`"
        :style="{
          fontFamily: element.text.font,
          fontSize: `${element.text.size}px`,
          fill: element.text.color
        }"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        {{ pos.char }}
      </text>
    </svg>
  </DraggableElement>
</template>
