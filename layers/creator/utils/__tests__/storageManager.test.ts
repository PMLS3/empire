import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageManager } from '../storageManager';

// Mocks for Firebase Storage
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn().mockResolvedValue('https://example.com/file.mp4'),
  getMetadata: vi.fn().mockResolvedValue({
    customMetadata: {
      projectId: 'project123',
      type: 'video',
      size: '1024',
      originalName: 'test.mp4',
    }
  }),
  updateMetadata: vi.fn(),
  list: vi.fn().mockResolvedValue({
    items: [{
      fullPath: 'projects/123/video/file.mp4',
      getMetadata: vi.fn().mockResolvedValue({
        customMetadata: {
          projectId: 'project123'
        }
      })
    }]
  }),
  deleteObject: vi.fn(),
}));

// Mock useFirebase and useAuth composables
vi.mock('../../../auth/composables/firebase', () => ({
  useFirebase: vi.fn().mockImplementation(() => ({
    storage: {},
  })),
}));

vi.mock('../../../auth/composables/auth', () => ({
  useAuth: vi.fn().mockImplementation(() => ({
    currentWorkspace: { value: { id: 'workspace123' } },
    user: { value: { id: 'user123' } },
  })),
}));

describe('StorageManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue(null);
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {});
  });

  it('should be a singleton', () => {
    const instance1 = storageManager;
    const instance2 = storageManager;
    expect(instance1).toBe(instance2);
  });

  it('should serialize metadata correctly', () => {
    const metadata = {
      projectId: 'project123',
      type: 'video',
      size: 1024,
      tags: ['tag1', 'tag2'],
    };

    // Use private method via any casting
    const serialized = (storageManager as any).serializeMetadata(metadata);
    
    expect(serialized.projectId).toBe('project123');
    expect(serialized.type).toBe('video');
    expect(serialized.size).toBe('1024');
    expect(serialized.tags).toBe(JSON.stringify(['tag1', 'tag2']));
  });

  it('should deserialize metadata correctly', () => {
    const serialized = {
      projectId: 'project123',
      type: 'video',
      size: '1024',
      tags: JSON.stringify(['tag1', 'tag2']),
    };

    // Use private method via any casting
    const deserialized = (storageManager as any).deserializeMetadata(serialized);
    
    expect(deserialized.projectId).toBe('project123');
    expect(deserialized.type).toBe('video');
    expect(deserialized.size).toBe(1024);
    expect(deserialized.tags).toEqual(['tag1', 'tag2']);
  });
});
