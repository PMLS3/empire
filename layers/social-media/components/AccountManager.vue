<template>
  <div class="account-manager">
    <div class="section platform-connections">
      <h2>Connected Platforms</h2>
      <div class="platform-grid">
        <div 
          v-for="platform in platforms" 
          :key="platform.id"
          class="platform-card"
          :class="{ connected: isPlatformConnected(platform.id) }"
        >
          <div class="platform-header">
            <div class="platform-icon" :class="platform.id">
              <i :class="platform.icon"></i>
            </div>
            <div class="platform-info">
              <h3>{{ platform.name }}</h3>
              <span class="status">
                {{ isPlatformConnected(platform.id) ? 'Connected' : 'Not Connected' }}
              </span>
            </div>
          </div>

          <div class="platform-accounts" v-if="isPlatformConnected(platform.id)">
            <div 
              v-for="account in getAccountsForPlatform(platform.id)"
              :key="account.id"
              class="account-item"
            >
              <div class="account-info">
                <img :src="account.profileImage" class="account-image">
                <div class="account-details">
                  <div class="account-name">{{ account.name }}</div>
                  <div class="account-handle">@{{ account.handle }}</div>
                </div>
              </div>
              <button 
                class="disconnect-btn"
                @click="disconnectAccount(platform.id, account.id)"
              >
                Disconnect
              </button>
            </div>
          </div>

          <div class="platform-actions">
            <button 
              v-if="!isPlatformConnected(platform.id)"
              class="connect-btn"
              @click="connectPlatform(platform.id)"
            >
              Connect {{ platform.name }}
            </button>
            <button 
              v-else
              class="add-account-btn"
              @click="addAccount(platform.id)"
            >
              Add Another Account
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="section team-management">
      <h2>Team Management</h2>
      <div class="team-members">
        <div class="member-list">
          <div 
            v-for="member in teamMembers" 
            :key="member.id"
            class="member-item"
          >
            <div class="member-info">
              <img :src="member.avatar" class="member-avatar">
              <div class="member-details">
                <div class="member-name">{{ member.name }}</div>
                <div class="member-role">{{ member.role }}</div>
              </div>
            </div>
            <div class="member-permissions">
              <select 
                v-model="member.role"
                @change="updateMemberRole(member.id, $event.target.value)"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button 
                class="remove-member-btn"
                @click="removeMember(member.id)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
        <div class="invite-member">
          <input 
            v-model="newMemberEmail"
            type="email"
            placeholder="Enter email address"
          >
          <select v-model="newMemberRole">
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button 
            class="invite-btn"
            @click="inviteMember"
            :disabled="!newMemberEmail || !newMemberRole"
          >
            Send Invite
          </button>
        </div>
      </div>
    </div>

    <div class="section account-settings">
      <h2>Account Settings</h2>
      <div class="settings-form">
        <div class="setting-group">
          <h3>Default Post Settings</h3>
          <div class="setting-item">
            <label>Default Platforms</label>
            <div class="platform-checkboxes">
              <label v-for="platform in platforms" :key="platform.id">
                <input 
                  type="checkbox"
                  v-model="settings.defaultPlatforms"
                  :value="platform.id"
                >
                {{ platform.name }}
              </label>
            </div>
          </div>
          <div class="setting-item">
            <label>Default Schedule Time</label>
            <input 
              type="time"
              v-model="settings.defaultScheduleTime"
            >
          </div>
          <div class="setting-item">
            <label>Time Zone</label>
            <select v-model="settings.timezone">
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>

        <div class="setting-group">
          <h3>Approval Workflow</h3>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox"
                v-model="settings.requireApproval"
              >
              Require approval before publishing
            </label>
          </div>
          <div class="setting-item" v-if="settings.requireApproval">
            <label>Approvers</label>
            <select 
              v-model="settings.approvers" 
              multiple
            >
              <option 
                v-for="member in teamMembers" 
                :key="member.id"
                :value="member.id"
              >
                {{ member.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="setting-group">
          <h3>Notifications</h3>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox"
                v-model="settings.notifications.postPublished"
              >
              When posts are published
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox"
                v-model="settings.notifications.postFailed"
              >
              When posts fail to publish
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox"
                v-model="settings.notifications.approvalRequired"
              >
              When posts need approval
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox"
                v-model="settings.notifications.teamActivity"
              >
              Team member activity
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button 
            class="save-btn"
            @click="saveSettings"
            :disabled="!hasSettingsChanged"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSocialAccounts } from '../composables/useSocialAccounts'
import { useTeam } from '../composables/useTeam'
import { useToaster } from '../../shared/composables/toaster'

const {
  connectedAccounts,
  connectPlatform,
  disconnectAccount,
  addAccount
} = useSocialAccounts()

const {
  teamMembers,
  inviteMember: inviteTeamMember,
  updateMemberRole: updateTeamMemberRole,
  removeMember: removeTeamMember
} = useTeam()

const { showSuccess, showError } = useToaster()

// Platform definitions
const platforms = [
  { id: 'twitter', name: 'Twitter', icon: 'ph-twitter-logo' },
  { id: 'facebook', name: 'Facebook', icon: 'ph-facebook-logo' },
  { id: 'instagram', name: 'Instagram', icon: 'ph-instagram-logo' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'ph-linkedin-logo' }
]

// Team management state
const newMemberEmail = ref('')
const newMemberRole = ref('')

// Settings state
const settings = ref({
  defaultPlatforms: [],
  defaultScheduleTime: '09:00',
  timezone: 'UTC',
  requireApproval: false,
  approvers: [],
  notifications: {
    postPublished: true,
    postFailed: true,
    approvalRequired: true,
    teamActivity: false
  }
})

const originalSettings = { ...settings.value }

// Computed
const hasSettingsChanged = computed(() => {
  return JSON.stringify(settings.value) !== JSON.stringify(originalSettings)
})

// Methods
const isPlatformConnected = (platformId: string) => {
  return connectedAccounts.value.some(account => account.platform === platformId)
}

const getAccountsForPlatform = (platformId: string) => {
  return connectedAccounts.value.filter(account => account.platform === platformId)
}

const inviteMember = async () => {
  try {
    await inviteTeamMember(newMemberEmail.value, newMemberRole.value)
    showSuccess('Team member invited successfully')
    newMemberEmail.value = ''
    newMemberRole.value = ''
  } catch (error) {
    showError('Failed to invite team member')
  }
}

const updateMemberRole = async (memberId: string, role: string) => {
  try {
    await updateTeamMemberRole(memberId, role)
    showSuccess('Member role updated successfully')
  } catch (error) {
    showError('Failed to update member role')
  }
}

const removeMember = async (memberId: string) => {
  if (!confirm('Are you sure you want to remove this team member?')) return

  try {
    await removeTeamMember(memberId)
    showSuccess('Team member removed successfully')
  } catch (error) {
    showError('Failed to remove team member')
  }
}

const saveSettings = async () => {
  try {
    // Save settings to backend
    showSuccess('Settings saved successfully')
  } catch (error) {
    showError('Failed to save settings')
  }
}
</script>

<style scoped>
.account-manager {
  padding: 2rem;
}

.section {
  margin-bottom: 3rem;
}

.section h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

/* Platform Connections */
.platform-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.platform-card {
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
  background: white;
}

.platform-card.connected {
  border-color: #28a745;
}

.platform-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.platform-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.platform-icon.twitter {
  background: #1da1f2;
}

.platform-icon.facebook {
  background: #4267B2;
}

.platform-icon.instagram {
  background: #E1306C;
}

.platform-icon.linkedin {
  background: #0077B5;
}

.platform-info h3 {
  margin: 0;
  font-size: 1.2rem;
}

.status {
  font-size: 0.9rem;
  color: #666;
}

.platform-accounts {
  margin: 1rem 0;
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.account-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.account-name {
  font-weight: 500;
}

.account-handle {
  font-size: 0.9rem;
  color: #666;
}

/* Team Management */
.team-members {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1.5rem;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.member-name {
  font-weight: 500;
}

.member-role {
  font-size: 0.9rem;
  color: #666;
}

.member-permissions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.invite-member {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
}

/* Account Settings */
.settings-form {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1.5rem;
}

.setting-group {
  margin-bottom: 2rem;
}

.setting-group h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.setting-item {
  margin-bottom: 1rem;
}

.setting-item label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.platform-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Buttons */
button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.connect-btn,
.save-btn {
  background: #007bff;
  color: white;
  border-color: #0056b3;
}

.disconnect-btn,
.remove-member-btn {
  color: #dc3545;
  border-color: #dc3545;
}

.invite-btn {
  background: #28a745;
  color: white;
  border-color: #1e7e34;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Form Controls */
input[type="email"],
input[type="time"],
select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

select[multiple] {
  min-height: 100px;
}

.form-actions {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  text-align: right;
}
</style> 