<script setup lang="ts">

  const { 
    uploadsItems, 
    uploadsFolders,
    selectedFolders,
    filteredItems,
    filteredFolders,
    createFolder,
    deleteUpload,
    deleteFolder,
    loadData
  } = useUploads()

  const showCreateFolder = ref(false)
  const showShareModal = ref(false)
  const selectedItem = ref<Upload | null>(null)

  const filter = ref("")
  const perPage = ref(25)

  // Load data on mount
  onMounted(async () => {
    try {
      await loadData()
    } catch (error) {
      console.error('Failed to load uploads data:', error)
    }
  })

  // Stats
  const stats = computed(() => ({
    total: filteredItems.value.length,
    folders: filteredFolders.value.length,
    shared: filteredItems.value.filter((item: any) => item.shared).length
  }))

  const selectedFolder = computed(() => {
    if (selectedFolders.value.length === 0) return null
    return selectedFolders.value[selectedFolders.value.length - 1]
  })

  // Handle folder creation
  async function handleCreateFolder(name: string) {
    try {
      const parentId = selectedFolders.value.length > 0 
        ? selectedFolders.value[selectedFolders.value.length - 1].id 
        : null
      await createFolder(name, parentId)
      showCreateFolder.value = false
    } catch (error) {
      console.error('Failed to create folder:', error)
    }
  }

  // Handle sharing
  function handleShare(item: Upload) {
    selectedItem.value = item
    showShareModal.value = true
  }

  const emit: any = getCurrentInstance()?.emit
  // Handle using
  function handleUse(item: Upload) {
    selectedItem.value = item
    emit('use', item)
  }

  const showUploadFiles = ref(false)
</script>

<template>
  <div>
    <ContentWrapper>
      <template #left>
        <div class="flex items-center gap-2">
          <FormInput
            v-model="filter"
            icon="lucide:search"
            rounded="lg"
            placeholder="Search files..."
            :classes="{
              wrapper: 'w-full sm:w-auto',
            }"
          />
          <BaseButton @click="showCreateFolder = !showCreateFolder">
            <Icon name="lucide:folder-plus" class="size-4" />
            <!-- <span>New Folder</span> -->
          </BaseButton>
          <BaseButton @click="showUploadFiles = !showUploadFiles">
            <Icon name="lucide:upload" class="size-4" />
            <!-- <span>Upload Files</span> -->
          </BaseButton>
        </div>
      </template>
      <template #right>
        <BaseCard rounded="lg" class="min-w-[340px]">
          <div class="grid grid-cols-3 p-4">
            <div class="relative flex flex-col text-center">
              <span class="text-muted-800 dark:text-muted-100 font-sans text-2xl font-bold">
                {{ stats.total }}
              </span>
              <p class="text-muted-400 font-sans text-xs">Total Files</p>
            </div>
            <div class="relative flex flex-col text-center">
              <span class="text-muted-800 dark:text-muted-100 font-sans text-2xl font-bold">
                {{ stats.folders }}
              </span>
              <p class="text-muted-400 font-sans text-xs">Folders</p>
            </div>
            <div class="relative flex flex-col text-center">
              <span class="text-muted-800 dark:text-muted-100 font-sans text-2xl font-bold">
                {{ stats.shared }}
              </span>
              <p class="text-muted-400 font-sans text-xs">Shared</p>
            </div>
          </div>
        </BaseCard>
      </template>

      <div class="space-y-6">
        <!-- Breadcrumb -->
        <div v-if="selectedFolders.length" class="flex items-center gap-2">
          <button 
            class="text-muted-500 hover:text-primary-500"
            @click="selectedFolders.length = 0"
          >
            Root
          </button>
          <template v-for="(folder, index) in selectedFolders" :key="folder.id">
            <Icon name="lucide:chevron-right" class="size-4 text-muted-300" />
            <button 
              class="text-muted-500 hover:text-primary-500"
              @click="selectedFolders.length = index + 1"
            >
              {{ folder.name }}
            </button>
          </template>
        </div>

        <!-- Upload Area -->
        <UploadsArea v-if="showUploadFiles" />

        <!-- Folders -->
        <div v-if="filteredFolders.length">
          <h4 class="text-muted-400 mb-4 font-sans text-xs font-semibold uppercase">
            Folders
          </h4>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <UploadsFolderList 
              :folders="filteredFolders"
              @select="(folder: UploadFolder) => selectedFolders.push(folder)"
              @delete="deleteFolder"
            />
          </div>
        </div>

        <!-- Files -->
        <div v-if="filteredItems.length">
          <h4 class="text-muted-400 mb-4 font-sans text-xs font-semibold uppercase">
            Files
          </h4>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <UploadsList 
              :items="filteredItems"
              @delete="deleteUpload"
              @share="handleShare"
              @use="handleUse"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!filteredItems.length && !filteredFolders.length">
          <BasePlaceholderPage
            title="No files yet"
            subtitle="Upload files or create folders to get started."
          >
            <template #image>
              <img
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
                alt="Empty state"
              />
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
                alt="Empty state"
              />
            </template>
          </BasePlaceholderPage>
        </div>
      </div>
    </ContentWrapper>

    <!-- Create Folder Modal -->
    <UploadsFolderCreate 
      v-if="showCreateFolder"
      @close="showCreateFolder = false"
      @create="handleCreateFolder"
    />

    <!-- Share Modal -->
    <UploadsShareModal
      v-if="showShareModal"
      :item="selectedItem"
      @close="showShareModal = false"
    />
  </div>
</template>
