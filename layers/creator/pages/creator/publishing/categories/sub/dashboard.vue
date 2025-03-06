<script setup lang="ts">
definePageMeta({
  title: 'Writer',
  preview: {
    title: 'Writer dashboard',
    description: 'For writers and bloggers',
    categories: ['dashboards'],
    src: '/img/screens/dashboards-writer.png',
    srcDark: '/img/screens/dashboards-writer-dark.png',
    order: 18,
  },
})
</script>

<template>
  <div>
    <publishing-categories-sub-dashboard />
  </div>
</template>