import { LRUCache } from 'lru-cache';

// Token counting utility
export class TokenCounter {
  private static readonly AVG_CHARS_PER_TOKEN = 4;

  static estimateTokenCount(text: string): number {
    return Math.ceil(text.length / this.AVG_CHARS_PER_TOKEN);
  }

  static checkTokenLimit(text: string, limit: number): boolean {
    return this.estimateTokenCount(text) <= limit;
  }
}

// Retry logic with exponential backoff
export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (!this.shouldRetry(error)) {
          throw error;
        }
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  private static shouldRetry(error: any): boolean {
    // Add conditions for retryable errors
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    return error.response?.status && retryableStatusCodes.includes(error.response.status);
  }
}

// Rate limiting
export class RateLimitManager {
  private limiters: Map<string, { requests: number; resetTime: number; limit: number; window: number }> = new Map();

  constructor() {
    // Initialize default rate limiters for different providers
    this.limiters.set('openai', { requests: 0, resetTime: Date.now(), limit: 3000, window: 60000 }); // 3k requests per minute
    this.limiters.set('anthropic', { requests: 0, resetTime: Date.now(), limit: 2000, window: 60000 }); // 2k requests per minute
    this.limiters.set('vertexai', { requests: 0, resetTime: Date.now(), limit: 6000, window: 60000 }); // 6k requests per minute
  }

  async waitForAvailability(provider: string, tokens: number): Promise<boolean> {
    const limiter = this.limiters.get(provider.toLowerCase());
    if (!limiter) return true;

    const now = Date.now();
    if (now > limiter.resetTime + limiter.window) {
      limiter.requests = 0;
      limiter.resetTime = now;
    }

    if (limiter.requests >= limiter.limit) {
      return false;
    }

    limiter.requests++;
    return true;
  }
}

// Response caching
export class ResponseCache {
  private cache: LRUCache<string, any>;

  constructor(maxSize: number = 1000) {
    this.cache = new LRUCache({
      max: maxSize,
      ttl: 1000 * 60 * 60, // 1 hour default TTL
    });
  }

  getCacheKey(provider: string, model: string, input: string, config: any): string {
    return `${provider}:${model}:${input}:${JSON.stringify(config)}`;
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  set(key: string, value: any, ttl?: number): void {
    this.cache.set(key, value, { ttl });
  }

  clear(): void {
    this.cache.clear();
  }
} 