import { Firestore, FieldValue } from '@google-cloud/firestore';
import { getUserSession } from '~/server/utils/session';
import type { CategoryResearch, ResearchCollaborator, CollaboratorProfile } from '../../types/research';

export class ResearchModel {
  private firestore: Firestore;
  
  constructor(firestore: Firestore) {
    this.firestore = firestore;
  }
  
  /**
   * Create a new research project
   */
  async createResearch(data: Partial<CategoryResearch>, userId: string, workspaceId: string): Promise<CategoryResearch> {
    try {
      const now = new Date();
      
      // Get the user profile for the current workspace
      const profileRef = this.firestore.collection('profiles').doc(`${userId}_${workspaceId}`);
      const profileSnap = await profileRef.get();
      
      if (!profileSnap.exists) {
        throw new Error('User profile not found for current workspace');
      }
      
      const researchData: Partial<CategoryResearch> = {
        workspace_id: workspaceId,
        owner_id: userId,
        main_category: data.main_category,
        sub_category: data.sub_category,
        sub_category_description: data.sub_category_description,
        status: data.status || 'in_progress',
        is_public: data.is_public || false,
        created_at: now,
        updated_at: now
      };
      
      // Add the research document
      const docRef = await this.firestore
        .collection('research')
        .add(researchData);
      
      // Create the owner collaborator entry
      const collaboratorData: ResearchCollaborator = {
        id: `${docRef.id}_${userId}`,
        research_id: docRef.id,
        user_id: userId,
        workspace_id: workspaceId,
        role: 'owner',
        profile_id: profileSnap.id,
        invitation_status: 'accepted',
        created_at: now,
        updated_at: now
      };
      
      await this.firestore
        .collection('research_collaborators')
        .doc(collaboratorData.id)
        .set(collaboratorData);
      
      return {
        id: docRef.id,
        ...researchData,
        collaborators: [collaboratorData]
      } as CategoryResearch;
    } catch (error) {
      console.error('Error creating research:', error);
      throw new Error('Failed to create research project');
    }
  }
  
  /**
   * Get research by ID, with proper permission checks
   */
  async getResearchById(id: string, userId: string, workspaceId: string): Promise<CategoryResearch | null> {
    try {
      const docRef = this.firestore.collection('research').doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      const data = doc.data() as CategoryResearch;
      
      // Check access permissions
      const hasAccess = await this.checkResearchAccess(id, userId, workspaceId);
      
      if (!hasAccess) {
        throw new Error('Access denied to this research project');
      }
      
      // Get collaborators
      const collaboratorsRef = this.firestore
        .collection('research_collaborators')
        .where('research_id', '==', id)
        .where('deleted_at', '==', null);
      
      const collaboratorsSnap = await collaboratorsRef.get();
      const collaborators = collaboratorsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ResearchCollaborator[];
      
      return {
        id: doc.id,
        ...data,
        collaborators
      } as CategoryResearch;
    } catch (error) {
      console.error('Error getting research:', error);
      throw new Error('Failed to retrieve research project');
    }
  }
  
  /**
   * Check if user has access to a research project
   * Returns true if:
   * 1. User is owner or collaborator through current workspace
   * 2. User is collaborator through a different workspace
   */
  async checkResearchAccess(researchId: string, userId: string, workspaceId: string): Promise<boolean> {
    try {
      // Check if user is owner or collaborator
      const collaboratorRef = this.firestore
        .collection('research_collaborators')
        .where('research_id', '==', researchId)
        .where('user_id', '==', userId)
        .where('invitation_status', '==', 'accepted')
        .where('deleted_at', '==', null)
        .limit(1);
      
      const collaboratorSnap = await collaboratorRef.get();
      
      if (!collaboratorSnap.empty) {
        return true;
      }
      
      // Check if research is public and from current workspace
      const researchRef = this.firestore.collection('research').doc(researchId);
      const researchSnap = await researchRef.get();
      
      if (researchSnap.exists) {
        const researchData = researchSnap.data();
        return researchData.is_public && researchData.workspace_id === workspaceId;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking research access:', error);
      return false;
    }
  }
  
  /**
   * List research projects user has access to
   */
  async listResearch(
    userId: string, 
    workspaceId: string, 
    filters: {
      main_category?: string;
      sub_category?: string;
      status?: string;
      scope?: 'owned' | 'shared' | 'all';
    } = {}
  ): Promise<CategoryResearch[]> {
    try {
      // Get all collaborations for this user
      const collaborationsRef = this.firestore
        .collection('research_collaborators')
        .where('user_id', '==', userId)
        .where('invitation_status', '==', 'accepted')
        .where('deleted_at', '==', null);
      
      const collaborationsSnap = await collaborationsRef.get();
      const researchIds = collaborationsSnap.docs.map(doc => doc.data().research_id);
      
      if (researchIds.length === 0) {
        return [];
      }
      
      // Prepare base query for research projects user has access to
      let query = this.firestore
        .collection('research')
        .where(this.firestore.FieldPath.documentId(), 'in', researchIds)
        .where('deleted_at', '==', null);
      
      // Apply filters
      if (filters.main_category) {
        query = query.where('main_category', '==', filters.main_category);
      }
      
      if (filters.sub_category) {
        query = query.where('sub_category', '==', filters.sub_category);
      }
      
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      const snapshot = await query.get();
      
      // Format results with scope filtering
      let results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CategoryResearch[];
      
      // Filter by scope if needed
      if (filters.scope) {
        const collaborations = collaborationsSnap.docs.map(doc => doc.data());
        
        if (filters.scope === 'owned') {
          results = results.filter(r => r.owner_id === userId && r.workspace_id === workspaceId);
        } else if (filters.scope === 'shared') {
          const collaboratedIds = collaborations
            .filter(c => c.role !== 'owner' || c.workspace_id !== workspaceId)
            .map(c => c.research_id);
          results = results.filter(r => collaboratedIds.includes(r.id));
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error listing research projects:', error);
      throw new Error('Failed to list research projects');
    }
  }
  
  /**
   * Update research with permission check
   */
  async updateResearch(
    id: string, 
    data: Partial<CategoryResearch>,
    userId: string,
    workspaceId: string
  ): Promise<CategoryResearch> {
    try {
      // Check if user has edit permissions
      const collaboratorRef = this.firestore
        .collection('research_collaborators')
        .doc(`${id}_${userId}`);
      
      const collaboratorSnap = await collaboratorRef.get();
      
      if (!collaboratorSnap.exists) {
        throw new Error('Access denied: not a collaborator on this research project');
      }
      
      const collaboratorData = collaboratorSnap.data();
      
      if (collaboratorData.role === 'viewer') {
        throw new Error('Access denied: insufficient permissions to edit');
      }
      
      // Only owners can change certain fields
      if (collaboratorData.role !== 'owner' && 
          (data.workspace_id !== undefined || data.is_public !== undefined)) {
        throw new Error('Access denied: only owners can change workspace or visibility settings');
      }
      
      // Proceed with update
      const docRef = this.firestore.collection('research').doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error('Research project not found');
      }
      
      const updateData = {
        ...data,
        updated_at: new Date()
      };
      
      await docRef.update(updateData);
      
      // Return updated research with collaborators
      return await this.getResearchById(id, userId, workspaceId);
    } catch (error) {
      console.error('Error updating research:', error);
      throw new Error(`Failed to update research project: ${error.message}`);
    }
  }
  
  /**
   * Invite a collaborator to a research project
   */
  async inviteCollaborator(
    researchId: string, 
    email: string, 
    role: 'editor' | 'viewer',
    userId: string,
    workspaceId: string
  ): Promise<ResearchCollaborator> {
    try {
      // Check if inviter has owner permissions
      const inviterRef = this.firestore
        .collection('research_collaborators')
        .doc(`${researchId}_${userId}`);
      
      const inviterSnap = await inviterRef.get();
      
      if (!inviterSnap.exists || inviterSnap.data().role !== 'owner') {
        throw new Error('Only research owners can invite collaborators');
      }
      
      // Get research details
      const researchRef = this.firestore.collection('research').doc(researchId);
      const researchSnap = await researchRef.get();
      
      if (!researchSnap.exists) {
        throw new Error('Research project not found');
      }
      
      const researchData = researchSnap.data();
      
      // Check if user with this email exists
      const userQuery = this.firestore
        .collection('users')
        .where('email', '==', email)
        .limit(1);
      
      const userSnap = await userQuery.get();
      let targetUserId;
      
      const now = new Date();
      
      if (userSnap.empty) {
        // User doesn't exist yet, create pending invitation
        const collaboratorId = `${researchId}_${email.replace(/[.@]/g, '_')}`;
        
        await this.firestore.collection('research_collaborators').doc(collaboratorId).set({
          id: collaboratorId,
          research_id: researchId,
          invitation_email: email,
          role: role,
          invitation_status: 'pending',
          created_at: now,
          updated_at: now
        });
        
        // TODO: Send email invitation
        
        return {
          id: collaboratorId,
          research_id: researchId,
          invitation_email: email,
          role: role,
          invitation_status: 'pending',
          created_at: now,
          updated_at: now
        } as ResearchCollaborator;
      } else {
        // User exists
        targetUserId = userSnap.docs[0].id;
        
        // Check if user already has access
        const existingCollabRef = this.firestore
          .collection('research_collaborators')
          .doc(`${researchId}_${targetUserId}`);
        
        const existingCollabSnap = await existingCollabRef.get();
        
        if (existingCollabSnap.exists) {
          throw new Error('User is already a collaborator on this research');
        }
        
        // Find user's profile in their workspaces
        const profilesQuery = this.firestore
          .collection('profiles')
          .where('user_id', '==', targetUserId);
        
        const profilesSnap = await profilesQuery.get();
        
        if (profilesSnap.empty) {
          throw new Error('User has no workspace profiles');
        }
        
        // Use the first profile for now
        // In a real implementation, user would select which workspace to use
        const profileDoc = profilesSnap.docs[0];
        const profileData = profileDoc.data();
        
        const collaborator: ResearchCollaborator = {
          id: `${researchId}_${targetUserId}`,
          research_id: researchId,
          user_id: targetUserId,
          workspace_id: profileData.workspace_id,
          profile_id: profileDoc.id,
          role: role,
          invitation_status: 'pending',
          created_at: now,
          updated_at: now
        };
        
        await this.firestore
          .collection('research_collaborators')
          .doc(collaborator.id)
          .set(collaborator);
        
        // TODO: Send notification to user
        
        return collaborator;
      }
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      throw new Error(`Failed to invite collaborator: ${error.message}`);
    }
  }
  
  /**
   * Get collaborators for a research project
   */
  async getCollaborators(
    researchId: string,
    userId: string,
    workspaceId: string
  ): Promise<CollaboratorProfile[]> {
    try {
      // Check access
      const hasAccess = await this.checkResearchAccess(researchId, userId, workspaceId);
      
      if (!hasAccess) {
        throw new Error('Access denied to this research project');
      }
      
      // Get collaborators
      const collaboratorsRef = this.firestore
        .collection('research_collaborators')
        .where('research_id', '==', researchId)
        .where('deleted_at', '==', null);
      
      const collaboratorsSnap = await collaboratorsRef.get();
      const collaboratorDocs = collaboratorsSnap.docs.map(doc => doc.data());
      
      // Build profiles
      const profiles: CollaboratorProfile[] = [];
      
      for (const collab of collaboratorDocs) {
        if (collab.user_id) {
          // Get user data
          const userRef = this.firestore.collection('users').doc(collab.user_id);
          const userSnap = await userRef.get();
          
          if (userSnap.exists) {
            const userData = userSnap.data();
            
            // Get profile data if available
            let displayName = userData.username;
            let avatarUrl = null;
            
            if (collab.profile_id) {
              const profileRef = this.firestore.collection('profiles').doc(collab.profile_id);
              const profileSnap = await profileRef.get();
              
              if (profileSnap.exists) {
                const profileData = profileSnap.data();
                displayName = profileData.display_name || displayName;
                avatarUrl = profileData.avatar_url || null;
              }
            }
            
            // Get workspace name
            let workspaceName = '';
            if (collab.workspace_id) {
              const workspaceRef = this.firestore.collection('workspaces').doc(collab.workspace_id);
              const workspaceSnap = await workspaceRef.get();
              
              if (workspaceSnap.exists) {
                workspaceName = workspaceSnap.data().name;
              }
            }
            
            profiles.push({
              id: collab.id,
              user_id: collab.user_id,
              display_name: displayName,
              avatar_url: avatarUrl,
              role: collab.role,
              email: userData.email,
              workspace_name: workspaceName,
              invitation_status: collab.invitation_status
            });
          }
        } else if (collab.invitation_email) {
          // Pending invitation
          profiles.push({
            id: collab.id,
            user_id: '',
            display_name: 'Pending User',
            email: collab.invitation_email,
            role: collab.role,
            workspace_name: 'Pending',
            invitation_status: 'pending'
          });
        }
      }
      
      return profiles;
    } catch (error) {
      console.error('Error getting collaborators:', error);
      throw new Error(`Failed to get collaborators: ${error.message}`);
    }
  }
  
  /**
   * Delete research (soft delete)
   */
  async deleteResearch(id: string, userId: string, workspaceId: string): Promise<void> {
    try {
      // Check if user is owner
      const collaboratorRef = this.firestore
        .collection('research_collaborators')
        .doc(`${id}_${userId}`);
      
      const collaboratorSnap = await collaboratorRef.get();
      
      if (!collaboratorSnap.exists || collaboratorSnap.data().role !== 'owner') {
        throw new Error('Only research owners can delete projects');
      }
      
      const docRef = this.firestore.collection('research').doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error('Research project not found');
      }
      
      // Soft delete
      await docRef.update({
        deleted_at: new Date(),
        updated_at: new Date()
      });
      
      // Also mark all collaborations as deleted
      const collaboratorsRef = this.firestore
        .collection('research_collaborators')
        .where('research_id', '==', id);
      
      const batch = this.firestore.batch();
      const now = new Date();
      
      const collaboratorsSnap = await collaboratorsRef.get();
      collaboratorsSnap.forEach(doc => {
        batch.update(doc.ref, { 
          deleted_at: now,
          updated_at: now
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting research:', error);
      throw new Error('Failed to delete research project');
    }
  }
}
