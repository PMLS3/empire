<script setup lang="ts">
const navigation = [
  {
    name: 'Dashboard',
    children: [
      {
        name: 'Research Overview',
        icon: 'ph:books-duotone',
        to: '/research/dashboard',
        exact: true,
      },
      {
        name: 'Recent Activity',
        icon: 'ph:activity-duotone',
        to: '/research/activity',
      },
      {
        name: 'Analytics',
        icon: 'ph:chart-bar-duotone',
        to: '/research/analytics',
      }
    ],
  },
  {
    name: 'Research Projects',
    children: [
      {
        name: 'All Projects',
        icon: 'ph:folder-open-duotone',
        to: '/research/projects',
        exact: true,
      },
      {
        name: 'By Category',
        icon: 'ph:tag-duotone',
        to: '/research/projects/categories',
      },
      {
        name: 'By Status',
        icon: 'ph:check-circle-duotone',
        to: '/research/projects/status',
      },
      {
        name: 'Create New',
        icon: 'ph:plus-circle-duotone',
        to: '/research/projects/create',
      }
    ],
  },
  {
    name: 'Book Collection',
    children: [
      {
        name: 'All Books',
        icon: 'ph:book-open-duotone',
        to: '/research/books',
        exact: true,
      },
      {
        name: 'Book Scraper',
        icon: 'ph:spider-duotone',
        to: '/research/books/scrape',
      },
      {
        name: 'Compare Books',
        icon: 'ph:scales-duotone',
        to: '/research/books/compare',
      },
      {
        name: 'Vector Search',
        icon: 'ph:magnifying-glass-duotone',
        to: '/research/books/search',
      },
    ],
  },
  {
    name: 'AI Research',
    children: [
      {
        name: 'Deep Research',
        icon: 'ph:brain-duotone',
        to: '/research/ai/deep-research',
      },
      {
        name: 'Insights',
        icon: 'ph:lightbulb-duotone',
        to: '/research/ai/insights',
      },
      {
        name: 'Conversations',
        icon: 'ph:chat-text-duotone',
        to: '/research/ai/conversations',
      },
      {
        name: 'Vector Clustering',
        icon: 'ph:circles-three-duotone',
        to: '/research/ai/clustering',
      },
    ],
  },
  {
    name: 'File Management',
    children: [
      {
        name: 'All Files',
        icon: 'ph:file-text-duotone',
        to: '/research/files',
      },
      {
        name: 'Upload Files',
        icon: 'ph:upload-simple-duotone',
        to: '/research/files/upload',
      },
      {
        name: 'Research Documents',
        icon: 'ph:file-pdf-duotone',
        to: '/research/files/documents',
      }
    ],
  },
  {
    divider: true,
  },
  {
    name: 'Categories',
    children: [
      {
        name: 'Manage Categories',
        icon: 'ph:folders-duotone',
        to: '/research/categories',
      },
      {
        name: 'Create Category',
        icon: 'ph:folder-plus-duotone',
        to: '/research/categories/create',
      }
    ],
  },
  {
    name: 'Settings',
    children: [
      {
        name: 'Preferences',
        icon: 'ph:gear-six-duotone',
        to: '/research/settings',
      },
      {
        name: 'Embedding Providers',
        icon: 'ph:cube-duotone',
        to: '/research/settings/embeddings',
      },
      {
        name: 'API Connections',
        icon: 'ph:plugs-connected-duotone',
        to: '/research/settings/connections',
      },
    ],
  }
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
