import { defineEventHandler, useFirebaseServer, createError, readBody, getQuery } from 'h3';
import { getUserSession } from '~/server/utils/session';
import { BookModel } from '../../models/book.model';

export default defineEventHandler(async (event) => {
  try {
    // Get user session and validate
    const session = await getUserSession(event);
    if (!session || !session.user?.id || !session.currentWorkspace?.id) {
      throw createError({ statusCode: 401, message: 'Unauthorized' });
    }
    
    const userId = session.user.id;
    const workspaceId = session.currentWorkspace.id;
    
    // Initialize Firebase and model
    const { firestore } = useFirebaseServer();
    const bookModel = new BookModel(firestore);
    
    // Handle different HTTP methods
    const method = event.method;
    
    switch (method) {
      case 'POST': {
        // Create a new example book
        const body = await readBody(event);
        
        if (!body.title) {
          throw createError({ statusCode: 400, message: 'Book title is required' });
        }
        
        if (!body.research_id) {
          throw createError({ statusCode: 400, message: 'Research ID is required' });
        }
        
        const book = await bookModel.createExampleBook(body, body.research_id, userId, workspaceId);
        return { book };
      }
      
      default:
        throw createError({ statusCode: 405, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Books API error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    });
  }
});
