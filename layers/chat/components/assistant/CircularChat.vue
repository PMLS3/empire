<script setup lang="ts">
const { toggleAssistant } = useAssistant()

const handleClick = () => {
  toggleAssistant()
}
</script>

<template>
  <div class="fixed bottom-6 end-6 z-[90]">
    <button
      type="button"
      class="bg-primary-500 shadow-primary-500/50 dark:shadow-muted-800/10 relative z-30 flex size-14 items-center justify-center rounded-full text-white shadow-lg hover:bg-primary-600 transition-all duration-300"
      @click="handleClick"
    >
      <Icon name="ph:chat-circle-dots-fill" size="24" />
    </button>
  </div>
</template>
