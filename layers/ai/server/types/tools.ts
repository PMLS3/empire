export type ToolType = 
  | 'calculator'
  | 'webbrowser'
  | 'serpapi'
  | 'tavily'
  | 'firecrawl'
  | 'perplexity_search'
  | 'perplexity_chat'
  | 'perplexity_document'
  | 'perplexity_news'
  | 'perplexity_weather'
  | 'vertex_image'
  | 'vertex_audio'
  | 'vertex_video'
  | 'vertex_document'
  | 'vertex_multimodal_chat'
  | 'data_analysis'
  | 'data_visualization'
  | 'wolfram_alpha'
  | 'wikipedia'
  | 'stack_exchange'
  | 'searxng_search'
  | 'search_api'
  | 'python_interpreter'
  | 'google_routes'
  | 'google_places'
  | 'google_calendar_create'
  | 'google_calendar_view'
  | 'gmail_create_draft'
  | 'gmail_get_message'
  | 'gmail_get_thread'
  | 'gmail_search'
  | 'gmail_send_message'
  | 'exa_search'
  | 'duckduckgo_search'
  | 'discord_get_messages'
  | 'discord_channel_search'
  | 'discord_send_messages'
  | 'discord_get_guilds'
  | 'discord_get_text_channels'
  | 'dad_joke'
  | 'dalle'
  | 'firestore'
  | 'firestore_vector'
  | 'firestore_transaction'
  // SendGrid tools
  | 'sendgrid_email'
  | 'sendgrid_template_email'
  | 'sendgrid_contacts'
  | 'sendgrid_lists'
  // Twilio tools
  | 'twilio_sms'
  | 'twilio_whatsapp'
  | 'twilio_voice'
  | 'twilio_verify'
  | 'twilio_lookup'
  // Language tools
  | 'language_detection'
  | 'translation';

export interface ToolConfig {
  type: ToolType;
  apiKey?: string;
  baseUrl?: string;
  headers?: Record<string, string>;
  options?: Record<string, any>;
  // Additional properties for Vertex AI tools
  projectId?: string;
  location?: string;
  model?: string;
}

export interface ToolResult {
  success: boolean;
  data: any;
  error?: string;
}
