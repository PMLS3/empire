<script setup lang="ts">
import { ref, watch } from 'vue';
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

// Script data
const prompt = ref('');
const generatedScript = ref('');
const selectedFormat = ref('script'); // script, outline, story
const selectedModel = ref('gemini-1.5-pro');
const temperature = ref(0.7);

// Format options
const formatOptions = [
  { value: 'script', label: 'Full Script', description: 'Complete dialogue and scene directions' },
  { value: 'outline', label: 'Outline', description: 'Structured bullet points and sections' },
  { value: 'story', label: 'Narrative', description: 'Storytelling approach with an engaging flow' },
];

// Model options
const modelOptions = [
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Advanced model for complex scripts' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', description: 'Faster model for quick generations' },
];

// Fetch project data
onMounted(async () => {
  loading.value = true;
  try {
    projectData.value = await getDataById('projects', props.projectId);
    
    // Initialize the prompt based on project info
    if (projectData.value) {
      prompt.value = `Create a ${projectData.value.video_type} video about: ${projectData.value.title}.\n\n`;
      
      if (projectData.value.description) {
        prompt.value += `Description: ${projectData.value.description}\n\n`;
      }
      
      if (projectData.value.metadata?.tags?.length) {
        prompt.value += `Keywords to include: ${projectData.value.metadata.tags.join(', ')}\n\n`;
      }
      
      prompt.value += 'Additional details and requirements:';
    }
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

// Generate script
const generateScript = async () => {
  if (!prompt.value.trim()) {
    toaster.show({
      title: 'Error',
      message: 'Please enter a prompt',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  generating.value = true;
  error.value = null;
  
  try {
    // Call the AI generation endpoint
    const response = await $fetch('/api/text/generate', {
      method: 'POST',
      body: {
        prompt: prompt.value,
        model: selectedModel.value,
        format: selectedFormat.value,
        temperature: temperature.value,
        context: {
          title: projectData.value?.title,
          description: projectData.value?.description,
          tags: projectData.value?.metadata?.tags,
          duration: projectData.value?.settings?.duration_target,
          type: projectData.value?.video_type,
        }
      }
    });
    
    // Update the generated script
    generatedScript.value = response.text;
    
    toaster.show({
      title: 'Success',
      message: 'Script generated successfully',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (err) {
    console.error('Error generating script:', err);
    error.value = 'Failed to generate script';
    toaster.show({
      title: 'Error',
      message: 'Failed to generate script',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    generating.value = false;
  }
};

// Save the script to project
const saveScript = async () => {
  if (!generatedScript.value) {
    toaster.show({
      title: 'Error',
      message: 'No script to save',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  saving.value = true;
  
  try {
    // Update the project with the generated script
    const scriptData = {
      script: {
        content: generatedScript.value,
        format: selectedFormat.value,
        model: selectedModel.value,
        prompt: prompt.value,
        created_at: new Date().toISOString(),
        version: 1,
      }
    };
    
    // Save to database
    await updateData('projects', props.projectId, scriptData);
    
    // Notify parent component
    emit('saved', scriptData.script);
    
    toaster.show({
      title: 'Success',
      message: 'Script saved successfully',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (err) {
    console.error('Error saving script:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to save script',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    saving.value = false;
  }
};

// Edit the script manually
const updateScript = (event) => {
  generatedScript.value = event.target.value;
};
</script>

<template>
  <div>
    <BaseHeading as="h3" size="md" weight="medium" class="mb-4">
      Script Generator
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
      <!-- Input Configuration Column -->
      <div class="col-span-12 lg:col-span-5">
        <BaseCard class="p-4 md:p-6">
          <div class="space-y-4">
            <BaseHeading as="h4" size="sm" weight="medium" class="mb-4">
              Generate Your Script
            </BaseHeading>
            
            <!-- Format Selection -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Output Format</label>
              <div class="grid grid-cols-1 gap-2">
                <div 
                  v-for="format in formatOptions" 
                  :key="format.value" 
                  class="border-muted-200 dark:border-muted-700 hover:bg-muted-100 dark:hover:bg-muted-800 transition-colors border rounded-lg p-3 cursor-pointer"
                  :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-500/10': selectedFormat === format.value }"
                  @click="selectedFormat = format.value"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <Icon 
                        v-if="format.value === 'script'" 
                        name="ph:file-text-duotone" 
                        class="size-5 text-primary-500" 
                      />
                      <Icon 
                        v-else-if="format.value === 'outline'" 
                        name="ph:list-bullets-duotone" 
                        class="size-5 text-info-500" 
                      />
                      <Icon 
                        v-else 
                        name="ph:book-open-duotone" 
                        class="size-5 text-success-500" 
                      />
                      <BaseText weight="medium">{{ format.label }}</BaseText>
                    </div>
                    <BaseRadio
                      :model-value="selectedFormat === format.value"
                      :name="format.value"
                      color="primary"
                    />
                  </div>
                  <BaseText size="xs" class="text-muted-400 mt-1 ms-7">
                    {{ format.description }}
                  </BaseText>
                </div>
              </div>
            </div>
            
            <!-- Model Selection -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">AI Model</label>
              <BaseSelect v-model="selectedModel">
                <option v-for="model in modelOptions" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </BaseSelect>
              <BaseText size="xs" class="text-muted-400 mt-1">
                {{ modelOptions.find(m => m.value === selectedModel)?.description }}
              </BaseText>
            </div>
            
            <!-- Temperature -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Creativity</label>
              <BaseSlider v-model="temperature" :min="0" :max="1" :step="0.1" />
              <div class="flex justify-between">
                <BaseText size="xs" class="text-muted-400">Conservative</BaseText>
                <BaseText size="xs" class="text-muted-400">Creative</BaseText>
              </div>
            </div>
            
            <!-- Prompt Input -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Prompt</label>
              <BaseTextarea
                v-model="prompt"
                rows="6"
                placeholder="Describe what you want in your script..."
                class="mb-4"
              />
              <BaseButton
                color="primary"
                class="w-full"
                @click="generateScript"
                :loading="generating"
                :disabled="generating || !prompt.trim()"
              >
                <Icon name="ph:sparkle-duotone" class="me-2 size-4" />
                Generate Script
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
      
      <!-- Output Column -->
      <div class="col-span-12 lg:col-span-7">
        <BaseCard class="p-4 md:p-6">
          <BaseHeading as="h4" size="sm" weight="medium" class="mb-4 flex items-center justify-between">
            <span>Generated Script</span>
            <BaseTag v-if="generatedScript" color="success" rounded="sm">
              <Icon name="ph:check-duotone" class="me-1 size-3" />
              Ready
            </BaseTag>
          </BaseHeading>
          
          <div v-if="!generatedScript" class="py-20 text-center">
            <Icon name="ph:file-text-duotone" class="size-16 text-muted-300 mx-auto mb-4" />
            <BaseHeading as="h5" size="sm" weight="medium" class="mb-2">
              No Script Generated Yet
            </BaseHeading>
            <BaseText class="text-muted-400 max-w-md mx-auto">
              Configure your options and click "Generate Script" to create your video script.
            </BaseText>
          </div>
          
          <div v-else>
            <BaseTextarea
              v-model="generatedScript"
              rows="20"
              class="monospace-font mb-4"
              @input="updateScript"
            />
            
            <div class="flex justify-end gap-2">
              <BaseButton color="muted" @click="emit('canceled')">
                Cancel
              </BaseButton>
              <BaseButton
                color="primary"
                @click="saveScript"
                :loading="saving"
                :disabled="saving || !generatedScript"
              >
                <Icon name="ph:floppy-disk-duotone" class="me-1 size-4" />
                Save Script
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monospace-font {
  font-family: monospace;
}
</style>
