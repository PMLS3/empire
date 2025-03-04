import { getBookById, createBook, updateBook, deleteBook, searchBooksByVector, generateBookEmbeddings } from '../models/book.model';
import { getUserSession } from '../../../ai/server/utils/session';
import { useFirebaseServer } from '../../../auth/server/firebase/init';
import { defineEventHandler, readBody, getQuery, createError } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event);
    
    if (!session || !session.user || !session.currentWorkspace) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      });
    }

    const { firestore } = useFirebaseServer(session.user?.token?.idToken as string);
    
    const userId = session.user.id;
    const workspaceId = session.currentWorkspace.id || '';
    const method = event.method;
    const path = event.path;
    
    // Handle different endpoints
    if (method === 'POST' && path === '/api/books') {
      // Create new book
      const body = await readBody(event);
      const result = await createBook(
        event,
        body.book
      );
      return result;
    } else if (method === 'GET' && path.startsWith('/api/books/') && path.includes('/similar')) {
      // Find similar books
      const bookId = path.split('/')[3];
      const query = getQuery(event);
      const field = query.field as string || 'description';
      const limit = parseInt(query.limit as string) || 5;
      
      // Updated to match the function signature
      const result = await searchBooksByVector(
        event,
        field, // Using the field as the query string
        limit
      );
      return result;
    } else if (method === 'POST' && path === '/api/vectors/search') {
      // Semantic search
      const body = await readBody(event);
      
      // Updated to match the function signature
      const result = await searchBooksByVector(
        event,
        body.query,
        body.limit || 10
      );
      return result;
    } else if (method === 'POST' && path === '/api/vectors/cluster') {
      // Cluster books
      const body = await readBody(event);
      
      // This is not supported directly by our searchBooksByVector function
      // We need to handle this differently or implement a new function
      throw createError({
        statusCode: 501,
        statusMessage: 'Clustering not implemented yet'
      });
    } else if (method === 'POST' && path === '/api/embeddings') {
      // Generate embeddings
      const body = await readBody(event);
      const result = await generateBookEmbeddings(
        event,
        body.book_id,
        body.fields || ['description'],
        body.provider,
        body.model
      );
      return result;
    } else if (method === 'POST' && path === '/api/vectors/bulk-generate') {
      // Bulk generate embeddings - this isn't directly supported by our current functions
      // We would need to implement a new function or iterate through book_ids
      const body = await readBody(event);
      const results = [];
      
      // Process each book ID individually
      for (const bookId of body.book_ids) {
        try {
          const result = await generateBookEmbeddings(
            event,
            bookId,
            body.fields || ['description'],
            body.provider,
            body.model
          );
          results.push({ bookId, success: true, result });
        } catch (err) {
          results.push({ bookId, success: false, error: err instanceof Error ? err.message : 'Unknown error' });
        }
      }
      
      return { results };
    } else if (method === 'GET' && path.startsWith('/api/books/')) {
      // Get book by ID
      const bookId = path.split('/')[3];
      const result = await getBookById(event, bookId);
      
      if (!result) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Book not found'
        });
      }
      
      return result;
    } else if (method === 'PUT' && path.startsWith('/api/books/')) {
      // Update book
      const bookId = path.split('/')[3];
      const body = await readBody(event);
      const result = await updateBook(event, bookId, body);
      return result;
    } else if (method === 'DELETE' && path.startsWith('/api/books/')) {
      // Delete book
      const bookId = path.split('/')[3];
      await deleteBook(event, bookId);
      return { success: true };
    } else {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found'
      });
    }
  } catch (error: unknown) {
    console.error('Book API error:', error);
    
    throw createError({
      statusCode: error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500,
      statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
    });
  }
});
