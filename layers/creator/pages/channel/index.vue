<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCreatorData } from '../../composables/useCreatorData';

const { getDataList } = useCreatorData();
const channels = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const result = await getDataList('channels', {
      orderBy: 'created_at',
      orderDirection: 'desc',
    });
    channels.value = result;
  } catch (error) {
    console.error('Error fetching channels:', error);
  } finally {
    loading.value = false;
  }
});

// Get platform icon
const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'youtube':
      return 'ph:youtube-logo-fill';
    case 'tiktok':
      return 'ph:tiktok-logo-fill';
    case 'instagram':
      return 'ph:instagram-logo-fill';
    case 'facebook':
      return 'ph:facebook-logo-fill';
    case 'twitter':
      return 'ph:twitter-logo-fill';
    case 'linkedin':
      return 'ph:linkedin-logo-fill';
    default:
      return 'ph:globe-duotone';
  }
};

// Get platform color
const getPlatformColor = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'youtube':
      return 'danger';
    case 'tiktok':
      return 'dark';
    case 'instagram':
      return 'purple';
    case 'facebook':
      return 'info';
    case 'twitter':
      return 'primary';
    case 'linkedin':
      return 'info';
    default:
      return 'muted';
  }
};
</script>

<template>
  <div>
    <BasePageTitle title="Channel Management" subtitle="Manage and connect your distribution channels" />
    
    <div class="flex justify-end mb-6">
      <BaseButton color="primary" as="nuxt-link" to="/creator/channel/connect">
        <Icon name="ph:plus-circle-duotone" class="me-2" />
        Connect New Channel
      </BaseButton>
    </div>
    
    <BasePlaceholderPage
      v-if="loading"
      title="Loading channels"
      subtitle="Please wait while we load your connected channels"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <div v-else-if="channels.length === 0" class="py-12 text-center">
      <div class="mb-4">
        <Icon name="ph:broadcast-duotone" class="size-16 mx-auto text-muted-400" />
      </div>
      <BaseHeading size="lg" weight="medium" class="mb-2">No Channels Connected</BaseHeading>
      <BaseText class="mb-6">Connect your social media channels to publish videos directly from the platform.</BaseText>
      <NuxtLink to="/creator/channel/connect" class="inline-block">
        <BaseButton color="primary">
          <Icon name="ph:plug-duotone" class="me-2" />
          Connect Channel
        </BaseButton>
      </NuxtLink>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Channel cards -->
      <BaseCard v-for="channel in channels" :key="channel.id" class="p-0 overflow-hidden">
        <!-- Channel header with platform -->
        <div 
          class="p-4 flex items-center justify-between"
          :class="`bg-${getPlatformColor(channel.platform)}-500/10`"
        >
          <div class="flex items-center gap-3">
            <div 
              class="size-10 rounded-full flex items-center justify-center"
              :class="`bg-${getPlatformColor(channel.platform)}-500 text-white`"
            >
              <Icon :name="getPlatformIcon(channel.platform)" class="size-5" />
            </div>
            <div>
              <BaseHeading size="sm" weight="medium" class="mb-0">{{ channel.name }}</BaseHeading>
              <BaseText size="xs" class="text-muted-500">{{ channel.platform }}</BaseText>
            </div>
          </div>
          
          <BaseTag :color="channel.status === 'active' ? 'success' : 'warning'" size="sm" :label="channel.status" />
        </div>
        
        <!-- Channel stats -->
        <div class="p-4 border-b border-muted-200 dark:border-muted-700">
          <div class="grid grid-cols-3 gap-2">
            <div class="text-center p-2">
              <div class="text-lg font-medium">{{ channel.subscribers?.toLocaleString() || '0' }}</div>
              <div class="text-xs text-muted-500">Subscribers</div>
            </div>
            <div class="text-center p-2 border-x border-muted-200 dark:border-muted-700">
              <div class="text-lg font-medium">{{ channel.videos?.toLocaleString() || '0' }}</div>
              <div class="text-xs text-muted-500">Videos</div>
            </div>
            <div class="text-center p-2">
              <div class="text-lg font-medium">{{ channel.views?.toLocaleString() || '0' }}</div>
              <div class="text-xs text-muted-500">Total Views</div>
            </div>
          </div>
        </div>
        
        <!-- Channel actions -->
        <div class="p-4">
          <div class="flex items-center justify-between">
            <NuxtLink :to="`/creator/channel/settings/${channel.id}`">
              <BaseButton color="default" size="sm">
                <Icon name="ph:gear-six-duotone" class="me-1" />
                Settings
              </BaseButton>
            </NuxtLink>
            
            <div class="flex gap-2">
              <BaseButton color="default" size="sm">
                <Icon name="ph:chart-line-duotone" class="me-1" />
                Analytics
              </BaseButton>
              <BaseButton color="primary" size="sm">
                <Icon name="ph:upload-duotone" class="me-1" />
                Upload
              </BaseButton>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
