import { ref, computed, watch } from 'vue'
import { useAuth } from '../../auth/composables/auth'
import { useToaster } from '../../shared/composables/toaster'
import { useSocialContent } from './useSocialContent'
import { ContentStatus, type SocialPlatform, type SocialContent } from '../types'

export function useSocialCalendar() {
  const { isAuthenticated, getCurrentWorkspaceId } = useAuth()
  const { showError, showSuccess } = useToaster()
  const { fetchContentList, updateContent } = useSocialContent()
  
  const calendarView = ref<'month' | 'week' | 'day' | 'list'>('month')
  const currentDate = ref<Date>(new Date())
  const selectedDate = ref<Date | null>(null)
  const selectedContent = ref<SocialContent | null>(null)
  const scheduledContent = ref<SocialContent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const platformFilter = ref<SocialPlatform[]>([])
  const currentWorkspaceId = getCurrentWorkspaceId

  // Fetch scheduled content when workspace or date changes
  watch([currentWorkspaceId, currentDate], ([newWorkspaceId, newDate]) => {
    if (newWorkspaceId) {
      loadScheduledContent()
    }
  }, { immediate: true })

  // Load scheduled content for current view
  const loadScheduledContent = async () => {
    if (!isAuthenticated.value || !currentWorkspaceId.value) return

    loading.value = true
    error.value = null

    try {
      // Calculate date range based on current view
      const { startDate, endDate } = getDateRangeForView(calendarView.value, currentDate.value)

      // Fetch content scheduled within this range
      await fetchContentList({
        workspace_id: currentWorkspaceId.value,
        status: ContentStatus.SCHEDULED,
        'schedule.publishDate': {
          $gte: startDate,
          $lte: endDate
        }
      })

      // Result is stored in the contentList from useSocialContent
      // We need to map it to our local scheduledContent
      scheduledContent.value = scheduledContent.value
    } catch (err: any) {
      console.error('Error loading scheduled content:', err)
      error.value = err.message || 'Failed to load scheduled content'
      showError(error.value)
    } finally {
      loading.value = false
    }
  }

  // Helper to get date range for current view
  const getDateRangeForView = (view: 'month' | 'week' | 'day' | 'list', date: Date) => {
    const startDate = new Date(date)
    const endDate = new Date(date)

    switch (view) {
      case 'month':
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0) // Last day of month
        endDate.setHours(23, 59, 59, 999)
        break
      case 'week':
        const day = startDate.getDay()
        startDate.setDate(startDate.getDate() - day) // Start of week (Sunday)
        startDate.setHours(0, 0, 0, 0)
        endDate.setDate(endDate.getDate() + (6 - day)) // End of week (Saturday)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'day':
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'list':
        // For list view, we might want to show more content
        startDate.setHours(0, 0, 0, 0)
        endDate.setMonth(endDate.getMonth() + 3) // Show 3 months ahead
        endDate.setHours(23, 59, 59, 999)
        break
    }

    return { startDate, endDate }
  }

  // Schedule content at a specific date/time
  const scheduleContentAt = async (contentId: string, date: Date, timezone: string = 'UTC') => {
    if (!isAuthenticated.value) return null

    loading.value = true
    error.value = null

    try {
      const result = await updateContent(contentId, {
        status: ContentStatus.SCHEDULED,
        schedule: {
          publishDate: date,
          timezone
        }
      })

      if (result) {
        showSuccess('Content scheduled successfully')
        await loadScheduledContent() // Refresh calendar
      }

      return result
    } catch (err: any) {
      console.error('Error scheduling content:', err)
      error.value = err.message || 'Failed to schedule content'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // Reschedule content (drag & drop)
  const rescheduleContent = async (contentId: string, newDate: Date) => {
    if (!isAuthenticated.value) return null

    loading.value = true
    error.value = null

    try {
      // First find the content to get its current timezone
      const contentToUpdate = scheduledContent.value.find(c => c.id === contentId)
      if (!contentToUpdate) {
        throw new Error('Content not found')
      }

      const result = await updateContent(contentId, {
        schedule: {
          publishDate: newDate,
          timezone: contentToUpdate.schedule.timezone || 'UTC',
          recurrence: contentToUpdate.schedule.recurrence
        }
      })

      if (result) {
        showSuccess('Content rescheduled successfully')
        await loadScheduledContent() // Refresh calendar
      }

      return result
    } catch (err: any) {
      console.error('Error rescheduling content:', err)
      error.value = err.message || 'Failed to reschedule content'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // Cancel scheduled content
  const cancelScheduledContent = async (contentId: string) => {
    if (!isAuthenticated.value) return null

    loading.value = true
    error.value = null

    try {
      const result = await updateContent(contentId, {
        status: ContentStatus.DRAFT,
        schedule: null
      })

      if (result) {
        showSuccess('Scheduled content canceled')
        await loadScheduledContent() // Refresh calendar
      }

      return result
    } catch (err: any) {
      console.error('Error canceling scheduled content:', err)
      error.value = err.message || 'Failed to cancel scheduled content'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // Set up recurring schedule
  const setupRecurringSchedule = async (
    contentId: string,
    frequency: 'daily' | 'weekly' | 'monthly',
    interval: number,
    endDate?: Date,
    daysOfWeek?: number[]
  ) => {
    if (!isAuthenticated.value) return null

    loading.value = true
    error.value = null

    try {
      // First find the content to get its current schedule
      const contentToUpdate = scheduledContent.value.find(c => c.id === contentId)
      if (!contentToUpdate) {
        throw new Error('Content not found')
      }

      const result = await updateContent(contentId, {
        schedule: {
          publishDate: contentToUpdate.schedule.publishDate,
          timezone: contentToUpdate.schedule.timezone || 'UTC',
          recurrence: {
            frequency,
            interval,
            endDate,
            daysOfWeek
          }
        }
      })

      if (result) {
        showSuccess('Recurring schedule set up successfully')
        await loadScheduledContent() // Refresh calendar
      }

      return result
    } catch (err: any) {
      console.error('Error setting up recurring schedule:', err)
      error.value = err.message || 'Failed to set up recurring schedule'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // Filter content by platform
  const filteredContent = computed(() => {
    if (platformFilter.value.length === 0) {
      return scheduledContent.value
    }

    return scheduledContent.value.filter(content => {
      // Check if content is scheduled for any of the filtered platforms
      return platformFilter.value.some(platform => 
        content.platforms[platform] !== undefined
      )
    })
  })

  // Group content by date for calendar display
  const contentByDate = computed(() => {
    const grouped: Record<string, SocialContent[]> = {}
    
    filteredContent.value.forEach(content => {
      // Format date as YYYY-MM-DD
      const publishDate = new Date(content.schedule.publishDate);
      const dateKey = publishDate.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      
      grouped[dateKey].push(content)
    })
    
    return grouped
  })

  // Navigate calendar view
  const navigateCalendar = (direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate.value)
    
    switch (direction) {
      case 'prev':
        if (calendarView.value === 'month') {
          newDate.setMonth(newDate.getMonth() - 1)
        } else if (calendarView.value === 'week') {
          newDate.setDate(newDate.getDate() - 7)
        } else {
          newDate.setDate(newDate.getDate() - 1)
        }
        break
      case 'next':
        if (calendarView.value === 'month') {
          newDate.setMonth(newDate.getMonth() + 1)
        } else if (calendarView.value === 'week') {
          newDate.setDate(newDate.getDate() + 7)
        } else {
          newDate.setDate(newDate.getDate() + 1)
        }
        break
      case 'today':
        newDate.setHours(new Date().getHours())
        newDate.setMinutes(new Date().getMinutes())
        break
    }
    
    currentDate.value = newDate
  }

  // Change calendar view
  const changeView = (view: 'month' | 'week' | 'day' | 'list') => {
    calendarView.value = view
    loadScheduledContent()
  }

  // Get content for a specific date
  const getContentForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0]
    return contentByDate.value[dateKey] || []
  }

  return {
    calendarView,
    currentDate,
    selectedDate,
    selectedContent,
    scheduledContent,
    filteredContent,
    contentByDate,
    loading,
    error,
    platformFilter,
    loadScheduledContent,
    scheduleContentAt,
    rescheduleContent,
    cancelScheduledContent,
    setupRecurringSchedule,
    navigateCalendar,
    changeView,
    getContentForDate
  }
}