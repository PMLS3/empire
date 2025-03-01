import { defineEventHandler } from 'h3'
import { getUserSession, type UserSession } from '../../utils/session'
import { useFirebaseServer } from '../../firebase/init'
import { collection, query as firestoreQuery, where, getDocs, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { createError, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    console.log('[Read] Starting handler')
    
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
    const readType = body.readType as 'id' | 'query' | 'vector'
    const collection = body.collection
    const filters = body.filters
    const id    = body.id

    if (!workspaceId || !readType || !collection) {
      throw createError({
        statusCode: 400,
        message: 'Missing required parameters'
      })
    }

    console.log(`[Read] Reading ${collection} in workspace ${workspaceId}`)

    const { firestore } = useFirebaseServer(session.user?.token?.idToken as string)

    // Query for existing data


     // Query for existing data
     const dataRef = collection(firestore, collection)
     let data = {}

     if (readType === 'query') {
      // Query for collection by ID


      const q = firestoreQuery(
        dataRef,
        where('workspace_id', '==', workspaceId),
        where('deleted_at', '==', null),
        ...filters
      )
      let res = await getDocs(q)
      data = res.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
   
     } else if (readType === 'id') {
      
       const newDataRef = doc(firestore, collection, id)
   
      let res = await getDoc(newDataRef)
 
       data = {
         id: id,
         ...res.data()
       }
     } else if (readType === 'vector') {
      
       const newDataRef = doc(firestore, collection, id)
   
       let res = await getDoc(newDataRef)
 
       data = {
         id: id,
         ...res.data()
       }
     } 
 
     return {data: data}
  } catch (error: any) {
    console.error('[Research] Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch research'
    })
  }
}) 