<script setup lang="ts">
const props = defineProps<{
  error: any
}>()

const app = useAppConfig()
</script>

<template>
  <SidebarLayout :sidebar="false">
    <template #toolbar-title>
      {{ app.tairo?.title }}
    </template>

    <Error :error="props.error" />
  </SidebarLayout>
</template>
