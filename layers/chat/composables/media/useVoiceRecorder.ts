import { ref } from 'vue'
import { AudioRecordingWorklet } from './worklets/audio-processing'
import { VolMeterWorklet } from './worklets/vol-meter'

interface VoiceRecorderEvents {
  onData?: (data: string) => void
  onVolume?: (volume: number) => void
  onStop?: () => void
}

export const useVoiceRecorder = (events?: VoiceRecorderEvents) => {
  const isRecording = ref(false)
  const error = ref('')
  const volume = ref(0)
  
  let audioContext: AudioContext | undefined
  let stream: MediaStream | undefined
  let source: MediaStreamAudioSourceNode | undefined
  let recordingWorklet: AudioWorkletNode | undefined
  let vuWorklet: AudioWorkletNode | undefined

  const createWorketFromSrc = (workletName: string, workletSrc: string) => {
    const script = new Blob(
      [workletSrc],
      { type: "application/javascript" }
    )
    return URL.createObjectURL(script)
  }

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const binary = Array.from(new Uint8Array(buffer))
      .map(byte => String.fromCharCode(byte))
      .join('')
    return btoa(binary)
  }

  const calculateVolume = (chunk: Float32Array) => {
    let sum = 0
    for (let i = 0; i < chunk.length; i++) {
      sum += Math.abs(chunk[i])
    }
    return sum / chunk.length
  }

  const convertToPCM = (chunk: Float32Array) => {
    const pcmData = new Int16Array(chunk.length)
    for (let i = 0; i < chunk.length; i++) {
      pcmData[i] = chunk[i] * 32767
    }
    return new Uint8Array(pcmData.buffer)
  }

  const addWAVHeader = (pcmData: Uint8Array) => {
    const header = new Uint8Array(44)
    header[0] = 'R'.charCodeAt(0)
    header[1] = 'I'.charCodeAt(0)
    header[2] = 'F'.charCodeAt(0)
    header[3] = 'F'.charCodeAt(0)
    header[4] = (pcmData.length + 36) & 0xFF
    header[5] = ((pcmData.length + 36) >> 8) & 0xFF
    header[6] = ((pcmData.length + 36) >> 16) & 0xFF
    header[7] = ((pcmData.length + 36) >> 24) & 0xFF
    header[8] = 'W'.charCodeAt(0)
    header[9] = 'A'.charCodeAt(0)
    header[10] = 'V'.charCodeAt(0)
    header[11] = 'E'.charCodeAt(0)
    header[12] = 'f'.charCodeAt(0)
    header[13] = 'm'.charCodeAt(0)
    header[14] = 't'.charCodeAt(0)
    header[15] = ' '.charCodeAt(0)
    header[16] = 16 & 0xFF
    header[17] = (16 >> 8) & 0xFF
    header[18] = (16 >> 16) & 0xFF
    header[19] = (16 >> 24) & 0xFF
    header[20] = 1 & 0xFF
    header[21] = (1 >> 8) & 0xFF
    header[22] = (1 >> 16) & 0xFF
    header[23] = (1 >> 24) & 0xFF
    header[24] = 16000 & 0xFF
    header[25] = (16000 >> 8) & 0xFF
    header[26] = (16000 >> 16) & 0xFF
    header[27] = (16000 >> 24) & 0xFF
    header[28] = 32000 & 0xFF
    header[29] = (32000 >> 8) & 0xFF
    header[30] = (32000 >> 16) & 0xFF
    header[31] = (32000 >> 24) & 0xFF
    header[32] = 2 & 0xFF
    header[33] = (2 >> 8) & 0xFF
    header[34] = (2 >> 16) & 0xFF
    header[35] = (2 >> 24) & 0xFF
    header[36] = 16 & 0xFF
    header[37] = (16 >> 8) & 0xFF
    header[38] = (16 >> 16) & 0xFF
    header[39] = (16 >> 24) & 0xFF
    header[40] = 'd'.charCodeAt(0)
    header[41] = 'a'.charCodeAt(0)
    header[42] = 't'.charCodeAt(0)
    header[43] = 'a'.charCodeAt(0)
    header[44] = pcmData.length & 0xFF
    header[45] = (pcmData.length >> 8) & 0xFF
    header[46] = (pcmData.length >> 16) & 0xFF
    header[47] = (pcmData.length >> 24) & 0xFF
    const wavData = new Uint8Array(header.length + pcmData.length)
    wavData.set(header)
    wavData.set(pcmData, header.length)
    return wavData
  }

  const sendAudioChunk = async (audioData: Float32Array) => {
    try {
      const pcmData = convertToPCM(audioData)
      const wavData = addWAVHeader(pcmData)
      const base64Data = btoa(String.fromCharCode.apply(null, wavData))
      
      if (events?.onData) {
        await events.onData(base64Data)
      }
    } catch (error) {
      console.error('Error sending audio chunk:', error)
    }
  }

  const processAudioChunk = (chunk: Float32Array) => {
    if (!isRecording.value) return

    console.log(`Processing audio chunk: ${chunk.length} samples, volume: ${calculateVolume(chunk)}`)
    
    sendAudioChunk(chunk)
  }

  const startRecording = async () => {
    console.log('🎙️ [8] Voice Sequence: Initializing audio recording')
    try {
      if (!audioContext) {
        console.log('🎙️ [8a] Voice Sequence: Creating new audio context')
        audioContext = new AudioContext({ sampleRate: 16000 })
      }

      if (audioContext.state === 'suspended') {
        console.log('🎙️ [8b] Voice Sequence: Resuming audio context')
        await audioContext.resume()
      }

      console.log('🎙️ [8c] Voice Sequence: Requesting microphone access')
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('✅ [8d] Voice Sequence: Microphone access granted')

      // Create and connect nodes
      source = audioContext.createMediaStreamSource(stream)
      console.log('✅ [8e] Voice Sequence: Created media stream source')

      // Setup recording worklet
      if (!recordingWorklet) {
        console.log('🎙️ [9] Voice Sequence: Loading audio worklet')
        try {
          const workletUrl = new URL('/worklets/audio-processor.js', window.location.origin + '/chat')
          console.log('🎙️ [9a] Voice Sequence: Loading worklet from:', workletUrl.toString())
          await audioContext.audioWorklet.addModule(workletUrl)
          console.log('✅ [9b] Voice Sequence: Audio worklet module loaded')
        } catch (err) {
          console.error('❌ [9c] Voice Sequence: Failed to load audio worklet:', err)
          throw new Error('Failed to load audio processor. Please refresh the page and try again.')
        }

        recordingWorklet = new AudioWorkletNode(audioContext, 'audio-recorder-worklet', {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          processorOptions: {
            sampleRate: audioContext.sampleRate
          }
        })
        console.log('✅ [9d] Voice Sequence: Audio worklet node created')

        recordingWorklet.port.onmessage = (ev: MessageEvent) => {
          if (ev.data.event === 'chunk' && ev.data.data.float32arrayBuffer) {
            console.log('🎙️ [10] Voice Sequence: Processing audio chunk', {
              size: ev.data.data.float32arrayBuffer.byteLength,
              timestamp: new Date().toISOString()
            })
            const chunk = new Float32Array(ev.data.data.float32arrayBuffer)
            processAudioChunk(chunk)
          }
        }
      }

      source.connect(recordingWorklet)
      recordingWorklet.connect(audioContext.destination)
      console.log('✅ [11] Voice Sequence: Audio pipeline connected')

      isRecording.value = true
      console.log('✅ [12] Voice Sequence: Recording started successfully')
    } catch (err) {
      console.error('❌ [8x] Voice Sequence: Error starting recording:', err)
      error.value = err.message || 'Error accessing microphone'
      throw err
    }
  }

  const stopRecording = async () => {
    console.log('Stopping recording...')
    try {
      isRecording.value = false

      if (events?.onStop) {
        events.onStop()
      }

      if (recordingWorklet) {
        recordingWorklet.disconnect()
        recordingWorklet = null
      }
      
      if (vuWorklet) {
        vuWorklet.disconnect()
        vuWorklet = null
      }

      if (source) {
        source.disconnect()
        source = null
      }

      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop()
          console.log('Stopped audio track')
        })
        stream = null
      }

      if (audioContext) {
        await audioContext.close()
        audioContext = null
        console.log('Closed audio context')
      }

      volume.value = 0
      error.value = ''
      console.log('Recording stopped successfully')
    } catch (err) {
      console.error('Error stopping recording:', err)
      error.value = 'Error stopping recording'
    }
  }

  const cleanup = () => {
    console.log('Cleaning up voice recorder...')
    if (isRecording.value) {
      stopRecording()
    }
  }

  return {
    isRecording,
    error,
    volume,
    startRecording,
    stopRecording,
    cleanup,
  }
}
