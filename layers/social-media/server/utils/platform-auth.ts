import { SocialPlatform } from '../../types'
import { createHash } from 'crypto'
import { getCrypto } from './crypto'

// Platform credentials - in production, these would be stored in environment variables
const platformConfig = {
  [SocialPlatform.TWITTER]: {
    clientId: process.env.TWITTER_CLIENT_ID || 'twitter-client-id',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || 'twitter-client-secret',
    redirectUri: process.env.TWITTER_REDIRECT_URI || 'http://localhost:3000/api/social/callback/twitter',
    scope: 'tweet.read tweet.write users.read offline.access'
  },
  [SocialPlatform.INSTAGRAM]: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || 'instagram-client-id',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || 'instagram-client-secret',
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:3000/api/social/callback/instagram',
    scope: 'user_profile,user_media'
  },
  [SocialPlatform.FACEBOOK]: {
    clientId: process.env.FACEBOOK_CLIENT_ID || 'facebook-client-id',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'facebook-client-secret',
    redirectUri: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/api/social/callback/facebook',
    scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_metadata'
  },
  [SocialPlatform.LINKEDIN]: {
    clientId: process.env.LINKEDIN_CLIENT_ID || 'linkedin-client-id',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'linkedin-client-secret',
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/social/callback/linkedin',
    scope: 'r_liteprofile r_emailaddress w_member_social'
  },
  [SocialPlatform.TIKTOK]: {
    clientId: process.env.TIKTOK_CLIENT_ID || 'tiktok-client-id',
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || 'tiktok-client-secret',
    redirectUri: process.env.TIKTOK_REDIRECT_URI || 'http://localhost:3000/api/social/callback/tiktok',
    scope: 'user.info.basic,video.list,video.upload'
  },
  [SocialPlatform.YOUTUBE]: {
    clientId: process.env.YOUTUBE_CLIENT_ID || 'youtube-client-id',
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || 'youtube-client-secret',
    redirectUri: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/social/callback/youtube',
    scope: 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload'
  },
  [SocialPlatform.PINTEREST]: {
    clientId: process.env.PINTEREST_CLIENT_ID || 'pinterest-client-id',
    clientSecret: process.env.PINTEREST_CLIENT_SECRET || 'pinterest-client-secret',
    redirectUri: process.env.PINTEREST_REDIRECT_URI || 'http://localhost:3000/api/social/callback/pinterest',
    scope: 'boards:read,pins:read,pins:write'
  }
}

// Generate a state param for OAuth security
const generateStateParam = (platform: SocialPlatform, workspaceId: string): string => {
  const data = `${platform}-${workspaceId}-${Date.now()}`
  return createHash('sha256').update(data).digest('hex')
}

// Store state in a temporary cache (in production, use Redis or similar)
const stateCache: Record<string, { platform: SocialPlatform, workspace_id: string, timestamp: number }> = {}

// Get OAuth URL for a specific platform
export const getOAuthURL = async (platform: SocialPlatform, workspaceId: string): Promise<string> => {
  const config = platformConfig[platform]
  if (!config) {
    throw new Error(`Platform ${platform} is not supported`)
  }

  // Generate and store state
  const state = generateStateParam(platform, workspaceId)
  stateCache[state] = {
    platform,
    workspace_id: workspaceId,
    timestamp: Date.now()
  }

  // For PKCE platforms (Twitter), generate code verifier and challenge
  let codeVerifier: string | undefined
  let codeChallenge: string | undefined

  if (platform === SocialPlatform.TWITTER) {
    const crypto = getCrypto()
    codeVerifier = crypto.generateCodeVerifier()
    codeChallenge = await crypto.generateCodeChallenge(codeVerifier)
    
    // Store code verifier in cache
    stateCache[state].codeVerifier = codeVerifier
  }

  // Generate OAuth URL based on platform
  switch (platform) {
    case SocialPlatform.TWITTER:
      return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${encodeURIComponent(config.scope)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`
    
    case SocialPlatform.FACEBOOK:
    case SocialPlatform.INSTAGRAM:
      return `https://www.facebook.com/v17.0/dialog/oauth?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${encodeURIComponent(config.scope)}&state=${state}&response_type=code`
    
    case SocialPlatform.LINKEDIN:
      return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${encodeURIComponent(config.scope)}&state=${state}`
    
    case SocialPlatform.TIKTOK:
      return `https://www.tiktok.com/v2/auth/authorize?client_key=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${encodeURIComponent(config.scope)}&state=${state}&response_type=code`
    
    case SocialPlatform.YOUTUBE:
      return `https://accounts.google.com/o/oauth2/auth?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${encodeURIComponent(config.scope)}&state=${state}&response_type=code&access_type=offline&prompt=consent`
    
    case SocialPlatform.PINTEREST:
      return `https://www.pinterest.com/oauth/?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${encodeURIComponent(config.scope)}&state=${state}&response_type=code`
    
    default:
      throw new Error(`Platform ${platform} is not supported`)
  }
}

// Validate state parameter from callback
export const validateState = (state: string): { platform: SocialPlatform, workspace_id: string, codeVerifier?: string } | null => {
  const storedState = stateCache[state]
  
  if (!storedState) {
    return null
  }
  
  // Check if state is expired (15 minutes)
  const now = Date.now()
  if (now - storedState.timestamp > 15 * 60 * 1000) {
    delete stateCache[state]
    return null
  }
  
  // Clean up state from cache
  delete stateCache[state]
  
  return {
    platform: storedState.platform,
    workspace_id: storedState.workspace_id,
    codeVerifier: storedState.codeVerifier
  }
}

// Exchange OAuth code for tokens
export const exchangeCodeForTokens = async (
  platform: SocialPlatform,
  code: string,
  codeVerifier?: string
): Promise<{
  accessToken: string,
  refreshToken: string,
  expiry: number,
  scope: string[]
}> => {
  const config = platformConfig[platform]
  if (!config) {
    throw new Error(`Platform ${platform} is not supported`)
  }

  let tokenResponse
  
  switch (platform) {
    case SocialPlatform.TWITTER:
      tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: config.clientId,
          redirect_uri: config.redirectUri,
          code_verifier: codeVerifier!
        })
      })
      break
    
    case SocialPlatform.FACEBOOK:
    case SocialPlatform.INSTAGRAM:
      tokenResponse = await fetch('https://graph.facebook.com/v17.0/oauth/access_token', {
        method: 'POST',
        body: new URLSearchParams({
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
          grant_type: 'authorization_code'
        })
      })
      break
    
    case SocialPlatform.LINKEDIN:
      tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
          grant_type: 'authorization_code'
        })
      })
      break
    
    case SocialPlatform.TIKTOK:
      tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
        method: 'POST',
        body: new URLSearchParams({
          code,
          client_key: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
          grant_type: 'authorization_code'
        })
      })
      break
    
    case SocialPlatform.YOUTUBE:
      tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
          grant_type: 'authorization_code'
        })
      })
      break
    
    case SocialPlatform.PINTEREST:
      tokenResponse = await fetch('https://api.pinterest.com/v5/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          code,
          redirect_uri: config.redirectUri,
          grant_type: 'authorization_code'
        })
      })
      break
    
    default:
      throw new Error(`Platform ${platform} is not supported`)
  }

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    console.error(`Error exchanging code for ${platform}:`, errorText)
    throw new Error(`Failed to exchange code: ${tokenResponse.status} ${tokenResponse.statusText}`)
  }

  const tokenData = await tokenResponse.json()
  
  // Format response consistently across platforms
  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token || '',
    expiry: tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : Date.now() + 3600 * 1000,
    scope: tokenData.scope ? tokenData.scope.split(' ') : config.scope.split(' ')
  }
}