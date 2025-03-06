<script setup lang="ts">
import type { Template } from '../../../types/editor'

const props = defineProps<{
  template: Template
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'apply', template: Template): void
}>()

// Deep clone the template to avoid modifying the original
const customizedTemplate = ref<Template>(JSON.parse(JSON.stringify(props.template)))

// Common settings
const margins = computed(() => customizedTemplate.value.settings.margins || { top: 0, right: 0, bottom: 0, left: 0 })
const orientation = computed(() => customizedTemplate.value.settings.orientation || 'portrait')

// Type-specific settings
const lineSpacing = computed(() => customizedTemplate.value.settings.lineSpacing)
const gridSize = computed(() => customizedTemplate.value.settings.gridSize)
const puzzleGrid = computed(() => customizedTemplate.value.settings.puzzleGrid)
const recipeLayout = computed(() => customizedTemplate.value.settings.recipeLayout)
const photoLayout = computed(() => customizedTemplate.value.settings.photoLayout)
const plannerLayout = computed(() => customizedTemplate.value.settings.plannerLayout)
const childrenLayout = computed(() => customizedTemplate.value.settings.childrenLayout)
const activityLayout = computed(() => customizedTemplate.value.settings.activityLayout)

// Preview
const { generatePreview } = useTemplatePreview()
const previewWidth = 300
const previewHeight = 400

const previewImage = computed(() =>
  generatePreview(customizedTemplate.value, previewWidth, previewHeight)
)

const handleApply = () => {
  emit('apply', customizedTemplate.value)
  emit('close')
}
</script>

<template>
  <Modal
    :open="open"
    size="6xl"
    @close="emit('close')"
  >
    <template #header>
      <div class="flex w-full items-center justify-between p-4 md:p-6">
        <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
          Customize Template
        </h3>
        <BaseButtonClose @click="emit('close')" />
      </div>
    </template>

    <div class="flex gap-6 p-4 md:p-6">
      <!-- Settings Panel -->
      <div class="w-2/3 space-y-6">
        <!-- Common Settings -->
        <div class="space-y-4">
          <h4 class="font-heading text-muted-900 text-base font-medium dark:text-white">
            Common Settings
          </h4>

          <!-- Orientation -->
          <div>
            <label class="text-muted-400 mb-1 block text-sm dark:text-muted-500">
              Orientation
            </label>
            <FormSelect v-model="customizedTemplate.settings.orientation">
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </FormSelect>
          </div>

          <!-- Margins -->
          <div>
            <label class="text-muted-400 mb-1 block text-sm dark:text-muted-500">
              Margins (inches)
            </label>
            <div class="grid grid-cols-2 gap-4">
              <FormInput
                v-model="margins.top"
                type="number"
                min="0"
                step="0.1"
                label="Top"
              />
              <FormInput
                v-model="margins.right"
                type="number"
                min="0"
                step="0.1"
                label="Right"
              />
              <FormInput
                v-model="margins.bottom"
                type="number"
                min="0"
                step="0.1"
                label="Bottom"
              />
              <FormInput
                v-model="margins.left"
                type="number"
                min="0"
                step="0.1"
                label="Left"
              />
            </div>
          </div>
        </div>

        <!-- Line Settings -->
        <div v-if="lineSpacing !== undefined" class="space-y-4">
          <h4 class="font-heading text-muted-900 text-base font-medium dark:text-white">
            Line Settings
          </h4>
          <FormInput
            v-model="customizedTemplate.settings.lineSpacing"
            type="number"
            min="0.1"
            step="0.03125"
            label="Line Spacing (inches)"
          />
        </div>

        <!-- Grid Settings -->
        <div v-if="gridSize !== undefined" class="space-y-4">
          <h4 class="font-heading text-muted-900 text-base font-medium dark:text-white">
            Grid Settings
          </h4>
          <FormInput
            v-model="customizedTemplate.settings.gridSize"
            type="number"
            min="1"
            step="1"
            label="Grid Size (mm)"
          />
        </div>

        <!-- Puzzle Settings -->
        <div v-if="puzzleGrid" class="space-y-4">
          <h4 class="font-heading text-muted-900 text-base font-medium dark:text-white">
            Puzzle Settings
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <FormInput
              v-model="puzzleGrid.rows"
              type="number"
              min="1"
              step="1"
              label="Rows"
            />
            <FormInput
              v-model="puzzleGrid.cols"
              type="number"
              min="1"
              step="1"
              label="Columns"
            />
            <FormInput
              v-model="puzzleGrid.cellSize"
              type="number"
              min="10"
              step="1"
              label="Cell Size (px)"
            />
          </div>
        </div>

        <!-- Recipe Settings -->
        <div v-if="recipeLayout" class="space-y-4">
          <h4 class="font-heading text-muted-900 text-base font-medium dark:text-white">
            Recipe Settings
          </h4>
          <FormInput
            v-model="recipeLayout.ingredientsWidth"
            type="number"
            min="10"
            max="50"
            step="5"
            label="Ingredients Width (%)"
          />
          <FormCheckbox
            v-model="recipeLayout.hasNutritionTable"
            label="Show Nutrition Table"
          />
          <FormCheckbox
            v-model="recipeLayout.hasTimeInfo"
            label="Show Time Information"
          />
        </div>

        <!-- Photo Settings -->
        <div v-if="photoLayout" class="space-y-4">
          <h4 class="font-heading text-muted-900 text-base font-medium dark:text-white">
            Photo Settings
          </h4>
          <FormInput
            v-model="photoLayout.columns"
            type="number"
            min="1"
            max="4"
            step="1"
            label="Columns"
          />
          <FormInput
            v-model="photoLayout.spacing"
            type="number"
            min="0"
            max="50"
            step="5"
            label="Spacing (px)"
          />
          <FormInput
            v-model="photoLayout.captionHeight"
            type="number"
            min="20"
            max="100"
            step="10"
            label="Caption Height (px)"
          />
        </div>

        <!-- Children's Book Settings -->
        <div v-if="childrenLayout" class="space-y-4">
          <h4 class="font-heading text-muted-900 text-base font-medium dark:text-white">
            Layout Settings
          </h4>
          <FormSelect
            v-model="childrenLayout.textPosition"
            label="Text Position"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </FormSelect>
          <FormCheckbox
            v-model="childrenLayout.hasIllustrationArea"
            label="Show Illustration Area"
          />
          <FormCheckbox
            v-model="childrenLayout.hasTextArea"
            label="Show Text Area"
          />
        </div>

        <!-- Activity Settings -->
        <div v-if="activityLayout" class="space-y-4">
          <h4 class="font-heading text-muted-900 text-base font-medium dark:text-white">
            Activity Settings
          </h4>
          <FormSelect
            v-model="activityLayout.difficulty"
            label="Difficulty"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </FormSelect>
          <FormCheckbox
            v-model="activityLayout.hasInstructions"
            label="Show Instructions"
          />
          <FormCheckbox
            v-model="activityLayout.hasAnswerArea"
            label="Show Answer Area"
          />
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="w-1/3">
        <div class="sticky top-4 space-y-4">
          <h4 class="font-heading text-muted-900 text-base font-medium dark:text-white">
            Preview
          </h4>
          <div class="aspect-[3/4] w-full overflow-hidden rounded-lg border border-muted-200 bg-white dark:border-muted-700 dark:bg-muted-800">
            <img
              :src="previewImage"
              :alt="customizedTemplate.title"
              class="h-full w-full object-cover"
            />
          </div>
          <BaseButton
            class="w-full"
            @click="handleApply"
          >
            Apply Template
          </BaseButton>
        </div>
      </div>
    </div>
  </Modal>
</template>
