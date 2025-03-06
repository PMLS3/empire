<template>
  <div class="space-y-4">
    <div class="flex space-x-2">
      <div>
        <BaseInput v-model="size" type="number" min="5" max="20" label="Grid Size" />
      </div>

      <div>
        <BaseSelect v-model="difficulty" label="Difficulty">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </BaseSelect>
      </div>

      <div>
        <BaseInput v-model="textColor" type="color" label="Text Color" />
      </div>

      <div>
        <BaseInput v-model="backgroundColor" type="color" label="Background Color" />
      </div>

      <div>
        <BaseInput v-model="borderColor" type="color" label="Border Color" />
      </div>

      <div>
        <BaseInput v-model="locationsColor" type="color" label="Locations Color" />
      </div>

      <div>
        <BaseInput v-model="theme" type="text" placeholder="animals" label="Theme" />
      </div>
    </div>

    <div>
      <BaseTextarea v-model="wordsInput" rows="3" placeholder="cat,dog,fish" label="Words (comma-separated)" />
    </div>
  </div>
</template>

<script setup lang="ts">

interface CustomizeSettings {
  size: number
  words: string[]
  theme: string
  difficulty: string
  textColor: string
  backgroundColor: string
  borderColor: string
  locationsColor: string
  direction: string
  caseSensitive: boolean
  allowOverlap: boolean
}

const props = withDefaults(defineProps<{
  modelValue: CustomizeSettings
}>(), {
  modelValue: () => ({
    size: 10,
    words: [],
    theme: '',
    difficulty: 'medium',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    locationsColor: '#ff0000',
    direction: 'all',
    caseSensitive: false,
    allowOverlap: false
  })
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: CustomizeSettings): void
}>()

const size = computed({
  get: () => props.modelValue.size,
  set: (value: number) => updateSettings('size', value)
})

const wordsInput = computed({
  get: () => props.modelValue.words.join(', '),
  set: (value: string) => updateSettings('words', value.split(',').map(w => w.trim()).filter(w => w))
})

const theme = computed({
  get: () => props.modelValue.theme,
  set: (value: string) => updateSettings('theme', value)
})

const difficulty = computed({
  get: () => props.modelValue.difficulty,
  set: (value: string) => updateSettings('difficulty', value)
})

const textColor = computed({
  get: () => props.modelValue.textColor,
  set: (value: string) => updateSettings('textColor', value)
})

const backgroundColor = computed({
  get: () => props.modelValue.backgroundColor,
  set: (value: string) => updateSettings('backgroundColor', value)
})

const borderColor = computed({
  get: () => props.modelValue.borderColor,
  set: (value: string) => updateSettings('borderColor', value)
})

const locationsColor = computed({
  get: () => props.modelValue.locationsColor,
  set: (value: string) => updateSettings('locationsColor', value)
})

const { sendContextInfo } = useChatGemini()

// Watch the global word search state
const wordSearch = useState('wordSearch')
console.log('[customize] Initial wordSearch state:', wordSearch.value)

// When the global state changes, update our local state
watch(wordSearch, (newState) => {
  console.log('[customize] wordSearch state changed:', newState)
  if (!newState) return
  
  // Update all settings that exist in the new state
  Object.entries(newState).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      console.log(`[customize] Updating ${key}:`, value)
      updateSettings(key, value)
    }
  })
}, { deep: true })

// Send context when component mounts
onMounted(() => {
  console.log('[customize] Component mounted')
  sendContextInfo(`
Current Component: Word Search Puzzle Customization
Settings:
{
  "size": ${props.modelValue.size},
  "theme": "${props.modelValue.theme}",
  "difficulty": "${props.modelValue.difficulty}",
  "words": ${JSON.stringify(props.modelValue.words)},
  "colors": {
    "text": "${props.modelValue.textColor}",
    "background": "${props.modelValue.backgroundColor}",
    "border": "${props.modelValue.borderColor}",
    "locations": "${props.modelValue.locationsColor}"
  }
}`)
})

// Watch for theme changes to update context
watch(() => props.modelValue.theme, (newTheme) => {
  if (newTheme) {
    console.log('[customize] Theme changed:', newTheme)
    sendContextInfo(`Theme changed to: ${newTheme}. I can help generate themed words or suggest appropriate settings for this theme.`)
  }
})

// Watch for difficulty changes
watch(() => props.modelValue.difficulty, (newDifficulty) => {
  console.log('[customize] Difficulty changed:', newDifficulty)
  sendContextInfo(`Difficulty changed to: ${newDifficulty}. I can suggest appropriate words and grid size for this difficulty level.`)
})

function updateSettings(key: string, value: any) {
  console.log('[customize] Updating settings:', { key, value })
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
  console.log('[customize] New modelValue:', props.modelValue)
}
</script>
