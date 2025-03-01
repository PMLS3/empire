<script setup lang='ts'>
const { mobileOpen } = useChat()
</script>

<template>
  <div
    class="ltablet:hidden flex h-16 items-center justify-between pe-4 lg:hidden"
  >
    <NuxtLink
      to="/"
      class="flex items-center gap-2"
      aria-label="Go to Tairo homepage"
    >
      <Logo class="text-muted-800 h-9 dark:text-white" />
      <LogoText class="text-muted-800 h-3 dark:text-white" />
    </NuxtLink>
    <BaseButtonClose
      color="muted"
      rounded="lg"
      @click="mobileOpen = false"
    />
  </div>
</template>
