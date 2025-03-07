import { defineEventHandler, createError } from 'h3'
import { AccountStatus } from '../../../../types'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // Get account ID from route parameter
    const accountId = event.context.params.id
    
    if (!accountId) {
      throw createError({
        statusCode: 400,
        message: 'Account ID is required'
      })
    }
    
    // Update account status in database
    const client = serverSupabaseClient(event)
    const { data, error } = await client
      .from('social_accounts')
      .update({
        status: AccountStatus.DISCONNECTED,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId)
    
    if (error) {
      console.error('Error disconnecting account:', error)
      throw createError({
        statusCode: 500,
        message: 'Failed to disconnect account'
      })
    }
    
    return {
      success: true,
      message: 'Account disconnected successfully'
    }
  } catch (error) {
    console.error('Error in disconnect endpoint:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to disconnect account'
    })
  }
})