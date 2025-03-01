<script setup lang="ts">
import { formatFileSize } from '~/utils/format'

interface Upload {
  id: string
  name: string
  type: string
  size: number
  url: string
  thumbnail_url?: string
  created_at: string
  updated_at: string
  owner_id: string
  workspace_id: string
  folder_id: string | null
  shared: boolean
  understanding?: {
    summary?: string
    content_type?: string
    chunks?: string[]
  }
}

const props = defineProps<{
  items: Upload[]
}>()

const emit = defineEmits<{
  delete: [id: string]
  share: [item: Upload]
}>()

function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return 'lucide:image'
  if (type.startsWith('video/')) return 'lucide:video'
  if (type.startsWith('audio/')) return 'lucide:music'
  if (type.includes('pdf')) return 'lucide:file-text'
  if (type.includes('word')) return 'lucide:file-type-word'
  if (type.includes('sheet') || type.includes('excel')) return 'lucide:file-type-excel'
  if (type.includes('presentation') || type.includes('powerpoint')) return 'lucide:file-type-powerpoint'
  return 'lucide:file'
}
</script>

<template>
    <BaseCard
      v-for="item in items"
      :key="item.id"
      rounded="lg"
      elevated-hover
      class="hover:!border-primary-500"
    >
      <div class="p-5">
        <div class="relative mb-4">
          <img
            v-if="item.type.startsWith('image/')"
            :src="item.thumbnail_url || item.url"
            :alt="item.name"
            class="aspect-video w-full rounded-lg object-cover"
          >
          <div
            v-else
            class="bg-muted-100 dark:bg-muted-700 flex aspect-video w-full items-center justify-center rounded-lg"
          >
            <Icon :name="getFileIcon(item.type)" class="text-primary-500 size-12" />
          </div>
        </div>
        <div class="mb-4">
          <BaseHeading tag="h5" size="sm" weight="medium" class="line-clamp-1">
            {{ item.name }}
          </BaseHeading>
          <div class="text-muted-400 flex items-center gap-2 text-xs">
            <span>{{ formatFileSize(item.size) }}</span>
            <span>•</span>
            <span>{{ new Date(item.created_at).toLocaleDateString() }}</span>
          </div>
        </div>
        <div v-if="item.understanding?.summary" class="mb-4">
          <p class="text-muted-500 line-clamp-2 text-sm">
            {{ item.understanding.summary }}
          </p>
        </div>
      </div>
      <div
        class="border-muted-200 dark:border-muted-700 bg-muted-50 dark:bg-muted-800 flex items-center justify-between rounded-b-xl border-t p-3"
      >
        <a
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-muted-500 hover:text-primary-500 flex items-center gap-1 text-sm"
        >
          <Icon name="lucide:external-link" class="size-4" />
          <span>Open</span>
        </a>
        <div class="flex items-center gap-2">
          <button
            v-if="item.shared"
            class="text-muted-400 hover:text-primary-500"
            data-nui-tooltip="Shared"
            @click="emit('share', item)"
          >
            <Icon name="lucide:users" class="size-4" />
          </button>
          <button
            class="text-muted-400 hover:text-primary-500"
            data-nui-tooltip="Use"
            @click="emit('use', item)"
          >
            <Icon name="lucide:file-text" class="size-4" />
          </button>
          <button
            class="text-muted-400 hover:text-primary-500"
            data-nui-tooltip="Share"
            @click="emit('share', item)"
          >
            <Icon name="lucide:share-2" class="size-4" />
          </button>
          <button
            class="text-muted-400 hover:text-danger-500"
            data-nui-tooltip="Delete"
            @click="emit('delete', item.id)"
          >
            <Icon name="lucide:trash-2" class="size-4" />
          </button>
        </div>
      </div>
    </BaseCard>
</template> 