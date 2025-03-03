export interface BaseAgentConfig {
  verbose?: boolean;
  maxIterations?: number;
  llmProvider?: string;
  llmModel?: string;
}

export interface WebScraperAgentConfig extends BaseAgentConfig {
  firecrawlApiKey: string;
}

export type ExtractionType = 'scrape' | 'crawl' | 'extract';

export interface ScrapingOptions {
  type?: ExtractionType;
  prompt?: string;
  schema?: string;
  extractionRules?: string;
  maxPages?: number;
  timeout?: number;
}

export interface AgentResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  intermediateSteps: any[];
} 