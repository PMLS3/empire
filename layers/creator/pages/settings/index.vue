<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '../../../auth/composables/auth';
import { useToaster } from '../../../shared/composables/toaster';

const { user, updateUserProfile } = useAuth();
const toaster = useToaster();

const loading = ref(false);
const saving = ref(false);
const userSettings = ref({
  generalSettings: {
    defaultProjectFormat: '1080p',
    defaultAspectRatio: '16:9',
    autosaveInterval: 5,
    defaultProjectDuration: 60,
  },
  interfaceSettings: {
    theme: 'system',
    language: 'en',
    timelineZoom: 'medium',
    useKeyboardShortcuts: true,
    showTips: true,
  },
  notificationSettings: {
    emailNotifications: true,
    collaboratorUpdates: true,
    renderCompletionAlerts: true,
    marketingEmails: false,
  },
  accessibilitySettings: {
    highContrastMode: false,
    largeText: false,
    reducedMotion: false,
  },
  privacySettings: {
    shareProjectStatistics: true,
    allowUsageData: true,
  },
});

// Available options
const videoFormatOptions = [
  { value: '720p', label: 'HD (1280x720)' },
  { value: '1080p', label: '1080p Full HD (1920x1080)' },
  { value: '1440p', label: '1440p Quad HD (2560x1440)' },
  { value: '4K', label: '4K Ultra HD (3840x2160)' },
];

const aspectRatioOptions = [
  { value: '16:9', label: '16:9 (Widescreen)' },
  { value: '9:16', label: '9:16 (Vertical/Mobile)' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '4:3', label: '4:3 (Traditional)' },
  { value: '21:9', label: '21:9 (Cinematic)' },
];

const autosaveOptions = [
  { value: 1, label: 'Every minute' },
  { value: 2, label: 'Every 2 minutes' },
  { value: 5, label: 'Every 5 minutes' },
  { value: 10, label: 'Every 10 minutes' },
  { value: 15, label: 'Every 15 minutes' },
  { value: 0, label: 'Off' },
];

const themeOptions = [
  { value: 'system', label: 'System default' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
];

// Load user settings
onMounted(async () => {
  if (user.value) {
    loading.value = true;
    
    try {
      // Normally we would fetch settings from an API
      // For now, we'll just use the default values
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add any user-specific settings here
      
    } catch (error) {
      console.error('Error loading settings:', error);
      toaster.show({
        title: 'Error',
        message: 'Failed to load settings',
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
      });
    } finally {
      loading.value = false;
    }
  }
});

// Save settings
const saveSettings = async () => {
  saving.value = true;
  
  try {
    // Normally we would save settings to an API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toaster.show({
      title: 'Settings Saved',
      message: 'Your preferences have been updated',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    toaster.show({
      title: 'Error',
      message: 'Failed to save settings',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    saving.value = false;
  }
};

// Reset settings to defaults
const resetSettings = () => {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    userSettings.value = {
      generalSettings: {
        defaultProjectFormat: '1080p',
        defaultAspectRatio: '16:9',
        autosaveInterval: 5,
        defaultProjectDuration: 60,
      },
      interfaceSettings: {
        theme: 'system',
        language: 'en',
        timelineZoom: 'medium',
        useKeyboardShortcuts: true,
        showTips: true,
      },
      notificationSettings: {
        emailNotifications: true,
        collaboratorUpdates: true,
        renderCompletionAlerts: true,
        marketingEmails: false,
      },
      accessibilitySettings: {
        highContrastMode: false,
        largeText: false,
        reducedMotion: false,
      },
      privacySettings: {
        shareProjectStatistics: true,
        allowUsageData: true,
      },
    };
    
    toaster.show({
      title: 'Settings Reset',
      message: 'Your settings have been reset to defaults',
      color: 'info',
      icon: 'ph:arrows-clockwise-duotone',
    });
  }
};
</script>

<template>
  <div>
    <BasePageTitle title="User Preferences" subtitle="Customize your video creation experience" />
    
    <BasePlaceholderPage
      v-if="loading"
      title="Loading settings"
      subtitle="Please wait while we load your preferences"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <div v-else class="space-y-6">
      <!-- General Settings -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">General Settings</BaseHeading>
        
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <BaseSelect
                v-model="userSettings.generalSettings.defaultProjectFormat"
                label="Default Video Format"
              >
                <option 
                  v-for="option in videoFormatOptions" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </BaseSelect>
            </div>
            
            <div>
              <BaseSelect
                v-model="userSettings.generalSettings.defaultAspectRatio"
                label="Default Aspect Ratio"
              >
                <option 
                  v-for="option in aspectRatioOptions" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </BaseSelect>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <BaseSelect
                v-model="userSettings.generalSettings.autosaveInterval"
                label="Autosave Interval"
              >
                <option 
                  v-for="option in autosaveOptions" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </BaseSelect>
            </div>
            
            <div>
              <BaseInput
                v-model.number="userSettings.generalSettings.defaultProjectDuration"
                type="number"
                min="10"
                max="3600"
                label="Default Project Duration (seconds)"
              />
            </div>
          </div>
        </div>
      </BaseCard>
      
      <!-- Interface Settings -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Interface Settings</BaseHeading>
        
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <BaseSelect
                v-model="userSettings.interfaceSettings.theme"
                label="Theme"
              >
                <option 
                  v-for="option in themeOptions" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </BaseSelect>
            </div>
            
            <div>
              <BaseSelect
                v-model="userSettings.interfaceSettings.language"
                label="Language"
              >
                <option 
                  v-for="option in languageOptions" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </BaseSelect>
            </div>
          </div>
          
          <div class="space-y-2">
            <BaseCheckbox
              v-model="userSettings.interfaceSettings.useKeyboardShortcuts"
              name="useKeyboardShortcuts"
              label="Enable keyboard shortcuts"
            />
            
            <BaseCheckbox
              v-model="userSettings.interfaceSettings.showTips"
              name="showTips"
              label="Show editor tips and suggestions"
            />
          </div>
        </div>
      </BaseCard>
      
      <!-- Notification Settings -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Notification Settings</BaseHeading>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <BaseCheckbox
              v-model="userSettings.notificationSettings.emailNotifications"
              name="emailNotifications"
              label="Email notifications for important updates"
            />
            
            <BaseCheckbox
              v-model="userSettings.notificationSettings.collaboratorUpdates"
              name="collaboratorUpdates"
              label="Notify me when collaborators make changes"
            />
            
            <BaseCheckbox
              v-model="userSettings.notificationSettings.renderCompletionAlerts"
              name="renderCompletionAlerts"
              label="Alert me when renders complete"
            />
            
            <BaseCheckbox
              v-model="userSettings.notificationSettings.marketingEmails"
              name="marketingEmails"
              label="Send me product updates and marketing emails"
            />
          </div>
        </div>
      </BaseCard>
      
      <!-- Accessibility Settings -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Accessibility Settings</BaseHeading>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <BaseCheckbox
              v-model="userSettings.accessibilitySettings.highContrastMode"
              name="highContrastMode"
              label="High contrast mode"
            />
            
            <BaseCheckbox
              v-model="userSettings.accessibilitySettings.largeText"
              name="largeText"
              label="Larger text size"
            />
            
            <BaseCheckbox
              v-model="userSettings.accessibilitySettings.reducedMotion"
              name="reducedMotion"
              label="Reduced motion and animations"
            />
          </div>
        </div>
      </BaseCard>
      
      <!-- Privacy Settings -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Privacy Settings</BaseHeading>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <BaseCheckbox
              v-model="userSettings.privacySettings.shareProjectStatistics"
              name="shareProjectStatistics"
              label="Share project statistics to improve recommendations"
            />
            
            <BaseCheckbox
              v-model="userSettings.privacySettings.allowUsageData"
              name="allowUsageData"
              label="Allow collection of usage data to improve the platform"
            />
          </div>
          
          <BaseText size="xs" class="text-muted-500 mt-2">
            We value your privacy. Learn more about how we use your data in our 
            <NuxtLink to="/privacy" class="text-primary-500 hover:underline">Privacy Policy</NuxtLink>.
          </BaseText>
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
