<script setup lang="ts">
import type { CategoryResearch } from '../../types/research';

definePageMeta({
  title: 'Research Dashboard',
});
useHead({
  title: 'Research Dashboard',
});

// Use research composable
const { 
  researchProjects, 
  loading, 
  error, 
  filters, 
  stats, 
  fetchResearchProjects 
} = useResearch();

// Other imports and computed properties from the original implementation
const { isAuthenticated, getCurrentWorkspaceId } = useAuth();
const toaster = useToaster();
const workspaceId = computed(() => getCurrentWorkspaceId.value || '');
const searchQuery = ref('');

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
    <!-- Stats cards -->
    <div class="grid grid-cols-12 gap-6">
      <!-- Total Projects -->
      <div class="ltablet:col-span-3 col-span-12">
        <BaseCard 
          rounded="md" 
          class="h-full p-6"
        >
          <div class="flex items-center justify-between">
            <div>
              <BaseParagraph size="sm" class="text-muted-400 mb-1">
                Total Projects
              </BaseParagraph>
              <BaseHeading tag="h3" size="2xl" weight="medium" class="text-muted-800 dark:text-white">
                {{ stats.total }}
              </BaseHeading>
            </div>
            <BaseIconBox 
              size="lg" 
              class="bg-primary-500/10 text-primary-500" 
              shape="curved" 
              color="none"
            >
              <Icon name="ph:books-duotone" class="size-6" />
            </BaseIconBox>
          </div>
        </BaseCard>
      </div>
      
      <!-- In Progress -->
      <div class="ltablet:col-span-3 col-span-12">
        <BaseCard 
          rounded="md" 
          class="h-full p-6"
        >
          <div class="flex items-center justify-between">
            <div>
              <BaseParagraph size="sm" class="text-muted-400 mb-1">
                In Progress
              </BaseParagraph>
              <BaseHeading tag="h3" size="2xl" weight="medium" class="text-muted-800 dark:text-white">
                {{ stats.inProgress }}
              </BaseHeading>
            </div>
            <BaseIconBox 
              size="lg" 
              class="bg-info-500/10 text-info-500" 
              shape="curved" 
              color="none"
            >
              <Icon name="ph:clock-duotone" class="size-6" />
            </BaseIconBox>
          </div>
        </BaseCard>
      </div>
      
      <!-- Completed -->
      <div class="ltablet:col-span-3 col-span-12">
        <BaseCard 
          rounded="md" 
          class="h-full p-6"
        >
          <div class="flex items-center justify-between">
            <div>
              <BaseParagraph size="sm" class="text-muted-400 mb-1">
                Completed
              </BaseParagraph>
              <BaseHeading tag="h3" size="2xl" weight="medium" class="text-muted-800 dark:text-white">
                {{ stats.completed }}
              </BaseHeading>
            </div>
            <BaseIconBox 
              size="lg" 
              class="bg-success-500/10 text-success-500" 
              shape="curved" 
              color="none"
            >
              <Icon name="ph:check-circle-duotone" class="size-6" />
            </BaseIconBox>
          </div>
        </BaseCard>
      </div>
      
      <!-- Shared With Me -->
      <div class="ltablet:col-span-3 col-span-12">
        <BaseCard 
          rounded="md" 
          class="h-full p-6"
        >
          <div class="flex items-center justify-between">
            <div>
              <BaseParagraph size="sm" class="text-muted-400 mb-1">
                Shared With Me
              </BaseParagraph>
              <BaseHeading tag="h3" size="2xl" weight="medium" class="text-muted-800 dark:text-white">
                {{ stats.sharedWithMe }}
              </BaseHeading>
            </div>
            <BaseIconBox 
              size="lg" 
              class="bg-yellow-500/10 text-yellow-500" 
              shape="curved" 
              color="none"
            >
              <Icon name="ph:users-three-duotone" class="size-6" />
            </BaseIconBox>
          </div>
        </BaseCard>
      </div>
    </div>
    
    <!-- Research Projects -->
    <BaseCard class="p-6">
      <!-- Header -->
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BaseHeading tag="h2" size="lg" weight="semibold" class="text-muted-800 dark:text-white">
          Research Projects
        </BaseHeading>
        <div class="flex w-full gap-2 sm:w-auto">
          <NuxtLink to="/research/projects/create">
            <BaseButton 
              color="primary"
              class="w-full sm:w-auto"
            >
              <Icon name="ph:plus-circle-duotone" class="me-1 size-4" />
              <span>New Project</span>
            </BaseButton>
          </NuxtLink>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="mb-6 flex flex-col gap-4 sm:flex-row">
        <BaseSelect
          v-model="filters.category"
          :items="categoryOptions"
          placeholder="Filter by category"
          shape="rounded"
          class="w-full sm:w-auto"
        />
        <BaseSelect
          v-model="filters.status"
          :items="statusOptions"
          placeholder="Filter by status"
          shape="rounded"
          class="w-full sm:w-auto"
        />
        <BaseSelect
          v-model="filters.scope"
          :items="scopeOptions"
          placeholder="Filter by scope"
          shape="rounded"
          class="w-full sm:w-auto"
        />
        <div class="ms-auto">
          <BaseInput
            v-model="searchQuery"
            icon="ph:magnifying-glass-duotone"
            placeholder="Search projects..."
            shape="rounded"
            class="w-full sm:w-auto"
          />
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-10">
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
      <div v-else-if="error" class="py-10 text-center">
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
      <div v-else-if="researchProjects.length === 0" class="py-10 text-center">
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
          Get started by creating your first research project. 
          You can collect example books and analyze them to gain insights.
        </BaseParagraph>
        <div class="mt-4">
          <NuxtLink to="/research/projects/create">
            <BaseButton color="primary">
              <Icon name="ph:plus-circle-duotone" class="me-2 size-4" />
              <span>Create First Project</span>
            </BaseButton>
          </NuxtLink>
        </div>
      </div>
      
      <!-- Projects grid -->
      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="project in researchProjects" 
          :key="project.id" 
          class="relative"
        >
          <NuxtLink :to="`/research/projects/${project.id}`">
            <ResearchProjectCard :project="project" />
          </NuxtLink>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
