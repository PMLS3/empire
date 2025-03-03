import { defineEventHandler, useFirebaseServer, createError, readBody, getQuery } from 'h3';
import { getUserSession } from '~/server/utils/session';
import { ResearchModel } from '../../models/research.model';

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
    const researchModel = new ResearchModel(firestore);
    
    // Handle different HTTP methods
    const method = event.method;
    
    switch (method) {
      case 'GET': {
        // List research projects with optional filters
        const query = getQuery(event);
        const filters = {
          main_category: query.main_category as string,
          sub_category: query.sub_category as string,
          status: query.status as string
        };
        
        const research = await researchModel.listResearch(userId, workspaceId, filters);
        return { research };
      }
      
      case 'POST': {
        // Create a new research project
        const body = await readBody(event);
        
        if (!body.main_category) {
          throw createError({ 
            statusCode: 400, 
            message: 'Main category is required'
          });
        }
        
        const research = await researchModel.createResearch(body, userId, workspaceId);
        return { research };
      }
      
      default:
        throw createError({ 
          statusCode: 405, 
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    console.error('Research API error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    });
  }
});
