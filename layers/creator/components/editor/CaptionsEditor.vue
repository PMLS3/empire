<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useCreatorData } from '../../composables/useCreatorData';
import { useToaster } from '../../../shared/composables/toaster';

const props = defineProps<{
  projectId: string;
  currentTime?: number;
}>();

const emit = defineEmits(['saved', 'captionClick']);

const { getDataById, updateData } = useCreatorData();
const toaster = useToaster();

// UI state variables
const loading = ref(false);
const saving = ref(false);
const isEditing = ref(false);
const editingCaptionId = ref<string | null>(null);
const projectData = ref(null);
const error = ref<string | null>(null);

// Captions data
const captions = ref<Array<{
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style?: {
    fontFamily: string;
    fontSize: string;
    color: string;
    background: string;
    alignment: 'left' | 'center' | 'right';
  };
}>>([]);

const newCaption = ref({
  text: '',
  startTime: 0,
  endTime: 5,
  style: {
    fontFamily: 'Arial',
    fontSize: '16px',
    color: '#FFFFFF',
    background: 'rgba(0, 0, 0, 0.5)',
    alignment: 'center' as const,
  }
});

// Font options
const fontOptions = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
];

// Font size options
const fontSizeOptions = [
  { value: '14px', label: 'Small' },
  { value: '16px', label: 'Medium' },
  { value: '18px', label: 'Large' },
  { value: '24px', label: 'X-Large' },
];

// Alignment options
const alignmentOptions = [
  { value: 'left', label: 'Left', icon: 'ph:text-align-left-duotone' },
  { value: 'center', label: 'Center', icon: 'ph:text-align-center-duotone' },
  { value: 'right', label: 'Right', icon: 'ph:text-align-right-duotone' },
];

// Load captions data
onMounted(async () => {
  loading.value = true;
  
  try {
    projectData.value = await getDataById('projects', props.projectId);
    if (projectData.value?.captions) {
      captions.value = projectData.value.captions;
    } else {
      // If no captions yet, create some sample captions
      captions.value = [
        {
          id: 'caption-1',
          text: 'Welcome to our video!',
          startTime: 2,
          endTime: 5,
          style: {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#FFFFFF',
            background: 'rgba(0, 0, 0, 0.6)',
            alignment: 'center',
          }
        },
        {
          id: 'caption-2',
          text: 'Today we\'ll be discussing the key features of our product.',
          startTime: 6,
          endTime: 10,
          style: {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#FFFFFF',
            background: 'rgba(0, 0, 0, 0.5)',
            alignment: 'center',
          }
        },
        {
          id: 'caption-3',
          text: 'Let\'s get started!',
          startTime: 11,
          endTime: 14,
          style: {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#FFFFFF',
            background: 'rgba(0, 0, 0, 0.6)',
            alignment: 'center',
          }
        }
      ];
    }
    
    // Ensure captions are sorted by start time
    captions.value.sort((a, b) => a.startTime - b.startTime);
    
    // If a current time was provided, use it for the new caption
    if (props.currentTime !== undefined) {
      newCaption.value.startTime = props.currentTime;
      newCaption.value.endTime = props.currentTime + 3; // Default 3-second duration
    }
  } catch (err) {
    console.error('Error loading captions:', err);
    error.value = 'Failed to load captions data';
  } finally {
    loading.value = false;
  }
});

// Add a new caption
const addCaption = () => {
  if (!newCaption.value.text.trim()) return;
  
  const newId = `caption-${Date.now()}`;
  
  captions.value.push({
    id: newId,
    text: newCaption.value.text.trim(),
    startTime: newCaption.value.startTime,
    endTime: newCaption.value.endTime,
    style: { ...newCaption.value.style },
  });
  
  // Sort captions by start time
  captions.value.sort((a, b) => a.startTime - b.startTime);
  
  // Reset the new caption form
  newCaption.value.text = '';
  
  // Save changes
  saveCaptions();
};

// Edit existing caption
const editCaption = (captionId: string) => {
  isEditing.value = true;
  editingCaptionId.value = captionId;
  
  const caption = captions.value.find(c => c.id === captionId);
  if (caption) {
    newCaption.value = {
      text: caption.text,
      startTime: caption.startTime,
      endTime: caption.endTime,
      style: { ...caption.style },
    };
  }
};

// Update caption
const updateCaption = () => {
  if (!editingCaptionId.value || !newCaption.value.text.trim()) return;
  
  captions.value = captions.value.map(caption => {
    if (caption.id === editingCaptionId.value) {
      return {
        ...caption,
        text: newCaption.value.text.trim(),
        startTime: newCaption.value.startTime,
        endTime: newCaption.value.endTime,
        style: { ...newCaption.value.style },
      };
    }
    return caption;
  });
  
  // Sort captions by start time
  captions.value.sort((a, b) => a.startTime - b.startTime);
  
  // Reset the form
  newCaption.value = {
    text: '',
    startTime: props.currentTime || 0,
    endTime: (props.currentTime || 0) + 3,
    style: {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#FFFFFF',
      background: 'rgba(0, 0, 0, 0.5)',
      alignment: 'center',
    }
  };
  
  isEditing.value = false;
  editingCaptionId.value = null;
  
  // Save changes
  saveCaptions();
};

// Cancel editing
const cancelEdit = () => {
  isEditing.value = false;
  editingCaptionId.value = null;
  
  newCaption.value = {
    text: '',
    startTime: props.currentTime || 0,
    endTime: (props.currentTime || 0) + 3,
    style: {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#FFFFFF',
      background: 'rgba(0, 0, 0, 0.5)',
      alignment: 'center',
    }
  };
};

// Delete a caption
const deleteCaption = (captionId: string) => {
  captions.value = captions.value.filter(caption => caption.id !== captionId);
  
  // If we were editing this caption, cancel the edit
  if (editingCaptionId.value === captionId) {
    cancelEdit();
  }
  
  // Save changes
  saveCaptions();
};

// Save captions to project
const saveCaptions = async () => {
  saving.value = true;
  
  try {
    await updateData('projects', props.projectId, {
      captions: captions.value
    });
    
    emit('saved', captions.value);
    
    toaster.show({
      title: 'Success',
      message: 'Captions saved',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (err) {
    console.error('Error saving captions:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to save captions',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    saving.value = false;
  }
};

// Auto-generate captions from script
const generateCaptions = async () => {
  try {
    // First, check if there is a transcript or script
    if (!projectData.value?.script?.content) {
      toaster.show({
        title: 'No Script Available',
        message: 'Please create a script first to generate captions',
        color: 'warning',
        icon: 'ph:warning-circle-duotone',
      });
      return;
    }
    
    loading.value = true;
    
    // In a real implementation, we would call an API to analyze and time the script
    // For now, we'll do a simple split by sentences and assign timings
    const script = projectData.value.script.content;
    
    // Simple sentence splitting (very basic, would use NLP in real app)
    const sentences = script.match(/[^\.!\?]+[\.!\?]+/g) || [];
    
    // Generate captions based on the sentences
    let startTime = 0;
    const generatedCaptions = sentences.map((sentence, index) => {
      // Estimate time based on words (approximately 0.5s per word)
      const words = sentence.trim().split(' ').length;
      const duration = Math.max(1.5, words * 0.5);
      
      const caption = {
        id: `caption-auto-${index}`,
        text: sentence.trim(),
        startTime: startTime,
        endTime: startTime + duration,
        style: {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#FFFFFF',
          background: 'rgba(0, 0, 0, 0.5)',
          alignment: 'center',
        }
      };
      
      startTime += duration;
      
      return caption;
    });
    
    // Ask user if they want to replace existing captions
    if (captions.value.length > 0) {
      // For simplicity, we're just replacing them in this example
      // In a real app, you would have a modal confirmation
      captions.value = generatedCaptions;
    } else {
      captions.value = generatedCaptions;
    }
    
    // Save the generated captions
    await saveCaptions();
    
    toaster.show({
      title: 'Success',
      message: 'Captions generated from script',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (err) {
    console.error('Error generating captions:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to generate captions',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    loading.value = false;
  }
};

// Format time as MM:SS.ms
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

// Find active caption based on current time
const getActiveCaptions = computed(() => {
  if (props.currentTime === undefined) return [];
  
  return captions.value.filter(caption => 
    props.currentTime >= caption.startTime && props.currentTime <= caption.endTime
  );
});

// Watch for time updates to auto-select captions
watch(() => props.currentTime, (newTime) => {
  if (newTime !== undefined) {
    newCaption.value.startTime = newTime;
    newCaption.value.endTime = newTime + 3;
  }
}, { immediate: true });
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap gap-3 items-center justify-between">
      <BaseHeading as="h3" size="md" weight="medium">
        Captions & Text
      </BaseHeading>
      
      <div class="flex gap-2">
        <BaseButton 
          color="default" 
          size="sm"
          @click="generateCaptions"
          :disabled="loading"
        >
          <Icon name="ph:wand-duotone" class="me-1 size-4" />
          Generate from Script
        </BaseButton>
      </div>
    </div>
    
    <BasePlaceholderPage
      v-if="loading"
      title="Loading captions"
      subtitle="Please wait while we load your captions"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <BaseMessage v-else-if="error" type="danger" class="mb-4">
      {{ error }}
    </BaseMessage>
    
    <div v-else>
      <!-- Caption form -->
      <BaseCard class="mb-6 p-4">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
          <!-- Text input -->
          <div class="md:col-span-12">
            <label class="nui-label pb-2 text-[0.825rem]">
              {{ isEditing ? 'Edit Caption' : 'New Caption' }}
            </label>
            <BaseTextarea
              v-model="newCaption.text"
              :placeholder="isEditing ? 'Edit caption text...' : 'Enter caption text...'"
              rows="2"
              class="mb-3"
            />
          </div>
          
          <!-- Time controls -->
          <div class="md:col-span-3">
            <label class="nui-label pb-2 text-[0.825rem]">Start Time</label>
            <BaseInput
              v-model="newCaption.startTime"
              type="number"
              step="0.1"
              min="0"
            />
          </div>
          
          <div class="md:col-span-3">
            <label class="nui-label pb-2 text-[0.825rem]">End Time</label>
            <BaseInput
              v-model="newCaption.endTime"
              type="number"
              step="0.1"
              :min="newCaption.startTime + 0.1"
            />
          </div>
          
          <!-- Font family -->
          <div class="md:col-span-3">
            <label class="nui-label pb-2 text-[0.825rem]">Font</label>
            <BaseSelect v-model="newCaption.style.fontFamily">
              <option v-for="font in fontOptions" :key="font.value" :value="font.value">
                {{ font.label }}
              </option>
            </BaseSelect>
          </div>
          
          <!-- Font size -->
          <div class="md:col-span-3">
            <label class="nui-label pb-2 text-[0.825rem]">Size</label>
            <BaseSelect v-model="newCaption.style.fontSize">
              <option v-for="size in fontSizeOptions" :key="size.value" :value="size.value">
                {{ size.label }}
              </option>
            </BaseSelect>
          </div>
          
          <!-- Text color -->
          <div class="md:col-span-4">
            <label class="nui-label pb-2 text-[0.825rem]">Text Color</label>
            <div class="flex items-center gap-2">
              <input 
                type="color" 
                v-model="newCaption.style.color"
                class="w-10 h-10 rounded border-muted-300 dark:border-muted-700 border"
              />
              <BaseInput v-model="newCaption.style.color" class="flex-grow" />
            </div>
          </div>
          
          <!-- Background color -->
          <div class="md:col-span-4">
            <label class="nui-label pb-2 text-[0.825rem]">Background</label>
            <BaseInput v-model="newCaption.style.background" />
          </div>
          
          <!-- Text alignment -->
          <div class="md:col-span-4">
            <label class="nui-label pb-2 text-[0.825rem]">Alignment</label>
            <div class="flex border-muted-300 dark:border-muted-700 rounded-lg border overflow-hidden">
              <button
                v-for="option in alignmentOptions"
                :key="option.value"
                type="button"
                class="flex-1 py-2 px-3 flex justify-center items-center transition-colors border-r last:border-0 border-muted-300 dark:border-muted-700"
                :class="{
                  'bg-primary-500 text-white': newCaption.style.alignment === option.value,
                  'hover:bg-muted-100 dark:hover:bg-muted-700': newCaption.style.alignment !== option.value
                }"
                @click="newCaption.style.alignment = option.value"
              >
                <Icon :name="option.icon" class="size-5" />
              </button>
            </div>
          </div>
          
          <!-- Action buttons -->
          <div class="md:col-span-12 flex justify-end gap-2">
            <BaseButton
              v-if="isEditing"
              color="danger"
              variant="outline"
              @click="cancelEdit"
            >
              Cancel
            </BaseButton>
            
            <BaseButton
              color="primary"
              @click="isEditing ? updateCaption() : addCaption()"
              :disabled="!newCaption.text.trim()"
            >
              <Icon :name="isEditing ? 'ph:check-duotone' : 'ph:plus-duotone'" class="me-1 size-4" />
              {{ isEditing ? 'Update Caption' : 'Add Caption' }}
            </BaseButton>
          </div>
        </div>
      </BaseCard>
      
      <!-- Preview -->
      <BaseCard class="mb-6 p-4">
        <label class="nui-label pb-2 text-[0.825rem]">Preview</label>
        <div class="bg-black aspect-video relative rounded-lg overflow-hidden flex items-center justify-center">
          <div 
            v-if="getActiveCaptions.length > 0" 
            v-for="caption in getActiveCaptions" 
            :key="caption.id"
            class="absolute bottom-8 left-0 right-0 mx-auto px-4 text-center"
            :class="{
              'text-left': caption.style?.alignment === 'left',
              'text-center': caption.style?.alignment === 'center',
              'text-right': caption.style?.alignment === 'right',
            }"
            :style="{
              fontFamily: caption.style?.fontFamily || 'Arial',
              fontSize: caption.style?.fontSize || '16px',
              color: caption.style?.color || '#FFFFFF',
              background: caption.style?.background || 'rgba(0, 0, 0, 0.5)',
              padding: '0.5rem 1rem',
              display: 'inline-block',
              maxWidth: '90%',
              margin: '0 auto',
              borderRadius: '4px',
            }"
          >
            {{ caption.text }}
          </div>
          
          <div v-else class="text-muted-400">
            No active captions at current time
          </div>
        </div>
      </BaseCard>
      
      <!-- Captions list -->
      <div class="space-y-3">
        <BaseHeading as="h4" size="sm" weight="medium" class="mb-2">
          Captions List
          <BaseTag color="default" rounded="lg" class="ms-2">{{ captions.length }}</BaseTag>
        </BaseHeading>
        
        <BaseCard v-if="captions.length === 0" class="p-4 text-center">
          <Icon name="ph:subtitles-duotone" class="size-12 text-muted-400 mx-auto mb-2" />
          <BaseHeading as="h5" size="sm" class="mb-1">No Captions Added</BaseHeading>
          <BaseText class="text-muted-500">
            Add captions to your video using the form above
          </BaseText>
        </BaseCard>
        
        <BaseCard
          v-for="caption in captions"
          :key="caption.id"
          class="p-3 border-muted-200 dark:border-muted-700 border hover:border-primary-500 transition-colors"
          @click="emit('captionClick', caption.startTime)"
        >
          <div class="flex items-start justify-between">
            <div class="flex flex-col">
              <BaseHeading as="h5" size="xs" weight="medium" class="mb-1">
                {{ formatTime(caption.startTime) }} - {{ formatTime(caption.endTime) }}
              </BaseHeading>
              <BaseText>{{ caption.text }}</BaseText>
              <div class="mt-1 flex gap-2">
                <BaseTag size="xs" color="default" rounded="lg">
                  {{ caption.style?.fontFamily || 'Arial' }}
                </BaseTag>
                <BaseTag size="xs" color="default" rounded="lg">
                  {{ caption.style?.fontSize || '16px' }}
                </BaseTag>
              </div>
            </div>
            
            <div class="flex gap-1">
              <BaseButtonIcon
                size="xs"
                color="default"
                @click.stop="editCaption(caption.id)"
              >
                <Icon name="ph:pencil-simple-duotone" class="size-3" />
              </BaseButtonIcon>
              
              <BaseButtonIcon
                size="xs"
                color="danger"
                variant="ghost"
                @click.stop="deleteCaption(caption.id)"
              >
                <Icon name="ph:trash-duotone" class="size-3" />
              </BaseButtonIcon>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
