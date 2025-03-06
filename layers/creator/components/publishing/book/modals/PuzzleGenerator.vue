<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', puzzle: any): void
}>()

const handleCreate = (puzzle: any) => {
  console.log('handleCreate', puzzle)
  emit('create', puzzle)
  emit('close')
}
</script>

<template>
  <Modal
    :open="open"
    size="7xl"
    footer-align="start"
    @close="emit('close')"
  >
    <template #header>
      <div class="flex w-full items-center justify-between">
        <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
          <!-- Create Puzzle -->
        </h3>
        <BaseButtonClose @click="emit('close')" />
      </div>
    </template>

    <div class="flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
      <PublishingPuzzlesPuzzleGenerator @create="handleCreate" />
      <AssistantCircularChat />
      <AssistantPanel />
    </div>
  </Modal>
</template>
