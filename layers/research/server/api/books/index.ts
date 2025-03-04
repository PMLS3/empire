import { defineEventHandler, getQuery, useBase } from 'h3'
import { getUserSession } from '../../../../ai/server/utils/session'
import { getBooks, getBookById } from '../../models/book.model'

export default defineEventHandler(async (event) => {
  // Get session and check login status
  const session = await getUserSession(event)
  if (!session?.user) return { error: 'Not logged in' }
  
  // Get the current workspace ID
  const workspaceId = session.currentWorkspace?.workspaceId || ''
  
  // Get query parameters
  const query = getQuery(event)
  const { researchId } = query
  
  // Get books for this workspace and optionally filter by research ID
  const books = await getBooks(event, workspaceId, researchId as string)
  
  return {
    books
  }
})
