<script setup lang='ts'>
const { selectedOption } = useChat()
</script>

<template>
  <div class="flex h-20 items-center justify-between gap-3 pe-2">
    <NuxtLink
      to="/dashboards"
      class="text-muted-500 dark:text-muted-400 hover:text-primary-500 border-muted-200 dark:border-muted-800 hover:border-primary-500 flex size-12 items-center justify-center rounded-xl border transition-colors duration-200 dark:hover:border-purple-500 dark:hover:text-purple-500"
    >
      <Icon name="ion:arrow-back-outline" class="size-4" />
    </NuxtLink>
    <button
      class="flex size-12 items-center justify-center rounded-xl transition-colors duration-200"
      :class="
        selectedOption === 'chat'
          ? 'bg-primary-500/10 text-primary-500'
          : 'bg-muted-50 hover:bg-muted-100 dark:bg-muted-900 dark:hover:bg-muted-800 text-muted-500'
      "
      data-nui-tooltip="Messaging"
      @click="selectedOption = 'chat'"
    >
      <Icon name="ion:chatbubble-outline" class="size-5" />
    </button>
    <button
      class="flex size-12 items-center justify-center rounded-xl transition-colors duration-200"
      :class="
        selectedOption === 'calendar'
          ? 'bg-primary-500/10 text-primary-500'
          : 'bg-muted-50 hover:bg-muted-100 dark:bg-muted-900 dark:hover:bg-muted-800 text-muted-500'
      "
      data-nui-tooltip="Calendar"
      @click="selectedOption = 'calendar'"
    >
      <Icon name="ion:calendar-outline" class="size-5" />
    </button>
    <button
      class="flex size-12 items-center justify-center rounded-xl transition-colors duration-200"
      :class="
        selectedOption === 'canvas'
          ? 'bg-primary-500/10 text-primary-500'
          : 'bg-muted-50 hover:bg-muted-100 dark:bg-muted-900 dark:hover:bg-muted-800 text-muted-500'
      "
      data-nui-tooltip="Preferences"
      @click="selectedOption = 'canvas'"
    >
      <Icon name="ion:options-outline" class="size-5" />
    </button>
  </div>
</template>
