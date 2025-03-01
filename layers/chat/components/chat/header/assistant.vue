<script setup lang='ts'>
const { mobileOpen, searchMessages, selectedConversation, selectConversation } = useChat()
const { toggleAssistant } = useAssistant()
const { readText, toggleReadText } = useChat()
const props = withDefaults(defineProps(), {
  search: true,
})
const connectionState = useState<ConnectionState>('connectionState', () => ({
    isConnected: false,
    wsState: null,
    error: '',
  }))
</script>

<template>
  <div
    class="ltablet:z-30 border-muted-200 dark:border-muted-800 dark:bg-muted-950 relative flex h-16 w-full items-center justify-between border-b bg-white px-4 lg:z-30"
    :class="mobileOpen ? 'z-20' : 'z-30'"
  >
    <div class="flex w-1/2 items-center gap-2 sm:w-1/5">
      <!-- Hamburger -->
      <button
        class="ltablet:hidden relative flex size-10 items-center justify-center lg:hidden"
        @click="mobileOpen = !mobileOpen"
      >
        <div
          class="start-6 top-1/2 block w-4 -translate-x-1/2 -translate-y-1/2"
        >
          <span
            class="text-primary-500 absolute block h-0.5 w-6 bg-current transition duration-500 ease-in-out"
            :class="mobileOpen ? 'rotate-45' : '-translate-y-2'"
          />
          <span
            class="text-primary-500 absolute block h-0.5 w-5 bg-current transition duration-500 ease-in-out"
            :class="mobileOpen ? 'opacity-0' : ''"
          />
          <span
            class="text-primary-500 absolute block h-0.5 w-6 bg-current transition duration-500 ease-in-out"
            :class="mobileOpen ? '-rotate-45' : 'translate-y-2'"
          />
        </div>
      </button>
      <div  class="flex w-1/2 items-center justify-end gap-4 sm:w-1/5 ml-4" >
      <AssistantMenu horizontal />
    </div>
    </div>
    <div
      class="ltablet:max-w-sm mx-auto hidden max-w-xs grow sm:block lg:max-w-xl"
      v-if="props.search"
    >
      <FormInput
        v-model="searchMessages"
        rounded="lg"
        icon="lucide:search"
        placeholder="Search messages..."
        :classes="{
          input: '!h-11 !ps-11',
          icon: '!h-11 !w-11',
        }"
      />
    </div>
    <div class="flex w-1/2 items-center justify-end gap-4 sm:w-1/5">
      <button
        type="button"
        class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-100"
        @click="toggleReadText"
      >
        <Icon name="ph:book-open" size="20" :class="readText ? 'text-green-500' : 'text-muted-400'" />
      </button>
        <button
        type="button"
        class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-100"
       @click="selectConversation(selectedConversation?.id)"
      >
        <Icon name="mdi:connection" size="20" :class="connectionState.isConnected ? 'text-green-500' : 'text-red-500'" />
      </button>
        <button
        type="button"
        class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-100"
        @click="toggleAssistant"
      >
        <Icon name="ph:x" size="20" />
      </button>
    </div>
  </div>
</template>
