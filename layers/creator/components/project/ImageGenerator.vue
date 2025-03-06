<script setup lang="ts">
import { ref, onMounted } from 'vue';
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

// Image generation data
const prompt = ref('');
const negativePrompt = ref('');
const generatedImages = ref<Array<{base64: string, mimeType: string}>>([]);
const selectedImageIndex = ref(-1);

// Image settings
const selectedStyle = ref('photographic');
const imageCount = ref(1);
const imageWidth = ref(1024);
const imageHeight = ref(1024);

// Style options
const styleOptions = [
  { value: 'photographic', label: 'Photographic', description: 'Realistic photographic style' },
  { value: 'vivid', label: 'Vivid', description: 'Vibrant and colorful style' },
  { value: 'icon', label: 'Icon', description: 'Simple icon-like style' },
];

// Aspect ratio presets
const aspectRatios = [
  { value: 'square', label: 'Square (1:1)', width: 1024, height: 1024 },
  { value: 'landscape', label: 'Landscape (16:9)', width: 1024, height: 576 },
  { value: 'portrait', label: 'Portrait (9:16)', width: 576, height: 1024 },
  { value: 'widescreen', label: 'Widescreen (21:9)', width: 1024, height: 439 },
];

// Image count options
const countOptions = [
  { value: 1, label: '1 Image' },
  { value: 2, label: '2 Images' },
  { value: 4, label: '4 Images' },
];

// Fetch project data
onMounted(async () => {
  loading.value = true;
  try {
    projectData.value = await getDataById('projects', props.projectId);
    
    // Initialize prompt based on project info
    if (projectData.value) {
      prompt.value = `Create an image for a ${projectData.value.video_type} video about: ${projectData.value.title}`;
      
      // Get image settings if available
      if (projectData.value.images?.settings) {
        selectedStyle.value = projectData.value.images.settings.style || selectedStyle.value;
        imageWidth.value = projectData.value.images.settings.width || imageWidth.value;
        imageHeight.value = projectData.value.images.settings.height || imageHeight.value;
      }
      
      // Get images if available
      if (projectData.value.images?.data?.length) {
        generatedImages.value = projectData.value.images.data;
        selectedImageIndex.value = 0;
      }
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

// Select aspect ratio
const selectAspectRatio = (aspectRatio) => {
  imageWidth.value = aspectRatio.width;
  imageHeight.value = aspectRatio.height;
};

// Generate images
const generateImages = async () => {
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
    // Call the image generation endpoint
    const response = await $fetch('/api/image/generate', {
      method: 'POST',
      body: {
        prompt: prompt.value,
        negativePrompt: negativePrompt.value,
        model: 'imagegeneration@005', // Using the default Imagen model
        sampleCount: imageCount.value,
        width: imageWidth.value,
        height: imageHeight.value,
        style: selectedStyle.value,
      }
    });
    
    // Update the generated images
    if (response?.images?.length) {
      generatedImages.value = response.images;
      selectedImageIndex.value = 0;
      
      toaster.show({
        title: 'Success',
        message: 'Images generated successfully',
        color: 'success',
        icon: 'ph:check-circle-duotone',
      });
    } else {
      throw new Error('No images received');
    }
  } catch (err) {
    console.error('Error generating images:', err);
    error.value = 'Failed to generate images';
    toaster.show({
      title: 'Error',
      message: 'Failed to generate images',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    generating.value = false;
  }
};

// Select image
const selectImage = (index: number) => {
  selectedImageIndex.value = index;
};

// Save image to project
const saveImage = async () => {
  if (generatedImages.value.length === 0 || selectedImageIndex.value === -1) {
    toaster.show({
      title: 'Error',
      message: 'No image selected to save',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  saving.value = true;
  
  try {
    // Update the project with the generated images
    const imageData = {
      images: {
        data: generatedImages.value,
        settings: {
          style: selectedStyle.value,
          width: imageWidth.value,
          height: imageHeight.value,
          prompt: prompt.value,
          negativePrompt: negativePrompt.value,
        },
        selectedIndex: selectedImageIndex.value,
        created_at: new Date().toISOString(),
      }
    };
    
    // Save to database
    await updateData('projects', props.projectId, imageData);
    
    // Notify parent component
    emit('saved', imageData.images);
    
    toaster.show({
      title: 'Success',
      message: 'Images saved successfully',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (err) {
    console.error('Error saving images:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to save images',
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
      Image Generator
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
              Generate Images
            </BaseHeading>
            
            <!-- Style Selection -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Image Style</label>
              <div class="grid grid-cols-1 gap-2">
                <div 
                  v-for="style in styleOptions" 
                  :key="style.value" 
                  class="border-muted-200 dark:border-muted-700 hover:bg-muted-100 dark:hover:bg-muted-800 transition-colors border rounded-lg p-3 cursor-pointer"
                  :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-500/10': selectedStyle === style.value }"
                  @click="selectedStyle = style.value"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <BaseText weight="medium">{{ style.label }}</BaseText>
                      <BaseText size="xs" class="text-muted-400 mt-1">
                        {{ style.description }}
                      </BaseText>
                    </div>
                    <BaseRadio
                      :model-value="selectedStyle === style.value"
                      :name="style.value"
                      color="primary"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Aspect Ratio -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Aspect Ratio</label>
              <div class="grid grid-cols-2 gap-2">
                <BaseButton
                  v-for="ratio in aspectRatios"
                  :key="ratio.value"
                  color="default"
                  :variant="imageWidth === ratio.width && imageHeight === ratio.height ? 'solid' : 'outline'"
                  @click="selectAspectRatio(ratio)"
                  class="text-center justify-center"
                >
                  {{ ratio.label }}
                </BaseButton>
              </div>
            </div>
            
            <!-- Image Count -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Number of Images</label>
              <BaseSelect v-model="imageCount">
                <option v-for="option in countOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </BaseSelect>
              <BaseText size="xs" class="text-muted-400 mt-1">
                More images provide more options but take longer to generate
              </BaseText>
            </div>
            
            <!-- Prompt -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Prompt</label>
              <BaseTextarea
                v-model="prompt"
                rows="3"
                placeholder="Describe the image you want to generate..."
              />
            </div>
            
            <!-- Negative Prompt -->
            <div>
              <div class="flex justify-between">
                <label class="nui-label pb-2 text-[0.825rem]">Negative Prompt (Optional)</label>
                <BaseTooltip text="Describe what you don't want in the image">
                  <Icon name="ph:info-duotone" class="size-4 text-muted-400" />
                </BaseTooltip>
              </div>
              <BaseTextarea
                v-model="negativePrompt"
                rows="2"
                placeholder="Elements to avoid in the generated image..."
              />
            </div>
            
            <BaseButton
              color="primary"
              class="w-full"
              @click="generateImages"
              :loading="generating"
              :disabled="generating || !prompt.trim()"
            >
              <Icon name="ph:image-duotone" class="me-2 size-4" />
              Generate Images
            </BaseButton>
          </div>
        </BaseCard>
      </div>
      
      <!-- Output Column -->
      <div class="col-span-12 lg:col-span-7">
        <BaseCard class="p-4 md:p-6">
          <BaseHeading as="h4" size="sm" weight="medium" class="mb-4 flex items-center justify-between">
            <span>Generated Images</span>
            <BaseTag
              v-if="generatedImages.length > 0"
              color="success"
              rounded="sm"
            >
              <Icon name="ph:check-duotone" class="me-1 size-3" />
              {{ generatedImages.length }} Image{{ generatedImages.length > 1 ? 's' : '' }}
            </BaseTag>
          </BaseHeading>
          
          <div v-if="generatedImages.length === 0" class="py-20 text-center">
            <Icon name="ph:image-duotone" class="size-16 text-muted-300 mx-auto mb-4" />
            <BaseHeading as="h5" size="sm" weight="medium" class="mb-2">
              No Images Generated Yet
            </BaseHeading>
            <BaseText class="text-muted-400 max-w-md mx-auto">
              Configure your options and click "Generate Images" to create visuals for your video.
            </BaseText>
          </div>
          
          <div v-else>
            <!-- Main selected image -->
            <div class="bg-muted-100 dark:bg-muted-800 rounded-lg overflow-hidden mb-4">
              <img 
                :src="`data:${generatedImages[selectedImageIndex].mimeType};base64,${generatedImages[selectedImageIndex].base64}`"
                class="w-full object-contain rounded-lg"
                style="max-height: 400px;"
                alt="Generated image"
              />
            </div>
            
            <!-- Image thumbnails -->
            <div v-if="generatedImages.length > 1" class="grid grid-cols-4 gap-2 mb-4">
              <div
                v-for="(image, index) in generatedImages"
                :key="`image-${index}`"
                class="aspect-square cursor-pointer rounded-lg overflow-hidden border-2"
                :class="index === selectedImageIndex ? 'border-primary-500' : 'border-transparent'"
                @click="selectImage(index)"
              >
                <img
                  :src="`data:${image.mimeType};base64,${image.base64}`"
                  class="w-full h-full object-cover"
                  alt="Generated image thumbnail"
                />
              </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
              <BaseButton color="muted" @click="emit('canceled')">
                Cancel
              </BaseButton>
              <BaseButton
                color="primary"
                @click="saveImage"
                :loading="saving"
                :disabled="saving || selectedImageIndex < 0"
              >
                <Icon name="ph:floppy-disk-duotone" class="me-1 size-4" />
                Save Image
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
