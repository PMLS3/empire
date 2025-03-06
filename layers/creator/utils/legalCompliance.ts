// Legal compliance types
export type AgeRestriction = 'general' | 'teen' | 'mature' | 'adult_only';
export type ConsentType = 'gdpr' | 'coppa' | 'ccpa' | 'terms' | 'privacy';
export type DMCAStatus = 'pending' | 'approved' | 'rejected' | 'counterclaim';

/**
 * Legal compliance utility class
 */
export class LegalCompliance {
  private static instance: LegalCompliance;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): LegalCompliance {
    if (!LegalCompliance.instance) {
      LegalCompliance.instance = new LegalCompliance();
    }
    return LegalCompliance.instance;
  }

  /**
   * Determine content age rating based on content
   */
  public async getContentAgeRating(
    content: {
      title?: string;
      description?: string;
      keywords?: string[];
      containsAdultContent?: boolean;
      containsViolence?: boolean;
    }
  ): Promise<AgeRestriction> {
    // Default to general if not specified
    if (!content) return 'general';
    
    // Explicit flags take precedence
    if (content.containsAdultContent) return 'adult_only';
    if (content.containsViolence) return 'teen';
    
    // Simple keyword-based detection
    const adultKeywords = [
      'adult', 'explicit', 'sex', 'nsfw', '18+', 'xxx',
      'nude', 'naked', 'porn', 'erotica'
    ];
    
    const violenceKeywords = [
      'violence', 'gore', 'blood', 'killing', 'murder', 
      'fight', 'weapon', 'combat', 'war'
    ];
    
    const teenKeywords = [
      'teen', 'dating', 'relationship', 'high school',
      'alcohol', 'drugs', 'smoking'
    ];
    
    const allText = [
      content.title || '',
      content.description || '',
      ...(content.keywords || [])
    ].join(' ').toLowerCase();
    
    if (adultKeywords.some(keyword => allText.includes(keyword))) {
      return 'adult_only';
    }
    
    if (violenceKeywords.some(keyword => allText.includes(keyword))) {
      return 'mature';
    }
    
    if (teenKeywords.some(keyword => allText.includes(keyword))) {
      return 'teen';
    }
    
    return 'general';
  }
  
  /**
   * Check if content meets GDPR requirements
   */
  public validateGDPRCompliance(
    content: {
      collectsPersonalData?: boolean;
      hasConsentMechanism?: boolean;
      hasPrivacyPolicy?: boolean;
      hasCookieConsent?: boolean;
      allowsDataDeletion?: boolean;
    }
  ): { compliant: boolean; issues?: string[] } {
    const issues: string[] = [];
    
    if (content.collectsPersonalData) {
      if (!content.hasConsentMechanism) {
        issues.push('Content collects personal data but lacks explicit consent mechanism');
      }
      
      if (!content.hasPrivacyPolicy) {
        issues.push('Content collects personal data but lacks privacy policy');
      }
      
      if (!content.allowsDataDeletion) {
        issues.push('Content must provide a way for users to request data deletion');
      }
    }
    
    if (!content.hasCookieConsent) {
      issues.push('Content requires cookie consent notification');
    }
    
    return {
      compliant: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined
    };
  }
  
  /**
   * Check if content meets COPPA requirements
   */
  public validateCOPPACompliance(
    content: {
      targetedToChildren?: boolean;
      collectsChildData?: boolean;
      hasParentalConsent?: boolean;
      limitsDataCollection?: boolean;
    }
  ): { compliant: boolean; issues?: string[] } {
    const issues: string[] = [];
    
    if (content.targetedToChildren) {
      if (content.collectsChildData && !content.hasParentalConsent) {
        issues.push('Content collects data from children but lacks parental consent mechanism');
      }
      
      if (!content.limitsDataCollection) {
        issues.push('Content must limit data collection from children');
      }
    }
    
    return {
      compliant: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined
    };
  }
  
  /**
   * Check for copyright issues in content
   */
  public async checkCopyrightIssues(
    content: {
      text?: string;
      imageUrls?: string[];
      videoUrls?: string[];
      audioUrls?: string[];
      references?: string[];
    }
  ): Promise<{ hasPotentialIssues: boolean; issues?: string[] }> {
    try {
      // Call the copyright check API
      const response = await $fetch('/api/compliance/copyright', {
        method: 'POST',
        body: content
      });
      
      return {
        hasPotentialIssues: response.hasPotentialIssues,
        issues: response.issues
      };
    } catch (error) {
      console.error('Error checking copyright issues:', error);
      return {
        hasPotentialIssues: true,
        issues: ['Unable to perform copyright check, manual review recommended']
      };
    }
  }
  
  /**
   * Get user consent status
   */
  public async getUserConsentStatus(
    userId: string,
    consentType: ConsentType
  ): Promise<{ hasConsent: boolean; timestamp?: string }> {
    try {
      const response = await $fetch('/api/compliance/consent', {
        method: 'GET',
        params: {
          userId,
          consentType
        }
      });
      
      return {
        hasConsent: response.hasConsent,
        timestamp: response.timestamp
      };
    } catch (error) {
      console.error('Error getting user consent status:', error);
      return { hasConsent: false };
    }
  }
  
  /**
   * Record user consent
   */
  public async recordUserConsent(
    userId: string,
    consentType: ConsentType,
    hasConsented: boolean,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      await $fetch('/api/compliance/consent', {
        method: 'POST',
        body: {
          userId,
          consentType,
          hasConsented,
          timestamp: new Date().toISOString(),
          metadata
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error recording user consent:', error);
      return false;
    }
  }
  
  /**
   * Submit DMCA takedown request
   */
  public async submitDMCATakedown(
    data: {
      contentId: string;
      contentType: string;
      claimantName: string;
      claimantEmail: string;
      originalWorkDescription: string;
      copyrightProof: string;
      requestedAction: 'remove' | 'attribute';
      declaration: boolean;
    }
  ): Promise<{ success: boolean; caseId?: string }> {
    if (!data.declaration) {
      return {
        success: false
      };
    }
    
    try {
      const response = await $fetch('/api/compliance/dmca/takedown', {
        method: 'POST',
        body: data
      });
      
      return {
        success: true,
        caseId: response.caseId
      };
    } catch (error) {
      console.error('Error submitting DMCA takedown:', error);
      return { success: false };
    }
  }
  
  /**
   * Submit DMCA counter notification
   */
  public async submitDMCACounterNotification(
    data: {
      caseId: string;
      contentId: string;
      respondentName: string;
      respondentEmail: string;
      counterClaimReason: string;
      goodFaithBelief: boolean;
      jurisdictionConsent: boolean;
    }
  ): Promise<{ success: boolean }> {
    if (!data.goodFaithBelief || !data.jurisdictionConsent) {
      return { success: false };
    }
    
    try {
      await $fetch('/api/compliance/dmca/counter', {
        method: 'POST',
        body: data
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error submitting DMCA counter notification:', error);
      return { success: false };
    }
  }
}

// Export singleton instance
export const legalCompliance = LegalCompliance.getInstance();
