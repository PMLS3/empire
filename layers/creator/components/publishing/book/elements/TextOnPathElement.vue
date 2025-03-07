<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps<{
  element: any
  selected: boolean
  canvasWidth: number
  canvasHeight: number
  gridSize: number
  snapToGrid: boolean
}>()

const emit = defineEmits(['select', 'move', 'resize', 'rotate', 'pathChange', 'textChange', 'update'])

// Get required values from the element
const { id, style, textOnPath } = props.element

// Element positioning
const position = ref({
  x: parseInt(style.left) || 0,
  y: parseInt(style.top) || 0,
  width: parseInt(style.width) || 300,
  height: parseInt(style.height) || 150,
  rotation: style.transform ? parseFloat(style.transform.replace(/[^\d.-]/g, '')) || 0 : 0
})

// SVG element references
const svgElement = ref<SVGSVGElement | null>(null)
const pathElement = ref<SVGPathElement | null>(null)
const textPathElement = ref<SVGTextPathElement | null>(null)

// Text and path data state
const textContent = ref(textOnPath?.text || 'Edit text on path')
const pathType = ref(textOnPath?.pathType || 'arc')
const pathData = ref(textOnPath?.path || '')
const isEditing = ref(false)

// Path types and their generator functions
const pathGenerators = {
  arc: (width: number, height: number): string => {
    return `M10,${height/2} A${width/2 - 10},${height/2 - 10} 0 0,1 ${width-10},${height/2}`
  },
  wave: (width: number, height: number): string => {
    const amplitude = height / 4
    const frequency = 3 // number of waves
    let path = `M10,${height/2}`
    
    for (let i = 0; i <= frequency; i++) {
      const x1 = 10 + (i * width) / frequency / 2
      const y1 = height / 2 - amplitude
      const x2 = 10 + ((i + 0.5) * width) / frequency / 2
      const y2 = height / 2 + amplitude
      const x3 = 10 + ((i + 1) * width) / frequency / 2
      const y3 = height / 2 - amplitude
      
      path += ` C${x1},${y1} ${x2},${y2} ${x3},${y3}`
    }
    
    return path
  },
  circle: (width: number, height: number): string => {
    const radius = Math.min(width, height) / 2 - 10
    const cx = width / 2
    const cy = height / 2
    return `M${cx + radius},${cy} A${radius},${radius} 0 1,1 ${cx - radius},${cy} A${radius},${radius} 0 1,1 ${cx + radius},${cy}`
  },
  straight: (width: number, height: number): string => {
    return `M10,${height/2} L${width-10},${height/2}`
  }
}

// Generate path data based on selected type and dimensions
const generatePath = () => {
  const width = position.value.width
  const height = position.value.height
  
  if (pathType.value in pathGenerators) {
    const generator = pathGenerators[pathType.value as keyof typeof pathGenerators]
    pathData.value = generator(width, height)
    
    // Emit path change event
    emit('pathChange', {
      pathType: pathType.value,
      path: pathData.value
    })
  }
}

// Watch for container size changes and regenerate path
watch([() => position.value.width, () => position.value.height], () => {
  generatePath()
}, { immediate: false })

// Watch for path type changes
watch(pathType, () => {
  generatePath()
})

// Watch for content changes
watch(textContent, (newValue) => {
  emit('textChange', newValue)
})

// Handle position updates from the parent
watch(() => props.element.style, (newStyle) => {
  position.value = {
    x: parseInt(newStyle.left) || 0,
    y: parseInt(newStyle.top) || 0,
    width: parseInt(newStyle.width) || 300,
    height: parseInt(newStyle.height) || 150,
    rotation: newStyle.transform ? parseFloat(newStyle.transform.replace(/[^\d.-]/g, '')) || 0 : 0
  }
  generatePath()
}, { deep: true })

// Handle text content updates from parent
watch(() => props.element.textOnPath?.text, (newText) => {
  if (newText && !isEditing.value) {
    textContent.value = newText
  }
})

// Apply text styles
const textStyles = computed(() => {
  if (!textOnPath?.style) return {}
  
  let styles: Record<string, string> = {
    fontFamily: textOnPath.style.font || 'Arial',
    fontSize: `${textOnPath.style.size || 16}px`,
    fill: textOnPath.style.color || '#000000',
    fontWeight: textOnPath.style.bold ? 'bold' : 'normal',
    fontStyle: textOnPath.style.italic ? 'italic' : 'normal',
    textDecoration: textOnPath.style.underline ? 'underline' : 'none',
    letterSpacing: `${textOnPath.style.letterSpacing || 0}px`,
  }
  
  return styles
})

// Text path properties
const textPathProps = computed(() => {
  return {
    startOffset: `${textOnPath?.startOffset || 0}%`,
    textAnchor: textOnPath?.alignment || 'middle',
    spacing: textOnPath?.spacing || 'auto',
    side: textOnPath?.side || 'left'
  }
})

// Handlers
const handleSelect = (e: MouseEvent) => {
  if (isEditing.value) return
  
  e.stopPropagation()
  emit('select', e)
}

const handleDoubleClick = (e: MouseEvent) => {
  e.stopPropagation()
  isEditing.value = true
  
  // Focus might be needed depending on editing implementation
}

const handleEditingComplete = () => {
  isEditing.value = false
  emit('update', {
    text: textContent.value,
    pathType: pathType.value,
    path: pathData.value
  })
}

const handlePathTypeChange = (type: string) => {
  pathType.value = type
}

// Initialize
onMounted(() => {
  if (!pathData.value) {
    generatePath()
  }
})
</script>

<template>
  <div
    :id="id"
    class="absolute text-on-path-element"
    :class="{ selected: selected }"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`, 
      width: `${position.width}px`,
      height: `${position.height}px`,
      transform: `rotate(${position.rotation}deg)`,
      cursor: isEditing ? 'text' : 'move',
      overflow: 'visible'
    }"
    @mousedown="handleSelect"
    @dblclick="handleDoubleClick"
  >
    <!-- SVG container for path and text -->
    <svg
      ref="svgElement"
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      :style="{ width: '100%', height: '100%' }"
    >
      <!-- Path visualization (visible when selected or during editing) -->
      <path
        ref="pathElement"
        :d="pathData"
        :stroke="selected || isEditing ? '#4CAF50' : 'transparent'"
        stroke-width="1"
        fill="none"
        stroke-dasharray="3,3"
      />
      <!-- Text on path -->
      <text :style="textStyles">
        <textPath
          ref="textPathElement"
          :href="`#textpath-${id}`"
          v-bind="textPathProps"
        >
          {{ textContent }}
        </textPath>
      </text>
      <!-- Hidden path for textPath reference -->
      <path
        :id="`textpath-${id}`"
        :d="pathData"
        fill="none"
        stroke="transparent"
      />
    </svg>
    
    <!-- Edit interface when selected -->
    <div v-if="isEditing" class="edit-interface">
      <div class="edit-panel">
        <label>Text:</label>
        <input 
          v-model="textContent"
          type="text"
          @blur="handleEditingComplete"
        />
        
        <label>Path Type:</label>
        <select v-model="pathType">
          <option value="arc">Arc</option>
          <option value="wave">Wave</option>
          <option value="circle">Circle</option>
          <option value="straight">Straight</option>
        </select>
        
        <button @click="handleEditingComplete">
          Done
        </button>
      </div>
    </div>
    
    <!-- Resize handles when selected but not editing -->
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
.text-on-path-element {
  position: absolute;
  user-select: none;
}

.text-on-path-element.selected {
  outline: 2px solid #4CAF50;
  z-index: 10;
}

.edit-interface {
  position: absolute;
  bottom: -60px;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #4CAF50;
  padding: 8px;
  border-radius: 4px;
  z-index: 100;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.edit-panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.edit-panel label {
  font-size: 12px;
  color: #333;
}

.edit-panel input,
.edit-panel select {
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 12px;
}

.edit-panel button {
  margin-top: 4px;
  padding: 4px 8px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
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
