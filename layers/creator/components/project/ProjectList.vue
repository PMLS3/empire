<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useCreatorData } from '../../composables/useCreatorData';
import type { VideoProject } from '../../types/project';

const props = defineProps<{
  channelId?: string;
  limit?: number;
}>();

const { queryData, searchByVector, loading, error } = useCreatorData();

const projects = ref<Array<VideoProject>>([]);
const searchQuery = ref('');
const searchResults = ref<Array<VideoProject>>([]);
const isSearching = ref(false);

// Filter states
const filters = ref({
  status: '',
  videoType: '',
  platform: '',
  dateRange: '',
});

// Sorting state
const sortBy = ref('updated_at');
const sortDirection = ref('desc');

// Load projects based on props and filters
const loadProjects = async () => {
  try {
    // Build filter object
    const filterObject = {} as Record<string, any>;
    
    // Add channel filter if provided
    if (props.channelId) {
      filterObject.channel_id = props.channelId;
    }
    
    // Add status filter if selected
    if (filters.value.status) {
      filterObject.status = filters.value.status;
    }
    
    // Add video type filter if selected
    if (filters.value.videoType) {
      filterObject.video_type = filters.value.videoType;
    }
    
    // Add platform filter if selected
    if (filters.value.platform) {
      filterObject[`target_platform`] = filters.value.platform;
    }
    
    // Add date range filter if selected
    if (filters.value.dateRange) {
      // Implementation depends on date range format
      // This is a placeholder for the actual implementation
      const dateFilter = getDateFilter(filters.value.dateRange);
      if (dateFilter) {
        filterObject.created_at = dateFilter;
      }
    }
    
    const response = await queryData('projects', {
      filters: filterObject,
      limit: props.limit || 20,
      orderBy: sortBy.value,
      orderDirection: sortDirection.value,
    });
    
    if (Array.isArray(response)) {
      projects.value = response;
    }
  } catch (err) {
    console.error('Error loading projects:', err);
  }
};

// Handle search with vector search
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    isSearching.value = false;
    return;
  }
  
  isSearching.value = true;
  
  try {
    // Build filter object
    const filterObject = {} as Record<string, any>;
    
    // Add channel filter if provided
    if (props.channelId) {
      filterObject.channel_id = props.channelId;
    }
    
    const results = await searchByVector(
      'projects',
      searchQuery.value,
      {
        filters: filterObject,
        limit: props.limit || 20,
      }
    );
    
    if (Array.isArray(results)) {
      searchResults.value = results;
    }
  } catch (err) {
    console.error('Error searching projects:', err);
  }
};

// Debounce search to avoid excessive API calls
const debouncedSearch = useDebounceFn(handleSearch, 300);

// Watch for search query changes
watch(searchQuery, () => {
  if (searchQuery.value.trim()) {
    debouncedSearch();
  } else {
    searchResults.value = [];
    isSearching.value = false;
  }
});

// Watch for filter changes
watch([filters, sortBy, sortDirection], () => {
  loadProjects();
}, { deep: true });

// Helper function to determine date filter
const getDateFilter = (range: string) => {
  const now = new Date();
  
  switch (range) {
    case 'today':
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      return { $gte: startOfDay.toISOString() };
      
    case 'week':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return { $gte: startOfWeek.toISOString() };
      
    case 'month':
      const startOfMonth = new Date(now);
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      return { $gte: startOfMonth.toISOString() };
      
    default:
      return null;
  }
};

// Computed property to display projects or search results
const displayedProjects = computed(() => {
  return searchQuery.value.trim() ? searchResults.value : projects.value;
});

// Initial load
onMounted(() => {
  loadProjects();
});
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
        v-for="project in displayedProjects" 
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
