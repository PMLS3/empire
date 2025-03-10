# Empire UI Configuration Strategy

## Overview

This document outlines our approach to UI configuration across workspaces and layers in the Empire project, using the Tairo UI framework as our foundation.

## Configuration Architecture

### Configuration Layers

We implement a hierarchical configuration approach:

1. **Base Configuration** - Core UI settings shared across all workspaces
2. **Layer-specific Configuration** - UI elements associated with specific layers
3. **Workspace Configuration** - Workspace-specific UI customizations

### Directory Structure

```
empire/
├── layers/
│   ├── shared/
│   │   ├── ui/
│   │   │   ├── config/ 
│   │   │   │   ├── base.config.ts     # Base UI configuration
│   │   │   │   └── components.ts      # Shared component registry
│   ├── auth/
│   │   ├── config/
│   │   │   └── auth-ui.config.ts      # Auth-specific UI elements
│   ├── crm/
│   │   ├── config/
│   │   │   └── crm-ui.config.ts       # CRM-specific UI elements
├── workspaces/
│   ├── creator/
│   │   ├── app.config.ts              # Creator workspace config
│   ├── admin/
│   │   ├── app.config.ts              # Admin workspace config
```

## Configuration Implementation

### Base Configuration

The shared base configuration defines common UI elements:

```typescript
// layers/shared/ui/config/base.config.ts
export const baseConfig = {
  tairo: {
    title: 'Empire',
    panels: [
      {
        name: 'workspace-switcher',
        position: 'right',
        component: 'EmpireWorkspaceSwitcher',
      },
      // Other common panels
    ],
    error: {
      logo: {
        component: 'EmpireLogo',
        props: { class: 'w-full max-w-lg mx-auto' },
      },
    },
  }
}
```

### Layer-specific Configuration

Each layer provides its own UI configuration components:

```typescript
// layers/auth/config/auth-ui.config.ts
export const authUIConfig = {
  navigation: [
    {
      title: 'Profile',
      icon: { name: 'ph:user-circle-duotone', class: 'w-5 h-5' },
      to: '/profile',
    },
    {
      title: 'Workspaces',
      icon: { name: 'ph:buildings-duotone', class: 'w-5 h-5' },
      to: '/workspaces',
    },
  ],
  panels: [
    {
      name: 'profile',
      position: 'right',
      component: 'AuthProfilePanel',
    }
  ]
}
```

### Workspace Configuration

Each workspace combines the base and layer configurations:

```typescript
// workspaces/creator/app.config.ts
import { baseConfig } from '../../layers/shared/ui/config/base.config'
import { authUIConfig } from '../../layers/auth/config/auth-ui.config'
import { crmUIConfig } from '../../layers/crm/config/crm-ui.config'
import { merge } from 'lodash-es'

export default defineAppConfig({
  nuxtIcon: {},
  tairo: merge({}, 
    baseConfig.tairo,
    {
      title: 'Empire Creator',
      sidebar: {
        navigation: {
          logo: {
            component: 'EmpireLogo',
            props: { class: 'text-primary-600 h-10' },
          },
          items: [
            // Workspace-specific navigation items
            ...authUIConfig.navigation,
            ...crmUIConfig.navigation,
            {
              title: 'Creator Tools',
              icon: { name: 'ph:magic-wand-duotone', class: 'w-5 h-5' },
              to: '/tools',
            },
          ]
        },
        // Other sidebar settings
      }
    }
  )
})
```

## Navigation Structure

We support multiple navigation layouts imported from Tairo:

1. **Sidebar** - Full vertical navigation with collapsible sections
2. **Topnav** - Top horizontal navigation with dropdown menus
3. **Collapse** - Collapsible navigation with icons only in collapsed state
4. **Iconnav** - Icon-based navigation with popover menus

Workspaces can choose their preferred layout while maintaining consistent UI elements across the system.

## Toolbar Components

Toolbar components are organized by functionality:

- **Workspace Management** - For switching between workspaces
- **User Profile** - User settings and logout
- **Notifications** - Alerts and messages
- **Theme** - Appearance settings
- **Search** - Global search functionality

## Workspace-specific Theming

Each workspace can customize its appearance:

```typescript
// Extended workspace theming
export default defineAppConfig({
  tairo: {
    // Other configuration
    theme: {
      color: 'primary', // Workspace-specific primary color
      colors: {
        primary: {
          50: '#f0f9ff',
          // Other color shades
        }
      }
    }
  }
})
```

## Configuration Best Practices

1. **Modular Approach** - Keep configurations modular by functionality
2. **Avoid Duplication** - Use shared configuration objects
3. **Deep Merging** - Use lodash merge for combining configuration objects
4. **Type Safety** - Use TypeScript interfaces for configuration objects
5. **Consistent Naming** - Follow naming conventions for components and panels

## Component Development

When creating UI components for navigation:

1. **Maintain Layer Isolation** - Components should respect layer boundaries
2. **Composable Design** - Create reusable, composable components
3. **Prop Documentation** - Document props for all custom components
4. **Responsive Behavior** - Ensure components work across device sizes