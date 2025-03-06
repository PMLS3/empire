<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Quote or Text</label>
      <textarea
        v-model="text"
        rows="4"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700"
        placeholder="Enter the text to encrypt..."
      ></textarea>
      <div v-if="textError" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ textError }}
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Author (Optional)</label>
      <input
        v-model="author"
        type="text"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700"
        placeholder="Author's name"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Hint (Optional)</label>
      <input
        v-model="hint"
        type="text"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700"
        placeholder="A hint to help solve the puzzle"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Encryption Type</label>
      <select
        v-model="encryptionType"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700"
      >
        <option value="substitution">Simple Substitution</option>
        <option value="caesar">Caesar Shift</option>
        <option value="keyword">Keyword</option>
      </select>
    </div>

    <div v-if="encryptionType === 'caesar'">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Shift Amount</label>
      <input
        v-model.number="shift"
        type="number"
        min="1"
        max="25"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700"
      />
    </div>

    <div v-if="encryptionType === 'keyword'">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Keyword</label>
      <input
        v-model="keyword"
        type="text"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700"
        placeholder="Enter a keyword for encryption"
      />
      <div v-if="keywordError" class="mt-1 text-sm text-red-600 dark:text-red-400">
        {{ keywordError }}
      </div>
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

      <div>
        <label class="block text-sm text-gray-600 dark:text-gray-400">Hint Color</label>
        <input
          v-model="hintColor"
          type="color"
          class="mt-1 block w-full h-8 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const emit = defineEmits<{
  (e: 'update:settings', settings: any): void
}>()

const text = ref('')
const author = ref('')
const hint = ref('')
const encryptionType = ref<'substitution' | 'caesar' | 'keyword'>('substitution')
const shift = ref(3)
const keyword = ref('')
const difficulty = ref<'easy' | 'medium' | 'hard'>('medium')
const textColor = ref('#000000')
const backgroundColor = ref('#ffffff')
const borderColor = ref('#cccccc')
const hintColor = ref('#666666')

const textError = computed(() => {
  if (!text.value) return 'Text is required'
  if (text.value.length < 10) return 'Text must be at least 10 characters long'
  if (!/[A-Za-z]/.test(text.value)) return 'Text must contain letters'
  return null
})

const keywordError = computed(() => {
  if (encryptionType.value === 'keyword') {
    if (!keyword.value) return 'Keyword is required'
    if (!/^[A-Za-z]+$/.test(keyword.value)) return 'Keyword must contain only letters'
    if (keyword.value.length < 3) return 'Keyword must be at least 3 characters long'
  }
  return null
})

watch(
  [
    text,
    author,
    hint,
    encryptionType,
    shift,
    keyword,
    difficulty,
    textColor,
    backgroundColor,
    borderColor,
    hintColor
  ],
  () => {
    if (!textError.value && !keywordError.value) {
      emit('update:settings', {
        text: text.value,
        author: author.value,
        hint: hint.value,
        encryptionType: encryptionType.value,
        shift: shift.value,
        keyword: keyword.value,
        difficulty: difficulty.value,
        textColor: textColor.value,
        backgroundColor: backgroundColor.value,
        borderColor: borderColor.value,
        hintColor: hintColor.value
      })
    }
  },
  { deep: true }
)
</script>
