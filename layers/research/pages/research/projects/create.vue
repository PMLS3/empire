<script setup lang="ts">
import { useForm, Field } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useResearch } from '~/composables/useResearch';
import { useBook } from '~/composables/useBook';
import { useToaster } from '../../../../shared/composables/toaster';

useHead({
  title: 'Create Research Project',
});

// Use research composable
const { createResearch } = useResearch();
const router = useRouter();

// Get book categories
const { bookCategories } = useBook();

// Form validation schema
const validationSchema = toTypedSchema(
  z.object({
    main_category: z.string().min(1, 'Main category is required'),
    sub_category: z.string().min(1, 'Subcategory is required'),
    sub_category_description: z.string().optional(),
    status: z.enum(['in_progress', 'completed']).default('in_progress'),
    is_public: z.boolean().default(false),
  })
);

// Form initial values
const initialValues = {
  main_category: '',
  sub_category: '',
  sub_category_description: '',
  status: 'in_progress' as 'in_progress' | 'completed',
  is_public: false,
};

// Use form
const { handleSubmit, isSubmitting, values, setFieldValue, errors, resetForm } = useForm({
  validationSchema,
  initialValues,
});

// Debug the form values
watch(() => values, (newValues) => {
  console.log('Form values updated:', newValues);
}, { deep: true });

// Debug book categories
watch(() => bookCategories.value, (newCategories) => {
  console.log('Book categories updated:', newCategories);
}, { immediate: true });

// Toaster for notifications
const toaster = useToaster();

// Submit handler
const onSubmit = handleSubmit(async (formValues) => {
  try {
    console.log('Submitting form with values:', formValues);
    
    // Call composable to create research project
    const response = await createResearch(formValues);
    
    if (response) {
      // Redirect to the new project
      router.push(`/research/projects/${response.id}`);
    }
  } catch (error) {
    console.error('Error creating research project:', error);
    toaster.show({
      title: 'Error',
      message: 'Failed to create research project',
      color: 'danger',
      icon: 'ph:x-circle',
      closable: true,
    });
  }
});

// Category options
const mainCategoryOptions = [
  { value: 'book', label: 'Book' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'self-help', label: 'Self-Help' },
  { value: 'business', label: 'Business' },
  { value: 'technical', label: 'Technical' },
  { value: 'other', label: 'Other' },
];

// When main category changes, reset sub category
watch(() => values.main_category, (newMainCategory) => {
  if (newMainCategory) {
    // Reset sub category when main category changes
    setFieldValue('sub_category', '');
  }
});


// Make sure subcategory options have proper value/label format
const subCategoryOptions = computed(() => {
  // If main category is selected, return sub categories
  if (!values.main_category) {
    return [];
  } else if (values.main_category === 'book' && bookCategories.value) {
    console.log('Raw book categories:', bookCategories.value);
    // Make sure we have proper id/value and name/label mappings
    return bookCategories.value.map((category) => {
      const value = category.id || category.value || '';
      const label = category.name || category.label || value;
      return { value, label }; 
    });
  }
  return [];
});

</script>

<template>
  <div class="space-y-6 pb-20 pt-4">
    <BaseCard class="p-6">
      <!-- Header -->
      <div class="mb-6 flex items-center">
        <NuxtLink 
          to="/research/dashboard" 
          class="me-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted-100 dark:bg-muted-900 hover:bg-primary-500/20 hover:text-primary-500"
        >
          <Icon name="ph:arrow-left-duotone" class="size-5" />
        </NuxtLink>
        <BaseHeading tag="h2" size="xl" weight="semibold" class="text-muted-800 dark:text-white">
          Create Research Project
        </BaseHeading>
      </div>
      <!-- Form -->
      <form @submit.prevent="onSubmit">
        <div class="space-y-6">
          <!-- Main Category -->
          <div class="space-y-2">
            <BaseHeading tag="h3" size="sm" weight="medium" class="text-muted-800 dark:text-white">
              Main Category
            </BaseHeading>
            <BaseParagraph size="xs" class="text-muted-400">
              Select the main book category you want to research
            </BaseParagraph>
            <Field name="main_category" v-slot="{ field, errorMessage, handleChange, handleBlur }">
              <BaseSelect
                :model-value="field.value"
                placeholder="Select a main category"
                :error="errorMessage"
                shape="rounded"
                required
                @update:model-value="handleChange"
                @blur="handleBlur"
              >
                <option value="" disabled hidden>Select a main category</option>
                <option v-for="option in mainCategoryOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </BaseSelect>
            </Field>
          </div>
          
          <!-- Sub Category -->
          <div class="space-y-2">
            <BaseHeading tag="h3" size="sm" weight="medium" class="text-muted-800 dark:text-white">
              Subcategory
            </BaseHeading>
            <BaseParagraph size="xs" class="text-muted-400">
              Select a specific subcategory for your research
            </BaseParagraph>
            
            <!-- Use direct v-model binding with the Field component -->
            <Field name="sub_category" v-slot="{ field, errorMessage, handleChange, handleBlur }">
              <BaseSelect
                :model-value="field.value"
                placeholder="Select a sub category"
                :error="errorMessage"
                shape="rounded"
                required
                @update:model-value="handleChange"
                @blur="handleBlur"
              >
                <option value="" disabled hidden>Select a sub category</option>
                <option v-for="option in subCategoryOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </BaseSelect>
            </Field>
          </div>
          
          <!-- Description -->
          <div class="space-y-2">
            <BaseHeading tag="h3" size="sm" weight="medium" class="text-muted-800 dark:text-white">
              Description (Optional)
            </BaseHeading>
            <BaseParagraph size="xs" class="text-muted-400">
              Add a brief description to clarify the focus of your research
            </BaseParagraph>
            <Field name="sub_category_description" v-slot="{ field, errorMessage, handleChange, handleBlur }">
              <BaseTextarea
                :model-value="field.value"
                placeholder="Enter a description of what you're researching..."
                :error="errorMessage"
                rows="3"
                shape="rounded"
                @update:model-value="handleChange"
                @blur="handleBlur"
              />
            </Field>
          </div>
          
          <!-- Status & Visibility -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Status -->
            <div class="space-y-2">
              <BaseHeading tag="h3" size="sm" weight="medium" class="text-muted-800 dark:text-white">
                Status
              </BaseHeading>
              <BaseParagraph size="xs" class="text-muted-400">
                Set the current status of your research project
              </BaseParagraph>
              <Field name="status" v-slot="{ field, errorMessage, handleChange, handleBlur }">
                <div>
                  <BaseRadio
                    :model-value="field.value"
                    name="status"
                    label="In Progress"
                    color="info"
                    value="in_progress"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                  <BaseRadio
                    :model-value="field.value"
                    name="status"
                    label="Completed"
                    color="success"
                    value="completed"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                  <div v-if="errorMessage" class="text-danger-500 mt-1 text-xs">{{ errorMessage }}</div>
                </div>
              </Field>
            </div>
            
            <!-- Visibility -->
            <div class="space-y-2">
              <BaseHeading tag="h3" size="sm" weight="medium" class="text-muted-800 dark:text-white">
                Visibility
              </BaseHeading>
              <BaseParagraph size="xs" class="text-muted-400">
                Control who can discover your research project
              </BaseParagraph>
              <Field name="is_public" v-slot="{ field, errorMessage, handleChange, handleBlur }">
                <div>
                  <FormSwitchThin
                    :model-value="field.value"
                    label="Make this project public"
                    color="primary"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                  <BaseParagraph size="xs" class="text-muted-400 mt-2 ps-8">
                    Public projects can be discovered by other users in your organization
                  </BaseParagraph>
                  <div v-if="errorMessage" class="text-danger-500 mt-1 text-xs">{{ errorMessage }}</div>
                </div>
              </Field>
            </div>
          </div>
          
          <!-- Form Errors -->
          <div v-if="Object.keys(errors).length > 0" class="rounded-lg bg-danger-50 p-4 dark:bg-danger-500/20">
            <h4 class="mb-2 font-medium text-danger-500">Please fix the following errors:</h4>
            <ul class="list-disc pl-5 text-sm text-danger-500">
              <li v-for="(error, key) in errors" :key="key">{{ error }}</li>
            </ul>
          </div>
          
          <!-- Submit Buttons -->
          <div class="flex justify-end gap-2 pt-4">
            <BaseButton
              type="button"
              color="muted"
              @click="resetForm"
            >
              Reset
            </BaseButton>
            <BaseButton
              type="submit"
              color="primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              <Icon v-if="!isSubmitting" name="ph:plus-circle-duotone" class="me-2 size-4" />
              <span>{{ isSubmitting ? 'Creating...' : 'Create Project' }}</span>
            </BaseButton>
          </div>
        </div>
      </form>
    </BaseCard>
  </div>
</template>
