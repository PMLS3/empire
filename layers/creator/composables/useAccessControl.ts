import { accessControl, type ResourceType, type PermissionType } from '../utils/accessControl';

export function useAccessControl() {
  /**
   * Check if the current user can perform an action on a resource
   */
  const can = (
    action: PermissionType,
    resourceType: ResourceType,
    resourceOwnerId?: string,
    resourceData?: any
  ): boolean => {
    return accessControl.can(action, resourceType, resourceOwnerId, resourceData);
  };

  /**
   * Check if the current user has a specific permission on a resource
   */
  const hasPermission = (
    resourceType: ResourceType,
    permissionType: PermissionType,
    resourceOwnerId?: string,
    resourceData?: any
  ): boolean => {
    return accessControl.hasPermission(resourceType, permissionType, resourceOwnerId, resourceData);
  };

  return {
    can,
    hasPermission,
  };
}
