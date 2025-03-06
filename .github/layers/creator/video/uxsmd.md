# Video Creator Platform Sitemap

## Overview

This document outlines the full sitemap for the Video Creator Platform, detailing the page structure, user flows, and navigation patterns. It serves as a blueprint for implementing the user experience across the application.

## Primary Navigation

The application features the following primary navigation sections:

- **Dashboard**: Overview of channels and recent projects
- **Channels**: Management of video channels
- **Projects**: Video project creation and management
- **Assets**: Management of reusable media assets
- **Analytics**: Performance tracking and insights
- **Settings**: User and account configuration

## Page Hierarchy

```
/creator/video/
│
├── dashboard/                          # Main dashboard landing page
│   └── recent-activity                 # Recent activity feed subsection
│
├── channels/                           # Channels section
│   ├── index                           # Channel listing page
│   ├── new                             # New channel creation page
│   └── [id]/                           # Individual channel pages
│       ├── overview                    # Channel overview dashboard
│       ├── projects                    # Projects within channel
│       ├── analytics                   # Channel analytics
│       ├── settings/                   # Channel settings
│       │   ├── general                 # General settings
│       │   ├── branding                # Branding and appearance
│       │   ├── team                    # Team management
│       │   └── integrations            # Platform connections
│       └── publish                     # Publishing dashboard
│
├── projects/                           # Projects section
│   ├── index                           # Project listing page
│   ├── new                             # New project creation page
│   └── [id]/                           # Individual project pages
│       ├── overview                    # Project overview
│       ├── edit                        # Quick edit project details
│       ├── assets                      # Project assets management
│       ├── preview                     # Project preview
│       ├── publish                     # Project publishing options
│       └── analytics                   # Project performance analytics
│
├── editor/                             # Video editor section
│   ├── [projectId]                     # Main editor for a project
│   ├── templates                       # Template browsing
│   └── elements/                       # Element library
│       ├── text                        # Text elements
│       ├── media                       # Media elements
│       ├── audio                       # Audio elements
│       └── effects                     # Effects and transitions
│
├── ai/                                 # AI tools section
│   ├── script-generator                # AI script generation
│   ├── voice-generator                 # AI voice generation
│   └── image-generator                 # AI image generation
│
├── assets/                             # Assets library
│   ├── browse                          # Browse all assets
│   ├── upload                          # Asset upload page
│   └── [id]                            # Individual asset details
│
├── analytics/                          # Analytics section
│   ├── overview                        # Overview of all analytics
│   ├── performance                     # Detailed performance metrics
│   ├── audience                        # Audience insights
│   └── reports                         # Custom reports
│
└── settings/                           # Account settings
    ├── profile                         # User profile settings
    ├── account                         # Account management
    ├── team                            # Team management
    ├── billing                         # Billing and subscription
    └── integrations                    # External service integrations
```

## User Flows

### New Channel Creation Flow

1. **Dashboard**: User starts on the dashboard
2. **Channel List**: User navigates to the channels section
3. **New Channel**: User clicks "Create New Channel" button
4. **Channel Setup**: User enters channel details and branding
5. **Platform Integration**: User connects external platforms (optional)
6. **Confirmation**: User reviews and confirms channel creation
7. **Channel Dashboard**: User is redirected to the new channel dashboard

### Video Creation Flow

1. **Channel Dashboard**: User starts on a channel dashboard
2. **New Project**: User creates a new project
3. **Project Setup**: User configures project parameters
4. **Content Generation**:
   - User generates script using AI tools
   - User creates voice-over from script
   - User generates/uploads visual assets
5. **Editor**: User arranges assets on the timeline
6. **Preview**: User previews the completed video
7. **Publishing**: User configures publishing options
8. **Confirmation**: User publishes or schedules the video

### Analytics Review Flow

1. **Dashboard**: User starts on the dashboard
2. **Analytics Overview**: User navigates to the analytics section
3. **Channel Selection**: User selects a specific channel
4. **Performance Metrics**: User reviews performance data
5. **Video Comparison**: User compares metrics across videos
6. **Insight Generation**: User generates custom reports
7. **Export**: User exports analytics data (optional)

## Page Descriptions

### Dashboard

**Purpose**: Provide an overview of all user activity across channels and projects

**Key Components**:
- Channel summary cards
- Recent project activity feed
- Performance snapshot
- Quick action buttons
- Notifications and alerts
- System status indicators

### Channels

**Purpose**: Manage video channels and their settings

**Key Components**:
- Channel listing with thumbnails and key metrics
- Channel creation form
- Channel dashboard with performance indicators
- Channel settings pages for branding and team management
- Platform connection management

### Projects

**Purpose**: Create and manage video projects within channels

**Key Components**:
- Project listing with thumbnails and status
- Project creation wizard
- Project dashboard with asset overview
- Quick edit capabilities for project metadata
- Preview functionality

### Editor

**Purpose**: Provide video editing capabilities for projects

**Key Components**:
- Timeline interface with multi-track support
- Canvas preview with real-time rendering
- Element library for adding components
- Property panel for editing selected elements
- Toolbar with common actions

### AI Tools

**Purpose**: Generate content using AI technologies

**Key Components**:
- Script generation interface with prompt input
- Voice generation with voice selection and customization
- Image generation with style controls and variations
- Generation history and saved outputs

### Assets Library

**Purpose**: Manage reusable media assets across projects

**Key Components**:
- Asset grid with filtering and search
- Asset details view with metadata
- Upload interface with batch capability
- Asset tagging and organization tools

### Analytics

**Purpose**: Track performance and gather insights

**Key Components**:
- Dashboard with key performance indicators
- Detailed metrics views with graphs
- Audience demographic information
- Custom report builder
- Export functionality

### Settings

**Purpose**: Configure account and application settings

**Key Components**:
- User profile management
- Account settings and preferences
- Team member management
- Billing and subscription information
- External service integrations

## Navigation Patterns

### Global Navigation

The primary navigation bar appears at the top of the application and contains:

- Logo/home link
- Primary section links (Dashboard, Channels, Projects, etc.)
- Search function
- User profile menu
- Notifications bell

### Contextual Navigation

Within each major section, a contextual sidebar provides:

- Section-specific subsections
- Quick filters
- Common actions
- Related links

### Breadcrumb Navigation

Breadcrumb trails appear below the top navigation to show:

- Current location in the application hierarchy
- Navigation path
- Quick access to parent sections

### Action Bars

Action bars appear at appropriate locations and contain:

- Context-specific actions (Save, Delete, Create, etc.)
- Filtering options
- View toggles
- Batch operations

## Responsive Considerations

The sitemap will adapt to different device sizes:

- **Mobile**: Primary sections collapse into a hamburger menu
- **Tablet**: Some secondary navigation may collapse
- **Desktop**: Full navigation visible

Page layouts will adjust accordingly, with complex interfaces like the video editor optimized for larger screens while maintaining basic functionality on mobile devices.
