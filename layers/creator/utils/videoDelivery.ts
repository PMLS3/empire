/**
 * VideoDelivery class for handling video streaming and playback
 */
export class VideoDelivery {
  private video: HTMLVideoElement;
  private quality: 'auto' | 'low' | 'medium' | 'high' | 'ultra' = 'auto';
  private isPlaying = false;
  private isPaused = false;
  private isMuted = false;
  private currentTime = 0;
  private duration = 0;
  
  // Event callbacks
  private onProgressCallback: (progress: number) => void = () => {};
  private onBufferingCallback: (isBuffering: boolean) => void = () => {};
  private onErrorCallback: (error: string) => void = () => {};
  private onReadyCallback: () => void = () => {};
  private onEndedCallback: () => void = () => {};
  private onTimeUpdateCallback: (time: number) => void = () => {};
  
  constructor(videoElement: HTMLVideoElement) {
    this.video = videoElement;
    this.setupEventListeners();
  }
  
  /**
   * Load a video URL
   */
  public load(url: string, options?: {
    startTime?: number;
    autoplay?: boolean;
    preload?: 'auto' | 'metadata' | 'none';
  }): void {
    try {
      // Set preload attribute
      if (options?.preload) {
        this.video.preload = options.preload;
      } else {
        // Default to 'metadata' for faster initial loading
        this.video.preload = 'metadata';
      }
      
      // Set the source
      this.video.src = url;
      
      // Set start time if provided
      if (options?.startTime) {
        this.video.currentTime = options.startTime;
      }
      
      // Trigger load
      this.video.load();
      
      // Autoplay if requested
      if (options?.autoplay) {
        this.play().catch(error => {
          console.error('Autoplay failed:', error);
          // Many browsers block autoplay, so show a play button instead
          this.onErrorCallback('Autoplay not allowed. Please click play.');
        });
      }
    } catch (error) {
      console.error('Error loading video:', error);
      this.onErrorCallback(`Failed to load video: ${error.message}`);
    }
  }
  
  /**
   * Play the video
   */
  public async play(): Promise<void> {
    try {
      await this.video.play();
      this.isPlaying = true;
      this.isPaused = false;
    } catch (error) {
      console.error('Error playing video:', error);
      throw error;
    }
  }
  
  /**
   * Pause the video
   */
  public pause(): void {
    this.video.pause();
    this.isPlaying = false;
    this.isPaused = true;
  }
  
  /**
   * Toggle play/pause
   */
  public togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play().catch(error => {
        console.error('Play failed:', error);
        this.onErrorCallback(`Failed to play: ${error.message}`);
      });
    }
  }
  
  /**
   * Seek to a time position (in seconds)
   */
  public seek(time: number): void {
    if (isNaN(time) || time < 0 || time > this.duration) {
      console.error(`Invalid seek time: ${time}`);
      return;
    }
    
    try {
      this.video.currentTime = time;
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }
  
  /**
   * Set video quality
   */
  public setQuality(quality: 'auto' | 'low' | 'medium' | 'high' | 'ultra'): void {
    this.quality = quality;
    
    // In a real implementation, this would switch to different resolution sources
    // For now, this is just a placeholder
    console.log(`Setting quality to: ${quality}`);
  }
  
  /**
   * Toggle mute
   */
  public toggleMute(): void {
    this.video.muted = !this.video.muted;
    this.isMuted = this.video.muted;
  }
  
  /**
   * Set volume (0-1)
   */
  public setVolume(volume: number): void {
    if (isNaN(volume) || volume < 0 || volume > 1) {
      console.error(`Invalid volume: ${volume}`);
      return;
    }
    
    this.video.volume = volume;
    this.isMuted = volume === 0;
  }
  
  /**
   * Get current state
   */
  public getState(): {
    isPlaying: boolean;
    isPaused: boolean;
    isMuted: boolean;
    currentTime: number;
    duration: number;
    bufferedPercentage: number;
    volume: number;
  } {
    // Calculate buffered percentage
    let bufferedPercentage = 0;
    
    if (this.video.buffered.length > 0 && this.duration > 0) {
      const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
      bufferedPercentage = (bufferedEnd / this.duration) * 100;
    }
    
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isMuted: this.isMuted,
      currentTime: this.currentTime,
      duration: this.duration,
      bufferedPercentage,
      volume: this.video.volume,
    };
  }
  
  /**
   * Set up event listeners on the video element
   */
  private setupEventListeners(): void {
    // Loading events
    this.video.addEventListener('loadstart', () => {
      // Video has begun loading
    });
    
    this.video.addEventListener('loadedmetadata', () => {
      this.duration = this.video.duration;
    });
    
    this.video.addEventListener('canplay', () => {
      this.onReadyCallback();
    });
    
    // Progress events
    this.video.addEventListener('timeupdate', () => {
      this.currentTime = this.video.currentTime;
      this.onTimeUpdateCallback(this.currentTime);
      
      if (this.duration > 0) {
        const progress = (this.currentTime / this.duration) * 100;
        this.onProgressCallback(progress);
      }
    });
    
    this.video.addEventListener('progress', () => {
      // Update buffering indicator
      if (this.video.buffered.length > 0 && this.duration > 0) {
        const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
        const bufferedPercentage = (bufferedEnd / this.duration) * 100;
        // Could trigger a buffering progress event here
      }
    });
    
    // Playback events
    this.video.addEventListener('play', () => {
      this.isPlaying = true;
      this.isPaused = false;
    });
    
    this.video.addEventListener('pause', () => {
      this.isPlaying = false;
      this.isPaused = true;
    });
    
    this.video.addEventListener('ended', () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.onEndedCallback();
    });
    
    // Buffering events
    this.video.addEventListener('waiting', () => {
      this.onBufferingCallback(true);
    });
    
    this.video.addEventListener('playing', () => {
      this.onBufferingCallback(false);
    });
    
    // Error handling
    this.video.addEventListener('error', () => {
      const error = this.video.error;
      let errorMessage = 'Unknown error';
      
      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Playback aborted by user';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading video';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Video decoding error';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Video format not supported';
            break;
        }
      }
      
      this.onErrorCallback(errorMessage);
    });
  }
  
  /**
   * Set event callbacks
   */
  public onProgress(callback: (progress: number) => void): void {
    this.onProgressCallback = callback;
  }
  
  public onBuffering(callback: (isBuffering: boolean) => void): void {
    this.onBufferingCallback = callback;
  }
  
  public onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }
  
  public onReady(callback: () => void): void {
    this.onReadyCallback = callback;
  }
  
  public onEnded(callback: () => void): void {
    this.onEndedCallback = callback;
  }
  
  public onTimeUpdate(callback: (time: number) => void): void {
    this.onTimeUpdateCallback = callback;
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    // Remove event listeners
    this.video.removeEventListener('loadstart', () => {});
    this.video.removeEventListener('loadedmetadata', () => {});
    this.video.removeEventListener('canplay', () => {});
    this.video.removeEventListener('timeupdate', () => {});
    this.video.removeEventListener('progress', () => {});
    this.video.removeEventListener('play', () => {});
    this.video.removeEventListener('pause', () => {});
    this.video.removeEventListener('ended', () => {});
    this.video.removeEventListener('waiting', () => {});
    this.video.removeEventListener('playing', () => {});
    this.video.removeEventListener('error', () => {});
    
    // Clear source
    this.video.removeAttribute('src');
    this.video.load();
  }
}

/**
 * Create a VideoDelivery instance
 */
export function createVideoDelivery(videoElement: HTMLVideoElement): VideoDelivery {
  return new VideoDelivery(videoElement);
}
