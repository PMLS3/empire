import type { Timestamp } from 'firebase/firestore'

export enum SocialPlatform {
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
  PINTEREST = 'pinterest'
}

export enum AccountStatus {
  ACTIVE = 'active',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  RATE_LIMITED = 'rate_limited'
}

export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  LINK = 'link',
  CAROUSEL = 'carousel',
  STORY = 'story',
  REEL = 'reel'
}

export enum ContentStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed',
  ARCHIVED = 'archived'
}

export enum PublishStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
  FAILED = 'failed'
}

export interface SocialAccount {
  id: string
  platform: SocialPlatform
  platformAccountId: string
  name: string
  handle: string
  profileUrl: string
  imageUrl: string
  workspace_id: string
  authData: {
    accessToken: string
    refreshToken: string
    expiry: Timestamp
    scope: string[]
  }
  status: AccountStatus
  lastSyncTime: Timestamp
  metrics: {
    followers: number
    engagement: number
    posts: number
  }
  created_at: Timestamp
  updated_at: Timestamp
}

export interface MediaItem {
  id: string
  type: 'image' | 'video' | 'gif'
  url: string
  thumbnailUrl?: string
  altText?: string
  dimensions?: {
    width: number
    height: number
  }
  duration?: number
  size: number
}

export interface PlatformContent {
  accountId: string
  text: string
  hashtags: string[]
  mediaItems: MediaItem[]
  settings: any
  publishStatus: PublishStatus
  publishTime?: Timestamp
  publishedUrl?: string
  platformPostId?: string
  platformSpecificMetrics?: any
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly'
  interval: number
  endDate?: Timestamp
  daysOfWeek?: number[]
}

export interface SocialContent {
  id: string
  workspace_id: string
  creator_id: string
  title: string
  contentType: ContentType
  status: ContentStatus
  tags: string[]
  assets: {
    images: string[]
    videos: string[]
    links: string[]
  }
  platforms: {
    [platform in SocialPlatform]?: PlatformContent
  }
  schedule: {
    publishDate: Timestamp
    recurrence?: RecurrencePattern
    timezone: string
  }
  analytics: {
    impressions: number
    engagements: number
    clicks: number
    shares: number
  }
  metadata: {
    sourceTemplate?: string
    aiGenerated: boolean
    campaignId?: string
  }
  created_at: Timestamp
  updated_at: Timestamp
}

export interface ContentAnalytics {
  contentId: string
  platformId: string
  accountId: string
  metrics: {
    impressions: number
    likes: number
    comments: number
    shares: number
    saves: number
    clicks: number
    videoViews?: number
    videoCompletions?: number
    [key: string]: any
  }
  demographics?: {
    ageRanges: Record<string, number>
    genders: Record<string, number>
    locations: Record<string, number>
  }
  timeSeries: {
    timestamp: Timestamp
    metrics: Record<string, number>
  }[]
  updated_at: Timestamp
}

export interface AccountAnalytics {
  accountId: string
  date: string
  metrics: {
    followers: number
    following: number
    posts: number
    totalEngagement: number
    engagementRate: number
    profileViews: number
    websiteClicks?: number
    [key: string]: any
  }
  followerGrowth: {
    netGrowth: number
    gained: number
    lost: number
  }
  demographicSnapshot?: {
    ageRanges: Record<string, number>
    genders: Record<string, number>
    locations: Record<string, number>
    interests?: Record<string, number>
  }
  updated_at: Timestamp
}

export interface LibraryAsset {
  id: string
  workspace_id: string
  name: string
  type: 'image' | 'video' | 'text' | 'template'
  tags: string[]
  url?: string
  thumbnailUrl?: string
  content?: string
  metadata: {
    dimensions?: {
      width: number
      height: number
    }
    duration?: number
    size: number
    format: string
    createdWith?: string
  }
  usage: {
    usedInContent: string[]
    lastUsed?: Timestamp
    usageCount: number
  }
  created_by: string
  created_at: Timestamp
  updated_at: Timestamp
}