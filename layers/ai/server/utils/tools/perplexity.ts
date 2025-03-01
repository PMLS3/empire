import { Tool } from "@langchain/core/tools";
import { z } from "zod";
import OpenAI from "openai";

export class PerplexitySearchTool extends Tool {
  name = "perplexity_search";
  description = "A tool for searching the web using Perplexity AI. Input should be a search query string.";
  
  private client: OpenAI;
  private defaultModel: string;

  constructor(apiKey: string, model: string = "pplx-70b-online") {
    super();
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.perplexity.ai"
    });
    this.defaultModel = model;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: "system", content: "You are a helpful assistant that searches the web for information." },
          { role: "user", content: input }
        ]
      });

      return response.choices[0].message.content || "No results found";
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Perplexity search error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Perplexity search');
    }
  }
}

export class PerplexityChatTool extends Tool {
  name = "perplexity_chat";
  description = "A tool for having a conversation with Perplexity AI. Input should be a JSON string with 'message' (required) and 'chat_id' (optional to continue a conversation).";
  
  private client: OpenAI;
  private defaultModel: string;
  private conversations: Map<string, Array<OpenAI.Chat.ChatCompletionMessageParam>>;

  constructor(apiKey: string, model: string = "pplx-70b-chat") {
    super();
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.perplexity.ai"
    });
    this.defaultModel = model;
    this.conversations = new Map();
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { message, chat_id } = params;

      if (!message) {
        throw new Error("Message is required");
      }

      // Get or create conversation history
      let conversation: Array<OpenAI.Chat.ChatCompletionMessageParam> = [];
      
      if (chat_id && this.conversations.has(chat_id)) {
        conversation = this.conversations.get(chat_id) || [];
      } else {
        // Initialize with system message
        conversation = [
          { role: "system", content: "You are a helpful assistant that provides accurate and detailed information." }
        ];
      }

      // Add user message
      conversation.push({ role: "user", content: message });

      // Get response from Perplexity
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: conversation
      });

      const assistantMessage = response.choices[0].message;
      
      // Add assistant response to conversation history
      if (assistantMessage) {
        conversation.push(assistantMessage);
      }

      // Generate a new chat ID if not provided
      const newChatId = chat_id || `chat_${Date.now()}`;
      
      // Store updated conversation
      this.conversations.set(newChatId, conversation);

      return JSON.stringify({
        chat_id: newChatId,
        response: assistantMessage.content || "No response",
        conversation_length: conversation.length
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Perplexity chat error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Perplexity chat');
    }
  }
}

export class PerplexityDocumentAnalysisTool extends Tool {
  name = "perplexity_document_analysis";
  description = "A tool for analyzing documents using Perplexity AI. Input should be a JSON string with 'url' (document URL) and 'query' (what to analyze about the document).";
  
  private client: OpenAI;
  private defaultModel: string;

  constructor(apiKey: string, model: string = "pplx-70b-online") {
    super();
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.perplexity.ai"
    });
    this.defaultModel = model;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { url, query } = params;

      if (!url) {
        throw new Error("Document URL is required");
      }

      const prompt = query 
        ? `Analyze the document at ${url}. ${query}`
        : `Analyze the document at ${url}. Provide a comprehensive summary and key insights.`;

      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: "system", content: "You are a document analysis expert that provides detailed insights and summaries." },
          { role: "user", content: prompt }
        ]
      });

      return response.choices[0].message.content || "No analysis results";
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Perplexity document analysis error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Perplexity document analysis');
    }
  }
}

export class PerplexityNewsSearchTool extends Tool {
  name = "perplexity_news";
  description = "A tool for searching news using Perplexity AI. Input should be a JSON string with 'query' (search query), 'days' (optional, how recent the news should be), and 'sources' (optional array of preferred news sources).";
  
  private client: OpenAI;
  private defaultModel: string;

  constructor(apiKey: string, model: string = "pplx-70b-online") {
    super();
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.perplexity.ai"
    });
    this.defaultModel = model;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { query, days = 7, sources = [] } = params;

      if (!query) {
        throw new Error("News search query is required");
      }

      let prompt = `Find the latest news about "${query}" from the past ${days} days.`;
      
      if (sources && sources.length > 0) {
        prompt += ` Prefer sources like ${sources.join(', ')}.`;
      }
      
      prompt += " Format the results as a list of news items with title, source, date, and a brief summary.";

      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: "system", content: "You are a news research assistant that provides accurate and recent news information." },
          { role: "user", content: prompt }
        ]
      });

      return response.choices[0].message.content || "No news found";
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Perplexity news search error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Perplexity news search');
    }
  }
}

export class PerplexityWeatherTool extends Tool {
  name = "perplexity_weather";
  description = "A tool for getting weather information using Perplexity AI. Input should be a JSON string with 'location' (required) and 'days' (optional forecast days, default 3).";
  
  private client: OpenAI;
  private defaultModel: string;

  constructor(apiKey: string, model: string = "pplx-70b-online") {
    super();
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.perplexity.ai"
    });
    this.defaultModel = model;
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { location, days = 3 } = params;

      if (!location) {
        throw new Error("Location is required");
      }

      const prompt = `What's the weather forecast for ${location} for the next ${days} days? Include temperature, precipitation, and general conditions.`;

      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: "system", content: "You are a weather information assistant that provides accurate and detailed weather forecasts." },
          { role: "user", content: prompt }
        ]
      });

      return response.choices[0].message.content || "No weather information found";
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Perplexity weather error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Perplexity weather');
    }
  }
}
