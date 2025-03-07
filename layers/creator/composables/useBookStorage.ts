import { ref, computed, onMounted } from 'vue';
import { useStorage } from './useStorage';
import type { Book, Page, Element } from '../types/book';

/**
 * Asset types specific to books
 */
export type BookAssetType = 'cover' | 'page-image' | 'illustration' | 'font' | 'template' | 'export';

/**
 * Composable for managing book-specific assets using the existing storage solution
 */
export const useBookStorage = () => {
  const storage = useStorage();
  
  // Book-specific asset collections
  const coverImages = ref<any[]>([]);
  const pageImages = ref<any[]>([]);
  const illustrations = ref<any[]>([]);
  const fonts = ref<any[]>([]);
  const templates = ref<any[]>([]);
  const exports = ref<any[]>([]);
  
  // Loading and error states
  const loading = computed(() => Object.values(storage.uploadProgress.value).some(p => p.status === 'uploading'));
  
  /**
   * Upload a book asset with appropriate metadata
   */
  const uploadBookAsset = async (
    file: File,
    bookId: string,
    assetType: BookAssetType,
    options: {
      pageId?: string;
      chapterId?: string;
      elementId?: string;
      tags?: string[];
      metadata?: Record<string, any>;
    } = {}
  ) => {
    // Map book asset types to storage asset types
    const storageAssetType = assetType === 'cover' ? 'image' : 
                            assetType === 'page-image' ? 'image' :
                            assetType === 'illustration' ? 'image' :
                            assetType === 'font' ? 'data' :
                            assetType === 'template' ? 'data' :
                            assetType === 'export' ? 'data' : 'image';
    
    // Create custom path for book assets
    const customPath = `projects/${bookId}/books/${assetType}/${options.pageId ? `page-${options.pageId}/` : ''}${Date.now()}-${file.name.replace(/[^a-z0-9_.-]/gi, '_')}`;
    
    // Add book-specific metadata
    const metadata = {
      ...options.metadata,
      bookId,
      assetType,
      pageId: options.pageId,
      chapterId: options.chapterId,
      elementId: options.elementId
    };
    
    // Upload the asset using the storage manager
    return storage.uploadAsset(
      file,
      storageAssetType,
      bookId,
      {
        customPath,
        tags: [...(options.tags || []), 'book', assetType],
        metadata
      }
    );
  };
  
  /**
   * Upload a cover image for a book
   */
  const uploadCoverImage = async (file: File, bookId: string, tags: string[] = []) => {
    return uploadBookAsset(file, bookId, 'cover', { tags });
  };
  
  /**
   * Upload an image for a specific page
   */
  const uploadPageImage = async (file: File, bookId: string, pageId: string, tags: string[] = []) => {
    return uploadBookAsset(file, bookId, 'page-image', { pageId, tags });
  };
  
  /**
   * Upload an illustration that can be used across the book
   */
  const uploadIllustration = async (file: File, bookId: string, tags: string[] = []) => {
    return uploadBookAsset(file, bookId, 'illustration', { tags });
  };
  
  /**
   * Upload a font file for use in the book
   */
  const uploadFont = async (file: File, bookId: string, tags: string[] = []) => {
    return uploadBookAsset(file, bookId, 'font', { tags });
  };
  
  /**
   * Upload a book template
   */
  const uploadTemplate = async (file: File, bookId: string, tags: string[] = []) => {
    return uploadBookAsset(file, bookId, 'template', { tags });
  };
  
  /**
   * Upload an exported book file (PDF, EPUB, etc.)
   */
  const uploadExport = async (file: File, bookId: string, tags: string[] = []) => {
    return uploadBookAsset(file, bookId, 'export', { tags });
  };
  
  /**
   * List all assets for a book
   */
  const listBookAssets = async (bookId: string) => {
    const assets = await storage.listAssets(bookId);
    
    // Filter and categorize assets by type
    coverImages.value = assets.filter(asset => asset.metadata.assetType === 'cover');
    pageImages.value = assets.filter(asset => asset.metadata.assetType === 'page-image');
    illustrations.value = assets.filter(asset => asset.metadata.assetType === 'illustration');
    fonts.value = assets.filter(asset => asset.metadata.assetType === 'font');
    templates.value = assets.filter(asset => asset.metadata.assetType === 'template');
    exports.value = assets.filter(asset => asset.metadata.assetType === 'export');
    
    return assets;
  };
  
  /**
   * Get assets for a specific page
   */
  const getPageAssets = async (bookId: string, pageId: string) => {
    const assets = await storage.listAssets(bookId);
    return assets.filter(asset => 
      asset.metadata.pageId === pageId && 
      asset.metadata.assetType === 'page-image'
    );
  };
  
  /**
   * Delete a book asset
   */
  const deleteBookAsset = async (path: string) => {
    return storage.deleteAsset(path);
  };
  
  /**
   * Clean up unused assets for a book
   */
  const cleanupBookAssets = async (bookId: string, options = {}) => {
    return storage.cleanupUnusedAssets(bookId, options);
  };
  
  /**
   * Extract all image URLs from a book for validation and cleanup
   */
  const extractBookImageUrls = (book: Book): string[] => {
    const urls: string[] = [];
    
    // Cover image
    if (book.cover_image) urls.push(book.cover_image);
    
    // Page images
    if (book.pages) {
      book.pages.forEach(page => {
        // Background image
        if (page.background_image) urls.push(page.background_image);
        
        // Images array
        if (page.images && Array.isArray(page.images)) {
          urls.push(...page.images);
        }
        
        // Elements
        if (page.elements && Array.isArray(page.elements)) {
          page.elements.forEach(element => {
            if (element.type === 'image' && element.image?.src) {
              urls.push(element.image.src);
            }
          });
        }
      });
    }
    
    return urls;
  };
  
  /**
   * Validate that all images in a book exist in storage
   */
  const validateBookImages = async (book: Book): Promise<{valid: boolean, missing: string[]}> => {
    const imageUrls = extractBookImageUrls(book);
    const missing: string[] = [];
    
    for (const url of imageUrls) {
      try {
        // Try to fetch the image to validate it exists
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) {
          missing.push(url);
        }
      } catch (error) {
        missing.push(url);
      }
    }
    
    return {
      valid: missing.length === 0,
      missing
    };
  };
  
  return {
    // State
    coverImages,
    pageImages,
    illustrations,
    fonts,
    templates,
    exports,
    loading,
    
    // Upload methods
    uploadBookAsset,
    uploadCoverImage,
    uploadPageImage,
    uploadIllustration,
    uploadFont,
    uploadTemplate,
    uploadExport,
    
    // List and management methods
    listBookAssets,
    getPageAssets,
    deleteBookAsset,
    cleanupBookAssets,
    
    // Validation methods
    extractBookImageUrls,
    validateBookImages
  };
};
