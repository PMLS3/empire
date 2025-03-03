import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { ToolsHandler } from "../tools";
import { LLMHandler } from "../llm";
import type { LLMProvider } from "../../types/llm";

export interface MediaAnalysisAgentConfig {
  projectId: string;
  location?: string;
  llmProvider?: LLMProvider;
  llmModel?: string;
  vertexModel?: string;
  verbose?: boolean;
  maxIterations?: number;
}

export class MediaAnalysisAgent {
  private config: MediaAnalysisAgentConfig;
  private tools: any[] = [];
  private model: any;

  constructor(config: MediaAnalysisAgentConfig) {
    this.config = {
      location: 'us-central1',
      vertexModel: 'gemini-1.5-flash-001',
      ...config
    };
  }

  private async initializeTools() {
    try {
      // Initialize Vertex AI image analysis tool
      const imageToolHandler = new ToolsHandler({ 
        type: 'vertex_image',
        projectId: this.config.projectId,
        location: this.config.location,
        model: this.config.vertexModel
      });
      
      // Initialize Vertex AI audio analysis tool
      const audioToolHandler = new ToolsHandler({ 
        type: 'vertex_audio',
        projectId: this.config.projectId,
        location: this.config.location,
        model: this.config.vertexModel
      });
      
      // Initialize Vertex AI video analysis tool
      const videoToolHandler = new ToolsHandler({ 
        type: 'vertex_video',
        projectId: this.config.projectId,
        location: this.config.location,
        model: this.config.vertexModel
      });
      
      // Initialize Vertex AI document analysis tool
      const documentToolHandler = new ToolsHandler({ 
        type: 'vertex_document',
        projectId: this.config.projectId,
        location: this.config.location,
        model: this.config.vertexModel
      });
      
      // Initialize Vertex AI multimodal chat tool
      const multimodalChatToolHandler = new ToolsHandler({ 
        type: 'vertex_multimodal_chat',
        projectId: this.config.projectId,
        location: this.config.location,
        model: this.config.vertexModel
      });

      this.tools = [
        imageToolHandler, 
        audioToolHandler, 
        videoToolHandler, 
        documentToolHandler, 
        multimodalChatToolHandler
      ];
    } catch (error) {
      console.error('Error initializing tools:', error);
      throw error;
    }
  }

  private async initializeModel() {
    const llmHandler = new LLMHandler({
      provider: (this.config.llmProvider || 'vertexai') as LLMProvider,
      temperature: 0,
      model: this.config.llmModel || 'gemini-1.5-pro',
      projectId: this.config.projectId,
      location: this.config.location
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

  async analyzeImage(filepaths: string[], query: string) {
    const executor = await this.initialize();

    const input = JSON.stringify({
      filepaths,
      query
    });

    try {
      const result = await this.tools[0].run(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze image');
      }
      
      return {
        success: true,
        data: result.data,
        raw: result
      };
    } catch (error: unknown) {
      console.error('Error in image analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async analyzeAudio(url: string, type: 'summary' | 'transcript' = 'summary') {
    const executor = await this.initialize();

    const input = JSON.stringify({
      url,
      type
    });

    try {
      const result = await this.tools[1].run(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze audio');
      }
      
      return {
        success: true,
        data: result.data,
        raw: result
      };
    } catch (error: unknown) {
      console.error('Error in audio analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async analyzeVideo(url: string, type: 'description' | 'analysis' = 'analysis') {
    const executor = await this.initialize();

    const input = JSON.stringify({
      url,
      type
    });

    try {
      const result = await this.tools[2].run(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze video');
      }
      
      return {
        success: true,
        data: result.data,
        raw: result
      };
    } catch (error: unknown) {
      console.error('Error in video analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async analyzeDocument(url: string) {
    const executor = await this.initialize();

    const input = JSON.stringify({
      url
    });

    try {
      const result = await this.tools[3].run(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze document');
      }
      
      return {
        success: true,
        data: result.data,
        raw: result
      };
    } catch (error: unknown) {
      console.error('Error in document analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async multimodalChat(messages: Array<{role: string, content: string}>, images: string[] = [], videos: string[] = [], chat_id?: string) {
    const executor = await this.initialize();

    const input = JSON.stringify({
      messages,
      images,
      videos,
      chat_id
    });

    try {
      const result = await this.tools[4].run(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to chat');
      }
      
      return {
        success: true,
        data: JSON.parse(result.data),
        raw: result
      };
    } catch (error: unknown) {
      console.error('Error in multimodal chat:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async analyzeMedia(options: {
    images?: string[];
    audioUrl?: string;
    videoUrl?: string;
    documentUrl?: string;
    query: string;
  }) {
    const executor = await this.initialize();

    let input = `Analyze the following media with this query: ${options.query}`;
    
    if (options.images && options.images.length > 0) {
      input += `. Images: ${options.images.join(', ')}`;
    }
    
    if (options.audioUrl) {
      input += `. Audio: ${options.audioUrl}`;
    }
    
    if (options.videoUrl) {
      input += `. Video: ${options.videoUrl}`;
    }
    
    if (options.documentUrl) {
      input += `. Document: ${options.documentUrl}`;
    }

    try {
      const result = await executor.invoke({ input });
      return {
        success: true,
        data: result.output,
        intermediateSteps: result.intermediateSteps
      };
    } catch (error: unknown) {
      console.error('Error in media analysis agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        intermediateSteps: []
      };
    }
  }
}
