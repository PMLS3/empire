export type LoaderType =
  | 'text'
  | 'pdf'
  | 'docx'
  | 'csv'
  | 'json'
  | 'jsonl'
  | 'epub'
  | 'pptx'
  | 'subtitles'
  | 'directory'
  | 'chatgpt'
  | 'notion'
  | 'audio'
  | 'unstructured';

export interface LoaderConfig {
  type: LoaderType;
  // File path or blob
  source: string;
  // Optional configurations
  encoding?: string;
  splitPages?: boolean;
  csvOptions?: {
    delimiter?: string;
    columns?: boolean;
  };
  jsonOptions?: {
    pointers?: string[];
  };
  subtitleOptions?: {
    pattern?: string;
  };
  directoryOptions?: {
    recursive?: boolean;
    include?: string[];
    exclude?: string[];
  };
  audioOptions?: {
    language?: string;
    model?: string;
  };
  unstructuredOptions?: {
    apiKey?: string;
    strategy?: string;
  };
}

export interface LoaderResult {
  success: boolean;
  documents: Array<{
    pageContent: string;
    metadata: Record<string, any>;
  }>;
  error?: string;
} 