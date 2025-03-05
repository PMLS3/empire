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
<ResearchFilesUpload />
</template>
