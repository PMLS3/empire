import { defineEventHandler, createError, readBody, getRouterParam } from 'h3';
import { getUserSession } from '../../../../ai/server/utils/session';
import { getResearchProjectById, updateResearchProject, deleteResearchProject } from '../../models/research.model';
import { useFirebaseServer } from '../../../../auth/server/firebase/init'

export default defineEventHandler(async (event) => {
  try {
    // Get user session
    const session = await getUserSession(event);
    
    if (!session || !session.user || !session.currentWorkspace) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      });
    }

    const { firestore } = useFirebaseServer(session.user?.token?.idToken as string);
    
    // Get research ID from path parameter
    const id = getRouterParam(event, 'id');
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing research ID'
      });
    }
    
    const workspaceId = session.currentWorkspace.id || '';
    const method = event.method;
    
    // Handle different methods
    if (method === 'GET') {
      // Get research project by ID
      const result = await getResearchProjectById(event, id);
      
      if (!result) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Research project not found'
        });
      }
      
      return result;
    } else if (method === 'PUT') {
      // Update research project
      const body = await readBody(event);
      await updateResearchProject(event, id, body);
      
      // Return the updated research
      const updated = await getResearchProjectById(event, id);
      return updated;
    } else if (method === 'DELETE') {
      // Delete research project
      await deleteResearchProject(event, id);
      return { success: true };
    } else {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      });
    }
  } catch (error: unknown) {
    console.error('Research API error:', error);
    
    throw createError({
      statusCode: error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500,
      statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
    });
  }
});
