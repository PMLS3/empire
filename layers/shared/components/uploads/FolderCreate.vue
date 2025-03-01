# Create new file
<script setup lang="ts">
const emit = defineEmits<{
  close: []
  create: [name: string]
}>()

const folderName = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  if (!folderName.value.trim()) return
  
  isSubmitting.value = true
  try {
    await emit('create', folderName.value.trim())
    folderName.value = ''
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Modal :open="true" size="sm" @close="emit('close')">
    <template #header>
      <!-- Header -->
      <div class="flex w-full items-center justify-between p-4 md:p-2">
        <h3
          class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
        >
          New Folder
        </h3>

        <BaseButtonClose @click="emit('close')" />
      </div>
    </template>
    <div
      class="nui-slimscroll max-h-[550px] overflow-y-auto px-4 pb-4 md:px-6"
    >
    <form  @submit.prevent="handleSubmit">
      <FormInput
        v-model="folderName"
        label="Folder Name"
        placeholder="Enter folder name"
        required
        autofocus
        />
      </form>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 p-4 md:p-6">
        <BaseButton variant="outline" @click="emit('close')" color="warning">
          Cancel
        </BaseButton>
        <BaseButton
          :loading="isSubmitting"
          :disabled="!folderName.trim()"
          @click="handleSubmit"
          color="primary"
        >
          Create Folder
        </BaseButton>
      </div>
    </template>
  </Modal>
</template> 