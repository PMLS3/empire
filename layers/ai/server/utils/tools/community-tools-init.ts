import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
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

// Import our tool wrappers
import {
  WolframAlphaToolWrapper,
  WikipediaToolWrapper,
  WebBrowserToolWrapper,
  TavilySearchToolWrapper,
  StackExchangeToolWrapper,
  SearxngSearchToolWrapper,
  SearchApiToolWrapper,
  PythonInterpreterToolWrapper,
  GoogleRoutesToolWrapper,
  GooglePlacesToolWrapper,
  CalculatorToolWrapper,
  GoogleCalendarCreateToolWrapper,
  GoogleCalendarViewToolWrapper,
  GmailCreateDraftToolWrapper,
  GmailGetMessageToolWrapper,
  GmailGetThreadToolWrapper,
  GmailSearchToolWrapper,
  GmailSendMessageToolWrapper,
  DuckDuckGoSearchToolWrapper,
  DiscordGetMessagesToolWrapper,
  DiscordChannelSearchToolWrapper,
  DiscordSendMessagesToolWrapper,
  DiscordGetGuildsToolWrapper,
  DiscordGetTextChannelsToolWrapper,
  DadJokeToolWrapper,
  DallEToolWrapper
} from './community-tools';

export const wolframAlphaToolInit = (id: string) => {
  return new WolframAlphaToolWrapper(id);
};

export const wikipediaToolInit = (
  topKResults: number = 3,
  maxDocContentLength: number = 4000
) => {
  return new WikipediaToolWrapper(topKResults, maxDocContentLength);
};

export const webBrowserToolInit = (model: any, embeddings: any) => {
  return new WebBrowserToolWrapper(model, embeddings);
};

export const tavilySearchToolInit = (params: {
  apiKey: string;
  maxResults?: number;
}) => {
  const { apiKey, maxResults = 3 } = params;
  return new TavilySearchToolWrapper(apiKey, maxResults);
};

export const stackExchangeToolInit = (queryType?: "title" | "question") => {
  return new StackExchangeToolWrapper(queryType);
};

export const searxngSearchToolInit = (
  engines: string = "google",
  headers: Record<string, string> = {}
) => {
  return new SearxngSearchToolWrapper(engines, headers);
};

export const searchApiToolInit = (
  apiKey: string,
  engine: string = "google_news"
) => {
  return new SearchApiToolWrapper(apiKey, engine);
};

export const pythonInterpreterToolInit = async (
  indexURL: string = "../node_modules/pyodide"
) => {
  return await PythonInterpreterToolWrapper.initialize(indexURL);
};

export const googleRoutesToolInit = () => {
  return new GoogleRoutesToolWrapper();
};

export const googlePlacesToolInit = () => {
  return new GooglePlacesToolWrapper();
};

export const calculatorToolInit = () => {
  return new CalculatorToolWrapper();
};

interface GoogleCalendarParams {
  credentials: {
    clientEmail: string;
    privateKey: string;
    calendarId: string;
  };
  scopes: string[];
  model: any;
}

export const googleCalendarCreateToolInit = (params: GoogleCalendarParams) => {
  return new GoogleCalendarCreateToolWrapper(params);
};

export const googleCalendarViewToolInit = (params: GoogleCalendarParams) => {
  return new GoogleCalendarViewToolWrapper(params);
};

interface GmailToolParams {
  credentials?: {
    clientEmail: string;
    privateKey: string;
  };
  scopes?: string[];
}

const defaultGmailParams: GmailToolParams = {
  scopes: ["https://mail.google.com/"],
};

export const gmailCreateDraftToolInit = (
  params: GmailToolParams = defaultGmailParams
) => {
  return new GmailCreateDraftToolWrapper(params);
};

export const gmailGetMessageToolInit = (
  params: GmailToolParams = defaultGmailParams
) => {
  return new GmailGetMessageToolWrapper(params);
};

export const gmailGetThreadToolInit = (
  params: GmailToolParams = defaultGmailParams
) => {
  return new GmailGetThreadToolWrapper(params);
};

export const gmailSearchToolInit = (
  params: GmailToolParams = defaultGmailParams
) => {
  return new GmailSearchToolWrapper(params);
};

export const gmailSendMessageToolInit = (
  params: GmailToolParams = defaultGmailParams
) => {
  return new GmailSendMessageToolWrapper(params);
};

export const duckDuckGoSearchToolInit = (maxResults: number = 1) => {
  return new DuckDuckGoSearchToolWrapper(maxResults);
};

export const discordGetMessagesToolInit = () => {
  return new DiscordGetMessagesToolWrapper();
};

export const discordChannelSearchToolInit = () => {
  return new DiscordChannelSearchToolWrapper();
};

export const discordSendMessagesToolInit = () => {
  return new DiscordSendMessagesToolWrapper();
};

export const discordGetGuildsToolInit = () => {
  return new DiscordGetGuildsToolWrapper();
};

export const discordGetTextChannelsToolInit = () => {
  return new DiscordGetTextChannelsToolWrapper();
};

export const dadJokeToolInit = () => {
  return new DadJokeToolWrapper();
};

interface DallEAPIWrapperParams {
  n?: number;
  model?: string;
  apiKey?: string;
}

export const dallEToolInit = (params: DallEAPIWrapperParams = {}) => {
  return new DallEToolWrapper(params);
};

export async function callModel(
  llm: any,
  state: typeof MessagesAnnotation.State
): Promise<typeof MessagesAnnotation.Update> {
  const response = await llm.invoke([
    {
      role: "system",
    },
    ...state.messages,
  ]);

  // We return a list, because this will get added to the existing list
  return { messages: [response] };
}

// Define the function that determines whether to continue or not
export function routeModelOutput(
  state: typeof MessagesAnnotation.State
): string {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  // If the LLM is invoking tools, route there.
  if ((lastMessage as AIMessage)?.tool_calls?.length || 0 > 0) {
    return "tools";
  }
  // Otherwise end the graph.
  else {
    return "__end__";
  }
}
