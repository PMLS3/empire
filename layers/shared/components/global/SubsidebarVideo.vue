<script setup lang="ts">
const navigation = [
  {
    name: 'Dashboard',
    children: [
      {
        name: 'Video Overview',
        icon: 'ph:video-camera-duotone',
        to: '/creator/dashboard',
        exact: true,
      },
      {
        name: 'Recent Activity',
        icon: 'ph:activity-duotone',
        to: '/creator/activity',
      },
      {
        name: 'Analytics',
        icon: 'ph:chart-bar-duotone',
        to: '/creator/analytics',
      }
    ],
  },
  {
    name: 'Video Projects',
    children: [
      {
        name: 'All Projects',
        icon: 'ph:folder-open-duotone',
        to: '/creator/projects',
        exact: true,
      },
      {
        name: 'Create Project',
        icon: 'ph:plus-circle-duotone',
        to: '/creator/projects/new',
      },
      {
        name: 'Templates',
        icon: 'ph:template-duotone',
        to: '/creator/templates',
      }
    ],
  },
  {
    name: 'Channels',
    children: [
      {
        name: 'All Channels',
        icon: 'ph:broadcast-duotone',
        to: '/creator/channel',
        exact: true,
      },
      {
        name: 'Connect Channel',
        icon: 'ph:link-duotone',
        to: '/creator/channel/connect',
      }
    ],
  },
  {
    name: 'AI Tools',
    children: [
      {
        name: 'Script Generator',
        icon: 'ph:text-t-duotone',
        to: '/creator/tools/script',
      },
      {
        name: 'Voice Generator',
        icon: 'ph:microphone-stage-duotone',
        to: '/creator/tools/voice',
      },
      {
        name: 'Image Generator',
        icon: 'ph:image-duotone',
        to: '/creator/tools/image',
      }
    ],
  },
  {
    name: 'Asset Library',
    children: [
      {
        name: 'All Assets',
        icon: 'ph:film-strip-duotone',
        to: '/creator/assets',
        exact: true,
      },
      {
        name: 'Upload Assets',
        icon: 'ph:upload-simple-duotone',
        to: '/creator/assets/upload',
      },
      {
        name: 'Audio Library',
        icon: 'ph:music-notes-duotone',
        to: '/creator/assets/audio',
      },
      {
        name: 'Image Library',
        icon: 'ph:image-square-duotone',
        to: '/creator/assets/images',
      }
    ],
  },
  {
    divider: true,
  },
  {
    name: 'System',
    children: [
      {
        name: 'Job Queue Status',
        icon: 'ph:queue-duotone',
        to: '/creator/system/jobs',
      },
      {
        name: 'Performance Testing',
        icon: 'ph:gauge-duotone',
        to: '/creator/testing/performance',
      }
    ],
  },
  {
    name: 'Settings',
    children: [
      {
        name: 'Preferences',
        icon: 'ph:gear-six-duotone',
        to: '/creator/settings',
      },
      {
        name: 'Export Settings',
        icon: 'ph:export-duotone',
        to: '/creator/settings/export',
      },
      {
        name: 'Platform Connections',
        icon: 'ph:plugs-connected-duotone',
        to: '/creator/settings/connections',
      },
      {
        name: 'Team Access',
        icon: 'ph:users-three-duotone',
        to: '/creator/settings/team',
      },
      {
        name: 'Content Moderation',
        icon: 'ph:shield-check-duotone',
        to: '/creator/settings/moderation',
      }
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
