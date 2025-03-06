<script lang="ts" setup>
const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'upload'])
</script>

<template>
  <Modal
    :open="isOpen"
    size="2xl"
    footer-align="start"
    @close="emit('close')"
  >
    <template #header>
      <div class="flex w-full items-center justify-between p-4 md:p-6">
        <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
          Upload Image
        </h3>
        <BaseButtonClose @click="emit('close')" />
      </div>
    </template>

    <div>
      <FileManager @input="(image) => emit('upload', image)" />
    </div>
  </Modal>
</template>
