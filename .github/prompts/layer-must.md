# Empire Layer Development Guidelines

This document outlines the mandatory guidelines that every layer/module in Empire must follow. These standards ensure consistency, prevent duplication, and maintain high-quality code across the application.

## Pre-Implementation Planning

Before implementing a new layer, developers **MUST** complete the following planning steps:

1. **Create a dedicated planning directory** at `.github/layers/{layer-name}/`

2. **Submit clarifying questions document** first:
   - Create `.github/layers/{layer-name}/clarifying-questions.md`
   - List all questions needed to fully understand requirements
   - Wait for answers before proceeding with implementation

3. **Create the following planning documents** after questions are answered:

   a. **Layer Specification** (`.github/layers/{layer-name}/specification.md`):
      - Purpose and goals of the layer
      - Key features and functionality
      - User stories or requirements
      - Integration points with other layers
      - Data structures and models

   b. **Architecture Plan** (`.github/layers/{layer-name}/architecture.md`):
      - Component structure
      - Data flow diagrams
      - API design
      - State management approach

   c. **Dependencies List** (`.github/layers/{layer-name}/dependencies.md`):
      - External libraries needed
      - Internal layer dependencies
      - Justification for each dependency

   d. **UI/UX Design Doc** (`.github/layers/{layer-name}/ui-design.md`):
      - User interface mockups/wireframes
      - Interaction patterns
      - Reuse of existing components

   e. **Test Strategy** (`.github/layers/{layer-name}/test-strategy.md`):
      - Testing approach
      - Critical test cases
      - Edge cases to consider

4. **Get approval on planning documents** before starting implementation

### Example Clarifying Questions

```markdown
# Clarifying Questions for [Layer Name]

## Purpose & Scope
1. What specific problem does this layer solve?
2. Which user personas will interact with this layer?
3. Are there similar features in existing layers we should review?

## Technical Requirements
1. What data structures need to be created?
2. Which external APIs will this layer interact with?
3. Are there performance requirements for specific operations?

## Integration Points
1. Which existing layers will this layer interact with?
2. What data will be shared between layers?
3. Are there any authentication/authorization requirements?

## UI/UX Considerations
1. Which existing UI components can be reused?
2. Are there specific accessibility requirements?
3. Which screens/views need to be created?
```

## Implementation Tracking

After approval of planning documents, developers **MUST** create and maintain an implementation tracking document:

### Implementation Todo List (`.github/layers/{layer-name}/implementation.md`)

- Create a structured task list that must be regularly updated throughout development
- Mark tasks as they are completed
- Include status summaries and progress percentage
- Update this document daily during active development

```markdown
# Layer Name Implementation Status

## Progress Summary
- ✅ Tasks Completed: 5/20 (25%)
- 🟡 In Progress: 3
- ⬜ Not Started: 12
- ❌ Blocked: 0

Last Updated: YYYY-MM-DD

## Task List

### Setup
- [x] Create layer directory structure
- [x] Configure package.json
- [ ] Setup initial TypeScript types
- [ ] Create README.md with basic documentation

### Data Models
- [x] Define primary data models
- [ ] Create database schema
- [ ] Implement CRUD operations

### Components
- [ ] Create base components
- [ ] Implement form components
- [ ] Build list views
- [ ] Build detail views

### Integration
- [ ] Connect with Auth layer
- [x] Integrate shared components
- [ ] Register layer functions for AI assistant
- [ ] Add layer navigation to UI configuration

### Testing
- [ ] Write unit tests for utilities
- [x] Write component tests
- [ ] Setup integration tests

### Documentation
- [ ] Complete README documentation
- [ ] Add JSDoc comments
- [ ] Update project architecture doc
```

Update this document as development progresses. Each task should be updated from `[ ]` (not started) to `[x]` (completed) as work is finished. Add new tasks that emerge during development.

## Authentication System

Empire uses Firebase Authentication with a custom workspace and profile system:

- **Users**: Each user can belong to multiple workspaces
- **Workspaces**: Organizational units with specific roles (owner, admin, member)
- **Profiles**: User-specific data for each workspace they belong to

### Using Authentication

```typescript
import { useAuth } from '~/layers/auth/composables/auth'

export default defineComponent({
  setup() {
    const { 
      user,                    // Current user data
      currentWorkspace,        // Active workspace
      currentProfile,          // User profile in active workspace
      isAuthenticated,         // Authentication state
      isWorkspaceOwner,        // Check if user is workspace owner
      isWorkspaceAdmin,        // Check if user is admin or owner
    } = useAuth()

    // Guard authenticated routes
    if (!isAuthenticated.value) {
      // Handle unauthenticated state
    }

    return { user, currentWorkspace }
  }
})
```

## Data Handling

Empire provides standardized data handling endpoints that **MUST NOT BE MODIFIED**. Use the existing functionality for all data operations.

### Data Operations

#### Creating Data (`write.post.ts`)

Endpoint for creating new documents in any collection:

```typescript
// Example usage
const response = await $fetch('/api/data/write', {
  method: 'POST',
  body: { 
    collection: 'projects',    // Collection name
    title: 'New Project',      // Document data fields
    description: 'Description',
    embed: ['title', 'description'] // Fields to create vector embeddings from
  }
})
// Returns the ID of the created document
```

- The endpoint automatically adds workspace_id, owner_id, status, timestamps
- Use the `embed` field to specify which fields should be used to generate vector embeddings

#### Updating Data (`update.post.ts`)

Endpoint for updating existing documents:

```typescript
// Example usage
const response = await $fetch('/api/data/update', {
  method: 'POST',
  body: {
    collection: 'projects',    // Collection name
    id: 'document-id',         // Document ID
    data: {                    // Fields to update
      title: 'Updated Title',
      description: 'Updated Description'
    },
    embed: ['title', 'description'] // Fields to regenerate embeddings from
  }
})
```

#### Reading Data (`read.post.ts`)

Endpoint for querying documents with optional vector search:

```typescript
// Example usage - Get document by ID
const document = await $fetch('/api/data/read', {
  method: 'POST',
  body: {
    collection: 'projects',
    id: 'document-id'
  }
})

// Example usage - Query documents
const documents = await $fetch('/api/data/read', {
  method: 'POST',
  body: {
    collection: 'projects',
    filters: { status: 'active' },
    limit: 20,
    orderBy: 'created_at',
    orderDirection: 'desc'
  }
})

// Example usage - Vector search
const searchResults = await $fetch('/api/data/read', {
  method: 'POST',
  body: {
    collection: 'projects',
    vec: {
      query: 'marketing strategy document',
      field: 'embedding',
      dimensions: 768,
      distance: 0.5
    }
  }
})
```

#### Deleting Data (`delete.post.ts`)

Endpoint for deleting documents:

```typescript
// Example usage
const response = await $fetch('/api/data/delete', {
  method: 'POST',
  body: {
    collection: 'projects',
    id: 'document-id'
  }
})
```

### Using the Creator Data Composable

The `useCreatorData` composable provides a convenient wrapper for data operations:

```typescript
import { useCreatorData } from '~/layers/creator/composables/useCreatorData'

export default defineComponent({
  setup() {
    const { 
      fetchData,               // Get all items from a collection
      getDataById,             // Get a single item by ID
      createData,              // Create a new item
      updateData,              // Update an existing item
      deleteData,              // Delete an item
      queryData,               // Query with filters and pagination
      searchByVector,          // Search using vector semantics
      loading,                 // Loading state
      error                    // Error state
    } = useCreatorData()

    // Example: Vector search
    const search = async (query) => {
      const results = await searchByVector(
        'documents',           // Collection name
        query,                 // Search query
        {
          filters: { type: 'article' },
          limit: 10
        }
      )
      return results
    }

    // Example: Create with vector embeddings
    const create = async (data) => {
      return await createData(
        'projects',            // Collection name
        data,                  // Document data
        ['title', 'description'] // Fields to create embeddings from
      )
    }

    return { search, create }
  }
})
```

## AI Functionality

All AI functionality **MUST** be implemented through the AI layer:

1. **Check existing functionality first** before creating new AI features
2. **Provide user choice** of AI provider (OpenAI/Gemini/etc.) in settings
3. **Utilize existing Vertex AI functionality** for image/video/audio/text generation

### AI Guidelines

- Implement settings to allow users to choose their preferred AI provider
- Use existing AI components and services when possible
- Implement fallbacks when specific AI services are unavailable

## Shared Components

Components that might be reused across layers **MUST** be implemented in the shared layer:

1. **Check for existing components** before creating new ones
2. **File management** must use the `useUploads` composable

### Using the Uploads Composable

For all file management operations:

```typescript
import { useUploads } from '~/layers/shared/composables/useUploads'

export default defineComponent({
  setup() {
    const {
      upload,                  // Upload files
      loadData,                // Load uploads data
      createFolder,            // Create a folder
      deleteUpload,            // Delete a file
      deleteFolder,            // Delete a folder
      filteredItems,           // Files in current folder
      filteredFolders,         // Subfolders in current folder
      selectedFolders,         // Current folder navigation path
      uploadProgress           // Upload progress tracking
    } = useUploads()

    // Example: Upload files with tags
    const handleFileUpload = async (files) => {
      await upload(files, ['project-assets'])
    }

    // Load files on component mount
    onMounted(() => {
      loadData()
    })

    return { handleFileUpload, filteredItems }
  }
})
```

## Agent Creation

Each layer should have an agent that can interact with its functions. Follow these steps:

### 1. Add your agent to `useChat.ts`

Add a new agency chat instance in the `useChat` composable:

```typescript
// In useChat.ts
const yourLayerAgency = useChatAgency({
  apiKey: config.public.geminiApiKey,
  functionGroups: ['your-layer-functions'],
  customInstructions: 'Instructions for your layer agent.',
  enableVoice: true,
  enableScreenShare: false
})

// Add to conversation list
{
  id: 4, // Use a unique ID
  user: {
    name: 'Your Layer Assistant',
    photo: '/img/avatars/5.svg',
    role: 'your-layer-agency',
    bio: 'I am your assistant for [functionality].',
    age: 1,
    location: 'Agency Cloud',
  },
  messages: [],
}

// Add to agencyChats mapping
const agencyChats = {
  // ...existing agencies
  'your-layer-agency': yourLayerAgency,
}
```

### 2. Create Function Group File

Create a new file in `layers/functions/groups/your-layer.ts`:

```typescript
import { FunctionGroup } from '../types';

export const yourLayerFunctions: FunctionGroup = {
  declarations: [
    {
      name: "yourFunction",
      description: "Description of what this function does",
      parameters: {
        type: "object",
        properties: {
          param1: {
            type: "string",
            description: "Description of parameter 1"
          },
          param2: {
            type: "number",
            description: "Description of parameter 2"
          }
        },
        required: ["param1"]
      }
    },
    // Add more function declarations as needed
  ],
  handlers: {
    yourFunction: async (args, context) => {
      const { param1, param2 } = args;
      // Implementation of your function
      return {
        result: `Processed ${param1} with value ${param2}`
      };
    },
    // Add handlers for all declared functions
  },
  systemInstruction: () => `
    You are a specialized assistant for [your layer's purpose].
    Use yourFunction to [describe what it does].
    [Add more instructions as needed]
  `
};
```

### 3. Register your function group in `groups.ts`

Add your function group to the exports in `layers/functions/groups/index.ts`:

```typescript
// In your index.ts file
export { yourLayerFunctions } from './your-layer';
```

Then register it in `layers/functions/groups.ts`:

```typescript
import { yourLayerFunctions } from './groups/index'

export const functionGroups: Record<string, FunctionGroup> = {
  // ...existing function groups
  'your-layer': yourLayerFunctions
};
```

## Working with Existing Components

When implementing a new layer or modifying an existing one, developers **MUST**:

1. **Audit existing components** before creating new ones:
   - Check for existing components, pages, server endpoints, and composables in the layer
   - Reuse and update existing components rather than creating duplicates
   - Document any modifications made to existing components

2. **Request confirmation before deletion**:
   - Identify components that are no longer needed
   - Document the reason for proposed deletion
   - **ALWAYS** get explicit user confirmation before deleting any files
   - Include impact analysis of deletion in the confirmation request

3. **Follow the component modification workflow**:
   ```
   1. Identify existing component
   2. Evaluate if it meets requirements
   3. If updates needed, modify in place
   4. If deletion needed, request confirmation
   5. Document all changes
   ```

### Example Confirmation Request

```markdown
## Component Deletion Confirmation

I propose deleting the following components as they appear to be unused:

1. `layers/your-layer/components/LegacyWidget.vue`
   - Reason: Functionality replaced by new `ModernWidget.vue`
   - Last modified: 6 months ago
   - No references found in codebase

2. `layers/your-layer/composables/useDeprecatedFeature.ts`
   - Reason: Functionality now handled by shared layer
   - No active imports found

Please confirm if these components can be safely deleted.
```

## Mandatory Subsidebar Component

Each layer **MUST** implement a dedicated subsidebar component:

1. **Create a subsidebar file** at `layers/shared/components/global/Subsidebar{LayerName}.vue`
   - Follow the naming convention exactly (e.g., `SubsidebarResearch.vue`, `SubsidebarCRM.vue`)
   - Use the existing subsidebar components as reference

2. **Implement standard structure**:
   ```vue
   <script setup lang="ts">
   const navigation = [
     {
       name: 'Category Name',
       children: [
         {
           name: 'Item Name',
           icon: 'ph:icon-name-duotone',
           to: '/your-layer/route-path',
           exact: true,
         },
         // Additional navigation items
       ],
     },
     // Additional categories
     {
       divider: true,  // Optional divider between categories
     },
   ]
   </script>

   <template>
     <Subsidebar>
       <template #header>
         <SubsidebarHeader />
       </template>

       <SubsidebarMenu :navigation="navigation" />
     </Subsidebar>
   </template>
   ```

3. **Register the subsidebar** in the layer's UI configuration

### Example Subsidebar Implementation

```vue
<!-- layers/shared/components/global/SubsidebarResearch.vue -->
<script setup lang="ts">
const navigation = [
  {
    name: 'Research',
    children: [
      {
        name: 'Projects',
        icon: 'ph:folder-duotone',
        to: '/research/projects',
        exact: true,
      },
      {
        name: 'Books',
        icon: 'ph:book-duotone',
        to: '/research/books',
      },
      {
        name: 'Notes',
        icon: 'ph:note-duotone',
        to: '/research/notes',
      },
    ],
  },
  {
    name: 'Tools',
    children: [
      {
        name: 'Search',
        icon: 'ph:magnifying-glass-duotone',
        to: '/research/search',
      },
      {
        name: 'Analysis',
        icon: 'ph:chart-line-duotone',
        to: '/research/analysis',
      },
    ],
  },
]
</script>

<template>
  <Subsidebar>
    <template #header>
      <SubsidebarHeader />
    </template>

    <SubsidebarMenu :navigation="navigation" />
  </Subsidebar>
</template>
```

## UI/UX Guidelines

Consistent UI/UX is critical across the application:

1. **Reference the demo project** for UI components and patterns
2. **Tagged pages must be replicated** as closely as possible
3. **Follow the design system** for colors, typography, and spacing
4. **Implement the required subsidebar** for your layer

### UI Implementation Tips

- Use existing components from the shared layer
- Match spacing, colors, and typography to maintain consistency
- Test UI on multiple screen sizes for responsive design
- Follow accessibility best practices

## Documentation Standards

Documentation is critical for maintaining the project over time. Each layer MUST maintain updated documentation:

### README.md

Every layer MUST have an up-to-date README.md file that includes:

- Purpose and functionality of the layer
- Key components and composables
- Setup and configuration instructions
- Example usage scenarios
- Integration points with other layers

**The README MUST be updated whenever functionality changes**.

### Project-Level Documentation

When making changes to a layer, always update the following project-level documentation if relevant:

- **architecture.md**: Update when changing architectural patterns, adding major features, or modifying the interaction between layers
- **ui-configuration.md**: Update when modifying UI components, configuration options, or theming

### Code Documentation

- Use JSDoc comments for all public functions, composables, and components
- Include parameter descriptions and return types
- Document expected behavior and edge cases

```typescript
/**
 * Processes data from a collection for display
 * @param {string} collectionName - The collection to fetch data from
 * @param {object} filters - Optional filters to apply
 * @returns {Promise<Array>} - Processed data array
 */
const processData = async (collectionName, filters = {}) => {
  // Implementation
}
```

## Testing Requirements

Each layer MUST include appropriate testing:

### Unit Tests

- Test all critical utility functions and composables
- Mock external services and dependencies
- Test both success and failure paths

### Component Tests

- Test component rendering and reactivity
- Verify event handling and user interactions
- Test with different prop combinations

### Integration Tests

- Test interactions between layer composables
- Verify data flow between components

### Test Configuration

- Store tests in a `__tests__` directory within your layer
- Use the project's standard testing framework (Vitest)
- Maintain at least 70% code coverage for critical paths

## Performance Guidelines

Each layer MUST follow these performance best practices:

### Component Optimization

- Use `shallowRef` for large objects that don't need deep reactivity
- Implement proper component memoization with `computed` properties
- Use `v-once` for static content that doesn't need to be reactive

### Data Loading

- Implement pagination for large data sets
- Use lazy loading for components and routes
- Add loading indicators for async operations

### Rendering Performance

- Keep components small and focused
- Use virtual scrolling for long lists
- Monitor and optimize component re-renders

### Monitoring

- Add performance markers for critical operations
- Document performance expectations for data-intensive operations

## Dependency Management

Each layer MUST manage its dependencies independently:

- Layers should encapsulate their dependencies and not rely on packages from other layers
- Install layer-specific dependencies using:

```bash
pnpm --filter={layer-name} install {package}
```

- Document all dependencies in the layer's README.md
- When adding a new dependency, consider:
  - Bundle size impact
  - Maintenance status
  - Licensing
  - Security implications

### Shared Dependencies

For dependencies used across multiple layers, discuss with the team whether they should be:
1. Added to each layer individually (for independent versioning)
2. Added at the project level (for consistency)

## Code Review Process

All layer changes MUST go through the following code review process:

1. **Self-review**: Review your own code first using the project checklist
2. **Documentation verification**: Ensure all documentation is updated
3. **Peer review**: At least one other developer must review your code
4. **Testing verification**: All tests must pass, and new tests must be added for new functionality
5. **Final approval**: Project maintainer gives final approval

### Review Checklist

- Code follows project style guide
- Documentation is updated
- Tests are written and pass
- No unnecessary dependencies are added
- Performance considerations are addressed
- Security best practices are followed
- Accessibility standards are met

## Security Standards

All layers MUST follow these security practices:

- Sanitize all user inputs
- Use parameterized queries when working with data
- Follow the principle of least privilege
- Never expose sensitive data in client-side code
- Use content security policies
- Handle errors securely without leaking sensitive information

## Accessibility Requirements

All UI components MUST be accessible:

- Use semantic HTML elements
- Ensure proper keyboard navigation
- Add ARIA attributes where appropriate
- Maintain appropriate contrast ratios
- Test with screen readers
- Support zoom and text resizing
- Avoid UI that depends solely on color to convey information

## Development Process

1. **Plan your layer**: Define its purpose and functionality
2. **Review existing code**: Check for similar features or reusable components
3. **Design with consistency**: Follow the UI/UX guidelines
4. **Implement required components**: Create the layer's subsidebar and other required components
5. **Reuse existing components**: Use and update existing components when available
6. **Implement data handling**: Use the standardized data endpoints
7. **Add AI capabilities**: Integrate with the AI layer
8. **Create agent**: Build function groups and add to chat
9. **Test thoroughly**: Ensure all features work correctly
10. **Document**: Add clear documentation for your layer

Following these guidelines will ensure your layer integrates seamlessly with the Empire ecosystem while maintaining code quality and user experience consistency.
