import { ref, computed } from 'vue'
import { useAuth } from '../../auth/composables/auth'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  avatar: string
  status: 'active' | 'invited' | 'disabled'
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface TeamInvite {
  id: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  invitedBy: string
  status: 'pending' | 'accepted' | 'expired'
  expiresAt: string
  createdAt: string
}

export function useTeam() {
  const { isAuthenticated, getCurrentWorkspaceId } = useAuth()
  
  const teamMembers = ref<TeamMember[]>([])
  const pendingInvites = ref<TeamInvite[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch team members
  const fetchTeamMembers = async () => {
    if (!isAuthenticated.value || !getCurrentWorkspaceId.value) return

    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/data/read', {
        method: 'POST',
        body: {
          collection: 'team_members',
          readType: 'query',
          filters: {
            workspace_id: getCurrentWorkspaceId.value
          }
        }
      })

      teamMembers.value = response.data || []
    } catch (err: any) {
      console.error('Error fetching team members:', err)
      error.value = err.message || 'Failed to load team members'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Fetch pending invites
  const fetchPendingInvites = async () => {
    if (!isAuthenticated.value || !getCurrentWorkspaceId.value) return

    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/data/read', {
        method: 'POST',
        body: {
          collection: 'team_invites',
          readType: 'query',
          filters: {
            workspace_id: getCurrentWorkspaceId.value,
            status: 'pending'
          }
        }
      })

      pendingInvites.value = response.data || []
    } catch (err: any) {
      console.error('Error fetching pending invites:', err)
      error.value = err.message || 'Failed to load pending invites'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Invite new team member
  const inviteMember = async (email: string, role: 'admin' | 'editor' | 'viewer') => {
    if (!isAuthenticated.value || !getCurrentWorkspaceId.value) return

    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/data/write', {
        method: 'POST',
        body: {
          collection: 'team_invites',
          workspace_id: getCurrentWorkspaceId.value,
          email,
          role,
          status: 'pending',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        }
      })

      // Send invitation email
      await $fetch('/api/team/send-invite', {
        method: 'POST',
        body: {
          invite_id: response.id,
          email,
          role
        }
      })

      await fetchPendingInvites()
      return response
    } catch (err: any) {
      console.error('Error inviting team member:', err)
      error.value = err.message || 'Failed to invite team member'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Update member role
  const updateMemberRole = async (memberId: string, role: 'admin' | 'editor' | 'viewer') => {
    if (!isAuthenticated.value || !getCurrentWorkspaceId.value) return

    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/data/update', {
        method: 'POST',
        body: {
          collection: 'team_members',
          id: memberId,
          role,
          permissions: getRolePermissions(role)
        }
      })

      // Update local state
      const index = teamMembers.value.findIndex(member => member.id === memberId)
      if (index !== -1) {
        teamMembers.value[index] = response.data
      }

      return response
    } catch (err: any) {
      console.error('Error updating member role:', err)
      error.value = err.message || 'Failed to update member role'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Remove team member
  const removeMember = async (memberId: string) => {
    if (!isAuthenticated.value || !getCurrentWorkspaceId.value) return

    loading.value = true
    error.value = null

    try {
      await $fetch('/api/data/update', {
        method: 'POST',
        body: {
          collection: 'team_members',
          id: memberId,
          status: 'disabled',
          disabled_at: new Date().toISOString()
        }
      })

      // Update local state
      teamMembers.value = teamMembers.value.filter(member => member.id !== memberId)
    } catch (err: any) {
      console.error('Error removing team member:', err)
      error.value = err.message || 'Failed to remove team member'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Cancel pending invite
  const cancelInvite = async (inviteId: string) => {
    if (!isAuthenticated.value || !getCurrentWorkspaceId.value) return

    loading.value = true
    error.value = null

    try {
      await $fetch('/api/data/update', {
        method: 'POST',
        body: {
          collection: 'team_invites',
          id: inviteId,
          status: 'expired'
        }
      })

      // Update local state
      pendingInvites.value = pendingInvites.value.filter(invite => invite.id !== inviteId)
    } catch (err: any) {
      console.error('Error canceling invite:', err)
      error.value = err.message || 'Failed to cancel invite'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Helper function to get permissions for a role
  const getRolePermissions = (role: 'admin' | 'editor' | 'viewer'): string[] => {
    switch (role) {
      case 'admin':
        return [
          'manage_team',
          'manage_settings',
          'manage_content',
          'publish_content',
          'view_analytics',
          'manage_accounts'
        ]
      case 'editor':
        return [
          'manage_content',
          'publish_content',
          'view_analytics'
        ]
      case 'viewer':
        return [
          'view_content',
          'view_analytics'
        ]
      default:
        return []
    }
  }

  // Check if current user has a specific permission
  const hasPermission = (permission: string): boolean => {
    const currentUser = teamMembers.value.find(member => member.id === getCurrentWorkspaceId.value)
    return currentUser?.permissions.includes(permission) || false
  }

  // Computed properties
  const activeMembers = computed(() => {
    return teamMembers.value.filter(member => member.status === 'active')
  })

  const adminMembers = computed(() => {
    return teamMembers.value.filter(member => member.role === 'admin')
  })

  // Load initial data
  const initialize = async () => {
    await Promise.all([
      fetchTeamMembers(),
      fetchPendingInvites()
    ])
  }

  return {
    teamMembers,
    pendingInvites,
    loading,
    error,
    activeMembers,
    adminMembers,
    fetchTeamMembers,
    fetchPendingInvites,
    inviteMember,
    updateMemberRole,
    removeMember,
    cancelInvite,
    hasPermission,
    initialize
  }
} 