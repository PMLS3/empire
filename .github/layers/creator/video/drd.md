# Database Requirements Document (DRD)

## Overview

The Video Creator platform requires a robust database structure to store and manage user channels, video projects, assets, and related metadata. This document outlines the database requirements, schema design, and optimization strategies for the platform.

## Database Technology

The platform will use Firestore as the primary database, leveraging its document-oriented structure and vector search capabilities. This aligns with the existing architecture and ensures compatibility with other system components.

## Collections and Schema

### 1. Channels Collection

**Collection Name**: `creator_channels`

**Document Structure**:

```typescript
interface CreatorChannel {
  id: string;                 // Unique identifier
  workspace_id: string;       // Associated workspace
  owner_id: string;           // Owner user ID
  name: string;               // Channel name
  description: string;        // Channel description
  branding: {
    logo_url: string;         // Logo image URL
    banner_url: string;       // Banner image URL
    color_scheme: {
      primary: string;        // Primary brand color
      secondary: string;      // Secondary brand color
      accent: string;         // Accent color
    }
  };
  settings: {
    default_platforms: string[];  // Default publishing platforms
    auto_publish: boolean;        // Whether to auto-publish
    template_id: string;          // Default template
  };
  team_members: {
    user_id: string;          // User ID
    role: string;             // Role (owner, editor, viewer)
    added_at: Timestamp;      // When added
  }[];
  platform_connections: {
    platform: string;         // Platform name (youtube, tiktok, etc.)
    connected: boolean;       // Connection status
    account_name: string;     // Connected account name
    refresh_token: string;    // Token for refresh (encrypted)
  }[];
  stats: {
    total_videos: number;     // Total videos in channel
    published_videos: number; // Published videos count
    total_views: number;      // Total view count
    total_engagement: number; // Total engagement count
  };
  created_at: Timestamp;      // Creation timestamp
  updated_at: Timestamp;      // Last update timestamp
  deleted_at: Timestamp | null; // Soft delete timestamp
  vector?: number[];          // Vector embedding for search
}
```

**Indexes**:
- Compound index on `workspace_id` and `deleted_at` for efficient querying
- Compound index on `owner_id` and `deleted_at` for user's channels
- Vector index on `vector` field for semantic search

### 2. Projects Collection

**Collection Name**: `creator_projects`

**Document Structure**:

```typescript
interface CreatorProject {
  id: string;                 // Unique identifier
  workspace_id: string;       // Associated workspace
  channel_id: string;         // Parent channel ID
  owner_id: string;           // Owner user ID
  title: string;              // Project title
  description: string;        // Project description
  thumbnail_url: string;      // Thumbnail image URL
  status: 'draft' | 'in_progress' | 'ready_to_publish' | 'published' | 'archived'; // Project status
  video_type: string;         // Type of video (explainer, tutorial, etc.)
  target_platform: string[];  // Target platform(s)
  settings: {
    duration_target: number;  // Target duration in seconds
    format: string;           // Video format (16:9, 9:16, etc.)
    quality: string;          // Video quality (HD, 4K, etc.)
  };
  team_members: {
    user_id: string;          // User ID
    role: string;             // Role (owner, editor, viewer)
    added_at: Timestamp;      // When added
  }[];
  schedule: {
    publish_date: Timestamp;  // Scheduled publish date
    time_zone: string;        // Time zone
    platforms: string[];      // Platforms to publish to
    status: string;           // Schedule status
  } | null;
  stats: {
    views: number;            // View count
    likes: number;            // Like count
    comments: number;         // Comment count
    shares: number;           // Share count
  };
  metadata: {
    tags: string[];           // Content tags
    category: string;         // Content category
    language: string;         // Content language
  };
  created_at: Timestamp;      // Creation timestamp
  updated_at: Timestamp;      // Last update timestamp
  published_at: Timestamp | null; // Publish timestamp
  deleted_at: Timestamp | null; // Soft delete timestamp
  vector?: number[];          // Vector embedding for search
}
```

**Indexes**:
- Compound index on `channel_id`, `status`, and `deleted_at` for channel dashboard
- Compound index on `workspace_id` and `deleted_at` for workspace queries
- Compound index on `owner_id`, `status`, and `deleted_at` for user's projects
- Vector index on `vector` field for semantic search

### 3. Assets Collection

**Collection Name**: `creator_assets`

**Document Structure**:

```typescript
interface CreatorAsset {
  id: string;                 // Unique identifier
  workspace_id: string;       // Associated workspace
  project_id: string;         // Parent project ID
  owner_id: string;           // Owner user ID
  type: 'script' | 'audio' | 'image' | 'video' | 'subtitle' | 'other'; // Asset type
  name: string;               // Asset name
  description: string;        // Asset description
  url: string;                // Storage URL
  thumbnail_url: string;      // Thumbnail URL (if applicable)
  metadata: {
    duration?: number;        // Duration in seconds (for audio/video)
    dimensions?: {            // Dimensions (for image/video)
      width: number;
      height: number;
    };
    format: string;           // File format
    size: number;             // File size in bytes
    generated?: boolean;      // Whether asset was AI-generated
    generation_params?: any;  // Parameters used for generation
  };
  content: {
    text?: string;            // Text content (for scripts)
    transcript?: string;      // Transcript (for audio/video)
    alt_text?: string;        // Alt text (for images)
  };
  ai_metadata: {              // Only present for AI-generated assets
    model: string;            // AI model used
    prompt: string;           // Prompt used for generation
    settings: any;            // Model-specific settings
    processing_time: number;  // Time taken to generate
  } | null;
  status: 'pending' | 'processing' | 'completed' | 'failed'; // Processing status
  version: number;            // Version number
  created_at: Timestamp;      // Creation timestamp
  updated_at: Timestamp;      // Last update timestamp
  deleted_at: Timestamp | null; // Soft delete timestamp
  vector?: number[];          // Vector embedding for search (scripts/transcripts)
}
```

**Indexes**:
- Compound index on `project_id`, `type`, and `deleted_at` for project assets
- Compound index on `workspace_id` and `deleted_at` for workspace assets
- Vector index on `vector` field for semantic search (for text-based assets)

### 4. Compositions Collection

**Collection Name**: `creator_compositions`

**Document Structure**:

```typescript
interface CreatorComposition {
  id: string;                 // Unique identifier
  workspace_id: string;       // Associated workspace
  project_id: string;         // Parent project ID
  owner_id: string;           // Owner user ID
  name: string;               // Composition name
  description: string;        // Composition description
  timeline: {
    duration: number;         // Total duration in seconds
    layers: {
      id: string;             // Layer ID
      name: string;           // Layer name
      type: string;           // Layer type
      visible: boolean;       // Layer visibility
      locked: boolean;        // Layer lock status
      elements: {
        id: string;           // Element ID
        asset_id: string;     // Referenced asset ID
        start_time: number;   // Start time in seconds
        end_time: number;     // End time in seconds
        position: {           // Position in frame
          x: number;
          y: number;
          z: number;
        };
        scale: {              // Scale factor
          x: number;
          y: number;
        };
        rotation: number;     // Rotation in degrees
        opacity: number;      // Opacity (0-1)
        trim: {               // Trim settings
          start: number;
          end: number;
        };
        effects: {            // Applied effects
          id: string;
          type: string;
          params: any;
        }[];
      }[];
    }[];
  };
  export_settings: {
    format: string;           // Export format
    resolution: {             // Resolution
      width: number;
      height: number;
    };
    frame_rate: number;       // Frame rate
    quality: string;          // Quality preset
    bit_rate?: number;        // Bit rate if custom
  };
  version: number;            // Version number
  created_at: Timestamp;      // Creation timestamp
  updated_at: Timestamp;      // Last update timestamp
  deleted_at: Timestamp | null; // Soft delete timestamp
}
```

**Indexes**:
- Compound index on `project_id` and `deleted_at` for project compositions
- Compound index on `workspace_id` and `deleted_at` for workspace compositions

### 5. Publishing Collection

**Collection Name**: `creator_publishing`

**Document Structure**:

```typescript
interface CreatorPublishing {
  id: string;                 // Unique identifier
  workspace_id: string;       // Associated workspace
  project_id: string;         // Parent project ID
  owner_id: string;           // Owner user ID
  composition_id: string;     // Referenced composition ID
  platform: string;           // Target platform
  status: 'draft' | 'scheduled' | 'processing' | 'published' | 'failed'; // Publishing status
  schedule: {
    publish_date: Timestamp;  // Scheduled publish date
    time_zone: string;        // Time zone
  } | null;
  metadata: {
    title: string;            // Publication title
    description: string;      // Publication description
    tags: string[];           // Publication tags
    category: string;         // Publication category
    visibility: string;       // Publication visibility
    location?: string;        // Publication location
    custom_thumbnail?: string; // Custom thumbnail URL
  };
  platform_data: {
    platform_id?: string;     // ID on the platform
    url?: string;             // URL on the platform
    account_id: string;       // Platform account ID
  };
  analytics: {
    views: number;            // View count
    likes: number;            // Like count
    comments: number;         // Comment count
    shares: number;           // Share count
    watch_time: number;       // Total watch time
    last_updated: Timestamp;  // Last analytics update
  };
  created_at: Timestamp;      // Creation timestamp
  updated_at: Timestamp;      // Last update timestamp
  published_at: Timestamp | null; // Publication timestamp
  deleted_at: Timestamp | null; // Soft delete timestamp
}
```

**Indexes**:
- Compound index on `project_id` and `status` for project publications
- Compound index on `workspace_id` and `status` for workspace publications
- Compound index on `schedule.publish_date` and `status` for scheduled publications

### 6. Tasks Collection

**Collection Name**: `creator_tasks`

**Document Structure**:

```typescript
interface CreatorTask {
  id: string;                 // Unique identifier
  workspace_id: string;       // Associated workspace
  project_id: string;         // Parent project ID
  user_id: string;            // User who created the task
  type: 'script_generation' | 'voice_generation' | 'image_generation' | 'video_rendering' | 'publishing'; // Task type
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'; // Task status
  priority: number;           // Task priority (1-5)
  progress: number;           // Progress percentage (0-100)
  request: {                  // Task request parameters
    model: string;            // Model name
    params: any;              // Model parameters
    input_ids: string[];      // Input asset IDs
  };
  result: {                   // Task result data
    output_ids: string[];     // Output asset IDs
    error?: string;           // Error message if failed
  } | null;
  started_at: Timestamp | null; // Processing start timestamp
  completed_at: Timestamp | null; // Completion timestamp
  created_at: Timestamp;      // Creation timestamp
  updated_at: Timestamp;      // Last update timestamp
  deleted_at: Timestamp | null; // Soft delete timestamp
}
```

**Indexes**:
- Compound index on `status` and `priority` for task queue processing
- Compound index on `project_id` and `status` for project tasks
- Compound index on `type` and `status` for type-specific task queries

## Vector Search Implementation

### Fields to Embed

1. **Channels**:
   - `name`
   - `description`

2. **Projects**:
   - `title`
   - `description`

3. **Assets**:
   - `name`
   - `description`
   - `content.text` (for scripts)
   - `content.transcript` (for audio/video)

### Vector Index Configuration

Vector indexes will be created in Firestore with the following configuration:

```typescript
const vectorConfig = {
  dimensions: 1536,  // For embeddings from standard models
  distance: "COSINE", // Distance metric
  fieldName: "vector"
}
```

## Data Relationships

### One-to-Many Relationships
- Workspace to Channels (one workspace has many channels)
- Channel to Projects (one channel has many projects)
- Project to Assets (one project has many assets)
- Project to Compositions (one project has many compositions)
- Project to Publications (one project has many publications)

### Many-to-Many Relationships
- Users to Channels (via team_members array)
- Users to Projects (via team_members array)

## Data Migration Strategy

1. **Initial Data Setup**:
   - Create base collections and indexes
   - Set up test data for development

2. **Beta Migration**:
   - Migrate limited user set for beta testing
   - Validate data integrity and performance

3. **Full Migration**:
   - Complete migration with data verification
   - Monitor performance metrics

## Data Retention Policy

1. **Active Data**:
   - All active channels, projects, and related data
   - Immediately accessible in Firestore

2. **Archived Data**:
   - Projects marked as archived
   - Accessible but not shown in default views

3. **Deleted Data**:
   - Soft-deleted with timestamp
   - Permanently removed after 30 days
   - Associated assets moved to cold storage

## Database Security Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Base rule - authenticate to read any data
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Channels collection
    match /creator_channels/{channelId} {
      allow read: if request.auth != null && 
        (resource.data.workspace_id == request.auth.token.workspace_id ||
         resource.data.team_members[].user_id.hasAny([request.auth.uid]));
      allow create: if request.auth != null && 
        request.resource.data.workspace_id == request.auth.token.workspace_id;
      allow update: if request.auth != null &&
        (resource.data.owner_id == request.auth.uid ||
         resource.data.team_members[].user_id.hasAny([request.auth.uid]) &&
         resource.data.team_members[request.auth.uid].role == "editor");
      allow delete: if request.auth != null && 
        resource.data.owner_id == request.auth.uid;
    }
    
    // Projects collection
    match /creator_projects/{projectId} {
      allow read: if request.auth != null && 
        (resource.data.workspace_id == request.auth.token.workspace_id ||
         resource.data.team_members[].user_id.hasAny([request.auth.uid]));
      allow create: if request.auth != null && 
        request.resource.data.workspace_id == request.auth.token.workspace_id;
      allow update: if request.auth != null &&
        (resource.data.owner_id == request.auth.uid ||
         resource.data.team_members[].user_id.hasAny([request.auth.uid]) &&
         resource.data.team_members[request.auth.uid].role == "editor");
      allow delete: if request.auth != null && 
        resource.data.owner_id == request.auth.uid;
    }
    
    // Assets collection
    match /creator_assets/{assetId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/creator_projects/$(resource.data.project_id)) &&
        get(/databases/$(database)/documents/creator_projects/$(resource.data.project_id)).data.team_members[].user_id.hasAny([request.auth.uid]);
      allow create, update: if request.auth != null &&
        exists(/databases/$(database)/documents/creator_projects/$(request.resource.data.project_id)) &&
        (get(/databases/$(database)/documents/creator_projects/$(request.resource.data.project_id)).data.owner_id == request.auth.uid ||
         get(/databases/$(database)/documents/creator_projects/$(request.resource.data.project_id)).data.team_members[].user_id.hasAny([request.auth.uid]) &&
         get(/databases/$(database)/documents/creator_projects/$(request.resource.data.project_id)).data.team_members[request.auth.uid].role == "editor");
      allow delete: if request.auth != null && 
        exists(/databases/$(database)/documents/creator_projects/$(resource.data.project_id)) &&
        get(/databases/$(database)/documents/creator_projects/$(resource.data.project_id)).data.owner_id == request.auth.uid;
    }
    
    // Compositions collection
    match /creator_compositions/{compositionId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/creator_projects/$(resource.data.project_id)) &&
        get(/databases/$(database)/documents/creator_projects/$(resource.data.project_id)).data.team_members[].user_id.hasAny([request.auth.uid]);
      allow create, update: if request.auth != null &&
        exists(/databases/$(database)/documents/creator_projects/$(request.resource.data.project_id)) &&
        (get(/databases/$(database)/documents/creator_projects/$(request.resource.data.project_id)).data.owner_id == request.auth.uid ||
         get(/databases/$(database)/documents/creator_projects/$(request.resource.data.project_id)).data.team_members[].user_id.hasAny([request.auth.uid]) &&
         get(/databases/$(database)/documents/creator_projects/$(request.resource.data.project_id)).data.team_members[request.auth.uid].role == "editor");
      allow delete: if request.auth != null && 
        exists(/databases/$(database)/documents/creator_projects/$(resource.data.project_id)) &&
        get(/databases/$(database)/documents/creator_projects/$(resource.data.project_id)).data.owner_id == request.auth.uid;
    }
  }
}


