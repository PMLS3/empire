<script setup lang="ts">
import type { ExampleBook } from '../../../types/research';

definePageMeta({
  title: 'Compare Books',
});
useHead({
  title: 'Compare Books',
});

const { isAuthenticated } = useAuth();
const toaster = useToaster();
const { researchProjects, loading: loadingProjects } = useResearch();

// Book data
const books = ref<ExampleBook[]>([]);
const selectedBooks = ref<ExampleBook[]>([]);
const loading = ref(true);
const error = ref(null);

// Selection state
const selectedProjectId = ref('');
const searchQuery = ref('');
const maxBooks = 4; // Maximum books to compare at once

// Computed properties
const canAddMore = computed(() => selectedBooks.value.length < maxBooks);
const filteredBooks = computed(() => {
  let result = [...books.value];
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(book => 
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  }
  
  // Remove already selected books
  const selectedIds = selectedBooks.value.map(book => book.id);
  result = result.filter(book => !selectedIds.includes(book.id));
  
  return result;
});

// Fetch books for a project
const fetchProjectBooks = async (projectId: string) => {
  if (!isAuthenticated.value || !projectId) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // In a real app, this would be an API call
    // For demo, let's create some mock books
    const mockBooks: ExampleBook[] = Array(8).fill(null).map((_, index) => ({
      id: `book-${index}`,
      book_id: projectId,
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

// Watch for project selection
watch(selectedProjectId, (newVal) => {
  if (newVal) {
    fetchProjectBooks(newVal);
  } else {
    books.value = [];
  }
});

// Action handlers
const addBookToComparison = (book: ExampleBook) => {
  if (selectedBooks.value.length < maxBooks) {
    selectedBooks.value.push(book);
  }
};

const removeBookFromComparison = (book: ExampleBook) => {
  selectedBooks.value = selectedBooks.value.filter(b => b.id !== book.id);
};

const clearComparison = () => {
  selectedBooks.value = [];
};

// Format price
const formatPrice = (price?: number) => {
  if (!price) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

// Format number
const formatNumber = (num?: number) => {
  if (!num && num !== 0) return 'N/A';
  return new Intl.NumberFormat('en-US').format(num);
};

// Get difference class
const getDifferenceClass = (values: any[]) => {
  // Return warning color class if values differ
  const uniqueValues = new Set(values.map(v => JSON.stringify(v)));
  return uniqueValues.size > 1 ? 'bg-warning-50 dark:bg-warning-900/20' : '';
};
</script>

<template>
  <div class="space-y-6 pb-20 pt-4">
    <!-- Header -->
    <div class="flex items-center mb-6">
      <NuxtLink 
        to="/research/books" 
        class="me-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted-100 dark:bg-muted-900 hover:bg-primary-500/20 hover:text-primary-500"
      >
        <Icon name="ph:arrow-left-duotone" class="size-5" />
      </NuxtLink>
      <div>
        <BaseHeading tag="h1" size="xl" weight="semibold" class="text-muted-800 dark:text-white">
          Compare Books
        </BaseHeading>
        <BaseParagraph size="xs" class="text-muted-400">
          Compare book details side by side to identify patterns and differences
        </BaseParagraph>
      </div>
    </div>
    
    <!-- Book Selection Panel -->
    <BaseCard class="p-6">
      <div class="flex flex-col md:flex-row gap-4 mb-4">
        <div class="flex-grow">
          <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-2">
            Select Books to Compare
          </BaseHeading>
          <BaseParagraph size="xs" class="text-muted-400">
            Choose up to {{ maxBooks }} books to compare side by side
          </BaseParagraph>
        </div>
        <div>
          <BaseButton
            color="danger"
            @click="clearComparison"
            :disabled="selectedBooks.length === 0"
          >
            <Icon name="ph:trash-duotone" class="me-2 size-4" />
            <span>Clear All</span>
          </BaseButton>
        </div>
      </div>
      
      <!-- Project selection -->
      <div class="mb-6">
        <BaseSelect
          v-model="selectedProjectId"
          :items="[
            { value: '', label: 'Select a Research Project' },
            ...researchProjects.map(p => ({ value: p.id, label: `${p.main_category}: ${p.sub_category}` }))
          ]"
          placeholder="Select a research project"
          shape="rounded"
          :loading="loadingProjects"
        />
      </div>
      
      <!-- Selected books cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div v-for="(book, index) in selectedBooks" :key="book.id" class="relative">
          <BaseCard class="p-3 h-full">
            <div class="absolute top-2 right-2">
              <BaseButtonIcon
                size="xs"
                shape="rounded"
                color="danger"
                @click="removeBookFromComparison(book)"
              >
                <Icon name="ph:x-duotone" class="size-4" />
              </BaseButtonIcon>
            </div>
            
            <div class="flex flex-col items-center">
              <!-- Book cover -->
              <div class="h-32 w-24 bg-muted-100 dark:bg-muted-800 rounded overflow-hidden mb-3">
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
              
              <!-- Book info -->
              <div class="text-center">
                <div class="font-medium text-muted-800 dark:text-white text-sm line-clamp-2">
                  {{ book.title }}
                </div>
                <div class="text-xs text-muted-400">
                  by {{ book.author }}
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
        
        <!-- Add more card -->
        <div v-if="canAddMore">
          <BaseCard class="p-3 h-full border-2 border-dashed border-muted-300 dark:border-muted-700">
            <div class="flex flex-col items-center justify-center h-full">
              <BaseIconBox
                size="lg"
                class="bg-primary-500/10 text-primary-500 mb-3"
                shape="rounded"
                color="none"
              >
                <Icon name="ph:plus-duotone" class="size-6" />
              </BaseIconBox>
              <div class="text-sm text-muted-400 text-center">
                Select a book below to add to comparison
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
      
      <!-- Available books search -->
      <div v-if="selectedProjectId">
        <div class="mb-4">
          <BaseInput
            v-model="searchQuery"
            icon="ph:magnifying-glass-duotone"
            placeholder="Search books by title or author..."
            shape="rounded"
          />
        </div>
        
        <!-- Available books list -->
        <BaseCard class="p-0 border border-muted-200 dark:border-muted-700">
          <div class="max-h-80 overflow-y-auto">
            <!-- Loading state -->
            <div v-if="loading" class="flex items-center justify-center p-6">
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
            <div v-else-if="error" class="text-center p-6">
              <BaseIconBox
                size="lg"
                class="bg-danger-500/10 text-danger-500 mx-auto mb-3"
                shape="full"
                color="none"
              >
                <Icon name="ph:warning-circle-duotone" class="size-6" />
              </BaseIconBox>
              <BaseHeading tag="h4" size="md" weight="medium" class="text-danger-500 mb-1">
                Error Loading Books
              </BaseHeading>
              <BaseParagraph size="xs" class="text-muted-400">
                {{ error }}
              </BaseParagraph>
            </div>
            
            <!-- Empty state -->
            <div v-else-if="books.length === 0" class="text-center p-6">
              <BaseIconBox
                size="lg"
                class="bg-info-500/10 text-info-500 mx-auto mb-3"
                shape="full"
                color="none"
              >
                <Icon name="ph:books-duotone" class="size-6" />
              </BaseIconBox>
              <BaseHeading tag="h4" size="md" weight="medium" class="text-muted-800 dark:text-white mb-1">
                No Books Available
              </BaseHeading>
              <BaseParagraph size="xs" class="text-muted-400">
                This research project doesn't have any books yet
              </BaseParagraph>
            </div>
            
            <!-- Books list -->
            <div v-else class="divide-y divide-muted-200 dark:divide-muted-700">
              <div v-if="filteredBooks.length === 0" class="p-6 text-center">
                <BaseParagraph size="sm" class="text-muted-400">
                  No matching books found
                </BaseParagraph>
              </div>
              
              <div
                v-for="book in filteredBooks"
                :key="book.id"
                class="p-3 hover:bg-muted-50 dark:hover:bg-muted-900 flex items-center cursor-pointer"
                @click="addBookToComparison(book)"
              >
                <!-- Book cover thumbnail -->
                <div class="h-16 w-12 bg-muted-100 dark:bg-muted-800 rounded overflow-hidden me-3">
                  <img 
                    v-if="book.cover" 
                    :src="book.cover" 
                    :alt="book.title"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="h-full w-full flex items-center justify-center">
                    <Icon name="ph:book-duotone" class="size-5 text-muted-300 dark:text-muted-600" />
                  </div>
                </div>
                
                <!-- Book info -->
                <div class="flex-grow min-w-0">
                  <div class="text-sm font-medium text-muted-800 dark:text-white">
                    {{ book.title }}
                  </div>
                  <div class="text-xs text-muted-400">
                    by {{ book.author }}
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                    <div class="text-xs text-muted-400">
                      <Icon name="ph:star-fill" class="text-yellow-400 size-3 me-1 inline-block" />
                      {{ book.bookbeam_data?.averageRating?.toFixed(1) || 'N/A' }}
                    </div>
                    <div class="text-xs text-muted-400">
                      {{ book.bookbeam_data?.reviewCount || 0 }} reviews
                    </div>
                  </div>
                </div>
                
                <!-- Add button -->
                <BaseButton
                  size="sm"
                  color="primary"
                  class="ms-2"
                  @click.stop="addBookToComparison(book)"
                >
                  <Icon name="ph:plus-duotone" class="size-4" />
                </BaseButton>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </BaseCard>
    
    <!-- Comparison Table -->
    <BaseCard v-if="selectedBooks.length >= 2" class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr>
            <th class="p-4 text-left bg-muted-100 dark:bg-muted-800 font-medium text-muted-700 dark:text-muted-200 rounded-tl-lg">
              Attribute
            </th>
            <th 
              v-for="(book, index) in selectedBooks" 
              :key="`header-${book.id}`"
              class="p-4 text-left bg-muted-100 dark:bg-muted-800 font-medium text-muted-700 dark:text-muted-200"
              :class="{ 'rounded-tr-lg': index === selectedBooks.length - 1 }"
            >
              Book {{ index + 1 }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Title -->
          <tr class="border-b border-muted-200 dark:border-muted-700">
            <td class="p-4 font-medium text-muted-700 dark:text-muted-200 bg-muted-50 dark:bg-muted-800/50">
              Title
            </td>
            <td 
              v-for="book in selectedBooks" 
              :key="`title-${book.id}`"
              class="p-4 text-muted-600 dark:text-muted-300"
              :class="getDifferenceClass(selectedBooks.map(b => b.title))"
            >
              {{ book.title }}
            </td>
          </tr>
          
          <!-- Author -->
          <tr class="border-b border-muted-200 dark:border-muted-700">
            <td class="p-4 font-medium text-muted-700 dark:text-muted-200 bg-muted-50 dark:bg-muted-800/50">
              Author
            </td>
            <td 
              v-for="book in selectedBooks" 
              :key="`author-${book.id}`"
              class="p-4 text-muted-600 dark:text-muted-300"
              :class="getDifferenceClass(selectedBooks.map(b => b.author))"
            >
              {{ book.author }}
            </td>
          </tr>
          
          <!-- Category -->
          <tr class="border-b border-muted-200 dark:border-muted-700">
            <td class="p-4 font-medium text-muted-700 dark:text-muted-200 bg-muted-50 dark:bg-muted-800/50">
              Category
            </td>
            <td 
              v-for="book in selectedBooks" 
              :key="`category-${book.id}`"
              class="p-4 text-muted-600 dark:text-muted-300"
              :class="getDifferenceClass(selectedBooks.map(b => b.category))"
            >
              <BaseBadge :color="book.category === 'fiction' ? 'info' : 'warning'" rounded="full" size="sm">
                {{ book.category }}
              </BaseBadge>
            </td>
          </tr>
          
          <!-- Rating -->
          <tr class="border-b border-muted-200 dark:border-muted-700">
            <td class="p-4 font-medium text-muted-700 dark:text-muted-200 bg-muted-50 dark:bg-muted-800/50">
              Rating
            </td>
            <td 
              v-for="book in selectedBooks" 
              :key="`rating-${book.id}`"
              class="p-4 text-muted-600 dark:text-muted-300"
              :class="getDifferenceClass(selectedBooks.map(b => b.bookbeam_data?.averageRating))"
            >
              <div class="flex items-center">
                <Icon name="ph:star-fill" class="text-yellow-400 size-4 me-1" />
                <span>{{ book.bookbeam_data?.averageRating?.toFixed(1) || 'N/A' }}</span>
              </div>
            </td>
          </tr>
          
          <!-- Reviews -->
          <tr class="border-b border-muted-200 dark:border-muted-700">
            <td class="p-4 font-medium text-muted-700 dark:text-muted-200 bg-muted-50 dark:bg-muted-800/50">
              Reviews
            </td>
            <td 
              v-for="book in selectedBooks" 
              :key="`reviews-${book.id}`"
              class="p-4 text-muted-600 dark:text-muted-300"
              :class="getDifferenceClass(selectedBooks.map(b => b.bookbeam_data?.reviewCount))"
            >
              {{ formatNumber(book.bookbeam_data?.reviewCount) }}
            </td>
          </tr>
          
          <!-- BSR Kindle -->
          <tr class="border-b border-muted-200 dark:border-muted-700">
            <td class="p-4 font-medium text-muted-700 dark:text-muted-200 bg-muted-50 dark:bg-muted-800/50">
              BSR (Kindle)
            </td>
            <td 
              v-for="book in selectedBooks" 
              :key="`bsr-kindle-${book.id}`"
              class="p-4 text-muted-600 dark:text-muted-300"
              :class="getDifferenceClass(selectedBooks.map(b => b.bsr?.kindle))"
            >
              {{ formatNumber(book.bsr?.kindle) }}
            </td>
          </tr>
          
          <!-- BSR Paperback -->
          <tr class="border-b border-muted-200 dark:border-muted-700">
            <td class="p-4 font-medium text-muted-700 dark:text-muted-200 bg-muted-50 dark:bg-muted-800/50">
              BSR (Paperback)
            </td>
            <td 
              v-for="book in selectedBooks" 
              :key="`bsr-paperback-${book.id}`"
              class="p-4 text-muted-600 dark:text-muted-300"
              :class="getDifferenceClass(selectedBooks.map(b => b.bsr?.paperback))"
            >
              {{ formatNumber(book.bsr?.paperback) }}
            </td>
          </tr>
          
          <!-- Estimated Sales -->
          <tr class="border-b border-muted-200 dark:border-muted-700">
            <td class="p-4 font-medium text-muted-700 dark:text-muted-200 bg-muted-50 dark:bg-muted-800/50">
              Estimated Sales
            </td>
            <td 
              v-for="book in selectedBooks" 
              :key="`sales-${book.id}`"
              class="p-4 text-muted-600 dark:text-muted-300"
              :class="getDifferenceClass(selectedBooks.map(b => b.bookbeam_data?.estimatedSales))"
            >
              {{ formatNumber(book.bookbeam_data?.estimatedSales) }}
            </td>
          </tr>
          
          <!-- Vector Embeddings -->
          <tr>
            <td class="p-4 font-medium text-muted-700 dark:text-muted-200 bg-muted-50 dark:bg-muted-800/50 rounded-bl-lg">
              Vector Embeddings
            </td>
            <td 
              v-for="(book, index) in selectedBooks" 
              :key="`vector-${book.id}`"
              class="p-4 text-muted-600 dark:text-muted-300"
              :class="[
                getDifferenceClass(selectedBooks.map(b => b.vector_embeddings ? true : false)),
                { 'rounded-br-lg': index === selectedBooks.length - 1 }
              ]"
            >
              <BaseBadge 
                :color="book.vector_embeddings ? 'success' : 'danger'" 
                rounded="full"
              >
                {{ book.vector_embeddings ? 'Available' : 'Not Available' }}
              </BaseBadge>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Legend -->
      <div class="mt-4 flex items-center gap-2">
        <div class="size-4 bg-warning-50 dark:bg-warning-900/20 rounded border border-warning-200 dark:border-warning-800"></div>
        <div class="text-xs text-muted-500 dark:text-muted-400">Highlights differences between books</div>
      </div>
    </BaseCard>
    
    <!-- Nothing to compare state -->
    <BaseCard v-else-if="selectedProjectId" class="p-10 text-center">
      <BaseIconBox
        size="xl"
        class="bg-info-500/10 text-info-500 mx-auto mb-4"
        shape="full"
        color="none"
      >
        <Icon name="ph:scales-duotone" class="size-8" />
      </BaseIconBox>
      <BaseHeading tag="h3" size="lg" weight="medium" class="text-muted-800 dark:text-white mb-2">
        Select Books to Compare
      </BaseHeading>
      <BaseParagraph size="sm" class="text-muted-400 max-w-md mx-auto">
        Please select at least two books from the list above to start comparing their details side by side.
      </BaseParagraph>
    </BaseCard>
    
    <!-- Project not selected -->
    <BaseCard v-else class="p-10 text-center">
      <BaseIconBox
        size="xl"
        class="bg-primary-500/10 text-primary-500 mx-auto mb-4"
        shape="full"
        color="none"
      >
        <Icon name="ph:folder-open-duotone" class="size-8" />
      </BaseIconBox>
      <BaseHeading tag="h3" size="lg" weight="medium" class="text-muted-800 dark:text-white mb-2">
        Select a Research Project
      </BaseHeading>
      <BaseParagraph size="sm" class="text-muted-400 max-w-md mx-auto">
        Please select a research project to view available books for comparison.
      </BaseParagraph>
    </BaseCard>
  </div>
</template>
