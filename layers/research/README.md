# Book Research Module

The Book Research Module is a comprehensive system for researching, analyzing, and gaining insights from book data. It allows users to create research projects, collect books, analyze content, and leverage AI-powered features to extract valuable market and content insights.

## Features

### Research Projects
- Create and manage research projects by category
- Organize books within research projects
- Collaborate with team members
- Track project status and progress

### Book Collection
- Import books via Amazon scraping
- Manual book entry
- Bulk import capabilities
- Organize books by category

### AI-Powered Analysis
- Vector embeddings for semantic search
- Book clustering by similarity
- Deep research analysis of books
- Market, content, and audience insights

### File Management
- Upload research-related files
- Extract text from PDFs and documents
- Generate vector embeddings for files
- Organize files by research project

## Pages and Components

### Dashboard
- `/research/dashboard`: Research dashboard with statistics and project overview
- Analytics cards showing key metrics
- Recently added books and activity

### Projects
- `/research/projects`: List and manage research projects
- `/research/projects/create`: Create new research projects
- Project filtering by category, status, and scope
- Grid and list view options

### Books
- `/research/books`: Browse and manage the book collection
- `/research/books/scrape`: Import books from Amazon URLs
- Book filtering by project, category, and search

### AI Features
- `/research/ai/deep-research`: AI-powered deep analysis of individual books
- `/research/ai/insights`: Generate insights across collections of books
- `/research/ai/clustering`: Cluster similar books using vector embeddings
- `/research/books/search`: Semantic search using natural language queries

### Files
- `/research/files`: Manage research-related files
- `/research/files/upload`: Upload new files to research projects

### Settings
- `/research/settings`: Configure module settings including:
  - Vector embedding providers
  - API credentials
  - Data retention policies
  - Interface preferences

## Technical Implementation

The Book Research Module leverages several technologies:

- **Vector Embeddings**: Using OpenAI, Cohere, or other providers for semantic analysis
- **AI Analysis**: Deep research through language models
- **Data Visualization**: Charts for insights and analytics
- **Scraping**: Automated collection of book data
- **File Processing**: Text extraction and analysis from PDFs and documents

## Getting Started

To start using the Book Research Module:

1. Create a new research project from the Projects page
2. Add books via the scraper or manually
3. Explore AI-powered insights and analysis tools
4. Upload relevant files to your research projects

## Customization

The module provides several settings to customize your experience:

- Configure embedding providers and models
- Set data retention policies
- Customize UI preferences
- Manage API credentials for external services

## Architecture

The system consists of:

- Vue components for UI elements
- Composables for data logic
- API controllers for server interaction
- MongoDB models for data storage
- Vector database for embedding storage and similarity search

## Development

See documentation in the technical specs for details on extending the module with new features or customizing existing functionality.
