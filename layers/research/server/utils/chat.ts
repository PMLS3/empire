import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGroq } from "@langchain/groq";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatVertexAI } from "@langchain/google-vertexai";
import type { ChatConfig, ChatMessage, ChatResponse } from '../types/chat';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';

export class ChatHandler {
  private config: ChatConfig;
  private runtimeConfig = useRuntimeConfig();

  constructor(config?: Partial<ChatConfig>) {
    this.config = {
      provider: 'vertexai',
      temperature: 0,
      ...config
    };
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

  private convertMessages(messages: ChatMessage[]) {
    return messages.map(msg => {
      switch (msg.role) {
        case 'system':
          return new SystemMessage(msg.content);
        case 'user':
          return new HumanMessage(msg.content);
        case 'assistant':
          return new AIMessage(msg.content);
        default:
          throw new Error(`Unknown message role: ${msg.role}`);
      }
    });
  }

  private async getChatModel() {
    const baseConfig = {
      temperature: this.config.temperature ?? 0,
      maxTokens: this.config.maxTokens,
      topP: this.config.topP,
    };

    switch (this.config.provider) {
      case 'vertexai':
        return new ChatVertexAI({
          ...baseConfig,
          model: this.config.model || 'gemini-1.5-pro',
          authOptions: {
            credentials: this.config.credentials ? JSON.parse(this.config.credentials) : undefined
          }
        });

      case 'openai':
        return new ChatOpenAI({
          ...baseConfig,
          openAIApiKey: this.getApiKey('openai'),
          model: this.config.model || 'gpt-4-turbo-preview'
        });

      case 'anthropic':
        return new ChatAnthropic({
          ...baseConfig,
          anthropicApiKey: this.getApiKey('anthropic'),
          model: this.config.model || 'claude-3-sonnet-20240229'
        });

      case 'groq':
        return new ChatGroq({
          ...baseConfig,
          apiKey: this.getApiKey('groq'),
          model: this.config.model || 'mixtral-8x7b-32768'
        });

      case 'fireworks':
        return new ChatFireworks({
          ...baseConfig,
          apiKey: this.getApiKey('fireworks'),
          model: this.config.model || 'accounts/fireworks/models/llama-v3-7b'
        });

      case 'mistral':
        return new ChatMistralAI({
          ...baseConfig,
          apiKey: this.getApiKey('mistral'),
          model: this.config.model || 'mistral-large-latest'
        });

      default:
        throw new Error(`Unsupported chat provider: ${this.config.provider}`);
    }
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    try {
      const model = await this.getChatModel();
      const langchainMessages = this.convertMessages(messages);
      const response = await model.invoke(langchainMessages);

      return {
        content: response.content.toString(),
        usage: response.additional_kwargs?.usage as { promptTokens?: number; completionTokens?: number; totalTokens?: number }
      };
    } catch (error) {
      console.error('Error in chat:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async streamChat(messages: ChatMessage[]) {
    try {
      const model = await this.getChatModel();
      const langchainMessages = this.convertMessages(messages);
      return await model.stream(langchainMessages);
    } catch (error) {
      console.error('Error in stream chat:', error);
      throw error;
    }
  }
} 