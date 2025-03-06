<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCreatorData } from '../../composables/useCreatorData';
import { useToaster } from '../../../shared/composables/toaster';

const props = defineProps<{
  projectId: string;
}>();

const emit = defineEmits(['published', 'scheduledPublish', 'publishFailed']);

const { getDataById, updateData } = useCreatorData();
const toaster = useToaster();

// UI state variables
const loading = ref(false);
const publishing = ref(false);
const platformLoading = ref<Record<string, boolean>>({});
const projectData = ref<any>(null);
const error = ref<string | null>(null);

// Connected platforms
const connectedPlatforms = ref<Array<{
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  account_name?: string;
  channel_name?: string;
  status?: string;
  lastPublished?: string;
}>>([
  { id: 'youtube', name: 'YouTube', icon: 'logos:youtube-icon', connected: false },
  { id: 'tiktok', name: 'TikTok', icon: 'logos:tiktok-icon', connected: false },
  { id: 'instagram', name: 'Instagram', icon: 'mdi:instagram', connected: false },
  { id: 'facebook', name: 'Facebook', icon: 'mdi:facebook', connected: false },
]);

// Publication settings
const publishSettings = ref({
  platforms: [] as string[],
  schedule: {
    enabled: false,
    date: '',
    time: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  metadata: {
    title: '',
    description: '',
    tags: [] as string[],
    category: '',
    visibility: 'public', // public, unlisted, private
    allowComments: true,
    allowEmbedding: true,
  },
});

// Visibility options
const visibilityOptions = [
  { value: 'public', label: 'Public', description: 'Anyone can search for and view' },
  { value: 'unlisted', label: 'Unlisted', description: 'Only people with the link can view' },
  { value: 'private', label: 'Private', description: 'Only you can view' },
];

// Schedule date/time computing
const minDate = computed(() => {
  // Today's date in YYYY-MM-DD format
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const currentTime = computed(() => {
  // Current time in HH:MM format
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
});

// Load project data
onMounted(async () => {
  loading.value = true;
  
  try {
    const data = await getDataById('projects', props.projectId);
    projectData.value = data;
    
    // Check if video has been exported already
    const hasExport = data?.export_jobs?.some(job => job.status === 'completed');
    if (!hasExport) {
      error.value = 'You need to export your video before publishing';
    }
    
    // Initialize publication settings from project data
    publishSettings.value.metadata.title = data?.title || '';
    publishSettings.value.metadata.description = data?.description || '';
    publishSettings.value.metadata.tags = data?.metadata?.tags || [];
    publishSettings.value.metadata.category = data?.metadata?.category || '';
    
    // Initialize selected platforms from project data
    publishSettings.value.platforms = data?.target_platform || [];
    
    // Load connected platform status
    await loadPlatformData();
  } catch (err) {
    console.error('Error loading project data:', err);
    error.value = 'Failed to load project data';
    toaster.show({
      title: 'Error',
      message: 'Failed to load project data',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    loading.value = false;
  }
});

// Load platform connection data
const loadPlatformData = async () => {
  try {
    const response = await $fetch('/api/social/platforms', {
      method: 'GET'
    });
    
    if (response?.platforms) {
      connectedPlatforms.value = connectedPlatforms.value.map(platform => {
        const connectedPlatform = response.platforms.find(p => p.id === platform.id);
        if (connectedPlatform) {
          return {
            ...platform,
            connected: true,
            account_name: connectedPlatform.account_name,
            channel_name: connectedPlatform.channel_name,
            status: connectedPlatform.status,
            lastPublished: connectedPlatform.lastPublished,
          };
        }
        return platform;
      });
    }
  } catch (err) {
    console.error('Error loading platform data:', err);
  }
};

// Connect platform (OAuth flow)
const connectPlatform = async (platformId: string) => {
  platformLoading.value[platformId] = true;
  
  try {
    const response = await $fetch(`/api/social/connect/${platformId}`, {
      method: 'GET'
    });
    
    if (response?.auth_url) {
      // Open OAuth flow in a popup window
      const popupWidth = 600;
      const popupHeight = 700;
      const left = window.innerWidth / 2 - popupWidth / 2;
      const top = window.innerHeight / 2 - popupHeight / 2;
      
      const popup = window.open(
        response.auth_url,
        `Connect ${platformId}`,
        `width=${popupWidth},height=${popupHeight},top=${top},left=${left}`
      );
      
      // Set up event listener for OAuth callback
      window.addEventListener('message', async (event) => {
        if (event.data?.type === 'oauth_callback' && event.data?.platform === platformId) {
          if (event.data?.success) {
            // Update connected platforms
            await loadPlatformData();
            
            toaster.show({
              title: 'Success',
              message: `Connected to ${platformId}`,
              color: 'success',
              icon: 'ph:check-circle-duotone',
            });
          } else {
            toaster.show({
              title: 'Error',
              message: `Failed to connect to ${platformId}`,
              color: 'danger',
              icon: 'ph:warning-circle-duotone',
            });
          }
          
          // Close popup
          if (popup) popup.close();
        }
      });
    } else {
      throw new Error('No auth URL returned');
    }
  } catch (err) {
    console.error('Error connecting to platform:', err);
    toaster.show({
      title: 'Error',
      message: `Failed to start ${platformId} connection`,
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    platformLoading.value[platformId] = false;
  }
};

// Disconnect platform
const disconnectPlatform = async (platformId: string) => {
  platformLoading.value[platformId] = true;
  
  try {
    await $fetch(`/api/social/disconnect/${platformId}`, {
      method: 'POST'
    });
    
    // Update connected platforms
    await loadPlatformData();
    
    // Remove from selected platforms
    publishSettings.value.platforms = publishSettings.value.platforms.filter(p => p !== platformId);
    
    toaster.show({
      title: 'Success',
      message: `Disconnected from ${platformId}`,
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (err) {
    console.error('Error disconnecting platform:', err);
    toaster.show({
      title: 'Error',
      message: `Failed to disconnect from ${platformId}`,
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    platformLoading.value[platformId] = false;
  }
};

// Toggle platform selection
const togglePlatform = (platformId: string) => {
  const platform = connectedPlatforms.value.find(p => p.id === platformId);
  
  if (!platform?.connected) {
    // If platform is not connected, start connection flow
    connectPlatform(platformId);
    return;
  }
  
  const index = publishSettings.value.platforms.indexOf(platformId);
  if (index === -1) {
    // Add platform
    publishSettings.value.platforms.push(platformId);
  } else {
    // Remove platform
    publishSettings.value.platforms.splice(index, 1);
  }
};

// Get the latest completed export URL
const getExportUrl = computed(() => {
  if (!projectData.value?.export_jobs || projectData.value.export_jobs.length === 0) {
    return null;
  }
  
  const completedJobs = projectData.value.export_jobs.filter(job => job.status === 'completed');
  if (completedJobs.length === 0) {
    return null;
  }
  
  // Sort by completed date (newest first)
  completedJobs.sort((a, b) => {
    return new Date(b.completed_at || b.created_at).getTime() - 
           new Date(a.completed_at || a.created_at).getTime();
  });
  
  return completedJobs[0].url;
});

// Publish immediately
const publishNow = async () => {
  if (publishSettings.value.platforms.length === 0) {
    toaster.show({
      title: 'Error',
      message: 'Please select at least one platform',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  if (!getExportUrl.value) {
    toaster.show({
      title: 'Error',
      message: 'No exported video available',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  publishing.value = true;
  
  try {
    // Call the publish API endpoint
    const response = await $fetch('/api/social/publish', {
      method: 'POST',
      body: {
        project_id: props.projectId,
        video_url: getExportUrl.value,
        platforms: publishSettings.value.platforms,
        metadata: publishSettings.value.metadata,
      }
    });
    
    if (response?.success) {
      // Update project data with publication info
      await updateData('projects', props.projectId, {
        publications: [
          ...(projectData.value?.publications || []),
          {
            platforms: publishSettings.value.platforms,
            metadata: publishSettings.value.metadata,
            published_at: new Date().toISOString(),
            status: 'published',
          }
        ]
      });
      
      // Notify parent component
      emit('published', { 
        platforms: publishSettings.value.platforms,
        metadata: publishSettings.value.metadata
      });
      
      toaster.show({
        title: 'Success',
        message: 'Your video has been published',
        color: 'success',
        icon: 'ph:check-circle-duotone',
      });
    } else {
      throw new Error('Failed to publish video');
    }
  } catch (err) {
    console.error('Error publishing video:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to publish video',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    
    emit('publishFailed', { error: err.message || 'Unknown error' });
  } finally {
    publishing.value = false;
  }
};

// Schedule publication
const schedulePublication = async () => {
  if (publishSettings.value.platforms.length === 0) {
    toaster.show({
      title: 'Error',
      message: 'Please select at least one platform',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  if (!publishSettings.value.schedule.date || !publishSettings.value.schedule.time) {
    toaster.show({
      title: 'Error',
      message: 'Please set a date and time for scheduling',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  publishing.value = true;
  
  try {
    // Parse the scheduled date and time
    const scheduledDate = new Date(
      `${publishSettings.value.schedule.date}T${publishSettings.value.schedule.time}`
    );
    
    // Call the schedule API endpoint
    const response = await $fetch('/api/social/schedule', {
      method: 'POST',
      body: {
        project_id: props.projectId,
        platforms: publishSettings.value.platforms,
        metadata: publishSettings.value.metadata,
        schedule_time: scheduledDate.toISOString(),
        timezone: publishSettings.value.schedule.timezone,
      }
    });
    
    if (response?.job_id) {
      // Update project data with schedule info
      await updateData('projects', props.projectId, {
        schedule: {
          job_id: response.job_id,
          platforms: publishSettings.value.platforms,
          metadata: publishSettings.value.metadata,
          schedule_time: scheduledDate.toISOString(),
          timezone: publishSettings.value.schedule.timezone,
          status: 'scheduled',
          created_at: new Date().toISOString(),
        }
      });
      
      // Notify parent component
      emit('scheduledPublish', { 
        jobId: response.job_id,
        platforms: publishSettings.value.platforms,
        metadata: publishSettings.value.metadata,
        scheduleTime: scheduledDate,
        timezone: publishSettings.value.schedule.timezone,
      });
      
      toaster.show({
        title: 'Success',
        message: 'Your video has been scheduled for publication',
        color: 'success',
        icon: 'ph:check-circle-duotone',
      });
    } else {
      throw new Error('Failed to schedule video');
    }
  } catch (err) {
    console.error('Error scheduling video:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to schedule video',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    
    emit('publishFailed', { error: err.message || 'Unknown error' });
  } finally {
    publishing.value = false;
  }
};

// Add a tag to metadata
const addTag = () => {
  const tagsInput = document.getElementById('tags-input') as HTMLInputElement;
  if (tagsInput && tagsInput.value.trim()) {
    const newTag = tagsInput.value.trim();
    if (!publishSettings.value.metadata.tags.includes(newTag)) {
      publishSettings.value.metadata.tags.push(newTag);
      tagsInput.value = '';
    }
  }
};

// Remove a tag from metadata
const removeTag = (tagToRemove: string) => {
  publishSettings.value.metadata.tags = publishSettings.value.metadata.tags.filter(tag => tag !== tagToRemove);
};
</script>

<template>
  <div>
    <BaseHeading as="h3" size="md" weight="medium" class="mb-4">
      Publish Video
    </BaseHeading>
    
    <BasePlaceholderPage
      v-if="loading"
      title="Loading project"
      subtitle="Please wait while we load your project data"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <BaseMessage v-else-if="error" type="danger" class="mb-4">
      {{ error }}
    </BaseMessage>
    
    <div v-else class="grid grid-cols-12 gap-6">
      <!-- Platforms Column -->
      <div class="col-span-12 lg:col-span-4">
        <BaseCard class="p-4 md:p-6">
          <BaseHeading as="h4" size="sm" weight="medium" class="mb-4">
            Select Platforms
          </BaseHeading>
          
          <div class="space-y-3">
            <div 
              v-for="platform in connectedPlatforms" 
              :key="platform.id"
              class="border-muted-200 dark:border-muted-700 border rounded-lg p-4 hover:border-primary-500 transition-colors cursor-pointer"
              :class="{
                'border-primary-500 bg-primary-50 dark:bg-primary-500/10': publishSettings.platforms.includes(platform.id)
              }"
              @click="togglePlatform(platform.id)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="size-10 flex items-center justify-center">
                    <Icon :name="platform.icon" class="size-6" />
                  </div>
                  <div class="flex flex-col">
                    <BaseText weight="medium">{{ platform.name }}</BaseText>
                    <BaseText size="xs" class="text-muted-500" v-if="platform.connected">
                      {{ platform.account_name || 'Connected' }}
                    </BaseText>
                    <BaseText size="xs" class="text-muted-500" v-else>
                      Not connected
                    </BaseText>
                  </div>
                </div>
                
                <div class="flex items-center">
                  <!-- Loading state -->
                  <BaseSpinner v-if="platformLoading[platform.id]" size="xs" color="primary" />
                  
                  <!-- Connected state with checkbox -->
                  <div v-else-if="platform.connected" class="flex gap-2 items-center">
                    <BaseCheckbox 
                      :model-value="publishSettings.platforms.includes(platform.id)"
                      :name="`platform-${platform.id}`"
                      color="primary"
                      class="pointer-events-none"
                    />
                    
                    <BaseButtonIcon
                      size="xs"
                      color="danger"
                      variant="ghost"
                      @click.stop="disconnectPlatform(platform.id)"
                      class="ms-2"
                      v-tooltip="'Disconnect'"
                    >
                      <Icon name="ph:link-break-duotone" class="size-4" />
                    </BaseButtonIcon>
                  </div>
                  
                  <!-- Not connected state with connect button -->
                  <BaseButton
                    v-else
                    size="sm"
                    color="primary"
                    variant="outline"
                    @click.stop="connectPlatform(platform.id)"
                  >
                    Connect
                  </BaseButton>
                </div>
              </div>
            </div>
            
            <div v-if="publishSettings.platforms.length === 0" class="text-center py-4">
              <BaseText class="text-muted-500">
                Please connect and select at least one platform
              </BaseText>
            </div>
          </div>
        </BaseCard>
        
        <!-- Schedule Section -->
        <BaseCard class="p-4 md:p-6 mt-4">
          <BaseHeading as="h4" size="sm" weight="medium" class="mb-4">
            Schedule
          </BaseHeading>
          
          <div class="space-y-4">
            <BaseCheckbox v-model="publishSettings.schedule.enabled">
              Schedule for later
            </BaseCheckbox>
            
            <div v-if="publishSettings.schedule.enabled" class="space-y-4">
              <!-- Date picker -->
              <div>
                <label class="nui-label pb-2 text-[0.825rem]">Date</label>
                <BaseInput
                  v-model="publishSettings.schedule.date"
                  type="date"
                  :min="minDate"
                />
              </div>
              
              <!-- Time picker -->
              <div>
                <label class="nui-label pb-2 text-[0.825rem]">Time</label>
                <BaseInput
                  v-model="publishSettings.schedule.time"
                  type="time"
                />
              </div>
              
              <!-- Timezone -->
              <div>
                <label class="nui-label pb-2 text-[0.825rem]">Timezone</label>
                <BaseText size="xs" class="text-muted-500">
                  {{ publishSettings.schedule.timezone }}
                </BaseText>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
      
      <!-- Metadata Column -->
      <div class="col-span-12 lg:col-span-8">
        <BaseCard class="p-4 md:p-6">
          <BaseHeading as="h4" size="sm" weight="medium" class="mb-4">
            Video Details
          </BaseHeading>
          
          <div class="space-y-5">
            <!-- Title -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Title</label>
              <BaseInput v-model="publishSettings.metadata.title" placeholder="Enter video title" />
            </div>
            
            <!-- Description -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Description</label>
              <BaseTextarea
                v-model="publishSettings.metadata.description"
                placeholder="Describe your video"
                rows="4"
              />
            </div>
            
            <!-- Tags -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Tags</label>
              <div class="flex items-center gap-2">
                <BaseInput
                  id="tags-input"
                  placeholder="Add a tag"
                  @keydown.enter.prevent="addTag"
                />
                <BaseButton color="default" size="sm" @click.prevent="addTag">
                  Add
                </BaseButton>
              </div>
              
              <!-- Tags list -->
              <div class="flex flex-wrap gap-2 mt-3">
                <BaseTag
                  v-for="tag in publishSettings.metadata.tags"
                  :key="tag"
                  color="default"
                  rounded="lg"
                  class="flex items-center gap-1"
                >
                  {{ tag }}
                  <button 
                    class="size-4 rounded-full hover:bg-muted-200 dark:hover:bg-muted-700 flex items-center justify-center"
                    @click="removeTag(tag)"
                  >
                    <Icon name="ph:x" class="size-3" />
                  </button>
                </BaseTag>
                
                <BaseText v-if="publishSettings.metadata.tags.length === 0" size="xs" class="text-muted-500">
                  No tags added
                </BaseText>
              </div>
            </div>
            
            <!-- Category -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Category</label>
              <BaseSelect v-model="publishSettings.metadata.category">
                <option value="">Select a category</option>
                <option value="education">Education</option>
                <option value="entertainment">Entertainment</option>
                <option value="gaming">Gaming</option>
                <option value="music">Music</option>
                <option value="news">News & Politics</option>
                <option value="tech">Science & Technology</option>
                <option value="sports">Sports</option>
                <option value="travel">Travel & Events</option>
              </BaseSelect>
            </div>
            
            <!-- Visibility -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Visibility</label>
              <div class="space-y-2">
                <div
                  v-for="option in visibilityOptions"
                  :key="option.value"
                  class="border-muted-200 dark:border-muted-700 hover:bg-muted-100 dark:hover:bg-muted-800 transition-colors border rounded-lg p-3 cursor-pointer"
                  :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-500/10': publishSettings.metadata.visibility === option.value }"
                  @click="publishSettings.metadata.visibility = option.value"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <BaseText weight="medium">{{ option.label }}</BaseText>
                      <BaseText size="xs" class="text-muted-400 mt-1">
                        {{ option.description }}
                      </BaseText>
                    </div>
                    <BaseRadio
                      :model-value="publishSettings.metadata.visibility === option.value"
                      :name="`visibility-${option.value}`"
                      color="primary"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Advanced options -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Advanced Options</label>
              <div class="space-y-2">
                <BaseCheckbox v-model="publishSettings.metadata.allowComments">
                  Allow comments
                </BaseCheckbox>
                <BaseCheckbox v-model="publishSettings.metadata.allowEmbedding">
                  Allow embedding
                </BaseCheckbox>
              </div>
            </div>
          </div>
        </BaseCard>
        
        <!-- Action Buttons -->
        <div class="mt-4 flex items-center justify-end gap-3">
          <BaseButton 
            color="primary" 
            variant="outline" 
            @click="schedulePublication" 
            :disabled="!publishSettings.schedule.enabled || publishing || publishSettings.platforms.length === 0"
            :loading="publishing && publishSettings.schedule.enabled"
          >
            <Icon name="ph:calendar-duotone" class="me-1 size-4" />
            Schedule Publication
          </BaseButton>
          
          <BaseButton 
            color="primary" 
            @click="publishNow" 
            :disabled="publishing || publishSettings.platforms.length === 0"
            :loading="publishing && !publishSettings.schedule.enabled"
          >
            <Icon name="ph:broadcast-duotone" class="me-1 size-4" />
            Publish Now
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
