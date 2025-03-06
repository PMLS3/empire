<script setup lang="ts">
import { ref } from 'vue';
import { useStorage } from '../../composables/useStorage';
import { useToaster } from '../../../shared/composables/toaster';

const loading = ref(false);
const prompt = ref('');
const negativePrompt = ref('');
const error = ref<string | null>(null);
const generatedImages = ref<string[]>([]);
const selectedImage = ref<string | null>(null);

// Image generation options
const options = ref({
  model: 'imagegeneration@005',
  sampleCount: 1,
  width: 1024,
  height: 1024,
  style: 'vivid',
});

// List of available styles
const availableStyles = [
  { value: 'vivid', label: 'Vivid' },
  { value: 'natural', label: 'Natural' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'anime', label: 'Anime' },
  { value: 'digital-art', label: 'Digital Art' },
];

// Aspect ratio options
const aspectRatios = [
  { value: { width: 1024, height: 1024 }, label: 'Square (1:1)' },
  { value: { width: 1024, height: 768 }, label: 'Landscape (4:3)' },
  { value: { width: 1024, height: 576 }, label: 'Widescreen (16:9)' },
  { value: { width: 768, height: 1024 }, label: 'Portrait (3:4)' },
  { value: { width: 576, height: 1024 }, label: 'Tall (9:16)' },
];

const { uploadAsset } = useStorage();
const toaster = useToaster();

// Set aspect ratio
const setAspectRatio = (ratio: { width: number, height: number }) => {
  options.value.width = ratio.width;
  options.value.height = ratio.height;
};

// Generate images based on the prompt
const generateImages = async () => {
  if (!prompt.value.trim()) {
    error.value = 'Please enter a prompt to generate images';
    return;
  }
  
  loading.value = true;
  error.value = null;
  generatedImages.value = [];
  selectedImage.value = null;
  
  try {
    // Call the AI API to generate images
    const response = await $fetch('/api/ai/image/generate', {
      method: 'POST',
      body: {
        prompt: prompt.value,
        negativePrompt: negativePrompt.value,
        model: options.value.model,
        sampleCount: options.value.sampleCount,
        width: options.value.width,
        height: options.value.height,
        style: options.value.style,
      }
    });
    
    if (response.images && response.images.length > 0) {
      generatedImages.value = response.images;
      selectedImage.value = generatedImages.value[0];
      
      toaster.show({
        title: 'Success',
        message: `Generated ${response.images.length} images`,
        color: 'success',
        icon: 'ph:check-circle-duotone',
      });
    } else {
      error.value = 'No images were generated. Please try a different prompt.';
    }
  } catch (err) {
    console.error('Error generating images:', err);
    error.value = err.message || 'Failed to generate images. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Select an image
const selectImage = (image: string) => {
  selectedImage.value = image;
};

// Save the selected image to a project
const saveToProject = async (projectId = 'temp') => {
  if (!selectedImage.value) {
    toaster.show({
      title: 'Error',
      message: 'No image selected',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  try {
    // Convert URL to File object
    const response = await fetch(selectedImage.value);
    const blob = await response.blob();
    const filename = `ai-generated-${Date.now()}.png`;
    const file = new File([blob], filename, { type: 'image/png' });
    
    // Upload to storage
    const result = await uploadAsset(file, 'image', projectId, {
      metadata: {
        generatedFrom: prompt.value,
        aiGenerated: true,
      }
    });
    
    toaster.show({
      title: 'Success',
      message: 'Image saved to project',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
    
    return result;
  } catch (err) {
    console.error('Error saving image:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to save image',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  }
};

// Download the selected image
const downloadImage = () => {
  if (!selectedImage.value) return;
  
  const link = document.createElement('a');
  link.href = selectedImage.value;
  link.download = `ai-generated-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<template>
  <div>
    <BasePageTitle title="Image Generator" subtitle="Create custom images with AI" />
    
    <div class="grid grid-cols-12 gap-6">
      <!-- Image Generation Form -->
      <div class="col-span-12 lg:col-span-5 space-y-4">
        <BaseCard class="p-6">
          <BaseHeading size="sm" weight="medium" class="mb-4">Image Prompt</BaseHeading>
          
          <div class="space-y-4">
            <BaseTextarea
              v-model="prompt"
              :rows="6"
              placeholder="Describe the image you want to generate in detail..."
              label="Prompt"
            />
            
            <BaseTextarea
              v-model="negativePrompt"
              :rows="3"
              placeholder="Elements to exclude from the generated image..."
              label="Negative Prompt (optional)"
            />
            
            <!-- Aspect Ratio Selection -->
            <div>
              <label class="nui-label pb-2 text-[0.825rem]">Aspect Ratio</label>
              <div class="flex flex-wrap gap-2">
                <BaseButton
                  v-for="ratio in aspectRatios"
                  :key="ratio.label"
                  size="xs"
                  :color="options.width === ratio.value.width && options.height === ratio.value.height ? 'primary' : 'default'"
                  @click="setAspectRatio(ratio.value)"
                >
                  {{ ratio.label }}
                </BaseButton>
              </div>
            </div>
            
            <!-- Style Selection -->
            <div>
              <BaseSelect v-model="options.style" label="Style">
                <option v-for="style in availableStyles" :key="style.value" :value="style.value">
                  {{ style.label }}
                </option>
              </BaseSelect>
            </div>
            
            <!-- Sample Count -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="nui-label pb-0 text-[0.825rem]">Number of Images</label>
                <span class="text-xs text-muted-500">{{ options.sampleCount }}</span>
              </div>
              <input 
                type="range" 
                v-model.number="options.sampleCount" 
                min="1" 
                max="4" 
                step="1"
                class="w-full"
              />
            </div>
            
            <div class="flex justify-end">
              <BaseButton 
                color="primary" 
                :loading="loading"
                :disabled="loading || !prompt.trim()"
                @click="generateImages"
              >
                <Icon name="ph:image-square-duotone" class="me-2" />
                Generate Images
              </BaseButton>
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
              :disabled="!selectedImage"
              @click="saveToProject()"
            >
              <Icon name="ph:folder-plus-duotone" class="me-2" />
              Save to Project
            </BaseButton>
            
            <BaseButton 
              color="default" 
              block
              :disabled="!selectedImage"
              @click="downloadImage"
            >
              <Icon name="ph:download-simple-duotone" class="me-2" />
              Download Image
            </BaseButton>
          </div>
        </BaseCard>
      </div>
      
      <!-- Generated Images -->
      <div class="col-span-12 lg:col-span-7">
        <BaseCard class="p-6">
          <BaseHeading size="sm" weight="medium" class="mb-4">Generated Images</BaseHeading>
          
          <div v-if="error" class="mb-4">
            <BaseMessage type="danger">{{ error }}</BaseMessage>
          </div>
          
          <div v-if="loading" class="py-12 flex items-center justify-center">
            <div class="animate-pulse text-center">
              <Icon name="ph:image-square-duotone" class="size-12 text-primary-500 opacity-50 mb-3" />
              <div class="text-muted-500">Generating images...</div>
              <BaseText size="xs" class="mt-2 text-muted-400">This may take up to a minute</BaseText>
            </div>
          </div>
          
          <div v-else-if="generatedImages.length === 0" class="py-12 text-center">
            <Icon name="ph:image-square-duotone" class="size-12 mx-auto text-muted-300 mb-3" />
            <BaseText class="text-muted-500">Your generated images will appear here</BaseText>
          </div>
          
          <template v-else>
            <!-- Selected Image Preview -->
            <div v-if="selectedImage" class="mb-4">
              <div class="relative rounded-lg overflow-hidden bg-muted-100 dark:bg-muted-800">
                <img :src="selectedImage" class="w-full h-auto" alt="Generated image" />
              </div>
            </div>
            
            <!-- Thumbnails -->
            <div v-if="generatedImages.length > 1" class="grid grid-cols-4 gap-2">
              <div 
                v-for="(image, index) in generatedImages" 
                :key="index"
                class="aspect-square rounded-lg overflow-hidden cursor-pointer"
                :class="{ 'ring-2 ring-primary-500': selectedImage === image }"
                @click="selectImage(image)"
              >
                <img :src="image" class="w-full h-full object-cover" alt="Generated image thumbnail" />
              </div>
            </div>
          </template>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
