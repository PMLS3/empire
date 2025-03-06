<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useCreatorData } from '../../composables/useCreatorData';
import { useToaster } from '../../../shared/composables/toaster';

const props = defineProps<{
  projectId: string;
  selectedClipId?: string;
}>();

const emit = defineEmits(['effectApplied', 'transitionApplied']);

const { getDataById, updateData } = useCreatorData();
const toaster = useToaster();

// UI state variables
const loading = ref(false);
const saving = ref(false);
const projectData = ref(null);
const error = ref<string | null>(null);

// Effects data
const selectedEffect = ref<string | null>(null);
const selectedTransition = ref<string | null>(null);
const effectSettings = ref<Record<string, any>>({});

// Clip data
const selectedClip = ref<any | null>(null);

// Effects categories
const effectCategories = [
  {
    id: 'filter',
    label: 'Filters',
    effects: [
      { id: 'grayscale', name: 'Grayscale', icon: 'ph:paint-brush-duotone' },
      { id: 'sepia', name: 'Sepia', icon: 'ph:paint-brush-duotone' },
      { id: 'blur', name: 'Blur', icon: 'ph:paint-brush-duotone' },
      { id: 'brightness', name: 'Brightness', icon: 'ph:sun-duotone' },
      { id: 'contrast', name: 'Contrast', icon: 'ph:sliders-duotone' },
      { id: 'saturation', name: 'Saturation', icon: 'ph:palette-duotone' },
    ]
  },
  {
    id: 'transform',
    label: 'Transform',
    effects: [
      { id: 'zoom', name: 'Zoom', icon: 'ph:magnifying-glass-plus-duotone' },
      { id: 'rotate', name: 'Rotate', icon: 'ph:arrows-clockwise-duotone' },
      { id: 'flip', name: 'Flip', icon: 'ph:arrows-horizontal-duotone' },
      { id: 'crop', name: 'Crop', icon: 'ph:crop-duotone' },
    ]
  },
  {
    id: 'overlay',
    label: 'Overlays',
    effects: [
      { id: 'vignette', name: 'Vignette', icon: 'ph:circle-half-duotone' },
      { id: 'grain', name: 'Film Grain', icon: 'ph:dots-nine-duotone' },
      { id: 'letterbox', name: 'Letterbox', icon: 'ph:layout-duotone' },
    ]
  }
];

// Transitions
const transitions = [
  { id: 'fade', name: 'Fade', icon: 'ph:fade-duotone' },
  { id: 'slide', name: 'Slide', icon: 'ph:caret-right-duotone' },
  { id: 'zoom', name: 'Zoom', icon: 'ph:magnifying-glass-plus-duotone' },
  { id: 'wipe', name: 'Wipe', icon: 'ph:arrows-left-right-duotone' },
  { id: 'dissolve', name: 'Dissolve', icon: 'ph:sparkle-duotone' },
];

// Load project and clip data
onMounted(async () => {
  await loadProjectData();
});

// Watch for selected clip changes
watch(() => props.selectedClipId, async (newClipId) => {
  if (newClipId) {
    await loadClipData(newClipId);
  } else {
    selectedClip.value = null;
  }
}, { immediate: true });

// Load project data
const loadProjectData = async () => {
  loading.value = true;
  
  try {
    projectData.value = await getDataById('projects', props.projectId);
    
    // If a clip is already selected, load its data
    if (props.selectedClipId) {
      await loadClipData(props.selectedClipId);
    }
  } catch (err) {
    console.error('Error loading project data:', err);
    error.value = 'Failed to load project data';
  } finally {
    loading.value = false;
  }
};

// Load clip data
const loadClipData = async (clipId: string) => {
  if (!projectData.value?.timeline?.clips) return;
  
  const clip = projectData.value.timeline.clips.find(c => c.id === clipId);
  if (clip) {
    selectedClip.value = clip;
    
    // Load effects and settings from clip if present
    if (clip.settings?.effects) {
      selectedEffect.value = clip.settings.effects[0]?.id || null;
      effectSettings.value = clip.settings.effects[0]?.settings || {};
    } else {
      selectedEffect.value = null;
      effectSettings.value = {};
    }
    
    // Load transition if present
    if (clip.settings?.transition) {
      selectedTransition.value = clip.settings.transition.id || null;
    } else {
      selectedTransition.value = null;
    }
  } else {
    selectedClip.value = null;
    selectedEffect.value = null;
    selectedTransition.value = null;
    effectSettings.value = {};
  }
};

// Get effect by ID
const getEffect = (effectId: string) => {
  for (const category of effectCategories) {
    const effect = category.effects.find(e => e.id === effectId);
    if (effect) return effect;
  }
  return null;
};

// Get default settings for an effect
const getDefaultSettings = (effectId: string) => {
  switch (effectId) {
    case 'grayscale':
      return { intensity: 100 };
    case 'sepia':
      return { intensity: 70 };
    case 'blur':
      return { radius: 5 };
    case 'brightness':
      return { value: 110 };
    case 'contrast':
      return { value: 120 };
    case 'saturation':
      return { value: 130 };
    case 'zoom':
      return { scale: 1.2 };
    case 'rotate':
      return { angle: 0 };
    case 'flip':
      return { horizontal: true, vertical: false };
    case 'vignette':
      return { intensity: 50 };
    case 'grain':
      return { intensity: 30 };
    case 'letterbox':
      return { ratio: '2.39' };
    default:
      return {};
  }
};

// Select an effect
const selectEffect = (effectId: string) => {
  if (selectedEffect.value === effectId) {
    selectedEffect.value = null;
    effectSettings.value = {};
  } else {
    selectedEffect.value = effectId;
    effectSettings.value = getDefaultSettings(effectId);
  }
};

// Update effect settings
const updateEffectSettings = (setting: string, value: any) => {
  effectSettings.value[setting] = value;
};

// Apply effect to clip
const applyEffect = async () => {
  if (!selectedClip.value || !selectedEffect.value) return;
  
  saving.value = true;
  
  try {
    // Create the effect object
    const effect = {
      id: selectedEffect.value,
      name: getEffect(selectedEffect.value)?.name || selectedEffect.value,
      settings: { ...effectSettings.value },
      applied_at: new Date().toISOString(),
    };
    
    // Update the clip with the effect
    const updatedClip = {
      ...selectedClip.value,
      settings: {
        ...(selectedClip.value.settings || {}),
        effects: [effect], // For simplicity, we're replacing any existing effect
      }
    };
    
    // Find and update the clip in the project timeline
    const updatedClips = projectData.value.timeline.clips.map(clip => {
      if (clip.id === selectedClip.value.id) {
        return updatedClip;
      }
      return clip;
    });
    
    // Save to project
    await updateData('projects', props.projectId, {
      timeline: {
        ...projectData.value.timeline,
        clips: updatedClips,
      }
    });
    
    // Update local data
    selectedClip.value = updatedClip;
    
    // Notify parent
    emit('effectApplied', { clipId: selectedClip.value.id, effect });
    
    toaster.show({
      title: 'Success',
      message: 'Effect applied successfully',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (err) {
    console.error('Error applying effect:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to apply effect',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    saving.value = false;
  }
};

// Remove an effect from clip
const removeEffect = async () => {
  if (!selectedClip.value) return;
  
  saving.value = true;
  
  try {
    // Remove effects from the clip
    const updatedClip = {
      ...selectedClip.value,
      settings: {
        ...(selectedClip.value.settings || {}),
        effects: [],
      }
    };
    
    // Find and update the clip in the project timeline
    const updatedClips = projectData.value.timeline.clips.map(clip => {
      if (clip.id === selectedClip.value.id) {
        return updatedClip;
      }
      return clip;
    });
    
    // Save to project
    await updateData('projects', props.projectId, {
      timeline: {
        ...projectData.value.timeline,
        clips: updatedClips,
      }
    });
    
    // Update local data
    selectedClip.value = updatedClip;
    selectedEffect.value = null;
    effectSettings.value = {};
    
    toaster.show({
      title: 'Success',
      message: 'Effect removed successfully',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (err) {
    console.error('Error removing effect:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to remove effect',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    saving.value = false;
  }
};

// Apply transition
const applyTransition = async () => {
  if (!selectedClip.value || !selectedTransition.value) return;
  
  saving.value = true;
  
  try {
    // Create the transition object
    const transition = {
      id: selectedTransition.value,
      name: transitions.find(t => t.id === selectedTransition.value)?.name || selectedTransition.value,
      duration: 1.0, // Default 1-second transition
      applied_at: new Date().toISOString(),
    };
    
    // Update the clip with the transition
    const updatedClip = {
      ...selectedClip.value,
      settings: {
        ...(selectedClip.value.settings || {}),
        transition,
      }
    };
    
    // Find and update the clip in the project timeline
    const updatedClips = projectData.value.timeline.clips.map(clip => {
      if (clip.id === selectedClip.value.id) {
        return updatedClip;
      }
      return clip;
    });
    
    // Save to project
    await updateData('projects', props.projectId, {
      timeline: {
        ...projectData.value.timeline,
        clips: updatedClips,
      }
    });
    
    // Update local data
    selectedClip.value = updatedClip;
    
    // Notify parent
    emit('transitionApplied', { clipId: selectedClip.value.id, transition });
    
    toaster.show({
      title: 'Success',
      message: 'Transition applied successfully',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (err) {
    console.error('Error applying transition:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to apply transition',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div>
    <BaseHeading as="h3" size="md" weight="medium" class="mb-4">
      Effects & Transitions
    </BaseHeading>
    
    <BasePlaceholderPage
      v-if="loading"
      title="Loading effects"
      subtitle="Please wait while we load the effects data"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <BaseMessage v-else-if="error" type="danger" class="mb-4">
      {{ error }}
    </BaseMessage>
    
    <div v-else-if="!selectedClip" class="text-center py-10">
      <Icon name="ph:selection-duotone" class="size-16 text-muted-400 mx-auto mb-3" />
      <BaseHeading as="h4" size="sm" weight="medium" class="mb-1">
        No Clip Selected
      </BaseHeading>
      <BaseText class="text-muted-500 max-w-md mx-auto">
        Select a clip from the timeline to view and apply effects and transitions.
      </BaseText>
    </div>
    
    <div v-else class="space-y-6">
      <!-- Selected clip info -->
      <BaseCard class="border-muted-200 dark:border-muted-700 border p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="size-10 flex items-center justify-center rounded-lg"
              :class="{
                'bg-primary-100 text-primary-500 dark:bg-primary-500/20': selectedClip.type === 'video',
                'bg-success-100 text-success-500 dark:bg-success-500/20': selectedClip.type === 'audio',
                'bg-info-100 text-info-500 dark:bg-info-500/20': selectedClip.type === 'image',
                'bg-warning-100 text-warning-500 dark:bg-warning-500/20': selectedClip.type === 'text',
              }"
            >
              <Icon
                :name="selectedClip.type === 'video' ? 'ph:video-duotone' : 
                      selectedClip.type === 'audio' ? 'ph:speaker-high-duotone' : 
                      selectedClip.type === 'image' ? 'ph:image-duotone' : 
                      'ph:text-t-duotone'"
                class="size-5"
              />
            </div>
            <div>
              <BaseHeading as="h4" size="sm" weight="medium">
                {{ selectedClip.name }}
              </BaseHeading>
              <BaseText size="xs" class="text-muted-500">
                {{ selectedClip.type.charAt(0).toUpperCase() + selectedClip.type.slice(1) }} Clip • 
                {{ Math.round(selectedClip.duration) }}s
              </BaseText>
            </div>
          </div>
        </div>
      </BaseCard>
      
      <!-- Effects section -->
      <div>
        <BaseHeading as="h4" size="sm" weight="medium" class="mb-3">
          Effects
        </BaseHeading>
        
        <!-- Effects list -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          <div
            v-for="category in effectCategories"
            :key="category.id"
          >
            <BaseHeading as="h5" size="xs" weight="medium" class="mb-2 ml-1">
              {{ category.label }}
            </BaseHeading>
            
            <div class="space-y-2">
              <BaseCard
                v-for="effect in category.effects"
                :key="`${category.id}-${effect.id}`"
                class="p-3 border-muted-200 dark:border-muted-700 border hover:border-primary-500 cursor-pointer transition-colors"
                :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-500/10': selectedEffect === effect.id }"
                @click="selectEffect(effect.id)"
              >
                <div class="flex items-center gap-2">
                  <div class="bg-muted-100 dark:bg-muted-800 size-8 rounded-lg flex items-center justify-center">
                    <Icon :name="effect.icon" class="size-4 text-primary-500" />
                  </div>
                  <BaseText size="sm">{{ effect.name }}</BaseText>
                </div>
              </BaseCard>
            </div>
          </div>
        </div>
        
        <!-- Effect settings -->
        <div v-if="selectedEffect" class="mb-4">
          <BaseCard class="border-muted-200 dark:border-muted-700 border p-4">
            <BaseHeading as="h5" size="xs" weight="medium" class="mb-2">
              {{ getEffect(selectedEffect)?.name || selectedEffect }} Settings
            </BaseHeading>
            
            <div class="space-y-4">
              <!-- Grayscale settings -->
              <div v-if="selectedEffect === 'grayscale'">
                <label class="nui-label text-xs pb-1">Intensity</label>
                <div class="flex items-center gap-3">
                  <BaseSlider
                    v-model="effectSettings.intensity"
                    :min="0"
                    :max="100"
                    :step="1"
                    class="flex-grow"
                  />
                  <BaseText size="xs" class="w-10 text-right">{{ effectSettings.intensity }}%</BaseText>
                </div>
              </div>
              
              <!-- Sepia settings -->
              <div v-else-if="selectedEffect === 'sepia'">
                <label class="nui-label text-xs pb-1">Intensity</label>
                <div class="flex items-center gap-3">
                  <BaseSlider
                    v-model="effectSettings.intensity"
                    :min="0"
                    :max="100"
                    :step="1"
                    class="flex-grow"
                  />
                  <BaseText size="xs" class="w-10 text-right">{{ effectSettings.intensity }}%</BaseText>
                </div>
              </div>
              
              <!-- Blur settings -->
              <div v-else-if="selectedEffect === 'blur'">
                <label class="nui-label text-xs pb-1">Radius</label>
                <div class="flex items-center gap-3">
                  <BaseSlider
                    v-model="effectSettings.radius"
                    :min="0"
                    :max="20"
                    :step="0.5"
                    class="flex-grow"
                  />
                  <BaseText size="xs" class="w-10 text-right">{{ effectSettings.radius }}px</BaseText>
                </div>
              </div>
              
              <!-- Brightness settings -->
              <div v-else-if="selectedEffect === 'brightness'">
                <label class="nui-label text-xs pb-1">Value</label>
                <div class="flex items-center gap-3">
                  <BaseSlider
                    v-model="effectSettings.value"
                    :min="50"
                    :max="150"
                    :step="1"
                    class="flex-grow"
                  />
                  <BaseText size="xs" class="w-10 text-right">{{ effectSettings.value }}%</BaseText>
                </div>
              </div>
              
              <!-- Default settings for other effects -->
              <div v-else>
                <BaseText size="xs" class="text-muted-500">
                  Configure the settings for this effect
                </BaseText>
                
                <div v-for="(value, key) in effectSettings" :key="key" class="mt-2">
                  <label class="nui-label text-xs pb-1 capitalize">{{ key }}</label>
                  <BaseInput v-model="effectSettings[key]" />
                </div>
              </div>
              
              <div class="flex justify-between">
                <BaseButton 
                  color="danger" 
                  size="sm" 
                  variant="outline"
                  @click="removeEffect"
                  :loading="saving"
                  :disabled="saving"
                >
                  <Icon name="ph:trash-duotone" class="me-1 size-4" />
                  Remove
                </BaseButton>
                
                <BaseButton
                  color="primary"
                  size="sm"
                  @click="applyEffect"
                  :loading="saving"
                  :disabled="saving"
                >
                  <Icon name="ph:check-duotone" class="me-1 size-4" />
                  Apply Effect
                </BaseButton>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
      
      <!-- Transitions section -->
      <div>
        <BaseHeading as="h4" size="sm" weight="medium" class="mb-3">
          Transitions
        </BaseHeading>
        
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <BaseCard
            v-for="transition in transitions"
            :key="transition.id"
            class="p-3 border-muted-200 dark:border-muted-700 border hover:border-primary-500 cursor-pointer transition-colors"
            :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-500/10': selectedTransition === transition.id }"
            @click="selectedTransition = transition.id"
          >
            <div class="flex flex-col items-center gap-1">
              <div class="bg-muted-100 dark:bg-muted-800 size-10 rounded-full flex items-center justify-center mb-1">
                <Icon :name="transition.icon" class="size-5 text-primary-500" />
              </div>
              <BaseText size="xs" class="text-center">{{ transition.name }}</BaseText>
            </div>
          </BaseCard>
        </div>
        
        <div class="flex justify-end">
          <BaseButton
            color="primary"
            size="sm"
            @click="applyTransition"
            :disabled="!selectedTransition || saving"
            :loading="saving"
          >
            <Icon name="ph:check-duotone" class="me-1 size-4" />
            Apply Transition
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
