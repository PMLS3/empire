# Empire Layer Enhancement Guidelines

This document outlines the process and requirements for adding new features to existing layers in the Empire project. Following these guidelines ensures that enhancements integrate seamlessly with existing functionality while maintaining code quality and user experience consistency.

## Pre-Enhancement Planning

Before implementing a new feature for an existing layer, developers **MUST** complete the following planning steps:

1. **Create a dedicated enhancement planning document** at `.github/layers/{layer-name}/enhancements/{feature-name}.md`

2. **Submit clarifying questions document** first:
   - Create `.github/layers/{layer-name}/enhancements/{feature-name}/clarifying-questions.md`
   - List all questions needed to fully understand requirements
   - Wait for answers before proceeding with implementation

3. **Create the following planning documents** after questions are answered:

   a. **Feature Specification** (`.github/layers/{layer-name}/enhancements/{feature-name}/specification.md`):
      - Purpose and goals of the enhancement
      - Key functionality to be added
      - User stories or requirements
      - Integration points with existing layer components
      - Data structure changes or additions

   b. **Impact Assessment** (`.github/layers/{layer-name}/enhancements/{feature-name}/impact.md`):
      - Affected components, pages, and endpoints
      - API changes (additions, modifications, deprecations)
      - Database schema changes
      - Performance implications
      - Backward compatibility considerations

   c. **Implementation Plan** (`.github/layers/{layer-name}/enhancements/{feature-name}/implementation.md`):
      - Component modifications
      - New components to be created
      - Data flow changes
      - State management updates
      - Migration strategy for existing data/users

   d. **Test Strategy** (`.github/layers/{layer-name}/enhancements/{feature-name}/test-strategy.md`):
      - New test cases to be added
      - Existing tests to be updated
      - Integration test scenarios
      - Performance testing approach

4. **Get approval on planning documents** before starting implementation

### Example Clarifying Questions

```markdown
# Clarifying Questions for [Feature Name] in [Layer Name]

## Purpose & Scope
1. What specific problem does this enhancement solve?
2. How does this feature integrate with existing layer functionality?
3. Are there similar features in other layers we should reference?

## Technical Requirements
1. What data structure changes are needed?
2. Are there new API endpoints required?
3. Will this feature require changes to existing components?

## Integration Points
1. Which existing components will this feature interact with?
2. Are there any changes to public APIs used by other layers?
3. Will this feature require updates to the layer's subsidebar?

## UI/UX Considerations
1. What new UI components need to be created?
2. How will this feature be accessed by users?
3. Are there any accessibility requirements specific to this feature?

## Backward Compatibility
1. Will this feature break existing functionality?
2. Is a migration path needed for existing users/data?
3. Should we maintain support for the previous behavior?
```

## Enhancement Implementation Tracking

After approval of planning documents, developers **MUST** create and maintain an implementation tracking document:

### Implementation Todo List (`.github/layers/{layer-name}/enhancements/{feature-name}/progress.md`)

```markdown
# [Feature Name] Implementation Status for [Layer Name]

## Progress Summary
- ✅ Tasks Completed: 0/15 (0%)
- 🟡 In Progress: 2
- ⬜ Not Started: 13
- ❌ Blocked: 0

Last Updated: YYYY-MM-DD

## Task List

### Documentation Updates
- [ ] Update layer README.md with new feature
- [ ] Update API documentation
- [ ] Create usage examples
- [ ] Update architecture documentation if needed

### Component Modifications
- [ ] Modify Component A to support new feature
- [ ] Update Component B props and events
- [ ] Add new methods to existing composables

### New Components
- [ ] Create FeatureComponent
- [ ] Create feature-specific composable
- [ ] Add new utility functions

### Testing
- [ ] Update existing unit tests
- [ ] Create new tests for feature
- [ ] Add integration tests
- [ ] Verify backward compatibility

### Integration
- [ ] Update subsidebar with new navigation items
- [ ] Register new functions with AI assistant
- [ ] Update layer's UI configuration
```

## Documentation Updates

When enhancing an existing layer, you **MUST** update the following documentation:

### 1. Layer README.md Updates

```markdown
## New Feature: [Feature Name]

### Overview
Brief description of the new feature and its purpose.

### Key Components
- `NewComponent.vue`: Description of component
- `useNewFeature.ts`: Description of composable

### Usage Example
```vue
<template>
  <NewComponent :prop="value" @event="handler" />
</template>

<script setup>
import { useNewFeature } from '~/layers/your-layer/composables/useNewFeature'

const { featureData, featureAction } = useNewFeature()
</script>
```

### API Changes
- Added `newProp` to `ExistingComponent`
- New event `featureEvent` on `ExistingComponent`
- New composable `useNewFeature`
```

### 2. API Documentation Template

For any API changes, create or update the API documentation:

```markdown
# API Documentation Update for [Feature Name]

## New APIs

### `useNewFeature` Composable

```typescript
const { 
  featureData,       // Reactive reference to feature data
  isLoading,         // Boolean indicating loading state
  featureAction,     // Function to perform feature action
  resetFeature       // Function to reset feature state
} = useNewFeature(options?: {
  autoInit?: boolean,  // Whether to initialize automatically
  defaultValue?: any   // Default value for featureData
})
```

#### Parameters
- `options` (optional): Configuration object
  - `autoInit` (boolean): Whether to initialize automatically (default: `true`)
  - `defaultValue` (any): Default value for featureData (default: `null`)

#### Returns
- `featureData` (Ref): Reactive reference to feature data
- `isLoading` (Ref<boolean>): Loading state
- `featureAction` (Function): Performs the feature action
- `resetFeature` (Function): Resets feature state

#### Example
```typescript
const { featureData, featureAction } = useNewFeature({
  defaultValue: { key: 'value' }
})

// Use the feature
await featureAction('parameter')
console.log(featureData.value)
```

## Modified APIs

### `ExistingComponent` Component

#### New Props
- `newProp` (String): Description of the new prop (default: `''`)

#### New Events
- `@featureEvent`: Emitted when feature action occurs
  - Payload: `{ data: any }`

#### New Slots
- `feature`: Slot for custom feature content
  - Scoped Props: `{ featureData: any }`
```

### 3. Migration Guide Template

For features that change existing behavior, provide a migration guide:

```markdown
# Migration Guide for [Feature Name]

## Overview
This guide helps you migrate from the previous implementation to the new [Feature Name] functionality.

## Breaking Changes
- `oldProp` on `ExistingComponent` has been deprecated and will be removed in v2.0
- The format of `dataStructure` has changed from X to Y

## Migration Steps

### 1. Update Component Usage
**Before:**
```vue
<ExistingComponent :oldProp="value" @oldEvent="handler" />
```

**After:**
```vue
<ExistingComponent :newProp="value" @featureEvent="newHandler" />
```

### 2. Update Data Structure
**Before:**
```javascript
const data = {
  oldKey: 'value'
}
```

**After:**
```javascript
const data = {
  newKey: {
    value: 'value',
    metadata: {}
  }
}
```

### 3. Update API Calls
**Before:**
```javascript
const result = await oldApiCall(param)
```

**After:**
```javascript
const { result, metadata } = await newApiCall(param)
```

## Backward Compatibility
We maintain backward compatibility for the following:
- `oldProp` will continue to work but is deprecated
- Old data format will be automatically converted to new format

## Timeline
- v1.5: New feature introduced, old functionality deprecated
- v2.0: Deprecated functionality removed
```

## Assessing Impact on Existing Functionality

When enhancing a layer, carefully assess the impact on existing functionality:

1. **Component Dependencies**:
   - Identify all components that depend on modified components
   - Check for usage of modified props, events, or slots
   - Verify that changes don't break existing usage patterns

2. **API Surface**:
   - Document all changes to public APIs
   - Provide backward compatibility for existing API consumers
   - Use deprecation warnings for APIs that will be removed

3. **Data Structure Changes**:
   - Plan migration path for existing data
   - Provide utilities to convert between old and new formats
   - Consider versioning for data structures

4. **Performance Impact**:
   - Benchmark before and after implementation
   - Ensure new features don't degrade performance of existing features
   - Optimize critical paths

## Integration with Existing Components

When integrating new features with existing components:

1. **Audit existing components** before modifying:
   - Understand the current implementation thoroughly
   - Identify all usage patterns across the codebase
   - Document the current behavior for comparison

2. **Follow the modification workflow**:
   ```
   1. Create tests for existing behavior
   2. Implement changes with backward compatibility
   3. Add tests for new behavior
   4. Update documentation
   5. Create migration guides if needed
   ```

3. **Use feature flags** for major changes:
   - Allow gradual rollout of new features
   - Provide opt-in mechanism for breaking changes
   - Enable A/B testing of new functionality

## Subsidebar Updates

If your enhancement requires changes to the layer's subsidebar:

1. **Update the navigation structure** in `layers/shared/components/global/Subsidebar{LayerName}.vue`:
   ```typescript
   // Add new navigation items
   const navigation = [
     // Existing categories...
     {
       name: 'Feature Category',
       children: [
         {
           name: 'New Feature',
           icon: 'ph:feature-icon-duotone',
           to: '/your-layer/new-feature',
           exact: true,
         },
         // Additional navigation items
       ],
     },
   ]
   ```

2. **Consider the navigation hierarchy**:
   - Place new features in appropriate categories
   - Maintain consistent naming and icon styles
   - Use logical grouping for related features

## AI Function Updates

If your enhancement adds new AI capabilities:

1. **Add new functions** to the layer's function group:
   ```typescript
   // In layers/functions/groups/your-layer.ts
   export const yourLayerFunctions: FunctionGroup = {
     declarations: [
       // Existing functions...
       {
         name: "newFeatureFunction",
         description: "Performs the new feature functionality",
         parameters: {
           type: "object",
           properties: {
             param1: {
               type: "string",
               description: "Description of parameter 1"
             }
           },
           required: ["param1"]
         }
       },
     ],
     handlers: {
       // Existing handlers...
       newFeatureFunction: async (args, context) => {
         const { param1 } = args;
         // Implementation
         return {
           result: `Processed ${param1}`
         };
       },
     },
     // Update system instruction to include new capability
     systemInstruction: () => `
       You are a specialized assistant for [your layer's purpose].
       Use existingFunction to [describe what it does].
       Use newFeatureFunction to [describe new capability].
     `
   };
   ```

2. **Update the AI assistant's capabilities**:
   - Modify the system instructions to include new functions
   - Add examples of how to use the new functionality
   - Test the AI's ability to use the new functions correctly

## Testing Enhancements

When testing layer enhancements:

1. **Maintain existing test coverage**:
   - Ensure all existing tests pass with the enhancement
   - Update tests that are affected by API changes
   - Add regression tests for edge cases

2. **Add tests for new functionality**:
   - Unit tests for new components and utilities
   - Integration tests for feature interactions
   - End-to-end tests for critical user flows

3. **Test backward compatibility**:
   - Verify that existing usage patterns still work
   - Test migration paths for data and APIs
   - Validate deprecation warnings

## Example: Adding a Filter Feature to Research Layer

Let's walk through an example of enhancing the Research layer with advanced filtering capabilities:

### 1. Feature Specification

```markdown
# Advanced Filtering Feature Specification

## Purpose
Add advanced filtering capabilities to the Research layer to allow users to filter research items by multiple criteria simultaneously.

## Key Functionality
- Filter by multiple tags (AND/OR logic)
- Filter by date ranges
- Filter by content type
- Save and load filter presets
- Share filter configurations

## User Stories
- As a researcher, I want to filter my research items by multiple tags to find specific content
- As a researcher, I want to save filter configurations for later use
- As a researcher, I want to share my filter configurations with team members
```

### 2. Impact Assessment

```markdown
# Advanced Filtering Impact Assessment

## Affected Components
- `ResearchList.vue`: Add filter UI and logic
- `ResearchItem.vue`: Update to support highlighting filtered content
- `useResearch.ts`: Add filtering methods

## API Changes
- Add `filterItems` method to `useResearch` composable
- Add `saveFilterPreset` and `loadFilterPreset` methods
- Modify `fetchItems` to accept filter parameters

## Database Schema Changes
- Add `filter_presets` collection to store saved filters
- Add filter-related fields to user preferences

## Performance Implications
- Client-side filtering for small datasets
- Server-side filtering with pagination for large datasets
- Indexing requirements for filter fields
```

### 3. Implementation Plan

```markdown
# Advanced Filtering Implementation Plan

## Component Modifications
- Update `ResearchList.vue` to include filter UI
- Add `ResearchFilters.vue` component for filter controls
- Modify `ResearchItem.vue` to highlight filtered content

## New Components
- Create `FilterPresetManager.vue` for saving/loading presets
- Create `FilterShareDialog.vue` for sharing filters
- Create `useFilters.ts` composable for filter logic

## Data Flow Changes
- Add filter state to research store
- Update item fetching to include filter parameters
- Add filter preset persistence logic

## Migration Strategy
- No migration needed for existing data
- Filters will be opt-in for users
```

### 4. Implementation

```vue
<!-- New ResearchFilters.vue component -->
<template>
  <div class="research-filters">
    <h3>Filters</h3>
    
    <!-- Tag filters -->
    <div class="filter-section">
      <h4>Tags</h4>
      <div class="tag-list">
        <TagSelector 
          v-model="selectedTags" 
          :available-tags="availableTags"
          :logic-mode="tagLogicMode"
          @update:logic-mode="tagLogicMode = $event"
        />
      </div>
    </div>
    
    <!-- Date range filter -->
    <div class="filter-section">
      <h4>Date Range</h4>
      <DateRangePicker
        v-model:start="dateRange.start"
        v-model:end="dateRange.end"
      />
    </div>
    
    <!-- Content type filter -->
    <div class="filter-section">
      <h4>Content Type</h4>
      <ContentTypeSelector v-model="selectedContentTypes" />
    </div>
    
    <!-- Filter actions -->
    <div class="filter-actions">
      <Button @click="applyFilters">Apply Filters</Button>
      <Button variant="outline" @click="resetFilters">Reset</Button>
      <Button variant="secondary" @click="savePreset">Save Preset</Button>
    </div>
    
    <!-- Preset manager -->
    <FilterPresetManager
      v-if="showPresetManager"
      :presets="filterPresets"
      @load="loadPreset"
      @delete="deletePreset"
      @share="sharePreset"
      @close="showPresetManager = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useResearch } from '~/layers/research/composables/useResearch'
import { useFilters } from '~/layers/research/composables/useFilters'

const { availableTags, fetchItems } = useResearch()
const { 
  saveFilterPreset, 
  loadFilterPreset,
  deleteFilterPreset,
  shareFilterPreset,
  filterPresets
} = useFilters()

// Filter state
const selectedTags = ref([])
const tagLogicMode = ref('AND') // 'AND' or 'OR'
const dateRange = reactive({
  start: null,
  end: null
})
const selectedContentTypes = ref([])
const showPresetManager = ref(false)

// Apply the current filters
const applyFilters = () => {
  const filters = {
    tags: {
      values: selectedTags.value,
      logic: tagLogicMode.value
    },
    dateRange: dateRange,
    contentTypes: selectedContentTypes.value
  }
  
  fetchItems({ filters })
}

// Reset all filters
const resetFilters = () => {
  selectedTags.value = []
  dateRange.start = null
  dateRange.end = null
  selectedContentTypes.value = []
  applyFilters()
}

// Save current filter as preset
const savePreset = async () => {
  const presetName = await promptForPresetName()
  if (presetName) {
    await saveFilterPreset(presetName, {
      tags: {
        values: selectedTags.value,
        logic: tagLogicMode.value
      },
      dateRange: { ...dateRange },
      contentTypes: [...selectedContentTypes.value]
    })
  }
}

// Load a saved preset
const loadPreset = (preset) => {
  selectedTags.value = [...preset.filters.tags.values]
  tagLogicMode.value = preset.filters.tags.logic
  dateRange.start = preset.filters.dateRange.start
  dateRange.end = preset.filters.dateRange.end
  selectedContentTypes.value = [...preset.filters.contentTypes]
  applyFilters()
}

// Delete a preset
const deletePreset = async (presetId) => {
  if (await confirmDeletion()) {
    await deleteFilterPreset(presetId)
  }
}

// Share a preset with other users
const sharePreset = (preset) => {
  shareFilterPreset(preset)
}

// Helper to prompt for preset name
const promptForPresetName = () => {
  // Implementation
}

// Helper to confirm deletion
const confirmDeletion = () => {
  // Implementation
}
</script>
```

### 5. Composable Implementation

```typescript
// New useFilters.ts composable
import { ref, computed } from 'vue'
import { useAuth } from '~/layers/auth/composables/auth'
import { useCreatorData } from '~/layers/creator/composables/useCreatorData'

export const useFilters = () => {
  const { user, currentWorkspace } = useAuth()
  const { 
    createData, 
    updateData, 
    deleteData, 
    queryData 
  } = useCreatorData()
  
  const filterPresets = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  
  // Load user's filter presets
  const loadFilterPresets = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const presets = await queryData('filter_presets', {
        filters: {
          user_id: user.value.id,
          workspace_id: currentWorkspace.value.id
        }
      })
      
      filterPresets.value = presets
    } catch (err) {
      error.value = err.message
      console.error('Failed to load filter presets:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  // Save a new filter preset
  const saveFilterPreset = async (name, filterConfig) => {
    isLoading.value = true
    error.value = null
    
    try {
      const presetData = {
        name,
        filters: filterConfig,
        created_at: new Date().toISOString(),
        user_id: user.value.id,
        workspace_id: currentWorkspace.value.id
      }
      
      const presetId = await createData('filter_presets', presetData)
      
      // Add to local state
      filterPresets.value.push({
        id: presetId,
        ...presetData
      })
      
      return presetId
    } catch (err) {
      error.value = err.message
      console.error('Failed to save filter preset:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Update an existing preset
  const updateFilterPreset = async (presetId, updates) => {
    isLoading.value = true
    error.value = null
    
    try {
      await updateData('filter_presets', presetId, updates)
      
      // Update local state
      const index = filterPresets.value.findIndex(p => p.id === presetId)
      if (index !== -1) {
        filterPresets.value[index] = {
          ...filterPresets.value[index],
          ...updates
        }
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to update filter preset:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Delete a preset
  const deleteFilterPreset = async (presetId) => {
    isLoading.value = true
    error.value = null
    
    try {
      await deleteData('filter_presets', presetId)
      
      // Update local state
      filterPresets.value = filterPresets.value.filter(p => p.id !== presetId)
    } catch (err) {
      error.value = err.message
      console.error('Failed to delete filter preset:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Share a preset with other users
  const shareFilterPreset = async (preset, recipientEmails) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Create a shareable version of the preset
      const shareablePreset = {
        ...preset.filters,
        shared_by: user.value.id,
        shared_at: new Date().toISOString()
      }
      
      // Call sharing API
      const shareResult = await $fetch('/api/research/share-filter', {
        method: 'POST',
        body: {
          preset: shareablePreset,
          recipients: recipientEmails
        }
      })
      
      return shareResult
    } catch (err) {
      error.value = err.message
      console.error('Failed to share filter preset:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Apply filters to a dataset
  const applyFilters = (items, filterConfig) => {
    if (!filterConfig) return items
    
    let filteredItems = [...items]
    
    // Apply tag filters
    if (filterConfig.tags?.values?.length) {
      const { values, logic } = filterConfig.tags
      
      if (logic === 'AND') {
        // Item must have ALL selected tags
        filteredItems = filteredItems.filter(item => 
          values.every(tag => item.tags?.includes(tag))
        )
      } else {
        // Item must have ANY selected tag
        filteredItems = filteredItems.filter(item => 
          values.some(tag => item.tags?.includes(tag))
        )
      }
    }
    
    // Apply date range filter
    if (filterConfig.dateRange?.start || filterConfig.dateRange?.end) {
      const { start, end } = filterConfig.dateRange
      
      if (start && end) {
        // Filter items between start and end dates
        filteredItems = filteredItems.filter(item => {
          const itemDate = new Date(item.created_at)
          return itemDate >= new Date(start) && itemDate <= new Date(end)
        })
      } else if (start) {
        // Filter items after start date
        filteredItems = filteredItems.filter(item => {
          const itemDate = new Date(item.created_at)
          return itemDate >= new Date(start)
        })
      } else if (end) {
        // Filter items before end date
        filteredItems = filteredItems.filter(item => {
          const itemDate = new Date(item.created_at)
          return itemDate <= new Date(end)
        })
      }
    }
    
    // Apply content type filters
    if (filterConfig.contentTypes?.length) {
      filteredItems = filteredItems.filter(item => 
        filterConfig.contentTypes.includes(item.content_type)
      )
    }
    
    return filteredItems
  }
  
  // Initialize by loading presets
  loadFilterPresets()
  
  return {
    filterPresets,
    isLoading,
    error,
    loadFilterPresets,
    saveFilterPreset,
    updateFilterPreset,
    deleteFilterPreset,
    shareFilterPreset,
    applyFilters
  }
}
```

### 6. Update Research Layer README

```markdown
# Research Layer

## Overview
The Research layer provides functionality for managing research projects, books, and notes.

## New Feature: Advanced Filtering

### Overview
The Advanced Filtering feature allows users to filter research items by multiple criteria simultaneously, save filter presets, and share filter configurations with team members.

### Key Components
- `ResearchFilters.vue`: UI component for filter controls
- `FilterPresetManager.vue`: UI for managing saved filter presets
- `useFilters.ts`: Composable for filter logic and preset management

### Usage Example
```vue
<template>
  <div>
    <ResearchFilters @filter-change="onFilterChange" />
    <ResearchList :items="filteredItems" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useResearch } from '~/layers/research/composables/useResearch'
import { useFilters } from '~/layers/research/composables/useFilters'

const { items } = useResearch()
const { applyFilters } = useFilters()

const currentFilters = ref(null)
const filteredItems = computed(() => {
  return applyFilters(items.value, currentFilters.value)
})

const onFilterChange = (filters) => {
  currentFilters.value = filters
}
</script>
```

### API Changes
- New composable `useFilters` with methods:
  - `saveFilterPreset(name, filterConfig)`
  - `loadFilterPresets()`
  - `updateFilterPreset(presetId, updates)`
  - `deleteFilterPreset(presetId)`
  - `shareFilterPreset(preset, recipientEmails)`
  - `applyFilters(items, filterConfig)`
```

## Versioning and Backward Compatibility

When enhancing layers, follow these versioning guidelines:

1. **Semantic Versioning**:
   - Increment MAJOR version for breaking changes
   - Increment MINOR version for backward-compatible additions
   - Increment PATCH version for backward-compatible bug fixes

2. **Deprecation Process**:
   - Mark deprecated features with `@deprecated` JSDoc tags
   - Provide deprecation warnings in the console
   - Document migration path in the README
   - Remove deprecated features only in MAJOR version updates

3. **Feature Flags**:
   - Use feature flags for major changes
   - Allow opt-in for new features
   - Provide configuration options for behavior changes

## Conclusion

Enhancing existing layers requires careful planning, thorough documentation, and attention to backward compatibility. By following these guidelines, you can add new features while maintaining the integrity and usability of the Empire ecosystem.

Remember to:
1. Plan thoroughly before implementation
2. Document all changes
3. Test extensively
4. Provide migration paths
5. Update all relevant documentation

This approach ensures that layer enhancements integrate seamlessly with existing functionality and provide a consistent experience for users. 