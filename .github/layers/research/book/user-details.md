# Research Layer - Book Research Module

## Overview
The Research Layer will include a Book Research module that allows users to create and organize research projects around books. This module will help users collect, categorize, and analyze example books and related documents for research purposes.

## Key Components

### Research Collection
- Each research project will have a title, main category, and subcategory
- Research projects will track their status (in_progress/completed)
- Multiple example books can be linked to a research project
- Additional documents (PDFs, etc.) can be attached to research projects
- Conversations related to research can be stored and referenced

### Example Books
- Example books can be linked to multiple research projects
- Each example book contains metadata like:
  - Title, subtitle, author
  - Description
  - Cover image
  - Category information
  - BSR (Best Seller Rank) data
  - Sales and pricing information (via bookbeam_data)
  - User comments, likes, and dislikes

### Research Files
- Various document types can be attached to research projects
- Files will be tracked with metadata including size, type, and path

### Research Conversations
- Conversations about research can be stored and referenced
- Includes messages between users and assistants

### AI Research Capabilities
- Scrape book data from Amazon using FireCrawl integration
- Perform deep research analysis using Perplexity AI
- Generate insights based on example books and market trends
- Analyze book structure, content, and market positioning
- Compare research findings across different book categories and subcategories

### Vector Search & Embeddings
- Generate vector embeddings for book descriptions, content, and reviews
- Enable semantic search across research collections
- Find similar books based on content and description analysis
- Cluster books by topic and writing style
- Identify market gaps based on semantic differences
- Access multiple embedding providers (VertexAI, OpenAI, Azure, Bedrock, etc.)

## Data Structure
The module will use the CategoryResearch interface as the main entity, with relationships to ExampleBook, ResearchFile, and ResearchConversation entities. Vector embeddings will be stored alongside textual data for semantic search capabilities.

## Use Cases
- Creating new research projects by category
- Adding example books to research for reference
- Attaching supporting documents to research projects
- Analyzing book data across multiple research projects
- Referencing example books across different research initiatives
- Using AI to automatically gather and analyze book market data
- Performing deep comparative analysis between similar books
- Semantic searching across book collections to find similar content
- Identifying unique selling points through vector similarity analysis

## Questions and Considerations
- How will users organize and filter their research collections?
- What tools will be provided for analyzing the example books?
- How will the system handle duplicate example books across different research projects?
- What level of automation should be provided in the research process?
- How can we optimize the FireCrawl and Perplexity integrations for best results?
- Which embedding provider offers the best performance for book content analysis?
- How should vector embeddings be updated when book data changes?
