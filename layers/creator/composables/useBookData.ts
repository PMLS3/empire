import { ref, computed } from 'vue';
import { useCreatorData } from './useCreatorData';
import type { Book, Page, Chapter, BookTemplate, ExportConfig } from '../types/book';

/**
 * Composable for managing book data using the existing data management endpoints
 */
export const useBookData = () => {
  const creatorData = useCreatorData();
  
  // Collection names for Firestore
  const COLLECTIONS = {
    BOOKS: 'books',
    BOOK_TEMPLATES: 'book_templates',
    BOOK_EXPORTS: 'book_exports'
  };

  // Book-specific state
  const books = ref<Book[]>([]);
  const currentBook = ref<Book | null>(null);
  const bookTemplates = ref<BookTemplate[]>([]);
  
  // Loading and error states
  const loading = computed(() => creatorData.loading.value);
  const error = computed(() => creatorData.error.value);

  /**
   * Fetch all books for the current workspace
   */
  const fetchBooks = async (filters = {}) => {
    const result = await creatorData.fetchData(COLLECTIONS.BOOKS, filters);
    books.value = creatorData.dataList.value as Book[];
    return books.value;
  };

  /**
   * Get a book by ID
   */
  const getBookById = async (id: string) => {
    const book = await creatorData.getDataById(COLLECTIONS.BOOKS, id);
    if (book) {
      currentBook.value = book as Book;
    }
    return currentBook.value;
  };

  /**
   * Create a new book
   */
  const createBook = async (bookData: Partial<Book>) => {
    // Fields to include in vector embeddings for semantic search
    const vectorFields = ['title', 'description', 'topic', 'keywords'];
    
    const result = await creatorData.createData(
      COLLECTIONS.BOOKS, 
      bookData, 
      vectorFields
    );
    
    if (result) {
      // Refresh the books list
      await fetchBooks();
    }
    
    return result;
  };

  /**
   * Update an existing book
   */
  const updateBook = async (id: string, bookData: Partial<Book>) => {
    const result = await creatorData.updateData(
      COLLECTIONS.BOOKS, 
      id, 
      bookData
    );
    
    if (result && currentBook.value?.id === id) {
      // Update the current book if it's the one being edited
      currentBook.value = { ...currentBook.value, ...bookData };
    }
    
    return result;
  };

  /**
   * Delete a book
   */
  const deleteBook = async (id: string) => {
    const result = await creatorData.deleteData(COLLECTIONS.BOOKS, id);
    
    if (result) {
      // Remove from the books list
      books.value = books.value.filter(book => book.id !== id);
      
      // Clear current book if it's the one being deleted
      if (currentBook.value?.id === id) {
        currentBook.value = null;
      }
    }
    
    return result;
  };

  /**
   * Add a page to a book
   */
  const addPage = async (bookId: string, page: Page) => {
    // Get the current book
    const book = await getBookById(bookId);
    if (!book) return null;
    
    // Initialize pages array if it doesn't exist
    const pages = book.pages || [];
    
    // Add the new page
    pages.push(page);
    
    // Update the book with the new pages array
    return updateBook(bookId, { pages });
  };

  /**
   * Update a page in a book
   */
  const updatePage = async (bookId: string, pageId: string, pageData: Partial<Page>) => {
    // Get the current book
    const book = await getBookById(bookId);
    if (!book || !book.pages) return null;
    
    // Find the page to update
    const pageIndex = book.pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return null;
    
    // Update the page
    book.pages[pageIndex] = { ...book.pages[pageIndex], ...pageData };
    
    // Update the book with the modified pages array
    return updateBook(bookId, { pages: book.pages });
  };

  /**
   * Delete a page from a book
   */
  const deletePage = async (bookId: string, pageId: string) => {
    // Get the current book
    const book = await getBookById(bookId);
    if (!book || !book.pages) return null;
    
    // Filter out the page to delete
    const updatedPages = book.pages.filter(p => p.id !== pageId);
    
    // Update the book with the filtered pages array
    return updateBook(bookId, { pages: updatedPages });
  };

  /**
   * Add a chapter to a book
   */
  const addChapter = async (bookId: string, chapter: Chapter) => {
    // Get the current book
    const book = await getBookById(bookId);
    if (!book) return null;
    
    // Initialize chapters array if it doesn't exist
    const chapters = book.chapters || [];
    
    // Add the new chapter
    chapters.push(chapter);
    
    // Update the book with the new chapters array
    return updateBook(bookId, { chapters });
  };

  /**
   * Update a chapter in a book
   */
  const updateChapter = async (bookId: string, chapterId: string, chapterData: Partial<Chapter>) => {
    // Get the current book
    const book = await getBookById(bookId);
    if (!book || !book.chapters) return null;
    
    // Find the chapter to update
    const chapterIndex = book.chapters.findIndex(c => c.id === chapterId);
    if (chapterIndex === -1) return null;
    
    // Update the chapter
    book.chapters[chapterIndex] = { ...book.chapters[chapterIndex], ...chapterData };
    
    // Update the book with the modified chapters array
    return updateBook(bookId, { chapters: book.chapters });
  };

  /**
   * Delete a chapter from a book
   */
  const deleteChapter = async (bookId: string, chapterId: string) => {
    // Get the current book
    const book = await getBookById(bookId);
    if (!book || !book.chapters) return null;
    
    // Filter out the chapter to delete
    const updatedChapters = book.chapters.filter(c => c.id !== chapterId);
    
    // Update the book with the filtered chapters array
    return updateBook(bookId, { chapters: updatedChapters });
  };

  /**
   * Fetch book templates
   */
  const fetchBookTemplates = async (filters = {}) => {
    const result = await creatorData.fetchData(COLLECTIONS.BOOK_TEMPLATES, filters);
    bookTemplates.value = creatorData.dataList.value as BookTemplate[];
    return bookTemplates.value;
  };

  /**
   * Create a book from a template
   */
  const createBookFromTemplate = async (templateId: string, bookData: Partial<Book>) => {
    // Get the template
    const template = await creatorData.getDataById(COLLECTIONS.BOOK_TEMPLATES, templateId);
    if (!template) return null;
    
    // Create a new book with template data and custom book data
    const newBookData: Partial<Book> = {
      ...bookData,
      pages: template.pages,
      size: template.default_size,
      book_type: template.book_type
    };
    
    return createBook(newBookData);
  };

  /**
   * Export a book with specified configuration
   */
  const exportBook = async (bookId: string, config: ExportConfig) => {
    // Get the book
    const book = await getBookById(bookId);
    if (!book) return null;
    
    // Create an export record
    const exportData = {
      book_id: bookId,
      book_title: book.title,
      config,
      status: 'pending'
    };
    
    // Save the export record
    const exportId = await creatorData.createData(COLLECTIONS.BOOK_EXPORTS, exportData);
    
    // In a real implementation, this would trigger a background process to generate the export
    // For now, we'll just return the export ID
    return exportId;
  };

  /**
   * Search for books by title, description, or content
   */
  const searchBooks = async (query: string, filters = {}) => {
    if (!query.trim()) return [];
    
    try {
      const results = await creatorData.searchByVector(
        COLLECTIONS.BOOKS,
        query,
        { filters }
      );
      
      return results as Book[];
    } catch (err) {
      console.error('Error searching books:', err);
      return [];
    }
  };

  return {
    // State
    books,
    currentBook,
    bookTemplates,
    loading,
    error,
    
    // Book operations
    fetchBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    searchBooks,
    
    // Page operations
    addPage,
    updatePage,
    deletePage,
    
    // Chapter operations
    addChapter,
    updateChapter,
    deleteChapter,
    
    // Template operations
    fetchBookTemplates,
    createBookFromTemplate,
    
    // Export operations
    exportBook
  };
};
