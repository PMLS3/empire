import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { ToolsHandler } from "../tools";
import { LLMHandler } from "../llm";
import type { LLMProvider } from "../../types/llm";

export interface ResearchAgentConfig {
  perplexityApiKey: string;
  llmProvider?: LLMProvider;
  llmModel?: string;
  verbose?: boolean;
  maxIterations?: number;
}

export class ResearchAgent {
  private config: ResearchAgentConfig;
  private tools: any[] = [];
  private model: any;

  constructor(config: ResearchAgentConfig) {
    this.config = config;
  }

  private async initializeTools() {
    try {
      // Initialize Perplexity search tool
      const searchToolHandler = new ToolsHandler({ 
        type: 'perplexity_search',
        apiKey: this.config.perplexityApiKey 
      });
      
      // Initialize Perplexity document analysis tool
      const documentToolHandler = new ToolsHandler({ 
        type: 'perplexity_document',
        apiKey: this.config.perplexityApiKey 
      });
      
      // Initialize Perplexity news search tool
      const newsToolHandler = new ToolsHandler({ 
        type: 'perplexity_news',
        apiKey: this.config.perplexityApiKey 
      });

      // Initialize data analysis tool
      const dataAnalysisToolHandler = new ToolsHandler({ 
        type: 'data_analysis'
      });

      // Test the tools to make sure they're working
      const searchResult = await searchToolHandler.run("What is LangChain?");
      const newsResult = await newsToolHandler.run(JSON.stringify({
        query: "AI news",
        days: 7
      }));

      if (searchResult.success && newsResult.success) {
        this.tools = [searchToolHandler, documentToolHandler, newsToolHandler, dataAnalysisToolHandler];
      } else {
        throw new Error('Failed to initialize Perplexity tools');
      }
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

  async research(query: string, options: {
    includeNews?: boolean;
    analyzeDocs?: boolean;
    docUrls?: string[];
  } = {}) {
    const executor = await this.initialize();

    let input = `Research the following topic thoroughly: ${query}`;
    
    if (options.includeNews) {
      input += `. Include recent news about this topic.`;
    }
    
    if (options.analyzeDocs && options.docUrls && options.docUrls.length > 0) {
      input += `. Also analyze these documents: ${options.docUrls.join(', ')}`;
    }

    try {
      const result = await executor.invoke({ input });
      return {
        success: true,
        data: result.output,
        intermediateSteps: result.intermediateSteps
      };
    } catch (error: unknown) {
      console.error('Error in research agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        intermediateSteps: []
      };
    }
  }

  async analyzeData(data: any, operation: string, options: Record<string, any> = {}) {
    const executor = await this.initialize();

    const input = `Analyze this data using the ${operation} operation: ${JSON.stringify(data)}. ${
      Object.keys(options).length > 0 
        ? `Use these options: ${JSON.stringify(options)}`
        : ''
    }`;

    try {
      const result = await executor.invoke({ input });
      return {
        success: true,
        data: result.output,
        intermediateSteps: result.intermediateSteps
      };
    } catch (error: unknown) {
      console.error('Error in data analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        intermediateSteps: []
      };
    }
  }
}
