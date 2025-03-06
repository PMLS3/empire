<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCreatorData } from '../composables/useCreatorData';

const { getDataList } = useCreatorData();
const activities = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    // Fetch recent activities
    const result = await getDataList('activities', {
      orderBy: 'timestamp',
      orderDirection: 'desc',
      limit: 50
    });
    
    activities.value = result;
  } catch (error) {
    console.error('Error fetching activities:', error);
  } finally {
    loading.value = false;
  }
});

// Format activity timestamp
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

// Get icon for activity type
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'project_created':
      return 'ph:folder-plus-duotone';
    case 'project_updated':
      return 'ph:folder-notch-duotone';
    case 'video_published':
      return 'ph:video-camera-duotone';
    case 'video_export':
      return 'ph:export-duotone';
    case 'asset_upload':
      return 'ph:upload-duotone';
    case 'comment':
      return 'ph:chat-text-duotone';
    case 'collaboration':
      return 'ph:users-three-duotone';
    default:
      return 'ph:activity-duotone';
  }
};

// Get color for activity type
const getActivityColor = (type: string) => {
  switch (type) {
    case 'project_created':
      return 'primary';
    case 'project_updated':
      return 'info';
    case 'video_published':
      return 'success';
    case 'video_export':
      return 'warning';
    case 'asset_upload':
      return 'purple';
    case 'comment':
      return 'yellow';
    case 'collaboration':
      return 'cyan';
    default:
      return 'muted';
  }
};
</script>

<template>
  <div>
    <BasePageTitle title="Activity Log" subtitle="Recent actions and updates on your projects" />
    
    <BasePlaceholderPage
      v-if="loading"
      title="Loading activities"
      subtitle="Please wait while we load your recent activities"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <BaseCard v-else class="p-6">
      <div v-if="activities.length === 0" class="py-12 text-center">
        <div class="mb-4">
          <Icon name="ph:activity-duotone" class="size-12 mx-auto text-muted-400" />
        </div>
        <BaseHeading size="sm" weight="medium" class="mb-1">No Activity Yet</BaseHeading>
        <BaseText>Your recent activities will appear here</BaseText>
      </div>
      
      <div v-else class="space-y-6">
        <div v-for="(activity, index) in activities" :key="index" class="flex gap-4">
          <!-- Activity icon -->
          <div :class="`size-10 rounded-full bg-${getActivityColor(activity.type)}-100 dark:bg-${getActivityColor(activity.type)}-500/20 flex items-center justify-center`">
            <Icon :name="getActivityIcon(activity.type)" :class="`size-5 text-${getActivityColor(activity.type)}-500`" />
          </div>
          
          <!-- Activity content -->
          <div class="flex-grow">
            <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <BaseHeading size="sm" weight="medium" class="text-muted-900 dark:text-muted-100">
                {{ activity.title }}
              </BaseHeading>
              <BaseTag :color="getActivityColor(activity.type)" size="sm" :label="activity.type.replace('_', ' ')" />
              <div class="flex-grow"></div>
              <BaseText size="xs" class="text-muted-400">
                {{ formatTimestamp(activity.timestamp) }}
              </BaseText>
            </div>
            
            <BaseText class="mt-1">{{ activity.description }}</BaseText>
            
            <!-- Related project or item -->
            <div v-if="activity.projectId || activity.itemId" class="mt-2">
              <NuxtLink 
                :to="activity.projectId ? `/creator/projects/${activity.projectId}` : '#'"
                class="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-2"
              >
                <Icon name="ph:link-duotone" class="size-4" />
                <span>{{ activity.projectTitle || 'View Related Item' }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
