import { defineEventHandler } from 'h3'
import { getUserSession, type UserSession } from '../../utils/session'
import { useFirebaseServer } from '../../firebase/init'
import { collection, query as firestoreQuery, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { createError, readBody } from 'h3'

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
    const docId = body?.id
    const data = body as any
    const collection = body.collection

    if (!docId || !data || !collection) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameters'
      })
    }

    console.log(`[Update] Update ${collection} in workspace ${docId}`, { data })

    const { firestore } = useFirebaseServer(session.user?.token?.idToken as string)

      // Create new research
      console.log(`[Update] No existing ${collection}, creating new one`)
      const newWriteId = uuidv4()
      const newWriteRef = doc(firestore, collection, newWriteId)
      const newWriteData = {
       ...data,
        updated_at: serverTimestamp(),
        deleted_at: null
      }

      await setDoc(newWriteRef, newWriteData)

      const write = {
        id: newWriteId,
        ...newWriteData,
      }

    return {
      statusCode: 200,
      data: write
    }
  } catch (error: any) {
    console.error('[Research] Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch research'
    })
  }
}) 