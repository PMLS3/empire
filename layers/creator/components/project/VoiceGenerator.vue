<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useToaster } from '../../../shared/composables/toaster';
import { useCreatorData } from '../../composables/useCreatorData';

const props = defineProps<{
  projectId: string;
}>();

// Emit events to notify parent components
const emit = defineEmits(['saved', 'canceled', 'updated']);

// Get project data
const { getDataById, updateData } = useCreatorData();
const toaster = useToaster();

// UI state variables
const loading = ref(false);
const generating = ref(false);
const saving = ref(false);
const projectData = ref(null);
const error = ref<string | null>(null);

// Voice generation data
const script = ref('');
const generatedAudio = ref('');
const audioDuration = ref(0);
const isPlaying = ref(false);
const audioElement = ref<HTMLAudioElement | null>(null);

// Voice settings
const selectedVoice = ref('en-US-Neural2-F');
const languageCode = ref('en-US');
const speakingRate = ref(1.0);
const pitch = ref(0);
const volume = ref(0);

// Voice options
const voiceOptions = ref([
  { value: 'en-US-Neural2-F', label: 'Emma (Female)', gender: 'Female', languageCode: 'en-US' },
  { value: 'en-US-Neural2-M', label: 'Dave (Male)', gender: 'Male', languageCode: 'en-US' },
  { value: 'en-US-Neural2-C', label: 'Alex (Neutral)', gender: 'Neutral', languageCode: 'en-US' },
  { value: 'en-GB-Neural2-B', label: 'James (British Male)', gender: 'Male', languageCode: 'en-GB' },
  { value: 'en-GB-Neural2-A', label: 'Olivia (British Female)', gender: 'Female', languageCode: 'en-GB' },
  { value: 'en-AU-Neural2-B', label: 'Charlie (Australian Male)', gender: 'Male', languageCode: 'en-AU' },
  { value: 'en-AU-Neural2-A', label: 'Sophia (Australian Female)', gender: 'Female', languageCode: 'en-AU' },
]);

// Fetch all available voices
const fetchVoices = async () => {
  try {
    const response = await $fetch('/api/voices', {
      method: 'GET'
    });
    
    if (response?.voices) {
      voiceOptions.value = response.voices.map(voice => ({
        value: voice.name,
        label: `${voice.name.split('-').pop()} (${voice.ssmlGender})`,
        gender: voice.ssmlGender,
        languageCode: voice.languageCodes[0]
      }));
    }
  } catch (err) {
    console.error('Error fetching voices:', err);
  }
};

// Fetch project data
onMounted(async () => {
  loading.value = true;
  
  try {
    projectData.value = await getDataById('projects', props.projectId);
    
    // Get script from project if available
    if (projectData.value?.script?.content) {
      script.value = projectData.value.script.content;
    }
    
    // Get voice settings if available
    if (projectData.value?.voice) {
      selectedVoice.value = projectData.value.voice.voiceName || selectedVoice.value;
      languageCode.value = projectData.value.voice.languageCode || languageCode.value;
      speakingRate.value = projectData.value.voice.speakingRate || speakingRate.value;
      pitch.value = projectData.value.voice.pitch || pitch.value;
      volume.value = projectData.value.voice.volumeGainDb || volume.value;
    }
    
    // Get audio if available
    if (projectData.value?.voice?.audioContent) {
      generatedAudio.value = projectData.value.voice.audioContent;
    }
    
    // Fetch available voices
    await fetchVoices();
  } catch (err) {
    console.error('Error fetching project:', err);
    error.value = 'Failed to load project data';
    toaster.show({
      title: 'Error',
      message: 'Failed to load project data',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    loading.value = false;
  }
});

// Create audio element when audio content changes
watch(generatedAudio, () => {
  if (generatedAudio.value) {
    // Create a new audio element with the base64 audio
    const audio = new Audio(`data:audio/mp3;base64,${generatedAudio.value}`);
    audioElement.value = audio;
    
    // Set up event listeners
    audio.addEventListener('play', () => {
      isPlaying.value = true;
    });
    
    audio.addEventListener('pause', () => {
      isPlaying.value = false;
    });
    
    audio.addEventListener('ended', () => {
      isPlaying.value = false;
    });
    
    // Get audio duration once metadata is loaded
    audio.addEventListener('loadedmetadata', () => {
      audioDuration.value = audio.duration;
    });
  }
});

// Generate speech
const generateSpeech = async () => {
  if (!script.value.trim()) {
    toaster.show({
      title: 'Error',
      message: 'Please enter some text to convert to speech',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  generating.value = true;
  error.value = null;
  
  try {
    // Call the speech generation endpoint
    const response = await $fetch('/api/speech/generate', {
      method: 'POST',
      body: {
        text: script.value,
        voiceName: selectedVoice.value,
        languageCode: languageCode.value,
        speakingRate: speakingRate.value,
        pitch: pitch.value,
        volumeGainDb: volume.value,
        outputFormat: 'MP3',
      }
    });
    
    // Update the generated audio
    if (response?.audioContent) {
      generatedAudio.value = response.audioContent;
      
      // Notify success
      toaster.show({
        title: 'Success',
        message: 'Speech generated successfully',
        color: 'success',
        icon: 'ph:check-circle-duotone',
      });
    } else {
      throw new Error('No audio content received');
    }
  } catch (err) {
    console.error('Error generating speech:', err);
    error.value = 'Failed to generate speech';
    toaster.show({
      title: 'Error',
      message: 'Failed to generate speech',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    generating.value = false;
  }
};

// Play/pause audio
const togglePlay = () => {
  if (!audioElement.value) return;
  
  if (isPlaying.value) {
    audioElement.value.pause();
  } else {
    audioElement.value.play();
  }
};

// Save voice to project
const saveVoice = async () => {
  if (!generatedAudio.value) {
    toaster.show({
      title: 'Error',
      message: 'No audio to save',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  saving.value = true;
  
  try {
    // Update the project with the generated voice
    const voiceData = {
      voice: {
        audioContent: generatedAudio.value,
        voiceName: selectedVoice.value,
        languageCode: languageCode.value,
        speakingRate: speakingRate.value,
        pitch: pitch.value,
        volumeGainDb: volume.value,
        created_at: new Date().toISOString(),
        duration: audioDuration.value,
      }
    };
    
    // Save to database
    await updateData('projects', props.projectId, voiceData);
    
    // Notify parent component
    emit('saved', voiceData.voice);
    
    toaster.show({
      title: 'Success',
      message: 'Voice saved successfully',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (err) {
    console.error('Error saving voice:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to save voice',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    saving.value = false;
  }
};

// Format duration (seconds to MM:SS)
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div>
    <BaseHeading as="h3" size="md" weight="medium" class="mb-4">
      Voice Generator
    </BaseHeading>
    
    <BasePlaceholderPage
      v-if="loading"
      title="Loading project"
      subtitle="Please wait while we load your project data"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <BaseMessage v-else-if="error" type="danger" class="mb-4">
      {{ error }}
    </BaseMessage>
    
    <div v-else class="grid grid-cols-12 gap-6">
      <!-- Configuration Column -->
      <div class="col-span-12 lg:col-span-5">
        <BaseCard class="p-4 md:p-6">
          <div class="space-y-5">
            <BaseHeading as="h4" size="sm" weight="medium" class="mb-4">
              Voice Settings
            </BaseHeading>
            
            <!-- Voice Selection -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Voice</label>
              <BaseSelect v-model="selectedVoice">
                <option v-for="voice in voiceOptions" :key="voice.value" :value="voice.value">
                  {{ voice.label }}
                </option>
              </BaseSelect>
              <div class="flex justify-between mt-1">
                <BaseText size="xs" class="text-muted-400">Language: {{ languageCode }}</BaseText>
                <BaseText size="xs" class="text-muted-400">
                  {{ voiceOptions.find(v => v.value === selectedVoice)?.gender || 'Unknown' }}
                </BaseText>
              </div>
            </div>
            
            <!-- Speaking Rate -->
            <div>
              <div class="flex justify-between">
                <label class="nui-label pb-2 text-[0.825rem]">Speaking Rate</label>
                <BaseText size="xs" class="text-muted-400">{{ speakingRate.toFixed(1) }}x</BaseText>
              </div>
              <BaseSlider v-model="speakingRate" :min="0.25" :max="4.0" :step="0.25" />
              <div class="flex justify-between">
                <BaseText size="xs" class="text-muted-400">Slower</BaseText>
                <BaseText size="xs" class="text-muted-400">Faster</BaseText>
              </div>
            </div>
            
            <!-- Pitch -->
            <div>
              <div class="flex justify-between">
                <label class="nui-label pb-2 text-[0.825rem]">Pitch</label>
                <BaseText size="xs" class="text-muted-400">{{ pitch.toFixed(1) }}</BaseText>
              </div>
              <BaseSlider v-model="pitch" :min="-20.0" :max="20.0" :step="0.5" />
              <div class="flex justify-between">
                <BaseText size="xs" class="text-muted-400">Lower</BaseText>
                <BaseText size="xs" class="text-muted-400">Higher</BaseText>
              </div>
            </div>
            
            <!-- Volume -->
            <div>
              <div class="flex justify-between">
                <label class="nui-label pb-2 text-[0.825rem]">Volume</label>
                <BaseText size="xs" class="text-muted-400">{{ volume.toFixed(1) }} dB</BaseText>
              </div>
              <BaseSlider v-model="volume" :min="-96.0" :max="16.0" :step="1.0" />
              <div class="flex justify-between">
                <BaseText size="xs" class="text-muted-400">Quieter</BaseText>
                <BaseText size="xs" class="text-muted-400">Louder</BaseText>
              </div>
            </div>
            
            <BaseButton
              color="primary"
              class="w-full"
              :loading="generating"
              :disabled="generating || !script.trim()"
              @click="generateSpeech"
            >
              <Icon name="ph:waveform-duotone" class="me-2 size-4" />
              Generate Voice
            </BaseButton>
          </div>
        </BaseCard>
      </div>
      
      <!-- Input/Output Column -->
      <div class="col-span-12 lg:col-span-7">
        <BaseCard class="p-4 md:p-6">
          <div class="space-y-4">
            <BaseHeading as="h4" size="sm" weight="medium" class="mb-4">
              Script Text
            </BaseHeading>
            
            <BaseTextarea
              v-model="script"
              rows="10"
              placeholder="Enter the text you want to convert to speech..."
              class="mb-4"
            />
            
            <BaseHeading as="h4" size="sm" weight="medium" class="mb-4 flex justify-between items-center">
              <span>Generated Audio</span>
              <BaseTag
                v-if="generatedAudio"
                color="success"
                rounded="sm"
              >
                <Icon name="ph:check-duotone" class="me-1 size-3" />
                Ready
              </BaseTag>
            </BaseHeading>
            
            <div v-if="!generatedAudio" class="py-10 text-center">
              <Icon name="ph:speaker-simple-x-duotone" class="size-16 text-muted-300 mx-auto mb-4" />
              <BaseHeading as="h5" size="sm" weight="medium" class="mb-2">
                No Audio Generated Yet
              </BaseHeading>
              <BaseText class="text-muted-400 max-w-md mx-auto">
                Configure your voice settings and click "Generate Voice" to create your audio.
              </BaseText>
            </div>
            
            <div v-else class="bg-muted-100 dark:bg-muted-800 rounded-lg p-4 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <BaseButtonIcon
                  color="primary"
                  rounded="full"
                  @click="togglePlay"
                >
                  <Icon v-if="isPlaying" name="ph:pause-fill" class="size-5" />
                  <Icon v-else name="ph:play-fill" class="size-5" />
                </BaseButtonIcon>
                
                <div class="flex flex-col">
                  <BaseText weight="medium">Generated Audio</BaseText>
                  <BaseText v-if="audioDuration" size="xs" class="text-muted-500">
                    {{ formatDuration(audioDuration) }}
                  </BaseText>
                </div>
              </div>
              
              <div>
                <BaseButtonIcon
                  v-if="generatedAudio"
                  color="default"
                  rounded="full"
                  @click="generatedAudio = ''"
                >
                  <Icon name="ph:trash-duotone" class="size-4" />
                </BaseButtonIcon>
              </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
              <BaseButton color="muted" @click="emit('canceled')">
                Cancel
              </BaseButton>
              <BaseButton
                color="primary"
                @click="saveVoice"
                :loading="saving"
                :disabled="saving || !generatedAudio"
              >
                <Icon name="ph:floppy-disk-duotone" class="me-1 size-4" />
                Save Audio
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
