<script setup lang="ts">
import { ref } from 'vue';
import { useToaster } from '../../../shared/composables/toaster';

const toaster = useToaster();
const step = ref(1);
const selectedPlatform = ref<string | null>(null);
const isConnecting = ref(false);
const redirectUri = ref('');

// Available platforms
const platforms = [
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: 'ph:youtube-logo-fill',
    color: 'danger',
    description: 'Upload and manage videos on YouTube',
    features: ['Video upload', 'Channel management', 'Analytics integration']
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: 'ph:tiktok-logo-fill',
    color: 'dark',
    description: 'Upload short videos to TikTok',
    features: ['Short video upload', 'Content management', 'Basic analytics']
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: 'ph:instagram-logo-fill',
    color: 'purple',
    description: 'Publish Reels and videos on Instagram',
    features: ['Reels upload', 'Post scheduling', 'Story creation']
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: 'ph:facebook-logo-fill',
    color: 'info',
    description: 'Publish videos on Facebook pages and groups',
    features: ['Video publishing', 'Page management', 'Audience targeting']
  },
  { 
    id: 'twitter', 
    name: 'Twitter', 
    icon: 'ph:twitter-logo-fill',
    color: 'primary',
    description: 'Share video content on your Twitter feed',
    features: ['Video upload', 'Tweet scheduling', 'Audience analytics']
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: 'ph:linkedin-logo-fill',
    color: 'info',
    description: 'Share professional videos on LinkedIn',
    features: ['Video upload', 'Company page integration', 'Professional audience']
  }
];

// Connect to platform
const connectToPlatform = async () => {
  if (!selectedPlatform.value) return;
  
  isConnecting.value = true;
  
  try {
    // Get OAuth URL for the selected platform
    const response = await $fetch(`/api/integrations/${selectedPlatform.value}/auth-url`, {
      method: 'GET'
    });
    
    if (response.authUrl) {
      // Store redirect URI for when we return from OAuth flow
      redirectUri.value = window.location.href;
      
      // Redirect to platform OAuth page
      window.location.href = response.authUrl;
    } else {
      throw new Error('Failed to get authentication URL');
    }
  } catch (err) {
    console.error('Error connecting to platform:', err);
    toaster.show({
      title: 'Connection Error',
      message: 'Failed to connect to platform. Please try again.',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    isConnecting.value = false;
  }
};

// Get the selected platform object
const currentPlatform = computed(() => {
  return platforms.find(p => p.id === selectedPlatform.value) || null;
});

// Go to next step
const goToNextStep = () => {
  step.value++;
};

// Go back to previous step
const goToPreviousStep = () => {
  step.value--;
  selectedPlatform.value = null;
};
</script>

<template>
  <div>
    <BasePageTitle title="Connect Channel" subtitle="Add a new distribution channel for your videos" />
    
    <div class="max-w-3xl mx-auto">
      <!-- Step indicator -->
      <div class="flex items-center justify-center mb-8">
        <div class="flex items-center">
          <div 
            class="size-10 rounded-full bg-primary-500 text-white flex items-center justify-center"
          >
            1
          </div>
          <div class="w-16 h-1 bg-primary-500"></div>
          <div 
            class="size-10 rounded-full flex items-center justify-center"
            :class="step >= 2 ? 'bg-primary-500 text-white' : 'bg-muted-200 dark:bg-muted-700 text-muted-500'"
          >
            2
          </div>
          <div 
            class="w-16 h-1"
            :class="step >= 2 ? 'bg-primary-500' : 'bg-muted-200 dark:bg-muted-700'"
          ></div>
          <div 
            class="size-10 rounded-full flex items-center justify-center"
            :class="step >= 3 ? 'bg-primary-500 text-white' : 'bg-muted-200 dark:bg-muted-700 text-muted-500'"
          >
            3
          </div>
        </div>
      </div>
      
      <!-- Step 1: Select Platform -->
      <div v-if="step === 1">
        <BaseHeading size="xl" weight="medium" class="text-center mb-6">Select a Platform</BaseHeading>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="platform in platforms"
            :key="platform.id"
            class="p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm"
            :class="selectedPlatform === platform.id ? 
              `border-${platform.color}-500 bg-${platform.color}-50 dark:bg-${platform.color}-500/10` : 
              'border-muted-200 dark:border-muted-700 hover:border-muted-300 dark:hover:border-muted-600'"
            @click="selectedPlatform = platform.id"
          >
            <div class="flex flex-col items-center text-center">
              <div 
                class="size-16 rounded-full flex items-center justify-center mb-4"
                :class="`bg-${platform.color}-100 dark:bg-${platform.color}-500/20 text-${platform.color}-500`"
              >
                <Icon :name="platform.icon" class="size-8" />
              </div>
              <BaseHeading size="sm" weight="medium" class="mb-1">{{ platform.name }}</BaseHeading>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-8">
          <BaseButton 
            color="primary" 
            :disabled="!selectedPlatform"
            @click="goToNextStep"
          >
            Continue
            <Icon name="ph:arrow-right" class="ms-2" />
          </BaseButton>
        </div>
      </div>
      
      <!-- Step 2: Platform Details -->
      <div v-else-if="step === 2 && currentPlatform">
        <BaseCard class="p-6">
          <div class="flex items-center gap-4 mb-6">
            <div 
              class="size-16 rounded-full flex items-center justify-center"
              :class="`bg-${currentPlatform.color}-100 dark:bg-${currentPlatform.color}-500/20 text-${currentPlatform.color}-500`"
            >
              <Icon :name="currentPlatform.icon" class="size-8" />
            </div>
            <div>
              <BaseHeading size="xl" weight="medium" class="mb-1">Connect to {{ currentPlatform.name }}</BaseHeading>
              <BaseText class="text-muted-500">{{ currentPlatform.description }}</BaseText>
            </div>
          </div>
          
          <div class="p-4 bg-muted-100 dark:bg-muted-800 rounded-lg mb-6">
            <BaseHeading size="sm" weight="medium" class="mb-2">Features</BaseHeading>
            <ul class="space-y-2">
              <li v-for="(feature, index) in currentPlatform.features" :key="index" class="flex items-center gap-2">
                <Icon name="ph:check-circle-duotone" class="size-5 text-success-500" />
                {{ feature }}
              </li>
            </ul>
          </div>
          
          <div class="p-4 bg-muted-100 dark:bg-muted-800 rounded-lg mb-6">
            <BaseHeading size="sm" weight="medium" class="mb-2">Requirements</BaseHeading>
            <BaseText class="mb-4">
              To connect with {{ currentPlatform.name }}, you'll need:
            </BaseText>
            <ul class="space-y-2">
              <li class="flex items-center gap-2">
                <Icon name="ph:check-circle-duotone" class="size-5 text-success-500" />
                An existing {{ currentPlatform.name }} account
              </li>
              <li class="flex items-center gap-2">
                <Icon name="ph:check-circle-duotone" class="size-5 text-success-500" />
                Permission to create and manage content
              </li>
              <li class="flex items-center gap-2">
                <Icon name="ph:check-circle-duotone" class="size-5 text-success-500" />
                Accept the permission requests in the next step
              </li>
            </ul>
          </div>
          
          <BaseMessage type="info" class="mb-6">
            You'll be redirected to {{ currentPlatform.name }} to authorize access. After authorization, you'll be returned to this application.
          </BaseMessage>
          
          <div class="flex items-center justify-between">
            <BaseButton 
              color="default" 
              @click="goToPreviousStep"
            >
              <Icon name="ph:arrow-left" class="me-2" />
              Back
            </BaseButton>
            
            <BaseButton 
              color="primary" 
              :loading="isConnecting"
              @click="connectToPlatform"
            >
              <Icon :name="currentPlatform.icon" class="me-2" />
              Connect to {{ currentPlatform.name }}
            </BaseButton>
          </div>
        </BaseCard>
      </div>
      
      <!-- Step 3: Success (Only shown after redirecting back from OAuth) -->
      <div v-else-if="step === 3">
        <BaseCard class="p-8 text-center">
          <div class="size-20 rounded-full bg-success-100 dark:bg-success-500/20 text-success-500 flex items-center justify-center mx-auto mb-6">
            <Icon name="ph:check-duotone" class="size-10" />
          </div>
          
          <BaseHeading size="xl" weight="medium" class="mb-2">Connection Successful!</BaseHeading>
          <BaseText class="mb-6">Your channel has been successfully connected to our platform.</BaseText>
          
          <div class="flex flex-col gap-3 max-w-xs mx-auto">
            <BaseButton 
              color="success" 
              as="nuxt-link" 
              to="/creator/channel"
              block
            >
              View All Channels
            </BaseButton>
            
            <BaseButton 
              color="primary" 
              as="nuxt-link" 
              to="/creator/projects"
              block
            >
              Create New Video
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
