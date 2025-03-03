import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { JSONLinesLoader } from "langchain/document_loaders/fs/json";
import { EPubLoader } from "@langchain/community/document_loaders/fs/epub";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
import { SRTLoader } from "@langchain/community/document_loaders/fs/srt";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { ChatGPTLoader } from "@langchain/community/document_loaders/fs/chatgpt";
import { NotionLoader } from "@langchain/community/document_loaders/fs/notion";
import { AudioTranscriptLoader } from "@langchain/community/document_loaders/web/assemblyai";
import { UnstructuredLoader } from "@langchain/community/document_loaders/fs/unstructured";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import type { LoaderConfig, LoaderResult } from '../types/loaders';

export class LoaderHandler {
  private config: LoaderConfig;
  private runtimeConfig = useRuntimeConfig();

  constructor(config: LoaderConfig) {
    this.config = config;
  }

  private getApiKey(provider: string): string {
    if (this.config.unstructuredOptions?.apiKey) {
      return this.config.unstructuredOptions.apiKey;
    }

    const key = this.runtimeConfig[`${provider.toUpperCase()}_API_KEY`];
    if (key) {
      return key;
    }

    throw new Error(`No API key found for provider ${provider}`);
  }

  private async getLoader() {
    switch (this.config.type) {
      case 'text':
        return new TextLoader(this.config.source);

      case 'pdf':
        return new PDFLoader(this.config.source, {
          splitPages: this.config.splitPages
        });

      case 'docx':
        return new DocxLoader(this.config.source);

      case 'csv':
        return new CSVLoader(this.config.source);

      case 'json':
        return new JSONLoader(this.config.source, "/texts");

      case 'jsonl':
        return new JSONLinesLoader(this.config.source, "/html");

      case 'epub':
        return new EPubLoader(this.config.source, {
          splitChapters: this.config.splitPages
        });

      case 'pptx':
        return new PPTXLoader(this.config.source);

      case 'subtitles':
        return new SRTLoader(this.config.source);

      case 'directory':
        return new DirectoryLoader(this.config.source, {
          ".json": (path) => new JSONLoader(path, "/texts"),
          ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
          ".txt": (path) => new TextLoader(path),
          ".csv": (path) => new CSVLoader(path, "text"),
        });

      case 'chatgpt':
        return new ChatGPTLoader(this.config.source);

      case 'notion':
        return new NotionLoader(this.config.source);

      case 'audio':
        return new AudioTranscriptLoader(this.config.source, {
          language: this.config.audioOptions?.language,
          model: this.config.audioOptions?.model
        });

      case 'unstructured':
        return new UnstructuredLoader(this.config.source, {
          apiKey: this.getApiKey('unstructured'),
          strategy: this.config.unstructuredOptions?.strategy
        });

      default:
        throw new Error(`Unsupported loader type: ${this.config.type}`);
    }
  }

  async load(): Promise<LoaderResult> {
    try {
      const loader = await this.getLoader();
      const docs = await loader.load();
      
      return {
        success: true,
        documents: docs.map(doc => ({
          pageContent: doc.pageContent,
          metadata: doc.metadata
        }))
      };
    } catch (error) {
      console.error(`Error loading documents with ${this.config.type}:`, error);
      return {
        success: false,
        documents: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async loadAndSplit(chunkSize: number = 1000, chunkOverlap: number = 200): Promise<LoaderResult> {
    try {
      const loader = await this.getLoader();
      const docs = await loader.load();
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap
      });
      const splitDocs = await splitter.splitDocuments(docs);
      
      return {
        success: true,
        documents: splitDocs.map(doc => ({
          pageContent: doc.pageContent,
          metadata: doc.metadata
        }))
      };
    } catch (error) {
      console.error(`Error loading and splitting documents with ${this.config.type}:`, error);
      return {
        success: false,
        documents: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 