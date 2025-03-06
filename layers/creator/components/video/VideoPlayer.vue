<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useVideoDelivery } from '../../composables/useVideoDelivery';

const props = defineProps<{
  src?: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  startTime?: number;
  height?: string;
}>();

const emit = defineEmits(['timeUpdate', 'play', 'pause', 'ended', 'ready', 'error']);

const videoRef = ref<HTMLVideoElement | null>(null);
const showControls = ref(props.controls !== false);
const controlsVisible = ref(true);
const controlsTimeout = ref<number | null>(null);

// Use our composable
const {
  initializePlayer,
  loadVideo,
  play,
  pause,
  togglePlay,
  seek,
  setVolume,
  toggleMute,
  formatTime,
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
  error
} = useVideoDelivery();

// Format duration for display
const formattedCurrentTime = computed(() => {
  return formatTime(currentTime.value);
});

const formattedDuration = computed(() => {
  return formatTime(duration.value);
});

// Initialize player when component mounts
onMounted(() => {
  if (videoRef.value) {
    initializePlayer(videoRef.value);
    
    if (props.src) {
      loadVideo(props.src, {
        autoplay: props.autoplay,
        startTime: props.startTime,
      });
    }
    
    // Set initial volume and mute state
    if (props.muted) {
      toggleMute();
    }
  }
});

// Watch for changes to src prop
watch(() => props.src, (newSrc) => {
  if (newSrc && videoRef.value) {
    loadVideo(newSrc, {
      autoplay: props.autoplay,
      startTime: props.startTime,
    });
  }
});

// Hide controls after inactivity
const resetControlsTimeout = () => {
  if (controlsTimeout.value) {
    clearTimeout(controlsTimeout.value);
  }
  
  controlsVisible.value = true;
  
  if (showControls.value) {
    controlsTimeout.value = window.setTimeout(() => {
      if (isPlaying.value) {
        controlsVisible.value = false;
      }
    }, 3000);
  }
};

// Handle seek from progress bar
const handleSeek = (event: MouseEvent) => {
  const progressBar = event.currentTarget as HTMLElement;
  const rect = progressBar.getBoundingClientRect();
  const position = (event.clientX - rect.left) / rect.width;
  const seekTime = position * duration.value;
  
  seek(seekTime);
};

// Handle volume change
const handleVolumeChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  setVolume(Number(input.value));
};

// Forward events to parent
watch(currentTime, (time) => {
  emit('timeUpdate', time);
});

watch(isPlaying, (playing) => {
  if (playing) {
    emit('play');
  }
});

watch(isPaused, (paused) => {
  if (paused) {
    emit('pause');
  }
});

watch(isReady, (ready) => {
  if (ready) {
    emit('ready');
  }
});

watch(error, (err) => {
  if (err) {
    emit('error', err);
  }
});
</script>

<template>
  <div 
    class="video-player relative overflow-hidden rounded-lg bg-black"
    :class="{ 'cursor-none': isPlaying && !controlsVisible }"
    :style="{ height: height || 'auto' }"
    @mousemove="resetControlsTimeout"
    @mouseenter="controlsVisible = true"
  >
    <!-- Video element -->
    <video
      ref="videoRef"
      class="w-full h-full"
      :poster="poster"
      :loop="loop"
      preload="metadata"
    ></video>
    
    <!-- Loading overlay -->
    <div 
      v-if="isBuffering" 
      class="absolute inset-0 flex items-center justify-center bg-black/30 z-10"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
    
    <!-- Error overlay -->
    <div 
      v-if="error" 
      class="absolute inset-0 flex items-center justify-center bg-black/70 z-10"
    >
      <div class="text-center text-white p-4">
        <div class="text-danger-500 text-xl mb-2">
          <Icon name="ph:warning-circle-duotone" class="size-10" />
        </div>
        <p class="text-lg font-bold mb-1">Error</p>
        <p>{{ error }}</p>
      </div>
    </div>
    
    <!-- Play button overlay -->
    <div 
      v-if="!isPlaying && !isBuffering && showControls" 
      class="absolute inset-0 flex items-center justify-center z-10"
      @click="togglePlay"
    >
      <button 
        class="size-16 rounded-full bg-primary-500/80 text-white flex items-center justify-center hover:bg-primary-600 transition-colors"
      >
        <Icon name="ph:play-fill" class="size-8 ms-1" />
      </button>
    </div>
    
    <!-- Video controls -->
    <div 
      v-if="showControls"
      class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 z-20"
      :class="{ 'opacity-0': !controlsVisible && isPlaying }"
    >
      <!-- Progress bar -->
      <div 
        class="w-full h-1.5 bg-white/30 rounded cursor-pointer mb-3 relative"
        @click="handleSeek"
      >
        <!-- Buffered part -->
        <div 
          class="absolute h-full bg-white/50 rounded-s"
          :style="{ width: `${bufferedPercentage}%` }"
        ></div>
        
        <!-- Progress part -->
        <div 
          class="absolute h-full bg-primary-500 rounded-s"
          :style="{ width: `${progress}%` }"
        >
          <!-- Seek handle -->
          <div class="absolute right-0 top-1/2 -translate-y-1/2 size-3 bg-white rounded-full transform translate-x-1/2"></div>
        </div>
      </div>
      
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Play/Pause button -->
          <button 
            class="text-white hover:text-primary-400 transition-colors"
            @click="togglePlay"
          >
            <Icon 
              :name="isPlaying ? 'ph:pause-fill' : 'ph:play-fill'" 
              class="size-5"
            />
          </button>
          
          <!-- Mute button -->
          <button 
            class="text-white hover:text-primary-400 transition-colors"
            @click="toggleMute"
          >
            <Icon 
              :name="isMuted ? 'ph:speaker-slash-fill' : 'ph:speaker-high-fill'" 
              class="size-5"
            />
          </button>
          
          <!-- Volume slider -->
          <div class="hidden md:flex items-center w-20">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="volume"
              @input="handleVolumeChange"
              class="w-full accent-primary-500"
            />
          </div>
          
          <!-- Time display -->
          <div class="text-white text-sm">
            {{ formattedCurrentTime }} / {{ formattedDuration }}
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Right side controls can go here (quality selector, etc) -->
          <button 
            v-if="isReady"
            class="text-white hover:text-primary-400 transition-colors"
            @click="isPlaying ? (controlsVisible = !controlsVisible) : null"
          >
            <Icon 
              :name="controlsVisible ? 'ph:monitor-duotone' : 'ph:monitor-play-duotone'" 
              class="size-5"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-player:hover .cursor-none {
  cursor: default;
}

/* Override default input range appearance */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none; /* Add standard property for compatibility */
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  background-image: linear-gradient(#6366f1, #6366f1);
  background-repeat: no-repeat;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
}
</style>
