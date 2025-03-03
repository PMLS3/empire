# Frontend App Architecture Analysis Document

## Frontend Architecture Overview

The Book Research Module frontend requires a flexible, responsive, and intuitive user interface to enable effective book research management. This document outlines the architecture and components needed to implement the frontend application.

## Technology Stack

- **Framework**: Vue.js with Nuxt.js for server-side rendering and routing
- **State Management**: Pinia for application state
- **UI Components**: Custom component library with TailwindCSS for styling
- **API Integration**: Axios for API requests with interceptors
- **Authentication**: JWT token-based authentication with refresh token strategy

## Component Architecture

### Core Components

#### Research Management Components
- `ResearchDashboard.vue` - Main dashboard showing research projects
- `ResearchList.vue` - List/grid view of research projects
- `ResearchDetail.vue` - Detailed view of a single research project
- `ResearchForm.vue` - Form for creating/editing research projects
- `CategorySelector.vue` - Component for selecting categories/subcategories

#### Book Collection Components
- `BookList.vue` - Grid/list view of example books
- `BookCard.vue` - Card display for an individual book
- `BookDetail.vue` - Detailed view of a single book
- `BookForm.vue` - Form for creating/editing book details
- `BookScraper.vue` - Component for scraping book data from URLs
- `BookComparison.vue` - Component for comparing multiple books

#### AI Research Components
- `DeepResearch.vue` - Interface for initiating and viewing AI research
- `ResearchInsights.vue` - Display for AI-generated insights
- `PerplexityChat.vue` - Interface for research conversations with AI

#### File Management Components
- `FileUploader.vue` - Component for uploading research files
- `FileList.vue` - List of files with metadata
- `FileViewer.vue` - Component for previewing files when possible
- `FileDownloader.vue` - Component for downloading files

#### Conversation Components
- `ConversationList.vue` - List of research conversations
- `ConversationView.vue` - View of a single conversation
- `MessageInput.vue` - Input for adding messages to conversations

### Layout Components
- `ResearchLayout.vue` - Main layout for research module
- `SideNav.vue` - Navigation sidebar for research areas
- `TopNav.vue` - Top navigation bar with actions
- `ActionBar.vue` - Contextual action bar for common tasks

## State Management

### Store Modules

#### Research Store
```typescript
interface ResearchState {
  researches: CategoryResearch[]
  currentResearch: CategoryResearch | null
  loading: boolean
  error: string | null
  categories: BookCategory[]
}
```

#### Book Store
```typescript
interface BookState {
  books: ExampleBook[]
  currentBook: ExampleBook | null
  loading: boolean
  error: string | null
  scrapeStatus: 'idle' | 'loading' | 'success' | 'error'
}
```

#### File Store
```typescript
interface FileState {
  files: ResearchFile[]
  currentFile: ResearchFile | null
  loading: boolean
  error: string | null
  uploadProgress: number
}
```

#### Conversation Store
```typescript
interface ConversationState {
  conversations: ResearchConversation[]
  currentConversation: ResearchConversation | null
  loading: boolean
  error: string | null
  messageStatus: 'idle' | 'sending' | 'success' | 'error'
}
```

## Composables

### Research Composables
- `useResearch` - Core research functionality
- `useBookResearch` - Book-specific research functions
- `useCategories` - Category management functions

### Book Composables
- `useBooks` - Book management functions
- `useBookScraping` - Book scraping functions
- `useBookAnalysis` - Book analysis functions

### AI Integration Composables
- `usePerplexity` - Functions for Perplexity AI integration
- `useDeepResearch` - Functions for deep research capabilities
- `useInsightGeneration` - Functions for generating insights

### File Composables
- `useFiles` - File management functions
- `useFileUpload` - File upload functions with progress tracking
- `useFileDownload` - File download functions

## Routing Structure

```
/research
  /dashboard - Research dashboard
  /create - Create new research
  /[id] - View research details
    /books - Books in research
      /[bookId] - View single book
      /compare - Compare books
    /files - Files in research
      /[fileId] - View single file
    /conversations - Conversations in research
      /[conversationId] - View single conversation
    /deep-research - Deep research for this project
    /insights - AI-generated insights
  /categories - Category management
    /[categoryId] - View category details
```

## User Interface Guidelines

### Responsive Design
- Desktop-first approach with full responsive support
- Grid-based layout that adjusts to screen size
- Touch-friendly interface elements for mobile use

### Component Design Principles
- Consistent styling across components
- Clear visual hierarchy and information architecture
- Interactive elements with appropriate feedback
- Accessibility compliance (WCAG 2.1)

### State Indicators
- Loading states with progress indication
- Empty states with helpful guidance
- Error states with recovery actions
- Success confirmation for completed actions

## Performance Optimization

### Lazy Loading
- Route-based code splitting
- Component lazy loading for heavy components
- Image lazy loading with placeholders

### Caching Strategy
- Client-side caching of frequently accessed data
- Local storage for user preferences
- API response caching where appropriate

### Virtual Scrolling
- Virtualized lists for large data sets (books, files)
- Pagination controls for manageable data loading
- Infinite scroll where appropriate

## Integration Points

### API Integration
- REST API client with authentication
- Request/response interceptors for common handling
- Error handling and retry logic

### External Services
- FireCrawl integration for book scraping
- Perplexity API for deep research
- File storage services for document handling

## Analytics & Monitoring

- Page view tracking
- Feature usage analytics
- Error logging and reporting
- Performance monitoring

## Accessibility Requirements

- Semantic HTML structure
- ARIA attributes for complex components
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
