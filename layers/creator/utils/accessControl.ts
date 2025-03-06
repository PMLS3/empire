import { useAuth } from '../../auth/composables/auth';

// Define role levels (higher number means more permissions)
const ROLE_LEVELS = {
  viewer: 1,
  editor: 2,
  admin: 3,
  owner: 4
};

// Define resource types
export type ResourceType = 'project' | 'channel' | 'template' | 'asset' | 'analytics';

// Define permission types
export type PermissionType = 'view' | 'edit' | 'delete' | 'share' | 'publish' | 'export' | 'admin';

// Access control utility class
export class AccessControl {
  private static instance: AccessControl;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): AccessControl {
    if (!AccessControl.instance) {
      AccessControl.instance = new AccessControl();
    }
    return AccessControl.instance;
  }

  /**
   * Check if user has permission for a resource
   */
  public hasPermission(
    resourceType: ResourceType,
    permissionType: PermissionType,
    resourceOwnerId?: string,
    resourceData?: any
  ): boolean {
    const { user, currentWorkspace, isWorkspaceOwner, isWorkspaceAdmin } = useAuth();
    
    // Not authenticated
    if (!user.value || !currentWorkspace.value) {
      return false;
    }
    
    // Workspace owner can do anything within their workspace
    if (isWorkspaceOwner.value) {
      return true;
    }
    
    // Workspace admins can do most things except certain owner-only operations
    if (isWorkspaceAdmin.value) {
      // Some restrictions might apply for admins
      if (permissionType === 'admin' && resourceType === 'channel') {
        // Only owner can perform admin actions on channels
        return false;
      }
      return true;
    }
    
    // Get current user role in the workspace
    const userRole = currentWorkspace.value.role;
    
    // Check if the user is the resource owner
    const isResourceOwner = resourceOwnerId === user.value.id;
    
    // Role-based checks
    switch (userRole) {
      case 'editor':
        // Editors can view, edit, export their own resources
        if (isResourceOwner) {
          return ['view', 'edit', 'export'].includes(permissionType);
        }
        
        // Editors can view and export shared resources
        if (this.isResourceSharedWithUser(resourceData)) {
          return ['view', 'export'].includes(permissionType);
        }
        
        // For channel resources, editors have limited permissions
        if (resourceType === 'channel') {
          return ['view'].includes(permissionType);
        }
        
        return false;
        
      case 'viewer':
        // Viewers can only view their own resources and export
        if (isResourceOwner) {
          return ['view', 'export'].includes(permissionType);
        }
        
        // Viewers can view shared resources
        if (this.isResourceSharedWithUser(resourceData)) {
          return ['view'].includes(permissionType);
        }
        
        return false;
        
      default:
        return false;
    }
  }
  
  /**
   * Check if the current user can perform an action on a resource
   */
  public can(
    action: PermissionType,
    resourceType: ResourceType,
    resourceOwnerId?: string,
    resourceData?: any
  ): boolean {
    return this.hasPermission(resourceType, action, resourceOwnerId, resourceData);
  }
  
  /**
   * Check if a resource is shared with the current user
   */
  private isResourceSharedWithUser(resourceData: any): boolean {
    if (!resourceData) return false;
    
    const { user } = useAuth();
    
    // Check if the resource has sharing settings
    if (resourceData.sharing && resourceData.sharing.shared_with) {
      // Check if user is in the shared_with list
      return resourceData.sharing.shared_with.some(
        (share: { user_id: string }) => share.user_id === user.value?.id
      );
    }
    
    // Check if the resource has a team with the user as member
    if (resourceData.team && resourceData.team.members) {
      return resourceData.team.members.some(
        (member: { user_id: string }) => member.user_id === user.value?.id
      );
    }
    
    return false;
  }
  
  /**
   * Compare roles to see if one role has higher privileges than another
   */
  public isRoleAtLeast(userRole: string, requiredRole: string): boolean {
    const userLevel = ROLE_LEVELS[userRole] || 0;
    const requiredLevel = ROLE_LEVELS[requiredRole] || 0;
    return userLevel >= requiredLevel;
  }
}

// Export singleton instance
export const accessControl = AccessControl.getInstance();
