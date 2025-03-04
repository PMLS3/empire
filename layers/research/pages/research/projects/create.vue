<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

definePageMeta({
  title: 'Create Research Project',
});
useHead({
  title: 'Create Research Project',
});

// Use research composable
const { createResearch } = useResearch();
const router = useRouter();

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
  status: 'in_progress',
  is_public: false,
};

// Use form
const { handleSubmit, isSubmitting, values, errors, resetForm } = useForm({
  validationSchema,
  initialValues,
});

// Toaster for notifications
const toaster = useToaster();

// Submit handler
const onSubmit = handleSubmit(async (formValues) => {
  try {
    // Call composable to create research project
    const response = await createResearch(formValues);
    
    if (response) {
      // Redirect to the new project
      router.push(`/research/projects/${response.id}`);
    }
  } catch (error) {
    console.error('Error creating research project:', error);
  }
});

// Category options
const mainCategoryOptions = [
  { value: 'fiction', label: 'Fiction' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'self-help', label: 'Self-Help' },
  { value: 'business', label: 'Business' },
  { value: 'technical', label: 'Technical' },
  { value: 'other', label: 'Other' },
];
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
            <BaseSelect
              v-model="values.main_category"
              :items="mainCategoryOptions"
              placeholder="Select a main category"
              :error="errors.main_category"
              shape="rounded"
              required
            />
          </div>
          
          <!-- Sub Category -->
          <div class="space-y-2">
            <BaseHeading tag="h3" size="sm" weight="medium" class="text-muted-800 dark:text-white">
              Subcategory
            </BaseHeading>
            <BaseParagraph size="xs" class="text-muted-400">
              Enter a specific subcategory or niche for your research
            </BaseParagraph>
            <BaseInput
              v-model="values.sub_category"
              placeholder="E.g., Romance, Thriller, Marketing, etc."
              :error="errors.sub_category"
              shape="rounded"
              required
            />
          </div>
          
          <!-- Description -->
          <div class="space-y-2">
            <BaseHeading tag="h3" size="sm" weight="medium" class="text-muted-800 dark:text-white">
              Description (Optional)
            </BaseHeading>
            <BaseParagraph size="xs" class="text-muted-400">
              Add a brief description to clarify the focus of your research
            </BaseParagraph>
            <BaseTextarea
              v-model="values.sub_category_description"
              placeholder="Enter a description of what you're researching..."
              :error="errors.sub_category_description"
              rows="3"
              shape="rounded"
            />
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
              <BaseRadio
                v-model="values.status"
                name="status"
                label="In Progress"
                color="info"
                value="in_progress"
              />
              <BaseRadio
                v-model="values.status"
                name="status"
                label="Completed"
                color="success"
                value="completed"
              />
            </div>
            
            <!-- Visibility -->
            <div class="space-y-2">
              <BaseHeading tag="h3" size="sm" weight="medium" class="text-muted-800 dark:text-white">
                Visibility
              </BaseHeading>
              <BaseParagraph size="xs" class="text-muted-400">
                Control who can discover your research project
              </BaseParagraph>
              <FormSwitch
                v-model="values.is_public"
                label="Make this project public"
                color="primary"
              />
              <BaseParagraph size="xs" class="text-muted-400 mt-2 ps-8">
                Public projects can be discovered by other users in your organization
              </BaseParagraph>
            </div>
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
