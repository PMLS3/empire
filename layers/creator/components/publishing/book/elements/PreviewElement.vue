<script setup lang="ts">
import type { Element } from '../../../types/editor'

const props = defineProps<{
  element: Element
}>()

// Computed style with absolute positioning
const elementStyle = computed(() => {
  const { style } = props.element
  return {
    position: 'absolute',
    ...style
  }
})
</script>

<template>
  <div :style="elementStyle">
    <!-- Puzzle Element -->
    <template v-if="element.type === 'puzzle'">
      <!-- Word Search -->
      <div v-if="element.puzzle?.type === 'word-search'" class="w-full h-full">
        <div v-if="!element.puzzle.content.showSolution">
          <PublishingPuzzlesWordSearchPreview
            :grid="element.puzzle.content.grid"
            :words="element.puzzle.content.words"
            :text-color="element.puzzle.content.textColor"
            :background-color="element.puzzle.content.backgroundColor"
            :border-color="element.puzzle.content.borderColor"
          />
        </div>
        <div v-else>
          <PublishingPuzzlesWordSearchSolution
            :grid="element.puzzle.content.grid"
            :words="element.puzzle.content.words"
            :locations="element.puzzle.content.locations"
            :text-color="element.puzzle.content.textColor"
            :background-color="element.puzzle.content.backgroundColor"
            :border-color="element.puzzle.content.borderColor"
            :locations-color="element.puzzle.content.locationsColor"
          />
        </div>
      </div>
    </template>

    <!-- Image Element -->
    <template v-else-if="element.type === 'image'">
      <img
        :src="element.content"
        class="w-full h-full object-contain"
        draggable="false"
      />
    </template>

    <!-- Path Element -->
    <template v-else-if="element.type === 'path'">
      <svg
        class="absolute inset-0"
        :width="element.style.width"
        :height="element.style.height"
        :viewBox="`0 0 ${parseInt(element.path?.originalWidth || element.style.width)} ${parseInt(element.path?.originalHeight || element.style.height)}`"
        preserveAspectRatio="none"
      >
        <path
          :d="element.path?.data"
          :stroke="element.path?.color"
          :stroke-width="element.path?.width"
          :opacity="element.path?.opacity"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    </template>

    <!-- Shape Element -->
    <template v-else-if="element.type === 'shape'">
      <svg
        class="absolute inset-0"
        :width="element.style.width"
        :height="element.style.height"
      >
        <path
          :d="element.shape?.path"
          :fill="element.shape?.isFilled ? element.shape.fill : 'none'"
          :stroke="element.shape?.hasStroke ? element.shape.stroke : 'none'"
          :stroke-width="element.shape?.strokeWidth"
          :opacity="element.shape?.opacity"
        />
      </svg>
    </template>

    <!-- Text Element -->
    <template v-else-if="element.type === 'text'">
      <div
        class="w-full h-full"
        :style="{
          color: element.text?.color,
          fontFamily: element.text?.font,
          fontSize: element.text?.size + 'px',
          fontWeight: element.text?.bold ? 'bold' : 'normal',
          fontStyle: element.text?.italic ? 'italic' : 'normal',
          textDecoration: element.text?.underline ? 'underline' : 'none',
          textAlign: element.text?.alignment || 'left',
          lineHeight: element.text?.lineHeight,
          letterSpacing: element.text?.letterSpacing + 'px',
          opacity: element.text?.opacity,
          textShadow: element.text?.effects?.shadow?.enabled
            ? `${element.text.effects.shadow.offsetX}px ${element.text.effects.shadow.offsetY}px ${element.text.effects.shadow.blur}px ${element.text.effects.shadow.color}`
            : 'none',
          WebkitTextStroke: element.text?.effects?.outline?.enabled
            ? `${element.text.effects.outline.width}px ${element.text.effects.outline.color}`
            : 'none'
        }"
      >
        {{ element.text?.content }}
      </div>
    </template>
  </div>
</template>
