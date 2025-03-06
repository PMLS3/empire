<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Grid Size</label>
      <input
        v-model="size"
        type="number"
        min="5"
        max="20"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Words and Clues</label>
      <div class="mt-1 space-y-2">
        <div v-for="(entry, index) in entries" :key="index" class="flex gap-2">
          <input
            v-model="entry.word"
            type="text"
            placeholder="Word"
            class="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700"
          />
          <input
            v-model="entry.clue"
            type="text"
            placeholder="Clue"
            class="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700"
          />
          <button
            @click="removeEntry(index)"
            class="px-2 py-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Remove
          </button>
          <div v-if="entry.error" class="text-red-600 dark:text-red-400">{{ entry.error }}</div>
        </div>
      </div>
      <button
        @click="addEntry"
        class="mt-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
      >
        + Add Word and Clue
      </button>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
      <input
        v-model="theme"
        type="text"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label>
      <select
        v-model="difficulty"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700"
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
    </div>

    <div class="space-y-4">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Colors</h3>
      
      <div>
        <label class="block text-sm text-gray-600 dark:text-gray-400">Text Color</label>
        <input
          v-model="textColor"
          type="color"
          class="mt-1 block w-full h-8 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label class="block text-sm text-gray-600 dark:text-gray-400">Background Color</label>
        <input
          v-model="backgroundColor"
          type="color"
          class="mt-1 block w-full h-8 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label class="block text-sm text-gray-600 dark:text-gray-400">Border Color</label>
        <input
          v-model="borderColor"
          type="color"
          class="mt-1 block w-full h-8 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update:settings', value: any): void
}>()

interface Entry {
  word: string
  clue: string
  error?: string
}

const size = ref(15)
const entries = ref<Entry[]>([{ word: '', clue: '' }])
const theme = ref('')
const difficulty = ref('medium')
const textColor = ref('#000000')
const backgroundColor = ref('#ffffff')
const borderColor = ref('#cccccc')

const validateWord = (word: string): string | null => {
  if (!word) return 'Word is required'
  if (!/^[a-zA-Z]+$/.test(word)) return 'Only letters are allowed'
  if (word.length < 2) return 'Word must be at least 2 letters'
  if (word.length > size.value) return `Word cannot be longer than ${size.value} letters`
  return null
}

const addEntry = () => {
  entries.value.push({ word: '', clue: '' })
}

const removeEntry = (index: number) => {
  if (entries.value.length > 1) {
    entries.value.splice(index, 1)
  }
}

watch([size, entries, theme, difficulty, textColor, backgroundColor, borderColor], () => {
  // Validate words
  entries.value.forEach(entry => {
    entry.error = validateWord(entry.word)
  })

  // Only emit valid entries
  const validEntries = entries.value.filter(e => e.word && e.clue && !e.error)
  
  emit('update:settings', {
    size: size.value,
    entries: validEntries,
    theme: theme.value,
    difficulty: difficulty.value,
    textColor: textColor.value,
    backgroundColor: backgroundColor.value,
    borderColor: borderColor.value
  })
}, { deep: true })
</script>
