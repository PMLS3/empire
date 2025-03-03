import { Firestore } from '@google-cloud/firestore';
import { BookModel } from '../models/book.model';
import { getUserSession } from '~/server/utils/session';

export default defineEventHandler(async (event) => {
  try {
    const firestore = new Firestore();
    const bookModel = new BookModel(firestore);
    const session = await getUserSession(event);
    
    if (!session || !session.user || !session.workspace) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      });
    }
    
    const { userId, workspaceId } = session;
    const method = event.method;
    const path = event.path;
    
    // Handle different endpoints
    if (method === 'POST' && path === '/api/books') {
      // Create new book
      const body = await readBody(event);
      const result = await bookModel.createExampleBook(
        body.book,
        body.research_id,
        userId,
        workspaceId
      );
      return result;
    } else if (method === 'GET' && path.startsWith('/api/books/') && path.includes('/similar')) {
      // Find similar books
      const bookId = path.split('/')[3];
      const query = getQuery(event);
      const field = query.field as string || 'description';
      const limit = parseInt(query.limit as string) || 5;
      const minSimilarity = parseFloat(query.min_similarity as string) || 0.7;
      
      const result = await bookModel.findSimilarBooks(
        bookId,
        field,
        limit,
        minSimilarity,
        workspaceId
      );
      return result;
    } else if (method === 'POST' && path === '/api/vectors/search') {
      // Semantic search
      const body = await readBody(event);
      const result = await bookModel.semanticSearchBooks(
        body.query,
        body.category,
        body.limit || 10,
        body.research_id,
        workspaceId
      );
      return result;
    } else if (method === 'POST' && path === '/api/vectors/cluster') {
      // Cluster books
      const body = await readBody(event);
      const result = await bookModel.clusterBooks(
        body.research_id,
        body.field || 'description',
        body.num_clusters || 3,
        workspaceId
      );
      return result;
    } else if (method === 'POST' && path === '/api/embeddings') {
      // Generate embeddings
      const body = await readBody(event);
      const result = await bookModel.generateBookEmbeddings(
        body.book_id,
        body.fields || ['description'],
        body.provider,
        body.model,
        workspaceId
      );
      return result;
    } else if (method === 'POST' && path === '/api/vectors/bulk-generate') {
      // Bulk generate embeddings
      const body = await readBody(event);
      const result = await bookModel.batchGenerateEmbeddings(
        body.book_ids,
        body.fields || ['description'],
        body.provider,
        body.model,
        workspaceId
      );
      return result;
    } else if (method === 'GET' && path.startsWith('/api/books/')) {
      // Get book by ID
      const bookId = path.split('/')[3];
      const result = await bookModel.getExampleBookById(bookId, workspaceId);
      
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
      const result = await bookModel.updateExampleBook(bookId, body, workspaceId);
      return result;
    } else if (method === 'DELETE' && path.startsWith('/api/books/')) {
      // Delete book
      const bookId = path.split('/')[3];
      await bookModel.deleteExampleBook(bookId, workspaceId);
      return { success: true };
    } else {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found'
      });
    }
  } catch (error) {
    console.error('Book API error:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Internal Server Error'
    });
  }
});
