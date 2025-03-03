import { Firestore, FieldValue } from '@google-cloud/firestore';
import { EmbeddingsHandler } from '~/layers/ai/server/utils/embeddings';
import type { ExampleBook } from '../../types/research';

export class BookModel {
  private firestore: Firestore;
  
  constructor(firestore: Firestore) {
    this.firestore = firestore;
  }
  
  /**
   * Create a new example book with vector embedding
   */
  async createExampleBook(bookData: Partial<ExampleBook>, researchId: string, userId: string, workspaceId: string): Promise<ExampleBook> {
    try {
      const now = new Date();
      
      // First, verify the research project exists and belongs to the workspace
      const researchRef = this.firestore.collection('research').doc(researchId);
      const researchDoc = await researchRef.get();
      
      if (!researchDoc.exists) {
        throw new Error('Research project not found');
      }
      
      const researchData = researchDoc.data();
      if (researchData?.workspace_id !== workspaceId) {
        throw new Error('Access denied to this research project');
      }
      
      // Generate vector embeddings for the book description
      let description_embedding = [];
      if (bookData.description) {
        try {
          const embedHandler = new EmbeddingsHandler();
          const result = await embedHandler.getEmbedding(bookData.description);
          
          if (result.embedding && result.embedding.length > 0) {
            description_embedding = result.embedding;
          }
        } catch (error) {
          console.error('Error generating embeddings:', error);
          // Continue without embeddings if there's an error
        }
      }
      
      // Prepare book data with embeddings
      const book: Partial<ExampleBook> = {
        ...bookData,
        book_id: researchId,
        comments: bookData.comments || [],
        likes: bookData.likes || [],
        dislikes: bookData.dislikes || [],
        created_at: now,
        updated_at: now
      };
      
      // Add vector embedding if available
      if (description_embedding.length > 0) {
        book.vector_embeddings = {
          description_embedding: FieldValue.vector(description_embedding),
          provider: 'vertexai', // Default provider
          model: 'textembedding-gecko', // Default model
          dimensions: description_embedding.length,
          created_at: now
        };
      }
      
      // Add the book to Firestore
      const docRef = await this.firestore.collection('example_books').add(book);
      
      // Also add reference to the research project's example_books array
      await researchRef.update({
        example_book_ids: FieldValue.arrayUnion(docRef.id),
        updated_at: now
      });
      
      return {
        id: docRef.id,
        ...book
      } as ExampleBook;
    } catch (error) {
      console.error('Error creating example book:', error);
      throw new Error(`Failed to create example book: ${error.message}`);
    }
  }
  
  /**
   * Get example book by ID
   */
  async getExampleBookById(id: string, workspaceId: string): Promise<ExampleBook | null> {
    try {
      const docRef = this.firestore.collection('example_books').doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      const bookData = doc.data() as ExampleBook;
      
      // Verify workspace access through the research project
      const researchRef = this.firestore.collection('research').doc(bookData.book_id);
      const researchDoc = await researchRef.get();
      
      if (!researchDoc.exists) {
        throw new Error('Associated research project not found');
      }
      
      const researchData = researchDoc.data();
      if (researchData?.workspace_id !== workspaceId) {
        throw new Error('Access denied to this example book');
      }
      
      return {
        id: doc.id,
        ...bookData
      } as ExampleBook;
    } catch (error) {
      console.error('Error getting example book:', error);
      throw new Error('Failed to retrieve example book');
    }
  }
  
  /**
   * Find similar books using vector search
   */
  async findSimilarBooks(
    bookId: string, 
    field: string = 'description',
    limit: number = 5,
    minSimilarity: number = 0.7,
    workspaceId: string
  ): Promise<ExampleBook[]> {
    try {
      // Get the source book first to access its vector
      const sourceBook = await this.getExampleBookById(bookId, workspaceId);
      
      if (!sourceBook) {
        throw new Error('Source book not found');
      }
      
      // Check if the book has vector embeddings
      if (!sourceBook.vector_embeddings || !sourceBook.vector_embeddings[`${field}_embedding`]) {
        throw new Error(`No vector embedding available for field: ${field}`);
      }
      
      // Extract the vector to use for search
      const queryVector = sourceBook.vector_embeddings[`${field}_embedding`];
      
      // Use Firestore vector search
      const vectorQuery = this.firestore
        .collection('example_books')
        .findNearest({
          vectorField: `vector_embeddings.${field}_embedding`,
          queryVector,
          limit,
          distanceMeasure: 'COSINE',
          distanceResultField: 'similarity_score'
        });
      
      const snapshot = await vectorQuery.get();
      
      // Format and filter results
      const results = [];
      for (const doc of snapshot.docs) {
        // Skip the source book itself
        if (doc.id === bookId) continue;
        
        const bookData = doc.data() as ExampleBook;
        const similarityScore = doc.get('similarity_score');
        
        // Check if similarity is above minimum threshold
        // For COSINE distance, lower is more similar, so we use 1 - distance
        const normalizedSimilarity = 1 - similarityScore;
        if (normalizedSimilarity < minSimilarity) continue;
        
        // Add to results
        results.push({
          id: doc.id,
          ...bookData,
          similarity_score: normalizedSimilarity
        });
      }
      
      // Sort by similarity (descending)
      results.sort((a, b) => b.similarity_score - a.similarity_score);
      
      return results;
    } catch (error) {
      console.error('Error finding similar books:', error);
      throw new Error(`Failed to find similar books: ${error.message}`);
    }
  }
  
  /**
   * Semantic search for books
   */
  async semanticSearchBooks(
    query: string,
    category?: string,
    limit: number = 10,
    researchId?: string,
    workspaceId: string
  ): Promise<ExampleBook[]> {
    try {
      // Generate vector embedding for the query
      const embedHandler = new EmbeddingsHandler();
      const result = await embedHandler.getEmbedding(query);
      
      if (!result.embedding || result.embedding.length === 0) {
        throw new Error('Failed to generate embedding for query');
      }
      
      // Build the Firestore query
      let baseQuery = this.firestore.collection('example_books');
      
      // If research ID is provided, filter by it
      if (researchId) {
        baseQuery = baseQuery.where('book_id', '==', researchId);
      }
      
      // If category is provided, filter by it
      if (category) {
        baseQuery = baseQuery.where('category', '==', category);
      }
      
      // Perform vector search
      const vectorQuery = baseQuery.findNearest({
        vectorField: 'vector_embeddings.description_embedding',
        queryVector: result.embedding,
        limit,
        distanceMeasure: 'COSINE',
        distanceResultField: 'similarity_score'
      });
      
      const snapshot = await vectorQuery.get();
      
      // Format results
      const results = [];
      for (const doc of snapshot.docs) {
        const bookData = doc.data() as ExampleBook;
        const similarityScore = doc.get('similarity_score');
        
        // Verify workspace access through the research project
        const researchRef = this.firestore.collection('research').doc(bookData.book_id);
        const researchDoc = await researchRef.get();
        
        if (!researchDoc.exists) continue;
        
        const researchData = researchDoc.data();
        if (researchData?.workspace_id !== workspaceId) continue;
        
        // Add to results with normalized similarity score
        results.push({
          id: doc.id,
          ...bookData,
          similarity_score: 1 - similarityScore // Normalize for COSINE
        });
      }
      
      // Sort by similarity (descending)
      results.sort((a, b) => b.similarity_score - a.similarity_score);
      
      return results;
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw new Error(`Failed to search books: ${error.message}`);
    }
  }

  /**
   * Update example book
   */
  async updateExampleBook(id: string, data: Partial<ExampleBook>, workspaceId: string): Promise<ExampleBook> {
    try {
      const docRef = this.firestore.collection('example_books').doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error('Example book not found');
      }
      
      const currentData = doc.data() as ExampleBook;
      
      // Verify workspace access through the research project
      const researchRef = this.firestore.collection('research').doc(currentData.book_id);
      const researchDoc = await researchRef.get();
      
      if (!researchDoc.exists) {
        throw new Error('Associated research project not found');
      }
      
      const researchData = researchDoc.data();
      if (researchData?.workspace_id !== workspaceId) {
        throw new Error('Access denied to this example book');
      }
      
      const now = new Date();
      let updateData: any = {
        ...data,
        updated_at: now
      };
      
      // If description was updated, regenerate the embedding
      if (data.description && data.description !== currentData.description) {
        try {
          const embedHandler = new EmbeddingsHandler();
          const result = await embedHandler.getEmbedding(data.description);
          
          if (result.embedding && result.embedding.length > 0) {
            // Use FieldValue.vector for the embedding
            updateData.vector_embeddings = {
              ...currentData.vector_embeddings,
              description_embedding: FieldValue.vector(result.embedding),
              dimensions: result.embedding.length,
              updated_at: now
            };
          }
        } catch (error) {
          console.error('Error updating embeddings:', error);
          // Continue without updating embeddings if there's an error
        }
      }
      
      await docRef.update(updateData);
      
      // Return the updated book
      const updatedDoc = await docRef.get();
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as ExampleBook;
    } catch (error) {
      console.error('Error updating example book:', error);
      throw new Error(`Failed to update example book: ${error.message}`);
    }
  }
  
  /**
   * Delete example book
   */
  async deleteExampleBook(id: string, workspaceId: string): Promise<void> {
    try {
      const docRef = this.firestore.collection('example_books').doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error('Example book not found');
      }
      
      const bookData = doc.data() as ExampleBook;
      
      // Verify workspace access through the research project
      const researchRef = this.firestore.collection('research').doc(bookData.book_id);
      const researchDoc = await researchRef.get();
      
      if (!researchDoc.exists) {
        throw new Error('Associated research project not found');
      }
      
      const researchData = researchDoc.data();
      if (researchData?.workspace_id !== workspaceId) {
        throw new Error('Access denied to this example book');
      }
      
      // Remove book reference from the research project
      await researchRef.update({
        example_book_ids: FieldValue.arrayRemove(id),
        updated_at: new Date()
      });
      
      // Soft delete the book
      await docRef.update({
        deleted_at: new Date()
      });
    } catch (error) {
      console.error('Error deleting example book:', error);
      throw new Error(`Failed to delete example book: ${error.message}`);
    }
  }

  /**
   * Generate or update embeddings for an existing book
   */
  async generateBookEmbeddings(
    bookId: string,
    fields: string[] = ['description'],
    provider?: string,
    model?: string,
    workspaceId: string
  ): Promise<ExampleBook> {
    try {
      // Get the book
      const book = await this.getExampleBookById(bookId, workspaceId);
      
      if (!book) {
        throw new Error('Book not found');
      }
      
      const now = new Date();
      let embeddings = book.vector_embeddings || {};
      const embeddingUpdates = {};
      
      // Create embedding handler with custom provider/model if specified
      const config: any = {};
      if (provider) config.provider = provider;
      if (model) config.model = model;
      
      const embedHandler = new EmbeddingsHandler(config);
      
      // Generate embeddings for each requested field
      for (const field of fields) {
        if (!book[field]) {
          console.warn(`Field ${field} not available for embedding in book ${bookId}`);
          continue;
        }
        
        try {
          const result = await embedHandler.getEmbedding(book[field]);
          
          if (result.embedding && result.embedding.length > 0) {
            // Set embedding field name (e.g., "title_embedding")
            const embeddingField = `${field}_embedding`;
            
            // Store embedding info
            embeddingUpdates[`vector_embeddings.${embeddingField}`] = FieldValue.vector(result.embedding);
            embeddingUpdates[`vector_embeddings.provider`] = provider || 'vertexai';
            embeddingUpdates[`vector_embeddings.model`] = model || 'textembedding-gecko';
            embeddingUpdates[`vector_embeddings.dimensions`] = result.embedding.length;
            embeddingUpdates[`vector_embeddings.created_at`] = now;
          }
        } catch (error) {
          console.error(`Error generating embedding for field ${field}:`, error);
        }
      }
      
      // Update the book with new embeddings if any were generated
      if (Object.keys(embeddingUpdates).length > 0) {
        await this.firestore.collection('example_books').doc(bookId).update({
          ...embeddingUpdates,
          updated_at: now
        });
        
        // Get the updated book
        const updatedBook = await this.getExampleBookById(bookId, workspaceId);
        return updatedBook;
      }
      
      return book;
    } catch (error) {
      console.error('Error generating book embeddings:', error);
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }
  
  /**
   * Generate embeddings in batch for multiple books
   */
  async batchGenerateEmbeddings(
    bookIds: string[],
    fields: string[] = ['description'],
    provider?: string,
    model?: string, 
    workspaceId: string
  ): Promise<{ success: string[], failed: string[] }> {
    const results = {
      success: [],
      failed: []
    };
    
    for (const bookId of bookIds) {
      try {
        await this.generateBookEmbeddings(bookId, fields, provider, model, workspaceId);
        results.success.push(bookId);
      } catch (error) {
        console.error(`Failed to generate embeddings for book ${bookId}:`, error);
        results.failed.push(bookId);
      }
    }
    
    return results;
  }
  
  /**
   * Cluster books by content similarity
   */
  async clusterBooks(
    researchId: string,
    field: string = 'description',
    numClusters: number = 3,
    workspaceId: string
  ): Promise<Array<{ cluster_id: number, books: ExampleBook[] }>> {
    try {
      // First, verify research project exists and belongs to workspace
      const researchRef = this.firestore.collection('research').doc(researchId);
      const researchDoc = await researchRef.get();
      
      if (!researchDoc.exists) {
        throw new Error('Research project not found');
      }
      
      const researchData = researchDoc.data();
      if (researchData?.workspace_id !== workspaceId) {
        throw new Error('Access denied to this research project');
      }
      
      // Get all books for this research project
      const snapshot = await this.firestore
        .collection('example_books')
        .where('book_id', '==', researchId)
        .where('deleted_at', '==', null)
        .get();
      
      const books = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExampleBook[];
      
      // Filter books that have the required embedding
      const embeddingField = `vector_embeddings.${field}_embedding`;
      const booksWithEmbeddings = books.filter(book => 
        book.vector_embeddings && book.vector_embeddings[`${field}_embedding`]
      );
      
      if (booksWithEmbeddings.length < 2) {
        throw new Error('Not enough books with embeddings for clustering');
      }
      
      // Implement a simple k-means clustering
      // In a production environment, this would be better handled by a specialized service
      // or the vector database's built-in clustering capabilities
      
      // For demonstration purposes, we'll use a simplified approach:
      // Group books based on similarity to each other
      
      // Step 1: Create a similarity matrix
      const similarityMatrix = [];
      for (let i = 0; i < booksWithEmbeddings.length; i++) {
        similarityMatrix[i] = [];
        for (let j = 0; j < booksWithEmbeddings.length; j++) {
          if (i === j) {
            similarityMatrix[i][j] = 1; // Self-similarity is 1
          } else if (i < j) {
            // Calculate similarity by finding nearest neighbors in one direction
            try {
              const book1 = booksWithEmbeddings[i];
              const book2 = booksWithEmbeddings[j];
              const vector1 = book1.vector_embeddings[`${field}_embedding`];
              const vector2 = book2.vector_embeddings[`${field}_embedding`];
              
              // Calculate cosine similarity
              let dotProduct = 0;
              let mag1 = 0;
              let mag2 = 0;
              
              for (let k = 0; k < vector1.length; k++) {
                dotProduct += vector1[k] * vector2[k];
                mag1 += vector1[k] * vector1[k];
                mag2 += vector2[k] * vector2[k];
              }
              
              mag1 = Math.sqrt(mag1);
              mag2 = Math.sqrt(mag2);
              
              const similarity = dotProduct / (mag1 * mag2);
              similarityMatrix[i][j] = similarity;
            } catch (error) {
              console.error(`Error calculating similarity between books ${i} and ${j}:`, error);
              similarityMatrix[i][j] = 0;
            }
          } else {
            // Use previously calculated value
            similarityMatrix[i][j] = similarityMatrix[j][i];
          }
        }
      }
      
      // Step 2: Initialize clusters randomly
      const clusters = Array(numClusters).fill(null).map(() => []);
      const assigned = new Set();
      
      // Assign initial centroids (furthest from each other)
      let centroidIndices = [0]; // Start with first book
      assigned.add(0);
      
      while (centroidIndices.length < numClusters && centroidIndices.length < booksWithEmbeddings.length) {
        let maxDistance = -Infinity;
        let furthestIndex = -1;
        
        // Find the book furthest from all current centroids
        for (let i = 0; i < booksWithEmbeddings.length; i++) {
          if (assigned.has(i)) continue;
          
          // Calculate minimum similarity to any centroid
          let minSimilarity = 1;
          for (const centroidIndex of centroidIndices) {
            const similarity = similarityMatrix[i][centroidIndex];
            if (similarity < minSimilarity) {
              minSimilarity = similarity;
            }
          }
          
          // Convert similarity to distance (1 - similarity for cosine)
          const distance = 1 - minSimilarity;
          
          if (distance > maxDistance) {
            maxDistance = distance;
            furthestIndex = i;
          }
        }
        
        if (furthestIndex !== -1) {
          centroidIndices.push(furthestIndex);
          assigned.add(furthestIndex);
        } else {
          break; // No more points to add
        }
      }
      
      // Step 3: Assign books to nearest centroid
      for (let i = 0; i < booksWithEmbeddings.length; i++) {
        if (centroidIndices.includes(i)) continue; // Skip centroids
        
        let maxSimilarity = -Infinity;
        let bestCluster = 0;
        
        for (let j = 0; j < centroidIndices.length; j++) {
          const similarity = similarityMatrix[i][centroidIndices[j]];
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            bestCluster = j;
          }
        }
        
        clusters[bestCluster].push(i);
      }
      
      // Add centroids to their clusters
      for (let i = 0; i < centroidIndices.length; i++) {
        clusters[i].push(centroidIndices[i]);
      }
      
      // Step 4: Format the results
      const result = clusters.map((clusterIndices, index) => {
        return {
          cluster_id: index,
          books: clusterIndices.map(i => booksWithEmbeddings[i])
        };
      });
      
      return result;
    } catch (error) {
      console.error('Error clustering books:', error);
      throw new Error(`Failed to cluster books: ${error.message}`);
    }
  }
}
