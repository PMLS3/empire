import { defineEventHandler } from 'h3'
import { getUserSession, type UserSession } from '~/server/utils/session'
import { useFirebaseServer } from '~/server/firebase/init'
import { collection, query as firestoreQuery, deleteDoc,doc, serverTimestamp } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { createError, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    console.log('[Delete] Starting handler')
    
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

    console.log(`[Delete] Delete ${collection} in workspace ${docId}`, { data })

    const { firestore } = useFirebaseServer(session.user?.token?.idToken as string)

      // Create new research
    

      let res = await deleteDoc(doc(firestore, collection, docId))
      console.log('res', res)
     


      const write = {
        id: docId,
        deleted_at: serverTimestamp(),
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