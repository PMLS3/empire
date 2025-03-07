<script setup lang="ts">
const props = defineProps<{
  element: any
}>()

const emit = defineEmits(['update'])

const transformations = ref({
  skewX: 0,
  skewY: 0,
  scaleX: 1,
  scaleY: 1
})

const updateTransform = () => {
  const { skewX, skewY, scaleX, scaleY } = transformations.value
  
  emit('update', {
    transform: `skew(${skewX}deg, ${skewY}deg) scale(${scaleX}, ${scaleY})`
  })
}

// Watch for external changes
watch(() => props.element?.style?.transform, (newTransform) => {
  if (newTransform) {
    // Parse transform string and update controls
    // Implementation here
  }
})
</script>

<template>
  <div class="p-4 space-y-4">
    <h3 class="text-sm font-medium text-gray-200 mb-4">Transform</h3>
    
    <div class="space-y-2">
      <label class="block text-xs text-gray-400">Skew X</label>
      <input
        v-model="transformations.skewX"
        type="range"
        min="-45"
        max="45"
        step="1"
        class="w-full"
        @input="updateTransform"
      />
    </div>
    
    <div class="space-y-2">
      <label class="block text-xs text-gray-400">Skew Y</label>
      <input
        v-model="transformations.skewY"
        type="range"
        min="-45"
        max="45"
        step="1"
        class="w-full"
        @input="updateTransform"
      />
    </div>
    
    <div class="space-y-2">
      <label class="block text-xs text-gray-400">Scale X</label>
      <input
        v-model="transformations.scaleX"
        type="range"
        min="0.1"
        max="2"
        step="0.1"
        class="w-full"
        @input="updateTransform"
      />
    </div>
    
    <div class="space-y-2">
      <label class="block text-xs text-gray-400">Scale Y</label>
      <input
        v-model="transformations.scaleY"
        type="range"
        min="0.1"
        max="2"
        step="0.1"
        class="w-full"
        @input="updateTransform"
      />
    </div>
  </div>
</template>
