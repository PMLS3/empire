import { defineEventHandler, readBody } from 'h3'
import { getUserSession, type UserSession } from '../../../../auth/server/utils/session'
import { useFirebaseServer } from '../../../../auth/server/firebase/init'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { z } from 'zod'

const updateUploadSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  size: z.string().transform(val => parseInt(val, 10)).optional(),
  src: z.string().optional(),
  understanding: z.string().optional(),
  summary: z.string().optional(),
  metadata: z.any().optional(),
})

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

    const body = await readBody(event)
    const validatedData = updateUploadSchema.parse(body)

    const { firestore } = useFirebaseServer(session?.user?.token?.idToken as string)

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

    // Update upload
    const updates = {
      ...validatedData,
      updated_at: serverTimestamp()
    }

    await updateDoc(uploadRef, updates)

    // Get updated upload
    const updatedDoc = await getDoc(uploadRef)
    const updatedData = updatedDoc.data()

    return {
      id: updatedDoc.id,
      ...updatedData
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: error.errors[0].message
      })
    }

    console.error('[uploads/patch] Error:', error)
    throw createError({
      statusCode: error.statusCode || 400,
      message: error.message || 'Failed to update upload'
    })
  }
}) 