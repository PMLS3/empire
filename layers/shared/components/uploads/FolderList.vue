<script setup lang="ts">
interface Folder {
  id: string
  name: string
  created_at: string
  updated_at: string
  shared: boolean
  owner_id: string
  workspace_id: string
  parent_id: string | null
}

const props = defineProps<{
  folders: Folder[]
}>()

const emit = defineEmits<{
  select: [folder: Folder]
  delete: [id: string]
}>()
</script>

<template>
    <BaseCard
      v-for="folder in folders"
      :key="folder.id"
      rounded="lg"
      elevated-hover
      class="hover:!border-primary-500"
    >
      <div class="p-5">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Icon name="lucide:folder" class="text-primary-500 size-6" />
            <BaseHeading tag="h5" size="sm" weight="medium" class="line-clamp-1">
              {{ folder.name }}
            </BaseHeading>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="folder.shared"
              class="text-muted-400 hover:text-primary-500"
              data-nui-tooltip="Shared folder"
            >
              <Icon name="lucide:users" class="size-4" />
            </button>
            <button
              class="text-muted-400 hover:text-primary-500"
              data-nui-tooltip="Delete folder"
              @click="emit('delete', folder.id)"
            >
              <Icon name="lucide:trash-2" class="size-4" />
            </button>
          </div>
        </div>
        <div class="text-muted-400 font-sans text-xs">
          Created {{ new Date(folder.created_at).toLocaleDateString() }}
        </div>
      </div>
      <div
        class="border-muted-200 dark:border-muted-700 bg-muted-50 dark:bg-muted-800 flex items-center justify-between rounded-b-xl border-t p-3"
      >
        <button
          class="text-muted-500 hover:text-primary-500 flex items-center gap-1 text-sm"
          @click="emit('select', folder)"
        >
          <Icon name="lucide:folder-open" class="size-4" />
          <span>Open</span>
        </button>
      </div>
    </BaseCard>
</template> 