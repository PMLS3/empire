import { defineEventHandler } from 'h3'
import { getUserSession } from '../../../../../auth/server/utils/session'
import { useFirebaseServer } from '~/server/firebase/init'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

export default defineEventHandler(async (event) => {
  try {
    // Get user session
    const session = await getUserSession(event)
    if (!session) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    // Get folder ID from params
    const folderId = getRouterParam(event, 'id')
    if (!folderId) {
      throw createError({
        statusCode: 400,
        message: 'Folder ID is required'
      })
    }

    const { firestore } = useFirebase()

    // Get folder document
    const folderRef = doc(firestore, 'folders', folderId)
    const folderDoc = await getDoc(folderRef)

    if (!folderDoc.exists()) {
      throw createError({
        statusCode: 404,
        message: 'Folder not found'
      })
    }

    const folderData = folderDoc.data()
    if (folderData.workspace_id !== session.currentWorkspaceId) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden'
      })
    }

    // Soft delete folder
    await updateDoc(folderRef, {
      deleted_at: serverTimestamp(),
      updated_at: serverTimestamp()
    })

    return {
      id: folderDoc.id,
      ...folderData,
      deleted_at: serverTimestamp()
    }
  } catch (error: any) {
    console.error('Delete folder error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete folder'
    })
  }
}) 