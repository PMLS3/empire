export type LLMProvider = 
  | 'vertexai'
  | 'openai'
  | 'anthropic'
  | 'ollama'
  | 'ai21'
  | 'alephalpha'
  | 'arcjet'
  | 'sagemaker'
  | 'azure'
  | 'bedrock'
  | 'chrome'
  | 'cohere'
  | 'deepinfra'
  | 'fireworks'
  | 'friendli'
  | 'gradient'
  | 'huggingface'
  | 'mistral';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  maxRetries?: number;

  // Provider specific configurations
  // Azure
  azureApiInstanceName?: string;
  azureApiVersion?: string;
  azureDeploymentName?: string;

  // AWS
  awsRegion?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  endpointUrl?: string;

  // Google
  googleApplicationCredentials?: Record<string, any>;
  projectId?: string;
  location?: string;

  // Gradient
  workspaceId?: string;

  // Friendli
  friendliTeam?: string;

  // Custom handlers
  contentHandler?: any;
} 