<script setup lang="ts">
import type { CategoryResearch, ExampleBook } from '../../../types/research';

definePageMeta({
  title: 'Book Clustering',
});
useHead({
  title: 'Vector Clustering',
});

const { isAuthenticated, getCurrentWorkspaceId } = useAuth();
const toaster = useToaster();
const workspaceId = computed(() => getCurrentWorkspaceId.value || '');

// Form state
const selectedResearch = ref('');
const selectedField = ref('description');
const numClusters = ref(3);
const loading = ref(false);
const clustersData = ref<Array<{ cluster_id: number, books: ExampleBook[] }>>([]);
const hasGenerated = ref(false);

// Get research projects
const researchProjects = ref<CategoryResearch[]>([]);
const loadingProjects = ref(true);

const fetchResearchProjects = async () => {
  if (!isAuthenticated.value) return;
  
  loadingProjects.value = true;
  
  try {
    const response = await $fetch('/api/research');
    researchProjects.value = response as CategoryResearch[];
  } catch (error) {
    console.error('Error fetching research projects:', error);
    toaster.show({
      title: 'Error',
      message: 'Failed to load research projects',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
      closable: true,
    });
  } finally {
    loadingProjects.value = false;
  }
};

// Watch for authentication state
watch(
  isAuthenticated,
  (newVal) => {
    if (newVal) {
      fetchResearchProjects();
    } else {
      researchProjects.value = [];
    }
  },
  { immediate: true }
);

// Field options
const fieldOptions = [
  { value: 'description', label: 'Book Description' },
  { value: 'title', label: 'Book Title' },
  { value: 'content', label: 'Book Content (if available)' },
];

// Number of clusters options
const clusterOptions = [
  { value: 2, label: '2 clusters' },
  { value: 3, label: '3 clusters' },
  { value: 4, label: '4 clusters' },
  { value: 5, label: '5 clusters' },
  { value: 6, label: '6 clusters' },
];

// Handle form submit
const generateClusters = async () => {
  if (!selectedResearch.value) return;
  
  loading.value = true;
  
  try {
    const response = await $fetch('/api/vectors/cluster', {
      method: 'POST',
      body: {
        research_id: selectedResearch.value,
        field: selectedField.value,
        num_clusters: numClusters.value
      },
    });
    
    clustersData.value = response as Array<{ cluster_id: number, books: ExampleBook[] }>;
    hasGenerated.value = true;
    
    toaster.show({
      title: 'Success',
      message: 'Clusters generated successfully',
      color: 'success',
      icon: 'ph:check-circle-duotone',
      closable: true,
    });
  } catch (error) {
    console.error('Error generating clusters:', error);
    toaster.show({
      title: 'Error',
      message: error.message || 'Failed to generate clusters',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
      closable: true,
    });
  } finally {
    loading.value = false;
  }
};

// Navigate to book detail
const navigateToBook = (book: ExampleBook) => {
  navigateTo(`/research/books/${book.id}`);
};
</script>

<template>
  <div class="space-y-6 pb-20 pt-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <BaseHeading tag="h1" size="xl" weight="semibold" class="text-muted-800 dark:text-white">
          Vector Clustering
        </BaseHeading>
        <BaseParagraph size="xs" class="text-muted-400">
          Group similar books into clusters based on vector embeddings
        </BaseParagraph>
      </div>
    </div>
    
    <!-- Clustering form -->
    <BaseCard class="p-6">
      <form @submit.prevent="generateClusters">
        <div class="space-y-5">
          <!-- Form header -->
          <div class="mb-2">
            <BaseHeading tag="h3" size="md" weight="semibold" class="text-muted-800 dark:text-white">
              Generate Book Clusters
            </BaseHeading>
            <BaseParagraph size="xs" class="text-muted-400">
              Select a research project and configure clustering parameters
            </BaseParagraph>
          </div>
          
          <!-- Select research project -->
          <div>
            <BaseHeading tag="h4" size="sm" weight="medium" class="mb-2 text-muted-700 dark:text-muted-200">
              Research Project
            </BaseHeading>
            <BaseSelect
              v-model="selectedResearch"
              :items="researchProjects.map(p => ({ 
                value: p.id, 
                label: `${p.main_category}: ${p.sub_category}` 
              }))"
              placeholder="Select a research project"
              shape="rounded"
              :loading="loadingProjects"
              :disabled="loadingProjects"
              required
            />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Select field for clustering -->
            <div>
              <BaseHeading tag="h4" size="sm" weight="medium" class="mb-2 text-muted-700 dark:text-muted-200">
                Field for Clustering
              </BaseHeading>
              <BaseSelect
                v-model="selectedField"
                :items="fieldOptions"
                placeholder="Select embedding field"
                shape="rounded"
                required
              />
            </div>
            
            <!-- Number of clusters -->
            <div>
              <BaseHeading tag="h4" size="sm" weight="medium" class="mb-2 text-muted-700 dark:text-muted-200">
                Number of Clusters
              </BaseHeading>
              <BaseSelect
                v-model="numClusters"
                :items="clusterOptions"
                placeholder="Select number of clusters"
                shape="rounded"
                required
              />
            </div>
          </div>
          
          <!-- Generate button -->
          <div class="flex justify-end pt-4">
            <BaseButton
              type="submit"
              color="primary"
              :loading="loading"
              :disabled="loading || !selectedResearch"
            >
              <Icon v-if="!loading" name="ph:cube-duotone" class="me-2 size-4" />
              <span>{{ loading ? 'Generating...' : 'Generate Clusters' }}</span>
            </BaseButton>
          </div>
        </div>
      </form>
    </BaseCard>
    
    <!-- Clusters display -->
    <BaseCard v-if="hasGenerated" class="p-6">
      <div class="mb-6">
        <BaseHeading tag="h2" size="lg" weight="semibold" class="text-muted-800 dark:text-white">
          Cluster Results
        </BaseHeading>
        <BaseParagraph size="xs" class="text-muted-400">
          Books grouped by similarity based on {{ selectedField }} embeddings
        </BaseParagraph>
      </div>
      
      <BookClusterDisplay 
        :clusters="clustersData"
        :loading="loading"
        @book-clicked="navigateToBook"
      />
    </BaseCard>
  </div>
</template>
