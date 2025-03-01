import { OpenAI } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { AzureOpenAI } from "@langchain/openai";
import { Ollama } from "@langchain/ollama";
import { AI21 } from "@langchain/community/llms/ai21";
import { AlephAlpha } from "@langchain/community/llms/aleph_alpha";
import { Bedrock } from "@langchain/community/llms/bedrock";
import { ChromeAI } from "@langchain/community/experimental/llms/chrome_ai";
import { Cohere } from "@langchain/cohere";
import { DeepInfraLLM } from "@langchain/community/llms/deepinfra";
import { Fireworks } from "@langchain/community/llms/fireworks";
import { Friendli } from "@langchain/community/llms/friendli";
import { VertexAI } from "@langchain/google-vertexai";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { MistralAI } from "@langchain/mistralai";
import { SageMakerEndpoint } from "@langchain/community/llms/sagemaker_endpoint";
import type { LLMConfig } from '../types/llm';

export class LLMHandler {
  private config: LLMConfig;
  private runtimeConfig = useRuntimeConfig();

  constructor(config?: Partial<LLMConfig>) {
    this.config = {
      provider: 'vertexai',
      temperature: 0,
      maxRetries: 2,
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

  async getLLMModel() {
    const baseConfig = {
      temperature: this.config.temperature ?? 0,
      maxTokens: this.config.maxTokens,
      maxRetries: this.config.maxRetries ?? 2,
    };

    switch (this.config.provider) {
      case 'vertexai':
        return new VertexAI({
          ...baseConfig,
          model: this.config.model || 'gemini-1.5-pro',
          authOptions: {
            credentials: this.config.googleApplicationCredentials,
            projectId: this.config.projectId,
          }
        });

      case 'openai':
        return new OpenAI({
          ...baseConfig,
          apiKey: this.getApiKey('openai'),
          model: this.config.model || 'gpt-4-turbo-preview'
        });

      case 'azure':
        return new AzureOpenAI({
          ...baseConfig,
          azureOpenAIApiKey: this.getApiKey('azure'),
          azureOpenAIApiInstanceName: this.config.azureApiInstanceName,
          azureOpenAIApiVersion: this.config.azureApiVersion,
          azureOpenAIApiDeploymentName: this.config.azureDeploymentName,
          model: this.config.model || 'gpt-4'
        });

      case 'ollama':
        return new Ollama({
          ...baseConfig,
          model: this.config.model || 'llama2'
        });

      case 'ai21':
        return new AI21({
          ...baseConfig,
          ai21ApiKey: this.getApiKey('ai21')
        });

      case 'alephalpha':
        return new AlephAlpha({
          ...baseConfig,
          aleph_alpha_api_key: this.getApiKey('alephalpha')
        });

      case 'bedrock':
        return new Bedrock({
          ...baseConfig,
          model: this.config.model || 'anthropic.claude-v2',
          region: this.config.awsRegion,
          credentials: {
            accessKeyId: this.config.awsAccessKeyId || this.runtimeConfig.AWS_ACCESS_KEY_ID,
            secretAccessKey: this.config.awsSecretAccessKey || this.runtimeConfig.AWS_SECRET_ACCESS_KEY
          },
          endpointUrl: this.config.endpointUrl
        });

      case 'chrome':
        return new ChromeAI({
          ...baseConfig
        });

      case 'cohere':
        return new Cohere({
          ...baseConfig,
          apiKey: this.getApiKey('cohere'),
          model: this.config.model || 'command'
        });

      case 'deepinfra':
        return new DeepInfraLLM({
          ...baseConfig,
          apiKey: this.getApiKey('deepinfra'),
          model: this.config.model || 'meta-llama/Llama-2-70b-chat-hf'
        });

      case 'fireworks':
        return new Fireworks({
          ...baseConfig,
          apiKey: this.getApiKey('fireworks'),
          model: this.config.model || 'accounts/fireworks/models/llama-v3-7b'
        });

      case 'friendli':
        return new Friendli({
          ...baseConfig,
          friendliToken: this.getApiKey('friendli'),
          friendliTeam: this.config.friendliTeam,
          model: this.config.model || 'mixtral-8x7b-instruct'
        });


      case 'huggingface':
        return new HuggingFaceInference({
          ...baseConfig,
          apiKey: this.getApiKey('huggingface'),
          model: this.config.model || 'gpt2'
        });

      case 'mistral':
        return new MistralAI({
          ...baseConfig,
          apiKey: this.getApiKey('mistral'),
          model: this.config.model || 'mistral-large-latest'
        });

      case 'sagemaker':
        if (!this.config.contentHandler) {
          throw new Error('Content handler is required for SageMaker');
        }
        return new SageMakerEndpoint({
          ...baseConfig,
          endpointName: this.config.model || 'gpt-4',
          contentHandler: this.config.contentHandler,
          clientOptions: {
            region: this.config.awsRegion || this.runtimeConfig.AWS_REGION,
            credentials: {
              accessKeyId: this.config.awsAccessKeyId || this.runtimeConfig.AWS_ACCESS_KEY_ID,
              secretAccessKey: this.config.awsSecretAccessKey || this.runtimeConfig.AWS_SECRET_ACCESS_KEY
            }
          }
        });

      default:
        throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
    }
  }

  // Get a ChatOpenAI model for use with the supervisor
  async getChatOpenAI() {
    const baseConfig = {
      temperature: this.config.temperature ?? 0,
      maxTokens: this.config.maxTokens,
      maxRetries: this.config.maxRetries ?? 2,
    };

    switch (this.config.provider) {
      case 'openai':
        return new ChatOpenAI({
          ...baseConfig,
          apiKey: this.getApiKey('openai'),
          modelName: this.config.model || 'gpt-4-turbo-preview'
        });
      
      case 'vertexai':
        // For VertexAI, we need to use OpenAI as a fallback for the supervisor
        console.warn('VertexAI is not compatible with the supervisor. Using OpenAI as a fallback.');
        return new ChatOpenAI({
          ...baseConfig,
          apiKey: this.getApiKey('openai'),
          modelName: 'gpt-4-turbo-preview'
        });
      
      default:
        // Default to OpenAI for all other providers
        console.warn(`${this.config.provider} is not compatible with the supervisor. Using OpenAI as a fallback.`);
        return new ChatOpenAI({
          ...baseConfig,
          apiKey: this.getApiKey('openai'),
          modelName: 'gpt-4-turbo-preview'
        });
    }
  }

  async invoke(input: string) {
    try {
      const model = await this.getLLMModel();
      return await model.invoke(input);
    } catch (error) {
      console.error('Error in LLM invoke:', error);
      throw error;
    }
  }

  async stream(input: string) {
    try {
      const model = await this.getLLMModel();
      return await model.stream(input);
    } catch (error) {
      console.error('Error in LLM stream:', error);
      throw error;
    }
  }
} 