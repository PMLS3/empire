<script setup lang="ts">
const {
  drawingState,
  setBrushSize,
  setColor,
  togglePressure,
  toggleSymmetry,
  undo,
  redo
} = useDrawingTools()

defineOptions({
  name: 'PublishingBookToolsDrawingPanelMain'
})
</script>

<template>
  <div class="p-4 space-y-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
    <!-- Brush Size -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-gray-300">Brush Size</label>
      <input
        type="range"
        :value="drawingState.brushSize"
        @input="e => setBrushSize(Number((e.target as HTMLInputElement).value))"
        min="0.5"
        max="50"
        step="0.5"
        class="w-full accent-primary-500"
      />
    </div>

    <!-- Color Picker -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-gray-300">Color</label>
      <input
        type="color"
        :value="drawingState.color"
        @input="e => setColor((e.target as HTMLInputElement).value)"
        class="w-full h-10 bg-gray-700 border border-gray-600 rounded"
      />
    </div>

    <!-- Tools -->
    <div class="flex gap-2">
      <BaseButton
        :color="drawingState.pressure ? 'primary' : 'default'"
        class="flex-1"
        @click="togglePressure"
      >
        <Icon name="i-heroicons-finger-print" class="h-5 w-5" />
        <span>Pressure</span>
      </BaseButton>

      <BaseButton
        :color="drawingState.symmetry ? 'primary' : 'default'"
        class="flex-1"
        @click="toggleSymmetry"
      >
        <Icon name="i-heroicons-arrows-right-left" class="h-5 w-5" />
        <span>Symmetry</span>
      </BaseButton>
    </div>

    <!-- Undo/Redo -->
    <div class="flex gap-2">
      <BaseButton
        class="flex-1"
        @click="undo"
      >
        <Icon name="i-heroicons-arrow-uturn-left" class="h-5 w-5" />
        <span>Undo</span>
      </BaseButton>

      <BaseButton
        class="flex-1"
        @click="redo"
      >
        <Icon name="i-heroicons-arrow-uturn-right" class="h-5 w-5" />
        <span>Redo</span>
      </BaseButton>
    </div>
  </div>
</template>
