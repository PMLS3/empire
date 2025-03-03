# Backend Requirements Document (BRD)

## Backend Architecture

The Book Research Module backend requires a robust, scalable architecture to support the collection, analysis, and management of book research data. This document outlines the technical requirements for implementing the backend services, including vector search capabilities.

## API Endpoints

### Research Management

#### Research Projects
- `GET /api/research` - List research projects with filtering options
- `GET /api/research/:id` - Get research project details
- `POST /api/research` - Create a new research project
- `PUT /api/research/:id` - Update a research project
- `DELETE /api/research/:id` - Delete a research project (soft delete)

#### Categories
- `GET /api/categories` - List categories and subcategories
- `GET /api/categories/:id` - Get category details
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Book Management

#### Example Books
- `GET /api/books` - List example books with filtering
- `GET /api/books/:id` - Get example book details
- `POST /api/books` - Create a new example book
- `PUT /api/books/:id` - Update an example book
- `DELETE /api/books/:id` - Delete an example book (soft delete)
- `POST /api/research/:id/books` - Add books to research project
- `DELETE /api/research/:id/books/:bookId` - Remove book from research project

#### Book Scraping
- `POST /api/scrape` - Scrape books from provided URLs
- `GET /api/scrape/:id` - Get scrape job status
- `POST /api/scrape/batch` - Create batch scraping job

### AI Research

#### Perplexity Integration
- `POST /api/research/deep` - Perform deep research on book(s)
- `GET /api/research/deep/:id` - Get deep research results
- `POST /api/research/:id/insights` - Generate insights from research

### Vector Search

#### Embeddings
- `POST /api/embeddings` - Generate embeddings for content
- `GET /api/embeddings/:id` - Get embedding details
- `PUT /api/embeddings/:id` - Update embedding
- `DELETE /api/embeddings/:id` - Delete embedding

#### Semantic Search
- `POST /api/vectors/search` - Search by vector similarity
- `POST /api/books/similar/:id` - Find books similar to specified book
- `POST /api/vectors/cluster` - Cluster vectors by similarity
- `GET /api/vectors/providers` - List available embedding providers
- `POST /api/vectors/bulk-generate` - Generate embeddings in bulk

### File Management

#### Research Files
- `POST /api/research/:id/files` - Upload files to research project
- `GET /api/research/:id/files` - List files in research project
- `GET /api/research/:id/files/:fileId` - Get file details/download
- `DELETE /api/research/:id/files/:fileId` - Remove file from research project

### Conversations

#### Research Conversations
- `POST /api/research/:id/conversations` - Create new conversation
- `GET /api/research/:id/conversations` - List conversations
- `GET /api/research/:id/conversations/:conversationId` - Get conversation details
- `POST /api/research/:id/conversations/:conversationId/messages` - Add message to conversation

## External Integrations

### FireCrawl Integration
- Service to handle book data extraction from Amazon
- Authentication with FireCrawl API
- Custom extraction schema implementation
- Rate limiting and error handling
- Mapping of extracted data to internal data model

### Perplexity AI Integration
- Deep research capabilities using Perplexity API
- Custom prompting for book analysis
- Result processing and formatting
- Conversation management with context

### Embedding Provider Integration
- Integration with embeddings.ts utility
- Support for multiple embedding providers:
  - VertexAI (Google)
  - OpenAI
  - Azure OpenAI
  - AWS Bedrock
  - Mistral
  - Cohere
- Provider fallback mechanisms
- Caching of embedding results
- Batching of embedding requests

### Vector Database Integration
- Connection to vector database service
- Indexing of vector embeddings
- Efficient similarity search operations
- Filtering capabilities within vector searches
- Vector collection management

### File Storage Integration
- Secure file storage for research documents
- Support for multiple file types
- Metadata extraction from uploaded files
- Thumbnail generation for visual files

## Authentication & Authorization

### Security Requirements
- JWT-based authentication for all API endpoints
- Role-based access control for research projects
- Workspace isolation to prevent cross-workspace access
- Rate limiting to prevent abuse

### Permission Model
- Owner: Full control over research project
- Collaborator: Can view and contribute to research
- Viewer: Can only view research (no edits)
- Application-level admin permissions

## Data Processing Requirements

### Book Data Processing
- Parsing and normalization of scraped book data
- Extraction of structured data from unstructured sources
- Generation of metadata and keywords
- Cleanup and formatting of descriptions and content

### Analytics Processing
- BSR (Best Seller Rank) data analysis
- Sales trend identification
- Review sentiment analysis
- Competitive positioning calculation

### Vector Processing
- Text preprocessing for optimal embedding quality
- Chunking of long text for appropriate embedding
- Vector normalization and dimensional reduction when needed
- Vector indexing for efficient retrieval
- Periodic reindexing to maintain optimal performance

## Error Handling

### Error Response Format
```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Detailed error message",
  "details": {
    "field": "specific field with error",
    "reason": "reason for error"
  }
}
```

### Retry Mechanisms
- Automatic retry for external service failures
- Exponential backoff strategy
- Dead letter queue for failed operations
- Notification mechanism for critical failures

## Logging & Monitoring

### Logging Requirements
- Structured JSON logging format
- Request/response logging for API interactions
- Error logging with stack traces
- Performance metrics logging

### Monitoring Points
- API endpoint response times
- External service health checks
- Queue depths for background jobs
- Error rates and types
- Vector search performance metrics
- Embedding generation times
- Provider availability and response times

## Background Processing

### Job Queue Requirements
- Queue system for long-running tasks (book scraping, deep research, embedding generation)
- Task prioritization
- Progress tracking and reporting
- Failure handling and retry mechanisms

### Scheduled Tasks
- Regular updates of book sales data
- Cleanup of temporary files
- Refreshing of cached data
- Automatic research updates
- Periodic reindexing of vector collections
- Health checks for embedding providers

## Performance Requirements

- API response times < 200ms for most endpoints
- Support for concurrent scraping of up to 50 books
- Ability to handle up to 100 simultaneous users
- Efficient pagination of large result sets
- Caching strategy for frequently accessed data
- Vector similarity search response time < 500ms
- Embedding generation throughput of at least 10 texts/second
- Support for bulk vector operations

