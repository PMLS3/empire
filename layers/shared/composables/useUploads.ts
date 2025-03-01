import { ref, computed } from 'vue'
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { useFirebase } from '../../auth/composables/firebase'
import type { Upload, UploadFolder, UploadProgress } from '~/types/uploads'
import { useAuth } from '../../auth/composables/auth'
import { useToaster } from './toaster'

export function useUploads() {
  const { currentWorkspace, user } = useAuth()
  const { showError, showSuccess } = useToaster()

  const uploadsItems = useState<Upload[]>('uploadsItems', () => [])
  const uploadsFolders = useState<UploadFolder[]>('uploadsFolders', () => [])
  const selectedFolders = useState<UploadFolder[]>('selectedFolders', () => [])
  const uploadProgress = useState<Record<string, UploadProgress>>('uploadProgress', () => ({}))
  const isLoading = useState<boolean>('isLoading', () => false)

  // Filter items based on current folder
  const filteredItems = computed(() => {
    const currentFolderId = selectedFolders.value.length > 0 
      ? selectedFolders.value[selectedFolders.value.length - 1].id 
      : null

    return uploadsItems.value.filter(item => 
      item.folder_id === currentFolderId && 
      !item.deleted_at
    )
  })

  // Filter folders based on current folder
  const filteredFolders = computed(() => {
    const currentFolderId = selectedFolders.value.length > 0 
      ? selectedFolders.value[selectedFolders.value.length - 1].id 
      : null

    return uploadsFolders.value.filter(folder => 
      folder.parent_id === currentFolderId
    )
  })

  // Upload files using Firebase Storage and process with understanding API
  async function upload(files: File[], tags: string[] = []) {
    const { storage } = useFirebase()
    if (!storage) throw new Error('Firebase storage not initialized')
    
    for (const file of files) {
      // Initialize progress for this file
      uploadProgress.value[file.name] = {
        progress: 0,
        status: 'uploading'
      }
    }

    try {
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          // 1. Upload to Firebase Storage
          const sanitizedName = file.name.replace(/[^a-z0-9_.-]/gi, '_')
          const fileRef = storageRef(storage, `uploads/${Date.now()}-${sanitizedName}`)
          const uploadTask = uploadBytesResumable(fileRef, file)

          // Track upload progress
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 50 // First 50%
              uploadProgress.value[file.name] = {
                progress: Math.round(progress),
                status: 'uploading'
              }
            }
          )

          // Wait for upload to complete
          await uploadTask
          const downloadURL = await getDownloadURL(fileRef)

          // 2. Process file with understanding API
          uploadProgress.value[file.name] = {
            progress: 75,
            status: 'processing'
          }

          const formData = new FormData()
          formData.append('file', file)
          
          if (tags.length) {
            formData.append('tags', JSON.stringify(tags))
          }

          // Send to understanding API
          const understanding = await $fetch<{
            success: boolean
            understandings: {
              file: { src: string; type: string }
              understanding: string
              chunks?: string[]
              transcript?: string
              usageMetadata?: any
            }
          }>('/api/uploads/understanding', {
            method: 'POST',
            body: formData
          })

          if (!understanding.success) {
            throw new Error('Failed to process file')
          }

          // 3. Create database record
          const response = await $fetch<{ files: Upload[] }>('/api/uploads', {
            method: 'POST',
            body: {
              name: file.name,
              type: file.type,
              size: file.size,
              url: downloadURL,
              understanding: understanding.understandings?.understanding ? {
                summary: understanding.understandings.understanding,
                content_type: file.type,
                chunks: understanding.understandings.chunks
              } : undefined,
              folder_id: selectedFolders.value.length ? selectedFolders.value[selectedFolders.value.length - 1].id : null
            }
          })

          uploadProgress.value[file.name] = {
            progress: 100,
            status: 'completed'
          }

          return response.files[0]
        })
      )

      // Add to items list
      uploadsItems.value.push(...uploadedFiles)
      return { files: uploadedFiles }

    } catch (error) {
      // Handle errors
      for (const file of files) {
        uploadProgress.value[file.name] = {
          progress: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        }
      }
      console.error('Upload error:', error)
      showError('Upload failed')
      throw error
    }
  }

  // Load data
  async function loadData() {
    if (!currentWorkspace.value?.id) return

    isLoading.value = true
    try {
      // Load folders
      const foldersResponse = await $fetch('/api/uploads/folders', {
        params: {
          parentId: selectedFolders.value.length > 0 
            ? selectedFolders.value[selectedFolders.value.length - 1].id 
            : null,
            token: user.value?.token.idToken
        }
      })
      uploadsFolders.value = foldersResponse as UploadFolder[]

      // Load uploads
      const uploadsResponse = await $fetch('/api/uploads', {
        params: {
          folderId: selectedFolders.value.length > 0 
            ? selectedFolders.value[selectedFolders.value.length - 1].id 
            : null,
            token: user.value?.token.idToken
        }
      })
      uploadsItems.value = uploadsResponse as Upload[]
    } catch (error) {
      console.error('Failed to load uploads data:', error)
      showError('Failed to load uploads data')
    } finally {
      isLoading.value = false
    }
  }

  // Create folder
  async function createFolder(name: string, parentId: string | null = null) {
    if (!currentWorkspace.value?.id) return

    try {
      const response = await $fetch<UploadFolder>('/api/uploads/folders', {
        method: 'POST',
        body: {
          name,
          parentId,
          token: user.value?.token.idToken
        }
      })
      
      uploadsFolders.value.push(response)
      showSuccess('Folder created successfully')
      return response
    } catch (error) {
      console.error('Failed to create folder:', error)
      showError('Failed to create folder')
      throw error
    }
  }

  // Delete upload
  async function deleteUpload(id: string) {
    try {
      await $fetch(`/api/uploads/${id}`, {
        method: 'DELETE'
      })
      
      const index = uploadsItems.value.findIndex(item => item.id === id)
      if (index !== -1) {
        uploadsItems.value.splice(index, 1)
      }
      
      showSuccess('File deleted successfully')
    } catch (error) {
      console.error('Failed to delete file:', error)
      showError('Failed to delete file')
      throw error
    }
  }

  // Delete folder
  async function deleteFolder(id: string) {
    try {
      await $fetch(`/api/uploads/folders/${id}`, {
        method: 'DELETE'
      })
      
      const index = uploadsFolders.value.findIndex(folder => folder.id === id)
      if (index !== -1) {
        uploadsFolders.value.splice(index, 1)
      }
      
      showSuccess('Folder deleted successfully')
    } catch (error) {
      console.error('Failed to delete folder:', error)
      showError('Failed to delete folder')
      throw error
    }
  }

  return {
    uploadsItems,
    uploadsFolders,
    selectedFolders,
    uploadProgress,
    filteredItems,
    filteredFolders,
    isLoading,
    upload,
    loadData,
    createFolder,
    deleteUpload,
    deleteFolder
  }
} 