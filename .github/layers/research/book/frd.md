# Features Requirements Document (FRD)

## Research Management Features

### Research Project Creation
- **Create Research Project**
  - Form with fields for main category, subcategory, and type
  - Optional description and status fields
  - Auto-generation of research ID
  - Default status "in_progress"

### Research Project Organization
- **List Research Projects**
  - Filterable grid/list view of all research projects
  - Sort by category, date created, status
  - Search functionality

- **View Research Project Details**
  - Dashboard with project overview
  - Related books, files, and conversations
  - Progress tracking

### Research Categories
- **Category Management**
  - Predefined book categories with descriptions
  - Subcategory selection
  - Custom category creation

## Book Collection Features

### Book Scraping
- **Amazon Book Scraper**
  - URL input field for book pages
  - Bulk URL processing
  - FireCrawl integration for data extraction
  - Progress indicator during scraping

- **Book Data Extraction**
  - Extract title, subtitle, author information
  - Extract book metadata (ISBN, publisher, date)
  - Extract pricing, format, and physical details
  - Extract review data and ratings
  - Extract BSR (Best Seller Rank) information

### Book Management
- **Save Book Examples**
  - Store extracted book data to database
  - Associate books with research projects
  - Option to edit book data before saving

- **Edit Book Examples**
  - Edit all book metadata fields
  - Update cover images
  - Add custom notes

- **Delete Book Examples**
  - Remove books from research projects
  - Option to keep in system but unlink from project
  - Confirmation dialog before deletion

### Book Analysis
- **View Book Details**
  - Comprehensive book information display
  - Visual representation of sales rank
  - Review analytics

## AI Research Features

### Deep Research
- **AI Research Initialization**
  - Select book(s) for deep research
  - Choose research focus and parameters
  - Perplexity AI integration

- **Research Results**
  - Display AI-generated insights
  - Save research findings to project
  - Export research reports

### Comparative Analysis
- **Book Comparison**
  - Side-by-side comparison of multiple books
  - Identify similarities and differences
  - Highlight unique selling points

## Vector Search Features

### Embedding Generation
- **Content Vectorization**
  - Generate embeddings for book descriptions
  - Generate embeddings for book content (where available)
  - Generate embeddings for reviews and summaries
  - Store vectors alongside book data

- **Embedding Provider Selection**
  - Choose from multiple embedding providers (VertexAI, OpenAI, Azure, etc.)
  - Configure embedding model parameters
  - Vectorization status indicators

### Semantic Search
- **Vector-Based Search**
  - Search books by semantic similarity
  - Natural language querying of book content
  - Adjustable similarity thresholds
  - Relevance ranking of results

- **Similar Book Discovery**
  - Find books similar to a selected example
  - Visualize similarity scores
  - Filter similar books by additional criteria
  - Export similar book lists

### Market Analysis
- **Vector Clustering**
  - Group books by content similarity
  - Identify content clusters within categories
  - Visualize market distribution
  - Highlight potential market gaps

- **Niche Detection**
  - Identify underserved content areas
  - Calculate content uniqueness scores
  - Visualize market saturation

## File Management Features

### File Upload
- **Upload Research Files**
  - Drag and drop interface
  - File type validation
  - Progress indicator
  - Size limit notification

### File Organization
- **File Categorization**
  - Associate files with research projects
  - Add file descriptions and tags
  - Organize files in folders

### File Access
- **Download Files**
  - Direct download links
  - Bulk download option
  - File preview when possible

## Research Conversations

### Conversation Management
- **Create Research Conversations**
  - Associate conversations with research projects
  - Track conversation history
  - Tag important insights

### LLM Integration
- **AI Assistant Conversations**
  - Research-specific AI assistants
  - Context-aware responses with vector-enriched context
  - Function calling for research tasks

## User Interface Requirements

### Dashboard
- **Research Overview Dashboard**
  - Summary of research projects
  - Recent activity
  - Quick access to common functions

### Book Display
- **Book Card View**
  - Visual grid of book covers
  - Key metadata display
  - Action buttons for common tasks

### Vector Visualization
- **Similarity Maps**
  - 2D/3D visualizations of book vector spaces
  - Interactive clustering diagrams
  - Content similarity heat maps

### Mobile Responsiveness
- Functional on tablet devices
- Critical features accessible on smartphones
