<template>
  <div class="space-y-6">
    <!-- Basic Settings -->
    <div class="space-y-4">
      <h3>Basic Settings</h3>
      <BaseSelect
        v-model="settings.difficulty"
        :options="difficultyOptions"
        label="Difficulty"
      />
      <BaseSelect
        v-model="settings.category"
        :options="categoryOptions"
        label="Category"
      />
    </div>

    <!-- Visual Settings -->
    <div class="space-y-4">
      <h3>Visual Settings</h3>
      <BaseColorPicker
        v-model="settings.textColor"
        label="Text Color"
      />
      <BaseColorPicker
        v-model="settings.backgroundColor"
        label="Background Color"
      />
      <BaseColorPicker
        v-model="settings.accentColor"
        label="Accent Color"
      />
      <BaseColorPicker
        v-model="settings.highlightColor"
        label="Highlight Color"
      />
      <BaseSelect
        v-model="settings.fontSize"
        :options="fontSizeOptions"
        label="Font Size"
      />
      <BaseSelect
        v-model="settings.printLayout"
        :options="layoutOptions"
        label="Print Layout"
      />
    </div>

    <!-- Additional Options -->
    <div class="space-y-4">
      <h3>Additional Options</h3>
      <BaseSwitch
        v-model="settings.showHints"
        label="Show Hints"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UmusicUnotesSettings } from './types'

const props = defineProps<{
  modelValue: UmusicUnotesSettings
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: UmusicUnotesSettings): void
}>()

const settings = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const difficultyOptions = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' }
]

const categoryOptions = [
  { label: 'General', value: 'general' },
  { label: 'Animals', value: 'animals' },
  { label: 'Food', value: 'food' },
  { label: 'Nature', value: 'nature' },
  { label: 'Science', value: 'science' }
]

const fontSizeOptions = [
  { label: 'Small', value: 12 },
  { label: 'Medium', value: 16 },
  { label: 'Large', value: 20 }
]

const layoutOptions = [
  { label: 'Compact', value: 'compact' },
  { label: 'Spacious', value: 'spacious' }
]
</script>
