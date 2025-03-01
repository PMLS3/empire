<script setup lang="ts">
const { open } = usePanels()
const { selectedConversation } = useChat()

const isAssistantOpen = useState('assistant-open', () => false)
</script>

<template>
  <button
    type="button"
    class="border-muted-200 hover:ring-muted-200 dark:hover:ring-muted-700 dark:border-muted-700 dark:bg-muted-800 dark:ring-offset-muted-900 flex size-9 items-center justify-center rounded-full border bg-white ring-1 ring-transparent transition-all duration-300 hover:ring-offset-4"
    @click="open('agent')"
  >
    <img
      class="size-7 rounded-full"
     :src="selectedConversation?.user.photo"
      alt="flag icon"
    >
  </button>
</template>
