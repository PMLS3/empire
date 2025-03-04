import { createError } from 'h3'
import { EmbeddingsHandler } from '../../../ai/server/utils/embeddings';
import type { ExampleBook } from '../../types/research';
import { v4 as uuidv4 } from 'uuid'

// Define a type for API responses
interface ApiResponse<T> {
  statusCode?: number;
  data: T;
}

// Define filter type
interface QueryFilter {
  field: string;
  operator: string;
  value: any; // Using any for flexibility with different filter value types
}

/**
 * Get all books for a workspace or research project
 */
export async function getBooks(event: any, workspaceId: string, researchId?: string): Promise<ExampleBook[]> {
  try {
    console.log('[Book Model] Getting books for workspace:', workspaceId, 'research:', researchId)
    
    // Build filters for the read endpoint
    const filters: QueryFilter[] = [{ field: 'deleted_at', operator: '==', value: null }];
    
    // Add research_id filter if provided
    if (researchId) {
      filters.push({ field: 'research_id', operator: '==', value: researchId });
    }
    
    // Call the read endpoint
    const response = await $fetch<ApiResponse<ExampleBook[]>>('/api/data/read', {
      method: 'POST',
      body: {
        readType: 'query',
        collection: 'research_books',
        filters: filters
      }
    });
    
    return response.data || [];
  } catch (error: any) {
    console.error('[Book Model] Error getting books:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch books'
    })
  }
}

/**
 * Get a book by its ID
 */
export async function getBookById(event: any, id: string): Promise<ExampleBook | null> {
  try {
    console.log('[Book Model] Getting book by ID:', id)
    
    // Call the read endpoint with ID
    const response = await $fetch<ApiResponse<ExampleBook>>('/api/data/read', {
      method: 'POST',
      body: {
        readType: 'id',
        collection: 'research_books',
        id: id
      }
    });
    
    if (!response.data) {
      return null;
    }
    
    return response.data;
  } catch (error: any) {
    console.error('[Book Model] Error getting book:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch book'
    })
  }
}

/**
 * Create a new book
 */
export async function createBook(event: any, bookData: Partial<ExampleBook>): Promise<string> {
  try {
    console.log('[Book Model] Creating new book:', bookData)
    
    // Check for description field to generate embeddings
    if (bookData.description) {
      try {
        const embedHandler = new EmbeddingsHandler();
        const result = await embedHandler.getEmbedding(bookData.description);
        
        if (result.embedding && result.embedding.length > 0) {
          // Add vector embeddings to book data
          bookData.vector_embeddings = {
            description_embedding: result.embedding,
            provider: 'vertexai', // Default provider
            model: 'textembedding-gecko', // Default model
            dimensions: result.embedding.length,
            created_at: new Date()
          };
        }
      } catch (embedError) {
        console.error('Error generating embeddings:', embedError);
        // Continue without embeddings if there's an error
      }
    }
    
    // Call the write endpoint
    const response = await $fetch<ApiResponse<string>>('/api/data/write', {
      method: 'POST',
      body: {
        collection: 'research_books',
        ...bookData,
        comments: bookData.comments || [],
        likes: bookData.likes || [],
        dislikes: bookData.dislikes || []
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('[Book Model] Error creating book:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create book'
    })
  }
}

/**
 * Update an existing book
 */
export async function updateBook(event: any, id: string, bookData: Partial<ExampleBook>): Promise<void> {
  try {
    console.log('[Book Model] Updating book:', id, bookData)
    
    // Check if description was updated to regenerate embedding
    if (bookData.description) {
      // Get current book to check if description changed
      const currentBook = await getBookById(event, id);
      
      if (currentBook && bookData.description !== currentBook.description) {
        try {
          const embedHandler = new EmbeddingsHandler();
          const result = await embedHandler.getEmbedding(bookData.description);
          
          if (result.embedding && result.embedding.length > 0) {
            // Add updated vector embeddings
            if (!bookData.vector_embeddings) {
              bookData.vector_embeddings = currentBook.vector_embeddings || {
                provider: 'vertexai',
                model: 'textembedding-gecko',
                dimensions: result.embedding.length,
                created_at: new Date()
              };
            }
            
            // Set the description embedding
            if (bookData.vector_embeddings) {
              bookData.vector_embeddings.description_embedding = result.embedding;
              bookData.vector_embeddings.dimensions = result.embedding.length;
              // Don't add updated_at to vector_embeddings as it's not in the type
            }
          }
        } catch (embedError) {
          console.error('Error updating embeddings:', embedError);
          // Continue without updating embeddings if there's an error
        }
      }
    }
    
    // Call the update endpoint
    await $fetch<ApiResponse<void>>('/api/data/update', {
      method: 'POST',
      body: {
        collection: 'research_books',
        id: id,
        ...bookData
      }
    });
  } catch (error: any) {
    console.error('[Book Model] Error updating book:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update book'
    })
  }
}

/**
 * Delete a book
 */
export async function deleteBook(event: any, id: string): Promise<void> {
  try {
    console.log('[Book Model] Deleting book:', id)
    
    // Call the delete endpoint
    await $fetch<ApiResponse<void>>('/api/data/delete', {
      method: 'POST',
      body: {
        collection: 'research_books',
        id: id
      }
    });
  } catch (error: any) {
    console.error('[Book Model] Error deleting book:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete book'
    })
  }
}

/**
 * Search books by vector similarity
 */
export async function searchBooksByVector(event: any, query: string, limit: number = 10): Promise<ExampleBook[]> {
  try {
    console.log('[Book Model] Searching books by vector:', query, limit)
    
    // Generate embedding for the search query
    let embedding: number[] = [];
    try {
      const embedHandler = new EmbeddingsHandler();
      const result = await embedHandler.getEmbedding(query);
      
      if (result.embedding && result.embedding.length > 0) {
        embedding = result.embedding;
      }
    } catch (embedError) {
      console.error('Error generating search embeddings:', embedError);
    }
    
    // If we have embeddings, call the vector search endpoint
    if (embedding.length > 0) {
      const response = await $fetch<ApiResponse<ExampleBook[]>>('/api/data/read', {
        method: 'POST',
        body: {
          readType: 'vector',
          collection: 'research_books',
          vectorField: 'vector_embeddings.description_embedding',
          queryVector: embedding,
          limit: limit,
          distanceMeasure: 'COSINE'
        }
      });
      
      return response.data || [];
    }
    
    // Fallback to regular search if embedding generation failed
    const response = await $fetch<ApiResponse<ExampleBook[]>>('/api/data/read', {
      method: 'POST',
      body: {
        readType: 'query',
        collection: 'research_books',
        filters: [
          { field: 'deleted_at', operator: '==', value: null }
        ]
      }
    });
    
    // Filter manually and limit results
    const books = response.data || [];
    const filteredBooks = books.filter(book => 
      (book.title?.toLowerCase().includes(query.toLowerCase()) || 
      book.description?.toLowerCase().includes(query.toLowerCase())) ?? false
    );
    
    return filteredBooks.slice(0, limit);
  } catch (error: any) {
    console.error('[Book Model] Error searching books by vector:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to search books'
    })
  }
}

/**
 * Generate or update embeddings for an existing book
 */
export async function generateBookEmbeddings(
  event: any,
  bookId: string,
  fields: string[] = ['description'],
  provider?: string,
  model?: string
): Promise<ExampleBook> {
  try {
    // Get the book
    const book = await getBookById(event, bookId);
    
    if (!book) {
      throw new Error('Book not found');
    }
    
    const now = new Date();
    let embeddings = book.vector_embeddings || {};
    const embeddingUpdates: {vector_embeddings?: any} = {};
    
    // Create embedding handler with custom provider/model if specified
    const config: any = {};
    if (provider) config.provider = provider;
    if (model) config.model = model;
    
    const embedHandler = new EmbeddingsHandler(config);
    
    // Generate embeddings for each requested field
    for (const field of fields) {
      // Type-safe way to check if the field exists on the book
      const fieldValue = getFieldValue(book, field);
      
      if (!fieldValue) {
        console.warn(`Field ${field} not available for embedding in book ${bookId}`);
        continue;
      }
      
      try {
        const result = await embedHandler.getEmbedding(fieldValue);
        
        if (result.embedding && result.embedding.length > 0) {
          // Set embedding field name (e.g., "title_embedding")
          const embeddingField = `${field}_embedding`;
          
          // Store embedding info
          if (!embeddingUpdates.vector_embeddings) {
            embeddingUpdates.vector_embeddings = {...embeddings};
          }
          
          if (embeddingUpdates.vector_embeddings) {
            embeddingUpdates.vector_embeddings[embeddingField] = result.embedding;
            embeddingUpdates.vector_embeddings.provider = provider || 'vertexai';
            embeddingUpdates.vector_embeddings.model = model || 'textembedding-gecko';
            embeddingUpdates.vector_embeddings.dimensions = result.embedding.length;
            embeddingUpdates.vector_embeddings.created_at = now;
          }
        }
      } catch (error) {
        console.error(`Error generating embedding for field ${field}:`, error);
      }
    }
    
    // Update the book with new embeddings if any were generated
    if (Object.keys(embeddingUpdates).length > 0) {
      await updateBook(event, bookId, embeddingUpdates);
      
      // Get the updated book
      const updatedBook = await getBookById(event, bookId);
      if (!updatedBook) {
        throw new Error('Failed to retrieve updated book');
      }
      return updatedBook;
    }
    
    return book;
  } catch (error: any) {
    console.error('[Book Model] Error generating book embeddings:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to generate embeddings'
    });
  }
}

/**
 * Helper function to safely get a field value from an object
 */
function getFieldValue(obj: any, field: string): string | undefined {
  if (obj && typeof obj === 'object' && field in obj) {
    const value = obj[field];
    return typeof value === 'string' ? value : undefined;
  }
  return undefined;
}
