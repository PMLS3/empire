<script setup lang="ts">

const { textState } = useTextTools()
const { selectedElement, updateElementStyle } = useEditor()
const { fonts, isLoading, loadGoogleFonts, loadFont, toggleFavorite, isFavorite, favoriteFonts } = useFonts()

const searchQuery = ref('')
const selectedCategory = ref('all')
const showFavoritesOnly = ref(false)

// Font categories
const categories = [
  { id: 'all', label: 'All Fonts' },
  { id: 'sans-serif', label: 'Sans Serif' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display' },
  { id: 'handwriting', label: 'Handwriting' },
  { id: 'monospace', label: 'Monospace' }
]

// Filtered fonts based on search and category
const filteredFonts = computed(() => {
  let filtered = fonts.value

  // Filter favorites
  if (showFavoritesOnly.value) {
    filtered = filtered.filter(font => isFavorite(font.family))
  }

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(font => font.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(font =>
      font.family.toLowerCase().includes(query)
    )
  }

  return filtered
})

const alignmentOptions = [
  { id: 'left', icon: 'ph:text-align-left' },
  { id: 'center', icon: 'ph:text-align-center' },
  { id: 'right', icon: 'ph:text-align-right' }
]

// Load fonts when component mounts
onMounted(() => {
  loadGoogleFonts()
})

// Watch for changes in text properties and update selected element
watch(textState, (newState) => {
  if (selectedElement.value?.type === 'text' && selectedElement.value.text) {
    selectedElement.value.text = {
      ...selectedElement.value.text,
      ...newState
    }
  }
}, { deep: true })

// Update text panel when selecting a text element
watch(selectedElement, (newElement) => {
  if (newElement?.type === 'text' && newElement.text) {
    textState.value = {
      ...textState.value,
      ...newElement.text
    }
  }
})

// Handle font selection with lazy loading
const handleFontSelect = async (fontFamily: string) => {
  await loadFont(fontFamily)
  textState.font = fontFamily
}

// Add wrappable elements computed property
const wrappableElements = computed(() =>
  editorState.value.elements.filter(el =>
    el.id !== selectedElement.value?.id &&
    ['shape', 'image', 'puzzle'].includes(el.type)
  )
)

// Toggle element exclusion
const toggleExcludeElement = (elementId: string) => {
  const index = textState.value.wrapping.excludeElements.indexOf(elementId)
  if (index === -1) {
    textState.value.wrapping.excludeElements.push(elementId)
  } else {
    textState.value.wrapping.excludeElements.splice(index, 1)
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <!-- Rich Text Toggle -->
    <div class="flex items-center justify-between">
      <label class="text-xs text-gray-400">Rich Text Editing</label>
      <BaseButtonIcon
        class="p-1.5 rounded hover:bg-gray-700"
        :class="{ 'bg-gray-700': textState.richText.enabled }"
        @click="textState.richText.enabled = !textState.richText.enabled"
      >
        <Icon name="ph:text-t-bold" class="w-4 h-4 text-white" />
      </BaseButtonIcon>
    </div>

    <!-- Rich Text Editor -->
    <PublishingBookToolsTextRich v-if="textState.richText.enabled" />

    <!-- Templates Panel -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">Text Templates</label>
      <PublishingBookToolsTextTemplates />
    </div>

    <!-- Font Search -->
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <Icon name="ph:magnifying-glass" class="w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search fonts..."
          class="w-full bg-gray-700 rounded p-2 text-white text-sm"
        />
      </div>
    </div>

    <!-- Favorites Toggle -->
    <div class="flex items-center gap-2">
      <button
        class="px-3 py-1 rounded text-sm"
        :class="{
          'bg-gray-700 text-white': showFavoritesOnly,
          'bg-gray-800 text-gray-400 hover:bg-gray-700': !showFavoritesOnly
        }"
        @click="showFavoritesOnly = !showFavoritesOnly"
      >
        <div class="flex items-center gap-1">
          <Icon
            :name="showFavoritesOnly ? 'ph:star-fill' : 'ph:star'"
            class="w-4 h-4"
          />
          <span>{{ showFavoritesOnly ? 'All Fonts' : 'Favorites' }}</span>
        </div>
      </button>
      <span class="text-xs text-gray-400" v-if="favoriteFonts.length">
        {{ favoriteFonts.length }} favorite{{ favoriteFonts.length === 1 ? '' : 's' }}
      </span>
    </div>

    <!-- Font Categories -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">Categories</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in categories"
          :key="category.id"
          class="px-3 py-1 rounded text-sm"
          :class="{
            'bg-gray-700 text-white': selectedCategory === category.id,
            'bg-gray-800 text-gray-400 hover:bg-gray-700': selectedCategory !== category.id
          }"
          @click="selectedCategory = category.id"
        >
          {{ category.label }}
        </button>
      </div>
    </div>

    <!-- Font Family -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">Font</label>
      <div class="max-h-60 overflow-y-auto rounded bg-gray-700">
        <div
          v-for="font in filteredFonts"
          :key="font.family"
          class="p-2 cursor-pointer hover:bg-gray-600 transition-colors"
          :class="{ 'bg-gray-600': textState.font === font.family }"
          :style="{ fontFamily: font.family }"
          @click="handleFontSelect(font.family)"
        >
          <div class="flex items-center justify-between">
            <span>{{ font.family }}</span>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400">{{ font.category }}</span>
              <button
                class="p-1 rounded hover:bg-gray-500"
                @click.stop="toggleFavorite(font.family)"
              >
                <Icon
                  :name="isFavorite(font.family) ? 'ph:star-fill' : 'ph:star'"
                  class="w-4 h-4"
                  :class="isFavorite(font.family) ? 'text-yellow-400' : 'text-gray-400'"
                />
              </button>
            </div>
          </div>
          <div class="mt-1 text-sm opacity-60">
            The quick brown fox jumps over the lazy dog
          </div>
        </div>
      </div>
    </div>

    <!-- Current Font Preview -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">Current Font Preview</label>
      <div
        class="p-3 bg-gray-700 rounded text-white"
        :style="{
          fontFamily: textState.font,
          fontSize: `${textState.size}px`,
          fontWeight: textState.bold ? 'bold' : 'normal',
          fontStyle: textState.italic ? 'italic' : 'normal',
          textDecoration: textState.underline ? 'underline' : 'none',
          lineHeight: textState.lineHeight,
          letterSpacing: `${textState.letterSpacing}px`,
          opacity: textState.opacity
        }"
      >
        <div>{{ textState.font }}</div>
        <div class="mt-1">The quick brown fox jumps over the lazy dog</div>
        <div class="mt-1">1234567890</div>
      </div>
    </div>

    <!-- Font Size -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">Size</label>
      <input
        v-model="textState.size"
        type="number"
        min="8"
        max="72"
        class="w-full bg-gray-700 rounded"
      />
    </div>

    <!-- Text Color -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">Color</label>
      <input
        v-model="textState.color"
        type="color"
        class="w-full h-8 rounded bg-gray-700"
      />
    </div>

    <!-- Text Alignment -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">Alignment</label>
      <div class="flex gap-2">
        <button
          v-for="option in alignmentOptions"
          :key="option.id"
          class="p-2 rounded hover:bg-gray-700"
          :class="{ 'bg-gray-700': textState.alignment === option.id }"
          @click="textState.alignment = option.id"
        >
          <Icon :name="option.icon" class="w-5 h-5 text-white" />
        </button>
      </div>
    </div>

    <!-- Text Style -->
    <div class="flex gap-2">
      <button
        class="p-2 rounded hover:bg-gray-700"
        :class="{ 'bg-gray-700': textState.bold }"
        @click="textState.bold = !textState.bold"
      >
        <Icon name="ph:text-b-bold" class="w-5 h-5 text-white" />
      </button>
      <button
        class="p-2 rounded hover:bg-gray-700"
        :class="{ 'bg-gray-700': textState.italic }"
        @click="textState.italic = !textState.italic"
      >
        <Icon name="ph:text-italic-bold" class="w-5 h-5 text-white" />
      </button>
      <button
        class="p-2 rounded hover:bg-gray-700"
        :class="{ 'bg-gray-700': textState.underline }"
        @click="textState.underline = !textState.underline"
      >
        <Icon name="ph:text-underline-bold" class="w-5 h-5 text-white" />
      </button>
    </div>

    <!-- Line Height -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">Line Height</label>
      <input
        v-model="textState.lineHeight"
        type="range"
        min="1"
        max="3"
        step="0.1"
        class="w-full"
      />
    </div>

    <!-- Letter Spacing -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">Letter Spacing</label>
      <input
        v-model="textState.letterSpacing"
        type="range"
        min="-2"
        max="10"
        step="0.5"
        class="w-full"
      />
    </div>

    <!-- Opacity -->
    <div class="space-y-2">
      <label class="text-xs text-gray-400">Opacity</label>
      <input
        v-model="textState.opacity"
        type="range"
        min="0"
        max="1"
        step="0.1"
        class="w-full"
      />
    </div>

    <!-- Text Wrapping -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <label class="text-xs text-gray-400">Text Wrapping</label>
        <BaseButtonIcon
          class="p-1.5 rounded hover:bg-gray-700"
          :class="{ 'bg-gray-700': textState.wrapping.enabled }"
          @click="textState.wrapping.enabled = !textState.wrapping.enabled"
        >
          <Icon name="ph:text-columns" class="w-4 h-4 text-white" />
        </BaseButtonIcon>
      </div>

      <template v-if="textState.wrapping.enabled">
        <!-- Wrapping Mode -->
        <div class="space-y-2">
          <label class="text-xs text-gray-400">Wrapping Mode</label>
          <div class="flex gap-2">
            <button
              v-for="mode in ['none', 'around', 'through']"
              :key="mode"
              class="px-3 py-1 rounded text-sm"
              :class="{
                'bg-gray-700 text-white': textState.wrapping.mode === mode,
                'bg-gray-800 text-gray-400 hover:bg-gray-700': textState.wrapping.mode !== mode
              }"
              @click="textState.wrapping.mode = mode"
            >
              {{ mode.charAt(0).toUpperCase() + mode.slice(1) }}
            </button>
          </div>
        </div>

        <!-- Wrapping Margin -->
        <div class="space-y-2">
          <label class="text-xs text-gray-400">Wrapping Margin</label>
          <input
            v-model.number="textState.wrapping.margin"
            type="range"
            min="0"
            max="50"
            step="1"
            class="w-full"
          />
        </div>

        <!-- Exclude Elements -->
        <div class="space-y-2">
          <label class="text-xs text-gray-400">Exclude Elements</label>
          <div class="max-h-32 overflow-y-auto bg-gray-700 rounded p-2">
            <div
              v-for="element in wrappableElements"
              :key="element.id"
              class="flex items-center gap-2 py-1"
            >
              <input
                type="checkbox"
                :checked="!textState.wrapping.excludeElements.includes(element.id)"
                @change="toggleExcludeElement(element.id)"
              />
              <span class="text-sm text-white">{{ element.type }} {{ element.id }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.max-h-60 {
  max-height: 15rem;
}

/* Custom scrollbar */
.max-h-60::-webkit-scrollbar {
  width: 8px;
}

.max-h-60::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 4px;
}

.max-h-60::-webkit-scrollbar-thumb {
  background: #4B5563;
  border-radius: 4px;
}

.max-h-60::-webkit-scrollbar-thumb:hover {
  background: #6B7280;
}
</style>
