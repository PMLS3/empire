<template>
  <div class="puzzle-element">
    <!-- Word Search -->
    <template v-if="content?.type === 'word-search'">
      <PublishingPuzzlesWordSearchPreview
        v-if="!content?.content?.showSolution"
        :grid="content?.content?.grid"
        :words="content?.content?.words"
        :size="content?.content?.size"
      />
      <PublishingPuzzlesWordSearchSolution
        v-else
        :grid="content?.content?.grid"
        :words="content?.content?.words"
        :size="content?.content?.size"
        :locations="content?.content?.locations"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
interface PuzzleContent {
  type: 'word-search' | string
  content?: {
    grid?: string[][]
    words?: string[]
    size?: number
    showSolution?: boolean
    locations?: any
  }
}

defineProps<{
  content?: PuzzleContent
}>()
</script>

<style scoped>
.puzzle-element {
  width: 100%;
  height: 100%;
}
</style>
