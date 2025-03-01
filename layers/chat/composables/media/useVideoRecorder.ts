import { ref, shallowRef } from 'vue'
import type { Ref } from 'vue'

interface VideoRecorderOptions {
  audio?: boolean
  maxDuration?: number // in seconds
  generateThumbnail?: boolean
}

export const useVideoRecorder = () => {
  const isRecording = ref(false)
  const isPaused = ref(false)
  const duration = ref(0)
  const error = ref<string | null>(null)
  const mediaRecorder = shallowRef<MediaRecorder | null>(null)
  const stream = shallowRef<MediaStream | null>(null)
  const thumbnail = ref<string | null>(null)
  let videoChunks: Blob[] = []
  let durationInterval: NodeJS.Timeout | null = null

  const startRecording = async (options: VideoRecorderOptions = {}) => {
    const { audio = true, maxDuration, generateThumbnail = false } = options

    try {
      stream.value = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio,
      })

      if (generateThumbnail) {
        const videoTrack = stream.value.getVideoTracks()[0]
        const imageCapture = new ImageCapture(videoTrack)
        const frame = await imageCapture.grabFrame()
        const canvas = document.createElement('canvas')
        canvas.width = frame.width
        canvas.height = frame.height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(frame, 0, 0)
        thumbnail.value = canvas.toDataURL('image/jpeg')
      }

      mediaRecorder.value = new MediaRecorder(stream.value)
      videoChunks = []
      duration.value = 0

      mediaRecorder.value.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunks.push(event.data)
        }
      }

      // Start duration tracking
      durationInterval = setInterval(() => {
        if (isRecording.value && !isPaused.value) {
          duration.value++
          if (maxDuration && duration.value >= maxDuration) {
            stopRecording()
          }
        }
      }, 1000)

      mediaRecorder.value.start()
      isRecording.value = true
      isPaused.value = false
      error.value = null
      return true
    }
    catch (err) {
      console.error('Error accessing camera:', err)
      error.value = 'Could not access camera. Please check permissions.'
      return false
    }
  }

  const pauseRecording = () => {
    if (!mediaRecorder.value || !isRecording.value) return
    mediaRecorder.value.pause()
    isPaused.value = true
  }

  const resumeRecording = () => {
    if (!mediaRecorder.value || !isRecording.value) return
    mediaRecorder.value.resume()
    isPaused.value = false
  }

  const stopRecording = async (): Promise<Blob | null> => {
    if (!mediaRecorder.value || !isRecording.value || !stream.value) return null

    return new Promise((resolve) => {
      mediaRecorder.value!.onstop = () => {
        const videoBlob = new Blob(videoChunks, { type: 'video/webm' })
        resolve(videoBlob)
      }

      mediaRecorder.value!.stop()
      stream.value!.getTracks().forEach(track => track.stop())
      isRecording.value = false
      isPaused.value = false

      if (durationInterval) {
        clearInterval(durationInterval)
        durationInterval = null
      }
    })
  }

  const cleanup = () => {
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop()
      stream.value?.getTracks().forEach(track => track.stop())
      isRecording.value = false
      isPaused.value = false
    }

    if (durationInterval) {
      clearInterval(durationInterval)
      durationInterval = null
    }
  }

  return {
    isRecording,
    isPaused,
    duration,
    error,
    thumbnail,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cleanup,
  }
}
