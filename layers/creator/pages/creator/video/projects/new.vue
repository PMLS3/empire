<script setup lang="ts">
import { useCreatorData } from '../../composables/useCreatorData';

definePageMeta({
  title: 'New Video Project',
});

const route = useRoute();
const channelId = computed(() => route.query.channel as string || '');

const { dataList: channels, loading, error } = useCreatorData();

// Fetch user channels
onMounted(async () => {
  await fetchUserChannels();
});

const fetchUserChannels = async () => {
  await useCreatorData().fetchData('channels');
};

// Current channel
const currentChannel = computed(() => {
  if (!channels.value || channels.value.length === 0) return null;
  
  if (channelId.value) {
    return channels.value.find(c => c.id === channelId.value) || channels.value[0];
  }
  
  return channels.value[0];
});
</script>

<template>
  <div class="py-10">
    <div class="mb-8 flex flex-col justify-between md:flex-row md:items-center">
      <div class="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
        <div>
          <BaseHeading
            as="h2"
            size="xl"
            weight="light"
            lead="tight"
            class="text-muted-800 dark:text-white"
          >
            <span>New Project</span>
          </BaseHeading>
          <BaseParagraph>
            <span class="text-muted-500">
              Create a new video project for your channel
            </span>
          </BaseParagraph>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-center gap-2 md:mt-0 md:justify-start">
        <BaseButtonAction to="/projects">
          <Icon name="lucide:arrow-left" class="size-3" />
          <span>Back to Projects</span>
        </BaseButtonAction>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <BaseProgressCircle size="lg" />
    </div>

    <BaseMessage v-else-if="error" type="danger" class="mb-6">
      {{ error }}
    </BaseMessage>

    <div v-else-if="!currentChannel" class="text-center py-12">
      <div class="mb-4">
        <Icon name="ph:folder-notch-open-duotone" class="size-16 text-muted-400 mx-auto" />
      </div>
      <BaseHeading as="h3" size="lg" class="mb-2">No channels found</BaseHeading>
      <BaseParagraph class="text-muted-500 mb-6">
        You need to create a channel before creating a project.
      </BaseParagraph>
      <BaseButton to="/channels/new" color="primary">
        <Icon name="lucide:plus" class="size-4 me-2" />
        <span>Create Channel</span>
      </BaseButton>
    </div>

    <div v-else>
      <div v-if="channels.length > 1" class="mb-8">
        <BaseSelect v-model="channelId" label="Select Channel">
          <option v-for="channel in channels" :key="channel.id" :value="channel.id">
            {{ channel.name }}
          </option>
        </BaseSelect>
      </div>

      <ProjectForm 
        :channel-id="currentChannel?.id" 
        mode="create"
      />
    </div>
  </div>
</template>
