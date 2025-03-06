import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable, 
  getDownloadURL,
  getMetadata,
  updateMetadata,
  list,
  deleteObject
} from 'firebase/storage';
import { useFirebase } from '../../auth/composables/firebase';
import { useAuth } from '../../auth/composables/auth';

// Asset types for organization
export type AssetType = 'video' | 'audio' | 'image' | 'script' | 'caption' | 'data';

interface AssetMetadata {
  projectId?: string;
  workspaceId?: string;
  userId?: string;
  type?: AssetType;
  originalName?: string;
  size?: number;
  duration?: number;
  width?: number;
  height?: number;
  format?: string;
  tags?: string[];
  createdAt?: string;
  lastAccessed?: string;
  accessCount?: number;
}

export interface StorageProgress {
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  url?: string;
}

/**
 * Storage manager for project assets
 */
export class StorageManager {
  private static instance: StorageManager;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Upload an asset with metadata
   */
  public async uploadAsset(
    file: File,
    type: AssetType,
    projectId: string,
    options: {
      tags?: string[];
      customPath?: string;
      progressCallback?: (progress: StorageProgress) => void;
      metadata?: Partial<AssetMetadata>;
    } = {}
  ): Promise<{ url: string; metadata: AssetMetadata }> {
    const { storage } = useFirebase();
    const { currentWorkspace, user } = useAuth();
    
    if (!storage) throw new Error('Firebase storage not initialized');
    if (!currentWorkspace.value?.id) throw new Error('No active workspace');
    
    const { tags = [], customPath, progressCallback } = options;
    
    try {
      // Create metadata for the file
      const metadata: AssetMetadata = {
        projectId,
        workspaceId: currentWorkspace.value.id,
        userId: user.value?.id,
        type,
        originalName: file.name,
        size: file.size,
        format: file.type,
        tags,
        createdAt: new Date().toISOString(),
        accessCount: 0,
        ...options.metadata
      };
      
      // Generate a path for the file
      const sanitizedName = file.name.replace(/[^a-z0-9_.-]/gi, '_');
      const timestamp = Date.now();
      const path = customPath || 
        `projects/${projectId}/${type}/${timestamp}-${sanitizedName}`;
      
      // Create a reference to the file location
      const fileRef = storageRef(storage, path);
      
      // Upload the file with metadata
      const uploadTask = uploadBytesResumable(fileRef, file, {
        customMetadata: this.serializeMetadata(metadata)
      });
      
      // Track upload progress
      if (progressCallback) {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressCallback({
              progress: Math.round(progress),
              status: 'uploading'
            });
          }
        );
      }
      
      // Wait for the upload to complete
      await uploadTask;
      
      // Get the download URL
      const url = await getDownloadURL(fileRef);
      
      // Track this asset access in cache
      this.trackAssetAccess(path);
      
      // Notify completion
      if (progressCallback) {
        progressCallback({
          progress: 100,
          status: 'completed',
          url
        });
      }
      
      return { url, metadata };
    } catch (error) {
      console.error('Asset upload error:', error);
      
      // Notify error
      if (progressCallback) {
        progressCallback({
          progress: 0,
          status: 'error',
          error: error.message || 'Upload failed'
        });
      }
      
      throw error;
    }
  }
  
  /**
   * Get an asset with download URL and metadata
   */
  public async getAsset(
    path: string
  ): Promise<{ url: string; metadata: AssetMetadata }> {
    const { storage } = useFirebase();
    if (!storage) throw new Error('Firebase storage not initialized');
    
    try {
      const fileRef = storageRef(storage, path);
      
      // Get download URL
      const url = await getDownloadURL(fileRef);
      
      // Get metadata
      const metadataResponse = await getMetadata(fileRef);
      const metadata = this.deserializeMetadata(metadataResponse.customMetadata || {});
      
      // Update last accessed time and count
      metadata.lastAccessed = new Date().toISOString();
      metadata.accessCount = (metadata.accessCount || 0) + 1;
      
      // Update metadata in Firebase
      await updateMetadata(fileRef, {
        customMetadata: this.serializeMetadata(metadata)
      });
      
      // Track this access in cache
      this.trackAssetAccess(path);
      
      return { url, metadata };
    } catch (error) {
      console.error(`Error getting asset ${path}:`, error);
      throw error;
    }
  }
  
  /**
   * List assets for a project by type
   */
  public async listAssets(
    projectId: string,
    type?: AssetType
  ): Promise<{ path: string; metadata: AssetMetadata }[]> {
    const { storage } = useFirebase();
    if (!storage) throw new Error('Firebase storage not initialized');
    
    try {
      const basePath = `projects/${projectId}/${type ? type + '/' : ''}`;
      const folderRef = storageRef(storage, basePath);
      
      // List files in the path
      const result = await list(folderRef);
      
      // Get metadata for each file
      const assets = await Promise.all(
        result.items.map(async (item) => {
          const metadataResponse = await getMetadata(item);
          const metadata = this.deserializeMetadata(metadataResponse.customMetadata || {});
          return {
            path: item.fullPath,
            metadata
          };
        })
      );
      
      return assets;
    } catch (error) {
      console.error(`Error listing assets for project ${projectId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete an asset
   */
  public async deleteAsset(path: string): Promise<void> {
    const { storage } = useFirebase();
    if (!storage) throw new Error('Firebase storage not initialized');
    
    try {
      const fileRef = storageRef(storage, path);
      await deleteObject(fileRef);
      
      // Remove from cache
      this.removeFromCache(path);
      
      console.log(`Asset deleted: ${path}`);
    } catch (error) {
      console.error(`Error deleting asset ${path}:`, error);
      throw error;
    }
  }
  
  /**
   * Clean up unused assets for a project
   * This will delete assets that haven't been accessed in a while
   */
  public async cleanupUnusedAssets(
    projectId: string,
    options: {
      olderThan?: number; // Days
      accessCountThreshold?: number;
      excludeTypes?: AssetType[];
    } = {}
  ): Promise<string[]> {
    const {
      olderThan = 30,
      accessCountThreshold = 0,
      excludeTypes = []
    } = options;
    
    try {
      // Get all assets for the project
      const assets = await this.listAssets(projectId);
      
      const deletedPaths: string[] = [];
      const now = new Date();
      const cutoffDate = new Date(now.setDate(now.getDate() - olderThan));
      
      for (const asset of assets) {
        // Skip excluded types
        if (asset.metadata.type && excludeTypes.includes(asset.metadata.type)) {
          continue;
        }
        
        // Check last accessed time
        if (asset.metadata.lastAccessed) {
          const lastAccessed = new Date(asset.metadata.lastAccessed);
          
          if (lastAccessed < cutoffDate && 
              (asset.metadata.accessCount || 0) <= accessCountThreshold) {
            // Delete the asset
            await this.deleteAsset(asset.path);
            deletedPaths.push(asset.path);
          }
        }
      }
      
      return deletedPaths;
    } catch (error) {
      console.error(`Error cleaning up assets for project ${projectId}:`, error);
      throw error;
    }
  }
  
  // Cache management
  private cache = new Map<string, { 
    lastAccessed: Date;
    accessCount: number; 
  }>();
  
  private cacheTTL = 1000 * 60 * 60 * 24; // 24 hours
  private maxCacheSize = 100; // Maximum number of items to cache
  
  /**
   * Track asset access in cache
   */
  private trackAssetAccess(path: string): void {
    const now = new Date();
    const entry = this.cache.get(path);
    
    if (entry) {
      entry.lastAccessed = now;
      entry.accessCount++;
    } else {
      // Check if cache is full before adding new item
      if (this.cache.size >= this.maxCacheSize) {
        this.cleanCache();
      }
      
      this.cache.set(path, {
        lastAccessed: now,
        accessCount: 1
      });
    }
    
    // Store cache in localStorage for persistence between sessions
    this.persistCache();
  }
  
  /**
   * Clean the cache by removing least recently used items
   */
  private cleanCache(): void {
    if (this.cache.size === 0) return;
    
    // Sort cache entries by last accessed time (oldest first)
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime());
    
    // Remove oldest entries until we're at 80% capacity
    const targetSize = Math.floor(this.maxCacheSize * 0.8);
    const entriesToRemove = this.cache.size - targetSize;
    
    if (entriesToRemove <= 0) return;
    
    for (let i = 0; i < entriesToRemove; i++) {
      if (entries[i]) {
        this.cache.delete(entries[i][0]);
      }
    }
    
    console.log(`Cleaned cache: removed ${entriesToRemove} items`);
  }
  
  /**
   * Remove an asset from the cache
   */
  private removeFromCache(path: string): void {
    this.cache.delete(path);
    this.persistCache();
  }
  
  /**
   * Persist cache to localStorage
   */
  private persistCache(): void {
    try {
      const cacheData = Array.from(this.cache.entries()).map(([path, data]) => ({
        path,
        lastAccessed: data.lastAccessed.toISOString(),
        accessCount: data.accessCount
      }));
      
      localStorage.setItem('assetCache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error persisting cache:', error);
    }
  }
  
  /**
   * Load cache from localStorage
   */
  public loadCache(): void {
    try {
      const cacheData = localStorage.getItem('assetCache');
      
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        
        parsed.forEach((item) => {
          this.cache.set(item.path, {
            lastAccessed: new Date(item.lastAccessed),
            accessCount: item.accessCount
          });
        });
        
        console.log(`Loaded cache with ${this.cache.size} items`);
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  }
  
  /**
   * Serialize metadata for Firebase storage
   */
  private serializeMetadata(metadata: AssetMetadata): Record<string, string> {
    const result: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(metadata)) {
      if (value === undefined) continue;
      
      if (typeof value === 'string') {
        result[key] = value;
      } else if (typeof value === 'number') {
        result[key] = value.toString();
      } else if (typeof value === 'boolean') {
        result[key] = value ? 'true' : 'false';
      } else if (Array.isArray(value)) {
        result[key] = JSON.stringify(value);
      } else if (typeof value === 'object') {
        result[key] = JSON.stringify(value);
      }
    }
    
    return result;
  }
  
  /**
   * Deserialize metadata from Firebase storage
   */
  private deserializeMetadata(metadata: Record<string, string>): AssetMetadata {
    const result: AssetMetadata = {};
    
    for (const [key, value] of Object.entries(metadata)) {
      if (key === 'size' || key === 'duration' || key === 'width' || 
          key === 'height' || key === 'accessCount') {
        result[key] = parseFloat(value);
      } else if (key === 'tags') {
        try {
          result[key] = JSON.parse(value);
        } catch (e) {
          result[key] = [];
        }
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
}

// Export singleton instance
export const storageManager = StorageManager.getInstance();
