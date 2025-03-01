import { defineEventHandler } from 'h3'
import { setUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  try {
    console.log('📝 Login request received')
    const body = await readBody(event)

        await setUserSession(event, body)

      return body
   
  } catch (error: any) {
    console.error('❌ Login error:', error)


    throw createError({
      statusCode: error.statusCode || 500,
      message: error instanceof Error ? error.message : 'Login failed'
    })
  }
}) 