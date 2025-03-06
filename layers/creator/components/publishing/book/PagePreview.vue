<script lang="ts" setup>
import type { Page, Book } from '../../../types/editor'

const props = defineProps<{
  page: Page
  scale: number
}>()
const {
  editorState,
  selectedElement,

} = useEditor()
const { book, BookSizeOptions } = usePublishing()

const canvasDimensions = computed(() => {
  const width = 210 * props.scale // Assuming A4 size in mm
  const height = 297 * props.scale // Assuming A4 size in mm
  return { width, height }
})
const cmToPixels = (cm: number) => Math.round((cm || 0) * 37.795275591)
const defaultSize = { width: 21, height: 29.7, label: 'A4' }

// Page state
const selectedSize = ref(BookSizeOptions.value[0] || defaultSize)

const pages = computed({
  get() {
    return (book.value as Book).pages || []
  },
  set(newPages: Page[]) {
    ;(book.value as Book).pages = newPages
  }
})

const coverSectionWidths = computed(() => {
  const baseWidth = cmToPixels(selectedSize.value?.width || defaultSize.width)
  const pageCount = pages.value?.length || 1
  const spineWidth = cmToPixels(pageCount * 0.002 * 2.54)
  return {
    backCover: baseWidth,
    spine: spineWidth,
    frontCover: baseWidth
  }
})
</script>

<template>
  <div
    class="relative bg-white shadow-lg"
    :style="{
      width: `${canvasDimensions.width}px`,
      height: `${canvasDimensions.height}px`
    }"
  >
  <PublishingBookElements :selectedPage="page" :selectedElement="selectedElement" :coverSectionWidths="coverSectionWidths" :editorState="editorState" :canvasDimensions="canvasDimensions"/>
  </div>
</template>

<style scoped>
/* Add any necessary styles here */
</style>
