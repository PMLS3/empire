const processorCode = `
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.bufferSize = 2048
    this.buffer = new Float32Array(this.bufferSize)
    this.bufferIndex = 0
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]
    if (!input || !input[0]) return true

    const samples = input[0]
    
    // Fill buffer with incoming samples
    for (let i = 0; i < samples.length; i++) {
      this.buffer[this.bufferIndex++] = samples[i]
      
      // When buffer is full, convert and send
      if (this.bufferIndex >= this.bufferSize) {
        // Convert Float32 (-1 to 1) to Int16 (-32768 to 32767)
        const pcm16 = new Int16Array(this.bufferSize)
        for (let j = 0; j < this.bufferSize; j++) {
          const s = Math.max(-1, Math.min(1, this.buffer[j]))
          pcm16[j] = s < 0 ? s * 0x8000 : s * 0x7FFF
        }
        
        // Send buffer to main thread
        this.port.postMessage({
          eventType: 'audioData',
          audioData: pcm16.buffer
        })
        
        // Reset buffer
        this.bufferIndex = 0
      }
    }
    
    return true
  }
}

registerProcessor('audio-processor', AudioProcessor)
`

export const loadAudioProcessor = async (audioContext: AudioContext) => {
  const blob = new Blob([processorCode], { type: 'application/javascript' })
  const url = URL.createObjectURL(blob)
  
  try {
    await audioContext.audioWorklet.addModule(url)
    return true
  } catch (error) {
    console.error('Failed to load audio processor:', error)
    return false
  } finally {
    URL.revokeObjectURL(url)
  }
}
