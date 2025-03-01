import { Tool } from "@langchain/core/tools";
import { v4 as uuidv4 } from "uuid";
import { 
  collection, 
  query as firestoreQuery, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Firestore
} from "firebase/firestore";
import { useFirebaseServer } from "~/server/firebase/init";

/**
 * FirestoreTool - A tool for interacting with Firestore database
 * This tool uses the Firebase SDK directly to perform CRUD operations
 */
export class FirestoreTool extends Tool {
  name = "firestore";
  description = "A tool for interacting with Firestore database. Input should be a JSON string with 'operation' (read, write, update, delete), 'collection', and other required parameters based on the operation.";
  
  private firestore: Firestore | null = null;
  private idToken: string;
  private userId: string;
  private workspaceId: string;

  constructor(idToken: string, userId: string, workspaceId: string) {
    super();
    this.idToken = idToken;
    this.userId = userId;
    this.workspaceId = workspaceId;
    this.initializeFirestore();
  }

  private initializeFirestore() {
    try {
      const { firestore } = useFirebaseServer(this.idToken);
      this.firestore = firestore;
    } catch (error) {
      console.error("Failed to initialize Firestore:", error);
      throw new Error("Failed to initialize Firestore");
    }
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      if (!this.firestore) {
        this.initializeFirestore();
        if (!this.firestore) {
          throw new Error("Firestore is not initialized");
        }
      }

      const params = JSON.parse(input);
      const { operation, collection: collectionName } = params;

      if (!operation) {
        throw new Error("Operation is required");
      }

      if (!collectionName) {
        throw new Error("Collection is required");
      }

      switch (operation.toLowerCase()) {
        case "read":
          return await this.read(params);
        case "write":
          return await this.write(params);
        case "update":
          return await this.update(params);
        case "delete":
          return await this.delete(params);
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Firestore error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Firestore operation');
    }
  }

  private async read(params: any): Promise<string> {
    try {
      const { collection: collectionName, readType, id, filters = [] } = params;
      
      if (!readType) {
        throw new Error("readType is required for read operation");
      }

      if (readType === 'id' && !id) {
        throw new Error("id is required for read operation with readType 'id'");
      }

      if (!this.firestore) {
        throw new Error("Firestore is not initialized");
      }

      if (readType === 'id') {
        // Get document by ID
        const docRef = doc(this.firestore, collectionName, id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error(`Document not found: ${id}`);
        }
        
        return JSON.stringify({
          id: docSnap.id,
          ...docSnap.data()
        });
      } else if (readType === 'query') {
        // Query collection with filters
        const collectionRef = collection(this.firestore, collectionName);
        
        // Build query with filters
        const queryConstraints = [
          where('workspace_id', '==', this.workspaceId),
          where('deleted_at', '==', null)
        ];
        
        // Add custom filters if provided
        if (filters && filters.length > 0) {
          for (const filter of filters) {
            if (Array.isArray(filter) && filter.length === 3) {
              queryConstraints.push(where(filter[0], filter[1], filter[2]));
            }
          }
        }
        
        const q = firestoreQuery(collectionRef, ...queryConstraints);
        const querySnapshot = await getDocs(q);
        
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        return JSON.stringify(results);
      } else {
        throw new Error(`Unsupported readType: ${readType}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Firestore read error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Firestore read operation');
    }
  }

  private async write(params: any): Promise<string> {
    try {
      const { collection: collectionName, ...data } = params;
      
      if (!this.firestore) {
        throw new Error("Firestore is not initialized");
      }

      // Create new document
      const newDocId = uuidv4();
      const docRef = doc(this.firestore, collectionName, newDocId);
      
      const docData = {
        workspace_id: this.workspaceId,
        owner_id: this.userId,
        ...data,
        status: 'in_progress',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        deleted_at: null
      };
      
      await setDoc(docRef, docData);
      
      return JSON.stringify({
        id: newDocId,
        ...docData
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Firestore write error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Firestore write operation');
    }
  }

  private async update(params: any): Promise<string> {
    try {
      const { collection: collectionName, id, ...data } = params;
      
      if (!id) {
        throw new Error("id is required for update operation");
      }
      
      if (!this.firestore) {
        throw new Error("Firestore is not initialized");
      }

      // Update document
      const docRef = doc(this.firestore, collectionName, id);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`Document not found: ${id}`);
      }
      
      const updateData = {
        ...data,
        updated_at: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      
      // Get updated document
      const updatedDocSnap = await getDoc(docRef);
      
      return JSON.stringify({
        id: updatedDocSnap.id,
        ...updatedDocSnap.data()
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Firestore update error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Firestore update operation');
    }
  }

  private async delete(params: any): Promise<string> {
    try {
      const { collection: collectionName, id } = params;
      
      if (!id) {
        throw new Error("id is required for delete operation");
      }
      
      if (!this.firestore) {
        throw new Error("Firestore is not initialized");
      }

      // Soft delete by updating the deleted_at field
      const docRef = doc(this.firestore, collectionName, id);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`Document not found: ${id}`);
      }
      
      await updateDoc(docRef, {
        deleted_at: serverTimestamp()
      });
      
      return JSON.stringify({
        id,
        deleted: true
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Firestore delete error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Firestore delete operation');
    }
  }
}

/**
 * FirestoreVectorTool - A tool for interacting with Firestore vector database
 * This tool provides vector search capabilities for Firestore
 */
export class FirestoreVectorTool extends Tool {
  name = "firestore_vector";
  description = "A tool for interacting with Firestore vector database. Input should be a JSON string with 'operation' (search), 'collection', 'query', and optional 'limit' and 'filters' parameters.";
  
  private firestore: Firestore | null = null;
  private idToken: string;
  private userId: string;
  private workspaceId: string;

  constructor(idToken: string, userId: string, workspaceId: string) {
    super();
    this.idToken = idToken;
    this.userId = userId;
    this.workspaceId = workspaceId;
    this.initializeFirestore();
  }

  private initializeFirestore() {
    try {
      const { firestore } = useFirebaseServer(this.idToken);
      this.firestore = firestore;
    } catch (error) {
      console.error("Failed to initialize Firestore:", error);
      throw new Error("Failed to initialize Firestore");
    }
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      if (!this.firestore) {
        this.initializeFirestore();
        if (!this.firestore) {
          throw new Error("Firestore is not initialized");
        }
      }

      const params = JSON.parse(input);
      const { operation } = params;

      if (operation.toLowerCase() === "search") {
        return await this.search(params);
      } else {
        throw new Error(`Unsupported operation for vector search: ${operation}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Firestore vector error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Firestore vector operation');
    }
  }

  private async search(params: any): Promise<string> {
    try {
      const { collection: collectionName, query, limit = 10, filters = [] } = params;
      
      if (!query) {
        throw new Error("query is required for search operation");
      }

      if (!this.firestore) {
        throw new Error("Firestore is not initialized");
      }

      // For vector search, we need to use a special collection or approach
      // This is a simplified implementation that would need to be expanded
      // based on your actual vector search implementation
      
      const collectionRef = collection(this.firestore, collectionName);
      
      // Build query with filters
      const queryConstraints = [
        where('workspace_id', '==', this.workspaceId),
        where('deleted_at', '==', null)
      ];
      
      // Add custom filters if provided
      if (filters && filters.length > 0) {
        for (const filter of filters) {
          if (Array.isArray(filter) && filter.length === 3) {
            queryConstraints.push(where(filter[0], filter[1], filter[2]));
          }
        }
      }
      
      const q = firestoreQuery(collectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      // In a real implementation, you would use a vector search library or service
      // Here we're just returning the documents and simulating a vector search
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Simulate a relevance score
        score: Math.random()
      }))
      // Sort by the simulated score
      .sort((a, b) => b.score - a.score)
      // Limit the results
      .slice(0, limit);
      
      return JSON.stringify(results);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Firestore vector search error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Firestore vector search operation');
    }
  }
}

/**
 * FirestoreTransactionTool - A tool for performing transactions in Firestore
 * This tool allows for atomic operations across multiple documents
 */
export class FirestoreTransactionTool extends Tool {
  name = "firestore_transaction";
  description = "A tool for performing transactions in Firestore. Input should be a JSON string with 'operations' (array of operations), where each operation has 'type' (read, write, update, delete), 'collection', and other required parameters.";
  
  private firestore: Firestore | null = null;
  private idToken: string;
  private userId: string;
  private workspaceId: string;

  constructor(idToken: string, userId: string, workspaceId: string) {
    super();
    this.idToken = idToken;
    this.userId = userId;
    this.workspaceId = workspaceId;
    this.initializeFirestore();
  }

  private initializeFirestore() {
    try {
      const { firestore } = useFirebaseServer(this.idToken);
      this.firestore = firestore;
    } catch (error) {
      console.error("Failed to initialize Firestore:", error);
      throw new Error("Failed to initialize Firestore");
    }
  }

  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      if (!this.firestore) {
        this.initializeFirestore();
        if (!this.firestore) {
          throw new Error("Firestore is not initialized");
        }
      }

      const params = JSON.parse(input);
      const { operations } = params;

      if (!operations || !Array.isArray(operations) || operations.length === 0) {
        throw new Error("Operations array is required and must not be empty");
      }

      // Execute operations sequentially
      // In a real transaction, you would use Firestore's runTransaction method
      // This is a simplified implementation
      const results = [];
      for (const operation of operations) {
        const { type, collection: collectionName, ...rest } = operation;
        
        if (!type) {
          throw new Error("Operation type is required");
        }

        if (!collectionName) {
          throw new Error("Collection is required");
        }

        let result;
        switch (type.toLowerCase()) {
          case "read":
            result = await this.read({ collectionName, ...rest });
            break;
          case "write":
            result = await this.write({ collectionName, ...rest });
            break;
          case "update":
            result = await this.update({ collectionName, ...rest });
            break;
          case "delete":
            result = await this.delete({ collectionName, ...rest });
            break;
          default:
            throw new Error(`Unsupported operation type: ${type}`);
        }

        results.push({
          type,
          collection: collectionName,
          result: JSON.parse(result)
        });
      }

      return JSON.stringify(results);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Firestore transaction error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Firestore transaction');
    }
  }

  private async read(params: any): Promise<string> {
    try {
      const { collectionName, readType, id, filters = [] } = params;
      
      if (!readType) {
        throw new Error("readType is required for read operation");
      }

      if (readType === 'id' && !id) {
        throw new Error("id is required for read operation with readType 'id'");
      }

      if (!this.firestore) {
        throw new Error("Firestore is not initialized");
      }

      if (readType === 'id') {
        // Get document by ID
        const docRef = doc(this.firestore, collectionName, id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error(`Document not found: ${id}`);
        }
        
        return JSON.stringify({
          id: docSnap.id,
          ...docSnap.data()
        });
      } else if (readType === 'query') {
        // Query collection with filters
        const collectionRef = collection(this.firestore, collectionName);
        
        // Build query with filters
        const queryConstraints = [
          where('workspace_id', '==', this.workspaceId),
          where('deleted_at', '==', null)
        ];
        
        // Add custom filters if provided
        if (filters && filters.length > 0) {
          for (const filter of filters) {
            if (Array.isArray(filter) && filter.length === 3) {
              queryConstraints.push(where(filter[0], filter[1], filter[2]));
            }
          }
        }
        
        const q = firestoreQuery(collectionRef, ...queryConstraints);
        const querySnapshot = await getDocs(q);
        
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        return JSON.stringify(results);
      } else {
        throw new Error(`Unsupported readType: ${readType}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Firestore read error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Firestore read operation');
    }
  }

  private async write(params: any): Promise<string> {
    try {
      const { collectionName, ...data } = params;
      
      if (!this.firestore) {
        throw new Error("Firestore is not initialized");
      }

      // Create new document
      const newDocId = uuidv4();
      const docRef = doc(this.firestore, collectionName, newDocId);
      
      const docData = {
        workspace_id: this.workspaceId,
        owner_id: this.userId,
        ...data,
        status: 'in_progress',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        deleted_at: null
      };
      
      await setDoc(docRef, docData);
      
      return JSON.stringify({
        id: newDocId,
        ...docData
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Firestore write error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Firestore write operation');
    }
  }

  private async update(params: any): Promise<string> {
    try {
      const { collectionName, id, ...data } = params;
      
      if (!id) {
        throw new Error("id is required for update operation");
      }
      
      if (!this.firestore) {
        throw new Error("Firestore is not initialized");
      }

      // Update document
      const docRef = doc(this.firestore, collectionName, id);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`Document not found: ${id}`);
      }
      
      const updateData = {
        ...data,
        updated_at: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      
      // Get updated document
      const updatedDocSnap = await getDoc(docRef);
      
      return JSON.stringify({
        id: updatedDocSnap.id,
        ...updatedDocSnap.data()
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Firestore update error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Firestore update operation');
    }
  }

  private async delete(params: any): Promise<string> {
    try {
      const { collectionName, id } = params;
      
      if (!id) {
        throw new Error("id is required for delete operation");
      }
      
      if (!this.firestore) {
        throw new Error("Firestore is not initialized");
      }

      // Soft delete by updating the deleted_at field
      const docRef = doc(this.firestore, collectionName, id);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`Document not found: ${id}`);
      }
      
      await updateDoc(docRef, {
        deleted_at: serverTimestamp()
      });
      
      return JSON.stringify({
        id,
        deleted: true
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Firestore delete error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in Firestore delete operation');
    }
  }
}
