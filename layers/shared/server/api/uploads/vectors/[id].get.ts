import { defineEventHandler } from 'h3'
import { getUserSession, type UserSession } from '../../../../../auth/server/utils/session'
import { useFirebaseServer } from '../../../../../auth/server/firebase/init'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'

export default defineEventHandler(async (event) => {
  try {
    const session: UserSession | null = await getUserSession(event)
    if (!session) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const id = getRouterParam(event, 'id')
    const token = session?.user?.token?.idToken as string
    console.log('[Vectors] Checking vectors for upload:', id)

    const { firestore } = useFirebaseServer(token)

    // Get upload document
    const uploadRef = doc(firestore, 'uploads', id)
    const uploadDoc = await getDoc(uploadRef)

    if (!uploadDoc.exists()) {
      throw createError({
        statusCode: 404,
        message: 'Upload not found'
      })
    }

    const uploadData = uploadDoc.data()
    if (uploadData.workspace_id !== session.currentWorkspace?.id) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden'
      })
    }

    // Get vector chunks
    const chunksRef = collection(firestore, 'upload_chunks')
    const q = query(
      chunksRef,
      where('upload_id', '==', id),
      where('deleted_at', '==', null)
    )
    const chunksSnapshot = await getDocs(q)
    const chunks = chunksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    console.log('[Vectors] Found chunks:', {
      uploadId: id,
      chunkCount: chunks.length,
      sampleDimensions: chunks[0]?.embedding?.length
    })

    return {
      upload: {
        id: uploadDoc.id,
        ...uploadData
      },
      chunks: chunks.map(chunk => ({
        id: chunk.id,
        preview: chunk.chunk.substring(0, 100) + (chunk.chunk.length > 100 ? '...' : ''),
        dimensions: chunk.embedding?.length || 0
      }))
    }
  } catch (error: any) {
    console.error('[Vectors] Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to get vectors'
    })
  }
}) 