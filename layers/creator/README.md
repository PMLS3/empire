# Creator Platform

A comprehensive content creation, editing, and publishing platform built with Vue.js and Nuxt.js, designed to help creators streamline their workflow from ideation to distribution. The platform supports both video and book publishing workflows.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Pages & Components](#pages--components)
- [AI Capabilities](#ai-capabilities)
- [Asset Management](#asset-management)
- [Project Management](#project-management)
- [Channel Management](#channel-management)
- [Book Publishing](#book-publishing)
- [Settings & Configuration](#settings--configuration)
- [Development](#development)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Contributing](#contributing)

## 🔍 Overview

The Creator Platform is a comprehensive web application that empowers content creators to produce high-quality videos and books using AI-assisted tools, manage their projects, and publish content directly to various platforms. The platform combines traditional editing capabilities with cutting-edge AI features for script generation, voice synthesis, image creation, text enhancement, and more.

## ✨ Features

### Core Features
- **Project Management** - Create, edit, and manage video and book projects
- **Timeline-based Editor** - Arrange scenes, transitions, and elements for videos
- **Book Editor** - Write, format, and organize book content with chapters and sections
- **Asset Library** - Manage your video, audio, image, and text assets
- **AI-Assisted Creation** - Generate scripts, images, voiceovers, and text with AI
- **Publishing** - Export and publish videos and books to various platforms
- **Analytics** - Track performance across different platforms
- **Collaboration** - Work with team members on projects
- **Templates** - Start new projects using pre-made templates

### AI Capabilities
- Script and text generation for different styles
- Text-to-speech voiceover synthesis
- AI image generation for video assets and book covers/illustrations
- Video rendering and processing
- Text enhancement and editing suggestions

### Platform Integrations
- YouTube
- TikTok
- Instagram
- Facebook
- Twitter
- LinkedIn
- Amazon KDP
- Apple Books
- Google Play Books
- Kobo

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

### Video Projects
- `/creator/video/projects` - List all video projects
- `/creator/video/projects/new` - Create a new video project
- `/creator/video/projects/[id]` - Video project details
- `/creator/video/projects/[id]/edit` - Video project editor

### Book Projects
- `/creator/book/projects` - List all book projects
- `/creator/book/projects/new` - Create a new book project
- `/creator/book/projects/[id]` - Book project details
- `/creator/book/projects/[id]/edit` - Book project editor
- `/creator/book/projects/[id]/preview` - Book preview

### Templates
- `/creator/video/templates` - Browse available video templates
- `/creator/book/templates` - Browse available book templates

### Assets Management
- `/creator/assets/upload` - Upload new assets
- `/creator/assets/audio` - Audio library
- `/creator/assets/images` - Image library
- `/creator/assets/text` - Text snippets library

### Channel Management
- `/creator/channel` - Channel overview
- `/creator/channel/connect` - Connect new channels
- `/creator/channel/settings/[id]` - Channel settings

### AI Tools
- `/creator/tools/script` - AI script generator
- `/creator/tools/voice` - AI voice generator
- `/creator/tools/image` - AI image generator
- `/creator/tools/text` - AI text generator and enhancer

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
Create custom images for your videos and books with AI:
- Detailed prompt-based generation
- Negative prompts for exclusions
- Multiple aspect ratio options
- Style selection (vivid, natural, cinematic, etc.)
- Export to projects or download

### Text Generation and Enhancement
Generate and improve text content for books and scripts:
- Chapter and section generation based on outlines
- Style and tone adjustments
- Grammar and spelling correction
- Readability improvements
- Content expansion and summarization

## 📦 Asset Management

### Upload Capabilities
Upload and manage various file types:
- Videos (MP4, MOV, WEBM, etc.)
- Audio (MP3, WAV, OGG, etc.)
- Images (JPG, PNG, GIF, WebP, etc.)
- Captions (SRT, VTT)
- Text (TXT, DOCX, PDF, etc.)

### Organization
Assets are organized by:
- Type (video, audio, image, caption, text)
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
- Books and e-books
- Articles and blog posts

### Video Editor Features
- Timeline-based editing
- Scene arrangement
- Transition effects
- Text overlay and captions
- Audio tracks and mixing
- Version history

### Book Editor Features
- Chapter and section management
- Rich text formatting
- Image insertion and placement
- Table of contents generation
- Footnotes and endnotes
- Version history and tracking

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

## 📚 Book Publishing

### Book Types
- Novels and fiction
- Non-fiction books
- Educational materials
- Cookbooks
- Children's books
- Poetry collections
- Technical documentation

### Editor Features
- Chapter and section organization
- Rich text formatting with styles
- Image insertion and management
- Table of contents generation
- Footnotes and endnotes
- Citation management
- Track changes and version history

### Formatting Options
- Multiple page sizes and orientations
- Custom margins and gutters
- Font selection and typography controls
- Header and footer customization
- Page numbering options
- Custom styles and templates

### Publishing Platforms
- Amazon Kindle Direct Publishing (KDP)
- Apple Books
- Google Play Books
- Kobo Writing Life
- Barnes & Noble Press
- Draft2Digital
- IngramSpark

### Export Formats
- EPUB (for most e-readers)
- MOBI (for Kindle)
- PDF (for print and digital distribution)
- HTML (for web publishing)
- DOCX (for further editing)

### AI Assistance
- Plot and outline generation
- Character development suggestions
- Setting descriptions
- Dialogue enhancement
- Style consistency checking
- Grammar and spelling correction
- Content expansion and summarization

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
- Book format settings
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
- Book formatting and conversion services
- Social media platform APIs
- Publishing platform APIs
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
