# Design Requirements Document (DRD) - Social Media Layer

## Overview
This document outlines the technical architecture, implementation details, and design considerations for the Social Media Layer. It serves as a guide for developers implementing the system.

## Architecture Design

### System Components

#### 1. Frontend Components (Vue.js/Nuxt.js)
- **SocialDashboard**: Main dashboard component displaying overview of all accounts and recent activities
- **ContentCreator**: Interactive editor for creating and editing cross-platform content
- **ContentCalendar**: Visual calendar for content scheduling and management
- **AnalyticsViewer**: Displays unified analytics from multiple platforms
- **AccountManager**: Interface for managing social account connections
- **NotificationCenter**: Component for displaying system notifications and alerts

#### 2. Backend Services (Firebase/Node.js)
- **AuthService**: Handles user authentication and permission management
- **PlatformIntegrationService**: Manages connections to social platforms
- **ContentService**: Processes and stores content objects
- **SchedulingService**: Manages content scheduling and publishing queue
- **AnalyticsService**: Collects and processes analytics data
- **NotificationService**: Manages user notifications and alerts

#### 3. External Integrations
- **AI Layer API**: For content generation and optimization
- **Auth Layer API**: For user authentication and authorization
- **Creator Layer API**: For importing assets and content
- **Platform-specific APIs**: For publishing and retrieving data

### Data Model

#### Users Collection
```typescript
interface SocialUser {
  id: string;            // User ID (from Auth Layer)
  email: string;         // User email
  name: string;          // User display name
  role: UserRole;        // User role in the system
  teams: string[];       // Teams the user belongs to
  preferences: {         // User preferences
    defaultPlatforms: string[];
    timezone: string;
    notificationSettings: NotificationSettings;
  };
  quotaUsage: {          // Usage metrics
    aiContentGeneration: number;
    scheduledPosts: number;
    connectedAccounts: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CREATOR = 'creator',
  VIEWER = 'viewer'
}
```

#### Teams Collection
```typescript
interface Team {
  id: string;            // Team ID
  name: string;          // Team name
  owner: string;         // User ID of team owner
  members: TeamMember[]; // Team members
  platforms: {           // Platforms enabled for team
    [platform: string]: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface TeamMember {
  userId: string;
  role: UserRole;
  accounts: string[];    // Account IDs this member can access
}
```

#### Accounts Collection
```typescript
interface SocialAccount {
  id: string;            // Account ID
  platform: SocialPlatform;
  platformAccountId: string; // ID from the platform
  name: string;          // Display name
  handle: string;        // Username/handle on platform
  profileUrl: string;    // URL to profile
  imageUrl: string;      // Profile image
  teamId: string;        // Team that owns this account
  authData: {            // Encrypted OAuth data
    accessToken: string;
    refreshToken: string;
    expiry: Timestamp;
    scope: string[];
  };
  status: AccountStatus;
  lastSyncTime: Timestamp;
  metrics: {             // High-level metrics
    followers: number;
    engagement: number;
    posts: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

enum SocialPlatform {
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
  PINTEREST = 'pinterest'
}

enum AccountStatus {
  ACTIVE = 'active',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  RATE_LIMITED = 'rate_limited'
}
```

#### Content Collection
```typescript
interface SocialContent {
  id: string;            // Content ID
  teamId: string;        // Team ID
  creatorId: string;     // User ID who created this content
  title: string;         // Internal title for reference
  contentType: ContentType;
  status: ContentStatus;
  tags: string[];        // Internal tags for categorization
  assets: {              // References to media assets
    images: string[];
    videos: string[];
    links: string[];
  };
  platforms: {           // Platform-specific content versions
    [platform in SocialPlatform]?: PlatformContent;
  };
  schedule: {
    publishDate: Timestamp;
    recurrence?: RecurrencePattern;
    timezone: string;
  };
  analytics: {           // Aggregated analytics across platforms
    impressions: number;
    engagements: number;
    clicks: number;
    shares: number;
  };
  metadata: {            // System metadata
    sourceTemplate?: string;
    aiGenerated: boolean;
    campaignId?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface PlatformContent {
  accountId: string;     // Account to publish with
  text: string;          // Platform-specific text
  hashtags: string[];    // Platform-specific hashtags
  mediaItems: MediaItem[]; // Platform-specific media
  settings: any;         // Platform-specific settings
  publishStatus: PublishStatus;
  publishTime?: Timestamp;
  publishedUrl?: string;
  platformPostId?: string;
  platformSpecificMetrics?: any;
}

enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  LINK = 'link',
  CAROUSEL = 'carousel',
  STORY = 'story',
  REEL = 'reel'
}

enum ContentStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed',
  ARCHIVED = 'archived'
}

enum PublishStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
  FAILED = 'failed'
}

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;     // For videos
  size: number;          // In bytes
}

interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  endDate?: Timestamp;
  daysOfWeek?: number[];
}
```

#### Analytics Collection
```typescript
interface ContentAnalytics {
  contentId: string;     // Reference to content
  platformId: string;    // Platform identifier
  accountId: string;     // Account identifier
  metrics: {
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
    videoViews?: number;
    videoCompletions?: number;
    // Platform-specific metrics
    [key: string]: any;
  };
  demographics?: {
    ageRanges: Record<string, number>;
    genders: Record<string, number>;
    locations: Record<string, number>;
  };
  timeSeries: {
    timestamp: Timestamp;
    metrics: Record<string, number>;
  }[];
  updatedAt: Timestamp;
}

interface AccountAnalytics {
  accountId: string;     // Reference to social account
  date: string;          // YYYY-MM-DD format
  metrics: {
    followers: number;
    following: number;
    posts: number;
    totalEngagement: number;
    engagementRate: number;
    profileViews: number;
    websiteClicks?: number;
    // Platform-specific metrics
    [key: string]: any;
  };
  followerGrowth: {
    netGrowth: number;
    gained: number;
    lost: number;
  };
  demographicSnapshot?: {
    ageRanges: Record<string, number>;
    genders: Record<string, number>;
    locations: Record<string, number>;
    interests?: Record<string, number>;
  };
  updatedAt: Timestamp;
}
```

#### Library Collection
```typescript
interface LibraryAsset {
  id: string;
  teamId: string;
  name: string;
  type: 'image' | 'video' | 'text' | 'template';
  tags: string[];
  url?: string;
  thumbnailUrl?: string;
  content?: string;      // For text assets
  metadata: {
    dimensions?: {
      width: number;
      height: number;
    };
    duration?: number;   // For videos
    size: number;        // In bytes
    format: string;
    createdWith?: string; // E.g., "AI Generator"
  };
  usage: {
    usedInContent: string[]; // Content IDs where used
    lastUsed?: Timestamp;
    usageCount: number;
  };
  createdBy: string;     // User ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## API Design

### 1. Authentication & User Management API

#### GET /api/social/user
- Get current user's social media profile
- Requires authentication token
- Returns SocialUser object

#### GET /api/social/user/teams
- Get teams for current user
- Requires authentication token
- Returns array of Team objects

#### POST /api/social/teams
- Create a new team
- Requires authentication token
- Body: { name: string }
- Returns created Team object

#### PUT /api/social/teams/:teamId/members
- Add/update team members
- Requires authentication token with admin role
- Body: { userId: string, role: UserRole }
- Returns updated Team object

### 2. Account Management API

#### GET /api/social/accounts
- Get all accounts for user's teams
- Requires authentication token
- Query params: teamId (optional)
- Returns array of SocialAccount objects

#### POST /api/social/accounts/connect/:platform
- Initiate OAuth flow for platform connection
- Requires authentication token
- Body: { teamId: string }
- Returns URL for OAuth redirect

#### GET /api/social/accounts/callback
- OAuth callback handler
- Query params: code, state
- Finalizes account connection
- Redirects to account management page

#### DELETE /api/social/accounts/:accountId
- Disconnect/remove account
- Requires authentication token with admin/manager role
- Returns success message

### 3. Content Management API

#### GET /api/social/content
- Get content items
- Requires authentication token
- Query params: teamId, status, pageSize, lastId
- Returns array of SocialContent objects

#### POST /api/social/content
- Create new content item
- Requires authentication token
- Body: SocialContent object (partial)
- Returns created SocialContent object

#### GET /api/social/content/:contentId
- Get specific content item details
- Requires authentication token
- Returns SocialContent object

#### PUT /api/social/content/:contentId
- Update content item
- Requires authentication token
- Body: SocialContent object (partial)
- Returns updated SocialContent object

#### DELETE /api/social/content/:contentId
- Delete/archive content item
- Requires authentication token
- Returns success message

#### POST /api/social/content/:contentId/publish
- Publish content immediately
- Requires authentication token
- Body: { platformIds: string[] }
- Returns updated SocialContent object

### 4. AI Content Generation API

#### POST /api/social/ai/generate
- Generate content using AI
- Requires authentication token
- Body: { prompt: string, platforms: string[], contentType: ContentType }
- Returns generated content for each platform

#### POST /api/social/ai/optimize
- Optimize existing content
- Requires authentication token
- Body: { contentId: string, optimization: 'hashtags'|'text'|'image' }
- Returns optimization suggestions

### 5. Content Calendar API

#### GET /api/social/calendar
- Get scheduled content for calendar view
- Requires authentication token
- Query params: teamId, startDate, endDate
- Returns array of scheduled content items

#### PUT /api/social/calendar/reschedule
- Reschedule content item
- Requires authentication token
- Body: { contentId: string, newDate: ISOString, timezone: string }
- Returns updated content item

### 6. Analytics API

#### GET /api/social/analytics/content/:contentId
- Get analytics for specific content
- Requires authentication token
- Returns ContentAnalytics object

#### GET /api/social/analytics/account/:accountId
- Get analytics for specific account
- Requires authentication token
- Query params: startDate, endDate
- Returns array of AccountAnalytics objects

#### GET /api/social/analytics/team/:teamId/overview
- Get team-level analytics overview
- Requires authentication token
- Query params: period ('day'|'week'|'month'|'year')
- Returns aggregated analytics

### 7. Library API

#### GET /api/social/library
- Get library assets
- Requires authentication token
- Query params: teamId, type, tags
- Returns array of LibraryAsset objects

#### POST /api/social/library
- Upload/create new library asset
- Requires authentication token
- Multipart form or JSON depending on asset type
- Returns created LibraryAsset object

#### GET /api/social/library/:assetId
- Get specific library asset
- Requires authentication token
- Returns LibraryAsset object

#### DELETE /api/social/library/:assetId
- Delete library asset
- Requires authentication token
- Returns success message

## Component Design

### Key Frontend Components

#### SocialDashboard Component
```vue
<template>
  <div class="social-dashboard">
    <AccountsOverview :accounts="accounts" />
    <UpcomingContent :scheduled="scheduledContent" />
    <PerformanceSnapshot :analytics="analytics" />
    <QuickActions @action="handleQuickAction" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchAccounts, fetchScheduledContent, fetchAnalytics } from '@/composables/useSocialData'

// Component implementation
</script>
```

#### ContentCreator Component
```vue
<template>
  <div class="content-creator">
    <ContentForm
      v-model="content"
      :platforms="selectedPlatforms"
      @generate="generateContent"
    />
    <PlatformPreviews 
      :content="content" 
      :platforms="selectedPlatforms" 
    />
    <ContentActions 
      :content="content"
      @save="saveContent"
      @schedule="scheduleContent"
      @publish="publishContent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSocialContent } from '@/composables/useSocialContent'
import { useAIGeneration } from '@/composables/useAIGeneration'

// Component implementation
</script>
```

#### ContentCalendar Component
```vue
<template>
  <div class="content-calendar">
    <CalendarControls 
      v-model:view="calendarView"
      v-model:date="currentDate"
      :accounts="filteredAccounts"
      @filter="updateFilters"
    />
    <CalendarGrid
      :view="calendarView"
      :date="currentDate"
      :events="calendarEvents"
      @event-click="showContentDetails"
      @slot-click="createContentForSlot"
      @event-drop="rescheduleContent"
    />
    <ContentDetailSidebar 
      v-if="selectedContent"
      :content="selectedContent"
      @close="selectedContent = null"
      @edit="editContent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSocialCalendar } from '@/composables/useSocialCalendar'

// Component implementation
</script>
```

#### AnalyticsViewer Component
```vue
<template>
  <div class="analytics-viewer">
    <AnalyticsFilters 
      v-model:period="period"
      v-model:platforms="selectedPlatforms"
      v-model:accounts="selectedAccounts"
    />
    <AnalyticsDashboard 
      :data="analyticsData"
      :loading="loading"
    />
    <ContentPerformanceTable
      :content="topPerformingContent"
      @view="viewContentDetails"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSocialAnalytics } from '@/composables/useSocialAnalytics'

// Component implementation
</script>
```

### Composables

#### useSocialAccounts.ts
```typescript
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/auth'

export function useSocialAccounts() {
  const { user } = useAuth()
  const accounts = ref<SocialAccount[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchAccounts = async (teamId?: string) => {
    loading.value = true
    try {
      const response = await fetch(`/api/social/accounts${teamId ? `?teamId=${teamId}` : ''}`)
      accounts.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    } finally {
      loading.value = false
    }
  }

  const connectAccount = async (platform: SocialPlatform, teamId: string) => {
    try {
      const response = await fetch(`/api/social/accounts/connect/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ teamId })
      })
      const data = await response.json()
      // Redirect to OAuth URL
      window.location.href = data.url
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    }
  }

  const disconnectAccount = async (accountId: string) => {
    try {
      await fetch(`/api/social/accounts/${accountId}`, {
        method: 'DELETE'
      })
      // Remove from local state
      accounts.value = accounts.value.filter(account => account.id !== accountId)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    }
  }

  const accountsByPlatform = computed(() => {
    const grouped: Record<SocialPlatform, SocialAccount[]> = {} as any
    accounts.value.forEach(account => {
      if (!grouped[account.platform]) {
        grouped[account.platform] = []
      }
      grouped[account.platform].push(account)
    })
    return grouped
  })

  return {
    accounts,
    accountsByPlatform,
    loading,
    error,
    fetchAccounts,
    connectAccount,
    disconnectAccount
  }
}
```

#### useSocialContent.ts
```typescript
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/auth'

export function useSocialContent() {
  const { user } = useAuth()
  const content = ref<SocialContent | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const createContent = async (initialData: Partial<SocialContent>) => {
    loading.value = true
    try {
      const response = await fetch('/api/social/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(initialData)
      })
      content.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    } finally {
      loading.value = false
    }
  }

  const fetchContent = async (contentId: string) => {
    loading.value = true
    try {
      const response = await fetch(`/api/social/content/${contentId}`)
      content.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    } finally {
      loading.value = false
    }
  }

  const updateContent = async (contentId: string, updates: Partial<SocialContent>) => {
    loading.value = true
    try {
      const response = await fetch(`/api/social/content/${contentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      content.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    } finally {
      loading.value = false
    }
  }

  const publishContent = async (contentId: string, platforms: string[]) => {
    loading.value = true
    try {
      const response = await fetch(`/api/social/content/${contentId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platforms })
      })
      content.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    } finally {
      loading.value = false
    }
  }

  const deleteContent = async (contentId: string) => {
    try {
      await fetch(`/api/social/content/${contentId}`, {
        method: 'DELETE'
      })
      content.value = null
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    }
  }

  const isPublishable = computed(() => {
    if (!content.value) return false
    
    // Check if content has at least one platform configured
    const platforms = Object.keys(content.value.platforms || {})
    if (platforms.length === 0) return false
    
    // Check if each platform has required fields
    for (const platform of platforms) {
      const platformContent = content.value.platforms[platform as SocialPlatform]
      if (!platformContent || !platformContent.accountId || !platformContent.text) {
        return false
      }
    }
    
    return true
  })

  return {
    content,
    loading,
    error,
    isPublishable,
    createContent,
    fetchContent,
    updateContent,
    publishContent,
    deleteContent
  }
}
```

#### useAIGeneration.ts
```typescript
import { ref } from 'vue'
import { SocialPlatform, ContentType } from '~/types'

export function useAIGeneration() {
  const generating = ref(false)
  const error = ref<Error | null>(null)

  const generateContent = async (
    prompt: string, 
    platforms: SocialPlatform[], 
    contentType: ContentType
  ) => {
    generating.value = true
    try {
      const response = await fetch('/api/social/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          platforms,
          contentType
        })
      })
      
      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw error.value
    } finally {
      generating.value = false
    }
  }

  const optimizeContent = async (
    contentId: string,
    optimizationType: 'hashtags' | 'text' | 'image'
  ) => {
    generating.value = true
    try {
      const response = await fetch('/api/social/ai/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contentId,
          optimization: optimizationType
        })
      })
      
      if (!response.ok) {
        throw new Error(`Optimization failed: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw error.value
    } finally {
      generating.value = false
    }
  }

  return {
    generating,
    error,
    generateContent,
    optimizeContent
  }
}
```

## Server-Side Implementation

### Firebase Cloud Functions

#### Account Connection Handler
```typescript
export const connectSocialAccount = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { platform, teamId, authCode } = data;
  
  try {
    // Get OAuth tokens using auth code
    const tokens = await getPlatformTokens(platform, authCode);
    
    // Get user info from the platform
    const accountInfo = await getPlatformAccountInfo(platform, tokens.accessToken);
    
    // Store in Firestore
    const accountRef = admin.firestore().collection('social_accounts').doc();
    await accountRef.set({
      id: accountRef.id,
      platform,
      platformAccountId: accountInfo.id,
      name: accountInfo.name,
      handle: accountInfo.handle,
      profileUrl: accountInfo.profileUrl,
      imageUrl: accountInfo.imageUrl,
      teamId,
      authData: {
        accessToken: encrypt(tokens.accessToken),
        refreshToken: encrypt(tokens.refreshToken),
        expiry: admin.firestore.Timestamp.fromDate(new Date(tokens.expiry)),
        scope: tokens.scope
      },
      status: 'active',
      lastSyncTime: admin.firestore.FieldValue.serverTimestamp(),
      metrics: {
        followers: accountInfo.followers || 0,
        engagement: 0,
        posts: 0
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, accountId: accountRef.id };
  } catch (error) {
    console.error('Error connecting account:', error);
    throw new functions.https.HttpsError('internal', 'Failed to connect account');
  }
});
```

#### Content Publishing Handler
```typescript
export const publishSocialContent = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { contentId, platforms } = data;
  
  try {
    // Get content from Firestore
    const contentRef = admin.firestore().collection('social_content').doc(contentId);
    const contentSnap = await contentRef.get();
    
    if (!contentSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Content not found');
    }
    
    const content = contentSnap.data() as SocialContent;
    
    // Check permissions
    const userTeams = await getUserTeams(context.auth.uid);
    if (!userTeams.includes(content.teamId)) {
      throw new functions.https.HttpsError('permission-denied', 'User does not have access to this content');
    }
    
    // Publish to each platform
    const results = await Promise.allSettled(
      platforms.map(async (platformId: SocialPlatform) => {
        // Skip if platform content isn't defined
        if (!content.platforms[platformId]) {
          return { platform: platformId, status: 'skipped', reason: 'No content for platform' };
        }
        
        const platformContent = content.platforms[platformId];
        
        // Get account details
        const accountRef = admin.firestore().collection('social_accounts').doc(platformContent.accountId);
        const accountSnap = await accountRef.get();
        
        if (!accountSnap.exists) {
          return { platform: platformId, status: 'failed', reason: 'Account not found' };
        }
        
        const account = accountSnap.data() as SocialAccount;
        
        // Publish to platform
        const publishResult = await publishToPlatform(
          platformId,
          account,
          platformContent,
          content.assets
        );
        
        // Update content with publish result
        const platformUpdate = {
          [`platforms.${platformId}.publishStatus`]: publishResult.success ? 'published' : 'failed',
          [`platforms.${platformId}.publishTime`]: admin.firestore.FieldValue.serverTimestamp(),
          [`platforms.${platformId}.publishedUrl`]: publishResult.url || null,
          [`platforms.${platformId}.platformPostId`]: publishResult.id || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await contentRef.update(platformUpdate);
        
        return { 
          platform: platformId, 
          status: publishResult.success ? 'success' : 'failed', 
          postId: publishResult.id,
          url: publishResult.url
        };
      })
    );
    
    // Update overall content status
    const allPublished = results.every(r => r.status === 'fulfilled' && r.value.status === 'success');
    const anyFailed = results.some(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.status === 'failed'));
    
    let newStatus = 'published';
    if (anyFailed) {
      newStatus = allPublished ? 'partial' : 'failed';
    }
    
    await contentRef.update({
      status: newStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      overallStatus: newStatus,
      platformResults: results.map(r => r.status === 'fulfilled' ? r.value : { status: 'failed' })
    };
  } catch (error) {
    console.error('Error publishing content:', error);
    throw new functions.https.HttpsError('internal', 'Failed to publish content');
  }
});
```

#### Analytics Collection Cron Job
```typescript
export const collectSocialAnalytics = functions.pubsub
  .schedule('every 4 hours')
  .onRun(async (context) => {
    try {
      // Get all active accounts
      const accountsSnap = await admin.firestore()
        .collection('social_accounts')
        .where('status', '==', 'active')
        .get();
      
      const accounts = accountsSnap.docs.map(doc => doc.data() as SocialAccount);
      
      // Process each account
      await Promise.all(accounts.map(async (account) => {
        try {
          // Decrypt tokens
          const accessToken = decrypt(account.authData.accessToken);
          
          // Check if token is expired and refresh if needed
          const now = new Date();
          const expiry = account.authData.expiry.toDate();
          
          let token = accessToken;
          if (now > expiry) {
            const refreshToken = decrypt(account.authData.refreshToken);
            const newTokens = await refreshPlatformTokens(account.platform, refreshToken);
            
            // Update tokens in Firestore
            await admin.firestore().collection('social_accounts').doc(account.id).update({
              'authData.accessToken': encrypt(newTokens.accessToken),
              'authData.refreshToken': encrypt(newTokens.refreshToken),
              'authData.expiry': admin.firestore.Timestamp.fromDate(new Date(newTokens.expiry)),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            token = newTokens.accessToken;
          }
          
          // Fetch account analytics
          const accountAnalytics = await getPlatformAccountAnalytics(account.platform, token, account.platformAccountId);
          
          // Store account analytics
          await storeAccountAnalytics(account.id, accountAnalytics);
          
          // Fetch recent content analytics
          const recentContentSnap = await admin.firestore()
            .collection('social_content')
            .where('platforms.' + account.platform + '.accountId', '==', account.id)
            .where('platforms.' + account.platform + '.publishStatus', '==', 'published')
            .where('updatedAt', '>', admin.firestore.Timestamp.fromMillis(Date.now() - 30 * 24 * 60 * 60 * 1000)) // 30 days
            .get();
          
          const recentContent = recentContentSnap.docs.map(doc => doc.data() as SocialContent);
          
          // Process each content item
          await Promise.all(recentContent.map(async (content) => {
            const platformContent = content.platforms[account.platform];
            if (!platformContent || !platformContent.platformPostId) return;
            
            // Fetch content analytics
            const contentAnalytics = await getPlatformContentAnalytics(
              account.platform, 
              token,
              platformContent.platformPostId
            );
            
            // Store content analytics
            await storeContentAnalytics(content.id, account.platform, account.id, contentAnalytics);
          }));
          
          // Update account metrics summary
          await admin.firestore().collection('social_accounts').doc(account.id).update({
            'metrics.followers': accountAnalytics.metrics.followers,
            'metrics.engagement': accountAnalytics.metrics.totalEngagement,
            lastSyncTime: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`Successfully updated analytics for ${account.platform} account ${account.name}`);
        } catch (error) {
          console.error(`Error updating analytics for account ${account.id}:`, error);
          
          // Update account status if there was an authentication error
          if (error.code === 'auth_error') {
            await admin.firestore().collection('social_accounts').doc(account.id).update({
              status: 'error',
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
        }
      }));
      
      return null;
    } catch (error) {
      console.error('Error in collectSocialAnalytics job:', error);
      return null;
    }
  });
```

## Security Considerations

### Data Security
1. All OAuth tokens must be encrypted at rest
2. All API requests to social platforms must use HTTPS
3. Team and account permissions must be validated on every request
4. API keys and secrets must be stored in secure environment variables
5. Implement rate limiting on sensitive endpoints

### Platform-Specific Security
1. Twitter: Implement OAuth 2.0 PKCE flow
2. Facebook: Request minimal permissions needed
3. LinkedIn: Adhere to API usage guidelines
4. Instagram: Handle API deprecation notices
5. TikTok: Implement content safety checks

### Security Headers
```typescript
// Middleware to add security headers
export default function (req, res, next) {
  // HTTP Strict Transport Security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' https://api.twitter.com https://graph.facebook.com https://api.instagram.com https://api.linkedin.com https://firebase.googleapis.com; script-src 'self' https://apis.google.com; img-src 'self' data: https://*.twimg.com https://*.fbcdn.net https://*.instagram.com;");
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}
```

## Performance Optimizations

1. **Lazy Loading**
   - Implement code-splitting for large components
   - Lazy load platform-specific code modules

2. **Caching Strategy**
   - Cache frequently accessed data
   - Implement stale-while-revalidate pattern
   - Use Firebase cache control headers

3. **Image Optimization**
   - Implement image resizing for different platforms
   - Use WebP format when supported
   - Lazy load images

4. **API Optimization**
   - Implement pagination for large data sets
   - Use batch operations when possible
   - Optimize Firestore queries with proper indexes

5. **Background Processing**
   - Move intensive operations to background functions
   - Use job queues for content publishing

## Error Handling

1. **Client Error Handling**
   ```typescript
   const fetchData = async () => {
     try {
       setState({ loading: true, error: null });
       const response = await fetch('/api/social/content');
       
       if (!response.ok) {
         // Handle HTTP errors
         if (response.status === 401) {
           // Authentication error
           throw new Error('Authentication required');
         } else if (response.status === 403) {
           // Authorization error
           throw new Error('You do not have permission to access this resource');
         } else if (response.status === 429) {
           // Rate limiting
           throw new Error('Rate limit exceeded. Please try again later.');
         } else {
           // General error
           throw new Error(`Error: ${response.statusText}`);
         }
       }
       
       const data = await response.json();
       setState({ data, loading: false });
     } catch (error) {
       // Log error for debugging
       console.error('Fetch error:', error);
       
       // Set user-friendly error message
       setState({ 
         loading: false, 
         error: error.message || 'An unexpected error occurred'
       });
       
       // Show notification to user
       showNotification({
         type: 'error',
         message: error.message || 'Failed to load data'
       });
     }
   };
   ```

2. **Server Error Handling**
   ```typescript
   export const apiHandler = async (req, res) => {
     try {
       // Route handler logic
       const result = await processRequest(req);
       res.status(200).json(result);
     } catch (error) {
       console.error('API error:', error);
       
       // Determine appropriate status code
       let statusCode = 500;
       if (error.code === 'not_found') statusCode = 404;
       if (error.code === 'permission_denied') statusCode = 403;
       if (error.code === 'invalid_request') statusCode = 400;
       if (error.code === 'rate_limited') statusCode = 429;
       
       // Send error response
       res.status(statusCode).json({
         error: {
           message: error.message || 'An internal server error occurred',
           code: error.code || 'internal_error'
         }
       });
       
       // Log to monitoring system if serious error
       if (statusCode === 500) {
         logToMonitoring(error);
       }
     }
   };
   ```

## Monitoring and Logging

1. **Application Logging**
   ```typescript
   // Logger utility
   const logger = {
     info: (message, meta = {}) => {
       console.log(JSON.stringify({
         level: 'info',
         message,
         timestamp: new Date().toISOString(),
         ...meta
       }));
     },
     error: (message, error, meta = {}) => {
       console.error(JSON.stringify({
         level: 'error',
         message,
         error: {
           name: error.name,
           message: error.message,
           stack: error.stack
         },
         timestamp: new Date().toISOString(),
         ...meta
       }));
     },
     warn: (message, meta = {}) => {
       console.warn(JSON.stringify({
         level: 'warn',
         message,
         timestamp: new Date().toISOString(),
         ...meta
       }));
     }
   };
   ```

2. **Performance Monitoring**
   ```typescript
   // Performance tracking utility
   const trackPerformance = (operationName) => {
     const start = performance.now();
     
     return {
       end: (success = true, metadata = {}) => {
         const duration = performance.now() - start;
         
         // Log performance data
         logger.info(`Performance: ${operationName}`, {
           operation: operationName,
           duration,
           success,
           ...metadata
         });
         
         // Send to monitoring system if needed
         if (duration > 1000) { // Slow operation threshold
           logToMonitoring({
             type: 'performance',
             operation: operationName,
             duration,
             ...metadata
           });
         }
         
         return duration;
       }
     };
   };
   ```

## Integration Testing

### API Testing Strategy
1. Mock all external API dependencies
2. Test each API endpoint with valid and invalid inputs
3. Verify authentication and authorization rules
4. Test rate limiting and error handling

### Example Test Case
```typescript
describe('Content Publishing API', () => {
  beforeEach(() => {
    // Set up test data and mocks
  });
  
  test('should publish content to Twitter successfully', async () => {
    // Mock Twitter API response
    mockedTwitterClient.post.mockResolvedValueOnce({
      id: '1234567890',
      url: 'https://twitter.com/user/status/1234567890'
    });
    
    // Call publishing endpoint
    const response = await request(app)
      .post('/api/social/content/publish')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        contentId: 'test-content-id',
        platforms: ['twitter']
      });
    
    // Assert response
    expect(response.status).toBe(200);
    expect(response.body.overallStatus).toBe('published');
    expect(response.body.platformResults[0].status).toBe('success');
    
    // Verify database was updated
    const updatedContent = await getContentFromDb('test-content-id');
    expect(updatedContent.status).toBe('published');
    expect(updatedContent.platforms.twitter.publishStatus).toBe('published');
  });
  
  test('should handle Twitter API failure', async () => {
    // Mock Twitter API error
    mockedTwitterClient.post.mockRejectedValueOnce(new Error('API rate limit exceeded'));
    
    // Call publishing endpoint
    const response = await request(app)
      .post('/api/social/content/publish')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        contentId: 'test-content-id',
        platforms: ['twitter']
      });
    
    // Assert response
    expect(response.status).toBe(200);
    expect(response.body.overallStatus).toBe('failed');
    expect(response.body.platformResults[0].status).toBe('failed');
    
    // Verify database was updated
    const updatedContent = await getContentFromDb('test-content-id');
    expect(updatedContent.status).toBe('failed');
    expect(updatedContent.platforms.twitter.publishStatus).toBe('failed');
  });
});
```

## Deployment Strategy

1. **Environment Configuration**
   - Development: For feature development and testing
   - Staging: For integration testing and pre-release validation
   - Production: For live user access

2. **Deployment Process**
   - Automated CI/CD pipeline with GitHub Actions
   - Feature branch to develop, PR to main branch
   - Automatic deployment to staging on PR merge
   - Manual approval for production deployment
   - Rollback capability for failed deployments

3. **Feature Flags**
   - Implement feature flags for gradual rollout
   - Allow platform-specific feature toggling
   - Support user segment targeting for new features

## Appendix

### API Rate Limits
| Platform | Endpoint | Rate Limit | Reset Period |
|----------|----------|------------|--------------|
| Twitter  | Post     | 300/3hr    | 3 hours      |
| Twitter  | Get User | 900/15min  | 15 minutes   |
| Facebook | Post     | 200/hour   | 1 hour       |
| Instagram| Post     | 25/hour    | 1 hour       |
| LinkedIn | Post     | 100/day    | 24 hours     |
| TikTok   | Post     | 10/minute  | 1 minute     |

### Data Schema Diagrams
[Reference to attached diagrams]

### Social Platform API References
- [Twitter API Documentation](https://developer.twitter.com/en/docs)
- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Instagram API Documentation](https://developers.facebook.com/docs/instagram-api)
- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/marketing/overview)
- [TikTok API Documentation](https://developers.tiktok.com/doc)
- [YouTube API Documentation](https://developers.google.com/youtube/v3)
- [Pinterest API Documentation](https://developers.pinterest.com/docs/api/overview/)