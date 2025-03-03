import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { ToolsHandler } from "../tools";
import { LLMHandler } from "../llm";
import type { LLMProvider } from "../../types/llm";

export interface DataAnalysisAgentConfig {
  llmProvider?: LLMProvider;
  llmModel?: string;
  verbose?: boolean;
  maxIterations?: number;
}

export class DataAnalysisAgent {
  private config: DataAnalysisAgentConfig;
  private tools: any[] = [];
  private model: any;

  constructor(config: DataAnalysisAgentConfig = {}) {
    this.config = config;
  }

  private async initializeTools() {
    try {
      // Initialize data analysis tool
      const dataAnalysisToolHandler = new ToolsHandler({ 
        type: 'data_analysis'
      });
      
      // Initialize data visualization tool
      const dataVisualizationToolHandler = new ToolsHandler({ 
        type: 'data_visualization'
      });

      // Test the tools to make sure they're working
      const testData = [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 15 },
        { x: 4, y: 30 },
        { x: 5, y: 25 }
      ];
      
      const analysisResult = await dataAnalysisToolHandler.run(JSON.stringify({
        data: testData,
        operation: 'summary'
      }));

      if (analysisResult.success) {
        this.tools = [dataAnalysisToolHandler, dataVisualizationToolHandler];
      } else {
        throw new Error('Failed to initialize data analysis tools');
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

  async analyzeData(data: any, operation: string, options: Record<string, any> = {}) {
    try {
      const input = JSON.stringify({
        data,
        operation,
        options
      });

      const result = await this.tools[0].run(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze data');
      }
      
      return {
        success: true,
        data: result.data,
        raw: result
      };
    } catch (error: unknown) {
      console.error('Error in data analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async visualizeData(data: any, type: string, outputPath: string, options: Record<string, any> = {}) {
    try {
      const input = JSON.stringify({
        data,
        type,
        outputPath,
        options
      });

      const result = await this.tools[1].run(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to visualize data');
      }
      
      return {
        success: true,
        data: result.data,
        raw: result
      };
    } catch (error: unknown) {
      console.error('Error in data visualization:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async analyzeAndVisualize(data: any, analysisOperation: string, visualizationType: string, outputPath: string, options: Record<string, any> = {}) {
    const executor = await this.initialize();

    const input = `Analyze this data using the ${analysisOperation} operation and then create a ${visualizationType} visualization. Save the visualization to ${outputPath}.
    
    Data: ${JSON.stringify(data)}
    
    ${Object.keys(options).length > 0 ? `Options: ${JSON.stringify(options)}` : ''}`;

    try {
      const result = await executor.invoke({ input });
      return {
        success: true,
        data: result.output,
        intermediateSteps: result.intermediateSteps
      };
    } catch (error: unknown) {
      console.error('Error in data analysis and visualization:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        intermediateSteps: []
      };
    }
  }

  async findCorrelations(data: any, options: {
    columns?: string[];
    method?: 'pearson' | 'spearman';
    visualize?: boolean;
    outputPath?: string;
  } = {}) {
    const executor = await this.initialize();

    let input = `Find correlations in this data: ${JSON.stringify(data)}`;
    
    if (options.columns && options.columns.length > 0) {
      input += `. Focus on these columns: ${options.columns.join(', ')}`;
    }
    
    if (options.method) {
      input += `. Use the ${options.method} correlation method`;
    }
    
    if (options.visualize && options.outputPath) {
      input += `. Create a visualization and save it to ${options.outputPath}`;
    }

    try {
      const result = await executor.invoke({ input });
      return {
        success: true,
        data: result.output,
        intermediateSteps: result.intermediateSteps
      };
    } catch (error: unknown) {
      console.error('Error finding correlations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        intermediateSteps: []
      };
    }
  }

  async detectOutliers(data: any, column: string, options: {
    method?: 'iqr' | 'zscore';
    threshold?: number;
    visualize?: boolean;
    outputPath?: string;
  } = {}) {
    const executor = await this.initialize();

    let input = `Detect outliers in this data for column "${column}": ${JSON.stringify(data)}`;
    
    if (options.method) {
      input += `. Use the ${options.method} method`;
    }
    
    if (options.threshold) {
      input += `. Use a threshold of ${options.threshold}`;
    }
    
    if (options.visualize && options.outputPath) {
      input += `. Create a visualization and save it to ${options.outputPath}`;
    }

    try {
      const result = await executor.invoke({ input });
      return {
        success: true,
        data: result.output,
        intermediateSteps: result.intermediateSteps
      };
    } catch (error: unknown) {
      console.error('Error detecting outliers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        intermediateSteps: []
      };
    }
  }

  async analyzeTimeSeries(data: any, dateColumn: string, valueColumn: string, options: {
    interval?: 'hour' | 'day' | 'week' | 'month' | 'year';
    visualize?: boolean;
    outputPath?: string;
  } = {}) {
    const executor = await this.initialize();

    let input = `Analyze this time series data with date column "${dateColumn}" and value column "${valueColumn}": ${JSON.stringify(data)}`;
    
    if (options.interval) {
      input += `. Use a ${options.interval} interval`;
    }
    
    if (options.visualize && options.outputPath) {
      input += `. Create a visualization and save it to ${options.outputPath}`;
    }

    try {
      const result = await executor.invoke({ input });
      return {
        success: true,
        data: result.output,
        intermediateSteps: result.intermediateSteps
      };
    } catch (error: unknown) {
      console.error('Error analyzing time series:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        intermediateSteps: []
      };
    }
  }
}
