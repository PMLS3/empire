<script setup lang="ts">
definePageMeta({
  title: 'Channel Settings',
});

const route = useRoute();
const channelId = computed(() => route.params.id as string);
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
            <span>Channel Settings</span>
          </BaseHeading>
          <BaseParagraph>
            <span class="text-muted-500">
              Configure your channel details and preferences
            </span>
          </BaseParagraph>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-center gap-2 md:mt-0 md:justify-start">
        <BaseButtonAction to="/channels">
          <Icon name="lucide:arrow-left" class="size-3" />
          <span>Back to Channels</span>
        </BaseButtonAction>
      </div>
    </div>

    <ChannelSettings :channel-id="channelId" />
  </div>
</template>
