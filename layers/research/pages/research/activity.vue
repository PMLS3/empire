<script setup lang="ts">
definePageMeta({
  title: 'Research Activity',
});
useHead({
  title: 'Research Activity',
});

const { isAuthenticated } = useAuth();
const toaster = useToaster();

// Activity data
const loading = ref(true);
const error = ref(null);
const activities = ref([]);

// Mock activity data - in a real app, this would come from an API
const mockActivities = [
  {
    id: '1',
    type: 'project_created',
    user: {
      id: '1',
      name: 'John Doe',
      avatar: '/img/avatars/1.svg'
    },
    project: {
      id: '1',
      title: 'Fiction: Fantasy'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 20) // 20 mins ago
  },
  {
    id: '2',
    type: 'book_added',
    user: {
      id: '1',
      name: 'John Doe',
      avatar: '/img/avatars/1.svg'
    },
    project: {
      id: '1',
      title: 'Fiction: Fantasy'
    },
    book: {
      id: '1',
      title: 'The Lord of the Rings'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
  },
  {
    id: '3',
    type: 'collaborator_added',
    user: {
      id: '1',
      name: 'John Doe',
      avatar: '/img/avatars/1.svg'
    },
    project: {
      id: '2',
      title: 'Business: Marketing'
    },
    collaborator: {
      id: '2',
      name: 'Jane Smith',
      avatar: '/img/avatars/2.svg'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: '4',
    type: 'embeddings_generated',
    user: {
      id: '1',
      name: 'John Doe',
      avatar: '/img/avatars/1.svg'
    },
    project: {
      id: '1',
      title: 'Fiction: Fantasy'
    },
    book: {
      id: '1',
      title: 'The Lord of the Rings'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
  },
  {
    id: '5',
    type: 'project_completed',
    user: {
      id: '1',
      name: 'John Doe',
      avatar: '/img/avatars/1.svg'
    },
    project: {
      id: '3',
      title: 'Self-Help: Productivity'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
  }
];

// Fetch activity data
const fetchActivityData = async () => {
  if (!isAuthenticated.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // In a real app, this would be an API call
    // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    activities.value = mockActivities;
  } catch (err) {
    console.error('Error fetching activity data:', err);
    error.value = err.message || 'Failed to load activity data';
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

// Format relative time
const formatRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  }
};

// Get icon for activity type
const getActivityIcon = (type) => {
  switch (type) {
    case 'project_created':
      return 'ph:folder-plus-duotone';
    case 'book_added':
      return 'ph:book-open-duotone';
    case 'collaborator_added':
      return 'ph:users-duotone';
    case 'embeddings_generated':
      return 'ph:cube-duotone';
    case 'project_completed':
      return 'ph:check-circle-duotone';
    default:
      return 'ph:activity-duotone';
  }
};

// Get message for activity type
const getActivityMessage = (activity) => {
  switch (activity.type) {
    case 'project_created':
      return `created research project "${activity.project.title}"`;
    case 'book_added':
      return `added book "${activity.book.title}" to "${activity.project.title}"`;
    case 'collaborator_added':
      return `added ${activity.collaborator.name} as a collaborator to "${activity.project.title}"`;
    case 'embeddings_generated':
      return `generated vector embeddings for "${activity.book.title}"`;
    case 'project_completed':
      return `marked project "${activity.project.title}" as completed`;
    default:
      return 'performed an activity';
  }
};

// Get color for activity type
const getActivityColor = (type) => {
  switch (type) {
    case 'project_created':
      return 'primary';
    case 'book_added':
      return 'info';
    case 'collaborator_added':
      return 'yellow';
    case 'embeddings_generated':
      return 'violet';
    case 'project_completed':
      return 'success';
    default:
      return 'muted';
  }
};

// Watch for authentication state to load data
watch(
  isAuthenticated,
  (newVal) => {
    if (newVal) {
      fetchActivityData();
    } else {
      activities.value = [];
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="space-y-6 pb-20 pt-4">
    <BaseCard class="p-6">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <BaseHeading tag="h2" size="lg" weight="semibold" class="text-muted-800 dark:text-white">
          Recent Activity
        </BaseHeading>
        <BaseButton color="muted" @click="fetchActivityData" :loading="loading">
          <Icon name="ph:arrows-clockwise-duotone" class="me-2 size-4" />
          <span>Refresh</span>
        </BaseButton>
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
          Error Loading Activity
        </BaseHeading>
        <BaseParagraph size="sm" class="text-muted-400 mt-2 max-w-md mx-auto">
          {{ error }}
        </BaseParagraph>
        <div class="mt-4">
          <BaseButton color="primary" @click="fetchActivityData">
            <Icon name="ph:arrow-clockwise-duotone" class="me-2 size-4" />
            <span>Retry</span>
          </BaseButton>
        </div>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="activities.length === 0" class="py-10 text-center">
        <div class="mb-4 flex justify-center">
          <BaseIconBox
            size="lg"
            class="bg-info-500/10 text-info-500"
            shape="full"
            color="none"
          >
            <Icon name="ph:activity-duotone" class="size-10" />
          </BaseIconBox>
        </div>
        <BaseHeading tag="h4" size="lg" weight="medium" class="text-muted-800 dark:text-white">
          No Recent Activity
        </BaseHeading>
        <BaseParagraph size="sm" class="text-muted-400 mt-2 max-w-md mx-auto">
          Get started by creating research projects, adding books, or collaborating with others.
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
      
      <!-- Activity list -->
      <div v-else class="divide-y divide-muted-200 dark:divide-muted-700">
        <div 
          v-for="activity in activities" 
          :key="activity.id"
          class="py-4 flex items-start gap-3"
        >
          <!-- User avatar -->
          <BaseAvatar
            :src="activity.user.avatar"
            size="sm"
            :alt="activity.user.name"
          />
          
          <!-- Activity icon -->
          <BaseIconBox
            :size="8"
            :class="`bg-${getActivityColor(activity.type)}-500/10 text-${getActivityColor(activity.type)}-500`"
            shape="full"
            color="none"
          >
            <Icon :name="getActivityIcon(activity.type)" class="size-4" />
          </BaseIconBox>
          
          <!-- Activity content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1">
              <span class="font-medium text-muted-800 dark:text-white">{{ activity.user.name }}</span>
              <span class="text-muted-400">{{ getActivityMessage(activity) }}</span>
            </div>
            <div class="text-xs text-muted-400 mt-1">
              {{ formatRelativeTime(activity.timestamp) }}
            </div>
          </div>
          
          <!-- Action buttons if needed -->
          <div v-if="activity.project">
            <NuxtLink :to="`/research/projects/${activity.project.id}`">
              <BaseButtonIcon
                size="xs"
                shape="curved"
                color="muted"
                v-tooltip="'View Project'"
              >
                <Icon name="ph:arrow-square-out-duotone" class="size-4" />
              </BaseButtonIcon>
            </NuxtLink>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
