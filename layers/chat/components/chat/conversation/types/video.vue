<script setup lang='ts'>
const { sendVideoMessage, message } = useChat()
const {
  isSharing,
  error,
  startSharing,
  stopSharing,
  captureFrame,
  cleanup: cleanupCamera,
  stream
} = useCameraShare()

const duration = ref(0)
const intervalId = ref<number | null>(null)
const audioProcessor = ref<ScriptProcessorNode | null>(null)
const audioContext = ref<AudioContext | null>(null)
const audioChunks = ref<Int16Array[]>([])

const startVideoMessage = async () => {
  const started = await startSharing({
    width: 1280,
    height: 720,
    frameRate: 30,
    facingMode: 'user'
  })

  if (started && stream.value) {
    message.value = '🔴 Recording video...'

    // Start duration timer
    duration.value = 0
    intervalId.value = window.setInterval(() => {
      duration.value++
    }, 1000)

    // Initialize audio processing
    try {
      audioContext.value = new AudioContext()
      const source = audioContext.value.createMediaStreamSource(stream.value)
      audioProcessor.value = audioContext.value.createScriptProcessor(4096, 1, 1)

      audioProcessor.value.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0)
        const pcmData = new Int16Array(inputData.length)

        // Convert Float32 to Int16
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768))
        }

        audioChunks.value.push(pcmData)
      }

      source.connect(audioProcessor.value)
      audioProcessor.value.connect(audioContext.value.destination)
    } catch (err) {
      console.error('Error initializing audio processing:', err)
    }
  }
  else if (error.value) {
    message.value = error.value
  }
}

const stopVideoMessage = async () => {
  if (isSharing.value) {
    // Stop the camera
    stopSharing()

    // Stop the timer
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }

    // Get the last frame as thumbnail
    const thumbnail = captureFrame()

    // Clean up audio processing
    if (audioProcessor.value && audioContext.value) {
      audioProcessor.value.disconnect()
      audioContext.value.close()
      audioProcessor.value = null
      audioContext.value = null
    }

    // Combine audio chunks
    const totalLength = audioChunks.value.reduce((acc, chunk) => acc + chunk.length, 0)
    const combinedAudio = new Int16Array(totalLength)
    let offset = 0
    for (const chunk of audioChunks.value) {
      combinedAudio.set(chunk, offset)
      offset += chunk.length
    }

    // Create a Blob with video and audio data
    const videoBlob = new Blob([combinedAudio.buffer], { type: 'video/webm' })

    // Send the message
    await sendVideoMessage(videoBlob, thumbnail || undefined, duration.value)
    message.value = ''

    // Reset audio chunks
    audioChunks.value = []
    duration.value = 0
  }
}

const togglePause = () => {
  if (isSharing.value && stream.value) {
    const videoTrack = stream.value.getVideoTracks()[0]
    if (videoTrack.enabled) {
      videoTrack.enabled = false
      message.value = '⏸️ Video paused'
    } else {
      videoTrack.enabled = true
      message.value = '🔴 Recording video...'
    }
  }
}

const formattedDuration = computed(() => {
  const minutes = Math.floor(duration.value / 60)
  const seconds = duration.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
  cleanupCamera()
})
</script>

<template>
  <div class="flex items-center space-x-2">
    <button
      v-if="!isSharing"
      class="btn size-10 rounded-full p-0"
      :class="{'bg-slate-150 dark:bg-navy-500 dark:hover:bg-navy-450 hover:bg-slate-200': !isSharing}"
      @click="startVideoMessage"
    >
      <Icon
        name="heroicons:video-camera"
        class="size-5"
        :class="{
          'text-white': isSharing,
          'dark:text-navy-100 text-slate-500': !isSharing,
        }"
      />
    </button>
    <template v-else>
      <span class="dark:text-navy-100 text-sm text-slate-500">{{ formattedDuration }}</span>
      <button
        class="btn bg-primary hover:bg-primary-focus size-10 rounded-full p-0"
        @click="togglePause"
      >
        <Icon
          :name="stream?.getVideoTracks()[0]?.enabled ? 'heroicons:pause' : 'heroicons:play'"
          class="size-5 text-white"
        />
      </button>
      <button
        class="btn bg-error hover:bg-error-focus size-10 rounded-full p-0"
        @click="stopVideoMessage"
      >
        <Icon
          name="heroicons:stop"
          class="size-5 text-white"
        />
      </button>
    </template>
  </div>
</template>
