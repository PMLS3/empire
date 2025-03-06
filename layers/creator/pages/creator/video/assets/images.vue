<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useStorage } from '../../composables/useStorage';
import { useToaster } from '../../../shared/composables/toaster';

const { listAssets, deleteAsset } = useStorage();
const toaster = useToaster();

const loading = ref(true);
const images = ref([]);
const selectedImage = ref(null);
const viewMode = ref('grid'); // 'grid' or 'list'

// Filter and sort state
const searchQuery = ref('');
const sortBy = ref('date');
const sortOptions = [
  { value: 'date', label: 'Date (Newest First)' },
  { value: 'date-asc', label: 'Date (Oldest First)' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'size', label: 'Size (Largest First)' },
  { value: 'size-asc', label: 'Size (Smallest First)' },
];

// Load image assets
const loadImages = async () => {
  loading.value = true;
  
  try {
    const result = await listAssets('all', { type: 'image' });
    images.value = result;
  } catch (error) {
    console.error('Error loading images:', error);
    toaster.show({
      title: 'Error',
      message: 'Failed to load images',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    loading.value = false;
  }
};

// Filtered and sorted images
const filteredImages = computed(() => {
  let result = [...images.value];
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(image => 
      image.metadata.originalName?.toLowerCase().includes(query) ||
      image.metadata.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  // Sort
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'date':
        return new Date(b.metadata.createdAt || 0).getTime() - new Date(a.metadata.createdAt || 0).getTime();
      case 'date-asc':
        return new Date(a.metadata.createdAt || 0).getTime() - new Date(b.metadata.createdAt || 0).getTime();
      case 'name':
        return (a.metadata.originalName || '').localeCompare(b.metadata.originalName || '');
      case 'name-desc':
        return (b.metadata.originalName || '').localeCompare(a.metadata.originalName || '');
      case 'size':
        return (b.metadata.size || 0) - (a.metadata.size || 0);
      case 'size-asc':
        return (a.metadata.size || 0) - (b.metadata.size || 0);
      default:
        return 0;
    }
  });
  
  return result;
});

// View image details
const viewImageDetails = (image) => {
  selectedImage.value = image;
};

// Format file size
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Delete image
const confirmDeleteImage = async (image) => {
  if (confirm(`Are you sure you want to delete "${image.metadata.originalName}"?`)) {
    try {
      await deleteAsset(image.path);
      images.value = images.value.filter(img => img.path !== image.path);
      
      if (selectedImage.value?.path === image.path) {
        selectedImage.value = null;
      }
      
      toaster.show({
        title: 'Success',
        message: 'Image deleted successfully',
        color: 'success',
        icon: 'ph:check-circle-duotone',
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toaster.show({
        title: 'Error',
        message: 'Failed to delete image',
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
      });
    }
  }
};

onMounted(loadImages);
</script>

<template>
  <div>
    <BasePageTitle title="Image Library" subtitle="Manage your image assets" />
    
    <!-- Filters and Controls -->
    <div class="flex flex-wrap gap-4 items-center justify-between mb-6">
      <div class="flex flex-wrap gap-3 items-center">
        <BaseSelect v-model="sortBy" class="w-48" size="sm">
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </BaseSelect>
        
        <!-- View mode toggle -->
        <div class="flex rounded-md overflow-hidden border border-muted-200 dark:border-muted-700">
          <button 
            class="px-2 py-1 flex items-center justify-center"
            :class="viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-muted-100 dark:bg-muted-800 text-muted-500'"
            @click="viewMode = 'grid'"
          >
            <Icon name="ph:grid-four-duotone" class="size-4" />
          </button>
          <button 
            class="px-2 py-1 flex items-center justify-center"
            :class="viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-muted-100 dark:bg-muted-800 text-muted-500'"
            @click="viewMode = 'list'"
          >
            <Icon name="ph:list-bullets-duotone" class="size-4" />
          </button>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-3 items-center">
        <BaseInput
          v-model="searchQuery"
          placeholder="Search images..."
          icon="ph:magnifying-glass-duotone"
          size="sm"
          class="w-48"
        />
        
        <BaseButton color="primary" size="sm" as="nuxt-link" to="/creator/assets/upload">
          <Icon name="ph:plus-duotone" class="me-1" />
          Upload Images
        </BaseButton>
      </div>
    </div>
    
    <!-- Loading state -->
    <BasePlaceholderPage
      v-if="loading"
      title="Loading images"
      subtitle="Please wait while we load your image library"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <!-- Empty state -->
    <div v-else-if="filteredImages.length === 0" class="py-12 text-center">
      <div class="mb-4">
        <Icon name="ph:image-duotone" class="size-16 mx-auto text-muted-400" />
      </div>
      <BaseHeading size="sm" weight="medium" class="mb-2">No Images Found</BaseHeading>
      <BaseText class="mb-6">Upload images to enhance your video projects.</BaseText>
      <NuxtLink to="/creator/assets/upload" class="inline-block">
        <BaseButton color="primary">
          <Icon name="ph:upload-simple-duotone" class="me-2" />
          Upload Images
        </BaseButton>
      </NuxtLink>
    </div>
    
    <!-- Grid view -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      <div
        v-for="image in filteredImages"
        :key="image.path"
        class="relative border border-muted-200 dark:border-muted-700 rounded-lg overflow-hidden group"
        @click="viewImageDetails(image)"
      >
        <!-- Image thumbnail -->
        <div class="aspect-square bg-muted-100 dark:bg-muted-900 overflow-hidden">
          <img 
            v-if="image.url" 
            :src="image.url" 
            :alt="image.metadata.originalName || ''" 
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-muted-400">
            <Icon name="ph:image-duotone" class="size-10" />
          </div>
        </div>
        
        <!-- Image info -->
        <div class="p-2">
          <div class="text-xs font-medium truncate">{{ image.metadata.originalName || 'Unnamed image' }}</div>
          <div class="text-xs text-muted-500">{{ formatFileSize(image.metadata.size) }}</div>
        </div>
        
        <!-- Hover actions -->
        <div class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="flex gap-2">
            <BaseButton size="xs" color="primary" @click.stop="viewImageDetails(image)">
              <Icon name="ph:eye-duotone" class="size-3.5" />
            </BaseButton>
            <BaseButton size="xs" color="default" as="a" :href="image.url" download target="_blank" @click.stop>
              <Icon name="ph:download-simple-duotone" class="size-3.5" />
            </BaseButton>
            <BaseButton size="xs" color="danger" @click.stop="confirmDeleteImage(image)">
              <Icon name="ph:trash-duotone" class="size-3.5" />
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
    
    <!-- List view -->
    <BaseCard v-else>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-muted-200 dark:border-muted-700">
              <th class="text-left py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Image</th>
              <th class="text-left py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Name</th>
              <th class="text-left py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Size</th>
              <th class="text-left py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Date Added</th>
              <th class="text-center py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="image in filteredImages" :key="image.path" class="border-b border-muted-200 dark:border-muted-700 hover:bg-muted-50 dark:hover:bg-muted-800/40">
              <td class="py-3 px-4">
                <div class="size-12 rounded overflow-hidden bg-muted-100 dark:bg-muted-900">
                  <img v-if="image.url" :src="image.url" class="w-full h-full object-cover" alt="" />
                  <div v-else class="w-full h-full flex items-center justify-center text-muted-400">
                    <Icon name="ph:image-duotone" class="size-6" />
                  </div>
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="font-medium truncate max-w-xs">{{ image.metadata.originalName || 'Unnamed image' }}</div>
                <div class="text-xs text-muted-500">
                  {{ image.metadata.tags?.join(', ') || 'No tags' }}
                </div>
              </td>
              <td class="py-3 px-4 text-muted-500">{{ formatFileSize(image.metadata.size) }}</td>
              <td class="py-3 px-4 text-muted-500">{{ new Date(image.metadata.createdAt).toLocaleDateString() }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center justify-center gap-2">
                  <BaseButton size="xs" color="primary" @click="viewImageDetails(image)">
                    <Icon name="ph:eye-duotone" class="size-3.5" />
                  </BaseButton>
                  <BaseButton size="xs" color="default" as="a" :href="image.url" download>
                    <Icon name="ph:download-simple-duotone" class="size-3.5" />
                  </BaseButton>
                  <BaseButton size="xs" color="danger" @click="confirmDeleteImage(image)">
                    <Icon name="ph:trash-duotone" class="size-3.5" />
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>
    
    <!-- Image Preview Modal -->
    <BaseModal
      :open="!!selectedImage"
      size="lg"
      @close="selectedImage = null"
    >
      <template #header>
        <BaseHeading size="sm" weight="medium">
          {{ selectedImage?.metadata.originalName || 'Image Preview' }}
        </BaseHeading>
      </template>
      
      <div v-if="selectedImage">
        <div class="flex flex-col">
          <!-- Image Preview -->
          <div class="mb-4 bg-muted-100 dark:bg-muted-900 rounded-lg flex items-center justify-center p-2">
            <img 
              :src="selectedImage.url" 
              :alt="selectedImage.metadata.originalName || ''"
              class="max-w-full max-h-[60vh] object-contain rounded"
            />
          </div>
          
          <!-- Image Details -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <BaseHeading size="xs" weight="medium" class="mb-2">Image Details</BaseHeading>
              
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-500">File name:</span>
                  <span>{{ selectedImage.metadata.originalName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-500">Size:</span>
                  <span>{{ formatFileSize(selectedImage.metadata.size) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-500">Dimensions:</span>
                  <span>{{ selectedImage.metadata.width || '?' }}x{{ selectedImage.metadata.height || '?' }}px</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-500">Date added:</span>
                  <span>{{ new Date(selectedImage.metadata.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
            
            <div>
              <BaseHeading size="xs" weight="medium" class="mb-2">Actions</BaseHeading>
              
              <div class="space-y-2">
                <BaseButton block size="sm" as="a" :href="selectedImage.url" download>
                  <Icon name="ph:download-simple-duotone" class="me-2" />
                  Download
                </BaseButton>
                
                <BaseButton block size="sm" color="danger" @click="confirmDeleteImage(selectedImage)">
                  <Icon name="ph:trash-duotone" class="me-2" />
                  Delete
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>
