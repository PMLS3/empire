<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCreatorData } from '../../composables/useCreatorData';

const props = defineProps<{
  projectId: string;
}>();

const { getDataById } = useCreatorData();

// States
const loading = ref(true);
const error = ref<string | null>(null);
const versionHistory = ref<Array<{
  id: string;
  version: number;
  timestamp: string;
  user_id: string;
  user_name: string;
  changes: Array<{
    type: 'script' | 'audio' | 'visual' | 'settings' | 'metadata';
    description: string;
  }>;
  notes?: string;
}>>([]);

// Expanded versions
const expandedVersions = ref<Set<string>>(new Set());

// Load version history
onMounted(async () => {
  await loadVersionHistory();
});

const loadVersionHistory = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // In a real implementation, we would fetch version history from a subcollection
    // For now, we'll mock the data
    const mockVersions = [
      {
        id: 'version-1',
        version: 1.0,
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
        user_id: 'user1',
        user_name: 'Alex Johnson',
        changes: [
          { type: 'settings', description: 'Project created' }
        ],
        notes: 'Initial project setup'
      },
      {
        id: 'version-2',
        version: 1.1,
        timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 days ago
        user_id: 'user1',
        user_name: 'Alex Johnson',
        changes: [
          { type: 'script', description: 'Added initial script draft' }
        ],
        notes: 'First draft of the script outline'
      },
      {
        id: 'version-3',
        version: 1.2,
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
        user_id: 'user2',
        user_name: 'Jamie Smith',
        changes: [
          { type: 'script', description: 'Script revisions' },
          { type: 'metadata', description: 'Updated tags and categories' }
        ],
        notes: 'Refined the script and added more specific tags'
      },
      {
        id: 'version-4',
        version: 1.3,
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
        user_id: 'user3',
        user_name: 'Taylor Reed',
        changes: [
          { type: 'audio', description: 'Added voiceover for intro' },
          { type: 'audio', description: 'Added background music' }
        ]
      },
      {
        id: 'version-5',
        version: 1.4,
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
        user_id: 'user1',
        user_name: 'Alex Johnson',
        changes: [
          { type: 'visual', description: 'Added intro graphics' },
          { type: 'visual', description: 'Added main visuals' },
          { type: 'settings', description: 'Adjusted video timing' }
        ],
        notes: 'Major visual update and timing adjustments'
      }
    ];
    
    // Sort by timestamp (newest first)
    versionHistory.value = mockVersions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Automatically expand the most recent version
    if (versionHistory.value.length > 0) {
      expandedVersions.value.add(versionHistory.value[0].id);
    }
  } catch (err) {
    console.error('Error loading version history:', err);
    error.value = 'Failed to load version history';
  } finally {
    loading.value = false;
  }
};

// Toggle expanded state for a version
const toggleVersionExpansion = (versionId: string) => {
  if (expandedVersions.value.has(versionId)) {
    expandedVersions.value.delete(versionId);
  } else {
    expandedVersions.value.add(versionId);
  }
};

// Check if a version is expanded
const isVersionExpanded = (versionId: string) => {
  return expandedVersions.value.has(versionId);
};

// Format date to relative time
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    }
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Get icon for change type
const getChangeTypeIcon = (type: string) => {
  switch (type) {
    case 'script':
      return 'ph:file-text-duotone';
    case 'audio':
      return 'ph:speaker-high-duotone';
    case 'visual':
      return 'ph:image-duotone';
    case 'settings':
      return 'ph:gear-duotone';
    case 'metadata':
      return 'ph:tag-duotone';
    default:
      return 'ph:info-duotone';
  }
};

// Get formatted date and time
const getFormattedDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};
</script>

<template>
  <BaseCard>
    <div class="p-5">
      <BaseHeading as="h3" size="md" weight="medium" class="mb-4">
        Version History
      </BaseHeading>
      
      <!-- Loading state -->
      <BasePlaceholderPage
        v-if="loading"
        title="Loading version history"
        subtitle="Please wait while we load the version history"
        :ui="{ wrapper: 'py-8' }"
      />
      
      <!-- Error state -->
      <BaseMessage v-else-if="error" type="danger" class="mb-4">
        {{ error }}
      </BaseMessage>
      
      <!-- Version history list -->
      <div v-else>
        <div v-if="versionHistory.length === 0" class="text-center py-8">
          <Icon name="ph:clock-clockwise-duotone" class="size-12 text-muted-400 mx-auto mb-2" />
          <BaseText class="text-muted-400">
            No version history available yet.
          </BaseText>
        </div>
        
        <div v-else class="space-y-4">
          <BaseCard
            v-for="version in versionHistory"
            :key="version.id"
            class="border-muted-200 dark:border-muted-700 border"
          >
            <!-- Version header (always visible) -->
            <div 
              class="p-4 flex items-center justify-between cursor-pointer"
              @click="toggleVersionExpansion(version.id)"
            >
              <div class="flex items-center gap-3">
                <div class="bg-primary-100 dark:bg-primary-500/20 text-primary-500 p-2 rounded-lg">
                  <Icon name="ph:git-branch-duotone" class="size-5" />
                </div>
                <div>
                  <BaseHeading as="h4" size="sm" weight="medium">
                    Version {{ version.version.toFixed(1) }}
                  </BaseHeading>
                  <BaseText size="xs" class="text-muted-500">
                    {{ formatDate(version.timestamp) }} by {{ version.user_name }}
                  </BaseText>
                </div>
              </div>
              
              <Icon 
                :name="isVersionExpanded(version.id) ? 'ph:caret-up-duotone' : 'ph:caret-down-duotone'" 
                class="size-5 text-muted-400"
              />
            </div>
            
            <!-- Version details (expandable) -->
            <div v-if="isVersionExpanded(version.id)" class="p-4 pt-0 border-t border-muted-200 dark:border-muted-700">
              <div class="py-4 space-y-5">
                <!-- Changes list -->
                <div>
                  <BaseHeading as="h5" size="xs" weight="medium" class="mb-2">
                    Changes
                  </BaseHeading>
                  <div class="space-y-2">
                    <div 
                      v-for="(change, index) in version.changes" 
                      :key="`${version.id}-change-${index}`"
                      class="flex items-center gap-2"
                    >
                      <div class="flex items-center gap-2">
                        <Icon :name="getChangeTypeIcon(change.type)" class="size-4 text-primary-500" />
                        <BaseText size="sm">
                          <span class="capitalize text-muted-500">{{ change.type }}: </span>
                          <span>{{ change.description }}</span>
                        </BaseText>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Notes (if available) -->
                <div v-if="version.notes">
                  <BaseHeading as="h5" size="xs" weight="medium" class="mb-2">
                    Notes
                  </BaseHeading>
                  <BaseText size="sm">{{ version.notes }}</BaseText>
                </div>
                
                <!-- Timestamp -->
                <div>
                  <BaseText size="xs" class="text-muted-500">
                    Timestamp: {{ getFormattedDateTime(version.timestamp) }}
                  </BaseText>
                </div>
                
                <!-- Version actions -->
                <div class="flex justify-end gap-2">
                  <BaseButton color="default" size="sm">
                    <Icon name="ph:clock-counter-clockwise-duotone" class="me-1 size-4" />
                    Restore Version
                  </BaseButton>
                  <BaseButton color="default" size="sm">
                    <Icon name="ph:eye-duotone" class="me-1 size-4" />
                    View Details
                  </BaseButton>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
