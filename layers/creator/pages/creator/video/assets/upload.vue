<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStorage } from '../../composables/useStorage';
import { useToaster } from '../../../shared/composables/toaster';

const { uploadAsset, uploadProgress } = useStorage();
const toaster = useToaster();

const isUploading = ref(false);
const selectedFiles = ref<File[]>([]);
const selectedProject = ref<string | null>(null);
const uploadedFiles = ref<string[]>([]);

// Mock projects for selection
const projects = ref([
  { id: 'project1', title: 'My Awesome Video' },
  { id: 'project2', title: 'Product Tutorial' },
  { id: 'project3', title: 'Marketing Campaign' },
  { id: 'temp', title: 'Temporary Storage (No Project)' }
]);

// Asset type mapping
const getAssetType = (file: File): 'video' | 'audio' | 'image' | 'caption' => {
  const type = file.type.split('/')[0];
  
  switch(type) {
    case 'video':
      return 'video';
    case 'audio':
      return 'audio';
    case 'image':
      return 'image';
    default:
      if (file.name.endsWith('.srt') || file.name.endsWith('.vtt')) {
        return 'caption';
      }
      return 'image'; // Default to image
  }
};

// Validate file before upload
const validateFile = (file: File): boolean => {
  // Max file size: 500MB
  const maxSize = 500 * 1024 * 1024;
  
  if (file.size > maxSize) {
    toaster.show({
      title: 'File too large',
      message: `${file.name} exceeds the maximum file size of 500MB`,
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return false;
  }
  
  // Validate file types
  const validTypes = {
    video: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    caption: ['text/plain', 'text/vtt', 'application/x-subrip']
  };
  
  const assetType = getAssetType(file);
  
  // For caption files, verify by extension
  if (assetType === 'caption') {
    if (!file.name.endsWith('.srt') && !file.name.endsWith('.vtt')) {
      toaster.show({
        title: 'Invalid caption file',
        message: `${file.name} is not a supported caption format (SRT or VTT)`,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
      });
      return false;
    }
    return true;
  }
  
  // For other files, check MIME type
  if (!validTypes[assetType].includes(file.type)) {
    toaster.show({
      title: 'Unsupported file type',
      message: `${file.name} is not a supported file type`,
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return false;
  }
  
  return true;
};

// Handle file selection
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const files = Array.from(input.files);
    
    // Filter valid files
    const validFiles = files.filter(file => validateFile(file));
    
    selectedFiles.value = [...selectedFiles.value, ...validFiles];
    
    // Clear input value to allow selecting the same file again
    input.value = '';
  }
};

// Remove file from selection
const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
};

// Upload files
const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) {
    toaster.show({
      title: 'No files selected',
      message: 'Please select at least one file to upload',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  if (!selectedProject.value) {
    toaster.show({
      title: 'No project selected',
      message: 'Please select a project for the uploaded files',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  isUploading.value = true;
  uploadedFiles.value = [];
  
  try {
    // Upload files one by one
    for (const file of selectedFiles.value) {
      const assetType = getAssetType(file);
      
      const result = await uploadAsset(
        file,
        assetType,
        selectedProject.value,
        {
          tags: ['uploaded']
        }
      );
      
      uploadedFiles.value.push(result.url);
    }
    
    toaster.show({
      title: 'Upload Complete',
      message: `Successfully uploaded ${uploadedFiles.value.length} files`,
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
    
    selectedFiles.value = [];
  } catch (err) {
    console.error('Upload error:', err);
    toaster.show({
      title: 'Upload Error',
      message: 'An error occurred during upload. Please try again.',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    isUploading.value = false;
  }
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Calculate total size
const totalSize = computed(() => {
  return selectedFiles.value.reduce((total, file) => total + file.size, 0);
});
</script>

<template>
  <div>
    <BasePageTitle title="Upload Assets" subtitle="Upload media files to your projects" />
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Upload form -->
      <BaseCard class="p-6">
        <BaseHeading size="sm" weight="medium" class="mb-4">Upload Files</BaseHeading>
        
        <!-- File upload area -->
        <div 
          class="border-2 border-dashed border-muted-300 dark:border-muted-700 rounded-lg p-6 text-center"
          :class="{ 'opacity-50 pointer-events-none': isUploading }"
        >
          <div class="mb-4">
            <Icon name="ph:upload-simple-duotone" class="size-12 mx-auto text-primary-500" />
          </div>
          
          <BaseHeading size="sm" weight="medium" class="mb-2">Drag files here or click to upload</BaseHeading>
          <BaseText size="sm" class="text-muted-500 mb-4">
            Supported formats: MP4, MOV, MP3, WAV, JPG, PNG, GIF, SRT, VTT
          </BaseText>
          
          <input 
            type="file" 
            id="file-upload"
            multiple 
            class="hidden"
            @change="handleFileSelect"
          />
          
          <BaseButton color="default" as="label" for="file-upload">
            <Icon name="ph:file-plus-duotone" class="me-2" />
            Select Files
          </BaseButton>
        </div>
        
        <!-- Project selection -->
        <div class="mt-6">
          <BaseSelect 
            v-model="selectedProject"
            label="Select Project"
            placeholder="Choose a project for these assets"
            class="mb-4"
          >
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.title }}
            </option>
          </BaseSelect>
          
          <div class="flex justify-end">
            <BaseButton 
              color="primary" 
              :disabled="selectedFiles.length === 0 || !selectedProject || isUploading"
              :loading="isUploading"
              @click="uploadFiles"
            >
              <Icon name="ph:upload-simple-duotone" class="me-2" />
              Upload {{ selectedFiles.length }} {{ selectedFiles.length === 1 ? 'File' : 'Files' }}
            </BaseButton>
          </div>
        </div>
      </BaseCard>
      
      <!-- Selected files -->
      <BaseCard class="p-6">
        <div class="flex items-center justify-between mb-4">
          <BaseHeading size="sm" weight="medium">Selected Files</BaseHeading>
          <BaseText v-if="selectedFiles.length > 0" size="xs" class="text-muted-500">
            Total: {{ selectedFiles.length }} files ({{ formatFileSize(totalSize) }})
          </BaseText>
        </div>
        
        <div v-if="selectedFiles.length === 0" class="py-8 text-center text-muted-500">
          <Icon name="ph:folder-simple-dotted-duotone" class="size-10 mx-auto mb-2" />
          <BaseText>No files selected</BaseText>
        </div>
        
        <div v-else class="space-y-3 max-h-96 overflow-y-auto p-1">
          <div 
            v-for="(file, index) in selectedFiles" 
            :key="index"
            class="p-3 border border-muted-200 dark:border-muted-700 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <!-- File type icon -->
              <div class="rounded-lg size-10 flex items-center justify-center bg-muted-100 dark:bg-muted-800">
                <Icon 
                  :name="
                    file.type.startsWith('video/') ? 'ph:film-strip-duotone' :
                    file.type.startsWith('audio/') ? 'ph:music-notes-duotone' :
                    file.type.startsWith('image/') ? 'ph:image-duotone' :
                    'ph:file-text-duotone'
                  " 
                  class="size-5 text-muted-500"
                />
              </div>
              
              <!-- File info -->
              <div class="flex-grow min-w-0">
                <div class="font-medium truncate">{{ file.name }}</div>
                <div class="text-xs text-muted-500">{{ formatFileSize(file.size) }}</div>
              </div>
              
              <!-- Upload progress -->
              <div v-if="uploadProgress[file.name]" class="w-24">
                <div v-if="uploadProgress[file.name].status === 'uploading'" class="flex items-center gap-2">
                  <div class="text-xs text-muted-500">{{ Math.round(uploadProgress[file.name].progress) }}%</div>
                  <div class="flex-grow h-1 bg-muted-200 dark:bg-muted-700 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-primary-500"
                      :style="{ width: `${uploadProgress[file.name].progress}%` }"
                    ></div>
                  </div>
                </div>
              </div>
              
              <!-- Remove button -->
              <button 
                v-if="!isUploading"
                @click="removeFile(index)" 
                class="text-danger-500 hover:text-danger-600"
              >
                <Icon name="ph:x-duotone" class="size-5" />
              </button>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
