<script setup lang="ts">
const { navigation } = usePublishing()
</script>

<template>
  <nav class="space-y-1">
    <NuxtLink
      v-for="item in navigation"
      :key="item.to"
      :to="item.to"
      class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
      :class="[
        $route.path === item.to
          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      ]"
    >
      <component :is="'icon-' + item.icon" class="w-5 h-5" />
      <span class="font-medium">{{ item.title }}</span>
    </NuxtLink>
  </nav>
</template>
