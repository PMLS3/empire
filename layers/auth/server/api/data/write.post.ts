import { defineEventHandler } from 'h3'
import { getUserSession, type UserSession } from '../../utils/session'
import { useFirebaseServer } from '../../firebase/init'
import { collection, query as firestoreQuery, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { createError, readBody } from 'h3'
import { createEmbeddings} from '../../utils/session'
import {
  FieldValue,
} from "@google-cloud/firestore";

export default defineEventHandler(async (event) => {
  try {
    console.log('[Write] Starting handler')
    
    // Get user session
    const session: UserSession | null = await getUserSession(event)
    if (!session) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    // Get query parameters
    const body = await readBody(event)
    const workspaceId = session.currentWorkspace?.id
    const data = body as any
    const collection = body.collection
    const embed = body.embed // Use the same parameter name as in useCreatorData

    if (!workspaceId || !data || !collection) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameters'
      })
    }

    // Generate embeddings if fields are specified
    if (embed && Array.isArray(embed) && embed.length > 0) {
      console.log('Embedding fields:', embed)
      const embeddings = await createEmbeddings(data, embed)
      console.log('Embeddings generated:', !!embeddings)
      if (embeddings) data['embedding'] = embeddings // Use 'embedding' for consistency
    }

    console.log(`[Write] Creating ${collection} in workspace ${workspaceId}`, { data })

    const { firestore } = useFirebaseServer(session.user?.token?.idToken as string)

    // Create new document
    console.log(`[Write] Creating new document`)
    const newWriteId = uuidv4()
    console.log('ID', newWriteId)
    const newWriteRef = doc(firestore, collection, newWriteId)
    const newWriteData = {
      workspace_id: workspaceId,
      owner_id: session.user?.id,
      ...data,
      status: 'in_progress',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      deleted_at: null,
      id: newWriteId
    }

    await setDoc(newWriteRef, newWriteData)
    const write = {
      ...newWriteData,
      id: newWriteId,
    }
    console.log('ID', newWriteId)
    console.log('Write', write)
    
    return {
      statusCode: 200,
      data: newWriteId
    }
  } catch (error: any) {
    console.error('[Write] Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create document'
    })
  }
})

// Helper function to extract text from specified fields
function getTextFromFields(data: any, fields: string[]): string {
  if (!data) return '';
  
  // Collect text from all fields
  const texts: string[] = [];
  
  fields.forEach(field => {
    // Handle nested fields (e.g., metadata.tags)
    const fieldParts = field.split('.');
    let value = data;
    
    // Navigate through nested objects
    for (const part of fieldParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        value = undefined;
        break;
      }
    }
    
    // Add field value to texts if it exists
    if (value !== undefined) {
      if (Array.isArray(value)) {
        // Join array values with space
        texts.push(value.join(' '));
      } else if (typeof value === 'string') {
        texts.push(value);
      } else {
        // Convert to string
        texts.push(String(value));
      }
    }
  });
  
  return texts.join(' ').trim();
}