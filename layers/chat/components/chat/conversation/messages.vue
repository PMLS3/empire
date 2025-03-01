<script setup lang='ts'>
const { selectedConversation,selectConversation, activeConversationId, conversations } = useChat()

// Add ref for the messages container
const messagesContainer = ref<HTMLElement | null>(null)

// Function to scroll to bottom
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

// Watch for changes in messages and scroll to bottom
watch(
  () => selectedConversation?.value?.messages,
  (newMessages) => {
    if (newMessages?.length) {
      scrollToBottom()
    }
  },
  { deep: true }
)

interface MessageType {
  type: 'sent' | 'received' | 'system' | 'info' | 'warn' | 'error' | 'debug'
  text: string
  time?: string
  icon?: string
  metadata?: Record<string, any>
  userId?: string
  attachments?: Array<{
    type: 'image' | 'link' | 'voice' | 'canvas'
    text?: string
    image?: string
    url?: string
    audio?: string
    captions?: string
    name?: string
    props?: Record<string, any>
  }>
}

// Message type specific styles and icons
const messageStyles = {
  sent: 'bg-primary-500/20 rounded-se-none',
  received: 'bg-muted-200 dark:bg-muted-950 rounded-ss-none',
  system: 'bg-muted-100 dark:bg-muted-900 text-info-300',
  info: 'bg-muted-100 dark:bg-muted-900 text-primary-300',
  warn: 'bg-muted-100 dark:bg-muted-900 text-warning-300',
  error: 'bg-muted-100 dark:bg-muted-900 text-danger-300',
  debug: 'bg-muted-100 dark:bg-muted-900 text-info-300'
}

const messageIcons = {
  system: 'mdi:information',
  info: 'lucide:info',
  warn: 'lucide:alert-triangle',
  error: 'lucide:alert-circle',
  debug: 'lucide:debug'
}

const isSystemMessage = (type: string) => ['system', 'info', 'warn', 'error', 'debug'].includes(type)

const resolveComponentName = (name: string) => {

return resolveComponent(name)
}

onMounted(() => {
  console.log(conversations.value)
  console.log(activeConversationId.value)

  if(!activeConversationId.value) {
    selectConversation(conversations?.value[0].id)
  }

  scrollToBottom()
})
</script>

<template>
  <div
    ref="messagesContainer"
    class="flex flex-col w-full gap-4 overflow-y-auto px-4 pb-4 hidden-scrollbar"
    style="height: calc(100vh - 280px);"
  >
    <div class="flex flex-col space-y-4 pb-12">
      <div v-for="(item, index) in selectedConversation?.messages"
           :key="index"
           class="relative flex w-full gap-4"
           :class="[
             item.type === 'received' ? 'flex-row' : 'flex-row-reverse',
             isSystemMessage(item.type) ? 'justify-center' : '',
           ]"
      >
        <!-- Chat Messages (sent/received) -->
        <template v-if="!isSystemMessage(item.type)">
          <div class="shrink-0">
            <BaseAvatar v-if="item.type === 'received'" :src="selectedConversation?.user.photo" size="xs" />
            <BaseAvatar v-else-if="item.type === 'sent'" src="/img/avatars/2.svg" size="xs" />
          </div>
          <div class="flex max-w-md flex-col">
            <div class="text-muted-800 dark:text-muted-200 rounded-xl p-4" :class="messageStyles[item.type]">
              <p class="font-sans text-sm whitespace-pre-wrap">
                {{ item.text }}
              </p>
              <div v-if="item.metadata" class="mt-2 text-xs text-muted-400">
                <pre class="whitespace-pre-wrap">{{ JSON.stringify(item.metadata, null, 2) }}</pre>
              </div>
            </div>
            <div class="text-muted-400 mt-1 font-sans text-xs" :class="item.type === 'received' ? 'text-end' : ''">
              {{ item.time }}
            </div>
            <!-- Attachments -->
            <div v-if="item.attachments?.length > 0" class="mt-2 space-y-2">
              <template v-for="(attachment, idx) in item.attachments" :key="idx">
                <!-- Image Attachment -->
                <div v-if="attachment.type === 'image'"
                     class="dark:bg-muted-800 max-w-xs rounded-2xl bg-white p-2"
                     :class="item.type === 'sent' ? 'ms-auto' : ''">
                  <img :src="attachment.image" :alt="attachment.text" class="rounded-xl">
                </div>

                <!-- Link Attachment -->
                <NuxtLink v-else-if="attachment.type === 'link'"
                         :to="attachment.url"
                         class="dark:bg-muted-950 block max-w-xs rounded-2xl bg-white p-2"
                         :class="item.type === 'sent' ? 'ms-auto' : ''">
                  <img :src="attachment.image" :alt="attachment.text" class="rounded-xl">
                  <div class="px-1 py-2">
                    <p class="text-muted-800 dark:text-muted-100 font-sans">
                      {{ attachment.url?.replace(/(^\w+:|^)\/\//, "") }}
                    </p>
                    <p class="text-muted-400 font-sans text-xs">
                      {{ attachment.text }}
                    </p>
                  </div>
                </NuxtLink>

                <!-- Voice Attachment -->
                <div v-else-if="attachment.type === 'voice'"
                     class="dark:bg-muted-950 block w-96 rounded-2xl bg-white p-2"
                     :class="item.type === 'sent' ? 'ms-auto' : ''">
                  <audio controls class="w-full" :src="attachment.audio">
                    <track kind="captions" :src="attachment.captions" label="English captions" srclang="en">
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <!-- Canvas Attachment -->
                <div v-else-if="attachment.type === 'canvas'"
                     class="dark:bg-muted-950 block w-96 rounded-2xl bg-white p-2"
                     :class="item.type === 'sent' ? 'ms-auto' : ''">
                  <component :is="resolveComponentName(attachment.name)"  v-bind="attachment.props"/>
                </div>

              </template>
            </div>
          </div>
        </template>

        <!-- System Messages -->
        <div v-else class="w-full">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="border-muted-300/50 dark:border-muted-800 w-full border-t" />
          </div>
          <div class="relative flex w-full justify-center">
            <span :class="messageStyles[item.type]" class="items-center px-3 font-sans text-xs uppercase">
              <Icon :name="messageIcons[item.type] || 'mdi:information'" class="mr-1" />
              {{ item.text }}
              <span v-if="item.metadata" class="ml-2 text-muted-400">
                {{ JSON.stringify(item.metadata) }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Option 1: Thin primary scrollbar */
.thin-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.thin-scrollbar::-webkit-scrollbar-track {
  @apply bg-muted-100 dark:bg-muted-900;
}

.thin-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-primary-500 rounded-full;
}

/* Option 2: Hidden scrollbar (currently active) */
.hidden-scrollbar::-webkit-scrollbar {
  display: none;
}

.hidden-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
