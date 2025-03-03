import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { ToolsHandler } from "../tools";
import { LLMHandler } from "../llm";
import type { WebScraperAgentConfig } from "../../types/agents";
import type { LLMProvider } from "../../types/llm";

export class WebScraperAgent {
  private config: WebScraperAgentConfig;
  private tools: any[];
  private model: any;
  private toolsHandler: ToolsHandler;

  constructor(config: WebScraperAgentConfig) {
    this.config = config;
    this.tools = [];
    this.toolsHandler = new ToolsHandler({ 
      type: 'firecrawl',
      apiKey: this.config.firecrawlApiKey 
    });
  }

  private async initializeTools() {
    try {
      // Initialize Firecrawl tool without a test call
      this.tools = [this.toolsHandler];
    } catch (error) {
      console.error('Error initializing tools:', error);
      throw error;
    }
  }

  private async initializeModel() {
    const llmHandler = new LLMHandler({
      provider: (this.config.llmProvider || 'openai') as LLMProvider,
      temperature: 0,
      model: this.config.llmModel
    });
    this.model = await llmHandler.getLLMModel();
  }

  private async createAgent() {
    // Get the prompt from LangChain hub or use a custom one
    const prompt = await pull<ChatPromptTemplate>(
      "hwchase17/openai-functions-agent"
    );

    // Create the agent
    const agent = await createOpenAIFunctionsAgent({
      llm: this.model,
      tools: this.tools,
      prompt
    });

    return AgentExecutor.fromAgentAndTools({
      agent,
      tools: this.tools,
      verbose: this.config.verbose || false,
      maxIterations: this.config.maxIterations || 5,
    });
  }

  async initialize() {
    await this.initializeTools();
    await this.initializeModel();
    return this.createAgent();
  }

  async extract(url: string, prompt: string, options: {
    maxPages?: number;
    timeout?: number;
  } = {}) {
    const executor = await this.initialize();

    const input = {
      input: `Extract information from ${url} based on this request: ${prompt}`
    };

    try {
      const result = await executor.invoke(input);
      return {
        success: true,
        data: result.output,
        intermediateSteps: result.intermediateSteps
      };
    } catch (error: unknown) {
      console.error('Error in web scraper agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        intermediateSteps: []
      };
    }
  }

  async scrape(url: string, options: {
    type?: 'scrape' | 'crawl' | 'extract';
    prompt?: string;
    schema?: any;
    extractionRules?: string;
    maxPages?: number;
  } = {}) {
    const executor = await this.initialize();

    // For extract type with schema, use the FirecrawlTool directly
    if (options.type === 'extract' && options.schema) {
      try {
        // Get the FirecrawlTool from the executor
        const firecrawlTool = executor.tools.find(tool => tool.name === 'firecrawl');
        if (!firecrawlTool) {
          throw new Error('FirecrawlTool not found in executor');
        }
        
        // Call the tool directly with the schema
        const result = await firecrawlTool._call(JSON.stringify({
          url,
          type: 'extract',
          prompt: options.prompt,
          schema: options.schema,
          options: {
            extractionRules: options.extractionRules
          }
        }));
        
        return JSON.parse(result);
      } catch (error) {
        console.error('Error calling FirecrawlTool directly:', error);
        throw error;
      }
    }
    
    // For other cases, use the agent as before
    let input;
    if (options.type === 'extract' && options.prompt) {
      input = {
        input: `Extract information from ${url} based on this request: ${options.prompt}`
      };
    } else {
      input = {
        input: `Please ${options.type || 'scrape'} the website at ${url}.${
          options.schema 
            ? ` Extract the following structured data: ${options.schema}`
            : ''
        }${
          options.extractionRules
            ? ` Follow these specific rules: ${options.extractionRules}`
            : ''
        }${
          options.type === 'crawl' && options.maxPages
            ? ` Limit crawling to ${options.maxPages} pages.`
            : ''
        }`
      };
    }

    try {
      const result = await executor.invoke(input);
      return {
        success: true,
        data: result.output,
        intermediateSteps: result.intermediateSteps
      };
    } catch (error: unknown) {
      console.error('Error in web scraper agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        intermediateSteps: []
      };
    }
  }
} 