import { defineEventHandler } from 'h3'
import { getUserSession, type UserSession } from '../../../../../auth/server/utils/session'
import { useFirebaseServer } from '../../../../../auth/server/firebase/init'
import { collection, query, where, getDocs, orderBy, QueryConstraint } from 'firebase/firestore'

export default defineEventHandler(async (event) => {
  try {
    console.log('[Folders] Starting to fetch folders')
    
    // Get user session
    const session: UserSession | null = await getUserSession(event)
    console.log('[Folders] Session:', { 
      hasSession: !!session,
      userId: session?.user?.id,
      workspaceId: session?.currentWorkspace?.id 
    })
    
    if (!session) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    if (!session.currentWorkspace?.id) {
      throw createError({
        statusCode: 400,
        message: 'No workspace selected'
      })
    }

    // Get query parameters
    const queryParams = getQuery(event)
    const parentId = queryParams.parentId as string | undefined
    console.log('[Folders] Query params:', { parentId, type: typeof parentId })
    const token = session?.user?.token?.idToken as string

    const { firestore } = useFirebaseServer(token)
    if (!firestore) {
      throw createError({
        statusCode: 500,
        message: 'Firestore not initialized'
      })
    }

    // Get folders for current workspace
    console.log('[Folders] Querying Firestore for workspace:', session.currentWorkspace.id)
    const foldersRef = collection(firestore, 'folders')
    const queryConstraints: QueryConstraint[] = [
      where('workspace_id', '==', session.currentWorkspace.id),
      where('deleted_at', '==', null)
    ]

    // Handle parentId: empty string or undefined should be treated as requesting root folders
    if (parentId === undefined || parentId === '') {
      console.log('[Folders] Querying root folders (null parent_id)')
      queryConstraints.push(where('parent_id', '==', null))
    } else {
      console.log('[Folders] Querying folders with parent:', parentId)
      queryConstraints.push(where('parent_id', '==', parentId))
    }

    // Add ordering last
    queryConstraints.push(orderBy('created_at', 'asc'))

    const q = query(foldersRef, ...queryConstraints)
    console.log('[Folders] Query constraints:', {
      constraints: queryConstraints.map(c => ({ type: c.type })),
      workspace_id: session.currentWorkspace.id,
      parent_id: parentId === undefined || parentId === '' ? null : parentId
    })
    
    const foldersSnapshot = await getDocs(q)
    const items = foldersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    console.log('[Folders] Found folders:', { 
      count: items.length,
      workspaceId: session.currentWorkspace.id,
      parentId,
      items
    })
    
    return items
  } catch (error: any) {
    console.error('[Folders] Error:', {
      message: error.message,
      code: error.code,
      status: error.statusCode,
      stack: error.stack
    })
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to get folders'
    })
  }
}) 