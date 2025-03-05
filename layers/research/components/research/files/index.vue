<script setup lang="ts">
import type { ResearchFile, CategoryResearch } from '../../../types/research';

definePageMeta({
  title: 'Research Files',
});
useHead({
  title: 'Research Files',
});

const { isAuthenticated } = useAuth();
const toaster = useToaster();
const { researchProjects, loading: loadingProjects } = useResearch();

// File data
const files = ref<ResearchFile[]>([]);
const loading = ref(true);
const error = ref(null);

// Filters
const selectedProject = ref('');
const selectedType = ref('');
const searchQuery = ref('');

// File type options
const fileTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'pdf', label: 'PDF Documents' },
  { value: 'image', label: 'Images' },
  { value: 'spreadsheet', label: 'Spreadsheets' },
  { value: 'document', label: 'Documents' },
];

// Fetch files
const fetchFiles = async () => {
  if (!isAuthenticated.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // In a real app, this would be an API call
    // For demo, we'll use mock data
    const mockFiles: ResearchFile[] = Array(10).fill(null).map((_, index) => ({
      id: `file-${index}`,
      research_id: index % 3 === 0 ? 'research-1' : (index % 3 === 1 ? 'research-2' : 'research-3'),
      name: `Research File ${index + 1}.${index % 4 === 0 ? 'pdf' : (index % 4 === 1 ? 'xlsx' : (index % 4 === 2 ? 'docx' : 'jpg'))}`,
      type: index % 4 === 0 ? 'pdf' : (index % 4 === 1 ? 'spreadsheet' : (index % 4 === 2 ? 'document' : 'image')),
      size: 1000000 + Math.floor(Math.random() * 5000000),
      path: `/uploads/research/${index + 1}`,
      metadata: {
        pages: index % 4 === 0 ? Math.floor(Math.random() * 100) + 5 : undefined,
        author: `Author ${Math.floor(index / 3) + 1}`,
        created: new Date(Date.now() - Math.random() * 10000000000)
      },
      vector_embedding: index % 3 === 0 ? {
        embedding: Array(128).fill(0),
        provider: 'openai',
        model: 'text-embedding-3-small',
        dimensions: 128,
        created_at: new Date()
      } : undefined,
      created_at: new Date(Date.now() - Math.random() * 10000000000),
      updated_at: new Date(),
    }));
    
    files.value = mockFiles;
  } catch (err) {
    console.error('Error fetching files:', err);
    error.value = err.message || 'Failed to load files';
    toaster.show({
      title: 'Error',
      message: error.value,
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
      closable: true,
    });
  } finally {
    loading.value = false;
  }
};

// Filtered files
const filteredFiles = computed(() => {
  let result = [...files.value];
  
  // Filter by project
  if (selectedProject.value) {
    result = result.filter(file => file.research_id === selectedProject.value);
  }
  
  // Filter by type
  if (selectedType.value) {
    result = result.filter(file => file.type === selectedType.value);
  }
  
  // Search by name
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(file => 
      file.name.toLowerCase().includes(query) ||
      (file.metadata?.author && file.metadata.author.toLowerCase().includes(query))
    );
  }
  
  return result;
});

// File icon by type
const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return 'ph:file-pdf-duotone';
    case 'image':
      return 'ph:image-duotone';
    case 'spreadsheet':
      return 'ph:file-xls-duotone';
    case 'document':
      return 'ph:file-doc-duotone';
    default:
      return 'ph:file-duotone';
  }
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
  else return (bytes / 1073741824).toFixed(2) + ' GB';
};

// Delete file
const deleteFile = async (fileId: string) => {
  toaster.show({
    title: 'File Deleted',
    message: 'File has been deleted successfully',
    color: 'success',
    icon: 'ph:check-circle-duotone',
    closable: true,
  });
  
  files.value = files.value.filter(file => file.id !== fileId);
};

// Generate embeddings for a file
const generateEmbeddings = async (fileId: string) => {
  toaster.show({
    title: 'Embeddings Generated',
    message: 'Vector embeddings have been created successfully',
    color: 'success',
    icon: 'ph:check-circle-duotone',
    closable: true,
  });
  
  // Update the file with embeddings
  files.value = files.value.map(file => {
    if (file.id === fileId) {
      return {
        ...file,
        vector_embedding: {
          embedding: Array(128).fill(0),
          provider: 'openai',
          model: 'text-embedding-3-small',
          dimensions: 128,
          created_at: new Date()
        }
      };
    }
    return file;
  });
};

// View file details
const viewFile = (file: ResearchFile) => {
  // In a real app, this would navigate to file details
  window.open(`/files/${file.id}`, '_blank');
};

// Watch for authentication state
watch(
  isAuthenticated,
  (newVal) => {
    if (newVal) {
      fetchFiles();
    } else {
      files.value = [];
    }
  },
  { immediate: true }
);

const uploadModal = ref(false)
</script>

<template>
  <div class="space-y-6 pb-20 pt-4">
     <Modal
        :open="uploadModal"
        size="2xl"
        footer-align="center"
        @close="uploadModal = false"
      >
        <template #header>
          <!-- Header -->
          <div class="flex w-full items-center justify-between p-4 md:p-6">
            <h3
              class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
            >
              Medium dialog
            </h3>
            <BaseButtonClose @click="uploadModal = false" />
          </div>
        </template>
    
        <!-- Body -->
        <div class="p-4 md:p-6">
         <Uploads />
        </div>
    
        <template #footer>
          <!-- Footer -->
          <div class="p-4 md:p-6">
            <div class="flex gap-x-2">
              <BaseButton @click="isModalCenterOpen = false">
                Decline
              </BaseButton>
              <BaseButton
                color="primary"
                variant="solid"
                @click="isModalCenterOpen = false"
              >
                Accept
              </BaseButton>
            </div>
          </div>
        </template>
      </Modal>
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <BaseHeading tag="h1" size="xl" weight="semibold" class="text-muted-800 dark:text-white">
          Research Files
        </BaseHeading>
        <BaseParagraph size="xs" class="text-muted-400">
          Manage supplementary files for your research projects
        </BaseParagraph>
      </div>
      
      <!-- Upload button -->
      <div class="mt-4 md:mt-0">
          <BaseButton color="primary" @click="uploadModal = true">
            <Icon name="ph:upload-duotone" class="me-2 size-4" />
            <span>Upload Files</span>
          </BaseButton>
      </div>
    </div>

    <!-- Filters -->
    <BaseCard class="p-5">
      <div class="flex flex-col md:flex-row gap-4">
        <BaseSelect
          v-model="selectedProject"
          :items="[
            { value: '', label: 'All Projects' },
            ...researchProjects.map(p => ({ value: p.id, label: `${p.main_category}: ${p.sub_category}` }))
          ]"
          placeholder="Filter by project"
          shape="rounded"
          :loading="loadingProjects"
          class="w-full md:w-auto"
        />
        <BaseSelect
          v-model="selectedType"
          :items="fileTypeOptions"
          placeholder="Filter by file type"
          shape="rounded"
          class="w-full md:w-auto"
        />
        <div class="md:ms-auto">
          <BaseInput
            v-model="searchQuery"
            icon="ph:magnifying-glass-duotone"
            placeholder="Search files..."
            shape="rounded"
            class="w-full"
          />
        </div>
      </div>
    </BaseCard>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <BaseButtonIcon
        size="lg"
        disabled
        shape="full"
        class="animate-spin text-primary-500"
      >
        <Icon name="line-md:loading-twotone-loop" class="size-6" />
      </BaseButtonIcon>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="py-20 text-center">
      <div class="mb-4 flex justify-center">
        <BaseIconBox
          size="lg"
          class="bg-danger-500/10 text-danger-500"
          shape="full"
          color="none"
        >
          <Icon name="ph:warning-circle-duotone" class="size-10" />
        </BaseIconBox>
      </div>
      <BaseHeading tag="h4" size="lg" weight="medium" class="text-danger-500">
        Error Loading Files
      </BaseHeading>
      <BaseParagraph size="sm" class="text-muted-400 mt-2 max-w-md mx-auto">
        {{ error }}
      </BaseParagraph>
      <div class="mt-4">
        <BaseButton color="primary" @click="fetchFiles">
          <Icon name="ph:arrow-clockwise-duotone" class="me-2 size-4" />
          <span>Retry</span>
        </BaseButton>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="filteredFiles.length === 0" class="py-20 text-center">
      <div class="mb-4 flex justify-center">
        <BaseIconBox
          size="lg"
          class="bg-info-500/10 text-info-500"
          shape="full"
          color="none"
        >
          <Icon name="ph:file-duotone" class="size-10" />
        </BaseIconBox>
      </div>
      <BaseHeading tag="h4" size="lg" weight="medium" class="text-muted-800 dark:text-white">
        No Files Found
      </BaseHeading>
      <BaseParagraph size="sm" class="text-muted-400 mt-2 max-w-md mx-auto">
        {{ searchQuery || selectedType || selectedProject ? 
          'Try adjusting your search or filters' : 
          'Upload files to enhance your research projects' }}
      </BaseParagraph>
      <div class="mt-4" v-if="!searchQuery && !selectedType && !selectedProject">
        <NuxtLink to="/research/files/upload">
          <BaseButton color="primary">
            <Icon name="ph:upload-duotone" class="me-2 size-4" />
            <span>Upload Files</span>
          </BaseButton>
        </NuxtLink>
      </div>
    </div>
    
    <!-- Files list -->
    <BaseCard v-else>
      <div class="divide-y divide-muted-200 dark:divide-muted-700">
        <div 
          v-for="file in filteredFiles" 
          :key="file.id" 
          class="p-4 hover:bg-muted-50 dark:hover:bg-muted-900 transition-colors duration-300"
        >
          <div class="flex items-center gap-4">
            <!-- File icon -->
            <div class="flex-shrink-0">
              <BaseIconBox
                size="lg"
                :class="`bg-${file.type === 'pdf' ? 'danger' : 
                           file.type === 'spreadsheet' ? 'success' : 
                           file.type === 'document' ? 'info' : 
                           file.type === 'image' ? 'warning' : 'muted'}-500/10 
                          text-${file.type === 'pdf' ? 'danger' : 
                                file.type === 'spreadsheet' ? 'success' : 
                                file.type === 'document' ? 'info' : 
                                file.type === 'image' ? 'warning' : 'muted'}-500`"
                shape="rounded"
                color="none"
              >
                <Icon :name="getFileIcon(file.type)" class="size-6" />
              </BaseIconBox>
            </div>
            
            <!-- File details -->
            <div class="flex-grow min-w-0">
              <div class="flex items-center">
                <BaseHeading 
                  as="h3" 
                  size="md" 
                  weight="medium" 
                  lead="tight"
                  class="text-muted-800 dark:text-white mr-3 truncate"
                >
                  {{ file.name }}
                </BaseHeading>
                <BaseBadge v-if="file.vector_embedding" color="primary" rounded="full" size="sm">
                  <Icon name="ph:cube-duotone" class="me-1 size-3" />
                  <span>Vector</span>
                </BaseBadge>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-400 mt-1">
                <div>{{ formatFileSize(file.size) }}</div>
                <div v-if="file.metadata?.pages" class="sm:before:content-['•'] sm:before:mx-2">{{ file.metadata.pages }} pages</div>
                <div v-if="file.metadata?.author" class="sm:before:content-['•'] sm:before:mx-2">By {{ file.metadata.author }}</div>
                <div class="sm:before:content-['•'] sm:before:mx-2">
                  {{ new Date(file.created_at).toLocaleDateString() }}
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center gap-2">
              <BaseButtonIcon
                size="xs"
                shape="rounded"
                color="default"
                v-tooltip="'View File'"
                @click="viewFile(file)"
              >
                <Icon name="ph:eye-duotone" class="size-4" />
              </BaseButtonIcon>
              
              <BaseButtonIcon
                v-if="!file.vector_embedding"
                size="xs"
                shape="rounded"
                color="primary"
                v-tooltip="'Generate Embeddings'"
                @click="generateEmbeddings(file.id)"
              >
                <Icon name="ph:cube-duotone" class="size-4" />
              </BaseButtonIcon>
              
              <BaseButtonIcon
                size="xs"
                shape="rounded"
                color="danger"
                v-tooltip="'Delete File'"
                @click="deleteFile(file.id)"
              >
                <Icon name="ph:trash-duotone" class="size-4" />
              </BaseButtonIcon>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
