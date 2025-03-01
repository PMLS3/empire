<script setup lang='ts'>
const { selectedConversation } = useChat()
</script>

<template>
  <div class="flex items-center justify-center">
    <BaseAvatar :src="selectedConversation?.user.photo" size="2xl" />
  </div>
  <div class="text-center">
    <BaseHeading
      tag="h3"
      size="lg"
      class="text-muted-800 dark:text-muted-100 mt-4"
    >
      <span>{{ selectedConversation?.user.name }}</span>
    </BaseHeading>
    <BaseParagraph size="sm" class="text-muted-400">
      <span>{{ selectedConversation?.user.role }}</span>
    </BaseParagraph>
    <div class="my-4">
      <BaseParagraph
        size="sm"
        class="text-muted-500 dark:text-muted-400"
      >
        <span>{{ selectedConversation?.user.bio }}</span>
      </BaseParagraph>
    </div>
    <div
      class="divide-muted-200 dark:divide-muted-700 flex items-center justify-center divide-x"
    >
      <div class="flex items-center justify-center gap-2 px-4">
        <Icon name="ph:timer-duotone" class="text-muted-400 size-4" />
        <span class="text-muted-400 font-sans text-xs">
          Age: {{ selectedConversation?.user.age }}
        </span>
      </div>
      <div class="flex items-center justify-center gap-2 px-4">
        <Icon
          name="ph:map-pin-duotone"
          class="text-muted-400 size-4"
        />
        <span class="text-muted-400 font-sans text-xs">
          {{ selectedConversation?.user.location }}
        </span>
      </div>
    </div>
    <div class="mt-6">
      <BaseButton rounded="lg" class="w-full">
        <span>
          View {{ selectedConversation?.user.name }}'s profile
        </span>
      </BaseButton>
      <NuxtLink
        to="/layouts/members"
        class="text-primary-500 mt-3 block font-sans text-sm underline-offset-4 hover:underline"
      >
        Manage members
      </NuxtLink>
    </div>
  </div>
</template>
