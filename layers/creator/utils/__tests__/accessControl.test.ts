import { describe, it, expect, beforeEach, vi } from 'vitest';
import { accessControl } from '../accessControl';

// Mock the useAuth composable
vi.mock('../../../auth/composables/auth', () => ({
  useAuth: vi.fn().mockImplementation(() => ({
    user: {
      value: {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
      }
    },
    currentWorkspace: {
      value: {
        id: 'workspace123',
        name: 'Test Workspace',
        role: 'editor',
      }
    },
    isWorkspaceOwner: { value: false },
    isWorkspaceAdmin: { value: false },
  })),
}));

describe('AccessControl', () => {
  beforeEach(() => {
    // Reset mocks between tests
    vi.clearAllMocks();
  });

  it('should allow editor to view their own project', () => {
    const result = accessControl.hasPermission('project', 'view', 'user123');
    expect(result).toBe(true);
  });

  it('should allow editor to edit their own project', () => {
    const result = accessControl.hasPermission('project', 'edit', 'user123');
    expect(result).toBe(true);
  });

  it('should not allow editor to delete their own project', () => {
    const result = accessControl.hasPermission('project', 'delete', 'user123');
    expect(result).toBe(false);
  });

  it('should not allow editor to view another user\'s project without sharing', () => {
    const result = accessControl.hasPermission('project', 'view', 'otheruser456');
    expect(result).toBe(false);
  });

  it('should allow editor to view a shared project', () => {
    const projectData = {
      sharing: {
        shared_with: [{ user_id: 'user123' }]
      }
    };
    
    const result = accessControl.hasPermission('project', 'view', 'otheruser456', projectData);
    expect(result).toBe(true);
  });
});
