#!/bin/bash

# List of puzzles to create
PUZZLES=(
  "code-breaker"
  "geography-quiz"
  "grammar-fix"
  "history-timeline"
  "logic-grid"
  "music-notes"
  "number-sequence"
  "periodic-puzzle"
  "picture-sudoku"
  "science-diagram"
  "spelling-bee"
  "spot-difference"
  "vocabulary-match"
  "word-chains"
  "word-connect"
  "art-puzzle"
  "math-story"
)

# Function to convert kebab-case to PascalCase
to_pascal_case() {
  echo "$1" | sed -E 's/(^|-)([a-z])/\U\2/g'
}

# Create files for each puzzle
for puzzle in "${PUZZLES[@]}"; do
  pascal_name=$(to_pascal_case "$puzzle")
  
  # Create directory if it doesn't exist
  mkdir -p "$puzzle"
  
  # Create types.ts
  cat > "$puzzle/types.ts" << EOL
import { BaseContent } from '../types'

export interface ${pascal_name}Settings {
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  textColor: string
  backgroundColor: string
  accentColor: string
  highlightColor: string
  fontSize: number
  printLayout: 'compact' | 'spacious'
  showHints: boolean
}

export interface ${pascal_name}Puzzle extends BaseContent {
  content: any // TODO: Define specific puzzle content
  difficulty: string
  category?: string
  timeEstimate?: number
}
EOL

  # Create generator.ts
  cat > "$puzzle/generator.ts" << EOL
import type { ${pascal_name}Settings, ${pascal_name}Puzzle } from './types'

export async function generate${pascal_name}(settings: ${pascal_name}Settings): Promise<${pascal_name}Puzzle> {
  // TODO: Implement puzzle generation logic
  return {
    content: {},
    difficulty: settings.difficulty,
    category: settings.category,
    textColor: settings.textColor,
    backgroundColor: settings.backgroundColor,
    accentColor: settings.accentColor,
    highlightColor: settings.highlightColor
  }
}
EOL

  # Create customize.vue
  cat > "$puzzle/customize.vue" << EOL
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
import type { ${pascal_name}Settings } from './types'

const props = defineProps<{
  modelValue: ${pascal_name}Settings
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ${pascal_name}Settings): void
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
EOL

  # Create preview.vue
  cat > "$puzzle/preview.vue" << EOL
<template>
  <div 
    class="puzzle-preview space-y-6"
    :style="{
      color: settings.textColor,
      backgroundColor: settings.backgroundColor
    }"
  >
    <!-- Puzzle Header -->
    <div class="text-center">
      <h3 class="text-xl font-medium mb-2">${pascal_name}</h3>
      <p class="text-sm">TODO: Add puzzle instructions</p>
    </div>

    <!-- Puzzle Content -->
    <div class="space-y-4">
      <!-- TODO: Implement puzzle preview UI -->
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ${pascal_name}Settings, ${pascal_name}Puzzle } from './types'

defineProps<{
  puzzle: ${pascal_name}Puzzle
  settings: ${pascal_name}Settings
}>()
</script>
EOL

  # Create solution.vue
  cat > "$puzzle/solution.vue" << EOL
<template>
  <div 
    class="puzzle-solution space-y-6"
    :style="{
      color: settings.textColor,
      backgroundColor: settings.backgroundColor
    }"
  >
    <!-- Solution Header -->
    <div class="text-center">
      <h3 class="text-xl font-medium mb-2">${pascal_name} - Solution</h3>
    </div>

    <!-- Solution Content -->
    <div class="space-y-4">
      <!-- TODO: Implement solution display UI -->
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ${pascal_name}Settings, ${pascal_name}Puzzle } from './types'

defineProps<{
  puzzle: ${pascal_name}Puzzle
  settings: ${pascal_name}Settings
}>()
</script>
EOL

done

echo "Created puzzle files for all puzzle types"
