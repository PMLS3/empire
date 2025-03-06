<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useStorage } from '../../composables/useStorage';
import { useToaster } from '../../../shared/composables/toaster';

const { listAssets, deleteAsset } = useStorage();
const toaster = useToaster();

const loading = ref(true);
const audioFiles = ref([]);
const selectedFile = ref(null);
const playerRef = ref(null);
const isPlaying = ref(false);
const currentAudio = ref(null);

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
  { value: 'duration', label: 'Duration (Longest First)' },
  { value: 'duration-asc', label: 'Duration (Shortest First)' },
];

// Load audio assets
const loadAudioFiles = async () => {
  loading.value = true;
  
  try {
    const result = await listAssets('all', { type: 'audio' });
    audioFiles.value = result;
  } catch (error) {
    console.error('Error loading audio files:', error);
    toaster.show({
      title: 'Error',
      message: 'Failed to load audio files',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    loading.value = false;
  }
};

// Filtered and sorted audio files
const filteredAudioFiles = computed(() => {
  let result = [...audioFiles.value];
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(file => 
      file.metadata.originalName?.toLowerCase().includes(query) ||
      file.metadata.tags?.some(tag => tag.toLowerCase().includes(query))
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
      case 'duration':
        return (b.metadata.duration || 0) - (a.metadata.duration || 0);
      case 'duration-asc':
        return (a.metadata.duration || 0) - (b.metadata.duration || 0);
      default:
        return 0;
    }
  });
  
  return result;
});

// Play audio file
const playAudio = (file) => {
  if (playerRef.value) {
    if (currentAudio.value === file && isPlaying.value) {
      // Pause current
      playerRef.value.pause();
      isPlaying.value = false;
    } else {
      // Play new or resume
      playerRef.value.src = file.url;
      playerRef.value.play();
      isPlaying.value = true;
      currentAudio.value = file;
    }
  }
};

// Format file size
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format duration
const formatDuration = (seconds) => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Delete audio file
const confirmDeleteFile = async (file) => {
  if (confirm(`Are you sure you want to delete "${file.metadata.originalName}"?`)) {
    try {
      await deleteAsset(file.path);
      audioFiles.value = audioFiles.value.filter(f => f.path !== file.path);
      
      if (currentAudio.value?.path === file.path) {
        playerRef.value.pause();
        isPlaying.value = false;
        currentAudio.value = null;
      }
      
      toaster.show({
        title: 'Success',
        message: 'Audio file deleted successfully',
        color: 'success',
        icon: 'ph:check-circle-duotone',
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toaster.show({
        title: 'Error',
        message: 'Failed to delete audio file',
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
      });
    }
  }
};

// Handle audio player events
const handleAudioEnded = () => {
  isPlaying.value = false;
};

onMounted(() => {
  loadAudioFiles();
  
  // Set up audio player events
  if (playerRef.value) {
    playerRef.value.addEventListener('ended', handleAudioEnded);
  }
});

onBeforeUnmount(() => {
  // Clean up audio player events
  if (playerRef.value) {
    playerRef.value.removeEventListener('ended', handleAudioEnded);
  }
});
</script>

<template>
  <div>
    <BasePageTitle title="Audio Library" subtitle="Manage your audio files" />
    
    <!-- Hidden audio player element -->
    <audio ref="playerRef" class="hidden" @ended="handleAudioEnded"></audio>
    
    <!-- Filters and Controls -->
    <div class="flex flex-wrap gap-4 items-center justify-between mb-6">
      <div class="flex flex-wrap gap-3 items-center">
        <BaseSelect v-model="sortBy" class="w-48" size="sm">
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </BaseSelect>
      </div>
      
      <div class="flex flex-wrap gap-3 items-center">
        <BaseInput
          v-model="searchQuery"
          placeholder="Search audio files..."
          icon="ph:magnifying-glass-duotone"
          size="sm"
          class="w-48"
        />
        
        <BaseButton color="primary" size="sm" as="nuxt-link" to="/creator/assets/upload">
          <Icon name="ph:plus-duotone" class="me-1" />
          Upload Audio
        </BaseButton>
      </div>
    </div>
    
    <!-- Loading state -->
    <BasePlaceholderPage
      v-if="loading"
      title="Loading audio files"
      subtitle="Please wait while we load your audio library"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <!-- Audio library list -->
    <template v-else>
      <div v-if="filteredAudioFiles.length === 0" class="py-12 text-center">
        <div class="mb-4">
          <Icon name="ph:music-notes-duotone" class="size-16 mx-auto text-muted-400" />
        </div>
        <BaseHeading size="sm" weight="medium" class="mb-2">No Audio Files Found</BaseHeading>
        <BaseText class="mb-6">Upload audio files to enhance your video projects.</BaseText>
        <NuxtLink to="/creator/assets/upload" class="inline-block">
          <BaseButton color="primary">
            <Icon name="ph:upload-simple-duotone" class="me-2" />
            Upload Audio
          </BaseButton>
        </NuxtLink>
      </div>
      
      <div v-else>
        <BaseCard>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-muted-200 dark:border-muted-700">
                  <th class="text-left py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Name</th>
                  <th class="text-left py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Duration</th>
                  <th class="text-left py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Size</th>
                  <th class="text-left py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Date Added</th>
                  <th class="text-center py-3 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="file in filteredAudioFiles" :key="file.path" class="border-b border-muted-200 dark:border-muted-700 hover:bg-muted-50 dark:hover:bg-muted-800/40">
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                      <div class="rounded-lg size-10 flex items-center justify-center bg-primary-100 dark:bg-primary-800/20">
                        <Icon name="ph:music-notes-duotone" class="size-5 text-primary-500" />
                      </div>
                      <div class="overflow-hidden">
                        <div class="font-medium text-muted-800 dark:text-muted-100 truncate max-w-xs">{{ file.metadata.originalName }}</div>
                        <div class="text-xs text-muted-400">
                          {{ file.metadata.tags?.join(', ') || 'No tags' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-muted-500">{{ formatDuration(file.metadata.duration) }}</td>
                  <td class="py-3 px-4 text-muted-500">{{ formatFileSize(file.metadata.size) }}</td>
                  <td class="py-3 px-4 text-muted-500">{{ new Date(file.metadata.createdAt).toLocaleDateString() }}</td>
                  <td class="py-3 px-4">
                    <div class="flex items-center justify-center gap-2">
                      <BaseButton size="xs" color="default" @click="playAudio(file)">
                        <Icon 
                          :name="currentAudio?.path === file.path && isPlaying ? 'ph:pause-fill' : 'ph:play-fill'" 
                          class="size-3.5" 
                        />
                      </BaseButton>
                      <BaseButton size="xs" color="default" as="a" :href="file.url" download>
                        <Icon name="ph:download-simple-duotone" class="size-3.5" />
                      </BaseButton>
                      <BaseButton size="xs" color="danger" @click="confirmDeleteFile(file)">
                        <Icon name="ph:trash-duotone" class="size-3.5" />
                      </BaseButton>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseCard>
      </div>
    </template>
  </div>
</template>
