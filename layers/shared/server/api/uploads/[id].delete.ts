import { defineEventHandler } from 'h3'
import { getUserSession, type UserSession } from '../../../../auth/server/utils/session'
import { useFirebaseServer } from '../../../../auth/server/firebase/init'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

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
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Upload ID is required'
      })
    }

    const token = session?.user?.token?.idToken as string
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

    // Soft delete by setting deleted_at
    await updateDoc(uploadRef, {
      deleted_at: serverTimestamp(),
      updated_at: serverTimestamp()
    })

    return { 
      id,
      message: 'Upload deleted successfully'
    }
  } catch (error: any) {
    console.error('[uploads/delete] Error:', error)
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Failed to delete upload'
    })
  }
}) 