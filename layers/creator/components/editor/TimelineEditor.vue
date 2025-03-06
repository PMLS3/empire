<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useElementSize } from '@vueuse/core';
import { useCreatorData } from '../../composables/useCreatorData';
import type { VideoProject } from '../../types/project';

const props = defineProps<{
  projectId: string;
}>();

const emit = defineEmits(['timeUpdate', 'clipSelected', 'clipMoved', 'updated']);

// Project data and timeline state
const { getDataById, updateData } = useCreatorData();
const project = ref<VideoProject | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Timeline state
const timelineRef = ref<HTMLElement | null>(null);
const { width: timelineWidth } = useElementSize(timelineRef);
const timelineHeight = ref(150);
const pixelsPerSecond = ref(50);
const currentTime = ref(0);
const isPlaying = ref(false);
const isDragging = ref(false);
const selectedClipId = ref<string | null>(null);

// Project media and clips
const clips = ref<Array<{
  id: string;
  type: 'video' | 'audio' | 'image' | 'text';
  name: string;
  start: number; // Start time in the timeline
  duration: number;
  source_url?: string;
  thumbnail_url?: string;
  track: number; // Track index (0-based)
  color?: string;
  content?: string;
  settings?: Record<string, any>;
}>>([]);

const tracks = ref<Array<{ id: string; name: string; type: 'video' | 'audio' | 'text'; }>>([
  { id: 'video-main', name: 'Main Video', type: 'video' },
  { id: 'video-overlay', name: 'Overlay', type: 'video' },
  { id: 'text', name: 'Text', type: 'text' },
  { id: 'audio-main', name: 'Main Audio', type: 'audio' },
  { id: 'audio-music', name: 'Music', type: 'audio' },
]);

// Colors for different clip types
const clipColors = {
  video: 'bg-primary-500 dark:bg-primary-400',
  audio: 'bg-success-500 dark:bg-success-400',
  image: 'bg-info-500 dark:bg-info-400',
  text: 'bg-warning-500 dark:bg-warning-400',
};

// Helper to format time (seconds to MM:SS format)
const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Timeline total duration in seconds
const timelineDuration = computed(() => {
  if (clips.value.length === 0) return 60; // Default 1 minute

  const lastEndTime = clips.value.reduce((maxEnd, clip) => {
    const clipEnd = clip.start + clip.duration;
    return clipEnd > maxEnd ? clipEnd : maxEnd;
  }, 0);

  // Add 10 seconds padding at the end
  return lastEndTime + 10;
});

// Timeline width in pixels based on duration and zoom level
const totalTimelineWidth = computed(() => {
  return timelineDuration.value * pixelsPerSecond.value;
});

// Timeline time markers (for every second)
const timeMarkers = computed(() => {
  const markers = [];
  // Create a marker every 5 seconds
  for (let t = 0; t <= timelineDuration.value; t += 5) {
    markers.push({
      time: t,
      position: t * pixelsPerSecond.value,
      label: formatTime(t),
    });
  }
  return markers;
});

// Load project data
onMounted(async () => {
  loading.value = true;
  
  try {
    const projectData = await getDataById('projects', props.projectId);
    if (projectData) {
      project.value = projectData as VideoProject;
      
      // If the project has timeline data, load it
      if (project.value.timeline) {
        clips.value = project.value.timeline.clips || [];
        
        // If no clips, add some mock data for demonstration
        if (clips.value.length === 0) {
          createMockClips();
        }
      } else {
        // Create mock data for now
        createMockClips();
      }
    }
  } catch (err) {
    console.error('Error loading project:', err);
    error.value = 'Failed to load project data';
  } finally {
    loading.value = false;
  }
});

// Create some mock clips for testing
const createMockClips = () => {
  clips.value = [
    {
      id: 'clip1',
      type: 'video',
      name: 'Intro',
      start: 0,
      duration: 10,
      track: 0,
      thumbnail_url: 'https://placehold.co/100x60'
    },
    {
      id: 'clip2',
      type: 'video',
      name: 'Main Content',
      start: 10,
      duration: 20,
      track: 0,
      thumbnail_url: 'https://placehold.co/100x60'
    },
    {
      id: 'clip3',
      type: 'text',
      name: 'Title Text',
      start: 2,
      duration: 8,
      track: 2,
      content: 'Welcome to our video!'
    },
    {
      id: 'clip4',
      type: 'audio',
      name: 'Background Music',
      start: 0,
      duration: 30,
      track: 4,
      source_url: ''
    },
    {
      id: 'clip5',
      type: 'image',
      name: 'Overlay Image',
      start: 15,
      duration: 10,
      track: 1,
      thumbnail_url: 'https://placehold.co/100x60'
    },
  ];
};

// Select a clip
const selectClip = (clipId: string) => {
  selectedClipId.value = clipId;
  const clip = clips.value.find(c => c.id === clipId);
  if (clip) {
    emit('clipSelected', clip);
  }
};

// Start dragging a clip
const startDragClip = (event: MouseEvent, clipId: string) => {
  event.preventDefault();
  isDragging.value = true;
  selectClip(clipId);
  
  // Save the initial mouse position and clip position
  const clip = clips.value.find(c => c.id === clipId);
  if (!clip) return;
  
  const initialX = event.clientX;
  const initialStart = clip.start;

  // Mouse move handler
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return;
    
    // Calculate the time delta based on mouse movement and zoom level
    const deltaX = e.clientX - initialX;
    const deltaTime = deltaX / pixelsPerSecond.value;
    
    // Calculate the new start time, ensuring it doesn't go negative
    const newStart = Math.max(0, initialStart + deltaTime);
    
    // Update the clip
    const updatedClips = clips.value.map(c => {
      if (c.id === clipId) {
        return { ...c, start: newStart };
      }
      return c;
    });
    
    clips.value = updatedClips;
  };

  // Mouse up handler
  const handleMouseUp = () => {
    if (!isDragging.value) return;
    isDragging.value = false;
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Emit that a clip was moved
    const movedClip = clips.value.find(c => c.id === clipId);
    if (movedClip) {
      emit('clipMoved', movedClip);
      saveTimelineChanges();
    }
  };

  // Add event listeners
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

// Resize a clip (adjust duration)
const resizeClip = (event: MouseEvent, clipId: string, direction: 'left' | 'right') => {
  event.preventDefault();
  event.stopPropagation();
  isDragging.value = true;
  selectClip(clipId);
  
  const clip = clips.value.find(c => c.id === clipId);
  if (!clip) return;
  
  const initialX = event.clientX;
  const initialStart = clip.start;
  const initialDuration = clip.duration;

  // Mouse move handler
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return;
    
    const deltaX = e.clientX - initialX;
    const deltaTime = deltaX / pixelsPerSecond.value;
    
    // Update based on which handle was grabbed
    const updatedClips = clips.value.map(c => {
      if (c.id === clipId) {
        if (direction === 'left') {
          // Adjust start and duration (left edge drag)
          const newStart = Math.max(0, initialStart + deltaTime);
          const newDuration = Math.max(0.5, initialDuration - (newStart - initialStart));
          
          return {
            ...c,
            start: newStart,
            duration: newDuration
          };
        } else {
          // Adjust only duration (right edge drag)
          const newDuration = Math.max(0.5, initialDuration + deltaTime);
          return { ...c, duration: newDuration };
        }
      }
      return c;
    });
    
    clips.value = updatedClips;
  };

  // Mouse up handler
  const handleMouseUp = () => {
    if (!isDragging.value) return;
    isDragging.value = false;
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Emit update
    const updatedClip = clips.value.find(c => c.id === clipId);
    if (updatedClip) {
      emit('clipMoved', updatedClip);
      saveTimelineChanges();
    }
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

// Move the playhead (current time indicator)
const movePlayhead = (event: MouseEvent) => {
  if (!timelineRef.value) return;
  
  const rect = timelineRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  
  // Calculate time based on position
  let newTime = (x / pixelsPerSecond.value);
  
  // Clamp to timeline bounds
  newTime = Math.max(0, Math.min(timelineDuration.value, newTime));
  
  // Update current time
  currentTime.value = newTime;
  emit('timeUpdate', newTime);
};

// Zoom in/out the timeline
const zoomTimeline = (zoomIn: boolean) => {
  if (zoomIn) {
    pixelsPerSecond.value = Math.min(200, pixelsPerSecond.value * 1.25);
  } else {
    pixelsPerSecond.value = Math.max(20, pixelsPerSecond.value * 0.8);
  }
};

// Play/pause the timeline
const togglePlayback = () => {
  isPlaying.value = !isPlaying.value;
  
  if (isPlaying.value) {
    const startTime = currentTime.value;
    const startTimestamp = Date.now();
    
    // Playback animation loop
    const animate = () => {
      if (!isPlaying.value) return;
      
      // Calculate elapsed time since starting playback
      const elapsedSecs = (Date.now() - startTimestamp) / 1000;
      const newTime = startTime + elapsedSecs;
      
      // Stop at the end of the timeline
      if (newTime >= timelineDuration.value) {
        currentTime.value = timelineDuration.value;
        isPlaying.value = false;
        emit('timeUpdate', currentTime.value);
        return;
      }
      
      currentTime.value = newTime;
      emit('timeUpdate', newTime);
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }
};

// Save timeline changes back to the project
const saveTimelineChanges = async () => {
  if (!project.value) return;
  
  try {
    await updateData('projects', props.projectId, {
      timeline: {
        clips: clips.value,
        tracks: tracks.value,
        updated_at: new Date().toISOString(),
      }
    });
    
    emit('updated');
  } catch (err) {
    console.error('Error saving timeline:', err);
    error.value = 'Failed to save timeline changes';
  }
};

// Watch for changes to current time
watch(currentTime, () => {
  emit('timeUpdate', currentTime.value);
});
</script>

<template>
  <div class="bg-muted-50 dark:bg-muted-800 border-muted-200 dark:border-muted-700 border rounded-md">
    <div class="p-2 border-b border-muted-200 dark:border-muted-700 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <BaseButtonIcon
          color="default"
          size="sm"
          @click="togglePlayback"
        >
          <Icon
            :name="isPlaying ? 'ph:pause-fill' : 'ph:play-fill'"
            class="size-4"
          />
        </BaseButtonIcon>
        
        <span class="font-mono text-sm font-medium">{{ formatTime(currentTime) }}</span>
      </div>
      
      <div class="flex items-center gap-2">
        <BaseButtonIcon
          color="default"
          size="sm"
          @click="() => zoomTimeline(false)"
        >
          <Icon name="ph:minus" class="size-4" />
        </BaseButtonIcon>
        
        <BaseButtonIcon
          color="default"
          size="sm"
          @click="() => zoomTimeline(true)"
        >
          <Icon name="ph:plus" class="size-4" />
        </BaseButtonIcon>
      </div>
    </div>
    
    <div class="relative overflow-x-auto">
      <!-- Time markers -->
      <div class="flex h-6 border-b border-muted-200 dark:border-muted-700 sticky top-0 bg-muted-50 dark:bg-muted-800 z-10">
        <div class="w-32 flex-shrink-0 border-r border-muted-200 dark:border-muted-700">
          <!-- Track labels column -->
        </div>
        
        <div class="relative" :style="{ width: `${totalTimelineWidth}px` }">
          <div
            v-for="marker in timeMarkers"
            :key="`marker-${marker.time}`"
            class="absolute top-0 h-full border-l border-muted-200 dark:border-muted-700 flex flex-col items-center"
            :style="{ left: `${marker.position}px` }"
          >
            <span class="text-xs text-muted-400 px-1">{{ marker.label }}</span>
          </div>
        </div>
      </div>
      
      <!-- Timeline tracks -->
      <div class="flex" @mousedown="movePlayhead">
        <!-- Track labels column -->
        <div class="w-32 flex-shrink-0">
          <div
            v-for="(track, index) in tracks"
            :key="track.id"
            class="h-12 flex items-center px-2 border-r border-b border-muted-200 dark:border-muted-700"
          >
            <BaseText size="xs">{{ track.name }}</BaseText>
          </div>
        </div>
        
        <!-- Timeline content -->
        <div ref="timelineRef" class="relative" :style="{ width: `${totalTimelineWidth}px`, minHeight: `${tracks.length * 48}px` }">
          <!-- Clips -->
          <div 
            v-for="clip in clips" 
            :key="clip.id"
            class="absolute cursor-pointer border border-white dark:border-muted-900 rounded-md overflow-hidden select-none"
            :class="[
              clipColors[clip.type], 
              selectedClipId === clip.id ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''
            ]"
            :style="{
              left: `${clip.start * pixelsPerSecond}px`,
              top: `${clip.track * 48}px`,
              width: `${clip.duration * pixelsPerSecond}px`,
              height: '42px'
            }"
            @mousedown="(e) => startDragClip(e, clip.id)"
            @click.stop="selectClip(clip.id)"
          >
            <!-- Resize handles -->
            <div 
              class="absolute left-0 top-0 h-full w-2 cursor-w-resize opacity-50 hover:opacity-100 bg-white/20" 
              @mousedown.stop="(e) => resizeClip(e, clip.id, 'left')"
            ></div>
            
            <div 
              class="absolute right-0 top-0 h-full w-2 cursor-e-resize opacity-50 hover:opacity-100 bg-white/20" 
              @mousedown.stop="(e) => resizeClip(e, clip.id, 'right')"
            ></div>
            
            <!-- Clip content -->
            <div class="absolute inset-0 p-1 flex flex-col justify-between pointer-events-none">
              <div class="flex items-center gap-1">
                <span class="text-xs text-white truncate">{{ clip.name }}</span>
              </div>
              <div class="text-white/80 text-xs">{{ formatTime(clip.duration) }}</div>
            </div>
          </div>
          
          <!-- Playhead / Current time indicator -->
          <div 
            class="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
            :style="{ left: `${currentTime * pixelsPerSecond}px` }"
          >
            <div class="w-3 h-3 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 absolute top-0 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
