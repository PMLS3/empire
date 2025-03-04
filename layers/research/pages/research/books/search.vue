<script setup lang="ts">
import type { ExampleBook } from '../../../types/research';

definePageMeta({
  title: 'Vector Search',
});
useHead({
  title: 'Vector Search',
});

const { isAuthenticated, getCurrentWorkspaceId } = useAuth();
const toaster = useToaster();
const workspaceId = computed(() => getCurrentWorkspaceId.value || '');

// Search state
const searchResults = ref<ExampleBook[]>([]);
const loading = ref(false);
const error = ref(null);
const hasSearched = ref(false);

// Perform vector search
const performSearch = async (searchParams: {
  query: string;
  category?: string;
  limit: number;
  research_id?: string;
}) => {
  if (!isAuthenticated.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await $fetch('/api/vectors/search', {
      method: 'POST',
      body: searchParams,
    });
    
    searchResults.value = response as ExampleBook[];
    hasSearched.value = true;
  } catch (err) {
    console.error('Error performing vector search:', err);
    error.value = err.message || 'Failed to perform search';
    toaster.show({
      title: 'Error',
      message: error.value,
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
      closable: true,
    });
    
    searchResults.value = [];
  } finally {
    loading.value = false;
  }
};

// Handle book click
const navigateToBook = (book: ExampleBook) => {
  navigateTo(`/research/books/${book.id}`);
};
</script>

<template>
  <div class="space-y-6 pb-20 pt-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <BaseHeading tag="h1" size="xl" weight="semibold" class="text-muted-800 dark:text-white">
          Vector Search
        </BaseHeading>
        <BaseParagraph size="xs" class="text-muted-400">
          Search for books using natural language and vector similarity
        </BaseParagraph>
      </div>
    </div>
    
    <!-- Search form -->
    <VectorSearchForm :loading="loading" @search="performSearch" />
    
    <!-- Search results -->
    <div v-if="hasSearched">
      <BaseCard class="p-6">
        <!-- Results header -->
        <div class="mb-4 flex items-center justify-between">
          <BaseHeading tag="h2" size="lg" weight="medium" class="text-muted-800 dark:text-white">
            Search Results
          </BaseHeading>
          <BaseBadge v-if="searchResults.length > 0" color="info" rounded="full">
            {{ searchResults.length }} books found
          </BaseBadge>
        </div>
        
        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center py-10">
          <BaseButtonIcon
            size="lg"
            disabled
            shape="full"
            class="animate-spin text-primary-500"
          >
            <Icon name="line-md:loading-twotone-loop" class="size-6" />
          </BaseButtonIcon>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="py-10 text-center">
          <div class="mb-4 flex justify-center">
            <BaseIconBox
              size="lg"
              class="bg-danger-500/10 text-danger-500"
              shape="full"
              color="none"
            >
              <Icon name="ph:warning-circle-duotone" class="size-10" />
            </BaseIconBox>
          </div>
          <BaseHeading tag="h4" size="lg" weight="medium" class="text-danger-500">
            Search Error
          </BaseHeading>
          <BaseParagraph size="sm" class="text-muted-400 mt-2 max-w-md mx-auto">
            {{ error }}
          </BaseParagraph>
        </div>
        
        <!-- Empty results -->
        <div v-else-if="searchResults.length === 0" class="py-10 text-center">
          <div class="mb-4 flex justify-center">
            <BaseIconBox
              size="lg"
              class="bg-info-500/10 text-info-500"
              shape="full"
              color="none"
            >
              <Icon name="ph:magnifying-glass-duotone" class="size-10" />
            </BaseIconBox>
          </div>
          <BaseHeading tag="h4" size="lg" weight="medium" class="text-muted-800 dark:text-white">
            No Results Found
          </BaseHeading>
          <BaseParagraph size="sm" class="text-muted-400 mt-2 max-w-md mx-auto">
            Try adjusting your search query or filters to find more books.
          </BaseParagraph>
        </div>
        
        <!-- Results grid -->
        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div 
            v-for="book in searchResults" 
            :key="book.id" 
            class="relative cursor-pointer"
            @click="navigateToBook(book)"
          >
            <BookCard :book="book" />
            
            <!-- Similarity badge -->
            <div v-if="book.similarity_score !== undefined" 
              class="absolute -top-2 -right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-md z-10"
            >
              {{ Math.round(book.similarity_score * 100) }}% match
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
