<script setup lang="ts">
import type { CategoryResearch } from '../types/research';

const props = defineProps<{
  project: CategoryResearch;
}>();

// Format date to readable format
const formatDate = (date: Date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Compute book count
const bookCount = computed(() => {
  return props.project.example_book_ids?.length || 0;
});

// Status badge color
const statusColor = computed(() => {
  return props.project.status === 'completed' ? 'success' : 'info';
});

// Status badge text
const statusText = computed(() => {
  return props.project.status === 'completed' ? 'Completed' : 'In Progress';
});

// Category icon
const categoryIcon = computed(() => {
  const category = props.project.main_category?.toLowerCase() || '';
  
  switch (category) {
    case 'fiction':
      return 'ph:book-open-text-duotone';
    case 'non-fiction':
      return 'ph:book-duotone';
    case 'self-help':
      return 'ph:lightbulb-duotone';
    case 'business':
      return 'ph:briefcase-duotone';
    case 'technical':
      return 'ph:code-duotone';
    default:
      return 'ph:book-bookmark-duotone';
  }
});

// Check if current user is owner
const { getCurrentWorkspaceId } = useAuth();
const isOwner = computed(() => {
  return props.project.owner_id === getCurrentWorkspaceId.value;
});

// Collaborators count
const collaboratorsCount = computed(() => {
  return (props.project.collaborators?.length || 0) - (isOwner.value ? 1 : 0);
});
</script>

<template>
  <BaseCard 
    class="hover:shadow-xl hover:border-primary-500/50 cursor-pointer transition-all duration-300"
    rounded="md"
  >
    <!-- Top badge for shared projects -->
    <div 
      v-if="!isOwner" 
      class="absolute -top-2 -right-2 bg-warning-500 text-white text-xs px-2 py-1 rounded-md z-10"
    >
      Shared
    </div>
    
    <div class="p-6">
      <!-- Category icon -->
      <div class="mb-4 flex justify-between items-center">
        <BaseIconBox 
          size="lg"
          class="bg-primary-500/10 text-primary-500"
          shape="rounded"
          color="none"
        >
          <Icon :name="categoryIcon" class="size-5" />
        </BaseIconBox>
        
        <!-- Status badge -->
        <BaseBadge :color="statusColor" rounded="full">
          {{ statusText }}
        </BaseBadge>
      </div>
      
      <!-- Project title -->
      <BaseHeading 
        as="h3" 
        size="lg" 
        weight="semibold" 
        lead="tight"
        class="text-muted-800 dark:text-white mb-1 line-clamp-1"
      >
        {{ project.main_category }}: {{ project.sub_category }}
      </BaseHeading>
      
      <!-- Description (if exists) -->
      <BaseParagraph 
        v-if="project.sub_category_description"
        size="xs" 
        class="text-muted-400 mb-4 line-clamp-2"
      >
        {{ project.sub_category_description }}
      </BaseParagraph>
      
      <!-- Metadata -->
      <div class="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-muted-200 dark:border-muted-700">
        <!-- Book count -->
        <div class="flex items-center gap-1">
          <Icon name="ph:books-duotone" class="text-muted-400 size-4" />
          <span class="text-muted-500 dark:text-muted-400 text-xs">
            {{ bookCount }} books
          </span>
        </div>
        
        <!-- Collaborator count -->
        <div v-if="collaboratorsCount > 0" class="flex items-center gap-1">
          <Icon name="ph:users-duotone" class="text-muted-400 size-4" />
          <span class="text-muted-500 dark:text-muted-400 text-xs">
            {{ collaboratorsCount }} collaborator{{ collaboratorsCount > 1 ? 's' : '' }}
          </span>
        </div>
        
        <!-- Created date -->
        <div class="flex items-center gap-1 ms-auto">
          <Icon name="ph:calendar-duotone" class="text-muted-400 size-4" />
          <span class="text-muted-500 dark:text-muted-400 text-xs">
            {{ formatDate(project.created_at) }}
          </span>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
