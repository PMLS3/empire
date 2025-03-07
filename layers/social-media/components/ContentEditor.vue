<template>
  <div class="content-editor">
    <div class="editor-header">
      <h2>{{ isEditing ? 'Edit Post' : 'Create New Post' }}</h2>
      <div class="platform-toggles">
        <button 
          v-for="platform in availablePlatforms" 
          :key="platform"
          :class="['platform-btn', { active: selectedPlatforms.includes(platform) }]"
          @click="togglePlatform(platform)"
        >
          {{ platform }}
        </button>
      </div>
    </div>

    <div class="editor-main">
      <div class="editor-content">
        <div class="form-group">
          <label>Content</label>
          <textarea 
            v-model="content.text" 
            placeholder="What's on your mind?"
            @input="updatePlatformPreviews"
          ></textarea>
        </div>

        <div class="media-section">
          <button @click="openMediaLibrary">Add Media</button>
          <div v-if="content.media.length" class="media-preview">
            <div v-for="(media, index) in content.media" :key="index" class="media-item">
              <img v-if="media.type.includes('image')" :src="media.url" />
              <video v-else-if="media.type.includes('video')" :src="media.url" controls />
              <button class="remove-media" @click="removeMedia(index)">×</button>
            </div>
          </div>
        </div>

        <div class="ai-tools">
          <button @click="generateAIContent">Generate with AI</button>
          <button @click="optimizeContent">Optimize Content</button>
          <button @click="suggestHashtags">Suggest Hashtags</button>
        </div>
      </div>

      <div class="platform-previews">
        <div 
          v-for="platform in selectedPlatforms" 
          :key="platform"
          class="platform-preview"
        >
          <h3>{{ platform }} Preview</h3>
          <PlatformPreview 
            :platform="platform" 
            :content="platformContent[platform]"
          />
        </div>
      </div>
    </div>

    <div class="editor-footer">
      <div class="scheduling">
        <label>
          <input 
            type="checkbox" 
            v-model="isScheduled"
          > Schedule for later
        </label>
        <div v-if="isScheduled" class="schedule-inputs">
          <input 
            type="datetime-local" 
            v-model="scheduleDate"
          >
          <select v-model="timezone">
            <option value="UTC">UTC</option>
            <!-- Add more timezone options -->
          </select>
        </div>
      </div>

      <div class="actions">
        <button @click="saveDraft">Save Draft</button>
        <button 
          v-if="isScheduled" 
          @click="schedule" 
          :disabled="!canSchedule"
        >
          Schedule
        </button>
        <button 
          v-else 
          @click="publish" 
          :disabled="!canPublish"
        >
          Publish Now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSocialContent } from '../composables/useSocialContent'
import { useUploads } from '../../shared/composables/useUploads'
import { useAIGeneration } from '../composables/useAIGeneration'
import type { SocialPlatform, ContentType } from '../types'

const props = defineProps<{
  initialContent?: any
}>()

const { createContent, updateContent } = useSocialContent()
const { upload } = useUploads()
const { generateContent, optimizeForPlatform, generateHashtags } = useAIGeneration()

// State
const content = ref({
  text: '',
  media: [],
  hashtags: [],
  ...props.initialContent
})

const isEditing = computed(() => !!props.initialContent)
const selectedPlatforms = ref<SocialPlatform[]>([])
const isScheduled = ref(false)
const scheduleDate = ref('')
const timezone = ref('UTC')

// Platform-specific content
const platformContent = computed(() => {
  const content = {}
  selectedPlatforms.value.forEach(platform => {
    content[platform] = optimizeForPlatform(content.value.text, platform)
  })
  return content
})

// Available platforms
const availablePlatforms = [
  'Twitter',
  'Facebook',
  'Instagram',
  'LinkedIn'
]

// Methods
const togglePlatform = (platform: SocialPlatform) => {
  const index = selectedPlatforms.value.indexOf(platform)
  if (index === -1) {
    selectedPlatforms.value.push(platform)
  } else {
    selectedPlatforms.value.splice(index, 1)
  }
  updatePlatformPreviews()
}

const updatePlatformPreviews = () => {
  // Update platform-specific content based on main content
  selectedPlatforms.value.forEach(platform => {
    platformContent.value[platform] = optimizeForPlatform(content.value.text, platform)
  })
}

const openMediaLibrary = async () => {
  // Implement media library integration
}

const removeMedia = (index: number) => {
  content.value.media.splice(index, 1)
}

const generateAIContent = async () => {
  const generated = await generateContent({
    prompt: content.value.text,
    platforms: selectedPlatforms.value
  })
  content.value.text = generated.text
  updatePlatformPreviews()
}

const optimizeContent = async () => {
  const optimized = await optimizeForPlatform(content.value.text, selectedPlatforms.value[0])
  content.value.text = optimized
  updatePlatformPreviews()
}

const suggestHashtags = async () => {
  const hashtags = await generateHashtags(content.value.text)
  content.value.hashtags = hashtags
}

const saveDraft = async () => {
  const contentData = {
    text: content.value.text,
    media: content.value.media,
    hashtags: content.value.hashtags,
    platforms: selectedPlatforms.value,
    type: 'post' as ContentType
  }

  if (isEditing.value) {
    await updateContent(props.initialContent.id, contentData)
  } else {
    await createContent(contentData)
  }
}

const publish = async () => {
  await saveDraft()
  // Implement publish logic
}

const schedule = async () => {
  await saveDraft()
  // Implement schedule logic
}

// Validation
const canPublish = computed(() => {
  return content.value.text.length > 0 && selectedPlatforms.value.length > 0
})

const canSchedule = computed(() => {
  return canPublish.value && scheduleDate.value
})
</script>

<style scoped>
.content-editor {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.platform-toggles {
  display: flex;
  gap: 0.5rem;
}

.platform-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.platform-btn.active {
  background: #007bff;
  color: white;
  border-color: #0056b3;
}

.editor-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.editor-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

textarea {
  width: 100%;
  min-height: 150px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.media-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.media-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

.media-item {
  position: relative;
}

.media-item img,
.media-item video {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.remove-media {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 1px solid #ddd;
  cursor: pointer;
}

.ai-tools {
  display: flex;
  gap: 0.5rem;
}

.platform-previews {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.platform-preview {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.scheduling {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.schedule-inputs {
  display: flex;
  gap: 0.5rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #007bff;
  color: white;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style> 