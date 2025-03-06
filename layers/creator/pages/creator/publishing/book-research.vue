<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useResearch } from '~/composables/useResearch';
import { usePublishing } from '~/composables/usePublishing';
import { useRoute } from 'vue-router';

const route = useRoute();
const { research, loadResearch } = useResearch();
const { bookCategories } = usePublishing();

// Get research ID from route query parameter
const researchId = computed(() => {
  return route.query.id as string || '';
});

// Load research if ID is provided
onMounted(async () => {
  if (researchId.value) {
    await loadResearch(researchId.value);
  }
});

// Determine page title based on research state
const pageTitle = computed(() => {
  if (research.value?.id) {
    return `Book Research: ${research.value.main_category}${research.value.sub_category ? ` - ${research.value.sub_category}` : ''}`;
  }
  return 'Book Research';
});
</script>

<template>
  <div>
    <ContentWrapper>
      <template #left>
        <BaseHeading as="h1" size="2xl" class="mb-1">{{ pageTitle }}</BaseHeading>
        <BaseParagraph size="sm" class="text-muted-400">
          Research and analyze books to create successful publications
        </BaseParagraph>
      </template>
      <template #right>
        <BaseButton to="/publishing/research" color="muted" flavor="pastel" class="mr-2">
          <Icon name="lucide:arrow-left" class="h-4 w-4 mr-1" />
          Back to Research
        </BaseButton>
      </template>

      <div class="grid grid-cols-12 gap-4 mt-6">
        <!-- Main content area -->
        <div class="col-span-12 lg:col-span-8">
          <BaseCard class="p-6">
            <ResearchBookResearchPanel :research-id="researchId" />
          </BaseCard>
        </div>

        <!-- Sidebar -->
        <div class="col-span-12 lg:col-span-4">
          <!-- Research Info -->
          <BaseCard v-if="research?.id" class="p-6 mb-4">
            <BaseHeading as="h3" size="lg" class="mb-4">Research Details</BaseHeading>
            
            <div class="space-y-4">
              <div>
                <div class="text-xs font-medium text-muted-400 mb-1">Category</div>
                <div class="font-medium">{{ research.main_category }}</div>
              </div>
              
              <div v-if="research.sub_category">
                <div class="text-xs font-medium text-muted-400 mb-1">Sub-category</div>
                <div class="font-medium">{{ research.sub_category }}</div>
              </div>
              
              <div>
                <div class="text-xs font-medium text-muted-400 mb-1">Status</div>
                <BaseTag :color="research.status === 'complete' ? 'success' : 'info'">
                  {{ research.status === 'complete' ? 'Complete' : 'In Progress' }}
                </BaseTag>
              </div>
              
              <div>
                <div class="text-xs font-medium text-muted-400 mb-1">Created</div>
                <div class="font-medium">{{ new Date(research.created_at).toLocaleDateString() }}</div>
              </div>
            </div>
          </BaseCard>
          
          <!-- Tips -->
          <BaseCard class="p-6">
            <BaseHeading as="h3" size="lg" class="mb-4">Research Tips</BaseHeading>
            
            <div class="space-y-4">
              <div>
                <BaseHeading as="h4" size="sm" class="mb-1">Provide Book URLs</BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400">
                  Include URLs to successful books in your query to analyze what makes them work.
                </BaseParagraph>
              </div>
              
              <div>
                <BaseHeading as="h4" size="sm" class="mb-1">Be Specific</BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400">
                  Specify what aspects you want to analyze (titles, descriptions, pricing, etc.).
                </BaseParagraph>
              </div>
              
              <div>
                <BaseHeading as="h4" size="sm" class="mb-1">Provide Feedback</BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400">
                  When prompted, provide feedback to guide the analysis in the right direction.
                </BaseParagraph>
              </div>
              
              <div>
                <BaseHeading as="h4" size="sm" class="mb-1">Example Query</BaseHeading>
                <div class="bg-muted-100 dark:bg-muted-800 p-3 rounded-lg text-xs">
                  "Analyze these children's picture books to identify successful patterns in titles, descriptions, and pricing: [URL1] [URL2] [URL3]"
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </ContentWrapper>
  </div>
</template>
