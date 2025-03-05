import { ref } from 'vue';
import type { ExampleBook } from '../types/research';
import { useAuth } from '../../auth/composables/auth';
import { useToaster } from '../../shared/composables/toaster';

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

  const bookCategories = useState<any[]>('bookCategories', () => [
    {
      name: 'Arts & Photography',
      value: 'arts-photography',
      date: 'Oct 31, 2022',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'tabler:trekking',
    },
    {
      name: 'Biographies & Memoirs',
      value: 'biographies-memoirs',
      date: 'Nov 14, 2022',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'map:rafting',
    },
    {
      name: 'Business & Money',
      value: 'business-money',
      date: 'Dec 3, 2022',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'map:climbing',
    },
    {
      name: 'Children\'s Books',
      value: 'childrens-books',
      date: 'Dec 17, 2022',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'map:bicycle-store',
    },
    {
      name: 'Computers & Technology',
      value: 'computers-technology',
      date: 'Jan 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Cookbooks, Food & Wine',
      value: 'cookbooks-food-wine',
      date: 'Jan 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'History',
      value: 'history',
      date: 'Feb 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Health, Fitness & Dieting',
      value: 'health-fitness-dieting',
      date: 'Feb 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Literature & Fiction',
      value: 'literature-fiction',
      date: 'Mar 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Mystery, Thriller & Suspense',
      value: 'mystery-thriller-suspense',
      date: 'Mar 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Parenting & Relationships',
      value: 'parenting-relationships',
      date: 'Apr 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Reference',
      value: 'reference',
      date: 'Apr 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Religion & Spirituality',
      value: 'religion-spirituality',
      date: 'May 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Romance',
      value: 'romance',
      date: 'May 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Science Fiction & Fantasy',
      value: 'science-fiction-fantasy',
      date: 'Jun 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Sports & Outdoors',
      value: 'sports-outdoors',
      date: 'Jun 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Travel',
      value: 'travel',
      date: 'Jul 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Teens',
      value: 'teens',
      date: 'Jul 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Deals in Books',
      value: 'deals-in-books',
      date: 'Aug 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Crafts, Hobbies & Home',
      value: 'crafts-hobbies-home',
      date: 'Aug 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Science & Math',
      value: 'science-math',
      date: 'Sep 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Humor & Entertainment',
      value: 'humor-entertainment',
      date: 'Sep 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Engineering & Transportation',
      value: 'engineering-transportation',
      date: 'Oct 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Christian Books & Bibles',
      value: 'christian-books-bibles',
      date: 'Oct 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Lesbian, Gay, Bisexual & Transgender Books',
      value: 'lgbt-books',
      date: 'Nov 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'LGBTQ+ Books',
      value: 'lgbtq-books',
      date: 'Nov 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Law',
      value: 'law',
      date: 'Dec 2, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Teen & Young Adult',
      value: 'teen-young-adult',
      date: 'Dec 17, 2023',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Comics & Graphic Novels',
      value: 'comics-graphic-novels',
      date: 'Jan 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Politics & Social Sciences',
      value: 'politics-social-sciences',
      date: 'Jan 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Self-Help',
      value: 'self-help',
      date: 'Feb 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Education & Teaching',
      value: 'education-teaching',
      date: 'Feb 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Test Preparation',
      value: 'test-preparation',
      date: 'Mar 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Medical Books',
      value: 'medical-books',
      date: 'Mar 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Calendars',
      value: 'calendars',
      date: 'Apr 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Books on CD',
      value: 'books-on-cd',
      date: 'Apr 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Textbooks',
      value: 'textbooks',
      date: 'May 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Nonfiction',
      value: 'nonfiction',
      date: 'May 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Sports',
      value: 'sports',
      date: 'Jun 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Children\'s eBooks',
      value: 'childrens-ebooks',
      date: 'Jun 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Comics, Manga & Graphic Novels',
      value: 'comics-manga-graphic-novels',
      date: 'Jul 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Children\'s Nonfiction',
      value: 'childrens-nonfiction',
      date: 'Jul 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Cooking, Food & Wine',
      value: 'cooking-food-wine',
      date: 'Aug 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'LGBTQ+ eBooks',
      value: 'lgbtq-ebooks',
      date: 'Aug 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Medical eBooks',
      value: 'medical-ebooks',
      date: 'Sept 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Science',
      value: 'science',
      date: 'Sept 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Literary Criticism & Theory',
      value: 'literary-criticism-theory',
      date: 'Oct 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Education & Reference',
      value: 'education-reference',
      date: 'Oct 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'General',
      value: 'general',
      date: 'Nov 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Classics',
      value: 'classics',
      date: 'Nov 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Foreign Languages',
      value: 'foreign-languages',
      date: 'Dec 2, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Libros en español',
      value: 'libros-en-espanol',
      date: 'Dec 17, 2024',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Arts & Entertainment',
      value: 'arts-entertainment',
      date: 'Jan 2, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Home & Garden',
      value: 'home-garden',
      date: 'Jan 17, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Health & Wellness',
      value: 'health-wellness',
      date: 'Feb 2, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Business & Careers',
      value: 'business-careers',
      date: 'Feb 17, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Children\'s Audiobooks',
      value: 'childrens-audiobooks',
      date: 'Mar 2, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Education & Learning',
      value: 'education-learning',
      date: 'Mar 17, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Fiction & Literature',
      value: 'fiction-literature',
      date: 'Apr 2, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'History & Biographies',
      value: 'history-biographies',
      date: 'Apr 17, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Mystery & Thrillers',
      value: 'mystery-thrillers',
      date: 'May 2, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Romance & Relationships',
      value: 'romance-relationships',
      date: 'May 17, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
    {
      name: 'Science Fiction & Fantasy',
      value: 'science-fiction-fantasy',
      date: 'Jun 2, 2025',
      image: '/img/illustrations/dashboards/hobbies/landscape-thumb-1.svg',
      icon: 'ic:twotone-category',
    },
  ]);
    
  
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
    bookCategories
  };
};
