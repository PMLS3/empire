<template>
  <div class="social-dashboard">
    <div class="dashboard-header">
      <h1>Social Media Dashboard</h1>
      <div class="header-actions">
        <button class="primary-btn" @click="openContentEditor()">
          <i class="ph-plus"></i>
          Create Post
        </button>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="content-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Calendar View -->
      <ContentCalendar
        v-if="currentTab === 'calendar'"
        @create-post="openContentEditor"
        @edit-post="openContentEditor"
      />

      <!-- Queue View -->
      <div v-else-if="currentTab === 'queue'" class="queue-view">
        <div class="queue-filters">
          <select v-model="queueFilter">
            <option value="all">All Platforms</option>
            <option value="twitter">Twitter</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
          </select>
          <select v-model="statusFilter">
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div class="queue-list">
          <div 
            v-for="post in filteredPosts" 
            :key="post.id"
            class="queue-item"
          >
            <div class="post-preview">
              <div class="post-platforms">
                <div 
                  v-for="platform in post.platforms" 
                  :key="platform"
                  class="platform-badge"
                  :class="platform.toLowerCase()"
                >
                  {{ platform }}
                </div>
              </div>
              <div class="post-content">
                <p class="post-text">{{ post.text }}</p>
                <div v-if="post.media?.length" class="post-media">
                  <img 
                    v-for="media in post.media.slice(0, 4)" 
                    :key="media.url"
                    :src="media.url"
                    :alt="media.type"
                  >
                  <span v-if="post.media.length > 4" class="media-more">
                    +{{ post.media.length - 4 }} more
                  </span>
                </div>
              </div>
            </div>
            <div class="post-meta">
              <div class="post-status" :class="post.status.toLowerCase()">
                {{ post.status }}
              </div>
              <div v-if="post.scheduledTime" class="post-time">
                {{ formatDateTime(post.scheduledTime) }}
              </div>
            </div>
            <div class="post-actions">
              <button @click="openContentEditor(post)">
                <i class="ph-pencil"></i>
                Edit
              </button>
              <button v-if="post.status === 'draft'" @click="publishPost(post)">
                <i class="ph-paper-plane"></i>
                Publish
              </button>
              <button v-if="post.status === 'scheduled'" @click="unschedulePost(post)">
                <i class="ph-calendar-x"></i>
                Unschedule
              </button>
              <button class="delete-btn" @click="confirmDeletePost(post)">
                <i class="ph-trash"></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bulk Operations View -->
      <BulkOperations
        v-else-if="currentTab === 'bulk'"
        @view-item="openContentEditor"
      />

      <!-- Publishing Rules View -->
      <PublishingRules
        v-else-if="currentTab === 'rules'"
      />

      <!-- Library View -->
      <ContentLibrary
        v-else-if="currentTab === 'library'"
        @select-content="openContentEditor"
      />

      <!-- Analytics View -->
      <div v-else-if="currentTab === 'analytics'" class="analytics-view">
        <div class="analytics-header">
          <div class="date-range">
            <button 
              v-for="range in dateRanges" 
              :key="range"
              :class="['range-btn', { active: currentRange === range }]"
              @click="currentRange = range"
            >
              {{ range }}
            </button>
          </div>
          <select v-model="analyticsFilter">
            <option value="all">All Platforms</option>
            <option value="twitter">Twitter</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>

        <div class="analytics-grid">
          <div class="metric-card">
            <h3>Total Posts</h3>
            <div class="metric-value">{{ metrics.totalPosts }}</div>
            <div class="metric-change" :class="getChangeClass(metrics.postsChange)">
              {{ formatChange(metrics.postsChange) }}
            </div>
          </div>
          <div class="metric-card">
            <h3>Engagement Rate</h3>
            <div class="metric-value">{{ formatPercent(metrics.engagementRate) }}</div>
            <div class="metric-change" :class="getChangeClass(metrics.engagementChange)">
              {{ formatChange(metrics.engagementChange) }}
            </div>
          </div>
          <div class="metric-card">
            <h3>Reach</h3>
            <div class="metric-value">{{ formatNumber(metrics.reach) }}</div>
            <div class="metric-change" :class="getChangeClass(metrics.reachChange)">
              {{ formatChange(metrics.reachChange) }}
            </div>
          </div>
          <div class="metric-card">
            <h3>Clicks</h3>
            <div class="metric-value">{{ formatNumber(metrics.clicks) }}</div>
            <div class="metric-change" :class="getChangeClass(metrics.clicksChange)">
              {{ formatChange(metrics.clicksChange) }}
            </div>
          </div>
        </div>

        <div class="analytics-charts">
          <!-- Add charts here -->
        </div>
      </div>

      <!-- Settings View -->
      <div v-else-if="currentTab === 'settings'" class="settings-view">
        <h2>Account Settings</h2>
        <AccountManager />
      </div>
    </div>

    <!-- Content Editor Modal -->
    <div v-if="showContentEditor" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ editingContent ? 'Edit Content' : 'Create New Content' }}</h2>
          <button class="close-btn" @click="closeContentEditor">×</button>
        </div>
        <div class="modal-body">
          <ContentEditor
            :content="currentContent"
            @save="saveContent"
            @publish="publishContent"
            @schedule="scheduleContent"
            @cancel="closeContentEditor"
          />
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-container delete-modal">
        <div class="modal-header">
          <h2>Confirm Delete</h2>
          <button class="close-btn" @click="showDeleteConfirm = false">×</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this content? This action cannot be undone.</p>
          <div class="modal-actions">
            <button class="cancel-btn" @click="showDeleteConfirm = false">Cancel</button>
            <button class="delete-btn" @click="deletePost">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format, parseISO } from 'date-fns'
import { useSocialContent } from '../composables/useSocialContent'
import { useSocialAnalytics } from '../composables/useSocialAnalytics'
import ContentCalendar from '../components/ContentCalendar.vue'
import ContentEditor from '../components/ContentEditor.vue'
import ContentLibrary from '../components/ContentLibrary.vue'
import AccountManager from '../components/AccountManager.vue'
import BulkOperations from '../components/BulkOperations.vue'
import PublishingRules from '../components/PublishingRules.vue'
import { useToaster } from '../../shared/composables/toaster'

const { contentList, fetchContentList, createContent, updateContent, deleteContent, publishContent: publishContentApi } = useSocialContent()
const { getMetrics } = useSocialAnalytics()
const { showSuccess, showError } = useToaster()

// State
const currentTab = ref('calendar')
const showContentEditor = ref(false)
const showDeleteConfirm = ref(false)
const currentContent = ref(null)
const editingContent = ref(false)
const contentToDelete = ref(null)
const queueFilter = ref('all')
const statusFilter = ref('all')
const analyticsFilter = ref('all')
const currentRange = ref('7D')

// Tabs
const tabs = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'queue', label: 'Content Queue' },
  { id: 'bulk', label: 'Bulk Operations' },
  { id: 'rules', label: 'Publishing Rules' },
  { id: 'library', label: 'Content Library' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' }
]

// Date ranges for analytics
const dateRanges = ['7D', '30D', '90D', 'YTD']

// Computed
const filteredPosts = computed(() => {
  let filtered = [...contentList.value]
  
  // Filter by platform
  if (queueFilter.value !== 'all') {
    filtered = filtered.filter(post => 
      post.platforms.some(p => p.toLowerCase() === queueFilter.value)
    )
  }
  
  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(post => 
      post.status.toLowerCase() === statusFilter.value
    )
  }
  
  return filtered
})

const metrics = computed(() => {
  return getMetrics(currentRange.value, analyticsFilter.value)
})

// Methods
const openContentEditor = (content = null) => {
  if (content) {
    currentContent.value = { ...content }
    editingContent.value = true
  } else {
    currentContent.value = {
      text: '',
      platforms: [],
      media: [],
      status: 'draft'
    }
    editingContent.value = false
  }
  
  showContentEditor.value = true
}

const closeContentEditor = () => {
  showContentEditor.value = false
  currentContent.value = null
}

const saveContent = async (content) => {
  try {
    if (editingContent.value) {
      await updateContent(content.id, content)
      showSuccess('Content updated successfully')
    } else {
      await createContent(content)
      showSuccess('Content created successfully')
    }
    
    closeContentEditor()
    fetchContentList()
  } catch (error) {
    console.error('Error saving content:', error)
    showError('Failed to save content')
  }
}

const publishPost = async (post) => {
  try {
    await publishContentApi(post.id, post.platforms)
    showSuccess('Content published successfully')
    fetchContentList()
  } catch (error) {
    console.error('Error publishing content:', error)
    showError('Failed to publish content')
  }
}

const publishContent = async (content) => {
  try {
    if (editingContent.value) {
      await publishContentApi(content.id, content.platforms)
    } else {
      const newContent = await createContent(content)
      await publishContentApi(newContent.id, content.platforms)
    }
    
    showSuccess('Content published successfully')
    closeContentEditor()
    fetchContentList()
  } catch (error) {
    console.error('Error publishing content:', error)
    showError('Failed to publish content')
  }
}

const scheduleContent = async (content, scheduleData) => {
  try {
    if (editingContent.value) {
      await updateContent(content.id, {
        ...content,
        ...scheduleData,
        status: 'scheduled'
      })
    } else {
      await createContent({
        ...content,
        ...scheduleData,
        status: 'scheduled'
      })
    }
    
    showSuccess('Content scheduled successfully')
    closeContentEditor()
    fetchContentList()
  } catch (error) {
    console.error('Error scheduling content:', error)
    showError('Failed to schedule content')
  }
}

const unschedulePost = async (post) => {
  try {
    await updateContent(post.id, {
      status: 'draft',
      scheduledTime: null
    })
    
    showSuccess('Content unscheduled')
    fetchContentList()
  } catch (error) {
    console.error('Error unscheduling content:', error)
    showError('Failed to unschedule content')
  }
}

const confirmDeletePost = (post) => {
  contentToDelete.value = post
  showDeleteConfirm.value = true
}

const deletePost = async () => {
  if (!contentToDelete.value) return
  
  try {
    await deleteContent(contentToDelete.value.id)
    showSuccess('Content deleted successfully')
    showDeleteConfirm.value = false
    contentToDelete.value = null
    fetchContentList()
  } catch (error) {
    console.error('Error deleting content:', error)
    showError('Failed to delete content')
  }
}

const formatDateTime = (dateString) => {
  const date = parseISO(dateString)
  return format(date, 'MMM d, yyyy h:mm a')
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num)
}

const formatPercent = (num: number) => {
  return num.toFixed(1) + '%'
}

const formatChange = (change: number) => {
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

const getChangeClass = (change: number) => {
  return change > 0 ? 'positive' : change < 0 ? 'negative' : ''
}

// Initial load
onMounted(async () => {
  await fetchContentList()
})
</script>

<style scoped>
.social-dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.content-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.tab-btn.active {
  background: #007bff;
  color: white;
  border-color: #0056b3;
}

/* Queue View */
.queue-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.queue-item {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: start;
}

.post-platforms {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.platform-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.platform-badge.twitter {
  background: #1da1f2;
}

.platform-badge.facebook {
  background: #4267B2;
}

.platform-badge.instagram {
  background: #E1306C;
}

.platform-badge.linkedin {
  background: #0077B5;
}

.post-content {
  margin-top: 0.5rem;
}

.post-media {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.post-media img {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.media-more {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.post-meta {
  text-align: right;
}

.post-status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 0.5rem;
}

.post-status.draft {
  background: #f8f9fa;
  color: #6c757d;
}

.post-status.scheduled {
  background: #cff4fc;
  color: #055160;
}

.post-status.published {
  background: #d1e7dd;
  color: #0f5132;
}

.post-status.failed {
  background: #f8d7da;
  color: #842029;
}

.post-time {
  font-size: 14px;
  color: #666;
}

.post-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.post-actions button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.post-actions button.delete-btn {
  color: #dc3545;
  border-color: #dc3545;
}

/* Analytics View */
.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.date-range {
  display: flex;
  gap: 0.5rem;
}

.range-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.range-btn.active {
  background: #007bff;
  color: white;
  border-color: #0056b3;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1.5rem;
}

.metric-card h3 {
  margin: 0 0 1rem;
  color: #666;
  font-size: 14px;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.metric-change {
  font-size: 14px;
}

.metric-change.positive {
  color: #198754;
}

.metric-change.negative {
  color: #dc3545;
}

/* Settings View */
.settings-view {
  padding: 2rem;
}

.settings-view h2 {
  margin-bottom: 1.5rem;
}
</style> 