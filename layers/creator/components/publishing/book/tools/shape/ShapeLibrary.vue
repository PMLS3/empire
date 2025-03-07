<script setup lang="ts">
import { ref } from 'vue'

const shapeLibrary = ref([
  {
    id: 'basic-shapes',
    name: 'Basic Shapes',
    items: [
      { type: 'rectangle', label: 'Rectangle' },
      { type: 'circle', label: 'Circle' },
      { type: 'triangle', label: 'Triangle' },
      { type: 'polygon', sides: 5, label: 'Pentagon' },
      { type: 'star', points: 5, label: 'Star' }
    ]
  },
  {
    id: 'arrows',
    name: 'Arrows',
    items: [
      { type: 'arrow-right', label: 'Right Arrow' },
      { type: 'arrow-left', label: 'Left Arrow' },
      { type: 'arrow-both', label: 'Double Arrow' },
      { type: 'arrow-curved', label: 'Curved Arrow' }
    ]
  },
  {
    id: 'callouts',
    name: 'Callouts',
    items: [
      { type: 'speech-bubble', label: 'Speech Bubble' },
      { type: 'thought-bubble', label: 'Thought Bubble' },
      { type: 'rectangle-callout', label: 'Rectangle Callout' },
      { type: 'oval-callout', label: 'Oval Callout' }
    ]
  }
])

const emit = defineEmits(['select-shape'])

const selectShape = (shape: any) => {
  emit('select-shape', shape)
}
</script>

<template>
  <div class="p-4">
    <h3 class="text-sm font-medium text-gray-200 mb-4">Shape Library</h3>
    
    <div class="space-y-4">
      <div v-for="category in shapeLibrary" :key="category.id" class="space-y-2">
        <h4 class="text-xs font-medium text-gray-400">{{ category.name }}</h4>
        
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="shape in category.items"
            :key="shape.type"
            class="p-2 rounded hover:bg-gray-700 flex flex-col items-center"
            @click="selectShape(shape)"
          >
            <svg class="w-8 h-8 mb-1">
              <!-- Shape preview SVG path here -->
            </svg>
            <span class="text-xs text-gray-300">{{ shape.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
