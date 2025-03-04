import { ref } from 'vue';
import type { ExampleBook } from '../types/research';

export const useBook = () => {
  const { isAuthenticated } = useAuth();
  const toaster = useToaster();
  
  const books = ref<ExampleBook[]>([]);
  const currentBook = ref<ExampleBook | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Get a book by ID
  const getBookById = async (id: string) => {
    if (!isAuthenticated.value || !id) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch(`/api/books/${id}`);
      currentBook.value = response as ExampleBook;
      return currentBook.value;
    } catch (err) {
      console.error(`Error fetching book ${id}:`, err);
      error.value = err.message || 'Failed to load book';
      toaster.show({
        title: 'Error',
        message: error.value,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  // Create a new example book
  const createBook = async (bookData: Partial<ExampleBook>, researchId: string) => {
    if (!isAuthenticated.value) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch('/api/books', {
        method: 'POST',
        body: {
          book: bookData,
          research_id: researchId,
        },
      });
      
      toaster.show({
        title: 'Success',
        message: 'Book created successfully!',
        color: 'success',
        icon: 'ph:check-circle-duotone',
        closable: true,
      });
      
      return response as ExampleBook;
    } catch (err) {
      console.error('Error creating book:', err);
      error.value = err.message || 'Failed to create book';
      toaster.show({
        title: 'Error',
        message: error.value,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  // Update an existing book
  const updateBook = async (id: string, data: Partial<ExampleBook>) => {
    if (!isAuthenticated.value || !id) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch(`/api/books/${id}`, {
        method: 'PUT',
        body: data,
      });
      
      // Update current book if it's the one being edited
      if (currentBook.value?.id === id) {
        currentBook.value = response as ExampleBook;
      }
      
      toaster.show({
        title: 'Success',
        message: 'Book updated successfully!',
        color: 'success',
        icon: 'ph:check-circle-duotone',
        closable: true,
      });
      
      return response as ExampleBook;
    } catch (err) {
      console.error(`Error updating book ${id}:`, err);
      error.value = err.message || 'Failed to update book';
      toaster.show({
        title: 'Error',
        message: error.value,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  // Delete a book
  const deleteBook = async (id: string) => {
    if (!isAuthenticated.value || !id) return false;
    
    loading.value = true;
    error.value = null;
    
    try {
      await $fetch(`/api/books/${id}`, {
        method: 'DELETE',
      });
      
      // Remove from list if it's in there
      books.value = books.value.filter(b => b.id !== id);
      
      // Clear current book if it's the one being deleted
      if (currentBook.value?.id === id) {
        currentBook.value = null;
      }
      
      toaster.show({
        title: 'Success',
        message: 'Book deleted successfully!',
        color: 'success',
        icon: 'ph:check-circle-duotone',
        closable: true,
      });
      
      return true;
    } catch (err) {
      console.error(`Error deleting book ${id}:`, err);
      error.value = err.message || 'Failed to delete book';
      toaster.show({
        title: 'Error',
        message: error.value,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  // Find similar books
  const findSimilarBooks = async (bookId: string, field: string = 'description', limit: number = 5) => {
    if (!isAuthenticated.value || !bookId) return [];
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch(`/api/books/${bookId}/similar?field=${field}&limit=${limit}`);
      return response as ExampleBook[];
    } catch (err) {
      console.error(`Error finding similar books to ${bookId}:`, err);
      error.value = err.message || 'Failed to find similar books';
      toaster.show({
        title: 'Error',
        message: error.value,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  // Semantic search for books
  const semanticSearch = async (query: string, category?: string, limit: number = 10, researchId?: string) => {
    if (!isAuthenticated.value || !query) return [];
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch('/api/vectors/search', {
        method: 'POST',
        body: {
          query,
          category,
          limit,
          research_id: researchId,
        },
      });
      
      return response as ExampleBook[];
    } catch (err) {
      console.error('Error performing semantic search:', err);
      error.value = err.message || 'Failed to perform search';
      toaster.show({
        title: 'Error',
        message: error.value,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  // Generate embeddings for a book
  const generateEmbeddings = async (bookId: string, fields: string[] = ['description']) => {
    if (!isAuthenticated.value || !bookId) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch('/api/embeddings', {
        method: 'POST',
        body: {
          book_id: bookId,
          fields,
        },
      });
      
      toaster.show({
        title: 'Success',
        message: 'Embeddings generated successfully!',
        color: 'success',
        icon: 'ph:cube-duotone',
        closable: true,
      });
      
      return response as ExampleBook;
    } catch (err) {
      console.error(`Error generating embeddings for book ${bookId}:`, err);
      error.value = err.message || 'Failed to generate embeddings';
      toaster.show({
        title: 'Error',
        message: error.value,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  // Cluster books by similarity
  const clusterBooks = async (researchId: string, field: string = 'description', numClusters: number = 3) => {
    if (!isAuthenticated.value || !researchId) return [];
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch('/api/vectors/cluster', {
        method: 'POST',
        body: {
          research_id: researchId,
          field,
          num_clusters: numClusters,
        },
      });
      
      return response as Array<{ cluster_id: number, books: ExampleBook[] }>;
    } catch (err) {
      console.error(`Error clustering books for research ${researchId}:`, err);
      error.value = err.message || 'Failed to cluster books';
      toaster.show({
        title: 'Error',
        message: error.value,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  // Scrape book data from Amazon
  const scrapeBookFromAmazon = async (urls: string[], prompt?: string) => {
    if (!isAuthenticated.value || !urls.length) return [];
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch('/api/scrape', {
        method: 'POST',
        body: {
          urls,
          prompt,
        },
      });
      
      toaster.show({
        title: 'Success',
        message: `${urls.length} books scraped successfully!`,
        color: 'success',
        icon: 'ph:check-circle-duotone',
        closable: true,
      });
      
      return response as ExampleBook[];
    } catch (err) {
      console.error('Error scraping books:', err);
      error.value = err.message || 'Failed to scrape books';
      toaster.show({
        title: 'Error',
        message: error.value,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  return {
    books,
    currentBook,
    loading,
    error,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    findSimilarBooks,
    semanticSearch,
    generateEmbeddings,
    clusterBooks,
    scrapeBookFromAmazon,
  };
};
