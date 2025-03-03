export type EmbeddingProvider = 
  | 'vertexai'
  | 'openai'
  | 'azure'
  | 'bedrock'
  | 'mistral'
  | 'cohere';

export interface GoogleCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

export interface EmbeddingConfig {
  provider: EmbeddingProvider;
  projectId?: string;
  model?: string;
  apiKey?: string;
  googleCredentials?: GoogleCredentials;
  azureApiInstanceName?: string;
  azureApiVersion?: string;
  azureDeploymentName?: string;
  awsRegion?: string;
}

export interface EmbeddingResult {
  embedding: number[];
  error?: string;
} 