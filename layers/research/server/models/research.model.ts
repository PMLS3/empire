import { createError } from 'h3'
import type { CategoryResearch, ResearchCollaborator } from '../../types/research';
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
 * Get all research projects for a workspace
 */
export async function getResearchProjects(event: any, workspaceId: string): Promise<CategoryResearch[]> {
  try {
    console.log('[Research Model] Getting all research projects for workspace:', workspaceId)
    
    // Extract authentication token from session if available
    const session = event.context.session;
    const authToken = session?.user?.token?.idToken;
    
    console.log('[Research Model] Auth token available:', !!authToken);
    
    // Call the read endpoint with authentication headers
    const response = await $fetch<ApiResponse<CategoryResearch[]>>('/api/data/read', {
      method: 'POST',
      headers: {
        // Include authorization header if token is available
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: {
        readType: 'query',
        collection: 'research_projects',
        filters: [
          { field: 'workspace_id', operator: '==', value: workspaceId },
          { field: 'deleted_at', operator: '==', value: null }
        ]
      },
      // Add error handling options to get more details
      onResponseError: (error) => {
        console.error('[Research Model] Response error:', error.response?._data || error);
      }
    });
    
    return response.data || [];
  } catch (error: any) {
    console.error('[Research Model] Error getting research projects:', error);
    console.error('[Research Model] Error details:', {
      status: error.status || error.statusCode,
      message: error.message,
      data: error.data || error.response?._data,
    });
    
    throw createError({
      statusCode: error.statusCode || error.status || 500,
      message: error.message || 'Failed to fetch research projects'
    })
  }
}

/**
 * Get a research project by ID
 */
export async function getResearchProjectById(event: any, id: string): Promise<CategoryResearch | null> {
  try {
    console.log('[Research Model] Getting research project by ID:', id)
    
    // Call the read endpoint
    const response = await $fetch<ApiResponse<CategoryResearch>>('/api/data/read', {
      method: 'POST',
      body: {
        readType: 'id',
        collection: 'research_projects',
        id: id
      }
    });
    
    if (!response.data) {
      return null;
    }
    
    // Get collaborators for this research project
    const collaboratorsResponse = await $fetch<ApiResponse<ResearchCollaborator[]>>('/api/data/read', {
      method: 'POST',
      body: {
        readType: 'query',
        collection: 'research_collaborators',
        filters: [
          { field: 'research_id', operator: '==', value: id },
          { field: 'deleted_at', operator: '==', value: null }
        ]
      }
    });
    
    // Add collaborators to the research object
    const researchData = response.data;
    researchData.collaborators = collaboratorsResponse.data || [];
    
    return researchData;
  } catch (error: any) {
    console.error('[Research Model] Error getting research project:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch research project'
    })
  }
}

/**
 * Create a new research project
 */
export async function createResearchProject(event: any, researchData: Partial<CategoryResearch>): Promise<string> {
  try {
    console.log('[Research Model] Creating new research project:', researchData)
    
    // Call the write endpoint to create research project
    const response = await $fetch<ApiResponse<string>>('/api/data/write', {
      method: 'POST',
      body: {
        collection: 'research_projects',
        ...researchData
      }
    });
    
    const researchId = response.data;
    
    // Create the owner collaborator entry
    const session = event.context.session;
    
    if (session && session.user?.id) {
      const collaboratorData: Partial<ResearchCollaborator> = {
        research_id: researchId,
        user_id: session.user.id,
        role: 'owner',
        invitation_status: 'accepted',
      };
      
      await $fetch<ApiResponse<void>>('/api/data/write', {
        method: 'POST',
        body: {
          collection: 'research_collaborators',
          id: `${researchId}_${session.user.id}`,
          ...collaboratorData
        }
      });
    }
    
    return researchId;
  } catch (error: any) {
    console.error('[Research Model] Error creating research project:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create research project'
    })
  }
}

/**
 * Update a research project
 */
export async function updateResearchProject(event: any, id: string, researchData: Partial<CategoryResearch>): Promise<void> {
  try {
    console.log('[Research Model] Updating research project:', id, researchData)
    
    // Call the update endpoint
    await $fetch<ApiResponse<void>>('/api/data/update', {
      method: 'POST',
      body: {
        collection: 'research_projects',
        id: id,
        ...researchData
      }
    });
  } catch (error: any) {
    console.error('[Research Model] Error updating research project:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update research project'
    })
  }
}

/**
 * Delete a research project
 */
export async function deleteResearchProject(event: any, id: string): Promise<void> {
  try {
    console.log('[Research Model] Deleting research project:', id)
    
    // Call the delete endpoint for the research project
    await $fetch<ApiResponse<void>>('/api/data/delete', {
      method: 'POST',
      body: {
        collection: 'research_projects',
        id: id
      }
    });
    
    // Also get and delete all collaborators
    const collaboratorsResponse = await $fetch<ApiResponse<{id: string}[]>>('/api/data/read', {
      method: 'POST',
      body: {
        readType: 'query',
        collection: 'research_collaborators',
        filters: [
          { field: 'research_id', operator: '==', value: id }
        ]
      }
    });
    
    if (collaboratorsResponse.data && Array.isArray(collaboratorsResponse.data)) {
      const collaborators = collaboratorsResponse.data;
      
      // Delete each collaborator
      for (const collaborator of collaborators) {
        await $fetch<ApiResponse<void>>('/api/data/delete', {
          method: 'POST',
          body: {
            collection: 'research_collaborators',
            id: collaborator.id
          }
        });
      }
    }
    
    // Also get and update the deleted_at field for all associated books
    const booksResponse = await $fetch<ApiResponse<{id: string}[]>>('/api/data/read', {
      method: 'POST',
      body: {
        readType: 'query',
        collection: 'research_books',
        filters: [
          { field: 'research_id', operator: '==', value: id }
        ]
      }
    });
    
    if (booksResponse.data && Array.isArray(booksResponse.data)) {
      const books = booksResponse.data;
      
      // Soft delete each book
      for (const book of books) {
        await $fetch<ApiResponse<void>>('/api/data/update', {
          method: 'POST',
          body: {
            collection: 'research_books',
            id: book.id,
            deleted_at: new Date()
          }
        });
      }
    }
  } catch (error: any) {
    console.error('[Research Model] Error deleting research project:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete research project'
    })
  }
}

/**
 * Add a collaborator to a research project
 */
export async function addCollaborator(
  event: any, 
  researchId: string, 
  email: string, 
  role: 'editor' | 'viewer'
): Promise<string> {
  try {
    console.log('[Research Model] Adding collaborator to research project:', researchId, email, role)
    
    // Check if user exists with this email
    const usersResponse = await $fetch<ApiResponse<{id: string}[]>>('/api/data/read', {
      method: 'POST',
      body: {
        readType: 'query',
        collection: 'users',
        filters: [
          { field: 'email', operator: '==', value: email }
        ],
        limit: 1
      }
    });
    
    let collaboratorId: string;
    
    // If user exists, create a collaborator with user_id
    if (usersResponse.data && usersResponse.data.length > 0) {
      const userId = usersResponse.data[0].id;
      collaboratorId = `${researchId}_${userId}`;
      
      await $fetch<ApiResponse<void>>('/api/data/write', {
        method: 'POST',
        body: {
          collection: 'research_collaborators',
          id: collaboratorId,
          research_id: researchId,
          user_id: userId,
          role: role,
          invitation_status: 'pending'
        }
      });
    } else {
      // User doesn't exist, create a pending invitation
      collaboratorId = `${researchId}_${email.replace(/[.@]/g, '_')}`;
      
      await $fetch<ApiResponse<void>>('/api/data/write', {
        method: 'POST',
        body: {
          collection: 'research_collaborators',
          id: collaboratorId,
          research_id: researchId,
          invitation_email: email,
          role: role,
          invitation_status: 'pending'
        }
      });
    }
    
    return collaboratorId;
  } catch (error: any) {
    console.error('[Research Model] Error adding collaborator:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to add collaborator'
    })
  }
}

/**
 * Remove a collaborator from a research project
 */
export async function removeCollaborator(event: any, collaboratorId: string): Promise<void> {
  try {
    console.log('[Research Model] Removing collaborator:', collaboratorId)
    
    // Call the delete endpoint
    await $fetch<ApiResponse<void>>('/api/data/delete', {
      method: 'POST',
      body: {
        collection: 'research_collaborators',
        id: collaboratorId
      }
    });
  } catch (error: any) {
    console.error('[Research Model] Error removing collaborator:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to remove collaborator'
    })
  }
}

/**
 * Get collaborators for a research project
 */
export async function getCollaborators(event: any, researchId: string): Promise<ResearchCollaborator[]> {
  try {
    console.log('[Research Model] Getting collaborators for research project:', researchId)
    
    // Call the read endpoint
    const response = await $fetch<ApiResponse<ResearchCollaborator[]>>('/api/data/read', {
      method: 'POST',
      body: {
        readType: 'query',
        collection: 'research_collaborators',
        filters: [
          { field: 'research_id', operator: '==', value: researchId },
          { field: 'deleted_at', operator: '==', value: null }
        ]
      }
    });
    
    return response.data || [];
  } catch (error: any) {
    console.error('[Research Model] Error getting collaborators:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch collaborators'
    })
  }
}
