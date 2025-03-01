<script setup lang='ts'>
import { ref } from 'vue'

const isSharing = ref(false)
const gemini = useChatGemini()
const { state: videoState, videoRef, canvasRef, startScreenShare, stopScreenShare } = useVideo(gemini.api)

const handleShare = async () => {
  if (!isSharing.value) {
    try {
      console.log('Starting screen share...')
      await startScreenShare()
      isSharing.value = true
    } catch (error) {
      console.error('Failed to start screen share:', error)
      isSharing.value = false
    }
  } else {
    stopScreenShare()
    isSharing.value = false
  }
}

onUnmounted(() => {
  if (isSharing.value) {
    stopScreenShare()
  }
})
</script>

<template>
  <div class="screen-share">
    <button
    class="btn size-10 rounded-full p-0"
      :class="{
        'bg-primary hover:bg-primary-focus': isSharing,
        'bg-slate-150 dark:bg-navy-500 dark:hover:bg-navy-450 hover:bg-slate-200': !isSharing,
      }"
      @click="handleShare"
    >
      <Icon
        name="heroicons:computer-desktop"
        class="size-5"
        :class="{
          'text-white': isSharing,
          'dark:text-navy-100 text-slate-500': !isSharing,
        }"
      />
    </button>

    <!-- Hidden video elements for processing -->
    <div style="position: absolute; left: -9999px;">
      <video
        ref="videoRef"
        :srcObject="videoState.activeStream"
        autoplay
        muted
        playsinline
      />
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>
