<template>
  <div class="space-y-6">
    <!-- Pairs Input -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Matching Pairs</h3>
      
      <div 
        v-for="(pair, index) in pairs" 
        :key="index"
        class="flex gap-4 items-center"
      >
        <div class="flex-1">
          <input
            v-model="pair.first"
            type="text"
            class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
            :placeholder="'First Item ' + (index + 1)"
            @input="validatePairs"
          />
        </div>
        
        <div class="flex-none">↔</div>
        
        <div class="flex-1">
          <input
            v-model="pair.second"
            type="text"
            class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
            :placeholder="'Second Item ' + (index + 1)"
            @input="validatePairs"
          />
        </div>
        
        <button
          @click="removePair(index)"
          class="p-2 text-red-500 hover:text-red-600"
          :disabled="pairs.length <= 2"
        >
          <span class="i-heroicons-trash-20-solid" />
        </button>
      </div>

      <button
        @click="addPair"
        class="px-4 py-2 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600"
        :disabled="pairs.length >= 12"
      >
        Add Pair
      </button>

      <div v-if="error" class="text-sm text-red-500">
        {{ error }}
      </div>
    </div>

    <!-- Print Settings -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Print Settings</h3>
      
      <!-- Layout Style -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Layout</label>
        <select
          v-model="settings.printLayout"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="sideBySide">Side by Side</option>
          <option value="separated">Separated</option>
        </select>
      </div>

      <!-- Identifier Style -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Identifier Style</label>
        <select
          v-model="settings.style"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="numbered">Numbers (1, 2, 3...)</option>
          <option value="lettered">Letters (A, B, C...)</option>
          <option value="symbols">Symbols (★, ■, ●...)</option>
        </select>
      </div>

      <!-- Font Size -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Font Size</label>
        <select
          v-model="settings.fontSize"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <!-- Show Answer Lines -->
      <div class="flex items-center gap-2">
        <input
          v-model="settings.showLines"
          type="checkbox"
          class="rounded dark:bg-gray-800"
        />
        <label class="text-sm">Show answer lines</label>
      </div>
    </div>

    <!-- Difficulty -->
    <div class="space-y-2">
      <label class="text-sm font-medium">Difficulty</label>
      <select
        v-model="settings.difficulty"
        class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
      >
        <option value="easy">Easy (pairs are closer together)</option>
        <option value="medium">Medium (standard shuffle)</option>
        <option value="hard">Hard (maximum separation)</option>
      </select>
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
          <label class="text-sm font-medium">Border Color</label>
          <input
            v-model="settings.borderColor"
            type="color"
            class="w-full h-10 rounded-md"
          />
        </div>
      </div>
    </div>

    <!-- Metadata -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Metadata</h3>
      
      <div class="space-y-2">
        <label class="text-sm font-medium">Theme</label>
        <input
          v-model="theme"
          type="text"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
          placeholder="e.g., Animals, Countries, etc."
        />
      </div>
      
      <div class="space-y-2">
        <label class="text-sm font-medium">Category</label>
        <input
          v-model="category"
          type="text"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
          placeholder="e.g., Vocabulary, Science, etc."
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

interface MatchingPair {
  first: string
  second: string
}

interface MatchingPairsSettings {
  style: 'numbered' | 'lettered' | 'symbols'
  textColor: string
  backgroundColor: string
  borderColor: string
  fontSize: 'small' | 'medium' | 'large'
  printLayout: 'sideBySide' | 'separated'
  showLines: boolean
  difficulty: 'easy' | 'medium' | 'hard'
}

const emit = defineEmits<{
  (e: 'update', value: {
    pairs: MatchingPair[]
    theme: string
    category: string
    settings: MatchingPairsSettings
  }): void
}>()

const pairs = ref<MatchingPair[]>([
  { first: '', second: '' },
  { first: '', second: '' }
])

const settings = reactive<MatchingPairsSettings>({
  style: 'numbered',
  textColor: '#000000',
  backgroundColor: '#ffffff',
  borderColor: '#cccccc',
  fontSize: 'medium',
  printLayout: 'sideBySide',
  showLines: true,
  difficulty: 'medium'
})

const theme = ref('')
const category = ref('')
const error = ref('')

const addPair = () => {
  if (pairs.value.length < 12) {
    pairs.value.push({ first: '', second: '' })
  }
}

const removePair = (index: number) => {
  if (pairs.value.length > 2) {
    pairs.value.splice(index, 1)
  }
}

const validatePairs = () => {
  error.value = ''
  
  // Check for empty fields
  if (pairs.value.some(pair => !pair.first.trim() || !pair.second.trim())) {
    error.value = 'All fields must be filled'
    return false
  }

  // Check for duplicates
  const firsts = pairs.value.map(p => p.first.trim())
  const seconds = pairs.value.map(p => p.second.trim())
  
  if (new Set(firsts).size !== firsts.length) {
    error.value = 'Duplicate items in first column'
    return false
  }
  
  if (new Set(seconds).size !== seconds.length) {
    error.value = 'Duplicate items in second column'
    return false
  }

  return true
}

watch([pairs, settings, theme, category], () => {
  if (validatePairs()) {
    emit('update', {
      pairs: pairs.value,
      theme: theme.value,
      category: category.value,
      settings
    })
  }
}, { deep: true })
</script>
