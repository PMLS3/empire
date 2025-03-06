<template>
  <div class="space-y-6">
    <!-- Puzzle Settings -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Puzzle Settings</h3>
      
      <!-- Difficulty -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Difficulty Level</label>
        <select
          v-model="settings.difficulty"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="easy">Easy - More starting numbers</option>
          <option value="medium">Medium - Balanced challenge</option>
          <option value="hard">Hard - Fewer starting numbers</option>
          <option value="expert">Expert - Minimal starting numbers</option>
        </select>
      </div>

      <!-- Grid Size -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Grid Size</label>
        <select
          v-model="settings.size"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option :value="4">4×4 - For beginners</option>
          <option :value="6">6×6 - Intermediate</option>
          <option :value="9">9×9 - Standard</option>
        </select>
      </div>

      <!-- Grid Style -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Grid Style</label>
        <select
          v-model="settings.gridStyle"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="classic">Classic - Traditional look</option>
          <option value="modern">Modern - Contemporary design</option>
          <option value="minimal">Minimal - Clean and simple</option>
        </select>
      </div>
    </div>

    <!-- Print Settings -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Print Settings</h3>
      
      <!-- Layout -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Layout Style</label>
        <select
          v-model="settings.printLayout"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="compact">Compact - Save space</option>
          <option value="spacious">Spacious - More writing room</option>
        </select>
      </div>

      <!-- Cell Size -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Cell Size</label>
        <select
          v-model="settings.cellSize"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="small">Small - More puzzles per page</option>
          <option value="medium">Medium - Balanced size</option>
          <option value="large">Large - Easy to write in</option>
        </select>
      </div>

      <!-- Font Size -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Font Size</label>
        <select
          v-model="settings.fontSize"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="small">Small - Compact numbers</option>
          <option value="medium">Medium - Standard size</option>
          <option value="large">Large - Easy to read</option>
        </select>
      </div>

      <!-- Additional Features -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <input
            v-model="settings.showGuidelines"
            type="checkbox"
            class="rounded dark:bg-gray-800"
          />
          <label class="text-sm">Show solving guidelines</label>
        </div>
        
        <div class="flex items-center gap-2">
          <input
            v-model="settings.showCandidates"
            type="checkbox"
            class="rounded dark:bg-gray-800"
          />
          <label class="text-sm">Show candidate numbers</label>
        </div>

        <div class="flex items-center gap-2">
          <input
            v-model="settings.highlightRegions"
            type="checkbox"
            class="rounded dark:bg-gray-800"
          />
          <label class="text-sm">Highlight regions</label>
        </div>
      </div>
    </div>

    <!-- Colors -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Colors</h3>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Text Color</label>
          <input
            v-model="settings.textColor"
            type="color"
            class="w-full h-10 rounded-md"
          />
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium">Background Color</label>
          <input
            v-model="settings.backgroundColor"
            type="color"
            class="w-full h-10 rounded-md"
          />
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium">Accent Color</label>
          <input
            v-model="settings.accentColor"
            type="color"
            class="w-full h-10 rounded-md"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Number Color</label>
          <input
            v-model="settings.numberColor"
            type="color"
            class="w-full h-10 rounded-md"
          />
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div 
      class="p-4 rounded-md"
      :style="{
        backgroundColor: settings.backgroundColor,
        borderColor: settings.accentColor,
        borderWidth: '1px',
        color: settings.textColor
      }"
    >
      <h4 class="font-medium mb-2">Preview Settings</h4>
      <div class="text-sm space-y-1">
        <div>Grid Size: {{ settings.size }}×{{ settings.size }}</div>
        <div>Difficulty: {{ settings.difficulty }}</div>
        <div>Layout: {{ settings.printLayout }}</div>
        <div>Cell Size: {{ settings.cellSize }}</div>
        <div>Font Size: {{ settings.fontSize }}</div>
        <div>Style: {{ settings.gridStyle }}</div>
        <div>Features: {{ getEnabledFeatures() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { SudokuSettings } from './generator'

const emit = defineEmits<{
  (e: 'update', settings: SudokuSettings): void
}>()

const settings = reactive<SudokuSettings>({
  difficulty: 'medium',
  size: 9,
  textColor: '#000000',
  backgroundColor: '#ffffff',
  accentColor: '#4CAF50',
  numberColor: '#1976D2',
  fontSize: 'medium',
  printLayout: 'spacious',
  showGuidelines: true,
  showCandidates: true,
  highlightRegions: true,
  cellSize: 'medium',
  gridStyle: 'classic'
})

const getEnabledFeatures = (): string => {
  const features: string[] = []
  if (settings.showGuidelines) features.push('Guidelines')
  if (settings.showCandidates) features.push('Candidates')
  if (settings.highlightRegions) features.push('Regions')
  return features.join(', ') || 'None'
}

// Emit settings changes
watch(settings, (newSettings) => {
  emit('update', { ...newSettings })
}, { deep: true })
</script>
