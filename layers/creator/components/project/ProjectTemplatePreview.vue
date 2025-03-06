<script setup lang="ts">
import type { ProjectTemplate } from '../../types/project';

const props = defineProps<{
  templateId: string;
}>();

const emit = defineEmits(['close', 'select']);

const template = ref<ProjectTemplate | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Mock template data (would be fetched from API in real implementation)
const mockTemplates: Record<string, ProjectTemplate> = {
  'template-1': {
    id: 'template-1',
    name: 'Standard Template',
    description: 'A versatile template for most video content with clean, modern styling.',
    thumbnail_url: '/img/illustrations/templates/standard.jpg',
    category: 'general',
    settings: {
      format: '16:9',
      duration: 180,
      scenes: [
        {
          type: 'intro',
          duration: 10,
          elements: [
            { type: 'title', position: { x: 0.5, y: 0.5 }, size: { width: 0.8, height: 0.2 } },
            { type: 'subtitle', position: { x: 0.5, y: 0.7 }, size: { width: 0.6, height: 0.1 } }
          ]
        },
        {
          type: 'content',
          duration: 160,
          elements: [
            { type: 'image', position: { x: 0.5, y: 0.4 }, size: { width: 0.8, height: 0.6 } },
            { type: 'text', position: { x: 0.5, y: 0.8 }, size: { width: 0.8, height: 0.15 } }
          ]
        },
        {
          type: 'outro',
          duration: 10,
          elements: [
            { type: 'call-to-action', position: { x: 0.5, y: 0.5 }, size: { width: 0.7, height: 0.3 } }
          ]
        }
      ]
    },
    tags: ['professional', 'clean', 'versatile'],
    popularity: 85,
    is_featured: true
  },
  'template-2': {
    id: 'template-2',
    name: 'Explainer Template',
    description: 'Perfect for step-by-step tutorials and explanations with highlighted sections.',
    thumbnail_url: '/img/illustrations/templates/explainer.jpg',
    category: 'educational',
    settings: {
      format: '16:9',
      duration: 240,
      scenes: [
        {
          type: 'intro',
          duration: 15,
          elements: [
            { type: 'title', position: { x: 0.5, y: 0.5 }, size: { width: 0.8, height: 0.2 } },
            { type: 'subtitle', position: { x: 0.5, y: 0.7 }, size: { width: 0.6, height: 0.1 } }
          ]
        },
        {
          type: 'step',
          duration: 45,
          elements: [
            { type: 'step-number', position: { x: 0.1, y: 0.2 }, size: { width: 0.2, height: 0.2 } },
            { type: 'step-title', position: { x: 0.5, y: 0.2 }, size: { width: 0.6, height: 0.1 } },
            { type: 'image', position: { x: 0.5, y: 0.5 }, size: { width: 0.8, height: 0.5 } },
            { type: 'text', position: { x: 0.5, y: 0.8 }, size: { width: 0.8, height: 0.15 } }
          ]
        },
        {
          type: 'step',
          duration: 45,
          elements: [
            { type: 'step-number', position: { x: 0.1, y: 0.2 }, size: { width: 0.2, height: 0.2 } },
            { type: 'step-title', position: { x: 0.5, y: 0.2 }, size: { width: 0.6, height: 0.1 } },
            { type: 'image', position: { x: 0.5, y: 0.5 }, size: { width: 0.8, height: 0.5 } },
            { type: 'text', position: { x: 0.5, y: 0.8 }, size: { width: 0.8, height: 0.15 } }
          ]
        },
        {
          type: 'step',
          duration: 45,
          elements: [
            { type: 'step-number', position: { x: 0.1, y: 0.2 }, size: { width: 0.2, height: 0.2 } },
            { type: 'step-title', position: { x: 0.5, y: 0.2 }, size: { width: 0.6, height: 0.1 } },
            { type: 'image', position: { x: 0.5, y: 0.5 }, size: { width: 0.8, height: 0.5 } },
            { type: 'text', position: { x: 0.5, y: 0.8 }, size: { width: 0.8, height: 0.15 } }
          ]
        },
        {
          type: 'conclusion',
          duration: 15,
          elements: [
            { type: 'summary', position: { x: 0.5, y: 0.5 }, size: { width: 0.8, height: 0.3 } },
            { type: 'call-to-action', position: { x: 0.5, y: 0.8 }, size: { width: 0.6, height: 0.15 } }
          ]
        }
      ]
    },
    tags: ['educational', 'step-by-step', 'tutorial'],
    popularity: 72,
    is_featured: true
  },
  'template-3': {
    id: 'template-3',
    name: 'Social Media Template',
    description: 'Optimized for short-form social content with eye-catching visuals and captions.',
    thumbnail_url: '/img/illustrations/templates/social.jpg',
    category: 'social',
    settings: {
      format: '9:16',
      duration: 60,
      scenes: [
        {
          type: 'hook',
          duration: 5,
          elements: [
            { type: 'title', position: { x: 0.5, y: 0.5 }, size: { width: 0.8, height: 0.2 } },
            { type: 'background', position: { x: 0.5, y: 0.5 }, size: { width: 1, height: 1 } }
          ]
        },
        {
          type: 'content',
          duration: 50,
          elements: [
            { type: 'caption', position: { x: 0.5, y: 0.9 }, size: { width: 0.9, height: 0.2 } },
            { type: 'background', position: { x: 0.5, y: 0.5 }, size: { width: 1, height: 1 } }
          ]
        },
        {
          type: 'outro',
          duration: 5,
          elements: [
            { type: 'call-to-action', position: { x: 0.5, y: 0.5 }, size: { width: 0.8, height: 0.2 } },
            { type: 'background', position: { x: 0.5, y: 0.5 }, size: { width: 1, height: 1 } }
          ]
        }
      ]
    },
    tags: ['social media', 'short-form', 'vertical'],
    popularity: 94,
    is_featured: true
  }
};

// Load template data
onMounted(async () => {
  loading.value = true;
  try {
    // In a real implementation, this would be an API call
    // const response = await fetch(`/api/templates/${props.templateId}`);
    // template.value = await response.json();
    
    // For now, we'll use mock data
    setTimeout(() => {
      template.value = mockTemplates[props.templateId] || null;
      if (!template.value) {
        error.value = 'Template not found';
      }
      loading.value = false;
    }, 500); // Simulate API delay
  } catch (err) {
    error.value = 'Failed to load template';
    loading.value = false;
  }
});

const selectTemplate = () => {
  if (template.value) {
    emit('select', template.value);
  }
  emit('close');
};
</script>

<template>
  <BaseModal :open="true" @close="emit('close')" size="xl">
    <template #header>
      <div class="flex w-full items-center justify-between">
        <BaseHeading
          as="h3"
          size="lg"
          weight="medium"
          class="text-muted-900 dark:text-white"
        >
          <span v-if="loading">Loading Template...</span>
          <span v-else-if="error">Error</span>
          <span v-else-if="template">{{ template.name }}</span>
          <span v-else>Template Preview</span>
        </BaseHeading>
        <BaseButtonClose @click="emit('close')" />
      </div>
    </template>
    
    <div class="p-4">
      <div v-if="loading" class="flex justify-center py-10">
        <BaseProgressCircle size="lg" />
      </div>
      
      <div v-else-if="error" class="py-10">
        <BaseMessage type="danger">
          {{ error }}
        </BaseMessage>
      </div>
      
      <div v-else-if="template" class="grid grid-cols-12 gap-6">
        <!-- Template Preview -->
        <div class="col-span-12 md:col-span-7">
          <div class="bg-muted-100 dark:bg-muted-900 aspect-video rounded-lg overflow-hidden relative">
            <img
              :src="template.thumbnail_url"
              :alt="template.name"
              class="h-full w-full object-cover"
            />
            <div class="absolute inset-0 flex items-center justify-center">
              <BaseButton color="primary">
                <Icon name="lucide:play" class="me-1 size-4" />
                Play Preview
              </BaseButton>
            </div>
          </div>
          
          <div class="mt-4">
            <BaseHeading as="h4" size="sm" class="mb-2">Scene Structure</BaseHeading>
            <div class="bg-muted-100 dark:bg-muted-800 rounded-lg p-3 space-y-2">
              <div v-for="(scene, index) in template.settings.scenes" :key="`scene-${index}`" class="flex items-center gap-2">
                <div class="bg-primary-500 size-2 rounded-full"></div>
                <div class="grow">
                  <div class="flex items-center justify-between">
                    <BaseHeading as="h5" size="xs" weight="medium">
                      {{ scene.type.charAt(0).toUpperCase() + scene.type.slice(1) }}
                    </BaseHeading>
                    <BaseText size="xs" class="text-muted-500">
                      {{ scene.duration }}s
                    </BaseText>
                  </div>
                  <BaseText size="xs" class="text-muted-500">
                    {{ scene.elements.length }} elements
                  </BaseText>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Template Details -->
        <div class="col-span-12 md:col-span-5">
          <div class="space-y-5">
            <BaseText>{{ template.description }}</BaseText>
            
            <div>
              <BaseHeading as="h4" size="sm" class="mb-2">Details</BaseHeading>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <BaseText size="xs" class="text-muted-500">Category</BaseText>
                  <BaseText size="sm" weight="medium">{{ template.category }}</BaseText>
                </div>
                <div>
                  <BaseText size="xs" class="text-muted-500">Format</BaseText>
                  <BaseText size="sm" weight="medium">{{ template.settings.format }}</BaseText>
                </div>
                <div>
                  <BaseText size="xs" class="text-muted-500">Duration</BaseText>
                  <BaseText size="sm" weight="medium">{{ template.settings.duration }}s</BaseText>
                </div>
                <div>
                  <BaseText size="xs" class="text-muted-500">Popularity</BaseText>
                  <BaseText size="sm" weight="medium">{{ template.popularity }}%</BaseText>
                </div>
              </div>
            </div>
            
            <div>
              <BaseHeading as="h4" size="sm" class="mb-2">Tags</BaseHeading>
              <div class="flex flex-wrap gap-2">
                <BaseTag
                  v-for="tag in template.tags"
                  :key="tag"
                  size="sm"
                  color="default"
                  rounded="lg"
                >
                  {{ tag }}
                </BaseTag>
              </div>
            </div>
            
            <div v-if="template.is_featured" class="bg-primary-100 dark:bg-primary-500/20 text-primary-500 rounded-lg p-3">
              <div class="flex items-center gap-2">
                <Icon name="ph:star-duotone" class="size-5" />
                <BaseHeading size="xs" weight="medium">Featured Template</BaseHeading>
              </div>
              <BaseText size="xs" class="mt-1">
                This is one of our most popular templates, chosen for its versatility and effectiveness.
              </BaseText>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="py-10 text-center">
        <Icon name="ph:file-x-duotone" class="mx-auto mb-2 size-16 text-muted-400" />
        <BaseHeading as="h4" size="sm" class="mb-1">Template Not Found</BaseHeading>
        <BaseText>The requested template could not be found.</BaseText>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-between w-full">
        <BaseButton
          @click="emit('close')"
          color="muted"
        >
          Cancel
        </BaseButton>
        <BaseButton
          v-if="template"
          @click="selectTemplate"
          color="primary"
        >
          <Icon name="lucide:check" class="me-1 size-4" />
          Use This Template
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
