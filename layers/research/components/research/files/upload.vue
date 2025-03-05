<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useToaster } from '../../../../shared/composables/toaster';

definePageMeta({
  title: 'Upload Research Files',
});
useHead({
  title: 'Upload Research Files',
});

// Get research projects for the dropdown
const { researchProjects, loading: loadingProjects } = useResearch();
const toaster = useToaster();

// Form validation schema
const validationSchema = toTypedSchema(
  z.object({
    research_id: z.string().min(1, 'Please select a research project'),
    process_text: z.boolean().default(false),
    generate_embeddings: z.boolean().default(false),
  })
);

// Form state
const { handleSubmit, isSubmitting, values, errors, resetForm } = useForm({
  validationSchema,
  initialValues: {
    research_id: '',
    process_text: true,
    generate_embeddings: true,
  },
});

// File upload state
const uploadedFiles = ref<File[]>([]);
const uploadProgress = ref<number>(0);
const isUploading = ref(false);
const uploadComplete = ref(false);
const dragActive = ref(false);

// Process drag events
const onDragEnter = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = true;
};

const onDragLeave = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = false;
};

const onDragOver = (e: DragEvent) => {
  e.preventDefault();
};

const onDrop = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = false;
  
  if (e.dataTransfer?.files) {
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }
};

// Handle file input change
const handleFileInputChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    const files = Array.from(input.files);
    handleFiles(files);
  }
};

// Process selected files
const handleFiles = (files: File[]) => {
  // Filter for supported file types
  const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  const validFiles = files.filter(file => supportedTypes.includes(file.type));
  
  if (validFiles.length !== files.length) {
    const invalidCount = files.length - validFiles.length;
    toaster.show({
      title: 'Warning',
      message: `${invalidCount} ${invalidCount === 1 ? 'file was' : 'files were'} not added due to unsupported file types`,
      color: 'warning',
      icon: 'ph:warning-circle-duotone',
      closable: true,
    });
  }
  
  // Add valid files
  uploadedFiles.value = [...uploadedFiles.value, ...validFiles];
};

// Remove file from upload list
const removeFile = (index: number) => {
  uploadedFiles.value = uploadedFiles.value.filter((_, i) => i !== index);
};

// Get file type icon
const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) return 'ph:file-pdf-duotone';
  if (mimeType.includes('image')) return 'ph:image-duotone';
  if (mimeType.includes('sheet')) return 'ph:file-xls-duotone';
  if (mimeType.includes('document')) return 'ph:file-doc-duotone';
  return 'ph:file-duotone';
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
  else return (bytes / 1073741824).toFixed(2) + ' GB';
};

// Submit handler
const onSubmit = handleSubmit(async (formValues) => {
  if (uploadedFiles.value.length === 0) {
    toaster.show({
      title: 'Error',
      message: 'Please select files to upload',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
      closable: true,
    });
    return;
  }
  
  try {
    isUploading.value = true;
    uploadProgress.value = 0;
    
    // In a real app, we would use FormData and fetch/axios
    // For demo, simulate a file upload with progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      uploadProgress.value = Math.min(progress, 99); // Cap at 99% until complete
      
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 500);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    uploadProgress.value = 100;
    uploadComplete.value = true;
    
    toaster.show({
      title: 'Success',
      message: `${uploadedFiles.value.length} files uploaded successfully`,
      color: 'success',
      icon: 'ph:check-circle-duotone',
      closable: true,
    });
    
    // Simulate redirection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    navigateTo('/research/files');
    
  } catch (err) {
    console.error('Error uploading files:', err);
    toaster.show({
      title: 'Error',
      message: err.message || 'Failed to upload files',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
      closable: true,
    });
  } finally {
    isUploading.value = false;
  }
});

// Reset everything
const resetAll = () => {
  uploadedFiles.value = [];
  uploadProgress.value = 0;
  uploadComplete.value = false;
  resetForm();
};
</script>

<template>
  <div class="space-y-6 pb-20 pt-4">
    <!-- Header -->
    <div class="flex items-center mb-6">
      <NuxtLink 
        to="/research/files" 
        class="me-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted-100 dark:bg-muted-900 hover:bg-primary-500/20 hover:text-primary-500"
      >
        <Icon name="ph:arrow-left-duotone" class="size-5" />
      </NuxtLink>
      <div>
        <BaseHeading tag="h1" size="xl" weight="semibold" class="text-muted-800 dark:text-white">
          Upload Research Files
        </BaseHeading>
        <BaseParagraph size="xs" class="text-muted-400">
          Add PDF documents, images, spreadsheets, and other files to your research projects
        </BaseParagraph>
      </div>
    </div>
    
    <div class="grid grid-cols-12 gap-6">
      <!-- Upload form -->
      <div class="col-span-12 lg:col-span-8">
        <BaseCard class="p-6">
          <form @submit.prevent="onSubmit">
            <div class="space-y-6">
              <!-- Research project selection -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-2">
                  Select Research Project
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  Choose which research project these files belong to
                </BaseParagraph>
                <BaseSelect
                  v-model="values.research_id"
                  :items="researchProjects.map(p => ({ 
                    value: p.id, 
                    label: `${p.main_category}: ${p.sub_category}` 
                  }))"
                  placeholder="Select a research project"
                  shape="rounded"
                  :loading="loadingProjects"
                  :disabled="loadingProjects || isUploading"
                  :error="errors.research_id"
                  required
                ><option v-for="project in researchProjects" :key="project.id" :value="project.id">
                  {{ project.main_category }}: {{ project.sub_category }}
                </option></BaseSelect>
              </div>
              
              <!-- File drop area -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-2">
                  Upload Files
                </BaseHeading>
                <div 
                  @dragenter="onDragEnter"
                  @dragleave="onDragLeave"
                  @dragover="onDragOver"
                  @drop="onDrop"
                  :class="{
                    'border-primary-500 bg-primary-500/5': dragActive,
                    'border-muted-300 dark:border-muted-700 hover:border-muted-400 dark:hover:border-muted-600': !dragActive
                  }"
                  class="border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300"
                >
                  <div class="flex flex-col items-center">
                    <BaseIconBox
                      size="lg"
                      class="bg-primary-500/10 text-primary-500 mb-3"
                      shape="rounded"
                      color="none"
                    >
                      <Icon name="ph:cloud-arrow-up-duotone" class="size-7" />
                    </BaseIconBox>
                    <BaseHeading tag="h4" size="md" weight="medium" class="text-muted-800 dark:text-white mb-1">
                      Drag & Drop Files Here
                    </BaseHeading>
                    <BaseParagraph size="xs" class="text-muted-400 mb-4">
                      or click to browse your computer
                    </BaseParagraph>
                    <label>
                      <BaseButton
                        type="button"
                        color="primary"
                        :disabled="isUploading"
                      >
                        Browse Files
                      </BaseButton>
                      <input 
                        type="file" 
                        multiple 
                        class="hidden" 
                        @change="handleFileInputChange"
                        :disabled="isUploading"
                      />
                    </label>
                    <BaseParagraph size="xs" class="text-muted-400 mt-4">
                      Supported formats: PDF, DOC, XLSX, JPG, PNG (max 50MB per file)
                    </BaseParagraph>
                  </div>
                </div>
              </div>
              
              <!-- Selected files -->
              <div v-if="uploadedFiles.length > 0">
                <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-3">
                  Selected Files ({{ uploadedFiles.length }})
                </BaseHeading>
                <div class="space-y-3">
                  <div 
                    v-for="(file, index) in uploadedFiles" 
                    :key="index"
                    class="flex items-center justify-between p-3 bg-muted-100 dark:bg-muted-800 rounded-md"
                  >
                    <div class="flex items-center gap-3">
                      <BaseIconBox
                        size="md"
                        :class="`
                          bg-${file.type.includes('pdf') ? 'danger' : 
                                file.type.includes('sheet') ? 'success' : 
                                file.type.includes('doc') ? 'info' : 
                                file.type.includes('image') ? 'warning' : 'muted'}-500/10 
                          text-${file.type.includes('pdf') ? 'danger' : 
                                file.type.includes('sheet') ? 'success' : 
                                file.type.includes('doc') ? 'info' : 
                                file.type.includes('image') ? 'warning' : 'muted'}-500
                        `"
                        shape="rounded"
                        color="none"
                      >
                        <Icon :name="getFileIcon(file.type)" class="size-5" />
                      </BaseIconBox>
                      <div class="min-w-0">
                        <div class="text-sm font-medium text-muted-800 dark:text-white truncate">
                          {{ file.name }}
                        </div>
                        <div class="text-xs text-muted-400">
                          {{ formatFileSize(file.size) }}
                        </div>
                      </div>
                    </div>
                    <BaseButtonIcon
                      v-if="!isUploading"
                      size="xs"
                      shape="rounded"
                      color="danger"
                      @click="removeFile(index)"
                      v-tooltip="'Remove File'"
                    >
                      <Icon name="ph:x-duotone" class="size-4" />
                    </BaseButtonIcon>
                    
                    <!-- Progress indicator when uploading -->
                    <div v-else class="text-xs text-muted-400 font-medium">
                      {{ Math.round(uploadProgress) }}%
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Upload options -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-3">
                  Upload Options
                </BaseHeading>
                <div class="space-y-3">
                  <FormSwitch
                    v-model="values.process_text"
                    label="Extract and process text from PDFs and documents"
                    color="primary"
                    :disabled="isUploading"
                  />
                  
                  <FormSwitch
                    v-model="values.generate_embeddings"
                    label="Generate vector embeddings for uploaded files"
                    color="primary"
                    :disabled="isUploading"
                  />
                </div>
              </div>
              
              <!-- Progress bar -->
              <div v-if="isUploading" class="space-y-2">
                <BaseHeading tag="h4" size="sm" weight="medium" class="text-muted-800 dark:text-white">
                  {{ uploadComplete ? 'Upload Complete!' : 'Uploading Files...' }}
                </BaseHeading>
                <BaseProgress
                  :value="uploadProgress"
                  color="primary"
                  size="md"
                />
                <BaseParagraph size="xs" class="text-muted-400 text-center">
                  {{ uploadComplete ? 'Redirecting...' : `${Math.round(uploadProgress)}% complete` }}
                </BaseParagraph>
              </div>
              
              <!-- Buttons -->
              <div class="flex justify-end gap-2 pt-4">
                <BaseButton
                  type="button"
                  color="muted"
                  @click="resetAll"
                  :disabled="isUploading"
                >
                  Reset
                </BaseButton>
                <BaseButton
                  type="submit"
                  color="primary"
                  :loading="isUploading"
                  :disabled="isUploading || uploadedFiles.length === 0 || !values.research_id"
                >
                  <Icon v-if="!isUploading" name="ph:upload-duotone" class="me-2 size-4" />
                  <span>{{ isUploading ? 'Uploading...' : 'Upload Files' }}</span>
                </BaseButton>
              </div>
            </div>
          </form>
        </BaseCard>
      </div>
      
      <!-- Info panel -->
      <div class="col-span-12 lg:col-span-4">
        <BaseCard class="p-6 h-full">
          <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-4">
            About File Uploads
          </BaseHeading>
          
          <div class="space-y-5">
            <BaseParagraph size="sm" class="text-muted-500 dark:text-muted-400">
              Uploaded files are processed to enhance your research capabilities. PDFs and documents can be 
              analyzed for text content, and vector embeddings can be generated to enable semantic search and similarity analysis.
            </BaseParagraph>
            
            <div class="space-y-3">
              <div class="flex gap-2">
                <BaseIconBox
                  size="xs"
                  class="bg-primary-500/10 text-primary-500 mt-0.5"
                  shape="curved"
                  color="none"
                >
                  <Icon name="ph:check-duotone" class="size-3" />
                </BaseIconBox>
                <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
                  <span class="font-medium text-muted-700 dark:text-muted-200">Text Extraction:</span> 
                  Automatically extract text from PDFs and documents for full-text search
                </BaseParagraph>
              </div>
              
              <div class="flex gap-2">
                <BaseIconBox
                  size="xs"
                  class="bg-primary-500/10 text-primary-500 mt-0.5"
                  shape="curved"
                  color="none"
                >
                  <Icon name="ph:check-duotone" class="size-3" />
                </BaseIconBox>
                <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
                  <span class="font-medium text-muted-700 dark:text-muted-200">Vector Embeddings:</span> 
                  Create semantic representations for advanced search and similarity matching
                </BaseParagraph>
              </div>
              
              <div class="flex gap-2">
                <BaseIconBox
                  size="xs"
                  class="bg-primary-500/10 text-primary-500 mt-0.5"
                  shape="curved"
                  color="none"
                >
                  <Icon name="ph:check-duotone" class="size-3" />
                </BaseIconBox>
                <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
                  <span class="font-medium text-muted-700 dark:text-muted-200">File Organization:</span> 
                  Connect files to specific research projects for better organization
                </BaseParagraph>
              </div>
            </div>
            
            <BaseMessage color="warning" class="mt-4">
              <template #icon>
                <Icon name="ph:warning-circle-duotone" class="size-5" />
              </template>
              <div>
                <b>File size limits:</b> Maximum 50MB per file. For larger files, please compress or split them.
              </div>
            </BaseMessage>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
