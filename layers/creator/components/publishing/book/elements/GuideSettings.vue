<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  snapThreshold: number
  guideColor: string
  showMeasurements: boolean
}>()

const emit = defineEmits<{
  (e: 'update:snapThreshold', value: number): void
  (e: 'update:guideColor', value: string): void
  (e: 'update:showMeasurements', value: boolean): void
}>()

const localSnapThreshold = ref(props.snapThreshold)
const localGuideColor = ref(props.guideColor)
const localShowMeasurements = ref(props.showMeasurements)

// Watch for local changes and emit updates
watch(localSnapThreshold, (value) => {
  emit('update:snapThreshold', value)
})

watch(localGuideColor, (value) => {
  emit('update:guideColor', value)
})

watch(localShowMeasurements, (value) => {
  emit('update:showMeasurements', value)
})

// Predefined guide colors
const guideColors = [
  { label: 'Primary', value: 'var(--color-primary-500)' },
  { label: 'Success', value: 'var(--color-success-500)' },
  { label: 'Warning', value: 'var(--color-warning-500)' },
  { label: 'Danger', value: 'var(--color-danger-500)' },
  { label: 'Info', value: 'var(--color-info-500)' }
]
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- Snap Threshold -->
    <div class="space-y-2">
      <label class="block text-sm font-medium">
        Snap Sensitivity ({{ localSnapThreshold }}px)
      </label>
      <input
        v-model="localSnapThreshold"
        type="range"
        min="1"
        max="20"
        class="w-full"
      />
    </div>

    <!-- Guide Color -->
    <div class="space-y-2">
      <label class="block text-sm font-medium">Guide Color</label>
      <div class="flex gap-2">
        <button
          v-for="color in guideColors"
          :key="color.value"
          class="w-8 h-8 rounded-full border-2"
          :class="{ 'border-primary-500': localGuideColor === color.value }"
          :style="{ backgroundColor: color.value }"
          @click="localGuideColor = color.value"
        />
      </div>
    </div>

    <!-- Show Measurements -->
    <div class="flex items-center gap-2">
      <input
        v-model="localShowMeasurements"
        type="checkbox"
        class="form-checkbox"
      />
      <label class="text-sm font-medium">Show Measurements</label>
    </div>
  </div>
</template>

<style scoped>
.form-checkbox {
  @apply h-4 w-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500;
}
</style>
