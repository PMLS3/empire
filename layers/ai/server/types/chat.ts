export type ChatProvider = 
  | 'vertexai'
  | 'openai'
  | 'anthropic'
  | 'groq'
  | 'fireworks'
  | 'mistral';

export interface ChatConfig {
  provider: ChatProvider;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  // Google specific
  credentials?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string;
  error?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
} 