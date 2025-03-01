import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { ToolsHandler } from "../tools";
import { LLMHandler } from "../llm";
import type { LLMProvider } from "../../types/llm";
import { interrupt } from "@langchain/langgraph";

export interface DataManagementAgentConfig {
  idToken?: string;
  userId?: string;
  workspaceId?: string;
  llmProvider?: LLMProvider;
  llmModel?: string;
  verbose?: boolean;
  maxIterations?: number;
}

export class DataManagementAgent {
  private config: DataManagementAgentConfig;
  private tools: any[] = [];
  private model: any;
  private executor: AgentExecutor | null = null;

  constructor(config: DataManagementAgentConfig = {}) {
    this.config = config;
  }

  private async initializeTools() {
    try {
      // Check if we have the required configuration
      if (!this.config.idToken || !this.config.userId || !this.config.workspaceId) {
        throw new Error("Missing required configuration: idToken, userId, or workspaceId");
      }

      // Initialize Firestore tools
      const firestoreToolHandler = new ToolsHandler({ 
        type: 'firestore',
        options: {
          idToken: this.config.idToken,
          userId: this.config.userId,
          workspaceId: this.config.workspaceId
        }
      });
      
      const firestoreVectorToolHandler = new ToolsHandler({ 
        type: 'firestore_vector',
        options: {
          idToken: this.config.idToken,
          userId: this.config.userId,
          workspaceId: this.config.workspaceId
        }
      });
      
      const firestoreTransactionToolHandler = new ToolsHandler({ 
        type: 'firestore_transaction',
        options: {
          idToken: this.config.idToken,
          userId: this.config.userId,
          workspaceId: this.config.workspaceId
        }
      });

      // Add a human feedback tool
      const humanFeedbackToolHandler = {
        name: "request_human_feedback",
        description: "Request feedback from a human on the current task or data.",
        schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "A message explaining what you need feedback on"
            },
            data: {
              type: "object",
              description: "The data you want the human to review"
            }
          },
          required: ["message"]
        },
        run: async (input: string) => {
          try {
            const parsedInput = JSON.parse(input);
            return interrupt({
              message: parsedInput.message,
              data: parsedInput.data
            });
          } catch (error) {
            return `Error requesting human feedback: ${error}`;
          }
        }
      };

      // Test the tools to make sure they're working
      const testData = {
        operation: "read",
        collection: "test_collection",
        readType: "query",
        filters: []
      };
      
      try {
        await firestoreToolHandler.run(JSON.stringify(testData));
        this.tools = [
          firestoreToolHandler, 
          firestoreVectorToolHandler, 
          firestoreTransactionToolHandler,
          humanFeedbackToolHandler
        ];
      } catch (error) {
        console.warn("Firestore tool test failed, but continuing with initialization:", error);
        // Still add the tools even if the test fails, as it might be due to authentication or network issues
        this.tools = [
          firestoreToolHandler, 
          firestoreVectorToolHandler, 
          firestoreTransactionToolHandler,
          humanFeedbackToolHandler
        ];
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
    this.executor = await this.createAgent();
    return this.executor;
  }

  async createDocument(collection: string, data: Record<string, any>) {
    try {
      if (!this.executor) {
        await this.initialize();
      }
      
      const input = JSON.stringify({
        operation: "write",
        collection,
        ...data
      });

      const result = await this.tools[0].run(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create document');
      }
      
      return {
        success: true,
        data: JSON.parse(result.data),
        raw: result
      };
    } catch (error: unknown) {
      console.error('Error creating document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async readDocument(collection: string, id: string) {
    try {
      if (!this.executor) {
        await this.initialize();
      }
      
      const input = JSON.stringify({
        operation: "read",
        collection,
        readType: "doc",
        id
      });

      const result = await this.tools[0].run(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to read document');
      }
      
      return {
        success: true,
        data: JSON.parse(result.data),
        raw: result
      };
    } catch (error: unknown) {
      console.error('Error reading document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async queryDocuments(collection: string, filters: any[] = []) {
    try {
      if (!this.executor) {
        await this.initialize();
      }
      
      const input = JSON.stringify({
        operation: "read",
        collection,
        readType: "query",
        filters
      });

      const result = await this.tools[0].run(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to query documents');
      }
      
      return {
        success: true,
        data: JSON.parse(result.data),
        raw: result
      };
    } catch (error: unknown) {
      console.error('Error querying documents:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async updateDocument(collection: string, id: string, data: Record<string, any>) {
    try {
      if (!this.executor) {
        await this.initialize();
      }
      
      const input = JSON.stringify({
        operation: "update",
        collection,
        id,
        ...data
      });

      const result = await this.tools[0].run(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update document');
      }
      
      return {
        success: true,
        data: JSON.parse(result.data),
        raw: result
      };
    } catch (error: unknown) {
      console.error('Error updating document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async deleteDocument(collection: string, id: string) {
    try {
      if (!this.executor) {
        await this.initialize();
      }
      
      const input = JSON.stringify({
        operation: "delete",
        collection,
        id
      });

      const result = await this.tools[0].run(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete document');
      }
      
      return {
        success: true,
        data: JSON.parse(result.data),
        raw: result
      };
    } catch (error: unknown) {
      console.error('Error deleting document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async vectorSearch(collection: string, query: string, options: {
    limit?: number;
    filters?: any[];
  } = {}) {
    try {
      if (!this.executor) {
        await this.initialize();
      }
      
      const input = JSON.stringify({
        operation: "vector_search",
        collection,
        query,
        limit: options.limit || 10,
        filters: options.filters || []
      });

      const result = await this.tools[1].run(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to perform vector search');
      }
      
      return {
        success: true,
        data: JSON.parse(result.data),
        raw: result
      };
    } catch (error: unknown) {
      console.error('Error performing vector search:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async runTransaction(operations: any[]) {
    try {
      if (!this.executor) {
        await this.initialize();
      }
      
      const input = JSON.stringify({
        operations
      });

      const result = await this.tools[2].run(input);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to run transaction');
      }
      
      return {
        success: true,
        data: JSON.parse(result.data),
        raw: result
      };
    } catch (error: unknown) {
      console.error('Error running transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async requestHumanFeedback(message: string, data: any = {}) {
    try {
      if (!this.executor) {
        await this.initialize();
      }
      
      const input = JSON.stringify({
        message,
        data
      });

      return await this.tools[3].run(input);
    } catch (error: unknown) {
      console.error('Error requesting human feedback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async run(input: string) {
    try {
      if (!this.executor) {
        await this.initialize();
      }
      
      const result = await this.executor!.invoke({ input });
      
      return {
        success: true,
        output: result.output,
        intermediateSteps: result.intermediateSteps
      };
    } catch (error: unknown) {
      console.error('Error running agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
