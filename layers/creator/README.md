# Video Creator Platform

A comprehensive video creation, editing, and publishing platform built with Vue.js and Nuxt.js, designed to help creators streamline their workflow from ideation to distribution.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Pages & Components](#pages--components)
- [AI Capabilities](#ai-capabilities)
- [Asset Management](#asset-management)
- [Project Management](#project-management)
- [Channel Management](#channel-management)
- [Settings & Configuration](#settings--configuration)
- [Development](#development)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Contributing](#contributing)

## 🔍 Overview

The Video Creator Platform is a comprehensive web application that empowers content creators to produce high-quality videos using AI-assisted tools, manage their projects, and publish content directly to various social media platforms. The platform combines traditional video editing capabilities with cutting-edge AI features for script generation, voice synthesis, image creation, and more.

## ✨ Features

### Core Features
- **Project Management** - Create, edit, and manage video projects
- **Timeline-based Editor** - Arrange scenes, transitions, and elements
- **Asset Library** - Manage your video, audio, and image assets
- **AI-Assisted Creation** - Generate scripts, images, and voiceovers with AI
- **Publishing** - Export and publish videos to various platforms
- **Analytics** - Track performance across different platforms
- **Collaboration** - Work with team members on projects
- **Templates** - Start new projects using pre-made templates

### AI Capabilities
- Script generation for different video styles
- Text-to-speech voiceover synthesis
- AI image generation for video assets
- Video rendering and processing

### Platform Integrations
- YouTube
- TikTok
- Instagram
- Facebook
- Twitter
- LinkedIn

## 🏛️ Architecture

The application is built using the following tech stack:
- **Framework**: Vue.js 3 with Composition API
- **Meta-framework**: Nuxt.js 3
- **UI Library**: Custom components based on BaseComponents
- **State Management**: Vue's Composition API with reactive references
- **API Integration**: Fetch API with Nuxt's $fetch utility
- **File Storage**: Cloud storage integration with useStorage composable
- **Authentication**: Token-based authentication through the auth layer
- **AI Services**: Integration with various AI services via the ai layer

## 📑 Pages & Components

### Dashboard & Navigation
- `/creator/dashboard` - Overview dashboard
- `/creator/activity` - User activity timeline
- `/creator/analytics` - Performance analytics for published content

### Projects
- `/creator/projects` - List all projects
- `/creator/projects/new` - Create a new project
- `/creator/projects/[id]` - Project details
- `/creator/projects/[id]/edit` - Project editor

### Templates
- `/creator/templates` - Browse available templates

### Assets Management
- `/creator/assets/upload` - Upload new assets
- `/creator/assets/audio` - Audio library
- `/creator/assets/images` - Image library

### Channel Management
- `/creator/channel` - Channel overview
- `/creator/channel/connect` - Connect new channels
- `/creator/channel/settings/[id]` - Channel settings

### AI Tools
- `/creator/tools/script` - AI script generator
- `/creator/tools/voice` - AI voice generator
- `/creator/tools/image` - AI image generator

### Settings
- `/creator/settings` - User preferences
- `/creator/settings/export` - Export settings
- `/creator/settings/connections` - Platform connections
- `/creator/settings/team` - Team access management
- `/creator/settings/moderation` - Content moderation settings

### System Pages
- `/creator/system/jobs` - Background job status

## 🧠 AI Capabilities

### Script Generation
The platform features an AI-powered script generator that can create scripts based on various templates and styles:
- Educational content
- Storytelling narratives
- Product reviews
- Tutorials
- Entertainment content

The script generator accepts specific prompts and can refine existing scripts to be shorter, longer, simpler, or more conversational.

### Voice Generation
Convert text to natural-sounding speech with the following features:
- Multiple voice options across different languages
- Adjustable speaking rate, pitch, and volume
- Preview and download capabilities
- Integration with projects

### Image Generation
Create custom images for your videos with AI:
- Detailed prompt-based generation
- Negative prompts for exclusions
- Multiple aspect ratio options
- Style selection (vivid, natural, cinematic, etc.)
- Export to projects or download

## 📦 Asset Management

### Upload Capabilities
Upload and manage various file types:
- Videos (MP4, MOV, WEBM, etc.)
- Audio (MP3, WAV, OGG, etc.)
- Images (JPG, PNG, GIF, WebP, etc.)
- Captions (SRT, VTT)

### Organization
Assets are organized by:
- Type (video, audio, image, caption)
- Project association
- Custom tags
- Date added
- Size/duration

## 📽️ Project Management

### Project Types
- Traditional video projects
- Short-form video content
- Presentations
- Social media content

### Editor Features
- Timeline-based editing
- Scene arrangement
- Transition effects
- Text overlay and captions
- Audio tracks and mixing
- Version history

### Collaboration
- Team member invitations
- Role-based permissions
- Comments and feedback
- Activity tracking

## 📡 Channel Management

### Supported Platforms
- YouTube
- TikTok
- Instagram
- Facebook
- Twitter
- LinkedIn

### Features
- OAuth authentication with platforms
- Channel analytics integration
- Direct publishing
- Scheduling capabilities
- Audience insights

## ⚙️ Settings & Configuration

### User Preferences
- Default project settings
- Interface preferences
- Notification settings
- Accessibility options
- Privacy settings

### Export Settings
- Video format configuration
- Audio settings
- Destination options
- Watermarking
- Optimization settings

### Team Management
- Role-based access control
- Invitation system
- Activity monitoring
- Permission management

### Content Moderation
- Automatic content screening
- Copyright protection
- Age restriction settings
- Legal compliance options

## 🛠️ Development

### Setup
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Project Structure
- `/components` - Reusable Vue components
- `/composables` - Shared composition functions
- `/pages` - Application routes and views
- `/utils` - Utility functions
- `/server` - API endpoints and server middleware

## 🔌 API Integration

### Internal APIs
- `/api/data/*` - Data CRUD operations
- `/api/ai/*` - AI service endpoints
- `/api/jobs/*` - Background job management
- `/api/integrations/*` - Platform integration endpoints

### External Services
- AI providers for text, speech, and image generation
- Video processing and rendering services
- Social media platform APIs
- Storage providers

## 🧪 Testing

The project includes various testing utilities:
- Unit tests for utility functions
- Component tests for UI elements
- API endpoint tests
- Performance testing utilities

Run tests with:
```bash
pnpm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the [MIT License](LICENSE).
