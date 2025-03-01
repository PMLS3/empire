<script setup lang='ts'>
const { conversations, activeConversation, selectConversation } = useChat()
</script>

<template>
  <div
    class="nui-slimscroll flex h-[calc(100dvh_-_160px)] flex-col space-y-1 overflow-y-auto pe-2"
  >
    <button
      v-for="conversation in conversations"
      :key="conversation.id"
      class="flex items-center gap-2 rounded-xl p-2 transition-colors duration-200 ease-in-out"
      :class="[
        activeConversation === conversation.id
          ? 'bg-primary-500/10'
          : 'hover:bg-muted-100 dark:hover:bg-muted-900',
        conversation.user.role === 'gemini'
          ? 'border-2 border-primary-500/20'
          : ''
      ]"
      @click.prevent="selectConversation(conversation.id)"
    >
      <BaseAvatar :src="conversation.user.photo" />
      <BaseText
        size="sm"
        :class="
          activeConversation === conversation.id
            ? 'text-primary-500'
            : 'text-muted-500 dark:text-muted-400'
        "
      >
        {{ conversation.user.name }}
      </BaseText>
      <span
        class="bg-primary-500 me-3 ms-auto block size-2 rounded-full transition-opacity duration-300"
        :class="
          activeConversation === conversation.id
            ? 'opacity-100'
            : 'opacity-0'
        "
      />
    </button>
  </div>
</template>
