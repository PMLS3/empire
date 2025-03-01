<script setup lang='ts'>
const { message, messageLoading, submitMessage } = useChat()
const imageInput = ref<HTMLInputElement | null>(null)
const formInputRef = ref()
const selectedImage = ref<File | null>(null)
const imagePreview = ref('')

// Add autofocus on mount
onMounted(() => {
  if (formInputRef.value?.$el) {
    const input = formInputRef.value.$el.querySelector('input')
    if (input) input.focus()
  }
})

const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    selectedImage.value = input.files[0]
    const reader = new FileReader()
    reader.onload = e => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

const handleSubmit = async () => {
  if (!message.value?.trim() && !selectedImage.value) return

  await submitMessage({
    text: message.value,
    image: imagePreview.value
  })

  // Reset image after sending
  selectedImage.value = null
  imagePreview.value = ''
  if (imageInput.value) {
    imageInput.value.value = ''
  }

  // Focus back on input after sending
  nextTick(() => {
    if (formInputRef.value?.$el) {
      const input = formInputRef.value.$el.querySelector('input')
      if (input) {
        input.focus()
        // Optionally scroll input into view
        input.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }
  })
}

const removeImage = () => {
  selectedImage.value = null
  imagePreview.value = ''
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}
</script>

<template>
  <form
    method="POST"
    action=""
    class="dark:bg-muted-950 flex flex-col gap-2 rounded-xl bg-white p-3"
    @submit.prevent="handleSubmit"
  >
    <!-- Image Preview -->
    <div v-if="imagePreview" class="relative w-32 h-32">
      <img :src="imagePreview" class="w-full h-full object-cover rounded-lg" />
      <button
        @click="removeImage"
        type="button"
        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
      >
        <Icon name="lucide:x" class="size-4" />
      </button>
    </div>

    <div class="flex flex-row items-center gap-2 h-16">
      <div class="hidden sm:block">
        <input
          ref="imageInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleImageSelect"
        >
        <button
          type="button"
          class="hover:bg-muted-100 dark:hover:bg-muted-900 text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hidden size-10 items-center justify-center rounded-xl transition-colors duration-200 focus:outline-none sm:flex"
          @click="imageInput?.click()"
        >
          <Icon name="lucide:image" class="size-5" />
        </button>
      </div>
      <div class="grow">
        <div class="relative w-full">
          <FormInput
            ref="formInputRef"
            v-model="message"
            :disabled="messageLoading"
            rounded="lg"
            :classes="{
              input: 'pe-10 focus:ring-0',
            }"
            placeholder="Write a message..."
            @keyup.enter.prevent="handleSubmit"
          />
          <button
            type="button"
            class="text-muted-400 hover:text-muted-600 absolute right-0 top-0 flex h-full w-12 items-center justify-center"
          >
            <svg
              class="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </div>
      <div>
        <BaseButton
          type="submit"
          color="primary"
          rounded="lg"
          :loading="messageLoading"
          :disabled="!message?.trim() && !selectedImage"
        >
          <span>Send</span>
          <Icon
            name="ph:paper-plane-right-duotone"
            class="!hidden size-5 sm:!block"
          />
        </BaseButton>
      </div>
    </div>
  </form>
</template>
