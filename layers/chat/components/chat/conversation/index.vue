<script setup lang="ts">
const props = defineProps<{
  isPanel?: boolean
}>()

const { chatEl, mobileOpen, loading } = useChat()

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
</script>

<template>
  <div class="text-muted-800 antialiased h-full">
    <!--Header-->
    <ChatHeaderAssistant :search='false'/>
    <!--Wrapper-->
    <div
      class="relative z-20 flex  w-full flex-row overflow-x-hidden"
    >
      <!--Conversations sidebar-->
      <div
        v-if="!isPanel"
        class="ltablet:static ltablet:py-4 dark:bg-muted-900 ltablet:dark:bg-muted-950 lg:dark:bg-muted-950 fixed start-0 top-0 z-30 flex h-full w-72 shrink-0 flex-col bg-white ps-4 transition-transform duration-300 lg:static lg:py-4"
        :class="mobileOpen ? 'translate-x-0' : '-translate-x-full ltablet:translate-x-0 lg:translate-x-0'"
      >
        <!--Mobile header-->
        <ChatHeaderMobile />
        <div class="ltablet:pe-0 flex h-full flex-col pe-2 lg:pe-0">
          <!--New conversation-->
          <div class="flex h-20 items-center justify-center pe-2">
            <BaseButton
              rounded="full"
              color="primary"
              class="w-full"
            >
              <Icon name="lucide:plus" class="size-4" />
              <span>New Conversation</span>
            </BaseButton>
          </div>
          <!--Conversations list-->
          <ChatConversationList />
          <!--Footer actions-->
          <ChatFooter />
        </div>
      </div>

      <!--Chat body-->
      <div
        class="dark:bg-muted-950 flex h-full flex-auto flex-col bg-white"
        :class="{ 'p-4': !isPanel }"
      >
        <div
          class="bg-muted-100 dark:bg-muted-900 flex h-full flex-auto shrink-0 flex-col overflow-hidden"
          :class="{ 'rounded-2xl': !isPanel }"
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
              <div v-if="!loading" class="space-y-12">
                <ChatConversationMessages />
              </div>
            </div>
            <!--Compose-->
            <div class="absolute inset-x-0 bottom-0 w-full">
              <ChatConversationTypes />
              <ChatConversationComposeTextarea />
            </div>
          </div>
        </div>
      </div>
      <!--Chat side-->
      <div
        v-if="!isPanel"
        class="dark:bg-muted-950 hidden w-80 shrink-0 flex-col bg-white py-4 pe-8 ps-4 lg:flex"
      >
        <div class="relative flex w-full flex-col">
          <!-- Loader -->
          <div v-if="loading" class="mt-4">
            <div class="mb-3 flex items-center justify-center">
              <BasePlaceload
                class="size-24 shrink-0 rounded-full"
                :width="96"
                :height="96"
              />
            </div>
            <div class="flex flex-col items-center">
              <BasePlaceload class="mb-2 h-3 w-full max-w-40 rounded" />
              <BasePlaceload class="mb-2 h-3 w-full max-w-24 rounded" />
              <div class="my-4 flex w-full flex-col items-center">
                <BasePlaceload class="mb-2 h-2 w-full max-w-60 rounded" />
                <BasePlaceload class="mb-2 h-2 w-full max-w-52 rounded" />
              </div>
              <div class="mb-6 flex w-full items-center justify-center">
                <div class="px-4">
                  <BasePlaceload class="h-3 w-14 rounded" />
                </div>
                <div class="px-4">
                  <BasePlaceload class="h-3 w-14 rounded" />
                </div>
              </div>
              <div class="w-full">
                <BasePlaceload class="h-10 w-full rounded-xl" />
                <BasePlaceload class="mx-auto mt-3 h-3 w-[7.5rem] rounded" />
              </div>
            </div>
          </div>
          <!-- User details -->
          <div v-else class="mt-4">
            <ChatUserDetails />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
