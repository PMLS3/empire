import { ref, onUnmounted } from 'vue'

export interface CameraShareOptions {
  width?: number
  height?: number
  frameRate?: number
  facingMode?: 'user' | 'environment'
}

export function useCameraShare() {
  const stream = ref<MediaStream | null>(null)
  const videoElement = ref<HTMLVideoElement | null>(null)
  const canvas = ref<HTMLCanvasElement | null>(null)
  const isSharing = ref(false)
  const error = ref<string>('')
  
  // Create video and canvas elements
  const initializeElements = () => {
    if (!videoElement.value) {
      videoElement.value = document.createElement('video')
      videoElement.value.autoplay = true
      videoElement.value.playsInline = true
    }
    
    if (!canvas.value) {
      canvas.value = document.createElement('canvas')
    }
  }

  const startSharing = async (options: CameraShareOptions = {}) => {
    try {
      initializeElements()
      
      const constraints: MediaStreamConstraints = {
        video: {
          width: options.width || 1280,
          height: options.height || 720,
          frameRate: options.frameRate || 30,
          facingMode: options.facingMode || 'user'
        },
        audio: true
      }

      stream.value = await navigator.mediaDevices.getUserMedia(constraints)
      
      if (videoElement.value && stream.value) {
        videoElement.value.srcObject = stream.value
        await videoElement.value.play()
        
        // Set canvas dimensions
        if (canvas.value) {
          canvas.value.width = videoElement.value.videoWidth
          canvas.value.height = videoElement.value.videoHeight
        }
        
        isSharing.value = true
        error.value = ''
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to start camera sharing'
      console.error('Camera sharing error:', err)
      return false
    }
    
    return true
  }

  const stopSharing = () => {
    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop())
      stream.value = null
    }
    
    isSharing.value = false
    error.value = ''
  }

  const captureFrame = (): string | null => {
    if (!isSharing.value || !videoElement.value || !canvas.value) {
      return null
    }

    const context = canvas.value.getContext('2d')
    if (!context) {
      return null
    }

    // Draw the current video frame
    context.drawImage(videoElement.value, 0, 0, canvas.value.width, canvas.value.height)

    // Convert to JPEG and return as base64
    try {
      return canvas.value.toDataURL('image/jpeg', 0.8)
    } catch (err) {
      console.error('Error capturing frame:', err)
      return null
    }
  }

  const cleanup = () => {
    stopSharing()
    videoElement.value = null
    canvas.value = null
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    isSharing,
    error,
    startSharing,
    stopSharing,
    captureFrame,
    cleanup,
    stream
  }
}
