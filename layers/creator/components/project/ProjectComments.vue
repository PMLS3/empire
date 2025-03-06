<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCreatorData } from '../../composables/useCreatorData';
import { useAuth } from '../../../auth/composables/auth';
import { useToaster } from '../../../shared/composables/toaster';

const props = defineProps<{
  projectId: string;
}>();

const { currentUser } = useAuth();
const { getDataById, createData, updateData } = useCreatorData();
const toaster = useToaster();

// States
const comments = ref<Array<{
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  timestamp: Date | string;
  parent_id?: string;
  mentions?: string[];
  read_by?: string[];
}>>([]);

const newComment = ref('');
const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const replyingTo = ref<string | null>(null);
const showReplies = ref<Record<string, boolean>>({});

// Load comments
onMounted(async () => {
  await loadComments();
});

const loadComments = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // In a real implementation, we would fetch comments from a subcollection
    // For now, we'll mock the data
    const mockComments = [
      {
        id: 'comment1',
        user_id: 'user1',
        user_name: 'Alex Johnson',
        user_avatar: 'https://i.pravatar.cc/150?u=user1',
        content: 'I like the overall design, but can we adjust the intro timing?',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        read_by: ['user1', 'user2'],
      },
      {
        id: 'comment2',
        user_id: 'user2',
        user_name: 'Jamie Smith',
        user_avatar: 'https://i.pravatar.cc/150?u=user2',
        content: 'The script needs more emphasis on our key points.',
        timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        read_by: ['user1'],
      },
      {
        id: 'comment3',
        user_id: 'user3',
        user_name: 'Taylor Reed',
        user_avatar: 'https://i.pravatar.cc/150?u=user3',
        content: 'Can we make the call-to-action more prominent at the end?',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        read_by: [],
      },
      {
        id: 'reply1',
        user_id: 'user2',
        user_name: 'Jamie Smith',
        user_avatar: 'https://i.pravatar.cc/150?u=user2',
        content: 'I agree, let\'s cut the intro by 5 seconds.',
        timestamp: new Date(Date.now() - 72000000).toISOString(), // 20 hours ago
        parent_id: 'comment1',
        read_by: ['user1', 'user3'],
      },
      {
        id: 'reply2',
        user_id: 'user1',
        user_name: 'Alex Johnson',
        user_avatar: 'https://i.pravatar.cc/150?u=user1',
        content: 'Good suggestion. I\'ll work on enhancing the CTA.',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        parent_id: 'comment3',
        read_by: ['user3'],
      },
    ];
    
    comments.value = mockComments;
    
    // Initialize replies visibility
    mockComments.forEach(comment => {
      if (comment.parent_id) {
        showReplies.value[comment.parent_id] = true;
      }
    });
  } catch (err) {
    console.error('Error loading comments:', err);
    error.value = 'Failed to load comments';
  } finally {
    loading.value = false;
  }
};

// Post a new comment
const postComment = async () => {
  if (!newComment.value.trim() || !currentUser.value) return;
  
  submitting.value = true;
  
  try {
    // Create a new comment object
    const commentData = {
      user_id: currentUser.value.uid,
      user_name: currentUser.value.displayName || 'Anonymous',
      user_avatar: currentUser.value.photoURL || `https://i.pravatar.cc/150?u=${currentUser.value.uid}`,
      content: newComment.value.trim(),
      timestamp: new Date().toISOString(),
      read_by: [currentUser.value.uid],
      parent_id: replyingTo.value,
    };
    
    // In a real implementation, we would save this to Firestore
    // For now, we'll mock the response
    const commentId = `comment-${Date.now()}`;
    
    // Add to UI immediately for better UX
    comments.value.unshift({
      id: commentId,
      ...commentData,
    });
    
    // Reset form
    newComment.value = '';
    replyingTo.value = null;
    
    // Show success message
    toaster.show({
      title: 'Comment Posted',
      message: 'Your comment has been added successfully',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
    
    // In a real app, we would also send notifications to team members
  } catch (err) {
    console.error('Error posting comment:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to post your comment',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    submitting.value = false;
  }
};

// Start replying to a comment
const replyTo = (commentId: string) => {
  replyingTo.value = commentId;
  
  // Focus on the input field
  setTimeout(() => {
    const inputEl = document.getElementById('comment-input');
    if (inputEl) inputEl.focus();
  }, 100);
};

// Cancel reply
const cancelReply = () => {
  replyingTo.value = null;
};

// Toggle replies visibility
const toggleReplies = (commentId: string) => {
  showReplies.value[commentId] = !showReplies.value[commentId];
};

// Mark comment as read
const markAsRead = (commentId: string) => {
  if (!currentUser.value) return;
  
  // Find the comment
  const comment = comments.value.find(c => c.id === commentId);
  if (!comment) return;
  
  // Check if already read by current user
  if (comment.read_by?.includes(currentUser.value.uid)) return;
  
  // Add current user to read_by array
  comment.read_by = [...(comment.read_by || []), currentUser.value.uid];
  
  // In a real implementation, we would update this in Firestore
};

// Format date to relative time
const formatDate = (dateStr: string | Date) => {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'yesterday';
  } else {
    return date.toLocaleDateString();
  }
};

// Check if comment is unread
const isUnread = (comment: any) => {
  if (!currentUser.value || !comment.read_by) return false;
  return !comment.read_by.includes(currentUser.value.uid);
};

// Get parent comments
const parentComments = computed(() => {
  return comments.value.filter(comment => !comment.parent_id);
});

// Get replies for a comment
const getReplies = (commentId: string) => {
  return comments.value.filter(comment => comment.parent_id === commentId);
};
</script>

<template>
  <div>
    <BaseHeading as="h3" size="md" weight="medium" class="mb-4">
      Comments & Feedback
    </BaseHeading>
    
    <!-- Comment form -->
    <BaseCard class="mb-6 p-4">
      <div class="relative">
        <!-- Reply indicator -->
        <div v-if="replyingTo" class="mb-2 flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm text-muted-500">
            <Icon name="ph:arrow-bend-up-right-duotone" class="size-4" />
            <span>Replying to comment</span>
          </div>
          <BaseButtonIcon size="xs" @click="cancelReply">
            <Icon name="ph:x-duotone" class="size-3" />
          </BaseButtonIcon>
        </div>
        
        <BaseTextarea
          id="comment-input"
          v-model="newComment"
          placeholder="Add a comment or feedback..."
          rows="3"
          class="mb-3"
        />
        
        <div class="flex justify-end">
          <BaseButton
            color="primary"
            @click="postComment"
            :loading="submitting"
            :disabled="submitting || !newComment.trim()"
          >
            <Icon name="ph:paper-plane-right-duotone" class="me-1 size-4" />
            Post Comment
          </BaseButton>
        </div>
      </div>
    </BaseCard>
    
    <!-- Comments list -->
    <div class="space-y-4">
      <BasePlaceholderPage
        v-if="loading"
        title="Loading comments"
        subtitle="Please wait while we load the comments"
        :ui="{ wrapper: 'py-8' }"
      />
      
      <BaseMessage v-else-if="error" type="danger">
        {{ error }}
      </BaseMessage>
      
      <div v-else class="space-y-4">
        <div v-if="parentComments.length === 0" class="text-center py-8">
          <Icon name="ph:chats-duotone" class="mx-auto mb-2 size-12 text-muted-400" />
          <BaseHeading as="h4" size="sm" weight="medium" class="mb-1">
            No Comments Yet
          </BaseHeading>
          <BaseText class="text-muted-500">
            Be the first to add a comment or feedback to this project
          </BaseText>
        </div>
        
        <template v-for="comment in parentComments" :key="comment.id">
          <!-- Parent comment -->
          <BaseCard 
            class="border-muted-200 dark:border-muted-700 p-4 border transition-all"
            :class="{ 'ring-2 ring-primary-500/30 border-primary-500/50': isUnread(comment) }"
            @click="markAsRead(comment.id)"
          >
            <div class="flex gap-3">
              <BaseAvatar :src="comment.user_avatar" size="md" />
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-2">
                    <BaseText weight="medium">{{ comment.user_name }}</BaseText>
                    <BaseText size="xs" class="text-muted-400">{{ formatDate(comment.timestamp) }}</BaseText>
                    
                    <BaseTag
                      v-if="isUnread(comment)"
                      color="primary"
                      size="xs"
                      rounded="full"
                    >
                      New
                    </BaseTag>
                  </div>
                  
                  <BaseButtonIcon size="xs" @click="replyTo(comment.id)">
                    <Icon name="ph:arrow-bend-up-right-duotone" class="size-3" />
                  </BaseButtonIcon>
                </div>
                
                <BaseText class="mb-3 break-words">{{ comment.content }}</BaseText>
                
                <!-- Show replies count -->
                <div v-if="getReplies(comment.id).length > 0" class="mt-2">
                  <BaseButton
                    variant="ghost"
                    size="xs"
                    color="default"
                    @click.prevent="toggleReplies(comment.id)"
                  >
                    <Icon
                      :name="showReplies[comment.id] ? 'ph:caret-up-duotone' : 'ph:caret-down-duotone'"
                      class="me-1 size-3"
                    />
                    {{ getReplies(comment.id).length }} {{ getReplies(comment.id).length === 1 ? 'reply' : 'replies' }}
                  </BaseButton>
                </div>
              </div>
            </div>
          </BaseCard>
          
          <!-- Replies -->
          <div v-if="showReplies[comment.id]" class="ms-8 space-y-3">
            <BaseCard
              v-for="reply in getReplies(comment.id)"
              :key="reply.id"
              class="border-muted-200 dark:border-muted-700 p-4 border transition-all"
              :class="{ 'ring-2 ring-primary-500/30 border-primary-500/50': isUnread(reply) }"
              @click="markAsRead(reply.id)"
            >
              <div class="flex gap-3">
                <BaseAvatar :src="reply.user_avatar" size="sm" />
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-2">
                      <BaseText weight="medium">{{ reply.user_name }}</BaseText>
                      <BaseText size="xs" class="text-muted-400">{{ formatDate(reply.timestamp) }}</BaseText>
                      
                      <BaseTag
                        v-if="isUnread(reply)"
                        color="primary"
                        size="xs"
                        rounded="full"
                      >
                        New
                      </BaseTag>
                    </div>
                  </div>
                  
                  <BaseText class="break-words">{{ reply.content }}</BaseText>
                </div>
              </div>
            </BaseCard>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
