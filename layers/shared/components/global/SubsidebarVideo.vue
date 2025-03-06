<script setup lang="ts">
const navigation = [
  {
    name: 'Dashboard',
    children: [
      {
        name: 'Video Overview',
        icon: 'ph:video-camera-duotone',
        to: '/creator/video/dashboard',
        exact: true,
      },
      {
        name: 'Recent Activity',
        icon: 'ph:activity-duotone',
        to: '/creator/video/activity',
      },
      {
        name: 'Analytics',
        icon: 'ph:chart-bar-duotone',
        to: '/creator/video/analytics',
      }
    ],
  },
  {
    name: 'Video Projects',
    children: [
      {
        name: 'All Projects',
        icon: 'ph:folder-open-duotone',
        to: '/creator/video/projects',
        exact: true,
      },
      {
        name: 'Create Project',
        icon: 'ph:plus-circle-duotone',
        to: '/creator/video/projects/new',
      },
      {
        name: 'Templates',
        icon: 'ph:template-duotone',
        to: '/creator/video/templates',
      }
    ],
  },
  {
    name: 'Channels',
    children: [
      {
        name: 'All Channels',
        icon: 'ph:broadcast-duotone',
        to: '/creator/video/channel',
        exact: true,
      },
      {
        name: 'Connect Channel',
        icon: 'ph:link-duotone',
        to: '/creator/video/channel/connect',
      }
    ],
  },
  {
    name: 'AI Tools',
    children: [
      {
        name: 'Script Generator',
        icon: 'ph:text-t-duotone',
        to: '/creator/video/tools/script',
      },
      {
        name: 'Voice Generator',
        icon: 'ph:microphone-stage-duotone',
        to: '/creator/video/tools/voice',
      },
      {
        name: 'Image Generator',
        icon: 'ph:image-duotone',
        to: '/creator/video/tools/image',
      }
    ],
  },
  {
    name: 'Asset Library',
    children: [
      {
        name: 'All Assets',
        icon: 'ph:film-strip-duotone',
        to: '/creator/video/assets',
        exact: true,
      },
      {
        name: 'Upload Assets',
        icon: 'ph:upload-simple-duotone',
        to: '/creator/video/assets/upload',
      },
      {
        name: 'Audio Library',
        icon: 'ph:music-notes-duotone',
        to: '/creator/video/assets/audio',
      },
      {
        name: 'Image Library',
        icon: 'ph:image-square-duotone',
        to: '/creator/video/assets/images',
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
        to: '/creator/video/system/jobs',
      },
      {
        name: 'Performance Testing',
        icon: 'ph:gauge-duotone',
        to: '/creator/video/testing/performance',
      }
    ],
  },
  {
    name: 'Settings',
    children: [
      {
        name: 'Preferences',
        icon: 'ph:gear-six-duotone',
        to: '/creator/video/settings',
      },
      {
        name: 'Export Settings',
        icon: 'ph:export-duotone',
        to: '/creator/video/settings/export',
      },
      {
        name: 'Platform Connections',
        icon: 'ph:plugs-connected-duotone',
        to: '/creator/video/settings/connections',
      },
      {
        name: 'Team Access',
        icon: 'ph:users-three-duotone',
        to: '/creator/video/settings/team',
      },
      {
        name: 'Content Moderation',
        icon: 'ph:shield-check-duotone',
        to: '/creator/video/settings/moderation',
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
