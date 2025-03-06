<script setup lang="ts">
const { textState } = useTextTools()
const editor = ref<HTMLElement | null>(null)

const formatOptions = [
  { id: 'bold', icon: 'ph:text-b-bold' },
  { id: 'italic', icon: 'ph:text-italic-bold' },
  { id: 'underline', icon: 'ph:text-underline-bold' },
  { id: 'strikethrough', icon: 'ph:text-strikethrough-bold' }
]

const listOptions = [
  { id: 'bullet', icon: 'ph:list-bullets-bold' },
  { id: 'ordered', icon: 'ph:list-numbers-bold' }
]

const alignmentOptions = [
  { id: 'left', icon: 'ph:text-align-left' },
  { id: 'center', icon: 'ph:text-align-center' },
  { id: 'right', icon: 'ph:text-align-right' }
]

const execCommand = (command: string, value: string = '') => {
  document.execCommand(command, false, value)
  updateContent()
}

const updateContent = () => {
  if (editor.value) {
    textState.value.richText.content = editor.value.innerHTML
  }
}

const toggleLink = () => {
  if (!textState.value.richText.links.enabled) {
    const url = window.prompt('Enter URL:', '')
    if (url) {
      textState.value.richText.links.url = url
      execCommand('createLink', url)
    }
  } else {
    execCommand('unlink')
  }
  textState.value.richText.links.enabled = !textState.value.richText.links.enabled
}

const handleIndent = (increase: boolean) => {
  execCommand(increase ? 'indent' : 'outdent')
  textState.value.richText.lists.indent = Math.max(
    0,
    textState.value.richText.lists.indent + (increase ? 1 : -1)
  )
}

onMounted(() => {
  if (editor.value) {
    editor.value.innerHTML = textState.value.richText.content
  }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Rich Text Toolbar -->
    <div class="flex flex-wrap gap-2 p-2 bg-gray-800 rounded">
      <!-- Text Format -->
      <div class="flex gap-1">
        <button
          v-for="option in formatOptions"
          :key="option.id"
          class="p-1.5 rounded hover:bg-gray-700"
          @click="execCommand(option.id)"
        >
          <Icon :name="option.icon" class="w-4 h-4 text-white" />
        </button>
      </div>

      <div class="h-6 border-r border-gray-700"></div>

      <!-- Lists -->
      <div class="flex gap-1">
        <button
          v-for="option in listOptions"
          :key="option.id"
          class="p-1.5 rounded hover:bg-gray-700"
          :class="{ 'bg-gray-700': textState.richText.lists[option.id] }"
          @click="execCommand(`insert${option.id === 'bullet' ? 'UnorderedList' : 'OrderedList'}`)"
        >
          <Icon :name="option.icon" class="w-4 h-4 text-white" />
        </button>
        <button
          class="p-1.5 rounded hover:bg-gray-700"
          @click="handleIndent(true)"
        >
          <Icon name="ph:indent-bold" class="w-4 h-4 text-white" />
        </button>
        <button
          class="p-1.5 rounded hover:bg-gray-700"
          @click="handleIndent(false)"
        >
          <Icon name="ph:outdent-bold" class="w-4 h-4 text-white" />
        </button>
      </div>

      <div class="h-6 border-r border-gray-700"></div>

      <!-- Alignment -->
      <div class="flex gap-1">
        <button
          v-for="option in alignmentOptions"
          :key="option.id"
          class="p-1.5 rounded hover:bg-gray-700"
          :class="{ 'bg-gray-700': textState.alignment === option.id }"
          @click="execCommand('justify' + option.id)"
        >
          <Icon :name="option.icon" class="w-4 h-4 text-white" />
        </button>
      </div>

      <div class="h-6 border-r border-gray-700"></div>

      <!-- Link -->
      <button
        class="p-1.5 rounded hover:bg-gray-700"
        :class="{ 'bg-gray-700': textState.richText.links.enabled }"
        @click="toggleLink"
      >
        <Icon name="ph:link-bold" class="w-4 h-4 text-white" />
      </button>
    </div>

    <!-- Editor -->
    <div
      ref="editor"
      class="min-h-[200px] p-3 bg-gray-700 rounded text-white"
      contenteditable
      @input="updateContent"
      @paste="(e) => e.preventDefault()"
    />
  </div>
</template>
