export interface VideoProject {
  id: string;
  workspace_id: string;
  channel_id: string;
  owner_id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  status: 'draft' | 'in_progress' | 'ready_to_publish' | 'published' | 'archived';
  video_type: string;
  target_platform: string[];
  settings: {
    duration_target: number;
    format: string;
    quality: string;
  };
  template_id?: string;
  team_members?: Array<{
    user_id: string;
    role: string;
    added_at: Date | string;
  }>;
  schedule?: {
    publish_date: Date | string | null;
    time_zone: string;
    platforms: string[];
    status: string;
  } | null;
  stats?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  metadata: {
    tags: string[];
    category: string;
    language: string;
  };
  created_at: Date | string;
  updated_at: Date | string;
  published_at: Date | string | null;
  deleted_at: Date | string | null;
  vector?: number[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
  category: string;
  settings: {
    format: string;
    duration: number;
    scenes: Array<{
      type: string;
      duration: number;
      elements: Array<{
        type: string;
        position: { x: number; y: number };
        size: { width: number; height: number };
      }>;
    }>;
  };
  tags: string[];
  popularity: number;
  is_featured: boolean;
}
