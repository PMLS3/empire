import { Calculator } from "@langchain/community/tools/calculator";
import { WebBrowser } from "langchain/tools/webbrowser";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import type { ToolConfig, ToolResult } from '../types/tools';
import { LLMHandler } from './llm';
import { EmbeddingsHandler } from './embeddings';
import { FirecrawlTool } from './tools/firecrawl';
import { 
  PerplexitySearchTool, 
  PerplexityChatTool, 
  PerplexityDocumentAnalysisTool,
  PerplexityNewsSearchTool,
  PerplexityWeatherTool
} from './tools/perplexity';
import {
  VertexImageAnalysisTool,
  VertexAudioAnalysisTool,
  VertexVideoAnalysisTool,
  VertexDocumentAnalysisTool,
  VertexMultiModalChatTool
} from './tools/vertex-ai';
import {
  DataAnalysisTool,
  DataVisualizationTool
} from './tools/data-analysis';
import { 
  FirestoreTool,
  FirestoreVectorTool,
  FirestoreTransactionTool
} from './tools/firestore';
import {
  SendGridEmailTool,
  SendGridTemplateEmailTool,
  SendGridContactsTool,
  SendGridListsTool
} from './tools/sendgrid';
import {
  TwilioSMSTool,
  TwilioWhatsAppTool,
  TwilioVoiceTool,
  TwilioVerifyTool,
  TwilioLookupTool
} from './tools/twilio';
import {
  LanguageDetectionTool,
  TranslationTool
} from './tools/language';
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
} from './tools/community-tools';

export class ToolsHandler {
  private config: ToolConfig;
  private runtimeConfig: any;

  constructor(config: ToolConfig) {
    this.config = config;
    // Get runtime config from global context if available
    this.runtimeConfig = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : {};
  }

 
  private getApiKey(provider: string): string {
    if (this.config.apiKey) {
      return this.config.apiKey;
    }

    const key = this.runtimeConfig[`${provider.toUpperCase()}_API_KEY`];
    if (key) {
      return key;
    }

    throw new Error(`No API key found for provider ${provider}`);
  }

  private async getTool() {
    switch (this.config.type) {
      case 'calculator':
        return new Calculator();

      case 'serpapi':
        return new SerpAPI(this.getApiKey('serpapi'));

      case 'webbrowser':
        const embeddingsHandler = new EmbeddingsHandler();
        const llmHandler = new LLMHandler();
        return new WebBrowser({ 
          model: await llmHandler.getLLMModel(),
          embeddings: await embeddingsHandler.getEmbeddingModel()
        });

      case 'tavily':
        return new TavilySearchResults({
          apiKey: this.getApiKey('tavily')
        });

      case 'firecrawl':
        return new FirecrawlTool(this.getApiKey('firecrawl'));

      case 'perplexity_search':
        return new PerplexitySearchTool(this.getApiKey('perplexity'));

      case 'perplexity_chat':
        return new PerplexityChatTool(this.getApiKey('perplexity'));

      case 'perplexity_document':
        return new PerplexityDocumentAnalysisTool(this.getApiKey('perplexity'));

      case 'perplexity_news':
        return new PerplexityNewsSearchTool(this.getApiKey('perplexity'));

      case 'perplexity_weather':
        return new PerplexityWeatherTool(this.getApiKey('perplexity'));

      case 'vertex_image':
        return new VertexImageAnalysisTool(
          this.config.projectId || (this.runtimeConfig.vertexProjectId as string),
          this.config.location || (this.runtimeConfig.vertexLocation as string),
          this.config.model as string
        );

      case 'vertex_audio':
        return new VertexAudioAnalysisTool(
          this.config.projectId || (this.runtimeConfig.vertexProjectId as string),
          this.config.location || (this.runtimeConfig.vertexLocation as string),
          this.config.model as string
        );

      case 'vertex_video':
        return new VertexVideoAnalysisTool(
          this.config.projectId || (this.runtimeConfig.vertexProjectId as string),
          this.config.location || (this.runtimeConfig.vertexLocation as string),
          this.config.model as string
        );

      case 'vertex_document':
        return new VertexDocumentAnalysisTool(
          this.config.projectId || (this.runtimeConfig.vertexProjectId as string),
          this.config.location || (this.runtimeConfig.vertexLocation as string),
          this.config.model as string
        );

      case 'vertex_multimodal_chat':
        return new VertexMultiModalChatTool(
          this.config.projectId || (this.runtimeConfig.vertexProjectId as string),
          this.config.location || (this.runtimeConfig.vertexLocation as string),
          this.config.model as string
        );

      case 'data_analysis':
        return new DataAnalysisTool();

      case 'data_visualization':
        return new DataVisualizationTool();

      // Community tools
      case 'wolfram_alpha':
        return new WolframAlphaToolWrapper(this.getApiKey('wolfram_alpha'));

      case 'wikipedia':
        return new WikipediaToolWrapper(
          this.config.options?.topKResults,
          this.config.options?.maxDocContentLength
        );

      case 'stack_exchange':
        return new StackExchangeToolWrapper(this.config.options?.queryType);

      case 'searxng_search':
        return new SearxngSearchToolWrapper(
          this.config.options?.engines,
          this.config.headers
        );

      case 'search_api':
        return new SearchApiToolWrapper(
          this.getApiKey('search_api'),
          this.config.options?.engine
        );

      case 'python_interpreter':
        // This requires async initialization, so it should be initialized separately
        throw new Error('Python interpreter tool requires separate initialization');

      case 'google_routes':
        return new GoogleRoutesToolWrapper();

      case 'google_places':
        return new GooglePlacesToolWrapper();

      case 'google_calendar_create':
        if (!this.config.options?.credentials || !this.config.options?.scopes || !this.config.options?.model) {
          throw new Error('Google Calendar Create tool requires credentials, scopes, and model');
        }
        return new GoogleCalendarCreateToolWrapper({
          credentials: this.config.options.credentials,
          scopes: this.config.options.scopes,
          model: this.config.options.model
        });

      case 'google_calendar_view':
        if (!this.config.options?.credentials || !this.config.options?.scopes || !this.config.options?.model) {
          throw new Error('Google Calendar View tool requires credentials, scopes, and model');
        }
        return new GoogleCalendarViewToolWrapper({
          credentials: this.config.options.credentials,
          scopes: this.config.options.scopes,
          model: this.config.options.model
        });

      case 'gmail_create_draft':
        return new GmailCreateDraftToolWrapper(this.config.options);

      case 'gmail_get_message':
        return new GmailGetMessageToolWrapper(this.config.options);

      case 'gmail_get_thread':
        return new GmailGetThreadToolWrapper(this.config.options);

      case 'gmail_search':
        return new GmailSearchToolWrapper(this.config.options);

      case 'gmail_send_message':
        return new GmailSendMessageToolWrapper(this.config.options);

      case 'duckduckgo_search':
        return new DuckDuckGoSearchToolWrapper(this.config.options?.maxResults);

      case 'discord_get_messages':
        return new DiscordGetMessagesToolWrapper();

      case 'discord_channel_search':
        return new DiscordChannelSearchToolWrapper();

      case 'discord_send_messages':
        return new DiscordSendMessagesToolWrapper();

      case 'discord_get_guilds':
        return new DiscordGetGuildsToolWrapper();

      case 'discord_get_text_channels':
        return new DiscordGetTextChannelsToolWrapper();

      case 'dad_joke':
        return new DadJokeToolWrapper();

      case 'dalle':
        return new DallEToolWrapper({
          n: this.config.options?.n,
          model: this.config.options?.model,
          apiKey: this.config.apiKey
        });

      // Firestore tools
      case 'firestore':
        if (!this.config.options?.idToken || !this.config.options?.userId || !this.config.options?.workspaceId) {
          throw new Error('Firestore tool requires idToken, userId, and workspaceId');
        }
        return new FirestoreTool(
          this.config.options.idToken,
          this.config.options.userId,
          this.config.options.workspaceId
        );

      case 'firestore_vector':
        if (!this.config.options?.idToken || !this.config.options?.userId || !this.config.options?.workspaceId) {
          throw new Error('Firestore vector tool requires idToken, userId, and workspaceId');
        }
        return new FirestoreVectorTool(
          this.config.options.idToken,
          this.config.options.userId,
          this.config.options.workspaceId
        );

      case 'firestore_transaction':
        if (!this.config.options?.idToken || !this.config.options?.userId || !this.config.options?.workspaceId) {
          throw new Error('Firestore transaction tool requires idToken, userId, and workspaceId');
        }
        return new FirestoreTransactionTool(
          this.config.options.idToken,
          this.config.options.userId,
          this.config.options.workspaceId
        );
        
      // SendGrid tools
      case 'sendgrid_email':
        if (!this.config.options?.apiKey || !this.config.options?.defaultFrom) {
          throw new Error('SendGrid email tool requires apiKey and defaultFrom');
        }
        return new SendGridEmailTool(
          this.config.options.apiKey,
          this.config.options.defaultFrom
        );
        
      case 'sendgrid_template_email':
        if (!this.config.options?.apiKey || !this.config.options?.defaultFrom) {
          throw new Error('SendGrid template email tool requires apiKey and defaultFrom');
        }
        return new SendGridTemplateEmailTool(
          this.config.options.apiKey,
          this.config.options.defaultFrom
        );
        
      case 'sendgrid_contacts':
        if (!this.config.options?.apiKey) {
          throw new Error('SendGrid contacts tool requires apiKey');
        }
        return new SendGridContactsTool(
          this.config.options.apiKey
        );
        
      case 'sendgrid_lists':
        if (!this.config.options?.apiKey) {
          throw new Error('SendGrid lists tool requires apiKey');
        }
        return new SendGridListsTool(
          this.config.options.apiKey
        );
        
      // Twilio tools
      case 'twilio_sms':
        if (!this.config.options?.accountSid || !this.config.options?.authToken || !this.config.options?.defaultFrom) {
          throw new Error('Twilio SMS tool requires accountSid, authToken, and defaultFrom');
        }
        return new TwilioSMSTool(
          this.config.options.accountSid,
          this.config.options.authToken,
          this.config.options.defaultFrom
        );
        
      case 'twilio_whatsapp':
        if (!this.config.options?.accountSid || !this.config.options?.authToken || !this.config.options?.defaultFrom) {
          throw new Error('Twilio WhatsApp tool requires accountSid, authToken, and defaultFrom');
        }
        return new TwilioWhatsAppTool(
          this.config.options.accountSid,
          this.config.options.authToken,
          this.config.options.defaultFrom
        );
        
      case 'twilio_voice':
        if (!this.config.options?.accountSid || !this.config.options?.authToken || !this.config.options?.defaultFrom) {
          throw new Error('Twilio Voice tool requires accountSid, authToken, and defaultFrom');
        }
        return new TwilioVoiceTool(
          this.config.options.accountSid,
          this.config.options.authToken,
          this.config.options.defaultFrom
        );
        
      case 'twilio_verify':
        if (!this.config.options?.accountSid || !this.config.options?.authToken || !this.config.options?.serviceSid) {
          throw new Error('Twilio Verify tool requires accountSid, authToken, and serviceSid');
        }
        return new TwilioVerifyTool(
          this.config.options.accountSid,
          this.config.options.authToken,
          this.config.options.serviceSid
        );
        
      case 'twilio_lookup':
        if (!this.config.options?.accountSid || !this.config.options?.authToken) {
          throw new Error('Twilio Lookup tool requires accountSid and authToken');
        }
        return new TwilioLookupTool(
          this.config.options.accountSid,
          this.config.options.authToken
        );
        
      // Language tools
      case 'language_detection':
        return new LanguageDetectionTool(
          this.config.options?.apiKey
        );
        
      case 'translation':
        return new TranslationTool(
          this.config.options?.apiKey
        );

      default:
        throw new Error(`Unsupported tool type: ${this.config.type}`);
    }
  }

  async run(input: string): Promise<ToolResult> {
    try {
      const tool = await this.getTool();
      const result = await tool.invoke(input);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error(`Error running tool ${this.config.type}:`, error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
