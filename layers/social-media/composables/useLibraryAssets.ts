import { ref, computed, watch } from 'vue'
import { useAuth } from '../../auth/composables/auth'
import { useToaster } from '../../shared/composables/toaster'
import { useUploads } from '../../shared/composables/useUploads'
import type { LibraryAsset } from '../types'

export function useLibraryAssets() {
  const { isAuthenticated, getCurrentWorkspaceId, user } = useAuth()
  const { showError, showSuccess } = useToaster()
  const { upload } = useUploads()
  
  const assets = ref<LibraryAsset[]>([])
  const selectedAsset = ref<LibraryAsset | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedTags = ref<string[]>([])
  const assetType = ref<'all' | 'image' | 'video' | 'text' | 'template'>('all')
  const currentWorkspaceId = getCurrentWorkspaceId

  // Fetch assets when workspace changes
  watch(currentWorkspaceId, (newWorkspaceId) => {
    if (newWorkspaceId) {
      fetchAssets()
    }
  }, { immediate: true })

  // Fetch assets with filters
  const fetchAssets = async () => {
    if (!isAuthenticated.value || !currentWorkspaceId.value) return

    loading.value = true
    error.value = null

    try {
      // Build filters
      const filters: any = {
        workspace_id: currentWorkspaceId.value
      }

      // Add type filter if not 'all'
      if (assetType.value !== 'all') {
        filters.type = assetType.value
      }

      // Add tag filter if any selected
      if (selectedTags.value.length > 0) {
        filters.tags = { $containsAny: selectedTags.value }
      }

      const response = await $fetch('/api/data/read', {
        method: 'POST',
        body: {
          collection: 'library_assets',
          readType: 'query',
          filters,
          orderBy: 'created_at',
          orderDirection: 'desc'
        }
      })

      assets.value = response.data || []
    } catch (err: any) {
      console.error('Error fetching library assets:', err)
      error.value = err.message || 'Failed to load library assets'
      showError(error.value)
    } finally {
      loading.value = false
    }
  }

  // Upload new asset using the shared useUploads composable
  const uploadAsset = async (file: File, assetName: string, tags: string[] = []) => {
    if (!isAuthenticated.value || !currentWorkspaceId.value) return null

    loading.value = true
    error.value = null

    try {
      // First upload the file
      const uploadResult = await upload([file], tags)
      if (!uploadResult || !uploadResult.files || uploadResult.files.length === 0) {
        throw new Error('File upload failed')
      }

      const uploadedFile = uploadResult.files[0]

      // Determine asset type based on file mime type
      let type: 'image' | 'video' | 'text' | 'template' = 'image'
      if (file.type.startsWith('video/')) {
        type = 'video'
      } else if (file.type.startsWith('text/') || file.type.includes('document')) {
        type = 'text'
      }

      // Create library asset record
      const assetData: Partial<LibraryAsset> = {
        name: assetName || file.name,
        type,
        tags,
        url: uploadedFile.url,
        thumbnailUrl: uploadedFile.thumbnailUrl || uploadedFile.url,
        workspace_id: currentWorkspaceId.value,
        created_by: user.value?.id,
        metadata: {
          size: file.size,
          format: file.type,
          dimensions: uploadedFile.dimensions,
          duration: uploadedFile.duration
        },
        usage: {
          usedInContent: [],
          usageCount: 0
        }
      }

      const response = await $fetch('/api/data/write', {
        method: 'POST',
        body: {
          collection: 'library_assets',
          ...assetData
        }
      })

      // Add to the assets list
      const newAsset = response.data as LibraryAsset
      assets.value.unshift(newAsset)

      showSuccess('Asset uploaded successfully')
      return newAsset
    } catch (err: any) {
      console.error('Error uploading asset:', err)
      error.value = err.message || 'Failed to upload asset'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // Create a text template asset
  const createTemplate = async (name: string, content: string, tags: string[] = []) => {
    if (!isAuthenticated.value || !currentWorkspaceId.value) return null

    loading.value = true
    error.value = null

    try {
      const assetData: Partial<LibraryAsset> = {
        name,
        type: 'template',
        tags,
        content,
        workspace_id: currentWorkspaceId.value,
        created_by: user.value?.id,
        metadata: {
          size: content.length,
          format: 'text/plain'
        },
        usage: {
          usedInContent: [],
          usageCount: 0
        }
      }

      const response = await $fetch('/api/data/write', {
        method: 'POST',
        body: {
          collection: 'library_assets',
          ...assetData
        }
      })

      // Add to the assets list
      const newAsset = response.data as LibraryAsset
      assets.value.unshift(newAsset)

      showSuccess('Template created successfully')
      return newAsset
    } catch (err: any) {
      console.error('Error creating template:', err)
      error.value = err.message || 'Failed to create template'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // Update asset
  const updateAsset = async (assetId: string, updates: Partial<LibraryAsset>) => {
    if (!isAuthenticated.value) return null

    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/data/update', {
        method: 'POST',
        body: {
          collection: 'library_assets',
          id: assetId,
          ...updates
        }
      })

      // Update in the list
      const index = assets.value.findIndex(a => a.id === assetId)
      if (index !== -1) {
        assets.value[index] = response.data as LibraryAsset
      }

      // Update selected asset if it's the current one
      if (selectedAsset.value?.id === assetId) {
        selectedAsset.value = response.data as LibraryAsset
      }

      showSuccess('Asset updated successfully')
      return response.data as LibraryAsset
    } catch (err: any) {
      console.error('Error updating asset:', err)
      error.value = err.message || 'Failed to update asset'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete asset
  const deleteAsset = async (assetId: string) => {
    if (!isAuthenticated.value) return false

    loading.value = true
    error.value = null

    try {
      await $fetch('/api/data/delete', {
        method: 'POST',
        body: {
          collection: 'library_assets',
          id: assetId
        }
      })

      // Remove from list
      assets.value = assets.value.filter(a => a.id !== assetId)

      // Clear selected asset if it's the current one
      if (selectedAsset.value?.id === assetId) {
        selectedAsset.value = null
      }

      showSuccess('Asset deleted successfully')
      return true
    } catch (err: any) {
      console.error('Error deleting asset:', err)
      error.value = err.message || 'Failed to delete asset'
      showError(error.value)
      return false
    } finally {
      loading.value = false
    }
  }

  // Record usage of an asset
  const recordAssetUsage = async (assetId: string, contentId: string) => {
    const asset = assets.value.find(a => a.id === assetId)
    if (!asset || !isAuthenticated.value) return null

    // Check if already recorded
    if (asset.usage.usedInContent.includes(contentId)) {
      return asset
    }

    loading.value = true
    error.value = null

    try {
      // Add content ID to usage array and increment count
      const usedInContent = [...asset.usage.usedInContent, contentId]
      const usageCount = asset.usage.usageCount + 1

      const response = await updateAsset(assetId, {
        usage: {
          usedInContent,
          usageCount,
          lastUsed: new Date()
        }
      })

      return response
    } catch (err: any) {
      console.error('Error recording asset usage:', err)
      error.value = err.message || 'Failed to record asset usage'
      return null
    } finally {
      loading.value = false
    }
  }

  // Filter assets by type
  const filterByType = (type: 'all' | 'image' | 'video' | 'text' | 'template') => {
    assetType.value = type
    fetchAssets()
  }

  // Filter assets by tags
  const filterByTags = (tags: string[]) => {
    selectedTags.value = tags
    fetchAssets()
  }

  // Search assets by name
  const searchAssets = (query: string) => {
    searchQuery.value = query
  }

  // Filtered assets based on search query
  const filteredAssets = computed(() => {
    if (!searchQuery.value) return assets.value

    const query = searchQuery.value.toLowerCase()
    return assets.value.filter(asset => 
      asset.name.toLowerCase().includes(query) || 
      asset.tags.some(tag => tag.toLowerCase().includes(query))
    )
  })

  // Group assets by type
  const assetsByType = computed(() => {
    const result = {
      image: [] as LibraryAsset[],
      video: [] as LibraryAsset[],
      text: [] as LibraryAsset[],
      template: [] as LibraryAsset[]
    }

    filteredAssets.value.forEach(asset => {
      if (result[asset.type]) {
        result[asset.type].push(asset)
      }
    })

    return result
  })

  // Get all tags from assets
  const allTags = computed(() => {
    const tagSet = new Set<string>()
    assets.value.forEach(asset => {
      asset.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  })

  return {
    assets,
    filteredAssets,
    assetsByType,
    selectedAsset,
    loading,
    error,
    searchQuery,
    selectedTags,
    assetType,
    allTags,
    fetchAssets,
    uploadAsset,
    createTemplate,
    updateAsset,
    deleteAsset,
    recordAssetUsage,
    filterByType,
    filterByTags,
    searchAssets
  }
}