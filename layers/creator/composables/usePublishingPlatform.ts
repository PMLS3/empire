import { ref, computed } from 'vue';
import { useAuth } from '../../auth/composables/auth';
import { useToaster } from '../../shared/composables/toaster';
import type { Book } from '../types/book';
import type {
  PublishingPlatformCredentials,
  AmazonKdpConfig,
  IngramSparkConfig,
  AppleBooksConfig,
  GooglePlayBooksConfig,
  PlatformPublishingStatus,
  BookMarketingAssets,
  BookAnalytics
} from '../types/publishing-platform';

/**
 * Composable for managing publishing platform integrations
 */
export const usePublishingPlatform = () => {
  const { user, currentWorkspace } = useAuth();
  const { show: showToast } = useToaster();
  
  // State
  const loading = ref(false);
  const error = ref<string | null>(null);
  const platformCredentials = ref<PublishingPlatformCredentials[]>([]);
  const publishingStatuses = ref<PlatformPublishingStatus[]>([]);
  const analyticsData = ref<BookAnalytics[]>([]);
  
  // Computed
  const workspaceId = computed(() => currentWorkspace.value?.id);
  const hasAmazonKdpCredentials = computed(() => {
    return platformCredentials.value.some(cred => cred.platform === 'amazon_kdp' && cred.is_valid);
  });
  const hasIngramSparkCredentials = computed(() => {
    return platformCredentials.value.some(cred => cred.platform === 'ingramspark' && cred.is_valid);
  });
  const hasAppleBooksCredentials = computed(() => {
    return platformCredentials.value.some(cred => cred.platform === 'apple_books' && cred.is_valid);
  });
  const hasGooglePlayBooksCredentials = computed(() => {
    return platformCredentials.value.some(cred => cred.platform === 'google_play_books' && cred.is_valid);
  });
  
  /**
   * Fetch platform credentials for the current workspace
   */
  const fetchPlatformCredentials = async () => {
    if (!workspaceId.value) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/credentials?workspaceId=${workspaceId.value}`);
      if (response.error.value) throw new Error(response.error.value.message);
      platformCredentials.value = response.data.value as PublishingPlatformCredentials[];
      return platformCredentials.value;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to fetch platform credentials: ${err.message}`
      });
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Save platform credentials
   */
  const savePlatformCredentials = async (credentials: PublishingPlatformCredentials) => {
    if (!workspaceId.value) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch('/api/publishing/credentials', {
        method: 'POST',
        body: {
          ...credentials,
          workspace_id: workspaceId.value
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      // Update local state
      await fetchPlatformCredentials();
      
      showToast({
        type: 'success',
        message: `${credentials.platform} credentials saved successfully`
      });
      
      return true;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to save credentials: ${err.message}`
      });
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Validate platform credentials
   */
  const validatePlatformCredentials = async (platform: string) => {
    if (!workspaceId.value) return false;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/credentials/validate`, {
        method: 'POST',
        body: {
          platform,
          workspace_id: workspaceId.value
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      // Update local state
      await fetchPlatformCredentials();
      
      showToast({
        type: 'success',
        message: `${platform} credentials validated successfully`
      });
      
      return true;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to validate credentials: ${err.message}`
      });
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Fetch publishing statuses for a book
   */
  const fetchPublishingStatuses = async (bookId: string) => {
    if (!workspaceId.value) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/status?bookId=${bookId}`);
      if (response.error.value) throw new Error(response.error.value.message);
      publishingStatuses.value = response.data.value as PlatformPublishingStatus[];
      return publishingStatuses.value;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to fetch publishing statuses: ${err.message}`
      });
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Publish a book to Amazon KDP
   */
  const publishToAmazonKdp = async (book: Book, config: AmazonKdpConfig) => {
    if (!workspaceId.value || !hasAmazonKdpCredentials.value) {
      error.value = 'Valid Amazon KDP credentials are required';
      showToast({
        type: 'error',
        message: 'Valid Amazon KDP credentials are required'
      });
      return false;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch('/api/publishing/amazon-kdp/publish', {
        method: 'POST',
        body: {
          book_id: book.id,
          config,
          workspace_id: workspaceId.value
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      // Update publishing statuses
      await fetchPublishingStatuses(book.id!);
      
      showToast({
        type: 'success',
        message: 'Book submitted to Amazon KDP successfully'
      });
      
      return true;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to publish to Amazon KDP: ${err.message}`
      });
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Publish a book to IngramSpark
   */
  const publishToIngramSpark = async (book: Book, config: IngramSparkConfig) => {
    if (!workspaceId.value || !hasIngramSparkCredentials.value) {
      error.value = 'Valid IngramSpark credentials are required';
      showToast({
        type: 'error',
        message: 'Valid IngramSpark credentials are required'
      });
      return false;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch('/api/publishing/ingramspark/publish', {
        method: 'POST',
        body: {
          book_id: book.id,
          config,
          workspace_id: workspaceId.value
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      // Update publishing statuses
      await fetchPublishingStatuses(book.id!);
      
      showToast({
        type: 'success',
        message: 'Book submitted to IngramSpark successfully'
      });
      
      return true;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to publish to IngramSpark: ${err.message}`
      });
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Publish a book to Apple Books
   */
  const publishToAppleBooks = async (book: Book, config: AppleBooksConfig) => {
    if (!workspaceId.value || !hasAppleBooksCredentials.value) {
      error.value = 'Valid Apple Books credentials are required';
      showToast({
        type: 'error',
        message: 'Valid Apple Books credentials are required'
      });
      return false;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch('/api/publishing/apple-books/publish', {
        method: 'POST',
        body: {
          book_id: book.id,
          config,
          workspace_id: workspaceId.value
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      // Update publishing statuses
      await fetchPublishingStatuses(book.id!);
      
      showToast({
        type: 'success',
        message: 'Book submitted to Apple Books successfully'
      });
      
      return true;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to publish to Apple Books: ${err.message}`
      });
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Publish a book to Google Play Books
   */
  const publishToGooglePlayBooks = async (book: Book, config: GooglePlayBooksConfig) => {
    if (!workspaceId.value || !hasGooglePlayBooksCredentials.value) {
      error.value = 'Valid Google Play Books credentials are required';
      showToast({
        type: 'error',
        message: 'Valid Google Play Books credentials are required'
      });
      return false;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch('/api/publishing/google-play-books/publish', {
        method: 'POST',
        body: {
          book_id: book.id,
          config,
          workspace_id: workspaceId.value
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      // Update publishing statuses
      await fetchPublishingStatuses(book.id!);
      
      showToast({
        type: 'success',
        message: 'Book submitted to Google Play Books successfully'
      });
      
      return true;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to publish to Google Play Books: ${err.message}`
      });
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Fetch analytics data for a book
   */
  const fetchBookAnalytics = async (bookId: string, platform: string = 'aggregate', period: string = 'monthly') => {
    if (!workspaceId.value) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/analytics?bookId=${bookId}&platform=${platform}&period=${period}`);
      if (response.error.value) throw new Error(response.error.value.message);
      analyticsData.value = response.data.value as BookAnalytics[];
      return analyticsData.value;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to fetch analytics data: ${err.message}`
      });
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Generate marketing assets for a book
   */
  const generateMarketingAssets = async (bookId: string): Promise<BookMarketingAssets | null> => {
    if (!workspaceId.value) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/marketing/generate`, {
        method: 'POST',
        body: {
          book_id: bookId,
          workspace_id: workspaceId.value
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      showToast({
        type: 'success',
        message: 'Marketing assets generated successfully'
      });
      
      return response.data.value as BookMarketingAssets;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to generate marketing assets: ${err.message}`
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  return {
    // State
    loading,
    error,
    platformCredentials,
    publishingStatuses,
    analyticsData,
    
    // Computed properties
    hasAmazonKdpCredentials,
    hasIngramSparkCredentials,
    hasAppleBooksCredentials,
    hasGooglePlayBooksCredentials,
    
    // Credential management
    fetchPlatformCredentials,
    savePlatformCredentials,
    validatePlatformCredentials,
    
    // Publishing operations
    fetchPublishingStatuses,
    publishToAmazonKdp,
    publishToIngramSpark,
    publishToAppleBooks,
    publishToGooglePlayBooks,
    
    // Analytics and marketing
    fetchBookAnalytics,
    generateMarketingAssets
  };
};