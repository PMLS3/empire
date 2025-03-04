import { defineEventHandler } from 'h3'
import { getUserSession, type UserSession } from '../../utils/session'
import { useFirebaseServer } from '../../firebase/init'
import { collection as firestoreCollection, query as firestoreQuery, where, getDocs, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { createError, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    console.log('[Read] Starting handler')
    
    // Get user session - try from cookie first, then from Authorization header
    let session: UserSession | null = await getUserSession(event);
    
    // Attempt to get authentication from header if session is not available
    if (!session) {
      const authHeader = event.headers.get('authorization');
      console.log('[Read] No session cookie, checking Authorization header:', !!authHeader);
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          // Use the token to initialize Firebase
          const { firestore } = useFirebaseServer(token);
          // Create a minimal session
          session = {
            user: { token: { idToken: token } },
            authenticated: true
          } as UserSession;
          console.log('[Read] Created session from Authorization header');
        } catch (authError) {
          console.error('[Read] Failed to authenticate with token:', authError);
        }
      }
    }
    
    if (!session) {
      console.error('[Read] Authentication failed: No valid session or token provided');
      throw createError({
        statusCode: 401,
        message: 'Unauthorized: No valid session or token'
      });
    }

    // Get query parameters
    const body = await readBody(event);
    console.log('[Read] Request body:', JSON.stringify(body, null, 2));
    
    const workspaceId = session.currentWorkspace?.id || body.workspace_id;
    const readType = body.readType as 'id' | 'query' | 'vector';
    const collectionName = body.collection; // Rename to avoid conflict with Firebase collection function
    const filters = body.filters;
    const id = body.id;

    if (!readType || !collectionName) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameters: readType or collection'
      });
    }

    console.log(`[Read] Reading ${collectionName} with type ${readType}, workspace: ${workspaceId || 'N/A'}`);

    const { firestore } = useFirebaseServer(session.user?.token?.idToken as string);

    // Query for existing data - using firestoreCollection instead of collection
    const dataRef = firestoreCollection(firestore, collectionName);
    let data = {};

    if (readType === 'query') {
      // Query for collection data
      let queryConstraints = [];
      
      // Add workspace filter if available and appropriate
      if (workspaceId) {
        queryConstraints.push(where('workspace_id', '==', workspaceId));
      }
      
      // Add deleted_at filter
      queryConstraints.push(where('deleted_at', '==', null));
      
      // Add custom filters if provided
      if (Array.isArray(filters) && filters.length > 0) {
        for (const filter of filters) {
          if (filter.field && filter.operator && filter.value !== undefined) {
            queryConstraints.push(where(filter.field, filter.operator, filter.value));
          }
        }
      }
      
      const q = firestoreQuery(dataRef, ...queryConstraints);
      let res = await getDocs(q);
      data = res.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`[Read] Query returned ${res.docs.length} documents`);
   
    } else if (readType === 'id') {
      const newDataRef = doc(firestore, collectionName, id);
      let res = await getDoc(newDataRef);
 
      if (!res.exists()) {
        console.log(`[Read] Document with ID ${id} not found`);
        data = null;
      } else {
        data = {
          id: id,
          ...res.data()
        };
        console.log(`[Read] Retrieved document with ID ${id}`);
      }
    } else if (readType === 'vector') {
      // Vector search not implemented yet
      const newDataRef = doc(firestore, collectionName, id);
      let res = await getDoc(newDataRef);
 
      data = {
        id: id,
        ...res.data()
      };
      console.log(`[Read] Vector search - retrieved document with ID ${id}`);
    }
 
    return {data: data};
  } catch (error: any) {
    console.error('[Read] Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to read data'
    });
  }
});