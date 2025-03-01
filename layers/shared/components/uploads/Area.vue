<script setup lang="ts">
import { formatFileSize } from '../../utils/format-files'

const props = defineProps({
  accept: {
    type: String,
    default: 'audio/*,image/*,video/*,application/pdf,application/vnd.openxmlformats-officedocument.*,application/vnd.ms-*,application/vnd.oasis.opendocument.*',
  },
  multiple: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['uploaded'])
const { upload, uploadProgress } = useUploads()
const files = ref<any[]>([])
const isDragover = ref(false)

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  createFiles(target.files)
}

function handleDrop(e: DragEvent) {
  isDragover.value = false
  e.stopPropagation()
  e.preventDefault()
  const droppedFiles = e.dataTransfer?.files
  if (!droppedFiles?.length) return
  createFiles(droppedFiles)
}

function createFiles(fileList: FileList) {
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i]
    const reader = new FileReader()
    reader.onload = (e) => {
      files.value.push({
        name: file.name,
        src: e.target?.result,
        file,
        type: file.type,
        size: file.size,
      })
    }
    reader.readAsDataURL(file)
  }
}

async function uploadFiles() {
  try {
    const fileObjects = files.value.map(f => f.file)
    const result = await upload(fileObjects)
    emit('uploaded', result)
    files.value = []
  } catch (error) {
    console.error('Upload failed:', error)
  }
}

function removeFile(index: number) {
  files.value.splice(index, 1)
}

onBeforeUnmount(() => {
  files.value = []
})
</script>

<template>
  <div>
    <!-- Controls -->
    <div class="mb-4 flex items-center gap-2">
      <button
        type="button"
        class="nui-focus border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-800 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
        data-nui-tooltip="Select files"
        @click="$refs.fileInput.click()"
      >
        <Icon
          name="lucide:plus"
          class="absolute start-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2"
        />
        <span class="sr-only">Select files</span>
      </button>
      <button
        type="button"
        class="nui-focus border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-800 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
        data-nui-tooltip="Start Upload"
        @click="uploadFiles"
      >
        <Icon name="lucide:arrow-up" class="size-4" />
        <span class="sr-only">Start Upload</span>
      </button>
      <input
        ref="fileInput"
        class="hidden"
        type="file"
        :accept="accept"
        :multiple="multiple"
        @change="handleFileChange"
      >
    </div>

    <div
      class="relative"
      :class="{ 'border-primary-500': isDragover }"
      @dragenter.prevent="isDragover = true"
      @dragleave.prevent="isDragover = false"
      @dragover.prevent
      @drop="handleDrop"
    >
      <div
        v-if="!files.length"
        class="nui-focus border-muted-300 dark:border-muted-700 hover:border-muted-400 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed p-8 transition-colors duration-300"
        tabindex="0"
        role="button"
        @click="$refs.fileInput.click()"
        @keydown.enter.prevent="$refs.fileInput.click()"
      >
        <div class="p-5 text-center">
          <Icon
            name="mdi-light:cloud-upload"
            class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 size-10 transition-colors duration-300"
          />
          <h4 class="text-muted-400 font-sans text-sm">
            Drop files to upload
          </h4>
          <div>
            <span class="text-muted-400 font-sans text-[0.7rem] font-semibold uppercase">
              Or
            </span>
          </div>
          <span class="text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300">
            Select files
          </span>
        </div>
      </div>

      <ul v-else class="mt-6 space-y-2">
        <li v-for="(file, index) in files" :key="file.name">
          <div class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-between gap-2 rounded-xl border bg-white p-3">
            <div class="flex items-center gap-2">
              <div class="shrink-0">
                <img
                  v-if="file.type.startsWith('image')"
                  class="size-14 rounded-xl object-cover object-center"
                  :src="file.src"
                  alt="File preview"
                >
                <img
                  v-else
                  class="size-14 rounded-xl object-cover object-center"
                  src="/img/avatars/placeholder-file.png"
                  alt="File preview"
                >
              </div>
              <div class="font-sans">
                <span class="text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm">
                  {{ file.name }}
                </span>
                <span class="text-muted-400 block text-xs">
                  {{ formatFileSize(file.size) }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <div
                class="w-32 px-4 transition-opacity duration-300"
                :class="uploadProgress[file.name] ? 'opacity-100' : 'opacity-0'"
              >
                <BaseProgress
                  :value="uploadProgress[file.name]?.progress || 0"
                  size="xs"
                  :color="uploadProgress[file.name]?.status === 'error' ? 'danger' : 'success'"
                />
              </div>
              <button
                class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                type="button"
                data-nui-tooltip="Upload"
                @click="upload([file.file])"
              >
                <Icon name="lucide:arrow-up" class="size-4" />
                <span class="sr-only">Upload</span>
              </button>
              <button
                class="border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex size-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300"
                type="button"
                data-nui-tooltip="Remove"
                @click.prevent="removeFile(index)"
              >
                <Icon name="lucide:x" class="size-4" />
                <span class="sr-only">Remove</span>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template> 