<script setup lang="ts">
definePageMeta({
  title: 'Categories',
  preview: {
    title: 'Writer dashboard',
    description: 'For writers and bloggers',
    categories: ['dashboards'],
    src: '/img/screens/dashboards-writer.png',
    srcDark: '/img/screens/dashboards-writer-dark.png',
    order: 18,
  },
})
const route = useRoute()
</script>

<template>
  <div>
    <BaseTitle>{{ route.params.id }}</BaseTitle>
    <publishing-categories-dashboard />
  </div>
</template>
