<script setup lang="ts">
import { ref } from 'vue'
const { message } = useChat()
const geminiChat = useChatGemini()
const isRecording = ref(false)
let recorder: ReturnType<typeof useChatGemini>['startVoiceRecording'] | null = null

const startRecording = async () => {
  if (isRecording.value) return
  console.log(' [5] Voice Sequence: User clicked microphone button')
  try {
    const voiceRecorder = await geminiChat.startVoiceRecording()
    if (voiceRecorder) {
      console.log(' [6] Voice Sequence: Starting audio recording')
      await voiceRecorder.startRecording()
      recorder = voiceRecorder
      isRecording.value = true
      message.value = ' Recording...'
      console.log(' [6a] Voice Sequence: Audio recording started successfully')
    }
  } catch (error) {
    console.error(' [6x] Voice Sequence: Failed to start recording:', error)
    message.value = error.message || 'Failed to start recording'
  }
}

const stopVoiceMessage = async () => {
  if (!isRecording.value || !recorder) return
  console.log(' [7] Voice Sequence: Stopping voice recording')

  try {
    await recorder.stopRecording()
    recorder.cleanup()
    recorder = null
    isRecording.value = false
    message.value = ''
    console.log(' [7a] Voice Sequence: Voice recording stopped successfully')
  } catch (err) {
    console.error(' [7b] Voice Sequence: Error stopping recording', err)
  }
}

onUnmounted(() => {
  if (recorder) {
    recorder.cleanup()
  }
})
</script>

<template>
  <div class="flex items-center space-x-2">
    <button
      class="btn size-10 rounded-full p-0"
      :class="{
        'bg-primary hover:bg-primary-focus': isRecording,
        'bg-slate-150 dark:bg-navy-500 dark:hover:bg-navy-450 hover:bg-slate-200': !isRecording,
      }"
      @click="isRecording ? stopVoiceMessage() : startRecording()"
    >
      <Icon
        :name="isRecording ? 'heroicons:microphone-solid' : 'heroicons:microphone'"
        class="size-5"
        :class="{
          'text-white': isRecording,
          'dark:text-navy-100 text-slate-500': !isRecording,
        }"
      />
    </button>
  </div>
</template>
