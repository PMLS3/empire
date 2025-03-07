<template>
  <div class="publishing-rules">
    <div class="rules-header">
      <h3>Publishing Rules & Constraints</h3>
      <button class="add-rule-btn" @click="showAddRuleDialog = true">
        <i class="ph-plus"></i> Add Rule
      </button>
    </div>

    <div class="rules-list">
      <div v-if="rules.length === 0" class="empty-state">
        No publishing rules defined. Add rules to control when and how content is published.
      </div>
      
      <div v-else class="rule-cards">
        <div 
          v-for="(rule, index) in rules" 
          :key="index"
          class="rule-card"
          :class="{ 'disabled': !rule.enabled }"
        >
          <div class="rule-header">
            <div class="rule-title">
              <span class="rule-type-badge" :class="rule.type">{{ formatRuleType(rule.type) }}</span>
              <h4>{{ rule.name }}</h4>
            </div>
            <div class="rule-actions">
              <button 
                class="toggle-btn" 
                :class="{ 'active': rule.enabled }"
                @click="toggleRule(index)"
              >
                {{ rule.enabled ? 'Enabled' : 'Disabled' }}
              </button>
              <button class="edit-btn" @click="editRule(index)">
                <i class="ph-pencil"></i>
              </button>
              <button class="delete-btn" @click="confirmDeleteRule(index)">
                <i class="ph-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="rule-body">
            <div class="rule-description">
              {{ rule.description || generateRuleDescription(rule) }}
            </div>
            
            <div class="rule-details">
              <div v-if="rule.type === 'time_constraint'" class="rule-detail">
                <span class="detail-label">Time Window:</span>
                <span class="detail-value">{{ formatTimeWindow(rule.startTime, rule.endTime) }}</span>
              </div>
              
              <div v-if="rule.type === 'frequency_limit'" class="rule-detail">
                <span class="detail-label">Limit:</span>
                <span class="detail-value">{{ rule.maxPosts }} posts per {{ rule.timeUnit }}</span>
              </div>
              
              <div v-if="rule.type === 'approval_required'" class="rule-detail">
                <span class="detail-label">Approvers:</span>
                <span class="detail-value">{{ formatApprovers(rule.approvers) }}</span>
              </div>
              
              <div v-if="rule.type === 'content_filter'" class="rule-detail">
                <span class="detail-label">Filter:</span>
                <span class="detail-value">{{ formatContentFilter(rule) }}</span>
              </div>
              
              <div v-if="rule.platforms && rule.platforms.length" class="rule-detail">
                <span class="detail-label">Platforms:</span>
                <div class="platform-tags">
                  <span 
                    v-for="platform in rule.platforms" 
                    :key="platform"
                    class="platform-tag"
                  >
                    <i :class="`ph-${getPlatformIcon(platform)}`"></i>
                    {{ platform }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Rule Dialog -->
    <div v-if="showRuleDialog" class="dialog-overlay">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ editingRuleIndex === -1 ? 'Add New Rule' : 'Edit Rule' }}</h3>
          <button class="close-btn" @click="closeRuleDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>Rule Name</label>
            <input 
              type="text" 
              v-model="currentRule.name" 
              class="text-input"
              placeholder="Enter a descriptive name"
            />
          </div>
          
          <div class="form-group">
            <label>Rule Type</label>
            <select 
              v-model="currentRule.type" 
              class="select-input"
              :disabled="editingRuleIndex !== -1"
            >
              <option value="time_constraint">Time Constraint</option>
              <option value="frequency_limit">Frequency Limit</option>
              <option value="approval_required">Approval Required</option>
              <option value="content_filter">Content Filter</option>
            </select>
          </div>
          
          <!-- Time Constraint Fields -->
          <template v-if="currentRule.type === 'time_constraint'">
            <div class="form-group">
              <label>Allowed Publishing Window</label>
              <div class="time-inputs">
                <div class="time-input-group">
                  <label class="small-label">From</label>
                  <input type="time" v-model="currentRule.startTime" class="time-input" />
                </div>
                <div class="time-input-group">
                  <label class="small-label">To</label>
                  <input type="time" v-model="currentRule.endTime" class="time-input" />
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Days of Week</label>
              <div class="weekday-selector">
                <label 
                  v-for="(day, index) in weekDays" 
                  :key="day"
                  class="day-checkbox"
                  :class="{ 'selected': currentRule.days.includes(index) }"
                >
                  <input 
                    type="checkbox" 
                    :value="index" 
                    v-model="currentRule.days"
                    class="hidden-checkbox"
                  />
                  {{ day }}
                </label>
              </div>
            </div>
          </template>
          
          <!-- Frequency Limit Fields -->
          <template v-if="currentRule.type === 'frequency_limit'">
            <div class="form-group">
              <label>Maximum Posts</label>
              <div class="frequency-inputs">
                <input 
                  type="number" 
                  v-model="currentRule.maxPosts" 
                  min="1" 
                  class="number-input"
                />
                <span>posts per</span>
                <select v-model="currentRule.timeUnit" class="select-input">
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                </select>
              </div>
            </div>
          </template>
          
          <!-- Approval Required Fields -->
          <template v-if="currentRule.type === 'approval_required'">
            <div class="form-group">
              <label>Required Approvers</label>
              <div class="approver-list">
                <div 
                  v-for="(approver, index) in currentRule.approvers" 
                  :key="index"
                  class="approver-item"
                >
                  <input 
                    type="text" 
                    v-model="currentRule.approvers[index]" 
                    class="text-input"
                    placeholder="Enter email or username"
                  />
                  <button 
                    class="remove-btn" 
                    @click="currentRule.approvers.splice(index, 1)"
                  >
                    <i class="ph-x"></i>
                  </button>
                </div>
                <button 
                  class="add-approver-btn" 
                  @click="currentRule.approvers.push('')"
                >
                  <i class="ph-plus"></i> Add Approver
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="currentRule.requireAllApprovers" />
                Require approval from all listed approvers
              </label>
            </div>
          </template>
          
          <!-- Content Filter Fields -->
          <template v-if="currentRule.type === 'content_filter'">
            <div class="form-group">
              <label>Filter Type</label>
              <select v-model="currentRule.filterType" class="select-input">
                <option value="keyword">Keyword Filter</option>
                <option value="regex">Regex Pattern</option>
                <option value="sentiment">Sentiment Analysis</option>
              </select>
            </div>
            
            <div v-if="currentRule.filterType === 'keyword'" class="form-group">
              <label>Keywords (one per line)</label>
              <textarea 
                v-model="currentRule.keywords" 
                class="textarea-input"
                placeholder="Enter keywords to filter"
                rows="4"
              ></textarea>
            </div>
            
            <div v-if="currentRule.filterType === 'regex'" class="form-group">
              <label>Regex Pattern</label>
              <input 
                type="text" 
                v-model="currentRule.pattern" 
                class="text-input"
                placeholder="Enter regex pattern"
              />
            </div>
            
            <div v-if="currentRule.filterType === 'sentiment'" class="form-group">
              <label>Minimum Sentiment Score (0-100)</label>
              <input 
                type="number" 
                v-model="currentRule.minSentiment" 
                min="0" 
                max="100"
                class="number-input"
              />
            </div>
            
            <div class="form-group">
              <label>Action on Match</label>
              <select v-model="currentRule.action" class="select-input">
                <option value="block">Block Publishing</option>
                <option value="warn">Show Warning</option>
                <option value="require_approval">Require Approval</option>
              </select>
            </div>
          </template>
          
          <div class="form-group">
            <label>Apply to Platforms</label>
            <div class="platform-checkboxes">
              <label 
                v-for="platform in availablePlatforms" 
                :key="platform"
                class="platform-checkbox"
              >
                <input 
                  type="checkbox" 
                  v-model="currentRule.platforms" 
                  :value="platform" 
                />
                <i :class="`ph-${getPlatformIcon(platform)}`"></i>
                {{ platform }}
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="currentRule.enabled" />
              Enable this rule
            </label>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="closeRuleDialog">Cancel</button>
          <button class="save-btn" @click="saveRule">Save Rule</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div v-if="showDeleteDialog" class="dialog-overlay">
      <div class="dialog">
        <div class="dialog-header">
          <h3>Delete Rule</h3>
          <button class="close-btn" @click="showDeleteDialog = false">×</button>
        </div>
        <div class="dialog-body">
          <div class="warning-message">
            <i class="ph-warning"></i>
            <span>Are you sure you want to delete this rule? This action cannot be undone.</span>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="showDeleteDialog = false">Cancel</button>
          <button class="delete-btn" @click="deleteRule">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useToaster } from '../../shared/composables/toaster'

const { showSuccess, showError } = useToaster()

// State
const rules = ref([])
const showRuleDialog = ref(false)
const showDeleteDialog = ref(false)
const editingRuleIndex = ref(-1)
const deletingRuleIndex = ref(-1)

// Default rule template
const defaultRule = {
  name: '',
  type: 'time_constraint',
  enabled: true,
  platforms: [],
  // Time constraint fields
  startTime: '09:00',
  endTime: '17:00',
  days: [1, 2, 3, 4, 5], // Mon-Fri
  // Frequency limit fields
  maxPosts: 3,
  timeUnit: 'day',
  // Approval fields
  approvers: [''],
  requireAllApprovers: true,
  // Content filter fields
  filterType: 'keyword',
  keywords: '',
  pattern: '',
  minSentiment: 70,
  action: 'warn'
}

const currentRule = reactive({ ...defaultRule })

// Constants
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const availablePlatforms = ['Twitter', 'Facebook', 'Instagram', 'LinkedIn']

// Methods
const showAddRuleDialog = () => {
  // Reset to default values
  Object.assign(currentRule, defaultRule)
  editingRuleIndex.value = -1
  showRuleDialog.value = true
}

const editRule = (index) => {
  // Clone the rule to edit
  Object.assign(currentRule, JSON.parse(JSON.stringify(rules.value[index])))
  editingRuleIndex.value = index
  showRuleDialog.value = true
}

const closeRuleDialog = () => {
  showRuleDialog.value = false
}

const saveRule = () => {
  // Validate rule
  if (!currentRule.name.trim()) {
    showError('Please enter a rule name')
    return
  }
  
  // Create a copy of the current rule
  const ruleCopy = JSON.parse(JSON.stringify(currentRule))
  
  if (editingRuleIndex.value === -1) {
    // Add new rule
    rules.value.push(ruleCopy)
    showSuccess('Rule added successfully')
  } else {
    // Update existing rule
    rules.value[editingRuleIndex.value] = ruleCopy
    showSuccess('Rule updated successfully')
  }
  
  // Save rules to backend
  saveRulesToBackend()
  
  // Close dialog
  closeRuleDialog()
}

const confirmDeleteRule = (index) => {
  deletingRuleIndex.value = index
  showDeleteDialog.value = true
}

const deleteRule = () => {
  if (deletingRuleIndex.value > -1) {
    rules.value.splice(deletingRuleIndex.value, 1)
    showSuccess('Rule deleted successfully')
    
    // Save rules to backend
    saveRulesToBackend()
    
    showDeleteDialog.value = false
  }
}

const toggleRule = (index) => {
  rules.value[index].enabled = !rules.value[index].enabled
  
  // Save rules to backend
  saveRulesToBackend()
  
  showSuccess(`Rule ${rules.value[index].enabled ? 'enabled' : 'disabled'}`)
}

const saveRulesToBackend = async () => {
  try {
    // TODO: Implement actual backend save
    // For now, just save to localStorage for demo
    localStorage.setItem('publishingRules', JSON.stringify(rules.value))
  } catch (error) {
    console.error('Error saving rules:', error)
    showError('Failed to save rules')
  }
}

const loadRulesFromBackend = async () => {
  try {
    // TODO: Implement actual backend load
    // For now, just load from localStorage for demo
    const savedRules = localStorage.getItem('publishingRules')
    if (savedRules) {
      rules.value = JSON.parse(savedRules)
    }
  } catch (error) {
    console.error('Error loading rules:', error)
    showError('Failed to load rules')
  }
}

const formatRuleType = (type) => {
  const types = {
    'time_constraint': 'Time Window',
    'frequency_limit': 'Frequency Limit',
    'approval_required': 'Approval Required',
    'content_filter': 'Content Filter'
  }
  
  return types[type] || type
}

const formatTimeWindow = (start, end) => {
  return `${start} - ${end}`
}

const formatApprovers = (approvers) => {
  if (!approvers || approvers.length === 0) return 'None'
  
  return approvers.join(', ')
}

const formatContentFilter = (rule) => {
  if (rule.filterType === 'keyword') {
    return `Keywords: ${rule.keywords.split('\n').length} words`
  } else if (rule.filterType === 'regex') {
    return `Pattern: ${rule.pattern}`
  } else if (rule.filterType === 'sentiment') {
    return `Min. sentiment: ${rule.minSentiment}%`
  }
  
  return rule.filterType
}

const generateRuleDescription = (rule) => {
  if (rule.type === 'time_constraint') {
    const days = rule.days.map(d => weekDays[d]).join(', ')
    return `Allows publishing only between ${rule.startTime} and ${rule.endTime} on ${days}.`
  } else if (rule.type === 'frequency_limit') {
    return `Limits publishing to ${rule.maxPosts} posts per ${rule.timeUnit}.`
  } else if (rule.type === 'approval_required') {
    const approvalType = rule.requireAllApprovers ? 'all' : 'any'
    return `Requires approval from ${approvalType} of the designated approvers before publishing.`
  } else if (rule.type === 'content_filter') {
    let action = ''
    if (rule.action === 'block') action = 'blocks publishing'
    else if (rule.action === 'warn') action = 'shows a warning'
    else if (rule.action === 'require_approval') action = 'requires approval'
    
    if (rule.filterType === 'keyword') {
      return `Scans content for specific keywords and ${action}.`
    } else if (rule.filterType === 'regex') {
      return `Matches content against regex pattern and ${action}.`
    } else if (rule.filterType === 'sentiment') {
      return `Analyzes content sentiment and ${action} if below threshold.`
    }
  }
  
  return 'Custom publishing rule'
}

const getPlatformIcon = (platform) => {
  const icons = {
    'Twitter': 'twitter-logo',
    'Facebook': 'facebook-logo',
    'Instagram': 'instagram-logo',
    'LinkedIn': 'linkedin-logo'
  }
  
  return icons[platform] || 'share-network'
}

// Load rules on mount
onMounted(async () => {
  await loadRulesFromBackend()
})
</script>

<style scoped>
.publishing-rules {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.rules-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-rule-btn {
  padding: 0.5rem 1rem;
  background: #4a6cf7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rules-list {
  padding: 1rem;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #999;
  background: #f9f9f9;
  border-radius: 4px;
}

.rule-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.rule-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.rule-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.rule-card.disabled {
  opacity: 0.6;
}

.rule-header {
  padding: 1rem;
  background: #f9f9f9;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.rule-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rule-title h4 {
  margin: 0;
}

.rule-type-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: bold;
}

.rule-type-badge.time_constraint {
  background: #e6f7ff;
  color: #1890ff;
}

.rule-type-badge.frequency_limit {
  background: #f6ffed;
  color: #52c41a;
}

.rule-type-badge.approval_required {
  background: #fff7e6;
  color: #fa8c16;
}

.rule-type-badge.content_filter {
  background: #f9f0ff;
  color: #722ed1;
}

.rule-actions {
  display: flex;
  gap: 0.5rem;
}

.toggle-btn {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: #f1f1f1;
  border: 1px solid #ddd;
  font-size: 0.8rem;
  cursor: pointer;
}

.toggle-btn.active {
  background: #f6ffed;
  border-color: #b7eb8f;
  color: #52c41a;
}

.edit-btn, .delete-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #f1f1f1;
  border: 1px solid #ddd;
  cursor: pointer;
}

.delete-btn {
  color: #ff4d4f;
}

.rule-body {
  padding: 1rem;
}

.rule-description {
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.rule-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rule-detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.8rem;
  color: #999;
}

.detail-value {
  font-weight: 500;
}

.platform-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.platform-tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #f1f1f1;
  border-radius: 4px;
  font-size: 0.8rem;
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
  width: 600px;
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

.small-label {
  font-size: 0.8rem;
  color: #666;
}

.text-input, .select-input, .textarea-input, .number-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.textarea-input {
  resize: vertical;
}

.time-inputs {
  display: flex;
  gap: 1rem;
}

.time-input-group {
  flex: 1;
}

.time-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.weekday-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.day-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.day-checkbox.selected {
  background: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.hidden-checkbox {
  display: none;
}

.frequency-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.number-input {
  width: 80px;
}

.approver-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.approver-item {
  display: flex;
  gap: 0.5rem;
}

.remove-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.add-approver-btn {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: none;
  border: 1px dashed #ddd;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.platform-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.platform-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.warning-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #ff4d4f;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.cancel-btn, .save-btn, .delete-btn {
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

.delete-btn {
  background: #ff4d4f;
  border: 1px solid #ff4d4f;
  color: white;
}
</style> 