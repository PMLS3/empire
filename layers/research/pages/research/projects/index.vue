<script setup lang="ts">
import { useResearch } from '../../../composables/useResearch';

definePageMeta({
  title: 'Research Projects',
});
useHead({
  title: 'Research Projects',
});

// Get research projects using composable
const { 
  researchProjects, 
  loading, 
  error, 
  filters, 
  fetchResearchProjects 
} = useResearch();

// Search functionality
const searchQuery = ref('');
const viewMode = ref('grid'); // grid or list

const filteredProjects = computed(() => {
  if (!searchQuery.value) return researchProjects.value;
  
  const query = searchQuery.value.toLowerCase();
  return researchProjects.value.filter(project => 
    project.main_category.toLowerCase().includes(query) || 
    project.sub_category.toLowerCase().includes(query) ||
    (project.sub_category_description && project.sub_category_description.toLowerCase().includes(query))
  );
});

// Category options
const categoryOptions = [
  { value: null, label: 'All Categories' },
  { value: 'fiction', label: 'Fiction' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'self-help', label: 'Self-Help' },
  { value: 'business', label: 'Business' },
  { value: 'technical', label: 'Technical' },
];

// Status options
const statusOptions = [
  { value: null, label: 'All Status' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

// Scope options
const scopeOptions = [
  { value: 'all', label: 'All Projects' },
  { value: 'owned', label: 'My Projects' },
  { value: 'shared', label: 'Shared With Me' },
];
</script>

<template>
  <div class="space-y-6 pb-20 pt-4">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <BaseHeading tag="h1" size="xl" weight="semibold" class="text-muted-800 dark:text-white">
          Research Projects
        </BaseHeading>
        <BaseParagraph size="xs" class="text-muted-400">
          Manage your book research projects
        </BaseParagraph>
      </div>
      
      <!-- Actions -->
      <div class="flex gap-2 mt-4 md:mt-0">
        <BaseButton
          color="muted"
          :class="{ 'bg-muted-200 dark:bg-muted-700': viewMode === 'grid' }"
          @click="viewMode = 'grid'"
        >
          <Icon name="ph:grid-four-duotone" class="size-5" />
        </BaseButton>
        <BaseButton
          color="muted"
          :class="{ 'bg-muted-200 dark:bg-muted-700': viewMode === 'list' }"
          @click="viewMode = 'list'"
        >
          <Icon name="ph:list-bullets-duotone" class="size-5" />
        </BaseButton>
        <NuxtLink to="/research/projects/create">
          <BaseButton color="primary">
            <Icon name="ph:plus-circle-duotone" class="me-2 size-4" />
            <span>New Project</span>
          </BaseButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Filters -->
    <BaseCard class="p-5">
      <div class="flex flex-col md:flex-row gap-4">
        <BaseSelect
          v-model="filters.category"
          :items="categoryOptions"
          placeholder="Filter by category"
          shape="rounded"
          class="w-full md:w-auto"
        />
        <BaseSelect
          v-model="filters.status"
          :items="statusOptions"
          placeholder="Filter by status"
          shape="rounded"
          class="w-full md:w-auto"
        />
        <BaseSelect
          v-model="filters.scope"
          :items="scopeOptions"
          placeholder="Filter by scope"
          shape="rounded"
          class="w-full md:w-auto"
        />
        <div class="md:ms-auto">
          <BaseInput
            v-model="searchQuery"
            icon="ph:magnifying-glass-duotone"
            placeholder="Search projects..."
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
        Error Loading Projects
      </BaseHeading>
      <BaseParagraph size="sm" class="text-muted-400 mt-2 max-w-md mx-auto">
        {{ error }}
      </BaseParagraph>
      <div class="mt-4">
        <BaseButton color="primary" @click="fetchResearchProjects">
          <Icon name="ph:arrow-clockwise-duotone" class="me-2 size-4" />
          <span>Retry</span>
        </BaseButton>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="filteredProjects.length === 0" class="py-20 text-center">
      <div class="mb-4 flex justify-center">
        <BaseIconBox
          size="lg"
          class="bg-info-500/10 text-info-500"
          shape="full"
          color="none"
        >
          <Icon name="ph:books-duotone" class="size-10" />
        </BaseIconBox>
      </div>
      <BaseHeading tag="h4" size="lg" weight="medium" class="text-muted-800 dark:text-white">
        No Research Projects Found
      </BaseHeading>
      <BaseParagraph size="sm" class="text-muted-400 mt-2 max-w-md mx-auto">
        {{ searchQuery ? 'Try adjusting your search or filters' : 'Get started by creating your first research project' }}
      </BaseParagraph>
      <div class="mt-4" v-if="!searchQuery">
        <NuxtLink to="/research/projects/create">
          <BaseButton color="primary">
            <Icon name="ph:plus-circle-duotone" class="me-2 size-4" />
            <span>Create First Project</span>
          </BaseButton>
        </NuxtLink>
      </div>
    </div>
    
    <!-- Projects grid -->
    <template v-else>
      <!-- Grid view -->
      <div v-if="viewMode === 'grid'" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="project in filteredProjects" 
          :key="project.id" 
          class="relative"
        >
          <NuxtLink :to="`/research/projects/${project.id}`">
            <ResearchProjectCard :project="project" />
          </NuxtLink>
        </div>
      </div>
      
      <!-- List view -->
      <BaseCard v-else>
        <div class="divide-y divide-muted-200 dark:divide-muted-700">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="p-4 hover:bg-muted-50 dark:hover:bg-muted-900 transition-colors duration-300"
          >
            <NuxtLink :to="`/research/projects/${project.id}`" class="flex flex-col md:flex-row gap-4 md:items-center w-full">
              <!-- Icon and category -->
              <div class="flex items-center">
                <BaseIconBox 
                  size="lg"
                  class="bg-primary-500/10 text-primary-500 me-3"
                  shape="rounded"
                  color="none"
                >
                  <Icon :name="project.main_category === 'fiction' ? 'ph:book-open-text-duotone' : 'ph:book-duotone'" class="size-5" />
                </BaseIconBox>
                <div>
                  <BaseHeading 
                    as="h3" 
                    size="md" 
                    weight="medium" 
                    lead="tight"
                    class="text-muted-800 dark:text-white"
                  >
                    {{ project.main_category }}: {{ project.sub_category }}
                  </BaseHeading>
                  <div class="text-xs text-muted-400">
                    {{ project.example_book_ids?.length || 0 }} books
                  </div>
                </div>
              </div>
              
              <!-- Description -->
              <div class="flex-grow truncate md:max-w-md">
                <BaseParagraph 
                  v-if="project.sub_category_description"
                  size="xs" 
                  class="text-muted-400 line-clamp-1"
                >
                  {{ project.sub_category_description }}
                </BaseParagraph>
              </div>
              
              <!-- Status and date -->
              <div class="flex items-center justify-between md:justify-end gap-4">
                <BaseBadge :color="project.status === 'completed' ? 'success' : 'info'" rounded="full">
                  {{ project.status === 'completed' ? 'Completed' : 'In Progress' }}
                </BaseBadge>
                <div class="text-xs text-muted-400">
                  {{ new Date(project.created_at).toLocaleDateString() }}
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </BaseCard>
    </template>
  </div>
</template>
