<script setup lang="ts">
const { shapeState } = useShapeTools()

const shapeTypes = [
  { id: 'rectangle', icon: 'ph:square-duotone', label: 'Rectangle' },
  { id: 'circle', icon: 'ph:circle-duotone', label: 'Circle' },
  { id: 'triangle', icon: 'ph:triangle-duotone', label: 'Triangle' },
  { id: 'line', icon: 'ph:line-segment-duotone', label: 'Line' },
  { id: 'polygon', icon: 'ph:polygon-duotone', label: 'Polygon' }
]

// Preview shape path data
const previewPath = computed(() => {
  const width = 40
  const height = 40

  switch (shapeState.value.type) {
    case 'rectangle':
      const radius = shapeState.value.cornerRadius
      return `M${radius},0 h${width - 2 * radius} a${radius},${radius} 0 0 1 ${radius},${radius} v${height - 2 * radius} a${radius},${radius} 0 0 1 -${radius},${radius} h-${width - 2 * radius} a${radius},${radius} 0 0 1 -${radius},-${radius} v-${height - 2 * radius} a${radius},${radius} 0 0 1 ${radius},-${radius}`
    case 'circle':
      return `M${width},${height/2} a${width/2},${height/2} 0 1,1 -${width},0 a${width/2},${height/2} 0 1,1 ${width},0`
    case 'triangle':
      return `M${width/2},0 L${width},${height} L0,${height} Z`
    case 'line':
      return `M0,0 L${width},${height}`
    case 'polygon':
      const points = []
      const sides = 5
      const centerX = width/2
      const centerY = height/2
      const polygonRadius = Math.min(width, height) / 2
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
        const x = centerX + polygonRadius * Math.cos(angle)
        const y = centerY + polygonRadius * Math.sin(angle)
        points.push(`${x},${y}`)
      }
      return `M${points.join(' L')} Z`
  }
})
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- Shape Type Selection -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">Shape Type</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="shape in shapeTypes"
          :key="shape.id"
          class="p-2 rounded hover:bg-gray-700"
          :class="{ 'bg-gray-700': shapeState.type === shape.id }"
          @click="shapeState.type = shape.id"
        >
          <Icon :name="shape.icon" class="w-5 h-5 text-white" />
        </button>
      </div>
    </div>

    <!-- Shape Preview -->
    <div class="border border-gray-700 rounded p-2">
      <svg class="w-10 h-10" viewBox="0 0 40 40">
        <path
          :d="previewPath"
          :fill="shapeState.isFilled ? shapeState.fill : 'none'"
          :stroke="shapeState.hasStroke ? shapeState.stroke : 'none'"
          :stroke-width="shapeState.strokeWidth"
          :opacity="shapeState.opacity"
        />
      </svg>
    </div>

    <!-- Fill Color -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-xs text-gray-400">Fill</label>
        <BaseButtonIcon
          class="p-1.5 rounded hover:bg-gray-700"
          :class="{ 'bg-gray-700': shapeState.isFilled }"
          @click="shapeState.isFilled = !shapeState.isFilled"
        >
          <Icon
            :name="shapeState.isFilled ? 'ph:paint-bucket-fill' : 'ph:paint-bucket'"
            class="w-4 h-4 text-white"
          />
        </BaseButtonIcon>
      </div>
      <input
        v-if="shapeState.isFilled"
        v-model="shapeState.fill"
        type="color"
        class="w-full h-8 rounded bg-gray-700"
      />
    </div>

    <!-- Stroke Color -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-xs text-gray-400">Stroke</label>
        <BaseButtonIcon
          class="p-1.5 rounded hover:bg-gray-700"
          :class="{ 'bg-gray-700': shapeState.hasStroke }"
          @click="shapeState.hasStroke = !shapeState.hasStroke"
        >
          <Icon
            :name="shapeState.hasStroke ? 'ph:pen-fill' : 'ph:pen'"
            class="w-4 h-4 text-white"
          />
        </BaseButtonIcon>
      </div>
      <template v-if="shapeState.hasStroke">
        <input
          v-model="shapeState.stroke"
          type="color"
          class="w-full h-8 rounded bg-gray-700"
        />
        <input
          v-model="shapeState.strokeWidth"
          type="range"
          min="0.5"
          max="50"
          step="0.5"
          class="w-full"
        />
      </template>
    </div>

    <!-- Corner Radius (for rectangle) -->
    <div v-if="shapeState.type === 'rectangle'" class="space-y-2">
      <label class="text-xs text-gray-400">Corner Radius</label>
      <input
        v-model="shapeState.cornerRadius"
        type="range"
        min="0"
        max="50"
        step="1"
        class="w-full"
      />
    </div>

    <!-- Opacity -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">Opacity</label>
      <input
        v-model="shapeState.opacity"
        type="range"
        min="0"
        max="1"
        step="0.1"
        class="w-full"
      />
    </div>
  </div>
</template>
