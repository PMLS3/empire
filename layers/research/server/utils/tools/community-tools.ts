import { Tool } from "@langchain/core/tools";
import { WolframAlphaTool } from "@langchain/community/tools/wolframalpha";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";
import { WebBrowser } from "langchain/tools/webbrowser";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { StackExchangeAPI } from "@langchain/community/tools/stackexchange";
import { SearxngSearch } from "@langchain/community/tools/searxng_search";
import { SearchApi } from "@langchain/community/tools/searchapi";
import { PythonInterpreterTool } from "@langchain/community/experimental/tools/pyinterpreter";
import { GoogleRoutesAPI } from "@langchain/community/tools/google_routes";
import { GooglePlacesAPI } from "@langchain/community/tools/google_places";
import { Calculator } from "@langchain/community/tools/calculator";
import {
  GoogleCalendarCreateTool,
  GoogleCalendarViewTool,
} from "@langchain/community/tools/google_calendar";
import {
  GmailCreateDraft,
  GmailGetMessage,
  GmailGetThread,
  GmailSearch,
  GmailSendMessage,
} from "@langchain/community/tools/gmail";
import { ExaSearchResults } from "@langchain/exa";
import Exa from "exa-js";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import {
  DiscordGetMessagesTool,
  DiscordChannelSearchTool,
  DiscordSendMessagesTool,
  DiscordGetGuildsTool,
  DiscordGetTextChannelsTool,
} from "@langchain/community/tools/discord";
import { DadJokeAPI } from "@langchain/community/tools/dadjokeapi";
import { DallEAPIWrapper } from "@langchain/openai";

export class WolframAlphaToolWrapper extends Tool {
  name = "wolfram_alpha";
  description = "A tool for querying Wolfram Alpha for mathematical and scientific computations. Input should be a mathematical or scientific query.";
  
  private tool: WolframAlphaTool;

  constructor(appid: string) {
    super();
    this.tool = new WolframAlphaTool({ appid });
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      return await this.tool.invoke(input);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Wolfram Alpha error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Wolfram Alpha');
    }
  }
}

export class WikipediaToolWrapper extends Tool {
  name = "wikipedia";
  description = "A tool for searching Wikipedia. Input should be a search query.";
  
  private tool: WikipediaQueryRun;

  constructor(topKResults: number = 3, maxDocContentLength: number = 4000) {
    super();
    this.tool = new WikipediaQueryRun({ topKResults, maxDocContentLength });
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      return await this.tool.invoke(input);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Wikipedia error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Wikipedia search');
    }
  }
}

export class WebBrowserToolWrapper extends Tool {
  name = "web_browser";
  description = "A tool for browsing the web. Input should be a URL to visit.";
  
  private tool: WebBrowser;

  constructor(model: any, embeddings: any) {
    super();
    this.tool = new WebBrowser({ model, embeddings });
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      return await this.tool.invoke(input);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Web browser error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in web browser');
    }
  }
}

export class TavilySearchToolWrapper extends Tool {
  name = "tavily_search";
  description = "A tool for searching the web using Tavily. Input should be a search query.";
  
  private tool: TavilySearchResults;

  constructor(apiKey: string, maxResults: number = 3) {
    super();
    this.tool = new TavilySearchResults({ apiKey, maxResults });
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Tavily search error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Tavily search');
    }
  }
}

export class StackExchangeToolWrapper extends Tool {
  name = "stack_exchange";
  description = "A tool for searching Stack Exchange. Input should be a search query.";
  
  private tool: StackExchangeAPI;

  constructor(queryType?: "title" | "question") {
    super();
    this.tool = new StackExchangeAPI({ queryType });
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      return await this.tool.invoke(input);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Stack Exchange error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Stack Exchange search');
    }
  }
}

export class SearxngSearchToolWrapper extends Tool {
  name = "searxng_search";
  description = "A tool for searching the web using SearXNG. Input should be a search query.";
  
  private tool: SearxngSearch;

  constructor(engines: string = "google", headers: Record<string, string> = {}) {
    super();
    this.tool = new SearxngSearch({
      params: {
        format: "json",
        engines,
      },
      headers,
    });
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`SearXNG search error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in SearXNG search');
    }
  }
}

export class SearchApiToolWrapper extends Tool {
  name = "search_api";
  description = "A tool for searching the web using Search API. Input should be a search query.";
  
  private tool: SearchApi;

  constructor(apiKey: string, engine: string = "google_news") {
    super();
    this.tool = new SearchApi(apiKey, { engine });
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Search API error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Search API');
    }
  }
}

export class PythonInterpreterToolWrapper extends Tool {
  name = "python_interpreter";
  description = "A tool for executing Python code. Input should be valid Python code.";
  
  private tool: PythonInterpreterTool;

  constructor(tool: PythonInterpreterTool) {
    super();
    this.tool = tool;
  }

  static async initialize(indexURL: string = "../node_modules/pyodide"): Promise<PythonInterpreterToolWrapper> {
    const tool = await PythonInterpreterTool.initialize({ indexURL });
    return new PythonInterpreterToolWrapper(tool);
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      return await this.tool.invoke(input);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Python interpreter error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Python interpreter');
    }
  }
}

export class GoogleRoutesToolWrapper extends Tool {
  name = "google_routes";
  description = "A tool for getting route information using Google Routes API. Input should be a JSON string with 'origin' and 'destination'.";
  
  private tool: GoogleRoutesAPI;

  constructor() {
    super();
    this.tool = new GoogleRoutesAPI();
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const result = await this.tool.invoke(params);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Google Routes error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Google Routes');
    }
  }
}

export class GooglePlacesToolWrapper extends Tool {
  name = "google_places";
  description = "A tool for searching places using Google Places API. Input should be a search query.";
  
  private tool: GooglePlacesAPI;

  constructor() {
    super();
    this.tool = new GooglePlacesAPI();
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Google Places error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Google Places');
    }
  }
}

export class CalculatorToolWrapper extends Tool {
  name = "calculator";
  description = "A tool for performing mathematical calculations. Input should be a mathematical expression.";
  
  private tool: Calculator;

  constructor() {
    super();
    this.tool = new Calculator();
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      return await this.tool.invoke(input);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Calculator error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Calculator');
    }
  }
}

export class GoogleCalendarCreateToolWrapper extends Tool {
  name = "google_calendar_create";
  description = "A tool for creating events in Google Calendar. Input should be a JSON string with event details.";
  
  private tool: GoogleCalendarCreateTool;

  constructor(params: {
    credentials: {
      clientEmail: string;
      privateKey: string;
      calendarId: string;
    };
    scopes: string[];
    model: any;
  }) {
    super();
    this.tool = new GoogleCalendarCreateTool(params);
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Google Calendar Create error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Google Calendar Create');
    }
  }
}

export class GoogleCalendarViewToolWrapper extends Tool {
  name = "google_calendar_view";
  description = "A tool for viewing events in Google Calendar. Input should be a JSON string with query parameters.";
  
  private tool: GoogleCalendarViewTool;

  constructor(params: {
    credentials: {
      clientEmail: string;
      privateKey: string;
      calendarId: string;
    };
    scopes: string[];
    model: any;
  }) {
    super();
    this.tool = new GoogleCalendarViewTool(params);
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Google Calendar View error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Google Calendar View');
    }
  }
}

export class GmailCreateDraftToolWrapper extends Tool {
  name = "gmail_create_draft";
  description = "A tool for creating draft emails in Gmail. Input should be a JSON string with email details.";
  
  private tool: GmailCreateDraft;

  constructor(params: {
    credentials?: {
      clientEmail: string;
      privateKey: string;
    };
    scopes?: string[];
  } = {
    scopes: ["https://mail.google.com/"],
  }) {
    super();
    this.tool = new GmailCreateDraft(params);
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Gmail Create Draft error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Gmail Create Draft');
    }
  }
}

export class GmailGetMessageToolWrapper extends Tool {
  name = "gmail_get_message";
  description = "A tool for getting a specific email message from Gmail. Input should be a message ID.";
  
  private tool: GmailGetMessage;

  constructor(params: {
    credentials?: {
      clientEmail: string;
      privateKey: string;
    };
    scopes?: string[];
  } = {
    scopes: ["https://mail.google.com/"],
  }) {
    super();
    this.tool = new GmailGetMessage(params);
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Gmail Get Message error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Gmail Get Message');
    }
  }
}

export class GmailGetThreadToolWrapper extends Tool {
  name = "gmail_get_thread";
  description = "A tool for getting a specific email thread from Gmail. Input should be a thread ID.";
  
  private tool: GmailGetThread;

  constructor(params: {
    credentials?: {
      clientEmail: string;
      privateKey: string;
    };
    scopes?: string[];
  } = {
    scopes: ["https://mail.google.com/"],
  }) {
    super();
    this.tool = new GmailGetThread(params);
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Gmail Get Thread error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Gmail Get Thread');
    }
  }
}

export class GmailSearchToolWrapper extends Tool {
  name = "gmail_search";
  description = "A tool for searching emails in Gmail. Input should be a search query.";
  
  private tool: GmailSearch;

  constructor(params: {
    credentials?: {
      clientEmail: string;
      privateKey: string;
    };
    scopes?: string[];
  } = {
    scopes: ["https://mail.google.com/"],
  }) {
    super();
    this.tool = new GmailSearch(params);
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Gmail Search error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Gmail Search');
    }
  }
}

export class GmailSendMessageToolWrapper extends Tool {
  name = "gmail_send_message";
  description = "A tool for sending emails through Gmail. Input should be a JSON string with email details.";
  
  private tool: GmailSendMessage;

  constructor(params: {
    credentials?: {
      clientEmail: string;
      privateKey: string;
    };
    scopes?: string[];
  } = {
    scopes: ["https://mail.google.com/"],
  }) {
    super();
    this.tool = new GmailSendMessage(params);
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Gmail Send Message error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Gmail Send Message');
    }
  }
}

export class ExaSearchToolWrapper extends Tool {
  name = "exa_search";
  description = "A tool for searching the web using Exa. Input should be a search query.";
  
  private tool: ExaSearchResults;

  constructor(apiKey: string, numResults: number = 2) {
    super();
    const client = new Exa(apiKey);
    this.tool = new ExaSearchResults({
      client,
      searchArgs: {
        numResults,
      },
    });
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Exa search error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Exa search');
    }
  }
}

export class DuckDuckGoSearchToolWrapper extends Tool {
  name = "duckduckgo_search";
  description = "A tool for searching the web using DuckDuckGo. Input should be a search query.";
  
  private tool: DuckDuckGoSearch;

  constructor(maxResults: number = 1) {
    super();
    this.tool = new DuckDuckGoSearch({ maxResults });
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`DuckDuckGo search error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in DuckDuckGo search');
    }
  }
}

export class DiscordGetMessagesToolWrapper extends Tool {
  name = "discord_get_messages";
  description = "A tool for getting messages from Discord. Input should be a JSON string with channel ID and optional parameters.";
  
  private tool: DiscordGetMessagesTool;

  constructor() {
    super();
    this.tool = new DiscordGetMessagesTool();
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Discord Get Messages error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Discord Get Messages');
    }
  }
}

export class DiscordChannelSearchToolWrapper extends Tool {
  name = "discord_channel_search";
  description = "A tool for searching channels in Discord. Input should be a search query.";
  
  private tool: DiscordChannelSearchTool;

  constructor() {
    super();
    this.tool = new DiscordChannelSearchTool();
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Discord Channel Search error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Discord Channel Search');
    }
  }
}

export class DiscordSendMessagesToolWrapper extends Tool {
  name = "discord_send_messages";
  description = "A tool for sending messages to Discord. Input should be a JSON string with channel ID and message content.";
  
  private tool: DiscordSendMessagesTool;

  constructor() {
    super();
    this.tool = new DiscordSendMessagesTool();
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Discord Send Messages error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Discord Send Messages');
    }
  }
}

export class DiscordGetGuildsToolWrapper extends Tool {
  name = "discord_get_guilds";
  description = "A tool for getting guilds from Discord. Input should be an empty string.";
  
  private tool: DiscordGetGuildsTool;

  constructor() {
    super();
    this.tool = new DiscordGetGuildsTool();
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Discord Get Guilds error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Discord Get Guilds');
    }
  }
}

export class DiscordGetTextChannelsToolWrapper extends Tool {
  name = "discord_get_text_channels";
  description = "A tool for getting text channels from Discord. Input should be a guild ID.";
  
  private tool: DiscordGetTextChannelsTool;

  constructor() {
    super();
    this.tool = new DiscordGetTextChannelsTool();
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Discord Get Text Channels error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Discord Get Text Channels');
    }
  }
}

export class DadJokeToolWrapper extends Tool {
  name = "dad_joke";
  description = "A tool for getting dad jokes. Input should be a search term.";
  
  private tool: DadJokeAPI;

  constructor() {
    super();
    this.tool = new DadJokeAPI();
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      return await this.tool.invoke(input);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Dad Joke API error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Dad Joke API');
    }
  }
}

export class DallEToolWrapper extends Tool {
  name = "dalle";
  description = "A tool for generating images using DALL-E. Input should be a text prompt describing the image to generate.";
  
  private tool: DallEAPIWrapper;

  constructor(params: {
    n?: number;
    model?: string;
    apiKey?: string;
  } = {}) {
    super();
    this.tool = new DallEAPIWrapper({
      n: params.n ?? 1,
      model: params.model ?? "dall-e-3",
      apiKey: params.apiKey ?? process.env.OPENAI_API_KEY,
    });
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const result = await this.tool.invoke(input);
      return JSON.stringify(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`DALL-E error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in DALL-E');
    }
  }
}
