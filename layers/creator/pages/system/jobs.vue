<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const loading = ref(true);
const jobStats = ref<Record<string, any>>({});
const jobs = ref<any[]>([]);
const pollingInterval = ref<number | null>(null);
const autoRefresh = ref(true);
const pollingDelay = ref(5000); // 5 seconds

// Filter state
const statusFilter = ref('all');
const typeFilter = ref('all');
const searchQuery = ref('');

// Fetch job stats from API
const fetchJobStats = async () => {
  try {
    const response = await $fetch('/api/ai/jobs/status');
    jobStats.value = response;
  } catch (error) {
    console.error('Error fetching job stats:', error);
  }
};

// Fetch active jobs
const fetchJobs = async () => {
  loading.value = true;
  
  try {
    const response = await $fetch('/api/ai/jobs', {
      params: {
        limit: 100,
        status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
        type: typeFilter.value !== 'all' ? typeFilter.value : undefined,
        search: searchQuery.value || undefined,
      }
    });
    
    jobs.value = response.jobs || [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
  } finally {
    loading.value = false;
  }
};

// Filtered jobs by status
const filteredJobs = computed(() => {
  if (statusFilter.value === 'all' && typeFilter.value === 'all' && !searchQuery.value) {
    return jobs.value;
  }
  
  return jobs.value.filter(job => {
    const matchesStatus = statusFilter.value === 'all' || job.status === statusFilter.value;
    const matchesType = typeFilter.value === 'all' || job.type === typeFilter.value;
    const matchesSearch = !searchQuery.value || 
      job.id.includes(searchQuery.value) || 
      job.owner_id.includes(searchQuery.value) ||
      (job.data?.prompt && job.data.prompt.toLowerCase().includes(searchQuery.value.toLowerCase()));
    
    return matchesStatus && matchesType && matchesSearch;
  });
});

// Start polling for updates
const startPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }
  
  pollingInterval.value = window.setInterval(() => {
    fetchJobStats();
    fetchJobs();
  }, pollingDelay.value);
};

// Stop polling
const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
};

// Toggle auto-refresh
const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  
  if (autoRefresh.value) {
    startPolling();
  } else {
    stopPolling();
  }
};

// Format time elapsed
const formatTimeElapsed = (timestamp: string) => {
  const startTime = new Date(timestamp).getTime();
  const now = Date.now();
  const elapsed = now - startTime;
  
  // Less than a minute
  if (elapsed < 60000) {
    return `${Math.floor(elapsed / 1000)}s`;
  }
  
  // Less than an hour
  if (elapsed < 3600000) {
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
  
  // More than an hour
  const hours = Math.floor(elapsed / 3600000);
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

// Get color for job status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'info';
    case 'processing':
      return 'warning';
    case 'completed':
      return 'success';
    case 'failed':
      return 'danger';
    default:
      return 'muted';
  }
};

// Initialize data
onMounted(() => {
  fetchJobStats();
  fetchJobs();
  
  if (autoRefresh.value) {
    startPolling();
  }
});

// Clean up
onBeforeUnmount(() => {
  stopPolling();
});
</script>

<template>
  <div>
    <BasePageTitle title="Job Queue Status" subtitle="Monitor and manage AI and rendering jobs" />
    
    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <BaseCard class="p-4">
        <div class="flex flex-col">
          <BaseText size="xs" class="text-muted-500 mb-1">Active Jobs</BaseText>
          <BaseHeading size="xl" weight="medium" class="mb-1">{{ jobStats.activeTasks || 0 }}</BaseHeading>
          <BaseText size="xs" class="text-success-500">
            <Icon name="ph:activity-duotone" class="size-3 me-1 inline" />
            Currently processing
          </BaseText>
        </div>
      </BaseCard>
      
      <BaseCard class="p-4">
        <div class="flex flex-col">
          <BaseText size="xs" class="text-muted-500 mb-1">Jobs Pending</BaseText>
          <BaseHeading size="xl" weight="medium" class="mb-1">{{ jobStats.pendingTasks || 0 }}</BaseHeading>
          <BaseText size="xs" class="text-info-500">
            <Icon name="ph:hourglass-medium-duotone" class="size-3 me-1 inline" />
            In queue
          </BaseText>
        </div>
      </BaseCard>
      
      <BaseCard class="p-4">
        <div class="flex flex-col">
          <BaseText size="xs" class="text-muted-500 mb-1">Completed Today</BaseText>
          <BaseHeading size="xl" weight="medium" class="mb-1">{{ jobStats.completedToday || 0 }}</BaseHeading>
          <BaseText size="xs" class="text-success-500">
            <Icon name="ph:check-circle-duotone" class="size-3 me-1 inline" />
            Successfully processed
          </BaseText>
        </div>
      </BaseCard>
      
      <BaseCard class="p-4">
        <div class="flex flex-col">
          <BaseText size="xs" class="text-muted-500 mb-1">Failed Jobs</BaseText>
          <BaseHeading size="xl" weight="medium" class="mb-1">{{ jobStats.failedToday || 0 }}</BaseHeading>
          <BaseText size="xs" class="text-danger-500">
            <Icon name="ph:warning-circle-duotone" class="size-3 me-1 inline" />
            Errors encountered
          </BaseText>
        </div>
      </BaseCard>
    </div>
    
    <BaseCard>
      <!-- Filters Header -->
      <div class="p-4 border-b border-muted-200 dark:border-muted-700">
        <div class="flex flex-wrap gap-3 items-center justify-between">
          <BaseHeading size="sm" weight="medium">Job Queue</BaseHeading>
          
          <div class="flex flex-wrap gap-2 items-center">
            <div class="flex items-center gap-2">
              <BaseInput
                v-model="searchQuery"
                placeholder="Search jobs..."
                icon="ph:magnifying-glass"
                type="search"
                size="sm"
                class="w-44"
                @keyup.enter="fetchJobs"
              />
              
              <BaseSelect v-model="statusFilter" size="sm" class="w-32">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </BaseSelect>
              
              <BaseSelect v-model="typeFilter" size="sm" class="w-40">
                <option value="all">All Types</option>
                <option value="text-generation">Text Generation</option>
                <option value="speech-synthesis">Speech Synthesis</option>
                <option value="image-generation">Image Generation</option>
                <option value="video-rendering">Video Rendering</option>
              </BaseSelect>
            </div>
            
            <BaseButton
              size="sm"
              color="default"
              @click="fetchJobs"
            >
              <Icon name="ph:funnel-duotone" class="me-1" />
              Filter
            </BaseButton>
            
            <BaseButton
              size="sm"
              :color="autoRefresh ? 'success' : 'default'"
              @click="toggleAutoRefresh"
            >
              <Icon
                :name="autoRefresh ? 'ph:spinner-gap-duotone' : 'ph:spinner-gap-duotone'" 
                class="me-1"
                :class="{ 'animate-spin': autoRefresh }"
              />
              {{ autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off' }}
            </BaseButton>
          </div>
        </div>
      </div>
      
      <!-- Jobs Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-muted-200 dark:border-muted-700">
              <th class="text-left py-3 px-4 text-[0.825rem] text-muted-500">ID</th>
              <th class="text-left py-3 px-4 text-[0.825rem] text-muted-500">Type</th>
              <th class="text-left py-3 px-4 text-[0.825rem] text-muted-500">Status</th>
              <th class="text-left py-3 px-4 text-[0.825rem] text-muted-500">Progress</th>
              <th class="text-left py-3 px-4 text-[0.825rem] text-muted-500">Created</th>
              <th class="text-left py-3 px-4 text-[0.825rem] text-muted-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="border-b border-muted-200 dark:border-muted-700">
              <td colspan="6" class="py-8 text-center">
                <div class="inline-flex items-center">
                  <Icon name="ph:spinner-gap" class="size-5 animate-spin me-2" />
                  <span>Loading jobs...</span>
                </div>
              </td>
            </tr>
            
            <tr v-else-if="filteredJobs.length === 0" class="border-b border-muted-200 dark:border-muted-700">
              <td colspan="6" class="py-8 text-center text-muted-500">
                No jobs found matching your criteria
              </td>
            </tr>
            
            <tr
              v-for="job in filteredJobs"
              :key="job.id"
              class="border-b border-muted-200 dark:border-muted-700 hover:bg-muted-50 dark:hover:bg-muted-800/30"
            >
              <td class="py-3 px-4 font-mono text-xs">{{ job.id.substr(0, 8) }}...</td>
              <td class="py-3 px-4">
                <div class="flex items-center">
                  <Icon
                    :name="job.type === 'text-generation' ? 'ph:text-t-duotone' : 
                           job.type === 'speech-synthesis' ? 'ph:waveform-duotone' :
                           job.type === 'image-generation' ? 'ph:image-duotone' : 
                           'ph:film-strip-duotone'"
                    class="size-4 me-2"
                  />
                  <span>{{ job.type.replace('-', ' ') }}</span>
                </div>
              </td>
              <td class="py-3 px-4">
                <BaseTag
                  :color="getStatusColor(job.status)"
                  size="sm"
                  :label="job.status"
                  :class="{ 'animate-pulse': job.status === 'processing' }"
                />
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <div class="w-32 bg-muted-200 dark:bg-muted-700 rounded-full h-2 overflow-hidden">
                    <div
                      class="h-full rounded-full"
                      :class="{
                        'bg-primary-500': job.status === 'processing',
                        'bg-success-500': job.status === 'completed',
                        'bg-danger-500': job.status === 'failed',
                        'bg-info-500': job.status === 'pending'
                      }"
                      :style="{
                        width: `${job.progress || 0}%`
                      }"
                    ></div>
                  </div>
                  <span class="text-xs text-muted-500">{{ job.progress || 0 }}%</span>
                </div>
              </td>
              <td class="py-3 px-4 text-muted-500 text-sm">
                <div>{{ new Date(job.created_at).toLocaleString() }}</div>
                <div class="text-xs">{{ formatTimeElapsed(job.created_at) }} ago</div>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <BaseButton size="xs" color="default">
                    <Icon name="ph:info-duotone" class="size-3 me-1" />
                    Details
                  </BaseButton>
                  
                  <BaseButton
                    v-if="job.status !== 'completed' && job.status !== 'failed'"
                    size="xs"
                    color="danger"
                  >
                    <Icon name="ph:x-square-duotone" class="size-3 me-1" />
                    Cancel
                  </BaseButton>
                  
                  <BaseButton
                    v-if="job.status === 'failed'"
                    size="xs"
                    color="warning"
                  >
                    <Icon name="ph:arrows-clockwise-duotone" class="size-3 me-1" />
                    Retry
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>
  </div>
</template>
