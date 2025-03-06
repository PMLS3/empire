<template>
  <div class="space-y-6">
    <!-- Riddle Settings -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Riddle Settings</h3>
      
      <!-- Category -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Category</label>
        <select
          v-model="settings.category"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="general">General - Classic Riddles</option>
          <option value="wordplay">Wordplay - Language Puzzles</option>
          <option value="math">Math - Number Riddles</option>
          <option value="logic">Logic - Brain Teasers</option>
        </select>
      </div>

      <!-- Difficulty -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Difficulty Level</label>
        <select
          v-model="settings.difficulty"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="easy">Easy - Simple and straightforward</option>
          <option value="medium">Medium - Moderate complexity</option>
          <option value="hard">Hard - Complex and challenging</option>
        </select>
      </div>

      <!-- Age Group -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Age Group</label>
        <select
          v-model="settings.ageGroup"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="children">Children (7-12)</option>
          <option value="teens">Teens (13-17)</option>
          <option value="adults">Adults (18+)</option>
        </select>
      </div>

      <!-- Language -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Language</label>
        <select
          v-model="settings.language"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
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
          <option value="spacious">Spacious - More room for answers</option>
        </select>
      </div>

      <!-- Font Size -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Font Size</label>
        <select
          v-model="settings.fontSize"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="small">Small - More content per page</option>
          <option value="medium">Medium - Balanced readability</option>
          <option value="large">Large - Easy to read</option>
        </select>
      </div>

      <!-- Max Length -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Maximum Riddle Length</label>
        <input
          v-model.number="settings.maxLength"
          type="number"
          min="50"
          max="500"
          step="10"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        />
        <p class="text-xs opacity-75">Maximum characters for riddle text (0 for unlimited)</p>
      </div>

      <!-- Additional Features -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <input
            v-model="settings.showHints"
            type="checkbox"
            class="rounded dark:bg-gray-800"
          />
          <label class="text-sm">Show hints</label>
        </div>
        
        <div class="flex items-center gap-2">
          <input
            v-model="settings.showWordBank"
            type="checkbox"
            class="rounded dark:bg-gray-800"
          />
          <label class="text-sm">Show word bank (for wordplay riddles)</label>
        </div>
      </div>
    </div>

    <!-- Colors -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Colors</h3>
      
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <div>Category: {{ settings.category }}</div>
        <div>Difficulty: {{ settings.difficulty }}</div>
        <div>Age Group: {{ settings.ageGroup }}</div>
        <div>Language: {{ settings.language }}</div>
        <div>Layout: {{ settings.printLayout }}</div>
        <div>Font Size: {{ settings.fontSize }}</div>
        <div>Max Length: {{ settings.maxLength || 'Unlimited' }}</div>
        <div>Features: {{ getEnabledFeatures() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { RiddleSettings } from './generator'

const emit = defineEmits<{
  (e: 'update', settings: RiddleSettings): void
}>()

const settings = reactive<RiddleSettings>({
  category: 'general',
  difficulty: 'medium',
  language: 'en',
  ageGroup: 'teens',
  textColor: '#000000',
  backgroundColor: '#ffffff',
  accentColor: '#4CAF50',
  fontSize: 'medium',
  printLayout: 'spacious',
  showHints: true,
  showWordBank: true,
  maxLength: 200
})

const getEnabledFeatures = (): string => {
  const features: string[] = []
  if (settings.showHints) features.push('Hints')
  if (settings.showWordBank) features.push('Word Bank')
  return features.join(', ') || 'None'
}

// Emit settings changes
watch(settings, (newSettings) => {
  emit('update', { ...newSettings })
}, { deep: true })
</script>
