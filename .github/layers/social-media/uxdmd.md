# User Experience Design Document (UXDMD) - Social Media Layer

## Overview
This document details the specific design decisions, UI components, layouts, and interaction patterns for the Social Media Layer. It serves as a comprehensive reference for designers and developers implementing the user interface and experience.

## Design System Integration

### Color Palette
- **Primary Colors**: Use existing platform color system
- **Platform Indicator Colors**:
  - Twitter/X: #1DA1F2
  - Instagram: Linear gradient from #405DE6 to #E1306C
  - Facebook: #1877F2
  - LinkedIn: #0A66C2
  - TikTok: #000000 with accent #EE1D52
  - YouTube: #FF0000
  - Pinterest: #E60023
- **Status Colors**:
  - Draft: Gray (#64748b)
  - Scheduled: Blue (#3b82f6)
  - Published: Green (#10b981)
  - Failed: Red (#ef4444)
  - Rate Limited: Amber (#f59e0b)

### Typography
- Follow the platform's existing typography system
- Content preview text should mimic the destination platform's font style
- Use monospace font for character counts and metrics

### Iconography
- Use platform standard icons where available
- Platform-specific icons should match official branding
- Custom icons for social media specific actions:
  - Schedule Post
  - Multi-platform Publish
  - AI Generate
  - Content Analytics
  - Account Management

### Component Extensions
- Extend existing platform UI components for consistency
- Create the following specialized components:
  - PlatformSelector
  - ContentPreview
  - PublishingStatusBadge
  - AccountConnectionCard
  - CalendarEventPost
  - AnalyticsCard
  - PlatformTab

## Screen Designs

### Dashboard Screen

#### Layout
- Top navigation bar with user info and global actions
- Left sidebar with main navigation
- Main content area with:
  - Quick actions panel
  - Activity feed
  - Upcoming content preview
  - Performance summary

#### Components
- **QuickActions**: Card with buttons for common tasks
  - New Post
  - Schedule Content
  - View Analytics
  - Connect Account
- **ActivityFeed**: Timeline of recent content activity
  - Published posts
  - Scheduled posts
  - Team comments
  - Analytics alerts
- **UpcomingContent**: Calendar preview of next 7 days
  - Color coded by platform
  - Clickable to edit
- **PerformanceSnapshot**: Key metrics across platforms
  - Engagement rate
  - Follower growth
  - Top performing content

#### States
- Loading state with skeleton screens
- Empty state with onboarding prompts
- Error state with troubleshooting guidance
- Fully populated state

### Content Creation Screen

#### Layout
- Left panel for content input
- Right panel for platform previews
- Bottom bar for actions (save, schedule, publish)

#### Components
- **ContentTypeSelector**: Segmented control for content type
  - Text
  - Image
  - Video
  - Link
  - Carousel
  - Story
- **PlatformSelector**: Multi-select component with platform icons
- **ContentEditor**: Rich text editor with formatting controls
  - Character counter with platform-specific limits
  - Emoji picker
  - Hashtag suggestions
  - @mention support
- **MediaUploader**: Dropzone and media manager
  - Platform-specific cropping tools
  - Image enhancement tools
  - Metadata editor
- **PlatformPreview**: Interactive preview of how content will appear
  - Device frame (mobile/desktop)
  - Platform UI simulation
  - Responsive preview
- **AIAssistant**: Collapsible panel for AI generation
  - Text prompts
  - Style selection
  - Platform optimization
  - Tone adjustment

#### States
- Draft state
- Editing state
- Preview state
- Publishing state
- Success/error state

### Content Calendar Screen

#### Layout
- Top bar with view controls and filters
- Left sidebar with accounts and labels
- Main calendar grid
- Right panel for selected content details

#### Components
- **CalendarControls**: View and filter toolbar
  - Month/Week/Day view toggle
  - Date navigator
  - Platform filter
  - Team member filter
  - Status filter
- **CalendarGrid**: Main calendar interface
  - Time slots
  - Content cards
  - Visual indicators for content status
  - Drag and drop support
- **ContentSlot**: Representation of content in calendar
  - Platform icon
  - Content preview snippet
  - Status indicator
  - Time indicator
- **ContentDetailSidebar**: Panel showing selected content
  - Full content preview
  - Edit/delete/duplicate actions
  - Publishing status
  - Analytics summary

#### States
- Month view
- Week view
- Day view
- List view
- Adding new content
- Rescheduling content

### Analytics Dashboard Screen

#### Layout
- Top bar with date range and filters
- Overview metrics row
- Platform-specific metrics panels
- Content performance table
- Audience insights panel

#### Components
- **DateRangePicker**: Select analysis period
- **MetricCard**: Display key metric with trend
  - Value
  - Change percentage
  - Sparkline chart
  - Comparison to benchmark
- **PlatformMetricsPanel**: Platform-specific metrics
  - Engagement rate
  - Reach/impressions
  - Follower growth
  - Click-through rate
- **ContentPerformanceTable**: Sortable list of content performance
  - Preview thumbnail
  - Engagement metrics
  - Publication date
  - Platform indicators
- **PerformanceChart**: Visualization of key metrics
  - Line charts for trends
  - Bar charts for comparisons
  - Pie charts for distributions
- **AudienceInsightsPanel**: Demographics and behavior
  - Age breakdown
  - Gender distribution
  - Location map
  - Active times

#### States
- Loading data
- No data available
- Data visualization
- Exporting report

### Account Management Screen

#### Layout
- Connected accounts overview
- Platform sections
- Team management panel

#### Components
- **AccountCard**: Card displaying account info
  - Profile picture
  - Username/handle
  - Platform icon
  - Connection status
  - Last sync time
  - Quick actions
- **ConnectAccountButton**: Initiate platform connection
  - Platform icon
  - Platform name
  - Connection steps indicator
- **TeamMemberList**: Manage team access
  - Member cards
  - Role selector
  - Invite form
  - Access controls
- **PlatformSettings**: Platform-specific options
  - API usage status
  - Rate limit indicators
  - Default settings
  - Authentication status

#### States
- No accounts connected
- Account connected
- Connection error
- Rate limited
- Authentication expired

## Interaction Patterns

### Content Creation Flow

#### Step 1: Select Content Type
- User clicks "Create New" button
- Content type selector displays options
- User selects type (e.g., Image Post)
- UI adjusts to show relevant creation tools

#### Step 2: Platform Selection
- Platform selector shows available connected platforms
- User selects target platforms
- UI indicates which platforms are selected with visual cues
- Preview panels update to show selected platforms

#### Step 3: Content Creation
- User enters text and/or uploads media
- Character count updates based on platform limits
- AI assistant offers suggestions if enabled
- Hash tag recommendations appear based on content
- Warning appears if content exceeds platform limits

#### Step 4: Platform Customization
- User can switch between platform tabs
- Each platform tab allows customization for that platform
- Changes to one platform don't affect others unless explicitly applied
- Preview updates in real-time

#### Step 5: Publishing Options
- User selects immediate publish or schedule
- If schedule, calendar picker appears
- User sets date, time, and optional recurrence
- System checks for conflicts and rate limits

#### Step 6: Confirmation and Feedback
- Confirmation dialog shows final preview
- User confirms publish/schedule
- Success indicator appears with link to content
- Option to create another or view in calendar

### AI Content Generation Flow

#### Step 1: Initial Prompt
- User clicks "AI Generate" button
- Prompt field appears with platform selection
- User enters content idea or requirements
- Generation options appear (tone, length, style)

#### Step 2: Generation and Review
- Loading indicator appears during generation
- Results appear with multiple variations
- User can browse through options
- Edit button available for each option

#### Step 3: Customization
- User selects preferred option
- Content appears in editor
- User can make manual adjustments
- Platform-specific optimizations are suggested

#### Step 4: Platform Adaptation
- System automatically adjusts for each platform
- Character limits are respected
- Hashtag suggestions per platform
- Image dimensions adjusted automatically

### Content Scheduling Flow

#### Step 1: Calendar Navigation
- User views calendar in preferred view (month/week/day)
- Color coding indicates content density and platforms
- User can filter by platform, status, or team member

#### Step 2: Time Slot Selection
- User clicks empty time slot or "+" button
- Quick create panel appears
- User can select content type or choose existing draft

#### Step 3: Schedule Configuration
- Date and time are pre-filled from selected slot
- User can adjust time or set recurrence
- Optimal time suggestions appear based on analytics
- Conflicts or rate limit warnings appear if applicable

#### Step 4: Queue Management
- Drag and drop interface for reordering scheduled content
- Visual indicators for schedule conflicts
- Bulk operations for rescheduling or platform changes
- Calendar export option for team coordination

### Analytics Exploration Flow

#### Step 1: Overview
- User lands on analytics dashboard with summary metrics
- Date range selector to define analysis period
- Platform selector to filter data sources
- KPI cards show high-level performance

#### Step 2: Performance Deep Dive
- User clicks on metric card to expand details
- Detailed charts appear with trend analysis
- Comparison options (previous period, year-over-year)
- Breakdown by platform, content type, or campaign

#### Step 3: Content Analysis
- User navigates to content performance section
- Sortable table of content with metrics
- Filter by performance tiers (top, average, underperforming)
- Click on content item to see detailed performance

#### Step 4: Audience Insights
- User navigates to audience section
- Demographic visualization of followers/audience
- Growth trends across platforms
- Engagement patterns by audience segment

#### Step 5: Report Generation
- User selects metrics to include in report
- Preview of report appears
- Export options (PDF, CSV, scheduled email)
- Sharing options for team members

## Responsive Design

### Desktop (1200px+)
- Full featured interface with multi-column layout
- Side-by-side editing and preview
- Expanded calendar view
- Detailed analytics visualizations

### Tablet (768px - 1199px)
- Collapsible sidebars
- Tabbed interface for editing and preview
- Week/day default for calendar
- Simplified analytics visualizations

### Mobile (320px - 767px)
- Single column layout
- Bottom navigation
- Step-by-step content creation wizard
- List view default for calendar
- Focus on key metrics for analytics

## Animation and Transitions

### Page Transitions
- Fade transition between main sections
- Slide transition for sidebars and panels
- Maintain context during navigation

### Content Creation Animation
- Smooth transition between platform previews
- Character count animation
- Loading indicators for AI generation
- Subtle feedback animations for actions

### Calendar Interactions
- Drag and drop with ghost element
- Expand/collapse animations for content details
- Smooth scrolling between time periods
- Color transitions for status changes

### Data Visualization Animation
- Progressive reveal of chart data
- Animated transitions between data periods
- Subtle hover states for interactive elements
- Loading states with placeholder animations

## Microcopy Guidelines

### Button Labels
- Use action verbs (Create, Schedule, Publish)
- Be concise but clear
- Indicate scope of action
- Include platform name when specific

### Form Labels and Placeholders
- Descriptive but concise labels
- Helpful placeholder text
- Inline validation messages
- Character count indicators

### Tooltips and Help Text
- Provide context for complex features
- Explain platform-specific limitations
- Link to relevant documentation
- Use friendly, conversational tone

### Error Messages
- Clear explanation of what went wrong
- Actionable guidance on how to fix
- Platform-specific context when relevant
- Avoid technical jargon

### AI Prompts
- Clear indication of expected input
- Examples of effective prompts
- Guidance on refining results
- Transparency about AI limitations

## Accessibility Guidelines

### Keyboard Navigation
- Logical tab order
- Keyboard shortcuts for common actions
- Focus indicators for all interactive elements
- Skip navigation for screen readers

### Screen Reader Support
- Appropriate ARIA labels
- Meaningful alt text for images
- Status announcements for dynamic content
- Semantic HTML structure

### Color and Contrast
- Minimum 4.5:1 contrast ratio for text
- Alternative indicators beyond color
- High contrast mode support
- Text resizing without loss of functionality

### Reduced Motion
- Respect prefers-reduced-motion setting
- Essential content not dependent on animation
- Static alternatives for animated elements
- No flashing content

## Component Specifications

### PlatformSelector Component
- **Purpose**: Allow selection of one or more platforms
- **Properties**:
  - `platforms`: Array of available platforms
  - `selected`: Array of selected platforms
  - `disabled`: Array of unavailable platforms
  - `onChange`: Function to call on selection change
- **States**:
  - Default
  - Selected
  - Disabled
  - Error (e.g., disconnected)
- **Behavior**:
  - Toggle selection on click
  - Show connection status
  - Display platform icon and name
  - Indicate if platform has special requirements

### ContentPreview Component
- **Purpose**: Show how content will appear on platform
- **Properties**:
  - `platform`: Platform identifier
  - `content`: Content object with text/media
  - `device`: Viewing device (mobile/desktop)
  - `interactive`: Boolean for interactive elements
- **States**:
  - Loading
  - Rendered
  - Error
  - Empty
- **Behavior**:
  - Render accurate platform UI
  - Highlight content that exceeds limits
  - Show engagement elements if interactive
  - Allow device switching

### PublishingStatusBadge Component
- **Purpose**: Indicate content publishing status
- **Properties**:
  - `status`: Current status (draft, scheduled, published, failed)
  - `platform`: Platform identifier
  - `timestamp`: Time of status change
  - `error`: Error message if failed
- **States**:
  - Draft
  - Scheduled
  - Publishing
  - Published
  - Failed
- **Behavior**:
  - Show appropriate color and icon
  - Display timestamp when relevant
  - Show error details on hover if failed
  - Animate state transitions

### CalendarEventPost Component
- **Purpose**: Represent content on calendar
- **Properties**:
  - `content`: Content object
  - `platforms`: Array of targeted platforms
  - `status`: Publishing status
  - `time`: Scheduled time
  - `recurrence`: Recurrence pattern if any
- **States**:
  - Default
  - Selected
  - Dragging
  - Hover
- **Behavior**:
  - Show content preview snippet
  - Display platform icons
  - Indicate status with color
  - Enable drag and drop
  - Show details on hover/click

## Mockup References

### Dashboard Screen
[Link to Figma mockup]

### Content Creation Screen
[Link to Figma mockup]

### Calendar Screen
[Link to Figma mockup]

### Analytics Screen
[Link to Figma mockup]

### Account Management Screen
[Link to Figma mockup]

## Appendix

### Platform-specific UI Guidelines
- Twitter/X: [Link to brand guidelines]
- Instagram: [Link to brand guidelines]
- Facebook: [Link to brand guidelines]
- LinkedIn: [Link to brand guidelines]
- TikTok: [Link to brand guidelines]
- YouTube: [Link to brand guidelines]
- Pinterest: [Link to brand guidelines]

### User Testing Findings
- 85% of users found the platform switching intuitive
- Users struggled with understanding AI generation options
- Calendar drag and drop tested well with social media managers
- The analytics dashboard information hierarchy needs refinement

### Design Decision Log
- Chose tab-based platform editing over accordion to allow side-by-side comparison
- Selected inline AI suggestions over separate panel based on user testing
- Implemented progressive disclosure for advanced features to reduce complexity
- Decided on platform-specific color coding to enhance recognition