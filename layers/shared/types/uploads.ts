export interface Upload {
    id: string
    name: string
    type: string
    size: number
    url: string
    thumbnail_url?: string
    owner_id: string
    workspace_id: string
    folder_id?: string
    shared: boolean
    understanding?: Record<string, any>
    created_at: Date
    updated_at: Date
    deleted_at?: Date
}
  
export interface UploadFolder {
    id: string
    name: string
    created_at: string
    updated_at: string
    shared: boolean
    owner_id: string
    workspace_id: string
    parent_id: string | null
}
  
export interface UploadProgress {
    progress: number
    status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
    error?: string
}