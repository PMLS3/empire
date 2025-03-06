<script setup lang="ts">
const props = defineProps<{
  image: string
  style: {
    width: string
    height: string
    top: string
    left: string
    transform: string
  }
  selected: boolean
  canvasWidth: number
  canvasHeight: number
  gridSize: number
  snapToGrid: boolean
}>()

const emit = defineEmits<{
  (e: 'select', event: MouseEvent): void
  (e: 'resize', size: { width: number; height: number }): void
  (e: 'move', position: { x: number; y: number }): void
  (e: 'rotate', angle: number): void
}>()
</script>

<template>
  <DraggableElement
    :selected="selected"
    :style="style"
    :canvas-width="canvasWidth"
    :canvas-height="canvasHeight"
    :grid-size="gridSize"
    :snap-to-grid="snapToGrid"
    @select="(e) => emit('select', e)"
    @move="(pos) => emit('move', pos)"
    @resize="(size) => emit('resize', size)"
    @rotate="(angle) => emit('rotate', angle)"
  >
    <img :src="image" class="w-full h-full object-contain" draggable="false" />
  </DraggableElement>
</template>

<style scoped>
img {
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
