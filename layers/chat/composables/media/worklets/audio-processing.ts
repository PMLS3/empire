export const AudioRecordingWorklet = `
class AudioProcessingWorklet extends AudioWorkletProcessor {
  private buffer: Float32Array;
  private bufferIndex: number;
  private readonly BUFFER_SIZE = 4096;

  constructor() {
    super();
    this.buffer = new Float32Array(this.BUFFER_SIZE);
    this.bufferIndex = 0;
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const samples = input[0];
    
    // Process incoming audio samples
    for (let i = 0; i < samples.length; i++) {
      this.buffer[this.bufferIndex++] = samples[i];
      
      // When buffer is full, send it
      if (this.bufferIndex >= this.BUFFER_SIZE) {
        this.port.postMessage({
          event: 'chunk',
          data: {
            float32arrayBuffer: this.buffer.buffer.slice(0)
          }
        });
        
        // Reset buffer
        this.buffer = new Float32Array(this.BUFFER_SIZE);
        this.bufferIndex = 0;
      }
    }

    return true;
  }
}

registerProcessor('audio-recorder-worklet', AudioProcessingWorklet);
`

export default AudioRecordingWorklet;
