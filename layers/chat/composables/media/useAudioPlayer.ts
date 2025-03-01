import { ref } from 'vue'

class AudioStreamer {
  private context: AudioContext
  private workletNode?: AudioWorkletNode
  private gainNode: GainNode
  private queue: Float32Array[] = []
  private isPlaying = false
  private sampleRate = 24000 // Gemini uses 24kHz
  private channels = 1

  constructor(context: AudioContext) {
    this.context = context
    this.gainNode = this.context.createGain()
    this.gainNode.connect(this.context.destination)
  }

  addPCM16(data: Uint8Array) {
    // Convert PCM16 to Float32
    const pcm16 = new Int16Array(data.buffer)
    const float32 = new Float32Array(pcm16.length)
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768.0
    }

    this.queue.push(float32)
    this.play()
  }

  private async play() {
    if (this.isPlaying || this.queue.length === 0) return
    this.isPlaying = true

    while (this.queue.length > 0) {
      const audioData = this.queue.shift()
      if (!audioData) continue

      const buffer = this.context.createBuffer(
        this.channels,
        audioData.length,
        this.sampleRate
      )
      buffer.getChannelData(0).set(audioData)

      const source = this.context.createBufferSource()
      source.buffer = buffer

      if (this.workletNode) {
        source.connect(this.workletNode)
      } else {
        source.connect(this.gainNode)
      }

      source.start()
      await new Promise((resolve) => {
        source.onended = resolve
      })
    }

    this.isPlaying = false
  }
}

export const useAudioPlayer = () => {
  const audioContext = ref<AudioContext | null>(null)
  const audioStreamer = ref<AudioStreamer | null>(null)

  const ensureAudioContext = () => {
    if (!audioContext.value) {
      audioContext.value = new AudioContext({ sampleRate: 24000 })
    }
    if (!audioStreamer.value) {
      audioStreamer.value = new AudioStreamer(audioContext.value)
    }
    return audioStreamer.value
  }

  const playAudioResponse = (audioData: ArrayBuffer) => {
    try {
      const streamer = ensureAudioContext()
      streamer.addPCM16(new Uint8Array(audioData))
      console.log('✅ [7] Voice Sequence: Queued audio response for playback', { 
        size: audioData.byteLength 
      })
    } catch (error) {
      console.error('❌ [7a] Voice Sequence: Error playing audio response:', error)
    }
  }

  return {
    playAudioResponse
  }
}
