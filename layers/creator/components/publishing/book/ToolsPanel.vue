<script lang="ts" setup>
const { editorState } = useEditor()

interface Tool {
  id: string
  icon: string
  label: string
  isActive?: boolean
}

const props = defineProps<{
  tools: Tool[]
  selectedTool?: Tool | null
}>()

const emit = defineEmits(['select'])

const tools = [
  {
    id: 'drawing',
    icon: 'ph:pencil-line-duotone',
    label: 'Drawing Tools',
    action: () => {
      editorState.value.drawing.active = !editorState.value.drawing.active
      editorState.value.drawing.currentTool = 'pencil'
    }
  },
  {
    id: 'puzzle',
    icon: 'ph:puzzle-piece-duotone',
    label: 'Puzzle Generator'
  },
  // ... existing tools
]
</script>

<template>
  <div class="w-16 border-r border-gray-700 bg-gray-800 py-4">
    <div class="flex flex-col items-center space-y-4">
      <BaseButton
        v-for="tool in props.tools"
        :key="tool.id"
        color="gray"
        variant="ghost"
        :ui="{
          base: 'flex flex-col items-center gap-1',
          padding: 'p-2',
        }"
        :class="[
          tool.isActive ? 'bg-gray-700' : '',
          tool.id === 'drawing' && editorState?.value?.drawing?.active ? 'bg-primary-500 bg-opacity-20 ring-2 ring-primary-500' : ''
        ]"
        @click="emit('select', tool)"
      >
        <Icon :name="tool.icon" class="flex-shrink-0 h-5 w-5 text-gray-300" />
        <span class="text-xs text-gray-300">{{ tool.label }}</span>
      </BaseButton>
    </div>
  </div>
</template>
