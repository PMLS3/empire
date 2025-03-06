<template>
  <div class="space-y-6">
    <!-- Maze Settings -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Maze Settings</h3>
      
      <!-- Size -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Width</label>
          <select
            v-model="settings.width"
            class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
          >
            <option v-for="size in [8, 10, 12, 15, 20]" :key="size" :value="size">
              {{ size }} cells
            </option>
          </select>
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium">Height</label>
          <select
            v-model="settings.height"
            class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
          >
            <option v-for="size in [8, 10, 12, 15, 20]" :key="size" :value="size">
              {{ size }} cells
            </option>
          </select>
        </div>
      </div>

      <!-- Difficulty -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Difficulty Level</label>
        <select
          v-model="settings.difficulty"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="easy">Easy - Simple paths, obvious solution</option>
          <option value="medium">Medium - Multiple paths, moderate complexity</option>
          <option value="hard">Hard - Complex paths, challenging solution</option>
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
          <option value="spacious">Spacious - More room for solving</option>
        </select>
      </div>

      <!-- Cell Size -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Cell Size</label>
        <select
          v-model="settings.cellSize"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="small">Small - More cells per page</option>
          <option value="medium">Medium - Balanced size</option>
          <option value="large">Large - Easy to follow</option>
        </select>
      </div>

      <!-- Wall Thickness -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Wall Thickness</label>
        <select
          v-model="settings.wallThickness"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="thin">Thin - Delicate lines</option>
          <option value="medium">Medium - Standard thickness</option>
          <option value="thick">Thick - Bold walls</option>
        </select>
      </div>

      <!-- Show Solution -->
      <div class="flex items-center gap-2">
        <input
          v-model="settings.showSolution"
          type="checkbox"
          class="rounded dark:bg-gray-800"
        />
        <label class="text-sm">Show solution path</label>
      </div>
    </div>

    <!-- Colors -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Colors</h3>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Wall Color</label>
          <input
            v-model="settings.wallColor"
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
          <label class="text-sm font-medium">Path Color</label>
          <input
            v-model="settings.pathColor"
            type="color"
            class="w-full h-10 rounded-md"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Start/End Color</label>
          <input
            v-model="settings.startColor"
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
        borderColor: settings.wallColor,
        borderWidth: '1px',
        color: settings.wallColor
      }"
    >
      <h4 class="font-medium mb-2">Preview Settings</h4>
      <div class="text-sm space-y-1">
        <div>Size: {{ settings.width }}×{{ settings.height }} cells</div>
        <div>Difficulty: {{ settings.difficulty }}</div>
        <div>Layout: {{ settings.printLayout }}</div>
        <div>Cell Size: {{ settings.cellSize }}</div>
        <div>Wall Thickness: {{ settings.wallThickness }}</div>
        <div>Solution: {{ settings.showSolution ? 'Shown' : 'Hidden' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { MazeSettings } from './generator'

const emit = defineEmits<{
  (e: 'update', settings: MazeSettings): void
}>()

const settings = reactive<MazeSettings>({
  width: 12,
  height: 12,
  difficulty: 'medium',
  wallThickness: 'medium',
  wallColor: '#000000',
  backgroundColor: '#ffffff',
  pathColor: '#4CAF50',
  startColor: '#2196F3',
  endColor: '#F44336',
  showSolution: false,
  printLayout: 'spacious',
  cellSize: 'medium'
})

// Emit settings changes
watch(settings, (newSettings) => {
  emit('update', { ...newSettings })
}, { deep: true })
</script>
