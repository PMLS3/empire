<script lang="ts" setup>
interface Template {
  id: string
  title: string
  description: string
  category: string
  previewImage: string
  pages: any[]
  settings: {
    size: {
      width: number
      length: number
    }
    theme: {
      colors: string[]
      fonts: string[]
    }
  }
}

const props = defineProps<{
  template: Template
}>()

const emit = defineEmits(['save', 'cancel'])

const customizedTemplate = ref({
  ...props.template,
  settings: JSON.parse(JSON.stringify(props.template.settings))
})

const bookSizes = [
  { label: '5.5" × 8.5" (Poetry)', width: 5.5, length: 8.5 },
  { label: '6" × 9" (Novel)', width: 6, length: 9 },
  { label: '6.625" × 10.25" (Comic)', width: 6.625, length: 10.25 },
  { label: '7" × 10" (Textbook)', width: 7, length: 10 },
  { label: '8.5" × 8.5" (Square)', width: 8.5, length: 8.5 },
  { label: '8.5" × 11" (Letter)', width: 8.5, length: 11 },
  { label: '12" × 12" (Portfolio)', width: 12, length: 12 }
]

const fonts = [
  { label: 'Arial', value: 'Arial', category: 'Sans Serif' },
  { label: 'Helvetica', value: 'Helvetica', category: 'Sans Serif' },
  { label: 'Roboto', value: 'Roboto', category: 'Sans Serif' },
  { label: 'Open Sans', value: 'Open Sans', category: 'Sans Serif' },
  { label: 'Montserrat', value: 'Montserrat', category: 'Sans Serif' },
  { label: 'Times New Roman', value: 'Times New Roman', category: 'Serif' },
  { label: 'Georgia', value: 'Georgia', category: 'Serif' },
  { label: 'Garamond', value: 'Garamond', category: 'Serif' },
  { label: 'Baskerville', value: 'Baskerville', category: 'Serif' },
  { label: 'Merriweather', value: 'Merriweather', category: 'Serif' },
  { label: 'Comic Sans MS', value: 'Comic Sans MS', category: 'Display' },
  { label: 'Comic Neue', value: 'Comic Neue', category: 'Display' },
  { label: 'Bangers', value: 'Bangers', category: 'Display' },
  { label: 'Futura', value: 'Futura', category: 'Modern' }
]

const colorSchemes = [
  { name: 'Classic', colors: ['#000000', '#333333'] },
  { name: 'Ocean', colors: ['#2980B9', '#3498DB'] },
  { name: 'Forest', colors: ['#27AE60', '#2ECC71'] },
  { name: 'Sunset', colors: ['#E67E22', '#F39C12'] },
  { name: 'Berry', colors: ['#8E44AD', '#9B59B6'] },
  { name: 'Minimal', colors: ['#FFFFFF', '#ECF0F1'] },
  { name: 'Vibrant', colors: ['#E74C3C', '#F1C40F'] },
  { name: 'Elegant', colors: ['#2C3E50', '#BDC3C7'] }
]

const selectedColorScheme = ref(colorSchemes[0])

const updateColorScheme = (scheme: typeof colorSchemes[0]) => {
  selectedColorScheme.value = scheme
  customizedTemplate.value.settings.theme.colors = [...scheme.colors]
}

const paperTypes = [
  { label: 'Standard White', value: 'standard' },
  { label: 'Premium Matte', value: 'matte' },
  { label: 'Glossy Photo', value: 'glossy' },
  { label: 'Recycled', value: 'recycled' },
  { label: 'Textured', value: 'textured' }
]

const selectedPaperType = ref(paperTypes[0])

const selectedSize = computed({
  get: () => {
    const { width, length } = customizedTemplate.value.settings.size
    return bookSizes.find(size => size.width === width && size.length === length) || bookSizes[0]
  },
  set: (size) => {
    customizedTemplate.value.settings.size = {
      width: size.width,
      length: size.length
    }
  }
})

const saveCustomization = () => {
  emit('save', customizedTemplate.value)
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Customize Template</h2>
      <BaseButtonGroup>
        <BaseButton
          color="gray"
          variant="ghost"
          @click="emit('cancel')"
        >
          Cancel
        </BaseButton>
        <BaseButton
          color="primary"
          @click="saveCustomization"
        >
          Use Template
        </BaseButton>
      </BaseButtonGroup>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Preview -->
      <div class="flex flex-col gap-4">
        <h3 class="font-medium text-gray-700 dark:text-gray-300">Preview</h3>
        <div class="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          <img
            v-if="template.previewImage"
            :src="template.previewImage"
            :alt="template.title"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-gray-400"
          >
            <Icon name="ph:book-open" class="h-12 w-12" />
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div class="flex flex-col gap-6">
        <div>
          <h3 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Book Size</h3>
          <FormSelect
            v-model="selectedSize"
            :options="bookSizes"
          />
          <p class="mt-2 text-sm text-gray-500">
            Choose a size that best fits your content
          </p>
        </div>

        <div>
          <h3 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Paper Type</h3>
          <FormSelect
            v-model="selectedPaperType"
            :options="paperTypes"
          />
          <p class="mt-2 text-sm text-gray-500">
            Select paper quality and finish
          </p>
        </div>

        <div>
          <h3 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Color Scheme</h3>
          <div class="grid grid-cols-2 gap-4">
            <BaseCard
              v-for="scheme in colorSchemes"
              :key="scheme.name"
              class="cursor-pointer"
              :class="{ 'ring-2 ring-primary-500': selectedColorScheme.name === scheme.name }"
              @click="updateColorScheme(scheme)"
            >
              <div class="flex items-center gap-2 p-2">
                <div class="flex gap-2">
                  <div
                    v-for="color in scheme.colors"
                    :key="color"
                    class="w-6 h-6 rounded-full"
                    :style="{ backgroundColor: color }"
                  />
                </div>
                <span class="text-sm">{{ scheme.name }}</span>
              </div>
            </BaseCard>
          </div>
        </div>

        <div>
          <h3 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Fonts</h3>
          <div class="space-y-4">
            <div>
              <label class="text-sm text-gray-600 dark:text-gray-400">Primary Font</label>
              <FormSelect
                v-model="customizedTemplate.settings.theme.fonts[0]"
                :options="fonts"
                option-group-key="category"
              />
            </div>
            <div>
              <label class="text-sm text-gray-600 dark:text-gray-400">Secondary Font</label>
              <FormSelect
                v-model="customizedTemplate.settings.theme.fonts[1]"
                :options="fonts"
                option-group-key="category"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
