import { ref, shallowRef } from 'vue'
import type { Ref } from 'vue'

interface ScreenShareOptions {
  withAudio?: boolean
  captureSystemAudio?: boolean
}

export const useScreenShare = () => {
  const isSharing = ref(false)
  const error = ref<string | null>(null)
  const stream = shallowRef<MediaStream | null>(null)

  const startSharing = async (options: ScreenShareOptions = {}) => {
    try {
      const { withAudio = true, captureSystemAudio = false } = options

      // Request screen sharing permissions
      stream.value = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
        },
        audio: withAudio ? {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          systemAudio: captureSystemAudio ? 'include' : 'exclude'
        } : false,
      })

      // Handle when user stops sharing via browser controls
      stream.value.getVideoTracks()[0].onended = () => {
        stopSharing()
      }

      isSharing.value = true
      error.value = null

      return {
        stream: stream.value,
        async getThumbnail(): Promise<string | null> {
          try {
            const videoTrack = stream.value.getVideoTracks()[0]
            const imageCapture = new ImageCapture(videoTrack)
            const frame = await imageCapture.grabFrame()
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (ctx) {
              canvas.width = frame.width
              canvas.height = frame.height
              ctx.drawImage(frame, 0, 0)
              return canvas.toDataURL('image/jpeg')
            }
          } catch (err) {
            console.error('Error generating thumbnail:', err)
          }
          return null
        }
      }
    }
    catch (err) {
      console.error('Error starting screen share:', err)
      error.value = 'Could not start screen sharing. Please check permissions.'
      return null
    }
  }

  const stopSharing = () => {
    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop())
      stream.value = null
    }
    isSharing.value = false
  }

  const cleanup = () => {
    stopSharing()
  }

  return {
    isSharing,
    error,
    startSharing,
    stopSharing,
    cleanup,
  }
}
