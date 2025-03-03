# Database Requirements Document (DRD)

## Database Overview

The Book Research Module requires a robust database structure to support the storage of research projects, example books, research files, conversations, and their relationships. The database design must prioritize flexibility, performance, and scalability, including vector storage for semantic search capabilities.

## Entity Relationships

### Primary Entities
1. **CategoryResearch**
   - Central entity containing research project information
   - One-to-many relationship with ExampleBook, ResearchFile, and ResearchConversation
   - Many-to-many relationship with BookCategory

2. **ExampleBook**
   - Stores detailed book information
   - May relate to multiple CategoryResearch entities
   - Contains nested objects for BSR data, comments, likes/dislikes
   - Includes vector embeddings for content and metadata

3. **ResearchFile**
   - Metadata for research-related files
   - Direct relationship to specific CategoryResearch
   - Includes file paths and metadata
   - Optional vector embeddings for file content

4. **ResearchConversation**
   - Stores conversation history related to research
   - Direct relationship to specific CategoryResearch
   - Contains array of messages with timestamps

5. **BookCategory**
   - Hierarchical category structure
   - Parent-child relationships (subcategories)
   - Used for organization and filtering

6. **VectorEmbedding**
   - Stores vector embeddings for various entities
   - Links to source entity (book, file, etc.)
   - Contains embedding metadata and provider information

## Data Schema

### CategoryResearch Schema
```typescript
{
  id: string               // Primary key, UUID
  workspace_id: string     // Workspace identifier
  owner_id: string         // User identifier
  main_category: string    // Main category name
  sub_category: string     // Subcategory name
  sub_category_description?: string  // Optional description
  status: 'in_progress' | 'completed'  // Research status
  example_books?: ExampleBook[]      // Associated books
  research_files?: ResearchFile[]    // Associated files
  research_conversations?: ResearchConversation[]  // Associated conversations
  created_at: Date         // Creation timestamp
  updated_at: Date         // Last update timestamp
  deleted_at?: Date        // Soft delete timestamp
}
```

### ExampleBook Schema
```typescript
{
  id: string               // Primary key, UUID
  book_id: string          // Reference to book in research
  title: string            // Book title
  subtitle?: string        // Optional subtitle
  description: string      // Book description
  author: string           // Author name
  link: string             // Link to book (e.g., Amazon URL)
  cover?: string           // Cover image URL
  chapters?: string[]      // Array of chapter titles/descriptions
  keywords?: string[]      // Relevant keywords
  category: string         // Primary category
  sub_category?: string    // Subcategory
  bsr: {                   // Best Seller Rank data
    kindle?: number
    paperback?: number
    audible?: number
  }
  bookbeam_data?: {        // Extended sales/market data
    salesRank?: number
    estimatedSales?: number
    estimatedRevenue?: number
    reviewCount?: number
    averageRating?: number
    pageCount?: number
    publishDate?: Date
    publisher?: string
    priceHistory?: Array<{
      date: Date
      price: number
    }>
    salesHistory?: Array<{
      date: Date
      rank: number
      estimatedSales: number
    }>
  }
  sample_pdf?: string      // Link to sample PDF
  comments: Array<{        // User comments
    user_id: string
    comment: string
    timestamp: Date
  }>
  likes: string[]          // Array of user IDs who liked
  dislikes: string[]       // Array of user IDs who disliked
  vector_embeddings?: {    // Vector embeddings for semantic search
    title_embedding?: number[]
    description_embedding?: number[]
    content_embedding?: number[]
    provider: string       // Provider used (OpenAI, VertexAI, etc.)
    model: string          // Model used
    dimensions: number     // Number of dimensions in the embedding
    created_at: Date       // When embedding was generated
  }
  created_at: Date         // Creation timestamp
  updated_at: Date         // Last update timestamp
  deleted_at?: Date        // Soft delete timestamp
}
```

### ResearchFile Schema
```typescript
{
  id: string               // Primary key, UUID
  book_id: string          // Reference to book in research
  name: string             // File name
  type: string             // File MIME type
  size: number             // File size in bytes
  path: string             // Storage path
  metadata?: Record<string, any>  // Additional metadata
  vector_embedding?: {     // Optional vector embedding of file content
    embedding: number[]    // Vector embedding
    provider: string       // Provider used
    model: string          // Model used
    dimensions: number     // Number of dimensions
    created_at: Date       // When embedding was generated
  }
  created_at: Date         // Creation timestamp
  updated_at: Date         // Last update timestamp
  deleted_at?: Date        // Soft delete timestamp
}
```

### ResearchConversation Schema
```typescript
{
  id: string               // Primary key, UUID
  book_id: string          // Reference to book in research
  title: string            // Conversation title
  model: string            // AI model used
  messages: Array<{        // Message history
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    vector_embedding?: number[] // Optional vector for semantic search
  }>
  created_at: Date         // Creation timestamp
  updated_at: Date         // Last update timestamp
  deleted_at?: Date        // Soft delete timestamp
}
```

### BookCategory Schema
```typescript
{
  id: string               // Primary key, UUID
  workspace_id: string     // Workspace identifier
  name: string             // Category name
  description?: string     // Category description
  parent_id?: string       // Parent category (for subcategories)
  created_at: Date         // Creation timestamp
  updated_at: Date         // Last update timestamp
  deleted_at?: Date        // Soft delete timestamp
}
```

### VectorEmbedding Schema
```typescript
{
  id: string               // Primary key, UUID
  source_id: string        // ID of source entity (book, file, etc.)
  source_type: string      // Type of source entity
  field: string            // Field the embedding represents
  embedding: number[]      // Vector embedding
  provider: string         // Embedding provider (OpenAI, VertexAI, etc.)
  model: string            // Model used
  dimensions: number       // Number of dimensions
  metadata?: Record<string, any>  // Additional metadata
  created_at: Date         // Creation timestamp
  updated_at: Date         // Last update timestamp
}
```

## Database Requirements

### Performance Requirements
- Efficient querying of research projects by category/subcategory
- Fast retrieval of example books with all metadata
- Support for full-text search across book titles, descriptions, and content
- Pagination for large result sets
- Efficient sorting and filtering capabilities
- High-performance vector similarity search capabilities
- Support for approximate nearest neighbor (ANN) search

### Data Integrity
- Foreign key constraints between related entities
- Cascading updates for relationship maintenance
- Soft deletion to prevent data loss
- Validation rules for required fields
- Consistency between vectors and their source content

### Security Requirements
- Workspace isolation to prevent cross-workspace data access
- Owner-based access control for research projects
- Role-based permissions for collaborative features
- Encryption of sensitive data fields
- Access logging for vector operations

### Scalability
- Support for potentially large numbers of research projects
- Efficient handling of research projects with many example books
- Optimized storage for file metadata
- Support for long conversation histories
- Efficient storage and retrieval of high-dimensional vectors
- Sharding capabilities for vector collections

### Vector Database Requirements
- Support for embedding storage and retrieval
- Efficient similarity search operations
- Multiple distance metrics (cosine, euclidean, dot product)
- Vector indexing for performance optimization
- Support for filtering operations in vector search
- Versioning of embeddings when source content changes
- Multi-model support for different embedding providers

## Migration and Versioning
- Schema versioning strategy for future upgrades
- Migration paths for existing data
- Backward compatibility considerations
- Vector re-indexing capabilities for model updates

## Backup and Recovery
- Regular automated backups
- Point-in-time recovery capability
- Disaster recovery procedures
- Vector index rebuilding capabilities
