<script setup lang="ts">
const props = defineProps<{
  element: {
    text: {
      transform: {
        rotate: number
        skewX: number
        skewY: number
        flipX: boolean
        flipY: boolean
      }
    }
  }
}>()

const emit = defineEmits<{
  (e: 'update', updates: any): void
}>()

const updateTransform = (updates: Partial<typeof props.element.text.transform>) => {
  emit('update', {
    transform: {
      ...props.element.text.transform,
      ...updates
    }
  })
}
</script>

<template>
  <div class="space-y-4 p-4 bg-gray-800 rounded-lg">
    <!-- Rotation -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">Rotation</label>
      <div class="flex items-center gap-2">
        <input
          :value="element.text.transform.rotate"
          type="range"
          min="-180"
          max="180"
          step="1"
          class="flex-1"
          @input="updateTransform({ rotate: Number($event.target.value) })"
        />
        <input
          :value="element.text.transform.rotate"
          type="number"
          class="w-16 bg-gray-700 rounded px-2 py-1 text-white text-sm"
          @input="updateTransform({ rotate: Number($event.target.value) })"
        />
      </div>
    </div>

    <!-- Skew X -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">Skew X</label>
      <div class="flex items-center gap-2">
        <input
          :value="element.text.transform.skewX"
          type="range"
          min="-45"
          max="45"
          step="1"
          class="flex-1"
          @input="updateTransform({ skewX: Number($event.target.value) })"
        />
        <input
          :value="element.text.transform.skewX"
          type="number"
          class="w-16 bg-gray-700 rounded px-2 py-1 text-white text-sm"
          @input="updateTransform({ skewX: Number($event.target.value) })"
        />
      </div>
    </div>

    <!-- Skew Y -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">Skew Y</label>
      <div class="flex items-center gap-2">
        <input
          :value="element.text.transform.skewY"
          type="range"
          min="-45"
          max="45"
          step="1"
          class="flex-1"
          @input="updateTransform({ skewY: Number($event.target.value) })"
        />
        <input
          :value="element.text.transform.skewY"
          type="number"
          class="w-16 bg-gray-700 rounded px-2 py-1 text-white text-sm"
          @input="updateTransform({ skewY: Number($event.target.value) })"
        />
      </div>
    </div>

    <!-- Flip Controls -->
    <div class="flex gap-2">
      <button
        class="flex-1 p-2 rounded hover:bg-gray-700"
        :class="{ 'bg-gray-700': element.text.transform.flipX }"
        @click="updateTransform({ flipX: !element.text.transform.flipX })"
      >
        <Icon name="ph:flip-horizontal-bold" class="w-4 h-4 text-white" />
        <span class="text-sm text-white">Flip X</span>
      </button>
      <button
        class="flex-1 p-2 rounded hover:bg-gray-700"
        :class="{ 'bg-gray-700': element.text.transform.flipY }"
        @click="updateTransform({ flipY: !element.text.transform.flipY })"
      >
        <Icon name="ph:flip-vertical-bold" class="w-4 h-4 text-white" />
        <span class="text-sm text-white">Flip Y</span>
      </button>
    </div>
  </div>
</template>
