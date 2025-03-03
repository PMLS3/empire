import { Firestore } from '@google-cloud/firestore';
import { ResearchModel } from '../models/research.model';
import { getUserSession } from '~/server/utils/session';

export default defineEventHandler(async (event) => {
  try {
    const firestore = new Firestore();
    const researchModel = new ResearchModel(firestore);
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
    
    // Handle collaborators endpoints
    if (method === 'GET' && path.match(/^\/api\/research\/\w+\/collaborators$/)) {
      // Get collaborators for a research project
      const researchId = path.split('/')[3];
      const collaborators = await researchModel.getCollaborators(researchId, userId, workspaceId);
      return collaborators;
      
    } else if (method === 'POST' && path.match(/^\/api\/research\/\w+\/collaborators$/)) {
      // Invite a collaborator
      const researchId = path.split('/')[3];
      const body = await readBody(event);
      
      if (!body.email || !body.role) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Email and role are required'
        });
      }
      
      // Role validation
      if (!['editor', 'viewer'].includes(body.role)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid role. Must be editor or viewer'
        });
      }
      
      const collaborator = await researchModel.inviteCollaborator(
        researchId,
        body.email,
        body.role,
        userId,
        workspaceId
      );
      
      return collaborator;
      
    } else if (method === 'PUT' && path.match(/^\/api\/research\/\w+\/collaborators\/\w+$/)) {
      // Update collaborator role (not implemented yet)
      throw createError({
        statusCode: 501,
        statusMessage: 'Not implemented yet'
      });
      
    } else if (method === 'DELETE' && path.match(/^\/api\/research\/\w+\/collaborators\/\w+$/)) {
      // Remove collaborator (not implemented yet)
      throw createError({
        statusCode: 501,
        statusMessage: 'Not implemented yet'
      });
      
    } else {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not found'
      });
    }
  } catch (error) {
    console.error('Collaborators API error:', error);
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Internal Server Error'
    });
  }
});
