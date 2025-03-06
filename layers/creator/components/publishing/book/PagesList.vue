<script lang="ts" setup>
interface Page {
  id: string
  type: 'cover' | 'content'
  name: string
  content?: string
  images?: string[]
  elements: Element[] // Add this line to include elements in the Page interface
}

const props = defineProps<{
  pages: Page[]
  selectedPage: Page
}>()

const emit = defineEmits(['add', 'select', 'remove'])
</script>

<template>
  <div class="w-64 border-r border-gray-200 dark:border-gray-800 h-full flex flex-col">
    <!-- Pages Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium">Pages {{pages.length}}</h3>
        <BaseButtonIcon
          @click="emit('add')"
          label="Add Page"
          class="w-full"
          data-nui-tooltip="Add Page"
            data-nui-tooltip-position="down"
        ><Icon name="i-heroicons-plus" class="h-4 w-4" /></BaseButtonIcon>
      </div>
    </div>
    <!-- Pages List -->
    <div class="flex-1 overflow-y-auto p-2 space-y-2">
      <BaseCard
        v-for="page in pages"
        :key="page.id"
        @click="emit('select', page)"
      >
      <div class="flex items-center justify-between p-2">
        <div class="absolute inset-0 flex items-center justify-center text-xs text-gray-500" :class="{ 'text-green-300': page.id === selectedPage.id }">
          {{ page.name }}
        </div>
        <BaseButtonIcon
          v-if="pages.length > 1 && page.type !== 'cover'"
          color="red"
          size="xs"
          @click.stop="emit('remove', page.id)"
        ><Icon name="i-heroicons-trash" class="h-4 w-4" /></BaseButtonIcon>
      </div>
        <PublishingBookPagePreview :page="page" :scale="0.1" />

      </BaseCard>
    </div>
  </div>
</template>
