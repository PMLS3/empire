<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useVideoDelivery } from '../../composables/useVideoDelivery';
import { useToaster } from '../../../shared/composables/toaster';

const loading = ref(false);
const voiceLoading = ref(true);
const generating = ref(false);
const scriptText = ref('');
const voices = ref([]);
const error = ref<string | null>(null);
const generatedAudioUrl = ref<string | null>(null);

// Selected voice settings
const selectedVoice = ref<string | null>(null);
const voiceSettings = ref({
  speakingRate: 1.0, // 0.25 to 4.0
  pitch: 0, // -20.0 to 20.0
  volumeGainDb: 0, // -96.0 to 16.0
  languageCode: 'en-US',
});

const { initializePlayer, loadVideo } = useVideoDelivery();
const toaster = useToaster();

// Video player reference
const playerRef = ref<HTMLVideoElement | null>(null);

// Load available voices
onMounted(async () => {
  try {
    const response = await fetch('/api/ai/voices');
    const data = await response.json();
    voices.value = data.voices || [];
    
    if (voices.value.length > 0) {
      selectedVoice.value = voices.value[0].name;
    }
  } catch (err) {
    console.error('Error loading voices:', err);
    error.value = 'Failed to load available voices';
  } finally {
    voiceLoading.value = false;
  }

  // Initialize player if reference exists
  if (playerRef.value) {
    initializePlayer(playerRef.value);
  }
});

// Generate speech from text
const generateSpeech = async () => {
  if (!scriptText.value.trim()) {
    error.value = 'Please enter text to convert to speech';
    return;
  }
  
  if (!selectedVoice.value) {
    error.value = 'Please select a voice';
    return;
  }
  
  generating.value = true;
  error.value = null;
  
  try {
    // Call the AI API to generate speech
    const response = await $fetch('/api/ai/speech/generate', {
      method: 'POST',
      body: {
        text: scriptText.value,
        voiceName: selectedVoice.value,
        languageCode: voiceSettings.value.languageCode,
        speakingRate: voiceSettings.value.speakingRate,
        pitch: voiceSettings.value.pitch,
        volumeGainDb: voiceSettings.value.volumeGainDb,
      }
    });
    
    if (response.audioUrl) {
      generatedAudioUrl.value = response.audioUrl;
      
      // Load the audio into the player
      if (playerRef.value) {
        loadVideo(generatedAudioUrl.value);
      }
      
      toaster.show({
        title: 'Success',
        message: 'Audio generated successfully',
        color: 'success',
        icon: 'ph:check-circle-duotone',
      });
    } else {
      error.value = 'Failed to generate speech. Please try again.';
    }
  } catch (err) {
    console.error('Error generating speech:', err);
    error.value = err.message || 'Failed to generate speech. Please try again.';
  } finally {
    generating.value = false;
  }
};

// Get a voice sample by name
const getVoiceSample = (voiceName: string) => {
  const voice = voices.value.find(v => v.name === voiceName);
  return voice?.sampleUrl || null;
};

// Play a voice sample
const playVoiceSample = (voiceName: string) => {
  const sampleUrl = getVoiceSample(voiceName);
  
  if (sampleUrl && playerRef.value) {
    loadVideo(sampleUrl);
  }
};

// Save the generated audio to a project
const saveToProject = async () => {
  // Logic to save the audio to a project
  // This would typically open a modal or redirect to project creation page
};
</script>

<template>
  <div>
    <BasePageTitle title="Voice Generator" subtitle="Convert your text to natural-sounding speech" />
    
    <div class="grid grid-cols-12 gap-6">
      <!-- Text Input and Voice Settings -->
      <div class="col-span-12 lg:col-span-7 space-y-4">
        <!-- Text Input -->
        <BaseCard class="p-6">
          <BaseHeading size="sm" weight="medium" class="mb-4">Script Text</BaseHeading>
          
          <div class="space-y-4">
            <BaseTextarea
              v-model="scriptText"
              :rows="10"
              placeholder="Enter the text you want to convert to speech..."
            />
            
            <div class="flex justify-end">
              <BaseButton 
                color="primary" 
                :loading="generating"
                :disabled="generating || !scriptText.trim() || !selectedVoice"
                @click="generateSpeech"
              >
                <Icon name="ph:waveform-duotone" class="me-2" />
                Generate Speech
              </BaseButton>
            </div>
          </div>
        </BaseCard>
        
        <!-- Voice Settings -->
        <BaseCard class="p-6">
          <BaseHeading size="sm" weight="medium" class="mb-4">Voice Settings</BaseHeading>
          
          <div class="space-y-4" :class="{ 'opacity-50 pointer-events-none': generating }">
            <!-- Voice Selection -->
            <div>
              <BaseSelect
                v-model="selectedVoice"
                label="Select Voice"
                :disabled="voiceLoading"
              >
                <option v-if="voiceLoading" value="">Loading voices...</option>
                <option 
                  v-for="voice in voices" 
                  :key="voice.name" 
                  :value="voice.name"
                >
                  {{ voice.displayName }} ({{ voice.gender }} - {{ voice.languageCode }})
                </option>
              </BaseSelect>
              
              <!-- Voice sample player -->
              <div v-if="selectedVoice && !voiceLoading" class="mt-2">
                <BaseButton 
                  size="xs" 
                  color="default" 
                  @click="playVoiceSample(selectedVoice)"
                >
                  <Icon name="ph:play-duotone" class="me-1" />
                  Play Sample
                </BaseButton>
              </div>
            </div>
            
            <!-- Speaking Rate -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="nui-label pb-0 text-[0.825rem]">Speaking Rate</label>
                <span class="text-xs text-muted-500">{{ voiceSettings.speakingRate.toFixed(2) }}</span>
              </div>
              <input 
                type="range" 
                v-model.number="voiceSettings.speakingRate" 
                min="0.25" 
                max="4.0" 
                step="0.05"
                class="w-full"
              />
              <div class="flex justify-between text-xs text-muted-500 mt-1">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>
            
            <!-- Pitch -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="nui-label pb-0 text-[0.825rem]">Pitch</label>
                <span class="text-xs text-muted-500">{{ voiceSettings.pitch.toFixed(1) }}</span>
              </div>
              <input 
                type="range" 
                v-model.number="voiceSettings.pitch" 
                min="-20" 
                max="20" 
                step="0.5"
                class="w-full"
              />
              <div class="flex justify-between text-xs text-muted-500 mt-1">
                <span>Lower</span>
                <span>Normal</span>
                <span>Higher</span>
              </div>
            </div>
            
            <!-- Volume -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="nui-label pb-0 text-[0.825rem]">Volume</label>
                <span class="text-xs text-muted-500">{{ voiceSettings.volumeGainDb.toFixed(1) }}dB</span>
              </div>
              <input 
                type="range" 
                v-model.number="voiceSettings.volumeGainDb" 
                min="-10" 
                max="10" 
                step="0.5"
                class="w-full"
              />
              <div class="flex justify-between text-xs text-muted-500 mt-1">
                <span>Quiet</span>
                <span>Normal</span>
                <span>Loud</span>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
      
      <!-- Preview and Export -->
      <div class="col-span-12 lg:col-span-5 space-y-4">
        <!-- Audio Preview -->
        <BaseCard class="p-6">
          <BaseHeading size="sm" weight="medium" class="mb-4">Audio Preview</BaseHeading>
          
          <div v-if="error" class="mb-4">
            <BaseMessage type="danger">{{ error }}</BaseMessage>
          </div>
          
          <div v-if="!generatedAudioUrl && !generating" class="py-12 text-center">
            <Icon name="ph:speaker-none-duotone" class="size-12 mx-auto text-muted-300 mb-3" />
            <BaseText class="text-muted-500">Your generated audio will appear here</BaseText>
          </div>
          
          <div v-else-if="generating" class="py-12 flex items-center justify-center">
            <div class="animate-pulse text-center">
              <Icon name="ph:waveform-duotone" class="size-12 text-primary-500 opacity-50 mb-3" />
              <div class="text-muted-500">Generating audio...</div>
            </div>
          </div>
          
          <div v-else class="rounded-lg overflow-hidden bg-muted-100 dark:bg-muted-800">
            <!-- Audio player with custom controls -->
            <video
              ref="playerRef"
              class="w-full h-16"
              controls
            ></video>
            
            <div class="p-4">
              <BaseText size="xs" class="text-muted-500">
                {{ (scriptText.length || 0).toLocaleString() }} characters 
                • Approx. {{ Math.round((scriptText.length || 0) / 15) }}s audio
              </BaseText>
            </div>
          </div>
        </BaseCard>
        
        <!-- Export Options -->
        <BaseCard class="p-6">
          <BaseHeading size="sm" weight="medium" class="mb-4">Export Options</BaseHeading>
          
          <div class="space-y-4">
            <BaseButton 
              color="primary" 
              block
              :disabled="!generatedAudioUrl"
              @click="saveToProject"
            >
              <Icon name="ph:folder-plus-duotone" class="me-2" />
              Save to Project
            </BaseButton>
            
            <BaseButton 
              color="default" 
              block
              :disabled="!generatedAudioUrl"
              as="a" 
              :href="generatedAudioUrl"
              download="generated-voice.mp3"
            >
              <Icon name="ph:download-simple-duotone" class="me-2" />
              Download Audio
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
