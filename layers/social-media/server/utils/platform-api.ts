import { SocialPlatform } from '../../types'

// Interface for platform account information
interface PlatformAccountInfo {
  id: string
  name: string
  handle: string
  profileUrl: string
  imageUrl: string
  followers?: number
  description?: string
}

// Interface for publishing response
interface PublishResponse {
  success: boolean
  id?: string
  url?: string
  error?: string
}

// Get platform account information
export const getPlatformAccountInfo = async (
  platform: SocialPlatform,
  accessToken: string
): Promise<PlatformAccountInfo> => {
  switch (platform) {
    case SocialPlatform.TWITTER:
      return getTwitterAccountInfo(accessToken)
    case SocialPlatform.FACEBOOK:
      return getFacebookAccountInfo(accessToken)
    case SocialPlatform.INSTAGRAM:
      return getInstagramAccountInfo(accessToken)
    case SocialPlatform.LINKEDIN:
      return getLinkedInAccountInfo(accessToken)
    case SocialPlatform.TIKTOK:
      return getTikTokAccountInfo(accessToken)
    case SocialPlatform.YOUTUBE:
      return getYouTubeAccountInfo(accessToken)
    case SocialPlatform.PINTEREST:
      return getPinterestAccountInfo(accessToken)
    default:
      throw new Error(`Platform ${platform} is not supported`)
  }
}

// Platform-specific implementations
const getTwitterAccountInfo = async (accessToken: string): Promise<PlatformAccountInfo> => {
  const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics,description', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const user = data.data

  return {
    id: user.id,
    name: user.name,
    handle: user.username,
    profileUrl: `https://twitter.com/${user.username}`,
    imageUrl: user.profile_image_url || '',
    followers: user.public_metrics?.followers_count || 0,
    description: user.description
  }
}

const getFacebookAccountInfo = async (accessToken: string): Promise<PlatformAccountInfo> => {
  // First get user's pages
  const response = await fetch('https://graph.facebook.com/v17.0/me/accounts', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`Facebook API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  
  // Use the first page for now (in real app, would allow user to choose)
  const page = data.data[0]
  
  if (!page) {
    // Fallback to user profile if no pages
    const userResponse = await fetch('https://graph.facebook.com/v17.0/me?fields=id,name,picture,link', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!userResponse.ok) {
      throw new Error(`Facebook API error: ${userResponse.status} ${userResponse.statusText}`)
    }
    
    const userData = await userResponse.json()
    
    return {
      id: userData.id,
      name: userData.name,
      handle: userData.name,
      profileUrl: userData.link || `https://facebook.com/${userData.id}`,
      imageUrl: userData.picture?.data?.url || '',
      followers: 0
    }
  }
  
  // Get page details including followers
  const pageResponse = await fetch(`https://graph.facebook.com/v17.0/${page.id}?fields=name,username,link,picture,fan_count`, {
    headers: {
      'Authorization': `Bearer ${page.access_token}`
    }
  })
  
  if (!pageResponse.ok) {
    throw new Error(`Facebook API error: ${pageResponse.status} ${pageResponse.statusText}`)
  }
  
  const pageData = await pageResponse.json()
  
  return {
    id: pageData.id,
    name: pageData.name,
    handle: pageData.username || pageData.name,
    profileUrl: pageData.link || `https://facebook.com/${pageData.id}`,
    imageUrl: pageData.picture?.data?.url || '',
    followers: pageData.fan_count || 0
  }
}

const getInstagramAccountInfo = async (accessToken: string): Promise<PlatformAccountInfo> => {
  // First get Instagram business account ID
  const response = await fetch('https://graph.facebook.com/v17.0/me/accounts', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`Instagram API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  
  // Use the first page for now (in real app, would allow user to choose)
  const page = data.data[0]
  
  if (!page) {
    throw new Error('No Instagram business account found')
  }
  
  // Get Instagram business account
  const igResponse = await fetch(`https://graph.facebook.com/v17.0/${page.id}?fields=instagram_business_account{id,name,username,profile_picture_url,followed_by_count}`, {
    headers: {
      'Authorization': `Bearer ${page.access_token}`
    }
  })
  
  if (!igResponse.ok) {
    throw new Error(`Instagram API error: ${igResponse.status} ${igResponse.statusText}`)
  }
  
  const igData = await igResponse.json()
  const igAccount = igData.instagram_business_account
  
  if (!igAccount) {
    throw new Error('No Instagram business account connected to this Facebook page')
  }
  
  return {
    id: igAccount.id,
    name: igAccount.name || igAccount.username,
    handle: igAccount.username,
    profileUrl: `https://instagram.com/${igAccount.username}`,
    imageUrl: igAccount.profile_picture_url || '',
    followers: igAccount.followed_by_count || 0
  }
}

const getLinkedInAccountInfo = async (accessToken: string): Promise<PlatformAccountInfo> => {
  // Get user profile
  const response = await fetch('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`)
  }

  const userData = await response.json()
  
  // Get email address
  const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  
  let email = ''
  if (emailResponse.ok) {
    const emailData = await emailResponse.json()
    email = emailData.elements?.[0]?.['handle~']?.emailAddress || ''
  }
  
  // Format profile image URL
  let imageUrl = ''
  try {
    imageUrl = userData.profilePicture?.['displayImage~']?.elements[0]?.identifiers[0]?.identifier || ''
  } catch (e) {
    // Image not available
  }
  
  return {
    id: userData.id,
    name: `${userData.localizedFirstName} ${userData.localizedLastName}`,
    handle: email,
    profileUrl: `https://www.linkedin.com/in/${userData.id}`,
    imageUrl
  }
}

const getTikTokAccountInfo = async (accessToken: string): Promise<PlatformAccountInfo> => {
  const response = await fetch('https://open-api.tiktok.com/user/info/', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`TikTok API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const user = data.data.user
  
  return {
    id: user.open_id,
    name: user.display_name,
    handle: user.username || user.display_name,
    profileUrl: `https://tiktok.com/@${user.username}`,
    imageUrl: user.avatar_url || '',
    followers: user.follower_count || 0
  }
}

const getYouTubeAccountInfo = async (accessToken: string): Promise<PlatformAccountInfo> => {
  const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const channel = data.items[0]
  
  return {
    id: channel.id,
    name: channel.snippet.title,
    handle: channel.snippet.customUrl?.replace(/^@/, '') || channel.snippet.title,
    profileUrl: `https://youtube.com/channel/${channel.id}`,
    imageUrl: channel.snippet.thumbnails?.default?.url || '',
    followers: parseInt(channel.statistics.subscriberCount, 10) || 0,
    description: channel.snippet.description
  }
}

const getPinterestAccountInfo = async (accessToken: string): Promise<PlatformAccountInfo> => {
  const response = await fetch('https://api.pinterest.com/v5/user_account', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`Pinterest API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  
  return {
    id: data.username,
    name: data.full_name || data.username,
    handle: data.username,
    profileUrl: `https://pinterest.com/${data.username}`,
    imageUrl: data.profile_image || '',
    followers: data.follower_count || 0
  }
}

// Publishing content to platforms
export const publishToPlatform = async (
  platform: SocialPlatform,
  account: any,
  content: any,
  assets: any
): Promise<PublishResponse> => {
  try {
    // Decrypt access token
    const accessToken = account.authData.accessToken // In real impl, would decrypt this
    
    switch (platform) {
      case SocialPlatform.TWITTER:
        return publishToTwitter(accessToken, content, assets)
      case SocialPlatform.FACEBOOK:
        return publishToFacebook(accessToken, account.platformAccountId, content, assets)
      case SocialPlatform.INSTAGRAM:
        return publishToInstagram(accessToken, account.platformAccountId, content, assets)
      case SocialPlatform.LINKEDIN:
        return publishToLinkedIn(accessToken, account.platformAccountId, content, assets)
      case SocialPlatform.TIKTOK:
        return publishToTikTok(accessToken, content, assets)
      case SocialPlatform.YOUTUBE:
        return publishToYouTube(accessToken, content, assets)
      case SocialPlatform.PINTEREST:
        return publishToPinterest(accessToken, content, assets)
      default:
        throw new Error(`Platform ${platform} is not supported for publishing`)
    }
  } catch (error) {
    console.error(`Error publishing to ${platform}:`, error)
    return {
      success: false,
      error: error.message || `Failed to publish to ${platform}`
    }
  }
}

// Implement platform-specific publishing functions
// These are simplified examples; real implementations would handle media upload, formatting, etc.

const publishToTwitter = async (accessToken: string, content: any, assets: any): Promise<PublishResponse> => {
  // Simplified implementation for demo purposes
  return {
    success: true,
    id: 'twitter-post-id',
    url: 'https://twitter.com/user/status/123456789'
  }
}

const publishToFacebook = async (accessToken: string, pageId: string, content: any, assets: any): Promise<PublishResponse> => {
  // Simplified implementation for demo purposes
  return {
    success: true,
    id: 'facebook-post-id',
    url: 'https://facebook.com/post/123456789'
  }
}

const publishToInstagram = async (accessToken: string, accountId: string, content: any, assets: any): Promise<PublishResponse> => {
  // Simplified implementation for demo purposes
  return {
    success: true,
    id: 'instagram-post-id',
    url: 'https://instagram.com/p/123456789'
  }
}

const publishToLinkedIn = async (accessToken: string, accountId: string, content: any, assets: any): Promise<PublishResponse> => {
  // Simplified implementation for demo purposes
  return {
    success: true,
    id: 'linkedin-post-id',
    url: 'https://linkedin.com/feed/update/123456789'
  }
}

const publishToTikTok = async (accessToken: string, content: any, assets: any): Promise<PublishResponse> => {
  // Simplified implementation for demo purposes
  return {
    success: true,
    id: 'tiktok-post-id',
    url: 'https://tiktok.com/@user/video/123456789'
  }
}

const publishToYouTube = async (accessToken: string, content: any, assets: any): Promise<PublishResponse> => {
  // Simplified implementation for demo purposes
  return {
    success: true,
    id: 'youtube-post-id',
    url: 'https://youtube.com/watch?v=123456789'
  }
}

const publishToPinterest = async (accessToken: string, content: any, assets: any): Promise<PublishResponse> => {
  // Simplified implementation for demo purposes
  return {
    success: true,
    id: 'pinterest-pin-id',
    url: 'https://pinterest.com/pin/123456789'
  }
}