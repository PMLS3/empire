<script setup lang="ts">
import type { VideoProject } from '../../types/project';

const props = defineProps<{
  projects: VideoProject[];
  loading?: boolean;
}>();

const emit = defineEmits(['view', 'edit']);

// Project status colors
const statusColors = {
  'draft': 'warning',
  'in_progress': 'info',
  'ready_to_publish': 'success',
  'published': 'primary',
  'archived': 'muted',
};

// Format duration in minutes and seconds
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
};

// Format date to relative time (e.g., "2 days ago")
const formatDate = (date: Date | string): string => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    }
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString(undefined, options);
};
</script>

<template>
  <div>
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BaseCard v-for="i in 6" :key="`skeleton-${i}`" class="p-0">
        <div class="bg-muted-200 dark:bg-muted-700/40 h-40 animate-pulse"></div>
        <div class="p-4 space-y-3">
          <div class="bg-muted-200 dark:bg-muted-700/40 h-4 rounded animate-pulse"></div>
          <div class="bg-muted-200 dark:bg-muted-700/40 h-3 rounded w-3/4 animate-pulse"></div>
          <div class="flex justify-between items-center">
            <div class="bg-muted-200 dark:bg-muted-700/40 h-6 w-1/4 rounded animate-pulse"></div>
            <div class="bg-muted-200 dark:bg-muted-700/40 h-6 w-1/4 rounded-full animate-pulse"></div>
          </div>
        </div>
      </BaseCard>
    </div>
  
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BaseCard 
        v-for="project in projects" 
        :key="project.id"
        class="p-0 hover:border-primary-500 transition-colors duration-300 cursor-pointer"
        @click="emit('view', project)"
      >
        <div class="relative h-40 bg-muted-200 dark:bg-muted-700/40 overflow-hidden">
          <img 
            v-if="project.thumbnail_url" 
            :src="project.thumbnail_url" 
            :alt="project.title"
            class="w-full h-full object-cover object-center"
          >
          <div v-else class="h-full w-full flex items-center justify-center">
            <Icon name="ph:video-duotone" class="size-12 text-muted-400" />
          </div>
          
          <!-- Status Badge -->
          <div class="absolute top-3 right-3">
            <BaseTag 
              :color="statusColors[project.status] || 'default'"
              rounded="full"
              size="sm"
            >
              {{ project.status.replace('_', ' ') }}
            </BaseTag>
          </div>
          
          <!-- Platform Icons -->
          <div class="absolute bottom-3 left-3 flex gap-2">
            <BaseTooltip v-for="platform in project.target_platform" :key="platform" :text="platform">
              <div class="bg-white dark:bg-muted-800 rounded-full p-1 shadow-sm">
                <Icon v-if="platform === 'youtube'" name="logos:youtube-icon" class="size-4" />
                <Icon v-else-if="platform === 'tiktok'" name="logos:tiktok-icon" class="size-4" />
                <Icon v-else-if="platform === 'instagram'" name="mdi:instagram" class="size-4" />
                <Icon v-else-if="platform === 'facebook'" name="mdi:facebook" class="size-4" />
                <Icon v-else name="ph:social-duotone" class="size-4" />
              </div>
            </BaseTooltip>
          </div>
        </div>
        
        <div class="p-4 space-y-2">
          <BaseHeading as="h3" size="sm" weight="medium" class="line-clamp-1">
            {{ project.title }}
          </BaseHeading>
          
          <BaseText size="xs" class="text-muted-500 line-clamp-1">
            {{ project.description || 'No description' }}
          </BaseText>
          
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center gap-2">
              <BaseTooltip text="Video Duration">
                <div class="flex items-center gap-1 text-muted-500">
                  <Icon name="ph:clock-duotone" class="size-4" />
                  <BaseText size="xs">{{ formatDuration(project.settings.duration_target) }}</BaseText>
                </div>
              </BaseTooltip>
              
              <BaseTooltip text="Video Format">
                <div class="flex items-center gap-1 text-muted-500">
                  <Icon name="ph:layout-duotone" class="size-4" />
                  <BaseText size="xs">{{ project.settings.format }}</BaseText>
                </div>
              </BaseTooltip>
            </div>
            
            <BaseTooltip text="Last Updated">
              <div class="flex items-center gap-1 text-muted-500">
                <Icon name="ph:calendar-check-duotone" class="size-4" />
                <BaseText size="xs">{{ formatDate(project.updated_at) }}</BaseText>
              </div>
            </BaseTooltip>
          </div>
          
          <div class="pt-3 flex justify-between border-t border-muted-200 dark:border-muted-700 mt-3">
            <BaseButtonIcon
              size="sm"
              color="default"
              @click.stop="emit('view', project)"
            >
              <Icon name="ph:eye-duotone" class="size-4" />
            </BaseButtonIcon>
            
            <BaseButtonIcon
              size="sm"
              color="default"
              @click.stop="emit('edit', project)"
            >
              <Icon name="ph:pencil-simple-duotone" class="size-4" />
            </BaseButtonIcon>
          </div>
        </div>
      </BaseCard>
      
      <!-- Empty State -->
      <div v-if="projects.length === 0" class="col-span-full py-12 flex flex-col items-center justify-center">
        <Icon name="ph:folder-simple-dashed-duotone" class="mb-4 size-16 text-muted-400" />
        <BaseHeading as="h3" size="md" class="mb-1">No Projects Found</BaseHeading>
        <BaseText class="text-muted-500 text-center mb-6 max-w-md">
          You don't have any video projects yet. Create your first project to get started.
        </BaseText>
        <BaseButton to="/projects/new" color="primary">
          <Icon name="ph:plus-duotone" class="me-1 size-4" />
          Create New Project
        </BaseButton>
      </div>
    </div>
  </div>
</template>
