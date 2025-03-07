<template>
  <div class="platform-preview">
    <div class="preview-frame" :class="platform.toLowerCase()">
      <div class="preview-header">
        <div class="profile-info">
          <div class="profile-image"></div>
          <div class="profile-name">Your Profile</div>
          <div class="platform-badge">{{ platformIcon }}</div>
        </div>
        <div class="post-time">Just now</div>
      </div>

      <div class="preview-content">
        <div class="text-content">{{ content.text }}</div>
        
        <div v-if="content.media?.length" class="media-grid" :class="mediaGridClass">
          <div 
            v-for="(media, index) in content.media" 
            :key="index"
            class="media-item"
          >
            <img v-if="media.type.includes('image')" :src="media.url" />
            <video v-else-if="media.type.includes('video')" :src="media.url" controls />
          </div>
        </div>

        <div v-if="content.hashtags?.length" class="hashtags">
          <span 
            v-for="(tag, index) in content.hashtags" 
            :key="index"
            class="hashtag"
          >
            #{{ tag }}
          </span>
        </div>
      </div>

      <div class="preview-footer">
        <div class="engagement-metrics">
          <span class="metric">
            <i class="ph-heart"></i>
            0
          </span>
          <span class="metric">
            <i class="ph-chat-circle"></i>
            0
          </span>
          <span class="metric">
            <i class="ph-share-network"></i>
            0
          </span>
        </div>
      </div>
    </div>

    <div class="platform-warnings" v-if="warnings.length">
      <div 
        v-for="(warning, index) in warnings" 
        :key="index"
        class="warning"
      >
        <i class="ph-warning"></i>
        {{ warning }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SocialPlatform } from '../types'

const props = defineProps<{
  platform: SocialPlatform
  content: {
    text: string
    media?: { type: string; url: string }[]
    hashtags?: string[]
  }
}>()

// Platform-specific icons
const platformIcon = computed(() => {
  const icons = {
    Twitter: '𝕏',
    Facebook: 'f',
    Instagram: '📸',
    LinkedIn: 'in'
  }
  return icons[props.platform] || props.platform[0]
})

// Media grid classes based on platform and number of media items
const mediaGridClass = computed(() => {
  const count = props.content.media?.length || 0
  if (props.platform === 'Instagram') {
    if (count === 1) return 'single'
    if (count === 2) return 'double'
    if (count === 3) return 'triple'
    if (count === 4) return 'quad'
    return 'grid'
  }
  return count === 1 ? 'single' : 'grid'
})

// Platform-specific content warnings
const warnings = computed(() => {
  const warnings = []
  
  // Character limits
  const charLimits = {
    Twitter: 280,
    Facebook: 63206,
    Instagram: 2200,
    LinkedIn: 3000
  }

  if (props.content.text.length > charLimits[props.platform]) {
    warnings.push(`Text exceeds ${props.platform} character limit of ${charLimits[props.platform]}`)
  }

  // Media restrictions
  if (props.platform === 'Instagram') {
    if (props.content.media?.length > 10) {
      warnings.push('Instagram allows maximum of 10 media items per post')
    }
  }

  if (props.platform === 'Twitter') {
    if (props.content.media?.length > 4) {
      warnings.push('Twitter allows maximum of 4 media items per post')
    }
  }

  return warnings
})
</script>

<style scoped>
.platform-preview {
  border-radius: 8px;
  overflow: hidden;
}

.preview-frame {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  padding: 12px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ddd;
}

.profile-name {
  font-weight: 500;
}

.platform-badge {
  font-size: 14px;
  color: #666;
}

.post-time {
  font-size: 12px;
  color: #666;
}

.preview-content {
  padding: 12px;
}

.text-content {
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.media-grid {
  display: grid;
  gap: 2px;
  margin-bottom: 12px;
}

.media-grid.single {
  grid-template-columns: 1fr;
}

.media-grid.double {
  grid-template-columns: 1fr 1fr;
}

.media-grid.triple {
  grid-template-columns: 1fr 1fr;
}

.media-grid.triple .media-item:first-child {
  grid-column: 1 / -1;
}

.media-grid.quad {
  grid-template-columns: 1fr 1fr;
}

.media-grid.grid {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.media-item img,
.media-item video {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.hashtag {
  color: #1da1f2;
  font-size: 14px;
}

.preview-footer {
  padding: 12px;
  border-top: 1px solid #eee;
}

.engagement-metrics {
  display: flex;
  gap: 16px;
}

.metric {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 14px;
}

.platform-warnings {
  margin-top: 12px;
  padding: 12px;
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 4px;
}

.warning {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #856404;
  font-size: 14px;
}

/* Platform-specific styles */
.twitter {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.facebook {
  font-family: Helvetica, Arial, sans-serif;
}

.instagram {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.linkedin {
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Fira Sans", Ubuntu, Oxygen, "Oxygen Sans", Cantarell, "Droid Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Lucida Grande", Helvetica, Arial, sans-serif;
}
</style> 