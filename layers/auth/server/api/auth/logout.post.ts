import { clearUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  return { success: true }
}) 