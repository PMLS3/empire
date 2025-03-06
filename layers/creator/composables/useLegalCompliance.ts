import { ref } from 'vue';
import { 
  legalCompliance, 
  type AgeRestriction,
  type ConsentType,
  type DMCAStatus
} from '../utils/legalCompliance';
import { useAuth } from '../../auth/composables/auth';

export function useLegalCompliance() {
  const { user } = useAuth();
  
  const checking = ref(false);
  const ageRating = ref<AgeRestriction>('general');
  const complianceIssues = ref<string[]>([]);
  
  /**
   * Check content age rating
   */
  const checkAgeRating = async (content: {
    title?: string;
    description?: string;
    keywords?: string[];
    containsAdultContent?: boolean;
    containsViolence?: boolean;
  }) => {
    checking.value = true;
    
    try {
      const rating = await legalCompliance.getContentAgeRating(content);
      ageRating.value = rating;
      return rating;
    } catch (error) {
      console.error('Error checking age rating:', error);
      throw error;
    } finally {
      checking.value = false;
    }
  };
  
  /**
   * Check GDPR compliance
   */
  const checkGDPRCompliance = (content: {
    collectsPersonalData?: boolean;
    hasConsentMechanism?: boolean;
    hasPrivacyPolicy?: boolean;
    hasCookieConsent?: boolean;
    allowsDataDeletion?: boolean;
  }) => {
    const result = legalCompliance.validateGDPRCompliance(content);
    
    if (result.issues) {
      complianceIssues.value = [...complianceIssues.value, ...result.issues];
    }
    
    return result;
  };
  
  /**
   * Check COPPA compliance
   */
  const checkCOPPACompliance = (content: {
    targetedToChildren?: boolean;
    collectsChildData?: boolean;
    hasParentalConsent?: boolean;
    limitsDataCollection?: boolean;
  }) => {
    const result = legalCompliance.validateCOPPACompliance(content);
    
    if (result.issues) {
      complianceIssues.value = [...complianceIssues.value, ...result.issues];
    }
    
    return result;
  };
  
  /**
   * Check for copyright issues
   */
  const checkCopyrightIssues = async (content: {
    text?: string;
    imageUrls?: string[];
    videoUrls?: string[];
    audioUrls?: string[];
    references?: string[];
  }) => {
    checking.value = true;
    
    try {
      const result = await legalCompliance.checkCopyrightIssues(content);
      
      if (result.issues) {
        complianceIssues.value = [...complianceIssues.value, ...result.issues];
      }
      
      return result;
    } catch (error) {
      console.error('Error checking copyright issues:', error);
      throw error;
    } finally {
      checking.value = false;
    }
  };
  
  /**
   * Check if user has given consent
   */
  const hasUserConsent = async (consentType: ConsentType) => {
    if (!user.value) {
      return false;
    }
    
    try {
      const result = await legalCompliance.getUserConsentStatus(user.value.id, consentType);
      return result.hasConsent;
    } catch (error) {
      console.error('Error checking user consent:', error);
      return false;
    }
  };
  
  /**
   * Record user consent
   */
  const recordConsent = async (consentType: ConsentType, hasConsented: boolean, metadata?: Record<string, any>) => {
    if (!user.value) {
      throw new Error('User must be authenticated to record consent');
    }
    
    return await legalCompliance.recordUserConsent(
      user.value.id,
      consentType,
      hasConsented,
      metadata
    );
  };
  
  /**
   * Clear compliance issues
   */
  const clearComplianceIssues = () => {
    complianceIssues.value = [];
  };
  
  /**
   * Submit a DMCA takedown request
   */
  const submitDMCATakedown = async (data: {
    contentId: string;
    contentType: string;
    originalWorkDescription: string;
    copyrightProof: string;
    requestedAction: 'remove' | 'attribute';
  }) => {
    if (!user.value) {
      throw new Error('User must be authenticated to submit DMCA takedown');
    }
    
    return await legalCompliance.submitDMCATakedown({
      ...data,
      claimantName: user.value.username,
      claimantEmail: user.value.email,
      declaration: true
    });
  };
  
  return {
    checking,
    ageRating,
    complianceIssues,
    checkAgeRating,
    checkGDPRCompliance,
    checkCOPPACompliance,
    checkCopyrightIssues,
    hasUserConsent,
    recordConsent,
    clearComplianceIssues,
    submitDMCATakedown
  };
}
