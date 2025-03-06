<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { Field, useForm } from 'vee-validate';
import { z } from 'zod';
import { useCreatorData } from '../../composables/useCreatorData';

const props = defineProps<{
  channelId: string;
  projectId?: string; // Optional - present when editing existing project
  mode: 'create' | 'edit';
}>();

const emit = defineEmits(['created', 'updated', 'canceled']);

const router = useRouter();
const { getDataById, createData, updateData } = useCreatorData();

// Validation schema for project
const validationSchema = toTypedSchema(
  z.object({
    title: z.string().min(1, 'Project title is required'),
    description: z.string().optional(),
    channel_id: z.string().min(1, 'Channel is required'),
    video_type: z.string().min(1, 'Video type is required'),
    template_id: z.string().optional(),
    target_platform: z.array(z.string()).min(1, 'At least one platform is required'),
    settings: z.object({
      duration_target: z.number().min(0, 'Duration must be positive'),
      format: z.string().min(1, 'Video format is required'),
      quality: z.string().min(1, 'Quality is required'),
    }),
    metadata: z.object({
      tags: z.array(z.string()).optional(),
      category: z.string().optional(),
      language: z.string().min(1, 'Language is required'),
    }),
    schedule: z.object({
      publish_date: z.string().optional(),
      time_zone: z.string().optional(),
      platforms: z.array(z.string()).optional(),
      status: z.string().optional(),
    }).optional(),
  })
);

// Default initial values
const defaultValues = {
  title: '',
  description: '',
  channel_id: props.channelId,
  video_type: 'standard',
  template_id: '',
  target_platform: ['youtube'],
  settings: {
    duration_target: 60, // Default 60 seconds
    format: '16:9',
    quality: 'HD',
  },
  metadata: {
    tags: [],
    category: '',
    language: 'en',
  },
  schedule: {
    publish_date: '',
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platforms: [],
    status: 'draft',
  },
};

const { loading, currentData, error } = ref({
  loading: props.projectId ? true : false,
  currentData: null,
  error: null
});

// Fetch project data if editing
onMounted(async () => {
  if (props.projectId) {
    loading.value = true;
    try {
      currentData.value = await getDataById('projects', props.projectId);
    } catch (err) {
      error.value = 'Failed to load project data';
    } finally {
      loading.value = false;
    }
  }
});

const initialValues = computed(() => {
  return currentData.value || defaultValues;
});

const {
  handleSubmit,
  isSubmitting,
  values,
  errors,
  resetForm,
  meta,
  setFieldValue,
} = useForm({
  validationSchema,
  initialValues,
});

// Video types
const videoTypes = [
  { value: 'standard', label: 'Standard Video' },
  { value: 'shorts', label: 'Short Video' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'explainer', label: 'Explainer' },
  { value: 'vlog', label: 'Vlog' },
  { value: 'review', label: 'Review' },
];

// Video formats
const videoFormats = [
  { value: '16:9', label: 'Landscape (16:9)' },
  { value: '9:16', label: 'Portrait (9:16)' },
  { value: '1:1', label: 'Square (1:1)' },
  { value: '4:3', label: 'Traditional (4:3)' },
];

// Video quality options
const videoQuality = [
  { value: 'SD', label: 'Standard Definition (480p)' },
  { value: 'HD', label: 'High Definition (720p)' },
  { value: 'FHD', label: 'Full HD (1080p)' },
  { value: '4K', label: '4K Ultra HD (2160p)' },
];

// Platform options
const platformOptions = [
  { value: 'youtube', label: 'YouTube', icon: 'logos:youtube-icon' },
  { value: 'tiktok', label: 'TikTok', icon: 'logos:tiktok-icon' },
  { value: 'instagram', label: 'Instagram', icon: 'mdi:instagram' },
  { value: 'facebook', label: 'Facebook', icon: 'mdi:facebook' },
];

// Language options
const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'pt', label: 'Portuguese' },
];

// Tag management
const newTag = ref('');
const addTag = () => {
  if (!newTag.value) return;
  
  const currentTags = values.metadata.tags || [];
  if (!currentTags.includes(newTag.value)) {
    setFieldValue('metadata.tags', [...currentTags, newTag.value]);
  }
  newTag.value = '';
};

const removeTag = (tag) => {
  const currentTags = values.metadata.tags || [];
  setFieldValue('metadata.tags', currentTags.filter(t => t !== tag));
};

// Preview the template
const showTemplatePreview = ref(false);
const selectedTemplateId = ref('');

const openTemplatePreview = (templateId) => {
  selectedTemplateId.value = templateId;
  showTemplatePreview.value = true;
};

// Form submission
const onSubmit = handleSubmit(async (formValues) => {
  try {
    const projectData = {
      ...formValues,
      // Add any additional data needed for project creation
      status: 'draft',
    };
    
    if (props.mode === 'create') {
      const createdProject = await createData('projects', projectData, ['title', 'description']);
      
      if (createdProject) {
        emit('created', createdProject);
        
        // Navigate to the created project
        router.push(`/projects/${createdProject.id}`);
      }
    } else {
      const updatedProject = await updateData('projects', props.projectId, projectData);
      
      if (updatedProject) {
        emit('updated', updatedProject);
      }
    }
  } catch (err) {
    console.error('Error saving project:', err);
  }
});

// Cancel form
const onCancel = () => {
  emit('canceled');
  if (props.mode === 'create') {
    router.back();
  }
};
</script>

<template>
  <div>
    <BaseMessage v-if="error" type="danger" @close="error = null">
      {{ error }}
    </BaseMessage>
    
    <div v-if="loading">
      <BasePlaceholderPage
        title="Loading project"
        subtitle="Please wait while we load your project data"
      />
    </div>
    
    <form v-else @submit.prevent="onSubmit" class="space-y-12">
      <div class="grid grid-cols-12 gap-6">
        <!-- Project Information Column -->
        <div class="col-span-12 lg:col-span-8">
          <BaseCard rounded="sm" class="p-4 md:p-8">
            <div class="grid grid-cols-12 gap-x-4 gap-y-6">
              <!-- Project Title -->
              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="title">
                  <BaseInput
                    label="Project Title"
                    placeholder="Enter project title"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              
              <!-- Project Description -->
              <div class="col-span-12">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="description">
                  <BaseTextarea
                    label="Project Description"
                    placeholder="Describe your project"
                    rows="3"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              
              <!-- Project Type -->
              <div class="col-span-12 md:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange }" name="video_type">
                  <BaseSelect
                    label="Video Type"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                  >
                    <option v-for="type in videoTypes" :key="type.value" :value="type.value">
                      {{ type.label }}
                    </option>
                  </BaseSelect>
                </Field>
              </div>
              
              <!-- Target Duration -->
              <div class="col-span-12 md:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="settings.duration_target">
                  <BaseInput
                    type="number"
                    label="Target Duration (seconds)"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              
              <!-- Video Format -->
              <div class="col-span-12 md:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange }" name="settings.format">
                  <BaseSelect
                    label="Video Format"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                  >
                    <option v-for="format in videoFormats" :key="format.value" :value="format.value">
                      {{ format.label }}
                    </option>
                  </BaseSelect>
                </Field>
              </div>
              
              <!-- Video Quality -->
              <div class="col-span-12 md:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange }" name="settings.quality">
                  <BaseSelect
                    label="Video Quality"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                  >
                    <option v-for="quality in videoQuality" :key="quality.value" :value="quality.value">
                      {{ quality.label }}
                    </option>
                  </BaseSelect>
                </Field>
              </div>
              
              <!-- Language -->
              <div class="col-span-12 md:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange }" name="metadata.language">
                  <BaseSelect
                    label="Language"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                  >
                    <option v-for="lang in languages" :key="lang.value" :value="lang.value">
                      {{ lang.label }}
                    </option>
                  </BaseSelect>
                </Field>
              </div>
              
              <!-- Category -->
              <div class="col-span-12 md:col-span-6">
                <Field v-slot="{ field, errorMessage, handleChange, handleBlur }" name="metadata.category">
                  <BaseInput
                    label="Category"
                    placeholder="e.g. Education, Entertainment"
                    :model-value="field.value"
                    :error="errorMessage"
                    :disabled="isSubmitting"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </div>
              
              <!-- Tags -->
              <div class="col-span-12">
                <label class="nui-label pb-2 text-[0.825rem]">Tags</label>
                <div class="flex flex-wrap gap-2 mb-2">
                  <BaseTag
                    v-for="tag in values.metadata.tags"
                    :key="tag"
                    color="default"
                    rounded="lg"
                    class="p-1"
                  >
                    <span>{{ tag }}</span>
                    <button 
                      type="button" 
                      class="ms-2" 
                      @click="removeTag(tag)"
                    >
                      <Icon name="lucide:x" class="size-3 text-muted-400 hover:text-danger-500" />
                    </button>
                  </BaseTag>
                </div>
                <div class="flex gap-2">
                  <BaseInput
                    v-model="newTag"
                    placeholder="Add a tag"
                    class="flex-grow"
                    @keyup.enter.prevent="addTag"
                  />
                  <BaseButton
                    type="button"
                    color="default"
                    @click="addTag"
                  >
                    <Icon name="lucide:plus" class="size-4" />
                    <span>Add</span>
                  </BaseButton>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
        
        <!-- Settings Column -->
        <div class="col-span-12 lg:col-span-4">
          <BaseCard class="p-6">
            <div class="space-y-6">
              <!-- Target Platforms -->
              <div>
                <BaseHeading
                  as="h3"
                  size="sm"
                  weight="medium"
                  class="text-muted-800 dark:text-muted-100 mb-3"
                >
                  Target Platforms
                </BaseHeading>
                
                <div class="space-y-2">
                  <Field v-slot="{ errorMessage }" name="target_platform">
                    <div v-if="errorMessage" class="text-danger-500 text-xs mb-1">{{ errorMessage }}</div>
                  </Field>
                  
                  <div v-for="platform in platformOptions" :key="platform.value" class="flex items-center gap-3">
                    <Field v-slot="{ field, handleChange }" :name="`target_platform`">
                      <BaseCheckbox
                        :model-value="field.value?.includes(platform.value)"
                        :disabled="isSubmitting"
                        @update:model-value="(checked) => {
                          const current = [...field.value || []];
                          if (checked) {
                            if (!current.includes(platform.value)) {
                              handleChange([...current, platform.value]);
                            }
                          } else {
                            handleChange(current.filter(v => v !== platform.value));
                          }
                        }"
                      >
                        <div class="flex items-center gap-2">
                          <Icon :name="platform.icon" class="size-5" />
                          <span>{{ platform.label }}</span>
                        </div>
                      </BaseCheckbox>
                    </Field>
                  </div>
                </div>
              </div>
              
              <!-- Template Selection -->
              <div>
                <BaseHeading
                  as="h3"
                  size="sm"
                  weight="medium"
                  class="text-muted-800 dark:text-muted-100 mb-3"
                >
                  Select Template
                </BaseHeading>
                
                <Field v-slot="{ field, errorMessage, handleChange }" name="template_id">
                  <div class="space-y-3">
                    <div v-if="errorMessage" class="text-danger-500 text-xs">{{ errorMessage }}</div>
                    
                    <!-- Template cards would go here -->
                    <BaseCard
                      class="border-muted-200 dark:border-muted-700 hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer border p-3"
                      :class="{ 'border-primary-500': field.value === 'template-1' }"
                      @click="handleChange('template-1')"
                    >
                      <div class="flex items-center gap-3">
                        <div class="bg-muted-100 dark:bg-muted-700 h-14 w-24 rounded-lg"></div>
                        <div>
                          <BaseHeading
                            as="h4"
                            size="xs"
                            weight="medium"
                            class="text-muted-800 dark:text-white"
                          >
                            Standard Template
                          </BaseHeading>
                          <BaseText size="xs" class="text-muted-500">
                            Basic video layout with title and content
                          </BaseText>
                        </div>
                      </div>
                    </BaseCard>
                    
                    <BaseCard
                      class="border-muted-200 dark:border-muted-700 hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer border p-3"
                      :class="{ 'border-primary-500': field.value === 'template-2' }"
                      @click="handleChange('template-2')"
                    >
                      <div class="flex items-center gap-3">
                        <div class="bg-muted-100 dark:bg-muted-700 h-14 w-24 rounded-lg"></div>
                        <div>
                          <BaseHeading
                            as="h4"
                            size="xs"
                            weight="medium"
                            class="text-muted-800 dark:text-white"
                          >
                            Explainer Template
                          </BaseHeading>
                          <BaseText size="xs" class="text-muted-500">
                            Optimized for step-by-step explanations
                          </BaseText>
                        </div>
                      </div>
                    </BaseCard>
                    
                    <BaseCard
                      class="border-muted-200 dark:border-muted-700 hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer border p-3"
                      :class="{ 'border-primary-500': field.value === 'template-3' }"
                      @click="handleChange('template-3')"
                    >
                      <div class="flex items-center gap-3">
                        <div class="bg-muted-100 dark:bg-muted-700 h-14 w-24 rounded-lg"></div>
                        <div>
                          <BaseHeading
                            as="h4"
                            size="xs"
                            weight="medium"
                            class="text-muted-800 dark:text-white"
                          >
                            Social Media Template
                          </BaseHeading>
                          <BaseText size="xs" class="text-muted-500">
                            Optimized for short-form social content
                          </BaseText>
                        </div>
                      </div>
                    </BaseCard>
                    
                    <BaseButton
                      type="button"
                      color="default"
                      class="w-full"
                    >
                      <Icon name="lucide:layout-template" class="me-1 size-4" />
                      <span>Browse More Templates</span>
                    </BaseButton>
                  </div>
                </Field>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
      
      <!-- Save buttons -->
      <div class="flex justify-end gap-3">
        <BaseButton
          type="button"
          @click="onCancel"
        >
          Cancel
        </BaseButton>
        <BaseButton
          type="submit"
          color="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        >
          <Icon name="ph:check-duotone" class="me-1 size-4" />
          <span v-if="props.mode === 'create'">Create Project</span>
          <span v-else>Save Project</span>
        </BaseButton>
      </div>
    </form>
  </div>
</template>
