<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToaster } from '../../../shared/composables/toaster';

const toaster = useToaster();
const loading = ref(true);
const saving = ref(false);

// Connected platforms
const connectedPlatforms = ref([
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'ph:youtube-logo-fill',
    color: 'danger',
    connected: true,
    accountName: 'Creator Studio',
    accountId: '@creatorstudio',
    lastSync: '2023-11-05T14:30:00',
    scopes: ['read', 'upload', 'manage'],
    status: 'active',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'ph:tiktok-logo-fill',
    color: 'dark',
    connected: true,
    accountName: 'Creator Studio',
    accountId: '@creatorstudio',
    lastSync: '2023-11-04T10:15:00',
    scopes: ['read', 'upload'],
    status: 'active',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'ph:instagram-logo-fill',
    color: 'purple',
    connected: false,
    accountName: '',
    accountId: '',
    lastSync: '',
    scopes: [],
    status: 'disconnected',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'ph:facebook-logo-fill',
    color: 'info',
    connected: true,
    accountName: 'Creator Studio Page',
    accountId: 'Creator Studio',
    lastSync: '2023-11-02T16:45:00',
    scopes: ['read', 'upload', 'manage'],
    status: 'token_expired',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: 'ph:twitter-logo-fill',
    color: 'primary',
    connected: false,
    accountName: '',
    accountId: '',
    lastSync: '',
    scopes: [],
    status: 'disconnected',
  },
]);

// API integration settings
const apiSettings = ref({
  enableApiAccess: true,
  apiKey: 'sk_live_abcdefghijklmnopqrstuvwxyz123456',
  allowedDomains: ['example.com', 'myapp.com'],
  webhookUrl: 'https://myapp.com/webhooks/creator-platform',
  notificationEvents: ['export.completed', 'render.failed', 'project.shared'],
});

// Available connections
const availableConnections = ref([
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: 'ph:dropbox-logo-fill',
    color: 'info',
    description: 'Connect your Dropbox account to import and export files directly.',
    connected: false
  },
  {
    id: 'google_drive',
    name: 'Google Drive',
    icon: 'ph:google-drive-logo-fill',
    color: 'warning',
    description: 'Connect Google Drive to store and access your project files.',
    connected: true
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: 'ph:microsoft-outlook-logo-fill',
    color: 'info',
    description: 'Connect Microsoft OneDrive to sync your project files.',
    connected: false
  },
  {
    id: 'adobe_cc',
    name: 'Adobe Creative Cloud',
    icon: 'ph:adobe-photoshop-logo-fill',
    color: 'danger',
    description: 'Connect to Adobe Creative Cloud for advanced asset import and editing.',
    connected: false
  },
]);

// Generate new API key
const generateNewApiKey = async () => {
  if (!confirm('Are you sure you want to generate a new API key? This will invalidate your current key and any applications using it will stop working.')) {
    return;
  }
  
  saving.value = true;
  
  try {
    // In a real app, we'd call an API endpoint here
    await new Promise(resolve => setTimeout(resolve, 800));
    
    apiSettings.value.apiKey = 'sk_live_' + Array(32)
      .fill(0)
      .map(() => Math.random().toString(36).charAt(2))
      .join('');
    
    toaster.show({
      title: 'API Key Generated',
      message: 'Your new API key has been generated',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    toaster.show({
      title: 'Error',
      message: 'Failed to generate a new API key',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    saving.value = false;
  }
};

// Format timestamp
const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  } catch (e) {
    return dateString;
  }
};

// Connect to platform
const connectToPlatform = async (platformId) => {
  // In a real app, we'd redirect to the OAuth flow
  toaster.show({
    title: 'Connecting...',
    message: `Redirecting to ${platformId} authorization page`,
    color: 'info',
    icon: 'ph:arrow-square-out-duotone',
  });
};

// Disconnect platform
const disconnectPlatform = async (platform) => {
  if (!confirm(`Are you sure you want to disconnect ${platform.name}? Any scheduled or automatic publishes to this platform will stop working.`)) {
    return;
  }
  
  saving.value = true;
  
  try {
    // In a real app, we'd call an API endpoint here
    await new Promise(resolve => setTimeout(resolve, 800));
    
    platform.connected = false;
    platform.status = 'disconnected';
    platform.lastSync = '';
    
    toaster.show({
      title: 'Platform Disconnected',
      message: `${platform.name} has been disconnected`,
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (error) {
    console.error(`Error disconnecting ${platform.name}:`, error);
    toaster.show({
      title: 'Error',
      message: `Failed to disconnect ${platform.name}`,
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    saving.value = false;
  }
};

// Connect storage service
const connectStorageService = async (service) => {
  // This would typically redirect to an OAuth flow
  toaster.show({
    title: 'Connecting...',
    message: `Redirecting to ${service.name} authorization page`,
    color: 'info',
    icon: 'ph:arrow-square-out-duotone',
  });
};

// Add allowed domain
const newDomain = ref('');
const addDomain = () => {
  if (!newDomain.value.trim()) return;
  
  if (apiSettings.value.allowedDomains.includes(newDomain.value)) {
    toaster.show({
      title: 'Domain already exists',
      message: 'This domain is already in the allowed list',
      color: 'warning',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  apiSettings.value.allowedDomains.push(newDomain.value.trim());
  newDomain.value = '';
};

// Remove allowed domain
const removeDomain = (domain) => {
  apiSettings.value.allowedDomains = apiSettings.value.allowedDomains.filter(d => d !== domain);
};

// Save API settings
const saveApiSettings = async () => {
  saving.value = true;
  
  try {
    // In a real app, we'd call an API endpoint here
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toaster.show({
      title: 'Settings Saved',
      message: 'Your API settings have been updated',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (error) {
    console.error('Error saving API settings:', error);
    toaster.show({
      title: 'Error',
      message: 'Failed to save API settings',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  // In a real app, we'd load these from an API
  setTimeout(() => {
    loading.value = false;
  }, 500);
});
</script>

<template>
  <div>
    <BasePageTitle title="Platform Connections" subtitle="Manage connections to social media and storage platforms" />
    
    <BasePlaceholderPage
      v-if="loading"
      title="Loading connections"
      subtitle="Please wait while we load your platform connections"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <div v-else class="space-y-6">
      <!-- Social Media Platforms -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Social Media Platforms</BaseHeading>
        
        <div class="space-y-4">
          <div 
            v-for="platform in connectedPlatforms" 
            :key="platform.id"
            class="border rounded-lg border-muted-200 dark:border-muted-700 p-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div 
                  class="size-10 rounded-full flex items-center justify-center"
                  :class="`bg-${platform.color}-100 dark:bg-${platform.color}-500/20 text-${platform.color}-500`"
                >
                  <Icon :name="platform.icon" class="size-5" />
                </div>
                
                <div>
                  <div class="font-medium text-muted-900 dark:text-muted-100">{{ platform.name }}</div>
                  <div v-if="platform.connected" class="text-xs text-muted-500">
                    Connected as {{ platform.accountName }}
                    <span v-if="platform.accountId">({{ platform.accountId }})</span>
                  </div>
                  <div v-else class="text-xs text-muted-500">Not connected</div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <BaseTag 
                  v-if="platform.connected" 
                  :color="platform.status === 'active' ? 'success' : 'warning'" 
                  size="sm" 
                  :label="platform.status === 'active' ? 'Active' : 'Needs Attention'"
                />
                
                <BaseButton 
                  v-if="!platform.connected"
                  color="primary" 
                  size="sm"
                  @click="connectToPlatform(platform.id)"
                >
                  Connect
                </BaseButton>
                
                <BaseButton 
                  v-else
                  color="danger" 
                  size="sm"
                  @click="disconnectPlatform(platform)"
                >
                  Disconnect
                </BaseButton>
              </div>
            </div>
            
            <div v-if="platform.connected" class="mt-4 pt-4 border-t border-muted-200 dark:border-muted-700">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div class="text-xs text-muted-400">Last Synced</div>
                  <div class="text-sm">{{ formatDate(platform.lastSync) }}</div>
                </div>
                <div>
                  <div class="text-xs text-muted-400">Permissions</div>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <BaseTag 
                      v-for="scope in platform.scopes" 
                      :key="scope" 
                      size="xs" 
                      :label="scope"
                    />
                  </div>
                </div>
                <div>
                  <div class="text-xs text-muted-400">Actions</div>
                  <div class="flex gap-2 mt-1">
                    <BaseButton size="xs" color="default">
                      <Icon name="ph:arrows-clockwise-duotone" class="size-3 me-1" />
                      Sync
                    </BaseButton>
                    <BaseButton size="xs" color="default">
                      <Icon name="ph:key-duotone" class="size-3 me-1" />
                      Permissions
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
      
      <!-- Storage Services -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">Storage Services</BaseHeading>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="service in availableConnections"
            :key="service.id"
            class="p-4 border rounded-lg border-muted-200 dark:border-muted-700"
          >
            <div class="flex justify-between">
              <div class="flex items-center gap-3">
                <div 
                  class="size-10 rounded flex items-center justify-center"
                  :class="`bg-${service.color}-100 dark:bg-${service.color}-500/20 text-${service.color}-500`"
                >
                  <Icon :name="service.icon" class="size-5" />
                </div>
                <div>
                  <div class="font-medium">{{ service.name }}</div>
                  <div class="text-xs text-muted-500 mt-0.5">{{ service.description }}</div>
                </div>
              </div>
              
              <div>
                <BaseButton
                  v-if="!service.connected"
                  size="sm"
                  color="primary"
                  @click="connectStorageService(service)"
                >
                  Connect
                </BaseButton>
                <BaseTag
                  v-else
                  color="success"
                  size="sm"
                  label="Connected"
                />
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
      
      <!-- API Integration Settings -->
      <BaseCard class="p-6">
        <BaseHeading as="h3" size="sm" weight="medium" class="mb-6">API Integration</BaseHeading>
        
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <BaseHeading size="xs" weight="medium" class="mb-1">API Access</BaseHeading>
              <BaseText size="sm" class="text-muted-500">Enable or disable API access to your account</BaseText>
            </div>
            <BaseSwitch v-model="apiSettings.enableApiAccess" />
          </div>
          
          <div v-if="apiSettings.enableApiAccess" class="space-y-4">
            <!-- API Key -->
            <div>
              <BaseHeading size="xs" weight="medium" class="mb-2">API Key</BaseHeading>
              <div class="flex gap-2">
                <BaseInput 
                  v-model="apiSettings.apiKey" 
                  readonly
                  class="font-mono text-sm"
                />
                <BaseButton color="default" @click="generateNewApiKey">
                  <Icon name="ph:arrows-clockwise-duotone" class="me-1" />
                  Regenerate
                </BaseButton>
              </div>
              <BaseText size="xs" class="text-danger-500 mt-1">
                <Icon name="ph:warning-circle-duotone" class="inline size-3 me-1" />
                Keep this key secret. Regenerating will invalidate your current key.
              </BaseText>
            </div>
            
            <!-- Allowed Domains -->
            <div>
              <BaseHeading size="xs" weight="medium" class="mb-2">Allowed Domains</BaseHeading>
              <BaseText size="sm" class="text-muted-500 mb-2">
                Specify domains that are allowed to access the API. Leave empty to allow all domains.
              </BaseText>
              
              <div class="flex gap-2 mb-2">
                <BaseInput v-model="newDomain" placeholder="example.com" />
                <BaseButton color="default" @click="addDomain">Add</BaseButton>
              </div>
              
              <div class="flex flex-wrap gap-2 mt-2">
                <BaseTag 
                  v-for="domain in apiSettings.allowedDomains" 
                  :key="domain" 
                  :label="domain" 
                  size="sm"
                  removable
                  @remove="removeDomain(domain)"
                />
              </div>
            </div>
            
            <!-- Webhook URL -->
            <div>
              <BaseHeading size="xs" weight="medium" class="mb-2">Webhook URL</BaseHeading>
              <BaseText size="sm" class="text-muted-500 mb-2">
                We'll send event notifications to this URL
              </BaseText>
              <BaseInput v-model="apiSettings.webhookUrl" placeholder="https://yourdomain.com/webhook" />
            </div>
            
            <!-- Events to notify -->
            <div>
              <BaseHeading size="xs" weight="medium" class="mb-2">Notification Events</BaseHeading>
              <div class="space-y-2">
                <BaseCheckbox label="Render completed" model-value checked />
                <BaseCheckbox label="Project updated" model-value checked />
                <BaseCheckbox label="Project shared" model-value checked />
                <BaseCheckbox label="Export completed" model-value checked />
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-muted-200 dark:border-muted-700">
              <div class="flex justify-end">
                <BaseButton color="primary" :loading="saving" @click="saveApiSettings">
                  <Icon name="ph:check-circle-duotone" class="me-2" />
                  Save API Settings
                </BaseButton>
              </div>
            </div>
          </div>
          
          <BaseMessage v-else type="warning">
            API access is currently disabled. Enable it to generate an API key and configure integrations.
          </BaseMessage>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
