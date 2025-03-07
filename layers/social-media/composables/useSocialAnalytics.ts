import { ref, computed, watch } from 'vue'
import { useAuth } from '../../auth/composables/auth'
import { useToaster } from '../../shared/composables/toaster'
import type { 
  SocialPlatform, 
  SocialAccount, 
  ContentAnalytics,
  AccountAnalytics
} from '../types'

export function useSocialAnalytics() {
  const { isAuthenticated, getCurrentWorkspaceId } = useAuth()
  const { showError } = useToaster()
  
  const accountAnalytics = ref<AccountAnalytics[]>([])
  const contentAnalytics = ref<ContentAnalytics[]>([])
  const selectedDate = ref<{ start: Date, end: Date }>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
    end: new Date()
  })
  const selectedPlatforms = ref<SocialPlatform[]>([])
  const selectedAccounts = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentWorkspaceId = getCurrentWorkspaceId

  // Watch for workspace changes and reload data
  watch(currentWorkspaceId, (newWorkspaceId) => {
    if (newWorkspaceId) {
      fetchAnalyticsData()
    }
  }, { immediate: true })

  // Fetch analytics data based on current filters
  const fetchAnalyticsData = async () => {
    if (!isAuthenticated.value || !currentWorkspaceId.value) return

    loading.value = true
    error.value = null

    // Format dates for API
    const startDate = selectedDate.value.start.toISOString().split('T')[0]
    const endDate = selectedDate.value.end.toISOString().split('T')[0]

    try {
      // Build filters
      const filters: any = {
        workspace_id: currentWorkspaceId.value,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }

      // Add platform filter if selected
      if (selectedPlatforms.value.length > 0) {
        filters.platformId = { $in: selectedPlatforms.value }
      }

      // Add account filter if selected
      if (selectedAccounts.value.length > 0) {
        filters.accountId = { $in: selectedAccounts.value }
      }

      // Fetch account analytics
      const accountResponse = await $fetch('/api/data/read', {
        method: 'POST',
        body: {
          collection: 'account_analytics',
          readType: 'query',
          filters,
          orderBy: 'date'
        }
      })

      accountAnalytics.value = accountResponse.data || []

      // Fetch content analytics
      const contentResponse = await $fetch('/api/data/read', {
        method: 'POST',
        body: {
          collection: 'content_analytics',
          readType: 'query',
          filters,
          orderBy: 'updated_at',
          orderDirection: 'desc'
        }
      })

      contentAnalytics.value = contentResponse.data || []

    } catch (err: any) {
      console.error('Error fetching analytics data:', err)
      error.value = err.message || 'Failed to load analytics data'
      showError(error.value)
    } finally {
      loading.value = false
    }
  }

  // Get analytics for a specific content item
  const getContentAnalytics = async (contentId: string) => {
    if (!isAuthenticated.value) return null

    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/data/read', {
        method: 'POST',
        body: {
          collection: 'content_analytics',
          readType: 'query',
          filters: {
            contentId
          }
        }
      })

      return response.data || []
    } catch (err: any) {
      console.error('Error fetching content analytics:', err)
      error.value = err.message || 'Failed to load content analytics'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // Get analytics for a specific account
  const getAccountAnalytics = async (accountId: string, startDate: string, endDate: string) => {
    if (!isAuthenticated.value) return null

    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/data/read', {
        method: 'POST',
        body: {
          collection: 'account_analytics',
          readType: 'query',
          filters: {
            accountId,
            date: {
              $gte: startDate,
              $lte: endDate
            }
          },
          orderBy: 'date'
        }
      })

      return response.data || []
    } catch (err: any) {
      console.error('Error fetching account analytics:', err)
      error.value = err.message || 'Failed to load account analytics'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // Generate and download analytics report
  const generateReport = async (format: 'csv' | 'pdf' | 'json' = 'csv') => {
    if (!isAuthenticated.value) return null

    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/social/report', {
        method: 'POST',
        body: {
          startDate: selectedDate.value.start.toISOString(),
          endDate: selectedDate.value.end.toISOString(),
          platforms: selectedPlatforms.value,
          accounts: selectedAccounts.value,
          format
        },
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url

      // Set filename based on date range and format
      const startDateStr = selectedDate.value.start.toISOString().split('T')[0]
      const endDateStr = selectedDate.value.end.toISOString().split('T')[0]
      link.setAttribute('download', `social-analytics-${startDateStr}-to-${endDateStr}.${format}`)
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return true
    } catch (err: any) {
      console.error('Error generating report:', err)
      error.value = err.message || 'Failed to generate report'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // Update date range and refetch data
  const setDateRange = (start: Date, end: Date) => {
    selectedDate.value = { start, end }
    fetchAnalyticsData()
  }

  // Update platform filter and refetch data
  const setPlatformFilter = (platforms: SocialPlatform[]) => {
    selectedPlatforms.value = platforms
    fetchAnalyticsData()
  }

  // Update account filter and refetch data
  const setAccountFilter = (accounts: string[]) => {
    selectedAccounts.value = accounts
    fetchAnalyticsData()
  }

  // Calculate total engagement across all accounts/platforms
  const totalEngagement = computed(() => {
    let total = 0
    accountAnalytics.value.forEach(analytic => {
      total += analytic.metrics.totalEngagement || 0
    })
    return total
  })

  // Calculate total follower growth
  const totalFollowerGrowth = computed(() => {
    let total = 0
    accountAnalytics.value.forEach(analytic => {
      total += analytic.followerGrowth?.netGrowth || 0
    })
    return total
  })

  // Get engagement rate
  const avgEngagementRate = computed(() => {
    if (accountAnalytics.value.length === 0) return 0
    
    let totalRate = 0
    let count = 0
    
    accountAnalytics.value.forEach(analytic => {
      if (analytic.metrics.engagementRate) {
        totalRate += analytic.metrics.engagementRate
        count++
      }
    })
    
    return count > 0 ? totalRate / count : 0
  })

  // Get analytics by platform
  const analyticsByPlatform = computed(() => {
    const result: Record<SocialPlatform, any> = {} as any

    // Initialize platforms
    for (const platform of Object.values(SocialPlatform)) {
      result[platform] = {
        engagement: 0,
        followers: 0,
        posts: 0,
        growth: 0
      }
    }

    // Group analytics by platform
    contentAnalytics.value.forEach(analytic => {
      const platform = analytic.platformId as SocialPlatform
      if (!result[platform]) return

      // Sum up engagement metrics
      result[platform].engagement += 
        (analytic.metrics.likes || 0) + 
        (analytic.metrics.comments || 0) + 
        (analytic.metrics.shares || 0)
    })

    return result
  })

  return {
    accountAnalytics,
    contentAnalytics,
    selectedDate,
    selectedPlatforms,
    selectedAccounts,
    loading,
    error,
    totalEngagement,
    totalFollowerGrowth,
    avgEngagementRate,
    analyticsByPlatform,
    fetchAnalyticsData,
    getContentAnalytics,
    getAccountAnalytics,
    generateReport,
    setDateRange,
    setPlatformFilter,
    setAccountFilter
  }
}