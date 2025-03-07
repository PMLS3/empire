<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Element } from '../../../../types/editor'
import { useShapeTools } from '../../../../composables/editor/useShapeTools'

const props = defineProps<{
  element: Element
  selected: boolean
  canvasWidth: number
  canvasHeight: number
  gridSize: number
  snapToGrid: boolean
}>()

const emit = defineEmits(['select', 'move', 'resize', 'rotate', 'update'])

// Get shape properties
const { style, shape } = props.element

// Get shape tools for gradient handling
const { getGradientCSS } = useShapeTools()

// Element positioning
const position = ref({
  x: parseInt(style.left) || 0,
  y: parseInt(style.top) || 0,
  width: parseInt(style.width) || 100,
  height: parseInt(style.height) || 100,
  rotation: style.transform ? parseFloat(style.transform.replace(/[^\d.-]/g, '')) || 0 : 0
})

// Shape path calculation
const shapePath = computed(() => {
  const width = position.value.width
  const height = position.value.height
  const shapeType = shape?.type || 'rectangle'
  const cornerRadius = shape?.cornerRadius || 0

  switch (shapeType) {
    case 'rectangle':
      if (cornerRadius > 0) {
        const r = Math.min(cornerRadius, width / 2, height / 2)
        return `M${r},0 h${width - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${height - 2 * r} a${r},${r} 0 0 1 -${r},${r} h-${width - 2 * r} a${r},${r} 0 0 1 -${r},-${r} v-${height - 2 * r} a${r},${r} 0 0 1 ${r},-${r}`
      }
      return `M0,0 h${width} v${height} h-${width} z`
      
    case 'circle':
      const rx = width / 2
      const ry = height / 2
      return `M${width},${height/2} a${rx},${ry} 0 1,1 -${width},0 a${rx},${ry} 0 1,1 ${width},0`
      
    case 'triangle':
      return `M${width/2},0 L${width},${height} L0,${height} Z`
      
    case 'line':
      return `M0,0 L${width},${height}`
      
    case 'polygon':
      const sides = shape?.sides || 5
      const points = []
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) / 2
      
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        points.push(`${x},${y}`)
      }
      
      return `M${points.join(' L')} Z`
      
    default:
      return `M0,0 h${width} v${height} h-${width} z`
  }
})

// Gradient fill if enabled
const fillStyle = computed(() => {
  if (!shape) return 'none'
  
  if (shape.isFilled) {
    if (shape.useGradient && shape.gradient) {
      return shape.gradient.type === 'linear' 
        ? `url(#gradient-${props.element.id})` 
        : `url(#radial-gradient-${props.element.id})`
    }
    return shape.fill || '#000000'
  }
  return 'none'
})

// Stroke styles
const strokeStyle = computed(() => {
  if (!shape?.hasStroke) return 'none'
  return shape.stroke || '#000000'
})

const strokeWidth = computed(() => {
  return shape?.strokeWidth || 1
})

// Handle element selection
const handleSelect = (e: MouseEvent) => {
  e.stopPropagation()
  emit('select', e)
}

// Gradient definitions
const linearGradient = computed(() => {
  if (!shape?.gradient) return null
  
  const { startColor, endColor, angle } = shape.gradient
  const gradientAngle = angle || 90
  
  // Convert angle to SVG coordinates
  const x1 = '0%'
  const y1 = '0%'
  const x2 = gradientAngle === 90 ? '100%' : gradientAngle === 270 ? '0%' : '50%'
  const y2 = gradientAngle === 0 ? '0%' : gradientAngle === 180 ? '100%' : '50%'
  
  return { id: `gradient-${props.element.id}`, x1, y1, x2, y2, startColor, endColor }
})

const radialGradient = computed(() => {
  if (!shape?.gradient) return null
  
  const { startColor, endColor, position } = shape.gradient
  let cx = '50%'
  let cy = '50%'
  
  // Map position names to SVG coordinates
  if (position === 'top-left') {
    cx = '25%'
    cy = '25%'
  } else if (position === 'top-right') {
    cx = '75%'
    cy = '25%'
  } else if (position === 'bottom-left') {
    cx = '25%'
    cy = '75%'
  } else if (position === 'bottom-right') {
    cx = '75%'
    cy = '75%'
  }
  
  return { id: `radial-gradient-${props.element.id}`, cx, cy, startColor, endColor }
})

// Effect properties
const effectStyles = computed(() => {
  const effects = shape?.effects || {}
  let styles: Record<string, string> = {}
  
  // Shadow effect
  if (effects.shadow?.enabled) {
    const shadow = effects.shadow
    const offsetX = shadow.offsetX || 2
    const offsetY = shadow.offsetY || 2
    const blur = shadow.blur || 4
    const color = shadow.color || 'rgba(0,0,0,0.3)'
    
    styles.filter = `drop-shadow(${offsetX}px ${offsetY}px ${blur}px ${color})`
  }
  
  // Opacity
  if (shape?.opacity !== undefined && shape.opacity < 1) {
    styles.opacity = shape.opacity.toString()
  }
  
  return styles
})

// Handle position updates from parent
watch(() => props.element.style, (newStyle) => {
  position.value = {
    x: parseInt(newStyle.left) || 0,
    y: parseInt(newStyle.top) || 0,
    width: parseInt(newStyle.width) || 100,
    height: parseInt(newStyle.height) || 100,
    rotation: newStyle.transform ? parseFloat(newStyle.transform.replace(/[^\d.-]/g, '')) || 0 : 0
  }
}, { deep: true })

// Special case for editing polygon sides
const updatePolygonSides = (sides: number) => {
  emit('update', {
    shape: {
      ...shape,
      sides: Math.max(3, Math.min(12, sides)) // Limit between 3 and 12 sides
    }
  })
}
</script>

<template>
  <div
    :id="id"
    class="absolute shape-element"
    :class="{ selected: selected }"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`, 
      width: `${position.width}px`,
      height: `${position.height}px`,
      transform: `rotate(${position.rotation}deg)`,
      cursor: 'move',
      ...effectStyles
    }"
    @mousedown="handleSelect"
  >
    <!-- SVG Shape Rendering -->
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      :style="{ width: '100%', height: '100%' }"
    >
      <defs>
        <!-- Linear Gradient Definition -->
        <linearGradient 
          v-if="shape?.useGradient && shape?.gradient?.type === 'linear' && linearGradient"
          :id="linearGradient.id"
          :x1="linearGradient.x1"
          :y1="linearGradient.y1"
          :x2="linearGradient.x2"
          :y2="linearGradient.y2"
        >
          <stop offset="0%" :stop-color="linearGradient.startColor" />
          <stop offset="100%" :stop-color="linearGradient.endColor" />
        </linearGradient>
        
        <!-- Radial Gradient Definition -->
        <radialGradient 
          v-if="shape?.useGradient && shape?.gradient?.type === 'radial' && radialGradient"
          :id="radialGradient.id"
          :cx="radialGradient.cx"
          :cy="radialGradient.cy"
          r="50%"
          fx="50%"
          fy="50%"
        >
          <stop offset="0%" :stop-color="radialGradient.startColor" />
          <stop offset="100%" :stop-color="radialGradient.endColor" />
        </radialGradient>
      </defs>
      
      <!-- Actual Shape Path -->
      <path 
        :d="shapePath" 
        :fill="fillStyle"
        :stroke="strokeStyle"
        :stroke-width="strokeWidth"
        vector-effect="non-scaling-stroke"
      />
    </svg>
    
    <!-- Resize handles when selected -->
    <template v-if="selected">
      <div class="resize-handle top-left"></div>
      <div class="resize-handle top-right"></div>
      <div class="resize-handle bottom-left"></div>
      <div class="resize-handle bottom-right"></div>
      
      <!-- Rotation handle -->
      <div class="rotation-handle">
        <Icon name="ph:arrow-clockwise-bold" class="w-4 h-4 text-primary-500" />
      </div>
      
      <!-- Control panel for polygon sides when applicable -->
      <div v-if="shape?.type === 'polygon'" class="polygon-controls">
        <label>Sides: {{ shape.sides || 5 }}</label>
        <div class="controls">
          <button @click="updatePolygonSides((shape.sides || 5) - 1)">-</button>
          <input 
            type="range"
            :min="3"
            :max="12"
            :value="shape.sides || 5"
            @input="updatePolygonSides(parseInt($event.target.value))"
          />
          <button @click="updatePolygonSides((shape.sides || 5) + 1)">+</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.shape-element {
  position: absolute;
  user-select: none;
}

.shape-element.selected {
  outline: 2px solid #4CAF50;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: white;
  border: 1px solid #4CAF50;
  border-radius: 50%;
  z-index: 10;
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
  z-index: 10;
}

.polygon-controls {
  position: absolute;
  bottom: -50px;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #4CAF50;
  padding: 8px;
  border-radius: 4px;
  z-index: 100;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.polygon-controls label {
  display: block;
  font-size: 12px;
  margin-bottom: 4px;
}

.polygon-controls .controls {
  display: flex;
  align-items: center;
}

.polygon-controls button {
  width: 24px;
  height: 24px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.polygon-controls input[type=range] {
  flex: 1;
  margin: 0 8px;
}
</style>
