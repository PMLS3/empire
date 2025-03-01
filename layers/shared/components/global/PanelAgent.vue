<script setup lang="ts">
import { FocusTrap } from "@headlessui/vue";
import AssistantMenu from "../../../chat/components/assistant/Menu.vue";

const props = withDefaults(defineProps(), {
  search: true,
});

const isAssistantOpen = useState('assistant-open', () => false)

const {chatEl, readText, toggleReadText, selectedConversation, selectConversation, loading } =
  useChat();

const connectionState = useState<ConnectionState>("connectionState", () => ({
  isConnected: false,
  wsState: null,
  error: "",
}));
const { close } = usePanels();
onKeyStroke("Escape", close);

onMounted(() => {
  setTimeout(() => {
    if (chatEl.value) {
      chatEl.value.scrollTo({
        top: chatEl.value.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, 300)
})

const lock = () => {
  isAssistantOpen.value = !isAssistantOpen.value
  close()
}
</script>

<template>
  <div
    class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 border bg-white"
  >
    <FocusTrap>
      <div class="flex h-16 w-full items-center justify-between px-10">
        <AssistantMenu horizontal />

        <div class="flex items-center gap-3">
          <button
            type="button"
            class="hover:border-b-2 hover:border-primary-500 text-muted-400 hover:text-muted-600 dark:hover:text-muted-100"
            @click="toggleReadText"
          >
            <Icon
              name="ph:book-open"
              size="20"
              :class="readText ? 'text-green-500' : 'text-muted-400'"
            />
          </button>
          <button
            type="button"
            class="hover:border-b-2 hover:border-primary-500 text-muted-400 hover:text-muted-600 dark:hover:text-muted-100"
            @click="selectConversation(selectedConversation?.id)"
          >
            <Icon
              name="mdi:connection"
              size="20"
              :class="
                connectionState.isConnected ? 'text-green-500' : 'text-red-500'
              "
            />
          </button>
          <button
            type="button"
            class="hover:border-b-2 hover:border-primary-500 text-muted-400 hover:text-muted-600 dark:hover:text-muted-100"
            @click="lock"
          >
            <Icon name="feather:lock" size="20" :class="isAssistantOpen ? 'text-orange-500' : 'text-muted-400'" />
          </button>
          <button
            type="button"
            class="hover:border-b-2 hover:border-primary-500 text-muted-400 hover:text-muted-600 dark:hover:text-muted-100"
            @click="close"
            v-if="!isAssistantOpen"
          >
            <Icon name="feather:chevron-right" size="20" />
          </button>
        </div>
      </div>

      <div class="relative h-[calc(100dvh_-_64px)] w-full">
        <div class="dark:bg-muted-950 flex h-full flex-auto flex-col bg-white">
          <div
            class="bg-muted-100 dark:bg-muted-900 flex h-full flex-auto shrink-0 flex-col overflow-hidden"
          >
            <div class="relative flex h-full flex-col">
              <div
                ref="chatEl"
                class="relative flex h-full flex-col px-4 pb-24 pt-12"
                :class="
                  loading ? 'overflow-hidden' : 'overflow-y-auto nui-slimscroll'
                "
              >
                <!-- Loader-->
                <div
                  class="bg-muted-100 dark:bg-muted-900 pointer-events-none absolute inset-0 z-10 size-full p-8 transition-opacity duration-300"
                  :class="
                    loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  "
                >
                  <div class="mt-12 space-y-12">
                    <div class="flex w-full max-w-md gap-4">
                      <BasePlaceload
                        class="size-8 shrink-0 rounded-full"
                        :width="32"
                        :height="32"
                      />
                      <div class="grow space-y-2">
                        <BasePlaceload class="h-3 w-full max-w-56 rounded" />
                        <BasePlaceload class="h-3 w-full max-w-32 rounded" />
                      </div>
                    </div>
                    <div class="flex w-full max-w-md gap-4">
                      <BasePlaceload
                        class="size-8 shrink-0 rounded-full"
                        :width="32"
                        :height="32"
                      />
                      <div class="grow space-y-2">
                        <BasePlaceload class="h-3 w-full max-w-64 rounded" />
                        <BasePlaceload class="h-3 w-full max-w-48 rounded" />
                      </div>
                    </div>
                    <div
                      class="ms-auto flex w-full max-w-md flex-row-reverse justify-end gap-4"
                    >
                      <BasePlaceload
                        class="size-8 shrink-0 rounded-full"
                        :width="32"
                        :height="32"
                      />
                      <div class="grow space-y-2">
                        <BasePlaceload
                          class="ms-auto h-3 w-full max-w-64 rounded"
                        />
                        <BasePlaceload
                          class="ms-auto h-3 w-full max-w-48 rounded"
                        />
                      </div>
                    </div>
                    <div
                      class="ms-auto flex w-full max-w-md flex-row-reverse justify-end gap-4"
                    >
                      <BasePlaceload
                        class="size-8 shrink-0 rounded-full"
                        :width="32"
                        :height="32"
                      />
                      <div class="grow space-y-2">
                        <BasePlaceload
                          class="ms-auto h-3 w-full max-w-56 rounded"
                        />
                        <BasePlaceload
                          class="ms-auto h-3 w-full max-w-32 rounded"
                        />
                      </div>
                    </div>
                    <div class="flex w-full max-w-md gap-4">
                      <BasePlaceload
                        class="size-8 shrink-0 rounded-full"
                        :width="32"
                        :height="32"
                      />
                      <div class="grow space-y-2">
                        <BasePlaceload class="h-3 w-full max-w-56 rounded" />
                        <BasePlaceload class="h-3 w-full max-w-32 rounded" />
                      </div>
                    </div>
                    <div class="flex w-full max-w-md gap-4">
                      <BasePlaceload
                        class="size-8 shrink-0 rounded-full"
                        :width="32"
                        :height="32"
                      />
                      <div class="grow space-y-2">
                        <BasePlaceload class="h-3 w-full max-w-64 rounded" />
                        <BasePlaceload class="h-3 w-full max-w-48 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Messages loop -->
                <div class="space-y-12">
                  <ChatConversationMessages />
                </div>
              </div>
              <!--Compose-->
              <div class="absolute inset-x-0 bottom-4 w-full px-4">
                <ChatConversationTypes />
                <ChatConversationComposeTextarea />
              </div>
            </div>
          </div>
        </div>
      </div>
    </FocusTrap>
  </div>
</template>
