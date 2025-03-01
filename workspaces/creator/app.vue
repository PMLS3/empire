<script setup lang="ts">
const route = useRoute();
const app = useAppConfig();
/**
 * Global head configuration
 * @see https://nuxt.com/docs/getting-started/seo-meta
 */
useHead({
  title: () => route.meta?.title ?? "",
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} - ${app.tairo?.title}`
      : `${app.tairo?.title}`;
  },
  htmlAttrs: {
    lang: "en",
    dir: "ltr",
  },
  link: [
    {
      rel: "icon",
      type: "image/png",
      href: "/img/favicon.png",
    },
  ],

  meta: [
    {
      name: "description",
      content: () =>
        route.meta.description ??
        "The most advanced Nuxt and Tailwind CSS dashboard template",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:site",
      content: "@cssninjaStudio",
    },
    {
      name: "og:image:type",
      content: "image/png",
    },
    {
      name: "og:image:width",
      content: "1200",
    },
    {
      name: "og:image:height",
      content: "630",
    },
    {
      name: "og:image",
      content: `https://media.cssninja.io/embed/marketplace/product/wide.png?headline=${encodeURIComponent(
        route.meta.description ||
          (route.meta.preview
            ? `${route.meta.preview?.title} - ${route.meta.preview?.description}`
            : "Nuxt & Tailwind CSS dashboard system")
      )}&url=${encodeURIComponent(
        "https://media.cssninja.io/content/products/logos/tairo-text-white.svg"
      )}&previewUrl=${encodeURIComponent(
        `https://tairo.cssninja.io${
          route.meta.preview?.src || "/img/screens/documentation-hub.png"
        }`
      )}`,
    },
  ],
});


const isAssistantOpen = useState('assistant-open', () => false)

definePageMeta({
  middleware: ["auth"],
});
</script>

<template>
  <div>
    <!--
      Global app search modal
      @see .demo/components/DemoAppSearch.vue
    -->
    <AppSearch />
    <!--
      Global app layout switcher
      @see .demo/components/DemoAppLayoutSwitcher.vue
    -->
    <AppLayoutSwitcher />

    <!--
      Vue Axe Popup
      @see .demo/plugins/vue-axe.client.ts
    -->
    <VueAxePopup />
 
    <div class="relative flex w-full">
      <div :class="isAssistantOpen ? 'w-4/5' : 'w-full'">
    <NuxtLayout>
      <NuxtLoadingIndicator color="rgb(var(--color-primary-500))" />
   
        <NuxtPage />
     
    </NuxtLayout>
  </div>
        <div v-if="isAssistantOpen" class="fixed top-0 right-0 p-2 hidden lg:block w-1/5 rounded">
          <ClientOnly>
            <PanelAgent />
          </ClientOnly>
        </div>
        <div v-if="isAssistantOpen" class="bg-primary-500 right-0 block lg:hidden">  
          <!-- <Assistant is-circular-chat /> -->
        </div>
      </div>
  </div>
</template>
