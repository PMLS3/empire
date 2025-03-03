export interface CategoryResearch {
  id: string;
  workspace_id: string;
  owner_id: string;
  main_category: string;
  sub_category: string;
  sub_category_description?: string;
  status: 'in_progress' | 'completed';
  is_public: boolean;
  example_book_ids?: string[];
  research_files?: ResearchFile[];
  research_conversations?: ResearchConversation[];
  collaborators?: ResearchCollaborator[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface ExampleBook {
  id: string;
  book_id: string;
  title: string;
  subtitle?: string;
  description: string;
  author: string;
  link: string;
  cover?: string;
  chapters?: string[];
  keywords?: string[];
  category: string;
  sub_category?: string;
  bsr?: {
    kindle?: number;
    paperback?: number;
    audible?: number;
  };
  bookbeam_data?: {
    salesRank?: number;
    estimatedSales?: number;
    estimatedRevenue?: number;
    reviewCount?: number;
    averageRating?: number;
    pageCount?: number;
    publishDate?: Date;
    publisher?: string;
    priceHistory?: Array<{
      date: Date;
      price: number;
    }>;
    salesHistory?: Array<{
      date: Date;
      rank: number;
      estimatedSales: number;
    }>;
  };
  sample_pdf?: string;
  comments: Array<{
    user_id: string;
    comment: string;
    timestamp: Date;
  }>;
  likes: string[];
  dislikes: string[];
  vector_embeddings?: {
    title_embedding?: number[];
    description_embedding?: number[];
    content_embedding?: number[];
    provider: string;
    model: string;
    dimensions: number;
    created_at: Date;
  };
  similarity_score?: number; // Used in search results
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface ResearchFile {
  id: string;
  research_id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  metadata?: Record<string, any>;
  vector_embedding?: {
    embedding: number[];
    provider: string;
    model: string;
    dimensions: number;
    created_at: Date;
  };
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface ResearchConversation {
  id: string;
  research_id: string;
  title: string;
  model: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    vector_embedding?: number[];
  }>;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface ResearchCollaborator {
  id: string;
  research_id: string;
  user_id: string;
  workspace_id: string;
  role: 'owner' | 'editor' | 'viewer';
  profile_id: string;
  invitation_status: 'pending' | 'accepted' | 'rejected';
  invitation_email?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CollaboratorProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  role: 'owner' | 'editor' | 'viewer';
  email: string;
  workspace_name: string;
  invitation_status?: 'pending' | 'accepted' | 'rejected';
}

export interface BookCategory {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface VectorEmbedding {
  id: string;
  source_id: string;
  source_type: string;
  field: string;
  embedding: number[];
  provider: string;
  model: string;
  dimensions: number;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}
