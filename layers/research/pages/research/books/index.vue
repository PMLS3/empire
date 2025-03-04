<script setup lang="ts">
import type { ExampleBook, CategoryResearch } from '../../../types/research';

definePageMeta({
  title: 'Book Collection',
});
useHead({
  title: 'Book Collection',
});

// Use research composable to get projects for filtering
const { researchProjects, loading: loadingProjects } = useResearch();

const { isAuthenticated } = useAuth();
const toaster = useToaster();

// Book data
const books = ref<ExampleBook[]>([]);
const loading = ref(true);
const error = ref(null);

// Filters
const selectedProject = ref('');
const selectedCategory = ref('');
const searchQuery = ref('');
const viewMode = ref('grid'); // grid or list

// Category options
const categoryOptions = computed(() => [
  { value: '', label: 'All Categories' },
  { value: 'fiction', label: 'Fiction' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'self-help', label: 'Self-Help' },
  { value: 'business', label: 'Business' },
  { value: 'technical', label: 'Technical' },
]);

// Filtered books
const filteredBooks = computed(() => {
  let result = [...books.value];
  
  // Filter by project
  if (selectedProject.value) {
    result = result.filter(book => book.book_id === selectedProject.value);
  }
  
  // Filter by category
  if (selectedCategory.value) {
    result = result.filter(book => book.category === selectedCategory.value);
  }
  
  // Search by title, author, or description
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(book => 
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      (book.description && book.description.toLowerCase().includes(query))
    );
  }
  
  return result;
});

// Fetch books
const fetchBooks = async () => {
  if (!isAuthenticated.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // In a real app, this would be an API call
    // For demo, let's create some mock books
    const mockBooks: ExampleBook[] = Array(12).fill(null).map((_, index) => ({
      id: `book-${index}`,
      book_id: index % 3 === 0 ? 'research-1' : (index % 3 === 1 ? 'research-2' : 'research-3'),
      title: `Example Book ${index + 1}`,
      subtitle: index % 2 === 0 ? `Subtitle for Book ${index + 1}` : undefined,
      description: `This is a description for book ${index + 1}. It contains sample text about the content of the book.`,
      author: `Author ${Math.floor(index / 3) + 1}`,
      link: `https://example.com/book-${index}`,
      cover: index % 4 === 0 ? undefined : `https://picsum.photos/seed/book-${index}/200/300`,
      category: index % 5 === 0 ? 'fiction' : (index % 5 === 1 ? 'non-fiction' : (index % 5 === 2 ? 'self-help' : (index % 5 === 3 ? 'business' : 'technical'))),
      bsr: {
        kindle: 10000 + Math.floor(Math.random() * 50000),
        paperback: 15000 + Math.floor(Math.random() * 60000),
      },
      bookbeam_data: {
        averageRating: 3.5 + Math.random() * 1.5,
        estimatedSales: 500 + Math.floor(Math.random() * 5000),
        reviewCount: 10 + Math.floor(Math.random() * 100),
      },
      vector_embeddings: index % 3 === 0 ? {
        description_embedding: Array(128).fill(0),
        provider: 'openai',
        model: 'text-embedding-3-small',
        dimensions: 128,
        created_at: new Date()
      } : undefined,
      comments: [],
      likes: [],
      dislikes: [],
      created_at: new Date(Date.now() - Math.random() * 10000000000),
      updated_at: new Date(),
    }));
    
    books.value = mockBooks;
  } catch (err) {
    console.error('Error fetching books:', err);
    error.value = err.message || 'Failed to load books';
    toaster.show({
      title: 'Error',
      message: error.value,
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
      closable: true,
    });
  } finally {
    loading.value = false;
  }
};

// Delete book
const deleteBook = async (bookId: string) => {
  toaster.show({
    title: 'Book Deleted',
    message: 'Book has been deleted successfully',
    color: 'success',
    icon: 'ph:check-circle-duotone',
    closable: true,
  });
  
  books.value = books.value.filter(book => book.id !== bookId);
};

// View book details
const viewBook = (book: ExampleBook) => {
  navigateTo(`/research/books/${book.id}`);
};

// Edit book
const editBook = (book: ExampleBook) => {
  navigateTo(`/research/books/${book.id}/edit`);
};

// Find similar books
const findSimilarBooks = (book: ExampleBook) => {
  navigateTo(`/research/books/${book.id}/similar`);
};

// Analyze book
const analyzeBook = (book: ExampleBook) => {
  navigateTo(`/research/books/${book.id}/analyze`);
};

// Watch for authentication state
watch(
  isAuthenticated,
  (newVal) => {
    if (newVal) {
      fetchBooks();
    } else {
      books.value = [];
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="space-y-6 pb-20 pt-4">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <BaseHeading tag="h1" size="xl" weight="semibold" class="text-muted-800 dark:text-white">
          Book Collection
        </BaseHeading>
        <BaseParagraph size="xs" class="text-muted-400">
          Browse and manage your book examples
        </BaseParagraph>
      </div>
      
      <!-- Actions -->
      <div class="flex gap-2 mt-4 md:mt-0">
        <BaseButton
          color="muted"
          :class="{ 'bg-muted-200 dark:bg-muted-700': viewMode === 'grid' }"
          @click="viewMode = 'grid'"
        >
          <Icon name="ph:grid-four-duotone" class="size-5" />
        </BaseButton>
        <BaseButton
          color="muted"
          :class="{ 'bg-muted-200 dark:bg-muted-700': viewMode === 'list' }"
          @click="viewMode = 'list'"
        >
          <Icon name="ph:list-bullets-duotone" class="size-5" />
        </BaseButton>
        <NuxtLink to="/research/books/scrape">
          <BaseButton color="primary">
            <Icon name="ph:plus-circle-duotone" class="me-2 size-4" />
            <span>Add Books</span>
          </BaseButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Filters -->
    <BaseCard class="p-5">
      <div class="flex flex-col md:flex-row gap-4">
        <BaseSelect
          v-model="selectedProject"
          :items="[
            { value: '', label: 'All Projects' },
            ...researchProjects.map(p => ({ value: p.id, label: `${p.main_category}: ${p.sub_category}` }))
          ]"
          placeholder="Filter by project"
          shape="rounded"
          :loading="loadingProjects"
          class="w-full md:w-auto"
        />
        <BaseSelect
          v-model="selectedCategory"
          :items="categoryOptions"
          placeholder="Filter by category"
          shape="rounded"
          class="w-full md:w-auto"
        />
        <div class="md:ms-auto">
          <BaseInput
            v-model="searchQuery"
            icon="ph:magnifying-glass-duotone"
            placeholder="Search books..."
            shape="rounded"
            class="w-full"
          />
        </div>
      </div>
    </BaseCard>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-20">
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
    <div v-else-if="error" class="py-20 text-center">
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
        Error Loading Books
      </BaseHeading>
      <BaseParagraph size="sm" class="text-muted-400 mt-2 max-w-md mx-auto">
        {{ error }}
      </BaseParagraph>
      <div class="mt-4">
        <BaseButton color="primary" @click="fetchBooks">
          <Icon name="ph:arrow-clockwise-duotone" class="me-2 size-4" />
          <span>Retry</span>
        </BaseButton>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="filteredBooks.length === 0" class="py-20 text-center">
      <div class="mb-4 flex justify-center">
        <BaseIconBox
          size="lg"
          class="bg-info-500/10 text-info-500"
          shape="full"
          color="none"
        >
          <Icon name="ph:book-open-duotone" class="size-10" />
        </BaseIconBox>
      </div>
      <BaseHeading tag="h4" size="lg" weight="medium" class="text-muted-800 dark:text-white">
        No Books Found
      </BaseHeading>
      <BaseParagraph size="sm" class="text-muted-400 mt-2 max-w-md mx-auto">
        {{ searchQuery || selectedCategory || selectedProject ? 'Try adjusting your search or filters' : 'Get started by adding books to your collection' }}
      </BaseParagraph>
      <div class="mt-4" v-if="!searchQuery && !selectedCategory && !selectedProject">
        <NuxtLink to="/research/books/scrape">
          <BaseButton color="primary">
            <Icon name="ph:plus-circle-duotone" class="me-2 size-4" />
            <span>Add Books</span>
          </BaseButton>
        </NuxtLink>
      </div>
    </div>
    
    <!-- Books grid -->
    <template v-else>
      <!-- Grid view -->
      <div v-if="viewMode === 'grid'" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div 
          v-for="book in filteredBooks" 
          :key="book.id" 
          class="relative"
        >
          <BookCard 
            :book="book" 
            :showActions="true"
            @view="viewBook"
            @edit="editBook"
            @delete="deleteBook"
            @analyze="analyzeBook"
            @find-similar="findSimilarBooks"
          />
        </div>
      </div>
      
      <!-- List view -->
      <BaseCard v-else>
        <div class="divide-y divide-muted-200 dark:divide-muted-700">
          <div
            v-for="book in filteredBooks"
            :key="book.id"
            class="p-4 hover:bg-muted-50 dark:hover:bg-muted-900 transition-colors duration-300"
          >
            <div class="flex gap-4">
              <!-- Cover image -->
              <div class="h-24 w-16 flex-shrink-0 bg-muted-100 dark:bg-muted-800 rounded overflow-hidden">
                <img 
                  v-if="book.cover" 
                  :src="book.cover" 
                  :alt="book.title"
                  class="h-full w-full object-cover"
                />
                <div v-else class="h-full w-full flex items-center justify-center">
                  <Icon name="ph:book-duotone" class="size-8 text-muted-300 dark:text-muted-600" />
                </div>
              </div>
              
              <!-- Book details -->
              <div class="flex-grow min-w-0">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <BaseHeading 
                      as="h3" 
                      size="md" 
                      weight="medium" 
                      lead="tight"
                      class="text-muted-800 dark:text-white"
                    >
                      {{ book.title }}
                    </BaseHeading>
                    <div class="text-sm text-muted-400">
                      By {{ book.author }}
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-1">
                    <BaseBadge color="info" rounded="full" size="sm">
                      {{ book.category }}
                    </BaseBadge>
                    <BaseBadge v-if="book.vector_embeddings" color="primary" rounded="full" size="sm">
                      <Icon name="ph:cube-duotone" class="me-1 size-3" />
                      <span>Vector</span>
                    </BaseBadge>
                  </div>
                </div>
                
                <!-- Description preview -->
                <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400 line-clamp-2 mt-1">
                  {{ book.description }}
                </BaseParagraph>
                
                <!-- Actions -->
                <div class="flex justify-end gap-2 mt-3">
                  <BaseButtonIcon
                    size="xs"
                    shape="rounded"
                    color="default"
                    @click="viewBook(book)"
                  >
                    <Icon name="ph:eye-duotone" class="size-4" />
                  </BaseButtonIcon>
                  
                  <BaseButtonIcon
                    size="xs"
                    shape="rounded"
                    color="default"
                    @click="editBook(book)"
                  >
                    <Icon name="ph:pencil-simple-duotone" class="size-4" />
                  </BaseButtonIcon>
                  
                  <BaseButtonIcon
                    size="xs"
                    shape="rounded"
                    color="primary"
                    @click="findSimilarBooks(book)"
                  >
                    <Icon name="ph:cube-duotone" class="size-4" />
                  </BaseButtonIcon>
                  
                  <BaseButtonIcon
                    size="xs"
                    shape="rounded"
                    color="info"
                    @click="analyzeBook(book)"
                  >
                    <Icon name="ph:brain-duotone" class="size-4" />
                  </BaseButtonIcon>
                  
                  <BaseButtonIcon
                    size="xs"
                    shape="rounded"
                    color="danger"
                    @click="deleteBook(book.id)"
                  >
                    <Icon name="ph:trash-duotone" class="size-4" />
                  </BaseButtonIcon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </template>
  </div>
</template>
