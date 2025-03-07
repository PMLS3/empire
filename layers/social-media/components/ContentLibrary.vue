<template>
  <div class="content-library">
    <div class="library-header">
      <div class="header-left">
        <h2>Content Library</h2>
        <div class="view-options">
          <button 
            v-for="view in viewOptions" 
            :key="view.id"
            :class="['view-btn', { active: currentView === view.id }]"
            @click="currentView = view.id"
          >
            <i :class="view.icon"></i>
            {{ view.label }}
          </button>
        </div>
      </div>
      <div class="header-right">
        <div class="search-bar">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search content..."
          >
          <button class="filter-btn" @click="showFilters = !showFilters">
            <i class="ph-funnel"></i>
            Filters
          </button>
        </div>
        <button class="primary-btn" @click="openUploadModal">
          <i class="ph-plus"></i>
          Add Content
        </button>
      </div>
    </div>

    <!-- Filters Panel -->
    <div v-if="showFilters" class="filters-panel">
      <div class="filter-group">
        <label>Content Type</label>
        <div class="checkbox-group">
          <label v-for="type in contentTypes" :key="type.id">
            <input 
              type="checkbox"
              v-model="filters.types"
              :value="type.id"
            >
            {{ type.label }}
          </label>
        </div>
      </div>
      <div class="filter-group">
        <label>Date Range</label>
        <div class="date-inputs">
          <input 
            type="date"
            v-model="filters.dateFrom"
          >
          <span>to</span>
          <input 
            type="date"
            v-model="filters.dateTo"
          >
        </div>
      </div>
      <div class="filter-group">
        <label>Tags</label>
        <div class="tag-select">
          <input 
            v-model="tagInput"
            type="text"
            placeholder="Add tags..."
            @keydown.enter="addTag"
          >
          <div class="selected-tags">
            <span 
              v-for="tag in filters.tags" 
              :key="tag"
              class="tag"
            >
              {{ tag }}
              <button @click="removeTag(tag)">×</button>
            </span>
          </div>
        </div>
      </div>
      <div class="filter-actions">
        <button @click="resetFilters">Reset</button>
        <button class="apply-btn" @click="applyFilters">Apply Filters</button>
      </div>
    </div>

    <!-- Grid View -->
    <div v-if="currentView === 'grid'" class="content-grid">
      <div 
        v-for="item in filteredContent" 
        :key="item.id"
        class="content-card"
        @click="selectItem(item)"
      >
        <div class="card-preview">
          <img 
            v-if="item.type === 'image'"
            :src="item.url"
            :alt="item.name"
          >
          <video 
            v-else-if="item.type === 'video'"
            :src="item.url"
            controls
          ></video>
          <div 
            v-else
            class="file-preview"
          >
            <i class="ph-file-text"></i>
          </div>
        </div>
        <div class="card-info">
          <div class="card-name">{{ item.name }}</div>
          <div class="card-meta">
            <span>{{ formatDate(item.createdAt) }}</span>
            <span>{{ formatFileSize(item.size) }}</span>
          </div>
          <div class="card-tags">
            <span 
              v-for="tag in item.tags" 
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="content-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Size</th>
            <th>Created</th>
            <th>Tags</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in filteredContent" 
            :key="item.id"
          >
            <td>
              <div class="item-name">
                <i :class="getItemIcon(item.type)"></i>
                {{ item.name }}
              </div>
            </td>
            <td>{{ item.type }}</td>
            <td>{{ formatFileSize(item.size) }}</td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>
              <div class="tag-list">
                <span 
                  v-for="tag in item.tags" 
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </td>
            <td>
              <div class="item-actions">
                <button @click="editItem(item)">
                  <i class="ph-pencil"></i>
                </button>
                <button @click="deleteItem(item)">
                  <i class="ph-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Upload Modal -->
    <Modal v-if="showUploadModal" @close="closeUploadModal">
      <div class="upload-modal">
        <h3>Add Content</h3>
        <div class="upload-area">
          <div 
            class="dropzone"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <i class="ph-upload"></i>
            <p>Drag files here or click to upload</p>
            <input 
              type="file"
              multiple
              @change="handleFileSelect"
            >
          </div>
        </div>
        <div v-if="uploadQueue.length" class="upload-queue">
          <div 
            v-for="file in uploadQueue" 
            :key="file.name"
            class="upload-item"
          >
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <div class="upload-progress">
              <div 
                class="progress-bar"
                :style="{ width: file.progress + '%' }"
              ></div>
            </div>
          </div>
        </div>
        <div class="upload-actions">
          <button @click="closeUploadModal">Cancel</button>
          <button 
            class="upload-btn"
            @click="uploadFiles"
            :disabled="!uploadQueue.length"
          >
            Upload
          </button>
        </div>
      </div>
    </Modal>

    <!-- Edit Modal -->
    <Modal v-if="selectedItem" @close="closeEditModal">
      <div class="edit-modal">
        <h3>Edit Content</h3>
        <div class="form-group">
          <label>Name</label>
          <input 
            v-model="selectedItem.name"
            type="text"
          >
        </div>
        <div class="form-group">
          <label>Tags</label>
          <div class="tag-input">
            <input 
              v-model="tagInput"
              type="text"
              placeholder="Add tags..."
              @keydown.enter="addTagToItem"
            >
            <div class="selected-tags">
              <span 
                v-for="tag in selectedItem.tags" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
                <button @click="removeTagFromItem(tag)">×</button>
              </span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeEditModal">Cancel</button>
          <button 
            class="save-btn"
            @click="saveItem"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUploads } from '../../shared/composables/useUploads'
import { format } from 'date-fns'

const { upload, deleteUpload } = useUploads()

// State
const currentView = ref('grid')
const showFilters = ref(false)
const showUploadModal = ref(false)
const selectedItem = ref(null)
const searchQuery = ref('')
const tagInput = ref('')
const uploadQueue = ref([])

const filters = ref({
  types: [],
  dateFrom: '',
  dateTo: '',
  tags: []
})

// View options
const viewOptions = [
  { id: 'grid', label: 'Grid', icon: 'ph-grid-four' },
  { id: 'list', label: 'List', icon: 'ph-list' }
]

// Content types
const contentTypes = [
  { id: 'image', label: 'Images' },
  { id: 'video', label: 'Videos' },
  { id: 'document', label: 'Documents' }
]

// Methods
const formatDate = (date: string) => {
  return format(new Date(date), 'MMM d, yyyy')
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getItemIcon = (type: string) => {
  switch (type) {
    case 'image':
      return 'ph-image'
    case 'video':
      return 'ph-video'
    default:
      return 'ph-file-text'
  }
}

const addTag = () => {
  if (!tagInput.value.trim()) return
  if (!filters.value.tags.includes(tagInput.value)) {
    filters.value.tags.push(tagInput.value)
  }
  tagInput.value = ''
}

const removeTag = (tag: string) => {
  filters.value.tags = filters.value.tags.filter(t => t !== tag)
}

const addTagToItem = () => {
  if (!tagInput.value.trim() || !selectedItem.value) return
  if (!selectedItem.value.tags.includes(tagInput.value)) {
    selectedItem.value.tags.push(tagInput.value)
  }
  tagInput.value = ''
}

const removeTagFromItem = (tag: string) => {
  if (!selectedItem.value) return
  selectedItem.value.tags = selectedItem.value.tags.filter(t => t !== tag)
}

const resetFilters = () => {
  filters.value = {
    types: [],
    dateFrom: '',
    dateTo: '',
    tags: []
  }
}

const applyFilters = () => {
  showFilters.value = false
  // Filtering is handled by the computed property
}

const handleDrop = (event: DragEvent) => {
  const files = Array.from(event.dataTransfer?.files || [])
  addToUploadQueue(files)
}

const handleFileSelect = (event: Event) => {
  const files = Array.from((event.target as HTMLInputElement).files || [])
  addToUploadQueue(files)
}

const addToUploadQueue = (files: File[]) => {
  files.forEach(file => {
    uploadQueue.value.push({
      file,
      name: file.name,
      size: file.size,
      progress: 0
    })
  })
}

const uploadFiles = async () => {
  try {
    await Promise.all(
      uploadQueue.value.map(async (item) => {
        const result = await upload([item.file])
        // Update progress
        item.progress = 100
        return result
      })
    )
    closeUploadModal()
  } catch (error) {
    console.error('Upload failed:', error)
  }
}

const selectItem = (item: any) => {
  selectedItem.value = { ...item }
}

const editItem = (item: any) => {
  selectedItem.value = { ...item }
}

const deleteItem = async (item: any) => {
  if (!confirm('Are you sure you want to delete this item?')) return
  
  try {
    await deleteUpload(item.id)
    // Remove from list
    filteredContent.value = filteredContent.value.filter(i => i.id !== item.id)
  } catch (error) {
    console.error('Delete failed:', error)
  }
}

const saveItem = async () => {
  if (!selectedItem.value) return

  try {
    // Save changes
    closeEditModal()
  } catch (error) {
    console.error('Save failed:', error)
  }
}

const openUploadModal = () => {
  showUploadModal.value = true
  uploadQueue.value = []
}

const closeUploadModal = () => {
  showUploadModal.value = false
  uploadQueue.value = []
}

const closeEditModal = () => {
  selectedItem.value = null
}

// Computed
const filteredContent = computed(() => {
  let content = [] // This should be your content list from a store or prop

  // Apply search
  if (searchQuery.value) {
    content = content.filter(item => 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Apply type filters
  if (filters.value.types.length) {
    content = content.filter(item => 
      filters.value.types.includes(item.type)
    )
  }

  // Apply date filters
  if (filters.value.dateFrom) {
    content = content.filter(item => 
      new Date(item.createdAt) >= new Date(filters.value.dateFrom)
    )
  }
  if (filters.value.dateTo) {
    content = content.filter(item => 
      new Date(item.createdAt) <= new Date(filters.value.dateTo)
    )
  }

  // Apply tag filters
  if (filters.value.tags.length) {
    content = content.filter(item => 
      filters.value.tags.every(tag => item.tags.includes(tag))
    )
  }

  return content
})
</script>

<style scoped>
.content-library {
  padding: 2rem;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.view-options {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.view-btn.active {
  background: #007bff;
  color: white;
  border-color: #0056b3;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
}

.search-bar input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 300px;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Filters Panel */
.filters-panel {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tag-select {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 0.9rem;
}

.tag button {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  color: #666;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

/* Grid View */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.content-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.content-card:hover {
  transform: translateY(-2px);
}

.card-preview {
  aspect-ratio: 16/9;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-preview img,
.card-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-preview {
  font-size: 2rem;
  color: #666;
}

.card-info {
  padding: 1rem;
}

.card-name {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

/* List View */
.content-list table {
  width: 100%;
  border-collapse: collapse;
}

.content-list th,
.content-list td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.item-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

/* Upload Modal */
.upload-modal {
  padding: 2rem;
}

.dropzone {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
}

.dropzone i {
  font-size: 2rem;
  color: #666;
  margin-bottom: 1rem;
}

.upload-queue {
  margin-top: 1.5rem;
}

.upload-item {
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.file-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.upload-progress {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #007bff;
  transition: width 0.3s;
}

/* Edit Modal */
.edit-modal {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.tag-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

/* Buttons */
button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.upload-btn,
.save-btn {
  background: #007bff;
  color: white;
  border-color: #0056b3;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 