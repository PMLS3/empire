import { defineEventHandler } from 'h3'
import { getUserSession } from '../../../../../auth/server/utils/session'
import { useFirebaseServer } from '../../../../../auth/server/firebase/init'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const createFolderSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().nullable()
})

export default defineEventHandler(async (event) => {
  try {
    console.log('[Folder Creation] Starting folder creation process')
    
    // Get user session
    console.log('[Folder Creation] Attempting to get user session')
    const session = await getUserSession(event)
    console.log('[Folder Creation] Session retrieved:', {
      userId: session?.id,
      workspaceId: session?.currentWorkspaceId,
      hasSession: !!session
    })
    
    if (!session) {
      console.error('[Folder Creation] No session found')
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    if (!session.currentWorkspaceId) {
      console.error('[Folder Creation] No workspace selected')
      throw createError({
        statusCode: 400,
        message: 'No workspace selected'
      })
    }

    // Validate input
    console.log('[Folder Creation] Reading request body')
    const body = await readBody(event)
    console.log('[Folder Creation] Request body:', body)
    
    console.log('[Folder Creation] Validating input')
    const input = createFolderSchema.parse(body)
    console.log('[Folder Creation] Validated input:', input)

    const { firestore } = useFirebaseServer(body.token)
    if (!firestore) {
      throw createError({
        statusCode: 500,
        message: 'Firestore not initialized'
      })
    }

    // Create folder
    const folderId = uuidv4()
    const folderRef = doc(firestore, 'folders', folderId)
    const folderData = {
      id: folderId,
      name: input.name,
      owner_id: session.id,
      workspace_id: session.currentWorkspaceId,
      parent_id: input.parentId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      deleted_at: null,
      shared: false,
      shared_with: [],
      path: input.parentId ? `${input.parentId}/${folderId}` : folderId
    }

    console.log('[Folder Creation] Attempting to create folder in Firestore:', folderData)

    await setDoc(folderRef, folderData)

    console.log('[Folder Creation] Folder created successfully:', folderData)

    return folderData
  } catch (error: any) {
    console.error('[Folder Creation] Error details:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
      cause: error.cause
    })
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to create folder'
    })
  }
}) 