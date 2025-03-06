<script setup lang="ts">
defineOptions({
  name: 'DrawingPanel'
})

const {
  drawingState,
  setBrushType,
  setBrushSize,
  setColor,
  togglePressure,
  toggleSymmetry,
  undo,
  redo
} = useDrawingTools()

const brushTypes = [
  { value: 'pencil', label: 'Pencil', icon: 'i-heroicons-pencil' },
  { value: 'marker', label: 'Marker', icon: 'i-heroicons-paint-brush' },
  { value: 'airbrush', label: 'Airbrush', icon: 'i-heroicons-sparkles' }
]
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- Brush Types -->
    <div class="flex gap-2">
      <BaseButton
        v-for="type in brushTypes"
        :key="type.value"
        :color="drawingState.brushType === type.value ? 'primary' : 'gray'"
        @click="setBrushType(type.value)"
      >
        <Icon :name="type.icon" class="h-5 w-5" />
      </BaseButton>
    </div>

    <!-- Brush Size -->
    <div class="space-y-2">
      <label class="text-sm font-medium">Brush Size</label>
      <input
        type="range"
        :value="drawingState.brushSize"
        @input="(e: Event) => setBrushSize(Number((e.target as HTMLInputElement).value))"
        min="0.5"
        max="50"
        step="0.5"
        class="w-full"
      />
    </div>

    <!-- Color Picker -->
    <div class="space-y-2">
      <label class="text-sm font-medium">Color</label>
      <input
        type="color"
        :value="drawingState.color"
        @input="(e: Event) => setColor((e.target as HTMLInputElement).value)"
        class="w-full h-10"
      />
    </div>

    <!-- Tools -->
    <div class="flex gap-2">
      <BaseButton
        :color="drawingState.pressure ? 'primary' : 'gray'"
        @click="togglePressure"
      >
        <Icon name="i-heroicons-finger-print" class="h-5 w-5" />
        <span>Pressure</span>
      </BaseButton>

      <BaseButton
        :color="drawingState.symmetry ? 'primary' : 'gray'"
        @click="toggleSymmetry"
      >
        <Icon name="i-heroicons-arrows-right-left" class="h-5 w-5" />
        <span>Symmetry</span>
      </BaseButton>
    </div>

    <!-- Undo/Redo -->
    <div class="flex gap-2">
      <BaseButton @click="undo">
        <Icon name="i-heroicons-arrow-uturn-left" class="h-5 w-5" />
        <span>Undo</span>
      </BaseButton>

      <BaseButton @click="redo">
        <Icon name="i-heroicons-arrow-uturn-right" class="h-5 w-5" />
        <span>Redo</span>
      </BaseButton>
    </div>
  </div>
</template>
