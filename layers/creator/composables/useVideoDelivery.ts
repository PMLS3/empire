import { ref, onUnmounted } from 'vue';
import { createVideoDelivery, VideoDelivery } from '../utils/videoDelivery';

export function useVideoDelivery() {
  // Video delivery instance
  let videoDelivery: VideoDelivery | null = null;
  
  // Player state
  const isPlaying = ref(false);
  const isPaused = ref(false);
  const isMuted = ref(false);
  const isBuffering = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const progress = ref(0);
  const bufferedPercentage = ref(0);
  const volume = ref(1);
  const error = ref<string | null>(null);
  const isReady = ref(false);
  
  /**
   * Initialize the video player with an HTML video element
   */
  const initializePlayer = (videoElement: HTMLVideoElement) => {
    if (!videoElement) return;
    
    // Clean up previous instance if exists
    if (videoDelivery) {
      videoDelivery.destroy();
    }
    
    // Create new instance
    videoDelivery = createVideoDelivery(videoElement);
    
    // Set up event handlers
    videoDelivery.onProgress((value) => {
      progress.value = value;
    });
    
    videoDelivery.onBuffering((value) => {
      isBuffering.value = value;
    });
    
    videoDelivery.onError((message) => {
      error.value = message;
    });
    
    videoDelivery.onReady(() => {
      isReady.value = true;
      
      // Update state
      const state = videoDelivery!.getState();
      duration.value = state.duration;
      volume.value = state.volume;
    });
    
    videoDelivery.onEnded(() => {
      isPlaying.value = false;
      isPaused.value = false;
    });
    
    videoDelivery.onTimeUpdate((time) => {
      currentTime.value = time;
      
      // Update state periodically
      const state = videoDelivery!.getState();
      isPlaying.value = state.isPlaying;
      isPaused.value = state.isPaused;
      isMuted.value = state.isMuted;
      bufferedPercentage.value = state.bufferedPercentage;
    });
  };
  
  /**
   * Load a video by URL
   */
  const loadVideo = (url: string, options?: {
    startTime?: number;
    autoplay?: boolean;
    preload?: 'auto' | 'metadata' | 'none';
  }) => {
    if (!videoDelivery) {
      error.value = 'Video player not initialized';
      return;
    }
    
    error.value = null;
    isReady.value = false;
    
    videoDelivery.load(url, options);
  };
  
  /**
   * Play video
   */
  const play = async () => {
    if (!videoDelivery) return;
    
    try {
      await videoDelivery.play();
      isPlaying.value = true;
      isPaused.value = false;
    } catch (err) {
      error.value = err.message || 'Error playing video';
    }
  };
  
  /**
   * Pause video
   */
  const pause = () => {
    if (!videoDelivery) return;
    
    videoDelivery.pause();
    isPlaying.value = false;
    isPaused.value = true;
  };
  
  /**
   * Toggle play/pause
   */
  const togglePlay = () => {
    if (!videoDelivery) return;
    videoDelivery.togglePlay();
  };
  
  /**
   * Seek to time position
   */
  const seek = (time: number) => {
    if (!videoDelivery) return;
    videoDelivery.seek(time);
  };
  
  /**
   * Set playback quality
   */
  const setQuality = (quality: 'auto' | 'low' | 'medium' | 'high' | 'ultra') => {
    if (!videoDelivery) return;
    videoDelivery.setQuality(quality);
  };
  
  /**
   * Toggle mute
   */
  const toggleMute = () => {
    if (!videoDelivery) return;
    videoDelivery.toggleMute();
    isMuted.value = !isMuted.value;
  };
  
  /**
   * Set volume
   */
  const setVolume = (value: number) => {
    if (!videoDelivery) return;
    videoDelivery.setVolume(value);
    volume.value = value;
  };
  
  /**
   * Format time in seconds to MM:SS format
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Clean up resources when component unmounts
  onUnmounted(() => {
    if (videoDelivery) {
      videoDelivery.destroy();
      videoDelivery = null;
    }
  });
  
  return {
    // State
    isPlaying,
    isPaused,
    isMuted,
    isBuffering,
    isReady,
    currentTime,
    duration,
    progress,
    bufferedPercentage,
    volume,
    error,
    
    // Methods
    initializePlayer,
    loadVideo,
    play,
    pause,
    togglePlay,
    seek,
    setQuality,
    toggleMute,
    setVolume,
    formatTime,
  };
}
