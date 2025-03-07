<template>
  <div class="bulk-operations">
    <div class="bulk-header">
      <h3>Bulk Operations</h3>
      <div class="selection-info" v-if="selectedItems.length > 0">
        {{ selectedItems.length }} items selected
      </div>
      <div class="bulk-actions">
        <button 
          class="action-btn select-all" 
          @click="toggleSelectAll"
          :class="{ 'active': isAllSelected }"
        >
          {{ isAllSelected ? 'Deselect All' : 'Select All' }}
        </button>
        <button 
          class="action-btn" 
          :disabled="selectedItems.length === 0"
          @click="showScheduleDialog = true"
        >
          <i class="ph-calendar"></i> Schedule
        </button>
        <button 
          class="action-btn" 
          :disabled="selectedItems.length === 0"
          @click="showPublishDialog = true"
        >
          <i class="ph-paper-plane-right"></i> Publish
        </button>
        <button 
          class="action-btn delete" 
          :disabled="selectedItems.length === 0"
          @click="confirmDelete"
        >
          <i class="ph-trash"></i> Delete
        </button>
      </div>
    </div>

    <div class="content-list">
      <div class="list-header">
        <div class="checkbox-cell">
          <input 
            type="checkbox" 
            :checked="isAllSelected" 
            @change="toggleSelectAll"
          />
        </div>
        <div class="title-cell">Content</div>
        <div class="platform-cell">Platforms</div>
        <div class="status-cell">Status</div>
        <div class="date-cell">Created</div>
      </div>
      
      <div 
        v-for="item in contentItems" 
        :key="item.id" 
        class="list-item"
        :class="{ 'selected': isSelected(item.id) }"
      >
        <div class="checkbox-cell">
          <input 
            type="checkbox" 
            :checked="isSelected(item.id)" 
            @change="toggleSelect(item.id)"
          />
        </div>
        <div class="title-cell" @click="viewItem(item)">
          <div class="item-title">{{ truncate(item.text, 60) }}</div>
          <div class="item-preview" v-if="item.media && item.media.length">
            <img 
              v-if="item.media[0].type.startsWith('image')" 
              :src="item.media[0].url" 
              alt="Preview" 
              class="preview-image"
            />
            <div v-else class="media-indicator">
              <i class="ph-file-image"></i>
            </div>
          </div>
        </div>
        <div class="platform-cell">
          <div class="platform-icons">
            <span 
              v-for="platform in item.platforms" 
              :key="platform"
              class="platform-icon"
              :class="platform.toLowerCase()"
            >
              <i :class="`ph-${getPlatformIcon(platform)}`"></i>
            </span>
          </div>
        </div>
        <div class="status-cell">
          <span class="status-badge" :class="item.status.toLowerCase()">
            {{ item.status }}
          </span>
        </div>
        <div class="date-cell">
          {{ formatDate(item.created_at) }}
        </div>
      </div>
      
      <div v-if="contentItems.length === 0" class="empty-state">
        No content items found
      </div>
    </div>

    <!-- Bulk Schedule Dialog -->
    <div v-if="showScheduleDialog" class="dialog-overlay">
      <div class="dialog">
        <div class="dialog-header">
          <h3>Schedule {{ selectedItems.length }} Items</h3>
          <button class="close-btn" @click="showScheduleDialog = false">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>Schedule Type</label>
            <div class="schedule-options">
              <label class="radio-option">
                <input 
                  type="radio" 
                  v-model="scheduleType" 
                  value="same" 
                />
                Same time for all
              </label>
              <label class="radio-option">
                <input 
                  type="radio" 
                  v-model="scheduleType" 
                  value="sequence" 
                />
                Sequential times
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>Start Date & Time</label>
            <div class="datetime-inputs">
              <input 
                type="date" 
                v-model="bulkSchedule.startDate" 
                class="date-input"
              />
              <input 
                type="time" 
                v-model="bulkSchedule.startTime" 
                class="time-input"
              />
            </div>
          </div>
          
          <div v-if="scheduleType === 'sequence'" class="form-group">
            <label>Time Between Posts</label>
            <div class="interval-inputs">
              <input 
                type="number" 
                v-model="bulkSchedule.intervalHours" 
                min="0" 
                max="24"
                class="interval-input"
              />
              <span>hours</span>
              <input 
                type="number" 
                v-model="bulkSchedule.intervalMinutes" 
                min="0" 
                max="59"
                class="interval-input"
              />
              <span>minutes</span>
            </div>
          </div>
          
          <div class="form-group">
            <label>Timezone</label>
            <select v-model="bulkSchedule.timezone" class="timezone-select">
              <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                {{ tz.label }}
              </option>
            </select>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="showScheduleDialog = false">Cancel</button>
          <button class="save-btn" @click="bulkSchedule">Schedule</button>
        </div>
      </div>
    </div>

    <!-- Bulk Publish Dialog -->
    <div v-if="showPublishDialog" class="dialog-overlay">
      <div class="dialog">
        <div class="dialog-header">
          <h3>Publish {{ selectedItems.length }} Items</h3>
          <button class="close-btn" @click="showPublishDialog = false">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>Select Platforms</label>
            <div class="platform-checkboxes">
              <label 
                v-for="platform in availablePlatforms" 
                :key="platform.id"
                class="platform-checkbox"
              >
                <input 
                  type="checkbox" 
                  v-model="selectedPlatforms" 
                  :value="platform.id" 
                />
                <i :class="`ph-${getPlatformIcon(platform.name)}`"></i>
                {{ platform.name }}
              </label>
            </div>
          </div>
          
          <div class="warning-message">
            <i class="ph-warning"></i>
            <span>This will immediately publish all selected items to the chosen platforms.</span>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="showPublishDialog = false">Cancel</button>
          <button class="publish-btn" @click="bulkPublish">Publish Now</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div v-if="showDeleteDialog" class="dialog-overlay">
      <div class="dialog">
        <div class="dialog-header">
          <h3>Delete {{ selectedItems.length }} Items</h3>
          <button class="close-btn" @click="showDeleteDialog = false">×</button>
        </div>
        <div class="dialog-body">
          <div class="warning-message delete-warning">
            <i class="ph-warning"></i>
            <span>Are you sure you want to delete {{ selectedItems.length }} items? This action cannot be undone.</span>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="showDeleteDialog = false">Cancel</button>
          <button class="delete-btn" @click="bulkDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSocialContent } from '../composables/useSocialContent'
import { format, parseISO, addHours, addMinutes, parse } from 'date-fns'
import { useToaster } from '../../shared/composables/toaster'

const { contentList, fetchContentList, updateContent, deleteContent, publishContent } = useSocialContent()
const { showSuccess, showError } = useToaster()

// State
const selectedItems = ref<string[]>([])
const showScheduleDialog = ref(false)
const showPublishDialog = ref(false)
const showDeleteDialog = ref(false)
const scheduleType = ref('same')
const bulkSchedule = ref({
  startDate: format(new Date(), 'yyyy-MM-dd'),
  startTime: format(new Date(), 'HH:mm'),
  intervalHours: 1,
  intervalMinutes: 0,
  timezone: 'UTC'
})
const selectedPlatforms = ref<string[]>([])

// Constants
const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' }
]

const availablePlatforms = [
  { id: 'twitter', name: 'Twitter' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'linkedin', name: 'LinkedIn' }
]

// Computed
const contentItems = computed(() => {
  return contentList.value
})

const isAllSelected = computed(() => {
  return contentItems.value.length > 0 && selectedItems.value.length === contentItems.value.length
})

// Methods
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value = []
  } else {
    selectedItems.value = contentItems.value.map(item => item.id)
  }
}

const toggleSelect = (id: string) => {
  const index = selectedItems.value.indexOf(id)
  if (index === -1) {
    selectedItems.value.push(id)
  } else {
    selectedItems.value.splice(index, 1)
  }
}

const isSelected = (id: string) => {
  return selectedItems.value.includes(id)
}

const viewItem = (item: any) => {
  emit('view-item', item)
}

const truncate = (text: string, length: number) => {
  return text && text.length > length ? text.slice(0, length) + '...' : text
}

const formatDate = (timestamp: any) => {
  if (!timestamp) return ''
  
  // Handle Firestore timestamps
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return format(date, 'MMM d, yyyy')
}

const getPlatformIcon = (platform: string) => {
  const icons = {
    'Twitter': 'twitter-logo',
    'Facebook': 'facebook-logo',
    'Instagram': 'instagram-logo',
    'LinkedIn': 'linkedin-logo',
    'Pinterest': 'pinterest-logo',
    'TikTok': 'tiktok-logo',
    'YouTube': 'youtube-logo'
  }
  
  return icons[platform] || 'share-network'
}

const confirmDelete = () => {
  if (selectedItems.value.length === 0) return
  showDeleteDialog.value = true
}

const bulkSchedule = async () => {
  if (selectedItems.value.length === 0) return
  
  const startDateTime = parse(
    `${bulkSchedule.value.startDate} ${bulkSchedule.value.startTime}`,
    'yyyy-MM-dd HH:mm',
    new Date()
  )
  
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < selectedItems.value.length; i++) {
    const itemId = selectedItems.value[i]
    
    let scheduledTime = new Date(startDateTime)
    
    if (scheduleType.value === 'sequence' && i > 0) {
      scheduledTime = addHours(
        addMinutes(startDateTime, i * bulkSchedule.value.intervalMinutes),
        i * bulkSchedule.value.intervalHours
      )
    }
    
    try {
      await updateContent(itemId, {
        scheduledTime: scheduledTime.toISOString(),
        timezone: bulkSchedule.value.timezone,
        status: 'scheduled'
      })
      
      successCount++
    } catch (error) {
      console.error(`Error scheduling item ${itemId}:`, error)
      errorCount++
    }
  }
  
  if (successCount > 0) {
    showSuccess(`Successfully scheduled ${successCount} items`)
  }
  
  if (errorCount > 0) {
    showError(`Failed to schedule ${errorCount} items`)
  }
  
  showScheduleDialog.value = false
  await fetchContentList()
}

const bulkPublish = async () => {
  if (selectedItems.value.length === 0 || selectedPlatforms.value.length === 0) return
  
  let successCount = 0
  let errorCount = 0
  
  for (const itemId of selectedItems.value) {
    try {
      await publishContent(itemId, selectedPlatforms.value)
      successCount++
    } catch (error) {
      console.error(`Error publishing item ${itemId}:`, error)
      errorCount++
    }
  }
  
  if (successCount > 0) {
    showSuccess(`Successfully published ${successCount} items`)
  }
  
  if (errorCount > 0) {
    showError(`Failed to publish ${errorCount} items`)
  }
  
  showPublishDialog.value = false
  await fetchContentList()
}

const bulkDelete = async () => {
  if (selectedItems.value.length === 0) return
  
  let successCount = 0
  let errorCount = 0
  
  for (const itemId of selectedItems.value) {
    try {
      await deleteContent(itemId)
      successCount++
    } catch (error) {
      console.error(`Error deleting item ${itemId}:`, error)
      errorCount++
    }
  }
  
  if (successCount > 0) {
    showSuccess(`Successfully deleted ${successCount} items`)
  }
  
  if (errorCount > 0) {
    showError(`Failed to delete ${errorCount} items`)
  }
  
  selectedItems.value = []
  showDeleteDialog.value = false
  await fetchContentList()
}

// Event emits
const emit = defineEmits<{
  (e: 'view-item', item: any): void
}>()

// Initial load
onMounted(async () => {
  await fetchContentList()
})
</script>

<style scoped>
.bulk-operations {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.bulk-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bulk-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.select-all.active {
  background: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.action-btn.delete {
  color: #ff4d4f;
}

.content-list {
  width: 100%;
}

.list-header {
  display: grid;
  grid-template-columns: 40px 1fr 120px 100px 120px;
  padding: 0.75rem 1rem;
  background: #f9f9f9;
  border-bottom: 1px solid #eee;
  font-weight: 500;
}

.list-item {
  display: grid;
  grid-template-columns: 40px 1fr 120px 100px 120px;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.list-item:hover {
  background: #f9f9f9;
}

.list-item.selected {
  background: #e6f7ff;
}

.checkbox-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
}

.item-title {
  font-weight: 500;
}

.item-preview {
  display: flex;
  align-items: center;
}

.preview-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.media-indicator {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f1f1;
  border-radius: 4px;
  color: #666;
}

.platform-icons {
  display: flex;
  gap: 0.5rem;
}

.platform-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: white;
  font-size: 0.8rem;
}

.platform-icon.twitter {
  background: #1DA1F2;
}

.platform-icon.facebook {
  background: #4267B2;
}

.platform-icon.instagram {
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
}

.platform-icon.linkedin {
  background: #0077B5;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.status-badge.draft {
  background: #f9f9f9;
  border: 1px solid #ddd;
}

.status-badge.scheduled {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
}

.status-badge.published {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
}

.status-badge.failed {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #999;
}

/* Dialog Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-body {
  padding: 1.5rem;
}

.dialog-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.schedule-options, .platform-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-option, .platform-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.platform-checkbox i {
  margin-right: 0.5rem;
}

.datetime-inputs {
  display: flex;
  gap: 0.5rem;
}

.date-input, .time-input, .timezone-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.date-input {
  flex: 2;
}

.time-input {
  flex: 1;
}

.timezone-select {
  width: 100%;
}

.interval-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.interval-input {
  width: 60px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.warning-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  color: #d48806;
}

.warning-message.delete-warning {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.cancel-btn, .save-btn, .publish-btn, .delete-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn {
  background: #f1f1f1;
  border: 1px solid #ddd;
}

.save-btn {
  background: #4a6cf7;
  border: 1px solid #4a6cf7;
  color: white;
}

.publish-btn {
  background: #52c41a;
  border: 1px solid #52c41a;
  color: white;
}

.delete-btn {
  background: #ff4d4f;
  border: 1px solid #ff4d4f;
  color: white;
}
</style> 