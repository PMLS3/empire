<script setup lang="ts">
import type { Page } from '../../../types/editor'

const props = defineProps<{
  pages: Page[]
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// Current page index
const currentPage = ref(0)

// Computed properties for navigation
const hasNextPage = computed(() => currentPage.value < props.pages.length - 1)
const hasPrevPage = computed(() => currentPage.value > 0)

// Navigation methods
const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (hasPrevPage.value) {
    currentPage.value--
  }
}

// Keyboard navigation
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.open) return

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    nextPage()
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    prevPage()
  } else if (event.key === 'Escape') {
    emit('close')
  }
}

// Page number display
const pageDisplay = computed(() => {
  if (props.pages.length === 0) return 'No pages'
  return `Page ${currentPage.value + 1} of ${props.pages.length}`
})

// Default size (A4)
const defaultSize = { width: 21, height: 29.7 }

// Convert cm to pixels (assuming 96 DPI)
const cmToPixels = (cm: number) => Math.round((cm || 0) * 37.795275591)

// Page dimensions in pixels
const pageDimensions = computed(() => {
  const width = cmToPixels(defaultSize.width)
  const height = cmToPixels(defaultSize.height)

  // For cover pages, we need space for front cover + spine + back cover
  if (props.pages[currentPage.value]?.type === 'cover') {
    // Calculate spine width based on page count (approximately 0.002 inches per page)
    const pageCount = props.pages.length || 1 // Ensure at least 1 page
    const spineWidthInches = pageCount * 0.002
    const spineWidthCm = spineWidthInches * 2.54
    const spineWidth = cmToPixels(spineWidthCm)

    // For cover pages, we need space for front cover + spine + back cover
    const totalWidth = (width * 2) + spineWidth

    return { width: totalWidth, height }
  }

  return { width, height }
})

// Scale to fit the preview area while maintaining aspect ratio
const scale = computed(() => {
  const container = { width: 800, height: 600 } // Adjust these values based on your container size
  const { width, height } = pageDimensions.value
  const scaleX = container.width / width
  const scaleY = container.height / height
  return Math.min(scaleX, scaleY)
})
</script>

<template>
  <Modal
    :open="open"
    size="7xl"
    @close="emit('close')"
  >
    <template #header>
      <div class="flex w-full items-center justify-between p-4 md:p-6">
        <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
          Book Preview
        </h3>
        <BaseButtonClose @click="emit('close')" />
      </div>
    </template>

    <div class="flex h-[80vh] flex-col">
      <!-- Preview Area -->
      <div class="relative flex-1 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <!-- Page Display -->
        <div
          v-if="pages.length > 0"
          class="absolute inset-0 flex items-center justify-center"
        >
          <div
            class="relative bg-white shadow-lg"
            :style="{
              width: `${pageDimensions.width}px`,
              height: `${pageDimensions.height}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'center center'
            }"
          >
            <!-- Page Content -->
            <PublishingBookCanvas
              :page="pages[currentPage]"
              :is-preview="true"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="flex h-full items-center justify-center"
        >
          <div class="text-center">
            <Icon
              name="ph:book-open-duotone"
              class="mx-auto h-12 w-12 text-gray-400"
            />
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No pages
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              Add some pages to preview your book.
            </p>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="absolute inset-y-0 left-4 flex items-center">
          <BaseButtonIcon
            v-show="hasPrevPage"
            @click="prevPage"
            class="rounded-full bg-white/80 p-2 text-gray-800 shadow-lg backdrop-blur-sm hover:bg-white dark:bg-gray-800/80 dark:text-white dark:hover:bg-gray-800"
          >
            <Icon name="ph:caret-left-bold" class="h-6 w-6" />
          </BaseButtonIcon>
        </div>

        <div class="absolute inset-y-0 right-4 flex items-center">
          <BaseButtonIcon
            v-show="hasNextPage"
            @click="nextPage"
            class="rounded-full bg-white/80 p-2 text-gray-800 shadow-lg backdrop-blur-sm hover:bg-white dark:bg-gray-800/80 dark:text-white dark:hover:bg-gray-800"
          >
            <Icon name="ph:caret-right-bold" class="h-6 w-6" />
          </BaseButtonIcon>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="flex items-center justify-between border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <!-- Page Counter -->
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ pageDisplay }}
        </div>

        <!-- Keyboard Shortcuts -->
        <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span class="flex items-center gap-1">
            <kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-800">←</kbd>
            <span>Previous</span>
          </span>
          <span class="flex items-center gap-1">
            <kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-800">→</kbd>
            <span>Next</span>
          </span>
          <span class="flex items-center gap-1">
            <kbd class="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-800">Esc</kbd>
            <span>Close</span>
          </span>
        </div>

        <!-- Close Button -->
        <BaseButton
          variant="solid"
          color="primary"
          @click="emit('close')"
        >
          Done
        </BaseButton>
      </div>
    </div>
  </Modal>
</template>
