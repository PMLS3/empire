import { defineEventHandler } from 'h3'
import { getUserSession, type UserSession } from '../../../../auth/server/utils/session'
import { useFirebaseServer } from '../../../../auth/server/firebase/init'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'

export default defineEventHandler(async (event) => {
  try {
    // Get user session
    const session: UserSession | null = await getUserSession(event)
    if (!session) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    // Get query parameters
    const queryParams = getQuery(event)
    const folderId = queryParams.folderId as string | undefined
    const token = session?.user?.token?.idToken as string
    console.log('token---------->', token)
    const { firestore } = useFirebaseServer(token)

    // Get uploads for current workspace
    const uploadsRef = collection(firestore, 'uploads')
    const q = query(
      uploadsRef,
      where('workspace_id', '==', session.currentWorkspace?.id),
      where('deleted_at', '==', null),
      folderId
        ? where('folder_id', '==', folderId)
        : where('folder_id', '==', null),
      orderBy('created_at', 'asc')
    )

    const uploadsSnapshot = await getDocs(q)
    const items = uploadsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return items
  } catch (error: any) {
    console.error('Get uploads error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to get uploads'
    })
  }
}) 