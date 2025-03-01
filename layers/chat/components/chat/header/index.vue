<script setup lang='ts'>
const { mobileOpen, searchMessages } = useChat()

</script>

<template>
  <div
    class="ltablet:z-30 border-muted-200 dark:border-muted-800 dark:bg-muted-950 relative flex h-16 w-full items-center justify-between border-b bg-white px-4 lg:z-30"
    :class="mobileOpen ? 'z-20' : 'z-30'"
  >
    <div class="flex w-1/2 items-center gap-2 sm:w-1/5">
      <!-- Hamburger -->
      <button
        class="ltablet:hidden relative flex size-10 items-center justify-center lg:hidden"
        @click="mobileOpen = !mobileOpen"
      >
        <div
          class="start-6 top-1/2 block w-4 -translate-x-1/2 -translate-y-1/2"
        >
          <span
            class="text-primary-500 absolute block h-0.5 w-6 bg-current transition duration-500 ease-in-out"
            :class="mobileOpen ? 'rotate-45' : '-translate-y-2'"
          />
          <span
            class="text-primary-500 absolute block h-0.5 w-5 bg-current transition duration-500 ease-in-out"
            :class="mobileOpen ? 'opacity-0' : ''"
          />
          <span
            class="text-primary-500 absolute block h-0.5 w-6 bg-current transition duration-500 ease-in-out"
            :class="mobileOpen ? '-rotate-45' : 'translate-y-2'"
          />
        </div>
      </button>
      <NuxtLink
        to="/"
        class="ltablet:flex hidden items-center gap-2 lg:flex"
        aria-label="Go to Tairo homepage"
      >
        <LogoText class="text-primary-500 h-6 dark:text-white" />
      </NuxtLink>
    </div>
    <div
      class="ltablet:max-w-sm mx-auto hidden max-w-xs grow sm:block lg:max-w-xl"
    >
      <FormInput
        v-model="searchMessages"
        rounded="lg"
        icon="lucide:search"
        placeholder="Search messages..."
        :classes="{
          input: '!h-11 !ps-11',
          icon: '!h-11 !w-11',
        }"
      />
    </div>
    <div class="flex w-1/2 items-center justify-end gap-4 sm:w-1/5">
      <ChatFooter />
      <ThemeToggle />
      <AccountMenu horizontal />
    </div>
  </div>
</template>
