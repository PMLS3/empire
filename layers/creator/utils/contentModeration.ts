import { ref } from 'vue';

// Content types that can be moderated
export type ContentType = 'script' | 'image' | 'audio' | 'video' | 'comment' | 'title' | 'description';

// Moderation status
export type ModerationStatus = 'approved' | 'rejected' | 'pending' | 'flagged';

// Moderation category reasons
export type ModerationCategory = 
  | 'adult'
  | 'spoof'
  | 'medical'
  | 'violence'
  | 'racy'
  | 'hate_speech'
  | 'harassment'
  | 'self_harm'
  | 'copyright'
  | 'trademark'
  | 'other';

// Content moderation result
export interface ModerationResult {
  status: ModerationStatus;
  categories?: Record<ModerationCategory, number>; // Score between 0 and 1
  flaggedCategories?: ModerationCategory[];
  reviewRequired: boolean;
  moderationId?: string;
  message?: string;
}

/**
 * Content moderation utility class
 */
export class ContentModeration {
  private static instance: ContentModeration;
  
  // Moderation thresholds for different categories (0-1)
  private moderationThresholds: Record<ModerationCategory, number> = {
    adult: 0.8,
    spoof: 0.9,
    medical: 0.9,
    violence: 0.8,
    racy: 0.8,
    hate_speech: 0.7,
    harassment: 0.7,
    self_harm: 0.7,
    copyright: 0.8,
    trademark: 0.8,
    other: 0.9,
  };

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ContentModeration {
    if (!ContentModeration.instance) {
      ContentModeration.instance = new ContentModeration();
    }
    return ContentModeration.instance;
  }

  /**
   * Moderate text content using AI
   */
  public async moderateText(
    text: string,
    contentType: ContentType,
    options: { strict?: boolean } = {}
  ): Promise<ModerationResult> {
    try {
      // Call the moderation API
      const response = await $fetch('/api/moderation/text', {
        method: 'POST',
        body: {
          text,
          contentType,
          strict: options.strict || false,
        },
      });
      
      return this.processModerationResponse(response);
    } catch (error) {
      console.error('Error moderating text:', error);
      
      // Return default response that requires review on error
      return {
        status: 'pending',
        reviewRequired: true,
        message: 'Moderation service unavailable, manual review required',
      };
    }
  }
  
  /**
   * Moderate image content using AI
   */
  public async moderateImage(
    imageUrl: string,
    contentType: ContentType,
    options: { strict?: boolean } = {}
  ): Promise<ModerationResult> {
    try {
      // Call the moderation API
      const response = await $fetch('/api/moderation/image', {
        method: 'POST',
        body: {
          imageUrl,
          contentType,
          strict: options.strict || false,
        },
      });
      
      return this.processModerationResponse(response);
    } catch (error) {
      console.error('Error moderating image:', error);
      
      // Return default response that requires review on error
      return {
        status: 'pending',
        reviewRequired: true,
        message: 'Moderation service unavailable, manual review required',
      };
    }
  }
  
  /**
   * Process moderation API response
   */
  private processModerationResponse(response: any): ModerationResult {
    // If moderation was successful
    if (response && response.categories) {
      const flaggedCategories: ModerationCategory[] = [];
      
      // Check each category against thresholds
      Object.entries(response.categories).forEach(([category, score]) => {
        if (score > this.moderationThresholds[category as ModerationCategory]) {
          flaggedCategories.push(category as ModerationCategory);
        }
      });
      
      // Determine status based on flagged categories
      let status: ModerationStatus = 'approved';
      if (flaggedCategories.length > 0) {
        status = 'flagged';
      }
      
      return {
        status,
        categories: response.categories,
        flaggedCategories,
        reviewRequired: flaggedCategories.length > 0,
        moderationId: response.moderationId,
        message: flaggedCategories.length > 0 
          ? `Content flagged for ${flaggedCategories.join(', ')}`
          : 'Content approved',
      };
    }
    
    // Default response if API structure is unexpected
    return {
      status: 'pending',
      reviewRequired: true,
      message: 'Content requires manual review',
    };
  }
  
  /**
   * Report content for manual review
   */
  public async reportContent(
    contentId: string,
    contentType: ContentType,
    reason: string,
    reportedBy: string
  ): Promise<boolean> {
    try {
      await $fetch('/api/moderation/report', {
        method: 'POST',
        body: {
          contentId,
          contentType,
          reason,
          reportedBy,
        },
      });
      
      return true;
    } catch (error) {
      console.error('Error reporting content:', error);
      return false;
    }
  }
  
  /**
   * Update moderation thresholds
   */
  public updateThresholds(thresholds: Partial<Record<ModerationCategory, number>>): void {
    this.moderationThresholds = {
      ...this.moderationThresholds,
      ...thresholds,
    };
  }
}

// Export singleton instance
export const contentModeration = ContentModeration.getInstance();
