<script lang="ts" setup>
interface Layout {
  id: string
  name: string
  description: string
  category: string
  elements: LayoutElement[]
  grid: {
    columns: number
    rows: number
  }
}

interface LayoutElement {
  id: string
  type: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  properties: Record<string, any>
}

const props = defineProps<{
  layout: Layout
  interactive?: boolean
}>()

const emit = defineEmits(['select'])

const getElementStyle = (element: LayoutElement) => {
  const { x, y, width, height } = element.position
  return {
    position: 'absolute',
    left: `${(x / props.layout.grid.columns) * 100}%`,
    top: `${(y / props.layout.grid.rows) * 100}%`,
    width: `${(width / props.layout.grid.columns) * 100}%`,
    height: `${(height / props.layout.grid.rows) * 100}%`,
    ...element.properties
  }
}

const renderElement = (element: LayoutElement) => {
  switch (element.type) {
    case 'heading':
      return h('h2', {
        style: {
          fontSize: `${element.properties.fontSize || 24}px`,
          textAlign: element.properties.alignment || 'left',
          fontFamily: element.properties.fontFamily
        }
      }, 'Heading')
    case 'text':
      return h('p', {
        style: {
          fontSize: `${element.properties.fontSize || 14}px`,
          textAlign: element.properties.alignment || 'left',
          fontFamily: element.properties.fontFamily
        }
      }, 'Text content')
    case 'image':
      return h('div', {
        class: 'bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center',
        style: {
          aspectRatio: element.properties.aspectRatio
        }
      }, [
        h('icon-ph-image', {
          class: 'w-8 h-8 text-gray-400 dark:text-gray-500'
        })
      ])
    case 'list':
      return h('ul', {
        class: 'list-disc list-inside',
        style: {
          fontSize: `${element.properties.fontSize || 14}px`
        }
      }, [
        h('li', 'List item 1'),
        h('li', 'List item 2'),
        h('li', 'List item 3')
      ])
    case 'table':
      return h('div', {
        class: 'grid gap-1',
        style: {
          gridTemplateColumns: `repeat(${element.properties.columns || 3}, 1fr)`
        }
      }, Array.from({ length: (element.properties.columns || 3) * (element.properties.rows || 3) }).map(() => 
        h('div', { class: 'bg-gray-100 dark:bg-gray-700 rounded aspect-square' })
      ))
    case 'timeline':
      return h('div', {
        class: 'flex flex-col gap-2'
      }, Array.from({ length: element.properties.points || 3 }).map(() =>
        h('div', { class: 'flex items-center gap-2' }, [
          h('div', { class: 'w-3 h-3 rounded-full bg-primary-500' }),
          h('div', { class: 'flex-1 h-px bg-gray-200 dark:bg-gray-700' }),
          h('div', { class: 'bg-gray-100 dark:bg-gray-800 rounded p-2 text-sm' }, 'Event')
        ])
      ))
    case 'staff':
      return h('div', {
        class: 'flex flex-col',
        style: {
          gap: element.properties.spacing || '1rem'
        }
      }, Array.from({ length: element.properties.staves || 4 }).map(() =>
        h('div', { class: 'h-px bg-gray-300 dark:bg-gray-600' })
      ))
    case 'metadata':
      return h('div', {
        class: 'space-y-2'
      }, (element.properties.fields || ['field1', 'field2']).map(field =>
        h('div', { class: 'flex justify-between text-sm' }, [
          h('span', { class: 'text-gray-500' }, field),
          h('span', 'Value')
        ])
      ))
    default:
      return null
  }
}
</script>

<template>
  <div 
    class="relative bg-white dark:bg-gray-800 shadow-sm rounded-lg aspect-[1/1.4142] overflow-hidden"
    :class="{ 'cursor-pointer hover:ring-2 ring-primary-500': interactive }"
    @click="$emit('select', layout)"
  >
    <div 
      v-for="element in layout.elements" 
      :key="element.id"
      class="absolute"
      :style="getElementStyle(element)"
    >
      <component :is="renderElement(element)" />
    </div>
  </div>
</template>
