<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToaster } from '../../../shared/composables/toaster';

const toaster = useToaster();
const saving = ref(false);

// Export settings
const exportSettings = ref({
  video: {
    defaultFormat: 'mp4',
    defaultCodec: 'h264',
    defaultResolution: '1080p',
    defaultFramerate: 30,
    defaultBitrate: 5000, // kbps
    preserveQuality: true,
  },
  audio: {
    defaultFormat: 'aac',
    defaultBitrate: 128, // kbps
    normalizeAudio: true,
    channels: 'stereo',
  },
  destinations: {
    enableCloudExport: true,
    enableLocalExport: true,
    cloudStoragePath: 'exports/{project_name}/{date}',
    localExportPath: '',
  },
  optimization: {
    fastEncoding: false,
    enableHardwareAcceleration: true,
    compressOutput: true,
    priorityLevel: 'normal',
  },
  watermark: {
    enabled: false,
    position: 'bottom-right',
    opacity: 70,
    size: 'medium',
    image: null,
  }
});

// Format options
const videoFormats = [
  { value: 'mp4', label: 'MP4' },
  { value: 'mov', label: 'QuickTime (MOV)' },
  { value: 'webm', label: 'WebM' },
  { value: 'avi', label: 'AVI' },
  { value: 'mkv', label: 'MKV' },
];

const videoCodecs = [
  { value: 'h264', label: 'H.264 (AVC)' },
  { value: 'h265', label: 'H.265 (HEVC)' },
  { value: 'vp9', label: 'VP9' },
  { value: 'av1', label: 'AV1' },
];

const audioFormats = [
  { value: 'aac', label: 'AAC' },
  { value: 'mp3', label: 'MP3' },
  { value: 'wav', label: 'WAV (Uncompressed)' },
  { value: 'opus', label: 'Opus' },
];

const resolutions = [
  { value: '720p', label: 'HD (1280x720)' },
  { value: '1080p', label: 'Full HD (1920x1080)' },
  { value: '1440p', label: 'Quad HD (2560x1440)' },
  { value: '4K', label: '4K UHD (3840x2160)' },
];

const framerates = [
  { value: 24, label: '24 fps (Film)' },
  { value: 25, label: '25 fps (PAL)' },
  { value: 30, label: '30 fps (Standard)' },
  { value: 60, label: '60 fps (High Framerate)' },
];

const watermarkPositions = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'center', label: 'Center' },
];

const priorityLevels = [
  { value: 'low', label: 'Low Priority' },
  { value: 'normal', label: 'Normal Priority' },
  { value: 'high', label: 'High Priority' },
];

// Sample watermark preview
const watermarkSrc = ref('https://via.placeholder.com/200x100?text=Your+Logo');

// Upload watermark image
const uploadWatermark = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    toaster.show({
      title: 'Invalid file type',
      message: 'Please select an image file (PNG with transparency recommended)',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  // Create object URL for preview
  watermarkSrc.value = URL.createObjectURL(file);
  exportSettings.value.watermark.image = file;
  
  toaster.show({
    title: 'Watermark uploaded',
    message: 'Your watermark image has been updated',
    color: 'success',
    icon: 'ph:check-circle-duotone',
  });
};

// Browse for local export path
const browseForPath = () => {
  // This would typically open a native file picker
  // In a web context, we'll simulate it with a prompt
  const path = prompt('Enter export path:', exportSettings.value.destinations.localExportPath);
  if (path !== null) {
    exportSettings.value.destinations.localExportPath = path;
  }
};

// Save export settings
const saveSettings = async () => {
  saving.value = true;
  
  try {
    // Normally we would save settings to an API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toaster.show({
      title: 'Settings Saved',
      message: 'Your export settings have been updated',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (error) {
    console.error('Error saving export settings:', error);
    toaster.show({
      title: 'Error',
      message: 'Failed to save export settings',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    saving.value = false;
  }
};

// Reset to defaults
const resetSettings = () => {
  if (confirm('Are you sure you want to reset export settings to defaults?')) {
    exportSettings.value = {
      video: {
        defaultFormat: 'mp4',
        defaultCodec: 'h264',
        defaultResolution: '1080p',
        defaultFramerate: 30,
        defaultBitrate: 5000,
        preserveQuality: true,
      },
      audio: {
        defaultFormat: 'aac',
        defaultBitrate: 128,
        normalizeAudio: true,
        channels: 'stereo',
      },
      destinations: {
        enableCloudExport: true,
        enableLocalExport: true,
        cloudStoragePath: 'exports/{project_name}/{date}',
        localExportPath: '',
      },
      optimization: {
        fastEncoding: false,
        enableHardwareAcceleration: true,
        compressOutput: true,
        priorityLevel: 'normal',
      },
      watermark: {
        enabled: false,
        position: 'bottom-right',
        opacity: 70,
        size: 'medium',
        image: null,
      }
    };
    
    toaster.show({
      title: 'Settings Reset',
      message: 'Export settings have been reset to defaults',
      color: 'info',
      icon: 'ph:arrows-clockwise-duotone',
    });
  }
};
</script>

<template>
  <div>
    <BasePageTitle title="Export Settings" subtitle="Configure default export options for your videos" />
    
    <div class="space-y-6">
      <!-- Video Settings -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Video Export Settings</BaseHeading>
        
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <BaseSelect
                v-model="exportSettings.video.defaultFormat"
                label="Default Video Format"
              >
                <option v-for="format in videoFormats" :key="format.value" :value="format.value">
                  {{ format.label }}
                </option>
              </BaseSelect>
            </div>
            
            <div>
              <BaseSelect
                v-model="exportSettings.video.defaultCodec"
                label="Default Codec"
              >
                <option v-for="codec in videoCodecs" :key="codec.value" :value="codec.value">
                  {{ codec.label }}
                </option>
              </BaseSelect>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <BaseSelect
                v-model="exportSettings.video.defaultResolution"
                label="Default Resolution"
              >
                <option v-for="res in resolutions" :key="res.value" :value="res.value">
                  {{ res.label }}
                </option>
              </BaseSelect>
            </div>
            
            <div>
              <BaseSelect
                v-model="exportSettings.video.defaultFramerate"
                label="Default Frame Rate"
              >
                <option v-for="fps in framerates" :key="fps.value" :value="fps.value">
                  {{ fps.label }}
                </option>
              </BaseSelect>
            </div>
          </div>
          
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="nui-label pb-0 text-[0.825rem]">Bitrate (kbps)</label>
              <span class="text-xs text-muted-500">{{ exportSettings.video.defaultBitrate }}</span>
            </div>
            <input 
              type="range" 
              v-model.number="exportSettings.video.defaultBitrate" 
              min="1000" 
              max="20000" 
              step="500"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-muted-500 mt-1">
              <span>Low (1 Mbps)</span>
              <span>Medium (5 Mbps)</span>
              <span>High (20 Mbps)</span>
            </div>
          </div>
          
          <div>
            <BaseCheckbox
              v-model="exportSettings.video.preserveQuality"
              label="Preserve original quality when possible"
              name="preserveQuality"
            />
          </div>
        </div>
      </BaseCard>
      
      <!-- Audio Settings -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Audio Export Settings</BaseHeading>
        
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <BaseSelect
                v-model="exportSettings.audio.defaultFormat"
                label="Audio Format"
              >
                <option v-for="format in audioFormats" :key="format.value" :value="format.value">
                  {{ format.label }}
                </option>
              </BaseSelect>
            </div>
            
            <div>
              <BaseSelect
                v-model="exportSettings.audio.channels"
                label="Audio Channels"
              >
                <option value="mono">Mono</option>
                <option value="stereo">Stereo</option>
              </BaseSelect>
            </div>
          </div>
          
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="nui-label pb-0 text-[0.825rem]">Audio Bitrate (kbps)</label>
              <span class="text-xs text-muted-500">{{ exportSettings.audio.defaultBitrate }}</span>
            </div>
            <input 
              type="range" 
              v-model.number="exportSettings.audio.defaultBitrate" 
              min="64" 
              max="320" 
              step="16"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-muted-500 mt-1">
              <span>Low (64 kbps)</span>
              <span>Medium (128 kbps)</span>
              <span>High (320 kbps)</span>
            </div>
          </div>
          
          <div>
            <BaseCheckbox
              v-model="exportSettings.audio.normalizeAudio"
              label="Normalize audio levels during export"
              name="normalizeAudio"
            />
          </div>
        </div>
      </BaseCard>
      
      <!-- Destinations -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Export Destinations</BaseHeading>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <BaseCheckbox
              v-model="exportSettings.destinations.enableCloudExport"
              label="Enable cloud exports"
              name="enableCloudExport"
            />
            
            <BaseCheckbox
              v-model="exportSettings.destinations.enableLocalExport"
              label="Enable local file exports"
              name="enableLocalExport"
            />
          </div>
          
          <div v-if="exportSettings.destinations.enableCloudExport">
            <BaseInput
              v-model="exportSettings.destinations.cloudStoragePath"
              label="Cloud Storage Path Pattern"
              help="Supports variables: {project_name}, {date}, {resolution}"
            />
          </div>
          
          <div v-if="exportSettings.destinations.enableLocalExport" class="flex gap-2 items-end">
            <div class="flex-grow">
              <BaseInput
                v-model="exportSettings.destinations.localExportPath"
                label="Default Local Export Path"
                placeholder="/Users/username/Videos"
              />
            </div>
            <BaseButton color="default" @click="browseForPath">Browse...</BaseButton>
          </div>
        </div>
      </BaseCard>
      
      <!-- Optimization -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Export Optimization</BaseHeading>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <BaseCheckbox
              v-model="exportSettings.optimization.fastEncoding"
              label="Enable fast encoding (lower quality, faster exports)"
              name="fastEncoding"
            />
            
            <BaseCheckbox
              v-model="exportSettings.optimization.enableHardwareAcceleration"
              label="Use hardware acceleration when available"
              name="enableHardwareAcceleration"
            />
            
            <BaseCheckbox
              v-model="exportSettings.optimization.compressOutput"
              label="Compress output files when possible"
              name="compressOutput"
            />
          </div>
          
          <div>
            <BaseSelect
              v-model="exportSettings.optimization.priorityLevel"
              label="Export Job Priority"
            >
              <option v-for="level in priorityLevels" :key="level.value" :value="level.value">
                {{ level.label }}
              </option>
            </BaseSelect>
          </div>
          
          <BaseMessage v-if="exportSettings.optimization.fastEncoding" type="warning">
            Fast encoding may result in lower quality videos. This setting is recommended only for drafts or quick previews.
          </BaseMessage>
        </div>
      </BaseCard>
      
      <!-- Watermark -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Watermark</BaseHeading>
        
        <div class="space-y-4">
          <BaseCheckbox
            v-model="exportSettings.watermark.enabled"
            label="Add watermark to exported videos"
            name="watermarkEnabled"
          />
          
          <div v-if="exportSettings.watermark.enabled" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <BaseSelect
                  v-model="exportSettings.watermark.position"
                  label="Watermark Position"
                >
                  <option v-for="position in watermarkPositions" :key="position.value" :value="position.value">
                    {{ position.label }}
                  </option>
                </BaseSelect>
              </div>
              
              <div>
                <BaseSelect
                  v-model="exportSettings.watermark.size"
                  label="Watermark Size"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </BaseSelect>
              </div>
            </div>
            
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="nui-label pb-0 text-[0.825rem]">Opacity</label>
                <span class="text-xs text-muted-500">{{ exportSettings.watermark.opacity }}%</span>
              </div>
              <input 
                type="range" 
                v-model.number="exportSettings.watermark.opacity" 
                min="10" 
                max="100" 
                step="5"
                class="w-full"
              />
            </div>
            
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Watermark Image</label>
              <div class="flex flex-col md:flex-row gap-4 items-start">
                <div class="bg-muted-100 dark:bg-muted-800 border border-muted-200 dark:border-muted-700 rounded p-2 w-48 h-24 flex items-center justify-center">
                  <img :src="watermarkSrc" alt="Watermark preview" class="max-w-full max-h-full object-contain" />
                </div>
                
                <div>
                  <input type="file" id="watermark-upload" class="hidden" accept="image/*" @change="uploadWatermark" />
                  <BaseButton color="default" as="label" for="watermark-upload">
                    <Icon name="ph:upload-simple-duotone" class="me-2" />
                    Upload Image
                  </BaseButton>
                  <BaseText size="xs" class="text-muted-500 mt-2">
                    Recommended: PNG file with transparency, minimum 500px wide
                  </BaseText>
                </div>
              </div>
            </div>
            
            <BaseMessage type="info">
              The watermark will be applied to all exported videos with these settings unless overridden during export.
            </BaseMessage>
          </div>
        </div>
      </BaseCard>
      
      <!-- Action Buttons -->
      <div class="flex justify-between">
        <BaseButton color="danger" @click="resetSettings">
          <Icon name="ph:arrows-clockwise-duotone" class="me-2" />
          Reset to Defaults
        </BaseButton>
        
        <BaseButton color="primary" :loading="saving" @click="saveSettings">
          <Icon name="ph:check-circle-duotone" class="me-2" />
          Save Settings
        </BaseButton>
      </div>
    </div>
  </div>
</template>
