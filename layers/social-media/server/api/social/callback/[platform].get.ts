import { defineEventHandler, getQuery, sendRedirect, createError } from 'h3'
import { validateState, exchangeCodeForTokens } from '../../../utils/platform-auth'
import { getPlatformAccountInfo } from '../../../utils/platform-api'
import { getCrypto } from '../../../utils/crypto'
import { SocialPlatform, AccountStatus } from '../../../../types'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // Get platform from route parameter
    const platform = event.context.params.platform
    
    // Get query parameters
    const query = getQuery(event)
    const { code, state, error } = query
    
    // Handle OAuth errors
    if (error) {
      return sendRedirect(event, `/social/accounts?error=${encodeURIComponent(error.toString())}`)
    }
    
    // Validate required parameters
    if (!code || !state) {
      return sendRedirect(event, '/social/accounts?error=Missing required parameters')
    }
    
    // Validate state parameter
    const stateData = validateState(state.toString())
    if (!stateData) {
      return sendRedirect(event, '/social/accounts?error=Invalid or expired state parameter')
    }
    
    const { platform: platformFromState, workspace_id, codeVerifier } = stateData
    
    // Validate platform
    if (platformFromState !== platform) {
      return sendRedirect(event, '/social/accounts?error=Platform mismatch')
    }
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(
      platformFromState as SocialPlatform,
      code.toString(),
      codeVerifier
    )
    
    // Get user info from the platform
    const accountInfo = await getPlatformAccountInfo(
      platformFromState as SocialPlatform,
      tokens.accessToken
    )
    
    // Store tokens and account info in database
    const client = serverSupabaseClient(event)
    const crypto = getCrypto()
    
    // Check if account already exists for this workspace
    const { data: existingAccounts } = await client
      .from('social_accounts')
      .select('id')
      .eq('workspace_id', workspace_id)
      .eq('platform', platformFromState)
      .eq('platformAccountId', accountInfo.id)
    
    if (existingAccounts && existingAccounts.length > 0) {
      // Update existing account
      await client
        .from('social_accounts')
        .update({
          name: accountInfo.name,
          handle: accountInfo.handle,
          profileUrl: accountInfo.profileUrl,
          imageUrl: accountInfo.imageUrl,
          authData: {
            accessToken: crypto.encrypt(tokens.accessToken),
            refreshToken: crypto.encrypt(tokens.refreshToken),
            expiry: new Date(tokens.expiry).toISOString(),
            scope: tokens.scope
          },
          status: AccountStatus.ACTIVE,
          lastSyncTime: new Date().toISOString(),
          metrics: {
            followers: accountInfo.followers || 0,
            engagement: 0,
            posts: 0
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAccounts[0].id)
      
      return sendRedirect(event, '/social/accounts?success=Account connected successfully')
    } else {
      // Create new account
      await client
        .from('social_accounts')
        .insert({
          platform: platformFromState,
          platformAccountId: accountInfo.id,
          name: accountInfo.name,
          handle: accountInfo.handle,
          profileUrl: accountInfo.profileUrl,
          imageUrl: accountInfo.imageUrl,
          workspace_id,
          authData: {
            accessToken: crypto.encrypt(tokens.accessToken),
            refreshToken: crypto.encrypt(tokens.refreshToken),
            expiry: new Date(tokens.expiry).toISOString(),
            scope: tokens.scope
          },
          status: AccountStatus.ACTIVE,
          lastSyncTime: new Date().toISOString(),
          metrics: {
            followers: accountInfo.followers || 0,
            engagement: 0,
            posts: 0
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      return sendRedirect(event, '/social/accounts?success=Account connected successfully')
    }
  } catch (error) {
    console.error('Error in OAuth callback:', error)
    return sendRedirect(event, `/social/accounts?error=${encodeURIComponent(error.message || 'Unknown error')}`)
  }
})