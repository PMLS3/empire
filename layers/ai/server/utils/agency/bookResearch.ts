import { ChatOpenAI } from "@langchain/openai";
import { VertexAI } from "@langchain/google-vertexai";
import type { Peer } from "crossws";
import logger from "../logger";
import { DataManagementAgent } from "../agents/data-management-agent";
import { WebScraperAgent } from "../agents/web-scraper";
import { PDFProcessorTool, BatchPDFProcessorTool } from "../tools/pdf-processor";
import { StateGraph, Annotation, interrupt, Command, MemorySaver } from "@langchain/langgraph";
import { createSupervisor } from "../agents/supervisor";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { LLMHandler } from "../llm"; // Import LLMHandler

// Define the state type for our graph
export type BookResearchState = {
  llm: ChatOpenAI;
  query: string;
  urls: string[];
  pdfPaths: string[];
  bookData: any[];
  analysis: any;
  insights: any;
  response: string;
  peer: Peer;
  room: string;
  humanFeedback: string | null;
  waitingForHuman: boolean;
  skipHumanFeedback: boolean;
  currentStep: string;
  error?: string;
  researchId?: string;
  workspaceId?: string;
  userId?: string;
  idToken?: string;
  category?: string;
  subCategory?: string;
  type?: string;
  dataAgent?: DataManagementAgent;
  pdfResults?: any[];
};

// Define the state annotation for our graph
const BookResearchStateAnnotation = Annotation.Root({
  llm: Annotation<ChatOpenAI>(),
  query: Annotation<string>(),
  urls: Annotation<string[]>(),
  pdfPaths: Annotation<string[]>(),
  bookData: Annotation<any[]>(),
  analysis: Annotation<any>(),
  insights: Annotation<any>(),
  response: Annotation<string>(),
  peer: Annotation<Peer>(),
  room: Annotation<string>(),
  humanFeedback: Annotation<string | null>(),
  waitingForHuman: Annotation<boolean>(),
  skipHumanFeedback: Annotation<boolean>(),
  currentStep: Annotation<string>(),
  error: Annotation<string | undefined>(),
  researchId: Annotation<string | undefined>(),
  workspaceId: Annotation<string | undefined>(),
  userId: Annotation<string | undefined>(),
  idToken: Annotation<string | undefined>(),
  category: Annotation<string | undefined>(),
  subCategory: Annotation<string | undefined>(),
  type: Annotation<string | undefined>(),
  dataAgent: Annotation<DataManagementAgent | undefined>(),
  pdfResults: Annotation<any[] | undefined>(),
});

// Human feedback queue for storing feedback from users
const humanFeedbackQueue = new Map<string, string>();

// Get human feedback from the queue
export function getHumanFeedback(roomId: string): string | null {
  const feedback = humanFeedbackQueue.get(roomId);
  if (feedback) {
    humanFeedbackQueue.delete(roomId);
  }
  return feedback || null;
}

// Set human feedback in the queue
export function setHumanFeedback(roomId: string, feedback: string): void {
  humanFeedbackQueue.set(roomId, feedback);
}

/**
 * Run the book research process
 * @param query User query
 * @param peer WebSocket peer
 * @param roomId Room ID for human feedback
 * @param options Options for the research process
 */
export async function runBookResearch(
  query: string,
  peer: Peer,
  roomId: string,
  options: {
    skipHumanFeedback?: boolean;
    researchId?: string;
    workspaceId?: string;
    userId?: string;
    idToken?: string;
  } = {}
) {
  try {
    const config = useRuntimeConfig()
    console.log('OPEN', config.openaiKey)
    // Initialize LLM
    const llmHandler = new LLMHandler({
      provider: 'openai', // Use OpenAI for compatibility with the supervisor
      temperature: 0.2,
      model: 'gpt-4-turbo-preview',
      apiKey: config.openaiKey
    });
    
    // Get a ChatOpenAI instance for the supervisor
    const llm = await llmHandler.getChatOpenAI();
    
    // Initialize data agent if we have authentication details
    let dataAgent;
    if (options.idToken && options.userId && options.workspaceId) {
      try {
        dataAgent = new DataManagementAgent({
          idToken: options.idToken,
          userId: options.userId,
          workspaceId: options.workspaceId,
          llmProvider: 'openai',
          llmModel: 'gpt-4-turbo-preview'
        });
        
        await dataAgent.initialize();
        
        logger.info({ message: "Data management agent initialized" }, peer);
      } catch (agentError) {
        logger.error({ message: `Error initializing data agent: ${agentError}` }, peer);
      }
    }
    
    // Create the web scraper agent
    const webScraperAgent = createWebScraperAgent(llm);
    
    // Create the data management agent
    const dataManagementAgent = createDataManagementAgent(llm, dataAgent);
    
    // Create the supervisor
    const workflow = createSupervisor({
      agents: [webScraperAgent, dataManagementAgent],
      llm,
      prompt: 
        "You are a book research supervisor managing a web scraper agent and a data management agent. " +
        "For gathering information from websites, use web_scraper_agent. " +
        "For storing and retrieving data from the database, use data_management_agent. " +
        "Coordinate these agents to provide comprehensive book research results.",
      outputMode: "full_history"
    });
    
    // Create a checkpointer for human-in-the-loop functionality
    const checkpointer = new MemorySaver();
    
    // Compile the graph
    const graph = workflow.compile({
      name: "book_research",
      checkpointer
    });
    
    // Extract URLs from the query
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = query.match(urlRegex) || [];
    
    // Send status update
    peer.send(JSON.stringify({
      type: 'system',
      message: `Starting book research with ${urls.length} URLs`,
      timestamp: new Date().toISOString()
    }));
    
    // Update state
    peer.send(JSON.stringify({
      type: 'state_update',
      state: {
        currentStep: 'initializing_agents',
        urls
      },
      timestamp: new Date().toISOString()
    }));
    
    // Set up thread configuration
    const threadConfig = { 
      configurable: { 
        thread_id: roomId 
      } 
    };
    
    // Initial input
    const initialInput = {
      messages: [
        {
          role: "user",
          content: query
        }
      ],
      context: {
        urls,
        pdfPaths: [],
        workspaceId: options.workspaceId,
        userId: options.userId,
        idToken: options.idToken,
        skipHumanFeedback: options.skipHumanFeedback || false,
        researchId: options.researchId
      }
    };
    
    // Stream the results
    for await (const chunk of await graph.stream(initialInput, threadConfig)) {
      if (chunk.type === "__interrupt__") {
        // We need human feedback
        peer.send(JSON.stringify({
          type: 'human_feedback_request',
          data: chunk.data,
          timestamp: new Date().toISOString()
        }));
        
        // Update state
        peer.send(JSON.stringify({
          type: 'state_update',
          state: {
            currentStep: 'waiting_for_human_feedback',
            waitingForHuman: true
          },
          timestamp: new Date().toISOString()
        }));
        
        // Wait for human feedback
        let feedback = null;
        let attempts = 0;
        const maxAttempts = options.skipHumanFeedback ? 1 : 30;
        
        while (!feedback && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          feedback = getHumanFeedback(roomId);
          attempts++;
        }
        
        // If we're skipping human feedback or we timed out
        if (!feedback) {
          if (options.skipHumanFeedback) {
            feedback = "Proceed with the current analysis.";
          } else {
            feedback = "No feedback received, proceeding with current analysis.";
          }
        }
        
        // Update state
        peer.send(JSON.stringify({
          type: 'state_update',
          state: {
            currentStep: 'resuming_with_feedback',
            waitingForHuman: false,
            humanFeedback: feedback
          },
          timestamp: new Date().toISOString()
        }));
        
        // Resume the graph with the human's input
        for await (const resumeChunk of await graph.stream(
          new Command({ resume: feedback }),
          threadConfig
        )) {
          handleGraphOutput(resumeChunk, peer);
        }
      } else {
        handleGraphOutput(chunk, peer);
      }
    }
    
    // Send completion message
    peer.send(JSON.stringify({
      type: 'system',
      message: 'Book research completed',
      timestamp: new Date().toISOString()
    }));
    
  } catch (error) {
    logger.error({ message: `Error in book research: ${error}` }, peer);
    peer.send(JSON.stringify({
      type: 'error',
      message: `Error in book research: ${error}`,
      timestamp: new Date().toISOString()
    }));
  }
}

// Helper function to handle graph output
function handleGraphOutput(chunk: any, peer: Peer) {
  if (chunk.type === "agent_response") {
    peer.send(JSON.stringify({
      type: 'agent_update',
      agent: chunk.agent,
      message: chunk.message,
      timestamp: new Date().toISOString()
    }));
    
    // Update state
    peer.send(JSON.stringify({
      type: 'state_update',
      state: {
        currentStep: `agent_${chunk.agent}_working`
      },
      timestamp: new Date().toISOString()
    }));
  } else if (chunk.type === "final_response") {
    peer.send(JSON.stringify({
      type: 'assistant',
      message: chunk.message,
      timestamp: new Date().toISOString()
    }));
    
    // Update state
    peer.send(JSON.stringify({
      type: 'state_update',
      state: {
        currentStep: 'completed',
        response: chunk.message
      },
      timestamp: new Date().toISOString()
    }));
  }
}

const schema = z.object({
  books: z.array(
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      authors: z.array(
        z.object({
          name: z.string(),
          credentials: z.string().optional(),
        })
      ),
      publisher: z.string(),
      publication_date: z.string(),
      isbn_10: z.string(),
      isbn_13: z.string(),
      language: z.string(),
      price: z.string(),
      format: z.string(),
      dimensions: z.string(),
      weight: z.string(),
      cover_image: z.string(),
      description: z.string(),
      table_of_contents: z.string(),
      sample_content: z.string(),
      reviews: z.array(
        z.object({
          rating: z.string(),
          review: z.string(),
        })
      ),
      comments: z.array(
        z.object({
          comment: z.string(),
          rating: z.string(),
          date: z.string(),
        })
      ),
      categories: z.array(z.string()),
      related_books: z.array(
        z.object({
          title: z.string(),
          author: z.string(),
          cover_image: z.string(),
        })
      ),
      promotional_content: z.string(),
      sales_performance: z.object({
        best_sellers_rank: z.string(),
        estimated_daily_sales: z.string(),
        estimated_daily_royalties: z.string(),
        product_age: z.string(),
        price_information: z.string(),
      }),
    })
  ),
});
// Create the web scraper agent
function createWebScraperAgent(llm: ChatOpenAI) {
  // Define tools for web scraper
  const scrapeTool = tool(
    async (args: { url: string, prompt?: string }) => {
      try {
        const config = useRuntimeConfig()
        const webScraperAgent = new WebScraperAgent({
          firecrawlApiKey: config.firecrawlApiKey,
          llmProvider: 'openai',
          llmModel: 'gpt-4-turbo-preview',
          verbose: true
        });
        
        const result = await webScraperAgent.scrape(args.url, {
          type: 'extract',
          schema,
          prompt: args.prompt || "Extract all relevant information about books, including titles, authors, descriptions, pricing, formats, and sales data."
        });
        console.log('result from book scrape', result)
        return JSON.stringify(result.data);
      } catch (error) {
        return `Error scraping website: ${error}`;
      }
    },
    {
      name: "scrape_website",
      description: "Scrape a website for book information.",
      schema: z.object({
        url: z.string().describe("The URL to scrape"),
        prompt: z.string().optional().describe("Specific instructions for what to extract")
      })
    }
  );
  
  // Create the agent
  return createReactAgent({
    llm,
    tools: [scrapeTool],
    name: "web_scraper_agent",
    prompt: "You are a web scraping expert specialized in extracting book information from websites. Use the scrape_website tool to gather comprehensive data about books, including titles, authors, descriptions, pricing, formats, and sales data. Always provide structured, well-organized results."
  });
}

// Create the data management agent
function createDataManagementAgent(llm: ChatOpenAI, dataAgent?: DataManagementAgent) {
  // Define tools for data management
  const storeDataTool = tool(
    async (args: { collection: string, data: Record<string, any> }) => {
      if (!dataAgent) {
        return "Data agent not initialized. Cannot store data.";
      }
      
      try {
        const result = await dataAgent.createDocument(args.collection, args.data);
        return JSON.stringify(result);
      } catch (error) {
        return `Error storing data: ${error}`;
      }
    },
    {
      name: "store_data",
      description: "Store data in a Firestore collection.",
      schema: z.object({
        collection: z.string().describe("The collection to store data in"),
        data: z.record(z.any()).describe("The data to store")
      })
    }
  );
  
  const analyzeDataTool = tool(
    async (args: { data: any[] }) => {
      try {
        // This would be a more complex analysis in a real implementation
        return JSON.stringify({
          summary: "Analysis of book data",
          trends: [
            "Most successful books have clear, benefit-focused titles",
            "Professional covers with genre-appropriate imagery are common",
            "Compelling descriptions that highlight the value proposition",
            "Competitive pricing within the genre",
            "Multiple formats (ebook, paperback, audiobook) are offered"
          ],
          recommendations: [
            "Focus on clear titles that communicate benefits",
            "Invest in professional cover design",
            "Craft compelling descriptions",
            "Price competitively",
            "Offer multiple formats"
          ]
        });
      } catch (error) {
        return `Error analyzing data: ${error}`;
      }
    },
    {
      name: "analyze_data",
      description: "Analyze book data to identify trends and patterns.",
      schema: z.object({
        data: z.array(z.any()).describe("The book data to analyze")
      })
    }
  );
  
  const humanFeedbackTool = tool(
    async (args: { analysis: any }) => {
      // This will trigger the interrupt in the main graph
      return interrupt({
        analysis: args.analysis,
        message: "Please review this analysis and provide feedback or ask questions."
      });
    },
    {
      name: "request_human_feedback",
      description: "Request feedback from a human on the analysis.",
      schema: z.object({
        analysis: z.any().describe("The analysis to get feedback on")
      })
    }
  );
  
  // Create the agent
  return createReactAgent({
    llm,
    tools: [storeDataTool, analyzeDataTool, humanFeedbackTool],
    name: "data_management_agent",
    prompt: "You are a data management expert specialized in storing, analyzing, and interpreting book data. Use the store_data tool to save information to the database, the analyze_data tool to identify trends and patterns, and the request_human_feedback tool when you need input from a human. Always provide structured, well-organized results."
  });
}
