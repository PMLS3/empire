<script setup lang="ts">

const { isAssistantOpen, toggleAssistant } = useAssistant()
</script>

<template>
  <div
    class="fixed end-0 top-0 z-[100] h-full w-screen max-w-[500px]  dark:bg-muted-800 shadow-lg transition-transform duration-300"
    :class="[isAssistantOpen ? 'translate-x-0' : 'translate-x-full']"
  >

    
    <div class="h-[calc(100%-4rem)]">
      <Assistant is-panel />
    </div>
  </div>
</template> 