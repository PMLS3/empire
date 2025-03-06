<script lang="ts" setup>
import type { Page, Element } from '../../../types/editor'
import { computed } from 'vue'

const props = defineProps<{
  page: Page
  isPreview?: boolean
}>()

// Computed property for elements
const elements = computed(() => props.page?.elements || [])

// Sort elements by z-index
const sortedElements = computed(() => {
  return [...elements.value].sort((a: Element, b: Element) => {
    const aZ = parseInt(a.style?.zIndex || '1')
    const bZ = parseInt(b.style?.zIndex || '1')
    return aZ - bZ
  })
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
  if (props.page?.type === 'cover') {
    // Calculate spine width based on page count (approximately 0.002 inches per page)
    const pageCount = props.page?.elements?.length || 1 // Ensure at least 1 page
    const spineWidthInches = pageCount * 0.002
    const spineWidthCm = spineWidthInches * 2.54
    const spineWidth = cmToPixels(spineWidthCm)

    // For cover pages, we need space for front cover + spine + back cover
    const totalWidth = (width * 2) + spineWidth

    return { width: totalWidth, height }
  }

  return { width, height }
})

// Cover section widths
const coverSectionWidths = computed(() => {
  if (props.page?.type !== 'cover') return null

  const baseWidth = cmToPixels(defaultSize.width)
  const pageCount = props.page?.elements?.length || 1
  const spineWidth = cmToPixels(pageCount * 0.002 * 2.54)

  return {
    backCover: baseWidth,
    spine: spineWidth,
    frontCover: baseWidth
  }
})
</script>

<template>
  <div class="relative h-full w-full bg-white">
    <!-- Cover Layout -->
    <template v-if="page?.type === 'cover'">
      <div class="absolute inset-0 flex">
        <!-- Back Cover -->
        <div
          class="relative flex-1 border-r border-dashed border-gray-200"
          :style="{ width: `${coverSectionWidths?.backCover}px` }"
        >
          <div class="absolute top-4 left-4 text-xs text-gray-400">Back Cover</div>
        </div>

        <!-- Spine -->
        <div
          class="relative border-r border-dashed border-gray-200 bg-gray-50"
          :style="{ width: `${coverSectionWidths?.spine}px` }"
        >
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-xs text-gray-400">
            Spine
          </div>
        </div>

        <!-- Front Cover -->
        <div
          class="relative flex-1"
          :style="{ width: `${coverSectionWidths?.frontCover}px` }"
        >
          <div class="absolute top-4 left-4 text-xs text-gray-400">Front Cover</div>
        </div>
      </div>
    </template>

    <!-- Page Elements -->
    <template v-for="element in sortedElements" :key="element.id">
      <PublishingBookElementsPreviewElement :element="element" />
    </template>
  </div>
</template>
