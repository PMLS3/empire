<script setup lang="ts">
import { defineProps } from 'vue'
import type { Page, Element, Book } from '../../../types/editor'
const props = defineProps<{
  selectedPage: Page
  editorState: EditorState
  canvasDimensions: { width: number; height: number }
  coverSectionWidths: { backCover: number; spine: number }
  selectedElement: Element | null
  handleElementSelect: (id: string, event: MouseEvent) => void
  handleElementResize: (id: string, size: any) => void
  handleElementMove: (id: string, pos: any) => void
  handleElementRotate: (id: string, angle: any) => void
  updateElementText: (id: string, content: string) => void
  updateElementTextProperties: (id: string, updates: any) => void
}>();
</script>
<template>
    <template v-if="selectedPage?.elements">
              <template v-for="element in selectedPage.elements" :key="element.id">
                <!-- Add section classes based on position for cover elements -->
                <div
                  v-if="selectedPage.type === 'cover'"
                  :class="{
                    'cover-back': parseInt(element.style.left) < coverSectionWidths.backCover,
                    'cover-spine': parseInt(element.style.left) >= coverSectionWidths.backCover &&
                                  parseInt(element.style.left) < (coverSectionWidths.backCover + coverSectionWidths.spine),
                    'cover-front': parseInt(element.style.left) >= (coverSectionWidths.backCover + coverSectionWidths.spine)
                  }"
                >
                  <PublishingBookElementsPuzzleElement
                    v-if="element?.type === 'puzzle'"
                    :puzzle="element?.puzzle"
                    :style="element?.style"
                    :selected="editorState.selectedElements.has(element.id)"
                    :canvas-width="canvasDimensions.width"
                    :canvas-height="canvasDimensions.height"
                    :grid-size="editorState.gridSize"
                    :snap-to-grid="editorState.snapToGrid"
                    @select="handleElementSelect(element.id, $event)"
                    @resize="size => handleElementResize(element.id, size)"
                    @move="pos => handleElementMove(element.id, pos)"
                    @rotate="angle => handleElementRotate(element.id, angle)"
                  />
                  <PublishingBookElementsImageElement
                    v-else-if="element?.type === 'image'"
                    :image="element?.content"
                    :style="element?.style"
                    :selected="editorState.selectedElements.has(element.id)"
                    :canvas-width="canvasDimensions.width"
                    :canvas-height="canvasDimensions.height"
                    :grid-size="editorState.gridSize"
                    :snap-to-grid="editorState.snapToGrid"
                    @select="handleElementSelect(element.id, $event)"
                    @resize="(id: string, size: any) => handleElementResize(id, size)"
                    @move="(id: string, pos: any) => handleElementMove(id, pos)"
                    @rotate="(id: string, angle: any) => handleElementRotate(id, angle)"
                  />
                  <template v-else-if="element.type === 'path'">
                    <PublishingBookElementsPathElement
                      :element="element"
                      :selected="selectedElement?.id === element.id"
                      :canvas-width="canvasDimensions.width"
                      :canvas-height="canvasDimensions.height"
                      :grid-size="editorState.gridSize"
                      :snap-to-grid="editorState.snapToGrid"
                      @select="selectElement(element.id)"
                      @move="pos => handleElementMove(element.id, pos)"
                      @resize="size => handleElementResize(element.id, size)"
                      @rotate="angle => handleElementRotate(element.id, angle)"
                    />
                  </template>
                  <template v-else-if="element.type === 'shape'">
                    <PublishingBookElementsShapeElement
                      :element="element"
                      :selected="selectedElement?.id === element.id"
                      :canvas-width="canvasDimensions.width"
                      :canvas-height="canvasDimensions.height"
                      :grid-size="editorState.gridSize"
                      :snap-to-grid="editorState.snapToGrid"
                      @select="selectElement(element.id)"
                      @move="pos => handleElementMove(element.id, pos)"
                      @resize="size => handleElementResize(element.id, size)"
                      @rotate="angle => handleElementRotate(element.id, angle)"
                    />
                  </template>
                  <template v-else-if="element.type === 'text'">
                    <PublishingBookElementsTextElement
                      :element="element"
                      :selected="selectedElement?.id === element.id"
                      :canvas-width="canvasDimensions.width"
                      :canvas-height="canvasDimensions.height"
                      :grid-size="editorState.gridSize"
                      :snap-to-grid="editorState.snapToGrid"
                      @select="selectElement(element.id)"
                      @move="pos => handleElementMove(element.id, pos)"
                      @resize="size => handleElementResize(element.id, size)"
                      @rotate="angle => handleElementRotate(element.id, angle)"
                      @textChange="content => updateElementText(element.id, content)"
                      @update="updates => updateElementTextProperties(element.id, updates)"
                    />
                  </template>
                </div>
                <!-- Regular page elements -->
                <template v-else>
                  <PublishingBookElementsPuzzleElement
                    v-if="element?.type === 'puzzle'"
                    :puzzle="element?.puzzle"
                    :style="element?.style"
                    :selected="editorState.selectedElements.has(element.id)"
                    :canvas-width="canvasDimensions.width"
                    :canvas-height="canvasDimensions.height"
                    :grid-size="editorState.gridSize"
                    :snap-to-grid="editorState.snapToGrid"
                    @select="handleElementSelect(element.id, $event)"
                    @resize="size => handleElementResize(element.id, size)"
                    @move="pos => handleElementMove(element.id, pos)"
                    @rotate="angle => handleElementRotate(element.id, angle)"
                  />
                  <PublishingBookElementsImageElement
                    v-else-if="element?.type === 'image'"
                    :image="element?.content"
                    :style="element?.style"
                    :selected="editorState.selectedElements.has(element.id)"
                    :canvas-width="canvasDimensions.width"
                    :canvas-height="canvasDimensions.height"
                    :grid-size="editorState.gridSize"
                    :snap-to-grid="editorState.snapToGrid"
                    @select="handleElementSelect(element.id, $event)"
                    @resize="(id: string, size: any) => handleElementResize(id, size)"
                    @move="(id: string, pos: any) => handleElementMove(id, pos)"
                    @rotate="(id: string, angle: any) => handleElementRotate(id, angle)"
                  />
                  <template v-else-if="element.type === 'path'">
                    <PublishingBookElementsPathElement
                      :element="element"
                      :selected="selectedElement?.id === element.id"
                      :canvas-width="canvasDimensions.width"
                      :canvas-height="canvasDimensions.height"
                      :grid-size="editorState.gridSize"
                      :snap-to-grid="editorState.snapToGrid"
                      @select="selectElement(element.id)"
                      @move="pos => handleElementMove(element.id, pos)"
                      @resize="size => handleElementResize(element.id, size)"
                      @rotate="angle => handleElementRotate(element.id, angle)"
                    />
                  </template>
                  <template v-else-if="element.type === 'shape'">
                    <PublishingBookElementsShapeElement
                      :element="element"
                      :selected="selectedElement?.id === element.id"
                      :canvas-width="canvasDimensions.width"
                      :canvas-height="canvasDimensions.height"
                      :grid-size="editorState.gridSize"
                      :snap-to-grid="editorState.snapToGrid"
                      @select="selectElement(element.id)"
                      @move="pos => handleElementMove(element.id, pos)"
                      @resize="size => handleElementResize(element.id, size)"
                      @rotate="angle => handleElementRotate(element.id, angle)"
                    />
                  </template>
                  <template v-else-if="element.type === 'text'">
                    <PublishingBookElementsTextElement
                      :element="element"
                      :selected="selectedElement?.id === element.id"
                      :canvas-width="canvasDimensions.width"
                      :canvas-height="canvasDimensions.height"
                      :grid-size="editorState.gridSize"
                      :snap-to-grid="editorState.snapToGrid"
                      @select="selectElement(element.id)"
                      @move="pos => handleElementMove(element.id, pos)"
                      @resize="size => handleElementResize(element.id, size)"
                      @rotate="angle => handleElementRotate(element.id, angle)"
                      @textChange="content => updateElementText(element.id, content)"
                      @update="updates => updateElementTextProperties(element.id, updates)"
                    />
                  </template>
                </template>
              </template>
            </template>
</template>
