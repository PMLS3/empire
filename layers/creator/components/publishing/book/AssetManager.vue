<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Upload } from '~/types/uploads'
import { useUploads } from '~/layers/shared/composables/useUploads'
import { useBookStorage } from '../../../composables/useBookStorage'

const props = defineProps<{
  isOpen: boolean
  bookId?: string
  filter?: string[]
}>()

const emit = defineEmits(['close', 'select', 'upload-complete'])

// Common image formats with MIME types
const IMAGE_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'image/webp'
]

// Get the uploads system
const { 
  uploadsItems, 
  filteredItems, 
  filteredFolders,
  uploadsFolders,
  selectedFolders,
  loadData,
  createFolder,
  deleteUpload,
  deleteFolder
} = useUploads()

// Get the book storage system
const { getBookAssets, addBookAsset } = useBookStorage()

// Local state
const searchQuery = ref('')
const isLoading = ref(false)
const showUploadArea = ref(false)
const bookSpecificAssets = ref<Upload[]>([])
const activeTab = ref<'all' | 'book'>('all')

// Computed properties
const displayItems = computed(() => {
  let items = activeTab.value === 'all' ? filteredItems.value : bookSpecificAssets.value
  
  // Filter by format if specified
  if (props.filter && props.filter.length > 0) {
    items = items.filter(item => {
      if (props.filter?.includes('image')) {
        return IMAGE_FORMATS.includes(item.type)
      }
      // Add more format filters as needed
      return true
    })
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => 
      item.name.toLowerCase().includes(query) || 
      (item.understanding?.summary && item.understanding.summary.toLowerCase().includes(query))
    )
  }
  
  return items
})

// Load data for the asset manager
const loadAssetData = async () => {
  isLoading.value = true
  
  try {
    // Load general uploads
    await loadData()
    
    // Load book-specific assets if a book ID is provided
    if (props.bookId) {
      const assets = await getBookAssets(props.bookId)
      bookSpecificAssets.value = assets
    }
  } catch (error) {
    console.error('Failed to load asset data:', error)
  } finally {
    isLoading.value = false
  }
}

// Handle selection of an asset
const selectAsset = async (asset: Upload) => {
  // If asset is not already in the book's assets, add it
  if (props.bookId && activeTab.value === 'all') {
    try {
      await addBookAsset(props.bookId, asset)
      // Refresh book-specific assets
      const assets = await getBookAssets(props.bookId)
      bookSpecificAssets.value = assets
    } catch (error) {
      console.error('Failed to add asset to book:', error)
    }
  }
  
  // Emit selection event
  emit('select', asset)
  emit('close')
}

// Handle upload completion
const handleUploadComplete = async (result: any) => {
  // Hide the upload area after upload is complete
  showUploadArea.value = false
  
  // If a book ID is provided, add the uploaded assets to the book
  if (props.bookId && result.files) {
    for (const file of result.files) {
      try {
        await addBookAsset(props.bookId, file)
      } catch (error) {
        console.error('Failed to add uploaded asset to book:', error)
      }
    }
    
    // Refresh book-specific assets
    const assets = await getBookAssets(props.bookId)
    bookSpecificAssets.value = assets
  }
  
  // Emit upload complete event
  emit('upload-complete', result.files)
}

// Create a new folder in the current directory
const handleCreateFolder = async (name: string) => {
  const parentId = selectedFolders.value.length > 0 
    ? selectedFolders.value[selectedFolders.value.length - 1].id 
    : null
  await createFolder(name, parentId)
}

// Load data when component is mounted
onMounted(() => {
  loadAssetData()
})
</script>

<template>
  <Modal
    :open="isOpen"
    size="xl"
    @close="emit('close')"
    title="Asset Manager"
  >
    <div class="p-4">
      <!-- Top Controls -->
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <!-- Search input -->
          <FormInput
            v-model="searchQuery"
            icon="ph:magnifying-glass-bold"
            placeholder="Search assets..."
            class="w-64"
          />
          
          <!-- Upload button -->
          <BaseButton 
            color="primary"
            @click="showUploadArea = !showUploadArea"
          >
            <Icon name="ph:upload-bold" class="mr-2 h-4 w-4" />
            Upload Files
          </BaseButton>
          
          <!-- Create folder button -->
          <BaseButton 
            color="muted"
            @click="$refs.createFolderModal.open()"
          >
            <Icon name="ph:folder-plus-bold" class="mr-2 h-4 w-4" />
            New Folder
          </BaseButton>
        </div>
        
        <!-- Tabs -->
        <div v-if="props.bookId" class="flex items-center gap-2">
          <BaseButton 
            :color="activeTab === 'all' ? 'primary' : 'muted'"
            @click="activeTab = 'all'"
          >
            All Assets
          </BaseButton>
          <BaseButton 
            :color="activeTab === 'book' ? 'primary' : 'muted'"
            @click="activeTab = 'book'"
          >
            Book Assets
          </BaseButton>
        </div>
      </div>
      
      <!-- Upload Area -->
      <div v-if="showUploadArea" class="mb-6">
        <h3 class="mb-2 text-lg font-medium">Upload Files</h3>
        <UploadsArea @uploaded="handleUploadComplete" />
      </div>
      
      <!-- Breadcrumb (only visible in All Assets tab) -->
      <div v-if="activeTab === 'all' && selectedFolders.length" class="mb-4 flex items-center gap-2">
        <button 
          class="text-gray-500 hover:text-primary-500"
          @click="selectedFolders.length = 0"
        >
          Root
        </button>
        <template v-for="(folder, index) in selectedFolders" :key="folder.id">
          <Icon name="ph:chevron-right-bold" class="h-4 w-4 text-gray-300" />
          <button 
            class="text-gray-500 hover:text-primary-500"
            @click="selectedFolders.length = index + 1"
          >
            {{ folder.name }}
          </button>
        </template>
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
      
      <!-- Folders (only visible in All Assets tab) -->
      <div v-else-if="activeTab === 'all' && filteredFolders.length" class="mb-6">
        <h3 class="mb-2 text-lg font-medium">Folders</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <UploadsFolderList 
            :folders="filteredFolders"
            @select="folder => selectedFolders.push(folder)"
            @delete="deleteFolder"
          />
        </div>
      </div>
      
      <!-- Assets -->
      <div v-if="displayItems.length" class="mb-6">
        <h3 class="mb-2 text-lg font-medium">
          {{ activeTab === 'all' ? 'Files' : 'Book Assets' }}
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="asset in displayItems"
            :key="asset.id"
            class="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            @click="selectAsset(asset)"
          >
            <!-- Image preview for image files -->
            <div 
              v-if="IMAGE_FORMATS.includes(asset.type)"
              class="h-40 bg-gray-100 flex items-center justify-center"
            >
              <img
                :src="asset.url"
                :alt="asset.name"
                class="max-h-full max-w-full object-contain"
              />
            </div>
            
            <!-- Generic file icon for non-image files -->
            <div 
              v-else
              class="h-40 bg-gray-100 flex items-center justify-center"
            >
              <Icon 
                :name="
                  asset.type.includes('pdf') ? 'ph:file-pdf-bold' :
                  asset.type.includes('audio') ? 'ph:file-audio-bold' :
                  asset.type.includes('video') ? 'ph:file-video-bold' :
                  'ph:file-bold'
                "
                class="h-16 w-16 text-gray-400"
              />
            </div>
            
            <!-- File info -->
            <div class="p-3">
              <h4 class="font-medium text-sm text-gray-800 truncate">
                {{ asset.name }}
              </h4>
              <p class="text-xs text-gray-500">
                {{ new Date(asset.created_at).toLocaleDateString() }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="!isLoading" class="py-8 text-center">
        <Icon name="ph:folder-open-bold" class="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-700 mb-2">No assets found</h3>
        <p class="text-gray-500">
          {{ activeTab === 'all' 
            ? 'Upload files or create folders to get started.' 
            : 'Add assets to this book by selecting them from the "All Assets" tab.' 
          }}
        </p>
      </div>
    </div>
  </Modal>
  
  <!-- Create Folder Modal -->
  <UploadsFolderCreate 
    ref="createFolderModal"
    @create="handleCreateFolder"
  />
</template>

<style scoped>
.asset-thumbnail {
  height: 150px;
  object-fit: cover;
}

.asset-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.asset-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}
</style>