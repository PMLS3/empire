import { ref } from 'vue';
import { 
  contentModeration, 
  type ContentType, 
  type ModerationStatus,
  type ModerationResult 
} from '../utils/contentModeration';
import { useAuth } from '../../auth/composables/auth';

export function useContentModeration() {
  const { user } = useAuth();
  
  const moderating = ref(false);
  const moderationResult = ref<ModerationResult | null>(null);
  
  /**
   * Moderate text content
   */
  const moderateText = async (
    text: string,
    contentType: ContentType,
    options: { strict?: boolean } = {}
  ) => {
    moderating.value = true;
    
    try {
      const result = await contentModeration.moderateText(text, contentType, options);
      moderationResult.value = result;
      return result;
    } catch (error) {
      console.error('Error in text moderation:', error);
      throw error;
    } finally {
      moderating.value = false;
    }
  };
  
  /**
   * Moderate image content
   */
  const moderateImage = async (
    imageUrl: string,
    contentType: ContentType,
    options: { strict?: boolean } = {}
  ) => {
    moderating.value = true;
    
    try {
      const result = await contentModeration.moderateImage(imageUrl, contentType, options);
      moderationResult.value = result;
      return result;
    } catch (error) {
      console.error('Error in image moderation:', error);
      throw error;
    } finally {
      moderating.value = false;
    }
  };
  
  /**
   * Report content for review
   */
  const reportContent = async (
    contentId: string,
    contentType: ContentType,
    reason: string
  ) => {
    if (!user.value) {
      throw new Error('User must be authenticated to report content');
    }
    
    return await contentModeration.reportContent(
      contentId,
      contentType,
      reason,
      user.value.id
    );
  };
  
  return {
    moderating,
    moderationResult,
    moderateText,
    moderateImage,
    reportContent
  };
}
