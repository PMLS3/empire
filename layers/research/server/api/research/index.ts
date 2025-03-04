import { defineEventHandler, createError, readBody, getQuery } from 'h3';
import { getUserSession } from '../../../../ai/server/utils/session';
import { getResearchProjects, createResearchProject } from '../../models/research.model';
import { useFirebaseServer } from '../../../../auth/server/firebase/init'

export default defineEventHandler(async (event) => {
  try {
    // Get user session
    const session = await getUserSession(event);
    
    console.log('[Research API] Session retrieved:', {
      hasUser: !!session?.user,
      hasWorkspace: !!session?.currentWorkspace,
      authenticated: !!session?.authenticated
    });
    
    if (!session || !session.user || !session.currentWorkspace) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: Missing session, user or workspace'
      });
    }

    // Store session in context for use in model functions
    event.context.session = session;

    const { firestore } = useFirebaseServer(session.user?.token?.idToken as string);
    
    const workspaceId = session.currentWorkspace.id || '';
    const method = event.method;
    
    console.log(`[Research API] Handling ${method} request with workspace ${workspaceId}`);
    
    // Handle different methods
    if (method === 'GET') {
      // Get all research projects for this workspace
      const query = getQuery(event);
      
      // Convert query parameters to filters
      const filters = {
        main_category: query.main_category as string,
        sub_category: query.sub_category as string,
        status: query.status as string,
        scope: query.scope as 'owned' | 'shared' | 'all'
      };
      
      console.log('[Research API] Getting projects with filters:', filters);
      
      // Get research projects
      const projects = await getResearchProjects(event, workspaceId);
      
      // Apply additional client-side filtering if needed
      let filteredProjects = projects;
      
      if (filters.main_category) {
        filteredProjects = filteredProjects.filter(p => p.main_category === filters.main_category);
      }
      
      if (filters.sub_category) {
        filteredProjects = filteredProjects.filter(p => p.sub_category === filters.sub_category);
      }
      
      if (filters.status) {
        filteredProjects = filteredProjects.filter(p => p.status === filters.status);
      }
      
      // Handle scope filtering
      if (filters.scope && filters.scope !== 'all') {
        if (filters.scope === 'owned') {
          filteredProjects = filteredProjects.filter(p => p.owner_id === session.user?.id);
        } else if (filters.scope === 'shared') {
          filteredProjects = filteredProjects.filter(p => p.owner_id !== session.user?.id);
        }
      }
      
      console.log(`[Research API] Returning ${filteredProjects.length} projects`);
      
      return { projects: filteredProjects };
    } else if (method === 'POST') {
      // Create new research project
      const body = await readBody(event);
      
      if (!body.main_category || !body.sub_category) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Missing required fields'
        });
      }
      
      console.log('[Research API] Creating new project:', body);
      
      // Create research project
      const id = await createResearchProject(event, body);
      
      console.log('[Research API] Created project with ID:', id);
      
      return { id };
    } else {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      });
    }
  } catch (error: unknown) {
    console.error('Research API error:', error);
    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: (error as any).cause
    } : error;
    console.error('[Research API] Error details:', errorDetails);
    
    throw createError({
      statusCode: error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500,
      statusMessage: error instanceof Error ? error.message : 'Internal Server Error'
    });
  }
});
