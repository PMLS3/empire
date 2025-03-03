import { FunctionGroup } from '../types';


// Add research book functions
const bookResearchFunctions: FunctionGroup = {
    declarations: [
      {
        name: 'scrapeBookFromAmazon',
        description: 'Scrape book data from Amazon URLs using FireCrawl',
        parameters: {
          type: 'object',
          properties: {
            urls: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of Amazon book URLs to scrape'
            },
            prompt: {
              type: 'string',
              description: 'Optional custom prompt for scraping'
            }
          },
          required: ['urls']
        }
      },
      {
        name: 'performDeepResearch',
        description: 'Perform deep research on a book using Perplexity AI',
        parameters: {
          type: 'object',
          properties: {
            book: {
              type: 'object',
              description: 'Book object to research'
            },
            customPrompt: {
              type: 'string',
              description: 'Optional custom research prompt'
            },
            model: {
              type: 'string',
              description: 'Perplexity model to use (default: sonar)'
            }
          },
          required: ['book']
        }
      },
      {
        name: 'createResearchProject',
        description: 'Create a new research project',
        parameters: {
          type: 'object',
          properties: {
            main_category: {
              type: 'string',
              description: 'Main category for the research'
            },
            sub_category: {
              type: 'string',
              description: 'Sub-category for the research'
            },
            type: {
              type: 'string',
              description: 'Type of research (e.g., "book")'
            }
          },
          required: ['main_category', 'sub_category', 'type']
        }
      },
      {
        name: 'saveExampleBook',
        description: 'Save an example book to the research project',
        parameters: {
          type: 'object',
          properties: {
            book: {
              type: 'object',
              description: 'Book object to save'
            },
            research_id: {
              type: 'string',
              description: 'Research project ID to save the book to'
            }
          },
          required: ['book']
        }
      },
      // Vector-aware functions
      {
        name: 'generateBookEmbeddings',
        description: 'Generate vector embeddings for a book',
        parameters: {
          type: 'object',
          properties: {
            book_id: {
              type: 'string',
              description: 'ID of the book to generate embeddings for'
            },
            fields: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['title', 'description', 'content', 'reviews']
              },
              description: 'Fields to generate embeddings for'
            },
            provider: {
              type: 'string',
              enum: ['vertexai', 'openai', 'azure', 'bedrock', 'mistral', 'cohere'],
              description: 'Embedding provider to use'
            },
            model: {
              type: 'string',
              description: 'Specific model to use for embeddings'
            }
          },
          required: ['book_id']
        }
      },
      {
        name: 'findSimilarBooks',
        description: 'Find books similar to a specified book using vector similarity',
        parameters: {
          type: 'object',
          properties: {
            book_id: {
              type: 'string',
              description: 'ID of the book to find similar books for'
            },
            field: {
              type: 'string',
              enum: ['title', 'description', 'content', 'reviews'],
              description: 'Field to use for similarity comparison'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of similar books to return'
            },
            min_similarity: {
              type: 'number',
              description: 'Minimum similarity score (0-1) for inclusion'
            }
          },
          required: ['book_id']
        }
      },
      {
        name: 'semanticSearchBooks',
        description: 'Search books using natural language queries and vector similarity',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Natural language query to search with'
            },
            category: {
              type: 'string',
              description: 'Optional category filter'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return'
            },
            research_id: {
              type: 'string',
              description: 'Optional research project ID to search within'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'clusterBooks',
        description: 'Cluster books by content similarity using vector embeddings',
        parameters: {
          type: 'object',
          properties: {
            research_id: {
              type: 'string',
              description: 'Research project ID containing books to cluster'
            },
            field: {
              type: 'string',
              enum: ['title', 'description', 'content', 'reviews'],
              description: 'Field to use for clustering'
            },
            num_clusters: {
              type: 'number',
              description: 'Number of clusters to create'
            }
          },
          required: ['research_id']
        }
      }
    ],
    handlers: {
      scrapeBookFromAmazon: async (args, context) => {
        const { useFireCrawlBook } = usePublishing();
        return await useFireCrawlBook(args.urls, args.prompt);
      },
      performDeepResearch: async (args, context) => {
        const { deepResearch } = useBookResearch();
        return await deepResearch(args.book, args.customPrompt, args.model);
      },
      createResearchProject: async (args, context) => {
        const { createResearch } = useResearch();
        return await createResearch({
          main_category: args.main_category,
          sub_category: args.sub_category,
          type: args.type
        });
      },
      saveExampleBook: async (args, context) => {
        const { createExampleBook } = usePublishing();
        return await createExampleBook(args.book);
      },
      // Vector-aware function handlers
      generateBookEmbeddings: async (args, context) => {
        const { generateEmbeddings } = useBookResearch();
        return await generateEmbeddings(
          args.book_id, 
          args.fields || ['description'], 
          args.provider, 
          args.model
        );
      },
      findSimilarBooks: async (args, context) => {
        const { findSimilarBooks } = useBookResearch();
        return await findSimilarBooks(
          args.book_id,
          args.field || 'description',
          args.limit || 5,
          args.min_similarity || 0.7
        );
      },
      semanticSearchBooks: async (args, context) => {
        const { semanticSearchBooks } = useBookResearch();
        return await semanticSearchBooks(
          args.query,
          args.category,
          args.limit || 10,
          args.research_id
        );
      },
      clusterBooks: async (args, context) => {
        const { clusterBooks } = useBookResearch();
        return await clusterBooks(
          args.research_id,
          args.field || 'description',
          args.num_clusters || 3
        );
      }
    },
    systemInstruction: () => `You can help with book research by:
    1. Scraping book data from Amazon URLs
    2. Performing deep research using Perplexity AI
    3. Creating and managing research projects
    4. Finding similar books using vector similarity search
    5. Performing semantic searches across book collections
    6. Clustering books by content similarity
    7. Generating vector embeddings for enhanced analysis
    
    When scraping books, provide valid Amazon book URLs. For deep research, provide book details to analyze.
    When working with vectors, you can specify different embedding providers (VertexAI, OpenAI, Azure, etc.) and models.
    For semantic searches, use natural language to find books with similar meaning, not just keyword matching.`
  };

export default bookResearchFunctions;