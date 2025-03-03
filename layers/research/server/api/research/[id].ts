import { defineEventHandler, useFirebaseServer, createError, readBody, getRouterParam } from 'h3';
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
    
    // Get research ID from URL parameter
    const id = getRouterParam(event, 'id');
    if (!id) {
      throw createError({ statusCode: 400, message: 'Research ID is required' });
    }
    
    // Initialize Firebase and model
    const { firestore } = useFirebaseServer();
    const researchModel = new ResearchModel(firestore);
    
    // Handle different HTTP methods
    const method = event.method;
    
    switch (method) {
      case 'GET': {
        // Get research project details
        const research = await researchModel.getResearchById(id, userId, workspaceId);
        
        if (!research) {
          throw createError({ statusCode: 404, message: 'Research project not found' });
        }
        
        return { research };
      }
      
      case 'PUT': {
        // Update research project
        const body = await readBody(event);
        const research = await researchModel.updateResearch(id, body, userId, workspaceId);
        
        return { research };
      }
      
      case 'DELETE': {
        // Delete research project
        await researchModel.deleteResearch(id, userId, workspaceId);
        
        return { success: true };
      }
      
      default:
        throw createError({ statusCode: 405, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Research API error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    });
  }
});
