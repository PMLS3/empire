import { ref, onUnmounted } from 'vue'
import type { GenerativeContentBlob } from '../../types/gemini'

interface VideoState {
  isStreaming: boolean
  activeStream: MediaStream | null
  audioStream: MediaStream | null
}

interface VideoFrame {
  mimeType: string
  data: string
}

export const useVideo = (api?: { sendRealtimeInput?: (frames: VideoFrame[]) => void }) => {
  const state = ref<VideoState>({
    isStreaming: false,
    activeStream: null,
    audioStream: null
  })

  const videoRef = ref<HTMLVideoElement | null>(null)
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  let animationFrame: number | null = null
  let lastFrameTime = 0
  const FRAME_INTERVAL = 500 // Send frame every 500ms

  const startScreenShare = async () => {
    try {
      console.log('✅ [1] Starting screen share...')
      // Get screen stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always"
        },
        audio: false
      })

      // Get audio stream
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      })

      state.value.activeStream = screenStream
      state.value.audioStream = audioStream
      state.value.isStreaming = true

      console.log('✅ [2] Got streams:', {
        screenTracks: screenStream.getTracks().length,
        audioTracks: audioStream.getTracks().length
      })

      // Handle stream ending
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('❌ Screen share stream ended')
        stopScreenShare()
      })

      // Wait for video element to be ready
      if (videoRef.value) {
        videoRef.value.srcObject = screenStream
        await new Promise<void>((resolve) => {
          if (!videoRef.value) return
          videoRef.value.onloadedmetadata = () => {
            console.log('✅ [3] Video element ready:', {
              width: videoRef.value?.videoWidth,
              height: videoRef.value?.videoHeight
            })
            resolve()
          }
        })

        if (api?.sendRealtimeInput) {
          console.log('✅ [4] Starting frame capture...')
          startFrameCapture()
          startAudioCapture()
        } else {
          console.warn('⚠️ No API available for sending frames')
        }
      }

      return screenStream
    } catch (error) {
      console.error('❌ Error starting screen share:', error)
      stopScreenShare()
      throw error
    }
  }

  const stopScreenShare = () => {
    console.log('Stopping screen share...')
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }

    if (state.value.activeStream) {
      state.value.activeStream.getTracks().forEach(track => track.stop())
      state.value.activeStream = null
    }

    if (state.value.audioStream) {
      state.value.audioStream.getTracks().forEach(track => track.stop())
      state.value.audioStream = null
    }

    state.value.isStreaming = false
  }

  const startFrameCapture = () => {
    if (!videoRef.value || !canvasRef.value || !state.value.activeStream) {
      console.error('❌ Missing required elements for frame capture:', {
        hasVideo: !!videoRef.value,
        hasCanvas: !!canvasRef.value,
        hasStream: !!state.value.activeStream
      })
      return
    }

    const canvas = canvasRef.value
    const video = videoRef.value
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('❌ Could not get canvas context')
      return
    }

    let frameCount = 0
    const captureFrame = (timestamp: number) => {
      if (!state.value.isStreaming) return

      // Throttle frame rate
      if (timestamp - lastFrameTime < FRAME_INTERVAL) {
        animationFrame = requestAnimationFrame(captureFrame)
        return
      }

      try {
        if (video.videoWidth && video.videoHeight) {
          // Debug video state
          console.log('📹 Video state:', {
            readyState: video.readyState,
            paused: video.paused,
            width: video.videoWidth,
            height: video.videoHeight
          })

          // Make sure video is playing
          if (video.paused) {
            console.log('▶️ Starting video playback...')
            video.play()
          }

          canvas.width = video.videoWidth * 0.25
          canvas.height = video.videoHeight * 0.25

          // Clear canvas before drawing
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          if (canvas.width + canvas.height > 0) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            // Debug: Check if frame is black
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const isBlack = imageData.data.every((value, index) => 
              index % 4 === 3 || value === 0
            )
            
            if (isBlack) {
              console.warn('⚠️ Frame appears to be black!')
            }

            const base64 = canvas.toDataURL('image/jpeg', 0.8)
            const data = base64.slice(base64.indexOf(',') + 1)
            
            api?.sendRealtimeInput?.([{ mimeType: 'image/jpeg', data }])
            
            frameCount++
            console.log('✅ Sent frame:', {
              count: frameCount,
              size: data.length,
              dimensions: `${canvas.width}x${canvas.height}`,
              isBlack
            })
            
            lastFrameTime = timestamp
          }
        } else {
          console.warn('⚠️ Video dimensions not ready:', {
            width: video.videoWidth,
            height: video.videoHeight
          })
        }

        animationFrame = requestAnimationFrame(captureFrame)
      } catch (error) {
        console.error('❌ Error capturing frame:', error)
      }
    }

    animationFrame = requestAnimationFrame(captureFrame)
  }

  const startAudioCapture = async () => {
    if (!state.value.audioStream) return

    try {
      const audioContext = new AudioContext({ sampleRate: 16000 })
      const source = audioContext.createMediaStreamSource(state.value.audioStream)
      const bufferSize = 2048
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1)
      
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0)
        const pcm16 = new Int16Array(bufferSize)
        for (let i = 0; i < bufferSize; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]))
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
        }
        
        api?.sendRealtimeInput?.([{
          mimeType: 'audio/pcm',
          data: btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)))
        }])
      }

      source.connect(processor)
      processor.connect(audioContext.destination)
      console.log('✅ Started audio capture')
    } catch (error) {
      console.error('❌ Error starting audio capture:', error)
    }
  }

  onUnmounted(() => {
    stopScreenShare()
  })

  return {
    state,
    videoRef,
    canvasRef,
    startScreenShare,
    stopScreenShare
  }
}
