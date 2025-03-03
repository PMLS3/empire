/*
1. Simple Natural Language Extraction:
const agent = new WebScraperAgent({
  firecrawlApiKey: 'your-api-key',
  llmProvider: 'openai'
});

// Using the dedicated extract method
const result = await agent.extract(
  'https://example.com',
  'Find all product prices and their names, and format them as a list'
);

// Or using the scrape method with extract type
const result2 = await agent.scrape('https://example.com', {
  type: 'extract',
  prompt: 'Extract all article titles and their publication dates'
});


2. Complex Extraction with Rules:

const result = await agent.scrape('https://example.com', {
  type: 'extract',
  prompt: 'Find all job listings',
  extractionRules: `
    - Include job title, company, and salary if available
    - Format dates in ISO format
    - Only include full-time positions
    - Skip any listings older than 30 days
  `
});

3. Combining Natural Language with Schema:

const result = await agent.scrape('https://example.com', {
  type: 'extract',
  prompt: 'Extract product information from this e-commerce page',
  schema: 'array(object({ name: string(), price: number(), description: string() }))',
  extractionRules: 'Focus on in-stock items only'
});

4. Crawling with Natural Language:

const result = await agent.scrape('https://example.com', {
  type: 'crawl',
  prompt: 'Find all blog posts about artificial intelligence',
  maxPages: 10,
  timeout: 60
});

*/


import { Tool } from "@langchain/core/tools";
import FirecrawlApp, { CrawlParams, CrawlStatusResponse } from '@mendable/firecrawl-js';
import { z } from "zod";

export class FirecrawlTool extends Tool {
  name = "firecrawl";
  description = "A powerful web scraping tool that can extract data from any website. Input should be a JSON string with: url (required), type ('scrape', 'crawl', or 'extract'), prompt (for natural language extraction), schema (optional Zod schema), and options (optional configuration).";
  
  private app: FirecrawlApp;

  constructor(apiKey: string) {
    super();
    this.app = new FirecrawlApp({ apiKey });
  }

  private async extractWithPrompt(url: string, prompt: string, options: any = {}) {
    try {
      const result = await this.app.scrapeUrl(url, {
        ...options,
        formats: ['json'],
        jsonOptions: {
          extractionPrompt: prompt
        }
      });
      return result;
    } catch (error) {
      console.error("Error in prompt-based extraction:", error);
      throw error;
    }
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { url, type = 'scrape', prompt, schema, options = {} } = params;

      if (!url) {
        throw new Error("URL is required");
      }
      
      // Validate URL format
      try {
        new URL(url); // This will throw if the URL is invalid
      } catch (error) {
        throw new Error(`Invalid URL format: ${url}`);
      }

      // Handle natural language extraction
      if (type === 'extract') {
        // Handle schema-based extraction for extract type
        if (schema) {
          // If schema is an object (Zod schema passed directly), use it
          const extractOptions = {
            ...options,
            formats: ['json'],
            jsonOptions: {
              extractionPrompt: prompt || 'Extract structured data from this page',
              extractionSchema: schema
            }
          };
          
          const result = await this.app.scrapeUrl(url, extractOptions);
          return JSON.stringify(result);
        } else if (prompt) {
          // Regular prompt-based extraction without schema
          const result = await this.extractWithPrompt(url, prompt, options);
          return JSON.stringify(result);
        } else {
          throw new Error("For 'extract' type, either prompt or schema must be provided");
        }
      }

      // Handle schema-based extraction for other types
      let extractionSchema;
      if (schema) {
        if (typeof schema === 'string') {
          try {
            extractionSchema = eval(`z.${schema}`);
          } catch (error) {
            console.error("Error parsing schema string:", error);
            throw new Error("Invalid schema format");
          }
        } else {
          // If schema is already an object (Zod schema), use it directly
          extractionSchema = schema;
        }
      }

      if (type === 'scrape') {
        const scrapeOptions = {
          ...options,
          formats: options.formats || ['markdown', 'html', 'json'],
          jsonOptions: schema ? { 
            extractionSchema,
            extractionPrompt: prompt 
          } : undefined
        };

        const result = await this.app.scrapeUrl(url, scrapeOptions);
        return JSON.stringify(result);
      } else if (type === 'crawl') {
        const crawlOptions: CrawlParams = {
          limit: options.limit || 100,
          scrapeOptions: {
            formats: options.formats || ['markdown', 'html', 'json'],
            jsonOptions: schema ? { 
              extractionSchema,
              extractionPrompt: prompt 
            } : undefined
          },
          ...options
        };

        const result = await this.app.crawlUrl(
          url,
          crawlOptions,
          1,
          options.timeout || 30
        ) as CrawlStatusResponse;

        return JSON.stringify(result);
      } else {
        throw new Error("Invalid type. Must be 'scrape', 'crawl', or 'extract'");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Firecrawl error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Firecrawl');
    }
  }
} 