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
    const col_vec = body.col_vec

    if (!workspaceId || !data || !collection) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameters'
      })
    }

    if (col_vec) {
      console.log('Col vec', col_vec)
    const embeddings = await createEmbeddings(data, col_vec)
    console.log('Embeddings', embeddings)
   if (embeddings) data['vector'] = embeddings
    }

    console.log(`[Write] Creating ${collection} in workspace ${workspaceId}`, { data })

    const { firestore } = useFirebaseServer(session.user?.token?.idToken as string)

    // Query for existing research
    
      // Create new research
      console.log(`[Write] No existing research, creating new one`)
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
    console.error('[Research] Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch research'
    })
  }
})