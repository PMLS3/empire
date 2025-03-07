import { ref, computed } from 'vue';
import { useAuth } from '../../auth/composables/auth';
import { useToaster } from '../../shared/composables/toaster';
import { useStorage } from './useStorage';
import type { Book } from '../types/book';
import type { BookMarketingAssets } from '../types/publishing-platform';

/**
 * Composable for generating and managing book marketing materials
 */
export const useBookMarketing = () => {
  const { user, currentWorkspace } = useAuth();
  const { show: showToast } = useToaster();
  const storage = useStorage();
  
  // State
  const loading = ref(false);
  const error = ref<string | null>(null);
  const marketingAssets = ref<BookMarketingAssets | null>(null);
  
  // Computed
  const workspaceId = computed(() => currentWorkspace.value?.id);
  
  /**
   * Generate cover mockups for a book
   */
  const generateCoverMockups = async (bookId: string, coverImageUrl: string) => {
    if (!workspaceId.value) return [];
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch('/api/publishing/marketing/cover-mockups', {
        method: 'POST',
        body: {
          book_id: bookId,
          cover_image_url: coverImageUrl,
          workspace_id: workspaceId.value
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      const mockups = response.data.value as string[];
      
      // Update marketing assets state
      if (!marketingAssets.value) {
        marketingAssets.value = {
          cover_mockups: mockups,
          social_media_images: [],
          book_preview: '',
          author_website_assets: []
        };
      } else {
        marketingAssets.value.cover_mockups = mockups;
      }
      
      showToast({
        type: 'success',
        message: 'Cover mockups generated successfully'
      });
      
      return mockups;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to generate cover mockups: ${err.message}`
      });
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Generate social media promotional images
   */
  const generateSocialMediaImages = async (bookId: string, coverImageUrl: string, bookTitle: string, bookDescription: string) => {
    if (!workspaceId.value) return [];
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch('/api/publishing/marketing/social-media', {
        method: 'POST',
        body: {
          book_id: bookId,
          cover_image_url: coverImageUrl,
          book_title: bookTitle,
          book_description: bookDescription,
          workspace_id: workspaceId.value
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      const socialImages = response.data.value as string[];
      
      // Update marketing assets state
      if (!marketingAssets.value) {
        marketingAssets.value = {
          cover_mockups: [],
          social_media_images: socialImages,
          book_preview: '',
          author_website_assets: []
        };
      } else {
        marketingAssets.value.social_media_images = socialImages;
      }
      
      showToast({
        type: 'success',
        message: 'Social media images generated successfully'
      });
      
      return socialImages;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to generate social media images: ${err.message}`
      });
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Generate a book preview (e.g., 3D flipbook or sample pages)
   */
  const generateBookPreview = async (bookId: string, pages: string[]) => {
    if (!workspaceId.value) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch('/api/publishing/marketing/book-preview', {
        method: 'POST',
        body: {
          book_id: bookId,
          pages,
          workspace_id: workspaceId.value
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      const previewUrl = response.data.value as string;
      
      // Update marketing assets state
      if (!marketingAssets.value) {
        marketingAssets.value = {
          cover_mockups: [],
          social_media_images: [],
          book_preview: previewUrl,
          author_website_assets: []
        };
      } else {
        marketingAssets.value.book_preview = previewUrl;
      }
      
      showToast({
        type: 'success',
        message: 'Book preview generated successfully'
      });
      
      return previewUrl;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to generate book preview: ${err.message}`
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Generate author website assets (banners, widgets, etc.)
   */
  const generateAuthorWebsiteAssets = async (bookId: string, authorName: string, bookTitle: string, coverImageUrl: string) => {
    if (!workspaceId.value) return [];
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch('/api/publishing/marketing/website-assets', {
        method: 'POST',
        body: {
          book_id: bookId,
          author_name: authorName,
          book_title: bookTitle,
          cover_image_url: coverImageUrl,
          workspace_id: workspaceId.value
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      const websiteAssets = response.data.value as string[];
      
      // Update marketing assets state
      if (!marketingAssets.value) {
        marketingAssets.value = {
          cover_mockups: [],
          social_media_images: [],
          book_preview: '',
          author_website_assets: websiteAssets
        };
      } else {
        marketingAssets.value.author_website_assets = websiteAssets;
      }
      
      showToast({
        type: 'success',
        message: 'Author website assets generated successfully'
      });
      
      return websiteAssets;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to generate author website assets: ${err.message}`
      });
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Generate all marketing assets for a book
   */
  const generateAllMarketingAssets = async (book: Book): Promise<BookMarketingAssets | null> => {
    if (!workspaceId.value || !book.id || !book.cover_image) {
      error.value = 'Book ID and cover image are required';
      showToast({
        type: 'error',
        message: 'Book ID and cover image are required'
      });
      return null;
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      // Generate all assets in parallel
      const [coverMockups, socialImages, bookPreview, websiteAssets] = await Promise.all([
        generateCoverMockups(book.id, book.cover_image),
        generateSocialMediaImages(book.id, book.cover_image, book.title || '', book.description || ''),
        generateBookPreview(book.id, book.pages?.map(p => p.id) || []),
        generateAuthorWebsiteAssets(book.id, book.owner_id || '', book.title || '', book.cover_image)
      ]);
      
      // Combine all assets
      const allAssets: BookMarketingAssets = {
        cover_mockups: coverMockups,
        social_media_images: socialImages,
        book_preview: bookPreview || '',
        author_website_assets: websiteAssets
      };
      
      marketingAssets.value = allAssets;
      
      showToast({
        type: 'success',
        message: 'All marketing assets generated successfully'
      });
      
      return allAssets;
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
  
  /**
   * Save marketing assets to storage
   */
  const saveMarketingAssets = async (bookId: string, assets: BookMarketingAssets) => {
    if (!workspaceId.value) return false;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch('/api/publishing/marketing/save', {
        method: 'POST',
        body: {
          book_id: bookId,
          assets,
          workspace_id: workspaceId.value
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      showToast({
        type: 'success',
        message: 'Marketing assets saved successfully'
      });
      
      return true;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to save marketing assets: ${err.message}`
      });
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Load marketing assets for a book
   */
  const loadMarketingAssets = async (bookId: string): Promise<BookMarketingAssets | null> => {
    if (!workspaceId.value) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/marketing/assets?bookId=${bookId}`);
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      const assets = response.data.value as BookMarketingAssets;
      marketingAssets.value = assets;
      
      return assets;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to load marketing assets: ${err.message}`
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
    marketingAssets,
    
    // Methods
    generateCoverMockups,
    generateSocialMediaImages,
    generateBookPreview,
    generateAuthorWebsiteAssets,
    generateAllMarketingAssets,
    saveMarketingAssets,
    loadMarketingAssets
  };
};