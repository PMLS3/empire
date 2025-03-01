<script setup lang="ts">


definePageMeta({
  title: "Messaging",
  layout: "empty",
  preview: {
    title: "Messaging app",
    description: "For conversations and chats",
    categories: ["dashboards"],
    src: "/img/screens/dashboards-messaging-2.png",
    srcDark: "/img/screens/dashboards-messaging-2-dark.png",
    order: 26,
    new: true,
  },
})

</script>

<template>
  <ChatAgents :is-panel="false" />
</template>
