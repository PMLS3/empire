import { useRuntimeConfig } from '#imports'
import { underStandingUpload } from '../data/upload'

const compressImage = (canvas: HTMLCanvasElement, quality = 0.8): string => {
  return canvas.toDataURL('image/jpeg', quality)
}

const calculateImageSize = (dataUrl: string): number => {
  const base64Length = dataUrl.split(',')[1].length
  return Math.ceil((base64Length * 3) / 4)
}

export const screenShot = async (question?: string) => {
  console.log('--------SCREENSHOT--------')
  try {
    // Request screen capture with options
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'monitor',
        cursor: 'always',
        logicalSurface: true
      }
    })

    // Get the video track
    const track = stream.getVideoTracks()[0]
    
    // Get the settings of the track
    const settings = track.getSettings()
    console.log('[screenShot] Track settings:', settings)

    // Create a video element to capture the stream
    const video = document.createElement('video')
    video.srcObject = stream
    
    // Wait for video to be loaded
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play()
        resolve(true)
      }
    })

    // Create canvas with the video dimensions
    const canvas = document.createElement('canvas')
    canvas.width = settings.width || video.videoWidth
    canvas.height = settings.height || video.videoHeight

    // Draw the video frame to canvas
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Failed to get canvas context')
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Stop all tracks
    stream.getTracks().forEach(track => track.stop())

    // Start with high quality
    let quality = 0.9
    let screenshotDataUrl = compressImage(canvas, quality)
    let size = calculateImageSize(screenshotDataUrl)
    console.log('[screenShot] Initial size:', Math.round(size / 1024), 'KB')

    // Compress if too large (max 5MB)
    while (size > 5 * 1024 * 1024 && quality > 0.1) {
      quality -= 0.1
      screenshotDataUrl = compressImage(canvas, quality)
      size = calculateImageSize(screenshotDataUrl)
      console.log('[screenShot] Compressed size:', Math.round(size / 1024), 'KB', 'quality:', quality.toFixed(1))
    }

    console.log('[screenShot] Screenshot taken successfully')

    // Send to understanding upload with question
    const result = await underStandingUpload(screenshotDataUrl, { 
      skipMessages: true,
      question: question || 'what is shown in this image?' 
    })
    console.log('[screenShot] Understanding upload result:', result)

    if (!result.success) {
      throw new Error(result.error || 'Failed to analyze screenshot')
    }

    return {
      dataUrl: screenshotDataUrl,
      metadata: result.metadata,
      understanding: result.understanding
    }
  } catch (error) {
    console.error('[screenShot] Error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      dataUrl: null,
      metadata: null,
      understanding: null
    }
  }
}
