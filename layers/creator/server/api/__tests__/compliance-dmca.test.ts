import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createError } from 'h3';
import { setup, $fetch } from '@nuxt/test-utils';

// Mock the necessary dependencies
vi.mock('#auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: {
      id: 'user123',
      email: 'test@example.com',
      username: 'testuser',
    }
  })
}));

vi.mock('../../../lib/firebase', () => ({
  db: {
    collection: vi.fn(),
    doc: vi.fn(),
    setDoc: vi.fn(),
  }
}));

// Setup Nuxt test utils
beforeEach(async () => {
  await setup({
    server: true,
  });
});

describe('DMCA API endpoints', () => {
  it('should create a new DMCA case on valid request', async () => {
    const response = await $fetch('/api/compliance/dmca/takedown', {
      method: 'POST',
      body: {
        contentId: 'content123',
        contentType: 'video',
        originalWorkDescription: 'My original work',
        copyrightProof: 'Proof of ownership',
        requestedAction: 'remove',
        declaration: true,
      }
    });

    expect(response.success).toBe(true);
    expect(response.caseId).toBeDefined();
  });

  it('should return 400 on missing required fields', async () => {
    try {
      await $fetch('/api/compliance/dmca/takedown', {
        method: 'POST',
        body: {
          contentId: 'content123',
          // Missing required fields
        }
      });
      
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
    }
  });

  it('should return 401 on unauthorized access', async () => {
    // Mock getServerSession to return null (unauthorized)
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    
    try {
      await $fetch('/api/compliance/dmca/takedown', {
        method: 'POST',
        body: {
          contentId: 'content123',
          contentType: 'video',
          originalWorkDescription: 'My original work',
          copyrightProof: 'Proof of ownership',
          requestedAction: 'remove',
          declaration: true,
        }
      });
      
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });
});
