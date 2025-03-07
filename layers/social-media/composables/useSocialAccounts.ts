import { ref, computed, watch } from 'vue'
import { useAuth } from '../../auth/composables/auth'
import { useToaster } from '../../shared/composables/toaster'
import type { SocialAccount, SocialPlatform, AccountStatus } from '../types'

export function useSocialAccounts() {
  const { isAuthenticated, getCurrentWorkspaceId, user } = useAuth()
  const { showError, showSuccess } = useToaster()
  
  const connectedAccounts = ref<SocialAccount[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch connected accounts
  const fetchConnectedAccounts = async () => {
    if (!isAuthenticated.value || !getCurrentWorkspaceId.value) return

    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/data/read', {
        method: 'POST',
        body: {
          collection: 'social_accounts',
          readType: 'query',
          filters: {
            workspace_id: getCurrentWorkspaceId.value,
            status: 'active'
          }
        }
      })

      connectedAccounts.value = response.data || []
    } catch (err: any) {
      console.error('Error fetching social accounts:', err)
      error.value = err.message || 'Failed to load social accounts'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Connect a new platform
  const connectPlatform = async (platform: string) => {
    if (!isAuthenticated.value || !getCurrentWorkspaceId.value) return

    loading.value = true
    error.value = null

    try {
      // Get OAuth URL for the platform
      const authResponse = await $fetch('/api/social/auth-url', {
        method: 'POST',
        body: {
          platform,
          workspace_id: getCurrentWorkspaceId.value,
          redirect_uri: window.location.origin + '/social/callback'
        }
      })

      // Open OAuth popup
      const width = 600
      const height = 600
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2
      
      const popup = window.open(
        authResponse.url,
        'Connect ' + platform,
        \`width=\${width},height=\${height},left=\${left},top=\${top}\`
      )

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups and try again.')
      }

      // Wait for OAuth callback
      const result = await new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            reject(new Error('Authentication cancelled'))
          }
        }, 1000)

        window.addEventListener('message', async (event) => {
          if (event.origin !== window.location.origin) return
          if (event.data?.type !== 'social-auth-callback') return

          clearInterval(checkClosed)
          popup.close()

          if (event.data.error) {
            reject(new Error(event.data.error))
          } else {
            resolve(event.data)
          }
        })
      })

      // Create account record
      const accountResponse = await $fetch('/api/data/write', {
        method: 'POST',
        body: {
          collection: 'social_accounts',
          ...result,
          workspace_id: getCurrentWorkspaceId.value,
          user_id: user.value?.id,
          status: 'active'
        }
      })

      // Update local state
      connectedAccounts.value.push(accountResponse.data)

      return accountResponse.data
    } catch (err: any) {
      console.error('Error connecting platform:', err)
      error.value = err.message || 'Failed to connect platform'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Add another account to an already connected platform
  const addAccount = async (platform: string) => {
    return connectPlatform(platform)
  }

  // Disconnect an account
  const disconnectAccount = async (platform: string, accountId: string) => {
    if (!isAuthenticated.value || !getCurrentWorkspaceId.value) return

    loading.value = true
    error.value = null

    try {
      // Revoke platform access
      await $fetch('/api/social/revoke-access', {
        method: 'POST',
        body: {
          platform,
          account_id: accountId
        }
      })

      // Update account status
      await $fetch('/api/data/update', {
        method: 'POST',
        body: {
          collection: 'social_accounts',
          id: accountId,
          status: 'revoked'
        }
      })

      // Update local state
      connectedAccounts.value = connectedAccounts.value.filter(account => account.id !== accountId)
    } catch (err: any) {
      console.error('Error disconnecting account:', err)
      error.value = err.message || 'Failed to disconnect account'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Refresh access token
  const refreshAccessToken = async (accountId: string) => {
    if (!isAuthenticated.value) return

    try {
      const account = connectedAccounts.value.find(acc => acc.id === accountId)
      if (!account) throw new Error('Account not found')

      const response = await $fetch('/api/social/refresh-token', {
        method: 'POST',
        body: {
          platform: account.platform,
          refresh_token: account.refreshToken
        }
      })

      // Update account with new tokens
      await $fetch('/api/data/update', {
        method: 'POST',
        body: {
          collection: 'social_accounts',
          id: accountId,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          tokenExpiry: response.expiresAt
        }
      })

      // Update local state
      const index = connectedAccounts.value.findIndex(acc => acc.id === accountId)
      if (index !== -1) {
        connectedAccounts.value[index] = {
          ...connectedAccounts.value[index],
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          tokenExpiry: response.expiresAt
        }
      }

      return response
    } catch (err: any) {
      console.error('Error refreshing access token:', err)
      error.value = err.message || 'Failed to refresh access token'
      throw error.value
    }
  }

  // Check if tokens need refresh
  const checkTokens = async () => {
    const now = new Date()
    const expiringAccounts = connectedAccounts.value.filter(account => {
      const expiry = new Date(account.tokenExpiry)
      const timeUntilExpiry = expiry.getTime() - now.getTime()
      // Refresh if token expires in less than 1 hour
      return timeUntilExpiry < 60 * 60 * 1000
    })

    if (expiringAccounts.length > 0) {
      await Promise.all(
        expiringAccounts.map(account => refreshAccessToken(account.id))
      )
    }
  }

  // Computed properties
  const accountsByPlatform = computed(() => {
    const accounts: Record<string, SocialAccount[]> = {}
    connectedAccounts.value.forEach(account => {
      if (!accounts[account.platform]) {
        accounts[account.platform] = []
      }
      accounts[account.platform].push(account)
    })
    return accounts
  })

  // Initialize
  const initialize = async () => {
    await fetchConnectedAccounts()
    await checkTokens()
  }

  return {
    connectedAccounts,
    accountsByPlatform,
    loading,
    error,
    fetchConnectedAccounts,
    connectPlatform,
    addAccount,
    disconnectAccount,
    refreshAccessToken,
    checkTokens,
    initialize
  }
}