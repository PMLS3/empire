import { ref, computed } from 'vue';
import { useAuth } from '../../auth/composables/auth';
import { useToaster } from '../../shared/composables/toaster';
import type { Book } from '../types/book';
import type { BookBundle } from '../types/publishing-platform';

/**
 * Composable for managing book bundles
 */
export const useBookBundling = () => {
  const { user, currentWorkspace } = useAuth();
  const { show: showToast } = useToaster();
  
  // State
  const loading = ref(false);
  const error = ref<string | null>(null);
  const bundles = ref<BookBundle[]>([]);
  const currentBundle = ref<BookBundle | null>(null);
  
  // Computed
  const workspaceId = computed(() => currentWorkspace.value?.id);
  
  /**
   * Fetch all bundles for the current workspace
   */
  const fetchBundles = async () => {
    if (!workspaceId.value) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/bundles?workspaceId=${workspaceId.value}`);
      if (response.error.value) throw new Error(response.error.value.message);
      bundles.value = response.data.value as BookBundle[];
      return bundles.value;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to fetch bundles: ${err.message}`
      });
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Get a bundle by ID
   */
  const getBundleById = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/bundles/${id}`);
      if (response.error.value) throw new Error(response.error.value.message);
      currentBundle.value = response.data.value as BookBundle;
      return currentBundle.value;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to fetch bundle: ${err.message}`
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Create a new bundle
   */
  const createBundle = async (bundleData: Partial<BookBundle>) => {
    if (!workspaceId.value) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch('/api/publishing/bundles', {
        method: 'POST',
        body: {
          ...bundleData,
          workspace_id: workspaceId.value,
          owner_id: user.value?.id,
          status: 'draft',
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      // Refresh bundles list
      await fetchBundles();
      
      showToast({
        type: 'success',
        message: 'Bundle created successfully'
      });
      
      return response.data.value as BookBundle;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to create bundle: ${err.message}`
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Update an existing bundle
   */
  const updateBundle = async (id: string, bundleData: Partial<BookBundle>) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/bundles/${id}`, {
        method: 'PUT',
        body: {
          ...bundleData,
          updated_at: new Date()
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      // Update current bundle if it's the one being edited
      if (currentBundle.value?.id === id) {
        currentBundle.value = { ...currentBundle.value, ...bundleData };
      }
      
      // Refresh bundles list
      await fetchBundles();
      
      showToast({
        type: 'success',
        message: 'Bundle updated successfully'
      });
      
      return response.data.value as BookBundle;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to update bundle: ${err.message}`
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Delete a bundle
   */
  const deleteBundle = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/bundles/${id}`, {
        method: 'DELETE'
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      // Clear current bundle if it's the one being deleted
      if (currentBundle.value?.id === id) {
        currentBundle.value = null;
      }
      
      // Refresh bundles list
      await fetchBundles();
      
      showToast({
        type: 'success',
        message: 'Bundle deleted successfully'
      });
      
      return true;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to delete bundle: ${err.message}`
      });
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Add a book to a bundle
   */
  const addBookToBundle = async (bundleId: string, bookId: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      // First get the current bundle
      const bundle = await getBundleById(bundleId);
      if (!bundle) throw new Error('Bundle not found');
      
      // Check if book is already in the bundle
      if (bundle.books.includes(bookId)) {
        showToast({
          type: 'info',
          message: 'Book is already in this bundle'
        });
        return bundle;
      }
      
      // Add the book to the bundle
      const updatedBooks = [...bundle.books, bookId];
      return updateBundle(bundleId, { books: updatedBooks });
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to add book to bundle: ${err.message}`
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Remove a book from a bundle
   */
  const removeBookFromBundle = async (bundleId: string, bookId: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      // First get the current bundle
      const bundle = await getBundleById(bundleId);
      if (!bundle) throw new Error('Bundle not found');
      
      // Remove the book from the bundle
      const updatedBooks = bundle.books.filter(id => id !== bookId);
      return updateBundle(bundleId, { books: updatedBooks });
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to remove book from bundle: ${err.message}`
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Calculate bundle pricing
   */
  const calculateBundlePricing = async (bundleId: string, discountPercentage: number) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/bundles/${bundleId}/calculate-price`, {
        method: 'POST',
        body: {
          discount_percentage: discountPercentage
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      const pricing = response.data.value as {
        original_total: number;
        discounted_total: number;
        currency: string;
        savings: number;
        savings_percentage: number;
      };
      
      return pricing;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to calculate bundle pricing: ${err.message}`
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Publish a bundle
   */
  const publishBundle = async (bundleId: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/bundles/${bundleId}/publish`, {
        method: 'POST'
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      // Update current bundle if it's the one being published
      if (currentBundle.value?.id === bundleId) {
        currentBundle.value = {
          ...currentBundle.value,
          status: 'published',
          published_at: new Date()
        };
      }
      
      // Refresh bundles list
      await fetchBundles();
      
      showToast({
        type: 'success',
        message: 'Bundle published successfully'
      });
      
      return true;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to publish bundle: ${err.message}`
      });
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Generate marketing assets for a bundle
   */
  const generateBundleMarketingAssets = async (bundleId: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/bundles/${bundleId}/marketing`, {
        method: 'POST'
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      showToast({
        type: 'success',
        message: 'Bundle marketing assets generated successfully'
      });
      
      return response.data.value as {
        bundle_mockup: string;
        promotional_images: string[];
      };
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to generate bundle marketing assets: ${err.message}`
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
    bundles,
    currentBundle,
    
    // Bundle operations
    fetchBundles,
    getBundleById,
    createBundle,
    updateBundle,
    deleteBundle,
    addBookToBundle,
    removeBookFromBundle,
    calculateBundlePricing,
    publishBundle,
    generateBundleMarketingAssets
  };
};