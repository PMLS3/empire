<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Element } from '../../../../types/editor'

const props = defineProps<{
  element: Element
  selected: boolean
  elements: Element[]
  canvasWidth: number
  canvasHeight: number
  gridSize: number
  snapToGrid: boolean
}>()

const emit = defineEmits(['select', 'move', 'resize', 'rotate', 'ungroup'])

// Get group properties
const { id, style, group } = props.element

// Element positioning
const position = ref({
  x: parseInt(style.left) || 0,
  y: parseInt(style.top) || 0,
  width: parseInt(style.width) || 100,
  height: parseInt(style.height) || 100,
  rotation: style.transform ? parseFloat(style.transform.replace(/[^\d.-]/g, '')) || 0 : 0
})

// Get group elements
const groupElements = computed(() => {
  if (!group?.elements) return []
  return props.elements.filter(element => group.elements.includes(element.id))
})

// Handle selection
const handleSelect = (e: MouseEvent) => {
  e.stopPropagation()
  emit('select', e)
}

// Handle ungroup
const handleUngroup = () => {
  emit('ungroup', id)
}

// Group name editing
const isEditingName = ref(false)
const groupName = ref(group?.name || 'Group')

const startEditingName = (e: MouseEvent) => {
  e.stopPropagation()
  isEditingName.value = true
}

const finishEditingName = () => {
  isEditingName.value = false
  emit('nameChange', groupName.value)
}

// Handle position updates from parent
watch(() => props.element.style, (newStyle) => {
  position.value = {
    x: parseInt(newStyle.left) || 0,
    y: parseInt(newStyle.top) || 0,
    width: parseInt(newStyle.width) || 100,
    height: parseInt(newStyle.height) || 100,
    rotation: newStyle.transform ? parseFloat(newStyle.transform.replace(/[^\d.-]/g, '')) || 0 : 0
  }
}, { deep: true })

// Calculate relative positions of child elements
const getRelativePosition = (element: Element) => {
  const left = parseInt(element.style.left) || 0
  const top = parseInt(element.style.top) || 0
  
  return {
    left: `${left - position.value.x}px`,
    top: `${top - position.value.y}px`
  }
}
</script>

<template>
  <div
    :id="id"
    class="absolute group-element"
    :class="{ selected }"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`, 
      width: `${position.width}px`,
      height: `${position.height}px`,
      transform: `rotate(${position.rotation}deg)`,
      cursor: 'move',
      border: selected ? '2px dashed #4CAF50' : '2px dashed rgba(0,0,0,0.2)',
      backgroundColor: 'rgba(0,0,0,0.03)',
      borderRadius: '4px',
      overflow: 'visible'
    }"
    @mousedown="handleSelect"
  >
    <!-- Group Label -->
    <div 
      class="group-label"
      :class="{ 'editing': isEditingName }"
      @dblclick="startEditingName"
    >
      <template v-if="isEditingName">
        <input 
          v-model="groupName"
          class="group-name-input"
          @blur="finishEditingName"
          @keyup.enter="finishEditingName"
          ref="nameInput"
          v-focus
        />
      </template>
      <template v-else>
        <span class="group-name">{{ group?.name || 'Group' }}</span>
      </template>
    </div>
    
    <!-- Preview of child elements (shown as outlines) -->
    <div
      v-for="element in groupElements"
      :key="element.id"
      class="group-child-preview"
      :style="{
        ...getRelativePosition(element),
        width: element.style.width,
        height: element.style.height,
        transform: element.style.transform,
        border: '1px dashed rgba(0,0,0,0.3)',
        pointerEvents: 'none',
        position: 'absolute'
      }"
    ></div>
    
    <!-- Resize handles when selected -->
    <template v-if="selected">
      <div class="resize-handle top-left"></div>
      <div class="resize-handle top-right"></div>
      <div class="resize-handle bottom-left"></div>
      <div class="resize-handle bottom-right"></div>
      
      <!-- Rotation handle -->
      <div class="rotation-handle">
        <Icon name="ph:arrow-clockwise-bold" class="w-4 h-4 text-primary-500" />
      </div>
      
      <!-- Ungroup button -->
      <button
        class="ungroup-button"
        @click.stop="handleUngroup"
        title="Ungroup elements"
      >
        <Icon name="ph:cells-bold" class="w-4 h-4 text-white" />
      </button>
    </template>
  </div>
</template>

<style scoped>
.group-element {
  position: absolute;
  user-select: none;
}

.group-element.selected {
  z-index: 100;
}

.group-label {
  position: absolute;
  top: -20px;
  left: 0;
  background-color: #4CAF50;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  z-index: 10;
}

.group-label.editing {
  padding: 0;
  background-color: transparent;
}

.group-name-input {
  background-color: white;
  border: 1px solid #4CAF50;
  color: #333;
  font-size: 12px;
  padding: 2px 4px;
  width: 150px;
  outline: none;
  border-radius: 4px;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: white;
  border: 1px solid #4CAF50;
  border-radius: 50%;
  z-index: 10;
}

.top-left {
  top: -5px;
  left: -5px;
  cursor: nwse-resize;
}

.top-right {
  top: -5px;
  right: -5px;
  cursor: nesw-resize;
}

.bottom-left {
  bottom: -5px;
  left: -5px;
  cursor: nesw-resize;
}

.bottom-right {
  bottom: -5px;
  right: -5px;
  cursor: nwse-resize;
}

.rotation-handle {
  position: absolute;
  top: -30px;
  left: calc(50% - 10px);
  width: 20px;
  height: 20px;
  background-color: white;
  border: 1px solid #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/></svg>'), auto;
  z-index: 10;
}

.ungroup-button {
  position: absolute;
  bottom: -30px;
  left: calc(50% - 10px);
  width: 20px;
  height: 20px;
  background-color: #f44336;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.ungroup-button:hover {
  background-color: #d32f2f;
}
</style>