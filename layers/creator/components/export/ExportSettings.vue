<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCreatorData } from '../../composables/useCreatorData';
import { useToaster } from '../../../shared/composables/toaster';

const props = defineProps<{
  projectId: string;
}>();

const emit = defineEmits(['exportStarted', 'exportCompleted', 'exportFailed']);

const { getDataById, updateData } = useCreatorData();
const toaster = useToaster();

// UI state variables
const loading = ref(false);
const exporting = ref(false);
const projectData = ref<any>(null);
const error = ref<string | null>(null);

// Export settings
const exportSettings = ref({
  filename: '',
  resolution: '1080p',
  format: 'mp4',
  quality: 'high',
  includeCaptions: true,
  includeIntro: true,
  includeOutro: true,
  audioNormalization: true,
});

// Export resolution options
const resolutionOptions = [
  { value: '480p', label: '480p (SD)', width: 854, height: 480 },
  { value: '720p', label: '720p (HD)', width: 1280, height: 720 },
  { value: '1080p', label: '1080p (Full HD)', width: 1920, height: 1080 },
  { value: '4K', label: '4K (Ultra HD)', width: 3840, height: 2160 },
];

// Video format options
const formatOptions = [
  { value: 'mp4', label: 'MP4 (H.264)', description: 'Best compatibility across devices' },
  { value: 'webm', label: 'WebM (VP9)', description: 'Better compression, good for web' },
  { value: 'mov', label: 'QuickTime (MOV)', description: 'Good for Apple devices' },
];

// Video quality options
const qualityOptions = [
  { value: 'low', label: 'Low', description: 'Small file size, lower quality' },
  { value: 'medium', label: 'Medium', description: 'Balanced size and quality' },
  { value: 'high', label: 'High', description: 'High quality, larger file size' },
  { value: 'ultra', label: 'Ultra', description: 'Maximum quality, very large file' },
];

// Export job status
const exportJob = ref<{
  id?: string;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  progress: number;
  url?: string;
  error?: string;
}>({
  status: 'idle',
  progress: 0,
});

// Calculate estimated file size
const estimatedFileSize = computed(() => {
  const resolution = resolutionOptions.find(r => r.value === exportSettings.value.resolution);
  if (!resolution || !projectData.value?.timeline?.clips) return '0 MB';
  
  // Calculate duration based on timeline clips
  let totalDuration = 0;
  if (projectData.value.timeline.clips.length > 0) {
    projectData.value.timeline.clips.forEach(clip => {
      totalDuration = Math.max(totalDuration, clip.start + clip.duration);
    });
  } else if (projectData.value.settings?.duration_target) {
    totalDuration = projectData.value.settings.duration_target;
  } else {
    totalDuration = 60; // Default 1 minute
  }
  
  // Calculate bitrate based on quality
  let bitrateFactor = 0;
  switch (exportSettings.value.quality) {
    case 'low': bitrateFactor = 0.5; break;
    case 'medium': bitrateFactor = 1; break;
    case 'high': bitrateFactor = 2; break;
    case 'ultra': bitrateFactor = 3; break;
    default: bitrateFactor = 1;
  }
  
  // Base bitrate for 1080p is around 8 Mbps
  const baseBitrate = 8000000; // bits per second
  
  // Scale bitrate by resolution
  const resolutionFactor = (resolution.width * resolution.height) / (1920 * 1080);
  const bitrate = baseBitrate * resolutionFactor * bitrateFactor;
  
  // Calculate file size (bits to bytes)
  const fileSizeBytes = (bitrate * totalDuration) / 8;
  
  // Convert to MB
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  
  return `${Math.round(fileSizeMB)} MB`;
});

// Load project data
onMounted(async () => {
  loading.value = true;
  
  try {
    const data = await getDataById('projects', props.projectId);
    projectData.value = data;
    
    // Initialize filename with project title
    if (data?.title) {
      exportSettings.value.filename = sanitizeFilename(data.title);
    } else {
      exportSettings.value.filename = `video_export_${new Date().getTime()}`;
    }
    
    // Check for existing export job
    if (data?.export_jobs?.length > 0) {
      // Get the latest job
      const latestJob = data.export_jobs.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })[0];
      
      if (latestJob.status === 'processing') {
        exportJob.value = {
          id: latestJob.id,
          status: latestJob.status,
          progress: latestJob.progress || 0,
          url: latestJob.url,
        };
        
        // Set up polling for job status
        startJobStatusPolling(latestJob.id);
      } else if (latestJob.status === 'completed' && latestJob.url) {
        exportJob.value = {
          id: latestJob.id,
          status: 'completed',
          progress: 100,
          url: latestJob.url,
        };
      }
    }
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

// Sanitize filename
const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '_')     // Replace spaces with underscores
    .toLowerCase();           // Convert to lowercase
};

// Start video export process
const startExport = async () => {
  if (!exportSettings.value.filename) {
    toaster.show({
      title: 'Error',
      message: 'Please enter a filename',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  exporting.value = true;
  exportJob.value.status = 'processing';
  exportJob.value.progress = 0;
  
  try {
    // Call the export API endpoint
    const response = await $fetch('/api/video/export', {
      method: 'POST',
      body: {
        project_id: props.projectId,
        settings: {
          ...exportSettings.value,
          resolution: resolutionOptions.find(r => r.value === exportSettings.value.resolution),
        }
      }
    });
    
    if (response?.job_id) {
      exportJob.value.id = response.job_id;
      
      // Save job reference to the project
      const exportJobData = {
        export_jobs: [
          ...(projectData.value?.export_jobs || []),
          {
            id: response.job_id,
            status: 'processing',
            progress: 0,
            settings: exportSettings.value,
            created_at: new Date().toISOString(),
          }
        ]
      };
      
      await updateData('projects', props.projectId, exportJobData);
      
      // Notify parent component
      emit('exportStarted', { jobId: response.job_id, settings: exportSettings.value });
      
      // Start polling for job status
      startJobStatusPolling(response.job_id);
      
      toaster.show({
        title: 'Export Started',
        message: 'Your video export has started. This may take several minutes.',
        color: 'info',
        icon: 'ph:video-duotone',
      });
    } else {
      throw new Error('No job ID returned from export API');
    }
  } catch (err) {
    console.error('Error starting export:', err);
    exportJob.value.status = 'failed';
    exportJob.value.error = 'Failed to start video export';
    
    emit('exportFailed', { error: err.message || 'Unknown error' });
    
    toaster.show({
      title: 'Export Failed',
      message: 'Failed to start video export process',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    exporting.value = false;
  }
};

// Poll for job status updates
const statusPollingInterval = ref<number | null>(null);

const startJobStatusPolling = (jobId: string) => {
  // Clear any existing interval
  if (statusPollingInterval.value) {
    clearInterval(statusPollingInterval.value);
  }
  
  // Set up new polling interval (every 3 seconds)
  statusPollingInterval.value = setInterval(async () => {
    try {
      const response = await $fetch(`/api/video/export/${jobId}`, {
        method: 'GET',
      });
      
      if (response) {
        exportJob.value.status = response.status;
        exportJob.value.progress = response.progress || 0;
        
        if (response.status === 'completed') {
          exportJob.value.url = response.url;
          clearInterval(statusPollingInterval.value);
          
          // Update project with completed job info
          await updateData('projects', props.projectId, {
            export_jobs: projectData.value?.export_jobs.map(job => {
              if (job.id === jobId) {
                return {
                  ...job,
                  status: 'completed',
                  progress: 100,
                  url: response.url,
                  completed_at: new Date().toISOString(),
                };
              }
              return job;
            }),
          });
          
          // Notify parent component
          emit('exportCompleted', { jobId, url: response.url });
          
          toaster.show({
            title: 'Export Completed',
            message: 'Your video is ready to download',
            color: 'success',
            icon: 'ph:check-circle-duotone',
          });
        } else if (response.status === 'failed') {
          exportJob.value.error = response.error || 'Export failed';
          clearInterval(statusPollingInterval.value);
          
          // Update project with failed job info
          await updateData('projects', props.projectId, {
            export_jobs: projectData.value?.export_jobs.map(job => {
              if (job.id === jobId) {
                return {
                  ...job,
                  status: 'failed',
                  error: response.error,
                  failed_at: new Date().toISOString(),
                };
              }
              return job;
            }),
          });
          
          // Notify parent component
          emit('exportFailed', { jobId, error: response.error });
          
          toaster.show({
            title: 'Export Failed',
            message: response.error || 'Failed to export video',
            color: 'danger',
            icon: 'ph:warning-circle-duotone',
          });
        }
      }
    } catch (err) {
      console.error('Error checking export status:', err);
      // Don't stop polling on temporary errors
    }
  }, 3000);
};

// Clean up on component unmount
onBeforeUnmount(() => {
  if (statusPollingInterval.value) {
    clearInterval(statusPollingInterval.value);
  }
});
</script>

<template>
  <div>
    <BaseHeading as="h3" size="md" weight="medium" class="mb-4">
      Export Settings
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
    
    <div v-else class="space-y-6">
      <!-- Export Progress Card (if a job is in progress) -->
      <BaseCard v-if="exportJob.status !== 'idle'" class="p-4 md:p-6">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <BaseHeading as="h4" size="sm" weight="medium">
              Export Status
            </BaseHeading>
            <BaseTag 
              :color="exportJob.status === 'completed' ? 'success' : 
                     exportJob.status === 'failed' ? 'danger' : 'info'"
              rounded="lg"
            >
              {{ exportJob.status.charAt(0).toUpperCase() + exportJob.status.slice(1) }}
            </BaseTag>
          </div>
          
          <div v-if="exportJob.status === 'processing'">
            <BaseProgress
              :value="exportJob.progress"
              :max="100"
              size="sm"
              color="primary"
              class="mb-2"
            />
            <BaseText size="xs" class="text-muted-500">
              Processing video... {{ Math.round(exportJob.progress) }}% complete
            </BaseText>
          </div>
          
          <div v-else-if="exportJob.status === 'completed' && exportJob.url">
            <div class="bg-success-100 dark:bg-success-500/20 text-success-500 rounded-lg p-4 mb-4 flex items-center gap-3">
              <Icon name="ph:check-circle-duotone" class="size-6" />
              <div>
                <BaseHeading size="xs" weight="medium">Export Completed Successfully</BaseHeading>
                <BaseText size="xs">Your video is ready to download</BaseText>
              </div>
            </div>
            
            <BaseButton
              color="primary"
              class="w-full"
              as="a"
              :href="exportJob.url"
              download
              target="_blank"
            >
              <Icon name="ph:download-duotone" class="me-2 size-4" />
              Download Video
            </BaseButton>
          </div>
          
          <div v-else-if="exportJob.status === 'failed'">
            <div class="bg-danger-100 dark:bg-danger-500/20 text-danger-500 rounded-lg p-4 mb-4 flex items-center gap-3">
              <Icon name="ph:warning-circle-duotone" class="size-6" />
              <div>
                <BaseHeading size="xs" weight="medium">Export Failed</BaseHeading>
                <BaseText size="xs">{{ exportJob.error || 'An error occurred during export' }}</BaseText>
              </div>
            </div>
            
            <BaseButton
              color="primary"
              class="w-full"
              @click="startExport"
              :disabled="exporting"
            >
              <Icon name="ph:arrows-clockwise-duotone" class="me-2 size-4" />
              Try Again
            </BaseButton>
          </div>
        </div>
      </BaseCard>
      
      <!-- Export Settings Form -->
      <BaseCard class="p-4 md:p-6">
        <BaseHeading as="h4" size="sm" weight="medium" class="mb-4">
          Configure Export
        </BaseHeading>
        
        <div class="space-y-5">
          <!-- Filename -->
          <div>
            <label class="nui-label pb-2 text-[0.825rem]">Filename</label>
            <div class="flex">
              <BaseInput v-model="exportSettings.filename" placeholder="Enter filename" />
              <BaseText class="ms-2 py-2 text-muted-400">.{{ exportSettings.format }}</BaseText>
            </div>
          </div>
          
          <!-- Resolution -->
          <div>
            <label class="nui-label pb-2 text-[0.825rem]">Resolution</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <BaseButton
                v-for="resolution in resolutionOptions"
                :key="resolution.value"
                color="default"
                :variant="exportSettings.resolution === resolution.value ? 'solid' : 'outline'"
                @click="exportSettings.resolution = resolution.value"
              >
                {{ resolution.label }}
              </BaseButton>
            </div>
          </div>
          
          <!-- Format options -->
          <div>
            <label class="nui-label pb-2 text-[0.825rem]">Format</label>
            <div class="space-y-2">
              <div
                v-for="format in formatOptions"
                :key="format.value"
                class="border-muted-200 dark:border-muted-700 hover:bg-muted-100 dark:hover:bg-muted-800 transition-colors border rounded-lg p-3 cursor-pointer"
                :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-500/10': exportSettings.format === format.value }"
                @click="exportSettings.format = format.value"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <BaseText weight="medium">{{ format.label }}</BaseText>
                    <BaseText size="xs" class="text-muted-400 mt-1">
                      {{ format.description }}
                    </BaseText>
                  </div>
                  <BaseRadio
                    :model-value="exportSettings.format === format.value"
                    :name="`format-${format.value}`"
                    color="primary"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Quality -->
          <div>
            <label class="nui-label pb-2 text-[0.825rem]">Quality</label>
            <div class="space-y-2">
              <div
                v-for="quality in qualityOptions"
                :key="quality.value"
                class="border-muted-200 dark:border-muted-700 hover:bg-muted-100 dark:hover:bg-muted-800 transition-colors border rounded-lg p-3 cursor-pointer"
                :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-500/10': exportSettings.quality === quality.value }"
                @click="exportSettings.quality = quality.value"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <BaseText weight="medium">{{ quality.label }}</BaseText>
                    <BaseText size="xs" class="text-muted-400 mt-1">
                      {{ quality.description }}
                    </BaseText>
                  </div>
                  <BaseRadio
                    :model-value="exportSettings.quality === quality.value"
                    :name="`quality-${quality.value}`"
                    color="primary"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Additional options -->
          <div>
            <label class="nui-label pb-2 text-[0.825rem]">Additional Options</label>
            <div class="space-y-2">
              <BaseCheckbox v-model="exportSettings.includeCaptions">
                Include captions
              </BaseCheckbox>
              <BaseCheckbox v-model="exportSettings.includeIntro">
                Include intro
              </BaseCheckbox>
              <BaseCheckbox v-model="exportSettings.includeOutro">
                Include outro
              </BaseCheckbox>
              <BaseCheckbox v-model="exportSettings.audioNormalization">
                Apply audio normalization
              </BaseCheckbox>
            </div>
          </div>
          
          <!-- File size estimate -->
          <div class="bg-muted-100 dark:bg-muted-800 rounded-lg p-3">
            <div class="flex items-center gap-2">
              <Icon name="ph:info-duotone" class="size-5 text-info-500" />
              <BaseHeading size="xs" weight="medium">Estimated File Size</BaseHeading>
            </div>
            <BaseText size="sm" class="ms-7">{{ estimatedFileSize }}</BaseText>
          </div>
          
          <!-- Export button -->
          <BaseButton
            color="primary"
            class="w-full"
            @click="startExport"
            :loading="exporting"
            :disabled="exporting || !exportSettings.filename"
          >
            <Icon name="ph:file-arrow-down-duotone" class="me-2 size-4" />
            Export Video
          </BaseButton>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
