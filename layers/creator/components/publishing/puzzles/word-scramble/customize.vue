<template>
  <div class="space-y-6">
    <!-- Basic Settings -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Basic Settings</h3>
      
      <!-- Difficulty -->
      <div class="space-y-2">
        <label class="block text-sm font-medium">Difficulty</label>
        <select 
          v-model="settings.difficulty"
          class="w-full p-2 border rounded-lg"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      <!-- Category -->
      <div class="space-y-2">
        <label class="block text-sm font-medium">Category</label>
        <select 
          v-model="settings.category"
          class="w-full p-2 border rounded-lg"
        >
          <option value="general">General</option>
          <option value="animals">Animals</option>
          <option value="food">Food</option>
          <option value="nature">Nature</option>
          <option value="science">Science</option>
        </select>
      </div>

      <!-- Age Group -->
      <div class="space-y-2">
        <label class="block text-sm font-medium">Age Group</label>
        <select 
          v-model="settings.ageGroup"
          class="w-full p-2 border rounded-lg"
        >
          <option value="all">All Ages</option>
          <option value="kids">Kids (5-12)</option>
          <option value="teens">Teens (13-17)</option>
          <option value="adults">Adults (18+)</option>
        </select>
      </div>

      <!-- Language -->
      <div class="space-y-2">
        <label class="block text-sm font-medium">Language</label>
        <select 
          v-model="settings.language"
          class="w-full p-2 border rounded-lg"
        >
          <option value="english">English</option>
          <option value="spanish">Spanish</option>
          <option value="french">French</option>
          <option value="german">German</option>
        </select>
      </div>
    </div>

    <!-- Visual Settings -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Visual Settings</h3>
      
      <!-- Colors -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium">Text Color</label>
          <input 
            v-model="settings.textColor"
            type="color"
            class="w-full h-10 p-1 border rounded"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium">Background Color</label>
          <input 
            v-model="settings.backgroundColor"
            type="color"
            class="w-full h-10 p-1 border rounded"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium">Accent Color</label>
          <input 
            v-model="settings.accentColor"
            type="color"
            class="w-full h-10 p-1 border rounded"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium">Highlight Color</label>
          <input 
            v-model="settings.highlightColor"
            type="color"
            class="w-full h-10 p-1 border rounded"
          />
        </div>
      </div>

      <!-- Font Size -->
      <div class="space-y-2">
        <label class="block text-sm font-medium">Font Size</label>
        <select 
          v-model="settings.fontSize"
          class="w-full p-2 border rounded-lg"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
    </div>

    <!-- Layout Settings -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Layout Settings</h3>
      
      <!-- Print Layout -->
      <div class="space-y-2">
        <label class="block text-sm font-medium">Print Layout</label>
        <select 
          v-model="settings.printLayout"
          class="w-full p-2 border rounded-lg"
        >
          <option value="compact">Compact</option>
          <option value="spacious">Spacious</option>
        </select>
      </div>

      <!-- Toggle Settings -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium">Show Word Bank</label>
          <button 
            class="relative inline-flex h-6 w-11 items-center rounded-full"
            :class="settings.showWordBank ? 'bg-primary-600' : 'bg-gray-200'"
            @click="settings.showWordBank = !settings.showWordBank"
          >
            <span 
              class="inline-block h-4 w-4 transform rounded-full bg-white transition"
              :class="settings.showWordBank ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>

        <div class="flex items-center justify-between">
          <label class="text-sm font-medium">Show Hints</label>
          <button 
            class="relative inline-flex h-6 w-11 items-center rounded-full"
            :class="settings.showHints ? 'bg-primary-600' : 'bg-gray-200'"
            @click="settings.showHints = !settings.showHints"
          >
            <span 
              class="inline-block h-4 w-4 transform rounded-full bg-white transition"
              :class="settings.showHints ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>

        <div class="flex items-center justify-between">
          <label class="text-sm font-medium">Show Step Numbers</label>
          <button 
            class="relative inline-flex h-6 w-11 items-center rounded-full"
            :class="settings.showStepNumbers ? 'bg-primary-600' : 'bg-gray-200'"
            @click="settings.showStepNumbers = !settings.showStepNumbers"
          >
            <span 
              class="inline-block h-4 w-4 transform rounded-full bg-white transition"
              :class="settings.showStepNumbers ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Preview</h3>
      <div class="border rounded-lg p-4">
        <WordScramblePreview 
          :scrambled-words="puzzle.words"
          :show-answers="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { WordScrambleSettings, WordScramblePuzzle } from './types'
import { generatePuzzle } from './generator'
import WordScramblePreview from './preview.vue'

const settings = ref<WordScrambleSettings>({
  difficulty: 'medium',
  category: 'general',
  ageGroup: 'all',
  language: 'english',
  textColor: '#000000',
  backgroundColor: '#ffffff',
  accentColor: '#4f46e5',
  highlightColor: '#fef3c7',
  fontSize: 'medium',
  printLayout: 'compact',
  showWordBank: true,
  showHints: true,
  showStepNumbers: true
})

const puzzle = ref<WordScramblePuzzle>({
  words: [],
  difficulty: 'medium',
  category: 'general',
  timeEstimate: 0,
  stats: {
    totalWords: 0,
    averageWordLength: 0,
    complexity: 0
  },
  textColor: '#000000',
  backgroundColor: '#ffffff',
  accentColor: '#4f46e5',
  highlightColor: '#fef3c7'
})

watch(settings, async (newSettings) => {
  puzzle.value = await generatePuzzle(newSettings)
}, { deep: true, immediate: true })
</script>
