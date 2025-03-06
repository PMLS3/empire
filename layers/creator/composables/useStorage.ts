import { ref, computed } from 'vue';
import { storageManager, type AssetType, type StorageProgress } from '../utils/storageManager';
import { useToaster } from '../../shared/composables/toaster';

export function useStorage() {
  const toaster = useToaster();
  
  // Track upload progress for multiple files
  const uploadProgress = ref<Record<string, StorageProgress>>({});
  
  // Upload an asset
  const uploadAsset = async (
    file: File,
    type: AssetType,
    projectId: string,
    options: {
      tags?: string[];
      customPath?: string;
      metadata?: Record<string, any>;
    } = {}
  ) => {
    // Initialize progress for this file
    uploadProgress.value[file.name] = {
      progress: 0,
      status: 'uploading'
    };
    
    try {
      const result = await storageManager.uploadAsset(
        file,
        type,
        projectId,
        {
          ...options,
          progressCallback: (progress) => {
            uploadProgress.value[file.name] = progress;
          }
        }
      );
      
      return result;
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      toaster.show({
        title: 'Error',
        message: `Failed to upload ${file.name}`,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
      });
      throw error;
    }
  };
  
  // Upload multiple assets
  const uploadAssets = async (
    files: File[],
    type: AssetType,
    projectId: string,
    options: {
      tags?: string[];
      customPath?: string;
      metadata?: Record<string, any>;
    } = {}
  ) => {
    const results = [];
    
    for (const file of files) {
      const result = await uploadAsset(file, type, projectId, options);
      results.push(result);
    }
    
    return results;
  };
  
  // Get asset with download URL and metadata
  const getAsset = async (path: string) => {
    try {
      return await storageManager.getAsset(path);
    } catch (error) {
      console.error(`Failed to get asset ${path}:`, error);
      toaster.show({
        title: 'Error',
        message: 'Failed to load asset',
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
      });
      throw error;
    }
  };
  
  // List assets by project and type
  const listAssets = async (projectId: string, type?: AssetType) => {
    try {
      return await storageManager.listAssets(projectId, type);
    } catch (error) {
      console.error(`Failed to list assets for project ${projectId}:`, error);
      toaster.show({
        title: 'Error',
        message: 'Failed to load assets',
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
      });
      throw error;
    }
  };
  
  // Delete an asset
  const deleteAsset = async (path: string) => {
    try {
      await storageManager.deleteAsset(path);
      toaster.show({
        title: 'Success',
        message: 'Asset deleted successfully',
        color: 'success',
        icon: 'ph:check-circle-duotone',
      });
    } catch (error) {
      console.error(`Failed to delete asset ${path}:`, error);
      toaster.show({
        title: 'Error',
        message: 'Failed to delete asset',
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
      });
      throw error;
    }
  };
  
  // Clean up unused assets
  const cleanupUnusedAssets = async (
    projectId: string,
    options = {}
  ) => {
    try {
      const deletedPaths = await storageManager.cleanupUnusedAssets(projectId, options);
      
      if (deletedPaths.length > 0) {
        toaster.show({
          title: 'Cleanup Complete',
          message: `Removed ${deletedPaths.length} unused assets`,
          color: 'success',
          icon: 'ph:check-circle-duotone',
        });
      }
      
      return deletedPaths;
    } catch (error) {
      console.error(`Failed to clean up assets for project ${projectId}:`, error);
      toaster.show({
        title: 'Error',
        message: 'Failed to clean up unused assets',
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
      });
      throw error;
    }
  };
  
  // Initialize cache on component mount
  onMounted(() => {
    storageManager.loadCache();
  });
  
  return {
    uploadAsset,
    uploadAssets,
    getAsset,
    listAssets,
    deleteAsset,
    cleanupUnusedAssets,
    uploadProgress,
  };
}
