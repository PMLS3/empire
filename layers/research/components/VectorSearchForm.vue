<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

const props = defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits(['search']);

const { researchProjects, loading: loadingProjects } = useResearch();

// Form validation schema
const validationSchema = toTypedSchema(
  z.object({
    query: z.string().min(3, 'Query must be at least 3 characters'),
    category: z.string().optional(),
    research_id: z.string().optional(),
    limit: z.number().int().min(1).max(100).default(20),
  })
);

// Form state
const { handleSubmit, values, errors } = useForm({
  validationSchema,
  initialValues: {
    query: '',
    category: '',
    research_id: '',
    limit: 20,
  },
});

// Category options
const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'fiction', label: 'Fiction' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'self-help', label: 'Self-Help' },
  { value: 'business', label: 'Business' },
  { value: 'technical', label: 'Technical' },
];

// Limit options
const limitOptions = [
  { value: 10, label: '10 results' },
  { value: 20, label: '20 results' },
  { value: 50, label: '50 results' },
  { value: 100, label: '100 results' },
];

// Show advanced options
const showAdvanced = ref(false);

// Example queries
const exampleQueries = [
  'Books about personal growth through mindfulness',
  'Fantasy novels with strong female protagonists',
  'Business books on startup growth strategies',
  'Technical guides for machine learning in Python',
  'Self-help books focused on productivity habits',
];

// Submit form
const onSubmit = handleSubmit((values) => {
  emit('search', values);
});

// Use example query
const useExampleQuery = (query: string) => {
  values.query = query;
  onSubmit();
};
</script>

<template>
  <BaseCard class="p-6">
    <form @submit.prevent="onSubmit">
      <div class="space-y-6">
        <!-- Natural language query -->
        <div>
          <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-2">
            Natural Language Search
          </BaseHeading>
          <BaseParagraph size="xs" class="text-muted-400 mb-3">
            Describe what you're looking for in everyday language
          </BaseParagraph>
          <BaseInput
            v-model="values.query"
            placeholder="e.g., 'Fantasy books with strong female protagonists'"
            icon="ph:magnifying-glass-duotone"
            shape="rounded"
            :error="errors.query"
            :disabled="loading"
            required
          />
        </div>
        
        <!-- Advanced filters toggle -->
        <div>
          <div 
            class="flex items-center gap-2 cursor-pointer" 
            @click="showAdvanced = !showAdvanced"
          >
            <BaseHeading tag="h3" size="sm" weight="medium" class="text-muted-800 dark:text-white">
              Advanced Filters
            </BaseHeading>
            <Icon 
              :name="showAdvanced ? 'ph:caret-up-duotone' : 'ph:caret-down-duotone'" 
              class="size-4 text-muted-400"
            />
          </div>
          
          <!-- Advanced filters -->
          <div v-if="showAdvanced" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <!-- Category filter -->
            <div>
              <BaseHeading tag="h4" size="xs" weight="medium" class="mb-1 text-muted-700 dark:text-muted-200">
                Book Category
              </BaseHeading>
              <BaseSelect
                v-model="values.category"
                :items="categoryOptions"
                placeholder="All Categories"
                shape="rounded"
                :disabled="loading"
              />
            </div>
            
            <!-- Research project filter -->
            <div>
              <BaseHeading tag="h4" size="xs" weight="medium" class="mb-1 text-muted-700 dark:text-muted-200">
                Research Project
              </BaseHeading>
              <BaseSelect
                v-model="values.research_id"
                :items="[
                  { value: '', label: 'All Projects' },
                  ...researchProjects.map(p => ({ 
                    value: p.id, 
                    label: `${p.main_category}: ${p.sub_category}` 
                  }))
                ]"
                placeholder="All Research Projects"
                shape="rounded"
                :loading="loadingProjects"
                :disabled="loadingProjects || loading"
              />
            </div>
            
            <!-- Results limit -->
            <div>
              <BaseHeading tag="h4" size="xs" weight="medium" class="mb-1 text-muted-700 dark:text-muted-200">
                Results Limit
              </BaseHeading>
              <BaseSelect
                v-model="values.limit"
                :items="limitOptions"
                placeholder="20 results"
                shape="rounded"
                :disabled="loading"
              />
            </div>
          </div>
        </div>
        
        <!-- Search button -->
        <div class="flex justify-end">
          <BaseButton
            type="submit"
            color="primary"
            :loading="loading"
            :disabled="loading || !values.query"
          >
            <Icon v-if="!loading" name="ph:cube-duotone" class="me-2 size-4" />
            <span>{{ loading ? 'Searching...' : 'Vector Search' }}</span>
          </BaseButton>
        </div>
      </div>
    </form>
    
    <!-- Example queries -->
    <div class="mt-6 pt-6 border-t border-muted-200 dark:border-muted-700">
      <BaseHeading tag="h3" size="sm" weight="medium" class="text-muted-700 dark:text-muted-300 mb-3">
        Example Queries
      </BaseHeading>
      <div class="flex flex-wrap gap-2">
        <BaseTag
          v-for="(query, index) in exampleQueries"
          :key="index"
          :text="query"
          color="muted"
          @click="useExampleQuery(query)"
          role="button"
          class="cursor-pointer"
          shape="rounded"
        />
      </div>
    </div>
  </BaseCard>
</template>
