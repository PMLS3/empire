import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/vue';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock Nuxt useRoute and useRouter
vi.mock('#app', () => ({
  useRoute: () => ({
    params: {},
    query: {},
    path: '/',
    fullPath: '/',
    hash: '',
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  navigateTo: vi.fn(),
  abortNavigation: vi.fn(),
  defineNuxtRouteMiddleware: (middleware) => middleware,
}));

// Mock environment variables
process.env = {
  ...process.env,
  VITE_API_KEY: 'test-api-key',
  VITE_APP_ENV: 'test',
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.IntersectionObserver = MockIntersectionObserver as any;

// Global mocks for fetch API
global.fetch = vi.fn();
