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
          <option value="easy">Easy - Shorter word chains</option>
          <option value="medium">Medium - Balanced challenge</option>
          <option value="hard">Hard - Longer word chains</option>
          <option value="expert">Expert - Complex word transformations</option>
        </select>
      </div>

      <!-- Word Length -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Word Length</label>
        <select
          v-model="settings.wordLength"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option :value="3">3 Letters - Simple words</option>
          <option :value="4">4 Letters - Standard words</option>
          <option :value="5">5 Letters - Challenging words</option>
          <option :value="6">6 Letters - Complex words</option>
        </select>
      </div>

      <!-- Category -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Word Category</label>
        <select
          v-model="settings.category"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="general">General - All words</option>
          <option value="animals">Animals - Pet and wildlife words</option>
          <option value="food">Food - Cooking and eating words</option>
          <option value="nature">Nature - Outdoor and environment words</option>
          <option value="science">Science - Scientific terms</option>
        </select>
      </div>

      <!-- Age Group -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Age Group</label>
        <select
          v-model="settings.ageGroup"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="children">Children - Simple vocabulary</option>
          <option value="teens">Teens - Moderate vocabulary</option>
          <option value="adults">Adults - Advanced vocabulary</option>
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
          <option value="spacious">Spacious - More writing room</option>
        </select>
      </div>

      <!-- Font Size -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Font Size</label>
        <select
          v-model="settings.fontSize"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="small">Small - Compact text</option>
          <option value="medium">Medium - Standard size</option>
          <option value="large">Large - Easy to read</option>
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

      <!-- Additional Features -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <input
            v-model="settings.showWordBank"
            type="checkbox"
            class="rounded dark:bg-gray-800"
          />
          <label class="text-sm">Show word bank</label>
        </div>
        
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
            v-model="settings.showStepNumbers"
            type="checkbox"
            class="rounded dark:bg-gray-800"
          />
          <label class="text-sm">Show step numbers</label>
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
          <label class="text-sm font-medium">Highlight Color</label>
          <input
            v-model="settings.highlightColor"
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
        <div>Difficulty: {{ settings.difficulty }}</div>
        <div>Word Length: {{ settings.wordLength }} letters</div>
        <div>Category: {{ settings.category }}</div>
        <div>Age Group: {{ settings.ageGroup }}</div>
        <div>Language: {{ settings.language }}</div>
        <div>Layout: {{ settings.printLayout }}</div>
        <div>Font Size: {{ settings.fontSize }}</div>
        <div>Style: {{ settings.gridStyle }}</div>
        <div>Features: {{ getEnabledFeatures() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { WordLadderSettings } from './generator'

const emit = defineEmits<{
  (e: 'update', settings: WordLadderSettings): void
}>()

const settings = reactive<WordLadderSettings>({
  difficulty: 'medium',
  wordLength: 4,
  maxSteps: 6,
  category: 'general',
  ageGroup: 'teens',
  language: 'en',
  textColor: '#000000',
  backgroundColor: '#ffffff',
  accentColor: '#4CAF50',
  highlightColor: '#FFC107',
  fontSize: 'medium',
  printLayout: 'spacious',
  showWordBank: true,
  showHints: true,
  showStepNumbers: true,
  gridStyle: 'classic'
})

const getEnabledFeatures = (): string => {
  const features: string[] = []
  if (settings.showWordBank) features.push('Word Bank')
  if (settings.showHints) features.push('Hints')
  if (settings.showStepNumbers) features.push('Step Numbers')
  return features.join(', ') || 'None'
}

// Emit settings changes
watch(settings, (newSettings) => {
  emit('update', { ...newSettings })
}, { deep: true })
</script>
