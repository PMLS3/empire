import { defineEventHandler, readBody, getQuery, createError } from 'h3';
import { addCollaborator, removeCollaborator, getCollaborators } from '../models/research.model';
import { getUserSession } from '../../../ai/server/utils/session';
import { useFirebaseServer } from '../../../auth/server/firebase/init';

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

    // Initialize Firestore
    const { firestore } = useFirebaseServer(session.user?.token?.idToken as string);
    
    // Extract user details
    const userId = session.user.id;
    const workspaceId = session.currentWorkspace.id || '';
    const method = event.method;
    const path = event.path;

    // Handle the different endpoints
    if (method === 'POST' && path === '/api/collaborators') {
      // Add collaborator
      const body = await readBody(event);
      
      if (!body.research_id || !body.email || !body.role) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Missing required fields'
        });
      }
      
      // Validate role
      if (!['editor', 'viewer'].includes(body.role)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid role. Must be "editor" or "viewer"'
        });
      }
      
      const result = await addCollaborator(
        event,
        body.research_id,
        body.email,
        body.role
      );
      
      return { id: result };
    } else if (method === 'DELETE' && path.startsWith('/api/collaborators/')) {
      // Remove collaborator
      const collaboratorId = path.split('/')[3];
      await removeCollaborator(event, collaboratorId);
      
      return { success: true };
    } else if (method === 'GET' && path === '/api/collaborators') {
      // Get collaborators for a research project
      const query = getQuery(event);
      
      if (!query.research_id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Missing research_id parameter'
        });
      }
      
      const result = await getCollaborators(event, query.research_id as string);
      return { collaborators: result };
    } else {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found'
      });
    }
  } catch (error: unknown) {
    console.error('Collaborators API error:', error);
    
    throw createError({
      statusCode: error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500,
      statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
    });
  }
});
