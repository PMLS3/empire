import { ref, computed } from 'vue'
import { useAuth } from '../../auth/composables/auth'
import { useToaster } from '../../shared/composables/toaster'
import { serverTimestamp } from 'firebase/firestore'
import type { 
  SocialContent, 
  ContentStatus, 
  ContentType, 
  SocialPlatform,
  PlatformContent
} from '../types'

export function useSocialContent() {
  const { isAuthenticated, getCurrentWorkspaceId, user } = useAuth()
  const { showError, showSuccess } = useToaster()
  
  const content = ref<SocialContent | null>(null)
  const contentList = ref<SocialContent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentWorkspaceId = getCurrentWorkspaceId

  // Fetch all content
  const fetchContentList = async (filters: any = {}) => {
    if (!isAuthenticated.value || !currentWorkspaceId.value) return

    loading.value = true
    error.value = null

    try {
      // Add workspace filter
      const queryFilters = {
        workspace_id: currentWorkspaceId.value,
        ...filters
      }

      const response = await $fetch('/api/data/read', {
        method: 'POST',
        body: {
          collection: 'social_content',
          readType: 'query',
          filters: queryFilters,
          orderBy: 'created_at',
          orderDirection: 'desc'
        }
      })

      contentList.value = response.data || []
    } catch (err: any) {
      console.error('Error fetching social content:', err)
      error.value = err.message || 'Failed to load social content'
      showError(error.value)
    } finally {
      loading.value = false
    }
  }

  // Get specific content by ID
  const fetchContentById = async (contentId: string) => {
    if (!isAuthenticated.value || !contentId) return null

    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/data/read', {
        method: 'POST',
        body: {
          collection: 'social_content',
          readType: 'id',
          id: contentId
        }
      })

      content.value = response.data as SocialContent
      return content.value
    } catch (err: any) {
      console.error('Error fetching content details:', err)
      error.value = err.message || 'Failed to load content details'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // Create new content
  const createContent = async (data: Partial<SocialContent>) => {
    if (!isAuthenticated.value || !currentWorkspaceId.value) return null

    loading.value = true
    error.value = null

    try {
      // Set required fields
      const contentData = {
        ...data,
        workspace_id: currentWorkspaceId.value,
        creator_id: user.value?.id,
        status: ContentStatus.DRAFT,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      }

      const response = await $fetch('/api/data/write', {
        method: 'POST',
        body: {
          collection: 'social_content',
          ...contentData
        }
      })

      content.value = response.data as SocialContent
      showSuccess('Content created successfully')
      return content.value
    } catch (err: any) {
      console.error('Error creating content:', err)
      error.value = err.message || 'Failed to create content'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // Update existing content
  const updateContent = async (contentId: string, updates: Partial<SocialContent>) => {
    if (!isAuthenticated.value || !contentId) return null

    loading.value = true
    error.value = null

    try {
      // Add updated timestamp
      const updateData = {
        ...updates,
        updated_at: serverTimestamp()
      }

      const response = await $fetch('/api/data/update', {
        method: 'POST',
        body: {
          collection: 'social_content',
          id: contentId,
          ...updateData
        }
      })

      // Update content if it's the current one
      if (content.value?.id === contentId) {
        content.value = response.data as SocialContent
      }

      showSuccess('Content updated successfully')
      return response.data as SocialContent
    } catch (err: any) {
      console.error('Error updating content:', err)
      error.value = err.message || 'Failed to update content'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete content
  const deleteContent = async (contentId: string) => {
    if (!isAuthenticated.value || !contentId) return false

    loading.value = true
    error.value = null

    try {
      await $fetch('/api/data/delete', {
        method: 'POST',
        body: {
          collection: 'social_content',
          id: contentId
        }
      })

      // Remove from list if it's there
      contentList.value = contentList.value.filter(item => item.id !== contentId)

      // Clear content if it's the current one
      if (content.value?.id === contentId) {
        content.value = null
      }

      showSuccess('Content deleted successfully')
      return true
    } catch (err: any) {
      console.error('Error deleting content:', err)
      error.value = err.message || 'Failed to delete content'
      showError(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  // Publish content immediately
  const publishContent = async (contentId: string, platformIds: SocialPlatform[]) => {
    if (!isAuthenticated.value || !contentId) return null

    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/social/publish`, {
        method: 'POST',
        body: {
          contentId,
          platforms: platformIds
        }
      })

      // Update local content with updated publish status
      if (content.value?.id === contentId) {
        content.value = await fetchContentById(contentId) as SocialContent
      }

      showSuccess('Content published successfully')
      return response
    } catch (err: any) {
      console.error('Error publishing content:', err)
      error.value = err.message || 'Failed to publish content'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // Schedule content for later
  const scheduleContent = async (contentId: string, publishDate: Date, timezone: string = 'UTC', recurrence: any = null) => {
    if (!isAuthenticated.value || !contentId) return null

    loading.value = true
    error.value = null

    try {
      const updates = {
        status: ContentStatus.SCHEDULED,
        schedule: {
          publishDate,
          timezone,
          recurrence
        }
      }

      const response = await updateContent(contentId, updates)
      showSuccess('Content scheduled successfully')
      return response
    } catch (err: any) {
      console.error('Error scheduling content:', err)
      error.value = err.message || 'Failed to schedule content'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // Check if content is publishable (has required fields)
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

  // Getter for content by status
  const getContentByStatus = (status: ContentStatus) => {
    return contentList.value.filter(item => item.status === status)
  }

  // Get draft content
  const draftContent = computed(() => getContentByStatus(ContentStatus.DRAFT))
  
  // Get scheduled content
  const scheduledContent = computed(() => getContentByStatus(ContentStatus.SCHEDULED))
  
  // Get published content
  const publishedContent = computed(() => getContentByStatus(ContentStatus.PUBLISHED))

  return {
    content,
    contentList,
    loading,
    error,
    isPublishable,
    draftContent,
    scheduledContent,
    publishedContent,
    fetchContentList,
    fetchContentById,
    createContent,
    updateContent,
    deleteContent,
    publishContent,
    scheduleContent
  }
}