<script setup lang="ts">
import { useCreatorData } from '../../composables/useCreatorData';
import type { VideoProject } from '../../types/project';

definePageMeta({
  title: 'Project Details',
});

const route = useRoute();
const router = useRouter();
const projectId = computed(() => route.params.id as string);

// Active tab for collaboration section
const activeTab = ref('team'); // 'team', 'comments', or 'history'

const { getDataById, loading, error } = useCreatorData();
const project = ref<VideoProject | null>(null);
const channel = ref<any | null>(null);

// Fetch project and channel data
onMounted(async () => {
  await fetchProjectDetails();
});

const fetchProjectDetails = async () => {
  try {
    const projectData = await getDataById('projects', projectId.value);
    if (projectData) {
      project.value = projectData as VideoProject;
      
      // Fetch channel information
      if (project.value.channel_id) {
        channel.value = await getDataById('channels', project.value.channel_id);
      }
    }
  } catch (err) {
    console.error('Error fetching project details:', err);
  }
};

// Format date helper
const formatDate = (date: string | Date | null) => {
  if (!date) return 'Not set';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format duration helper
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds} seconds`;
  }
  
  return `${minutes} min ${remainingSeconds} sec`;
};

// Navigate to edit page
const editProject = () => {
  router.push(`/projects/${projectId.value}/edit`);
};

// Navigate to editor
const openInEditor = () => {
  router.push(`/editor/${projectId.value}`);
};

// Navigate back to projects
const backToProjects = () => {
  router.push('/projects');
};

// Project status colors and labels
const statusMap = {
  'draft': { 
    color: 'warning', 
    label: 'Draft',
    icon: 'ph:pencil-line-duotone'
  },
  'in_progress': { 
    color: 'info', 
    label: 'In Progress',
    icon: 'ph:spinner-gap-duotone'
  },
  'ready_to_publish': { 
    color: 'success', 
    label: 'Ready to Publish',
    icon: 'ph:check-circle-duotone'
  },
  'published': { 
    color: 'primary', 
    label: 'Published',
    icon: 'ph:broadcast-duotone'
  },
  'archived': { 
    color: 'muted', 
    label: 'Archived',
    icon: 'ph:archive-box-duotone'
  }
};
</script>

<template>
  <div class="py-10">
    <!-- Header -->
    <div class="mb-8 flex flex-col justify-between md:flex-row md:items-center">
      <div class="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
        <div>
          <BaseHeading
            as="h2"
            size="xl"
            weight="light"
            lead="tight"
            class="text-muted-800 dark:text-white"
          >
            <span v-if="loading">Loading Project...</span>
            <span v-else-if="project">{{ project.title }}</span>
            <span v-else>Project Details</span>
          </BaseHeading>
          <BaseParagraph v-if="!loading && channel">
            <span class="text-muted-500">
              {{ channel.name }}
            </span>
          </BaseParagraph>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-center gap-2 md:mt-0 md:justify-start">
        <BaseButtonAction @click="backToProjects">
          <Icon name="lucide:arrow-left" class="size-3" />
          <span>Back to Projects</span>
        </BaseButtonAction>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-12">
      <BaseProgressCircle size="lg" />
    </div>

    <!-- Error message -->
    <BaseMessage v-else-if="error" type="danger" class="mb-6">
      {{ error }}
    </BaseMessage>

    <!-- Project not found -->
    <div v-else-if="!project" class="text-center py-12">
      <Icon name="ph:warning-circle-duotone" class="size-16 text-danger-500 mx-auto mb-4" />
      <BaseHeading as="h3" size="lg" class="mb-2">Project Not Found</BaseHeading>
      <BaseParagraph class="text-muted-500 mb-6">
        The project you're looking for doesn't exist or has been deleted.
      </BaseParagraph>
      <BaseButton to="/projects" color="primary">
        <Icon name="lucide:arrow-left" class="me-2 size-4" />
        <span>Back to Projects</span>
      </BaseButton>
    </div>

    <!-- Project details -->
    <div v-else class="grid grid-cols-12 gap-6">
      <!-- Main content column -->
      <div class="col-span-12 lg:col-span-8">
        <div class="space-y-6">
          <!-- Project preview -->
          <BaseCard class="overflow-hidden">
            <div class="relative bg-muted-800 aspect-video">
              <img
                v-if="project.thumbnail_url"
                :src="project.thumbnail_url"
                :alt="project.title"
                class="w-full h-full object-contain"
              >
              <div v-else class="h-full w-full flex flex-col items-center justify-center p-6">
                <Icon name="ph:video-duotone" class="size-16 text-muted-400 mb-4" />
                <BaseText class="text-center text-muted-400">
                  No preview available yet. Open in the editor to start creating your video.
                </BaseText>
              </div>

              <!-- Action buttons -->
              <div class="absolute bottom-4 right-4 flex gap-2">
                <BaseButton color="primary" @click="openInEditor">
                  <Icon name="ph:play-duotone" class="me-1 size-4" />
                  Open in Editor
                </BaseButton>
              </div>
            </div>
          </BaseCard>

          <!-- Project description -->
          <BaseCard>
            <div class="p-5">
              <BaseHeading as="h3" size="md" weight="medium" class="mb-4">
                Description
              </BaseHeading>
              <BaseParagraph v-if="project.description">
                {{ project.description }}
              </BaseParagraph>
              <BaseText v-else class="text-muted-400 italic">
                No description provided.
              </BaseText>

              <!-- Tags -->
              <div v-if="project.metadata?.tags?.length" class="mt-4">
                <BaseHeading as="h4" size="sm" weight="medium" class="mb-2">
                  Tags
                </BaseHeading>
                <div class="flex flex-wrap gap-2">
                  <BaseTag
                    v-for="tag in project.metadata.tags"
                    :key="tag"
                    color="default"
                    rounded="lg"
                  >
                    {{ tag }}
                  </BaseTag>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Project timeline (placeholder for now) -->
          <BaseCard>
            <div class="p-5">
              <div class="flex items-center justify-between mb-4">
                <BaseHeading as="h3" size="md" weight="medium">
                  Project Timeline
                </BaseHeading>
                <BaseTag :color="statusMap[project.status]?.color || 'default'">
                  <div class="flex items-center">
                    <Icon :name="statusMap[project.status]?.icon || 'ph:info'" class="me-1 size-4" />
                    {{ statusMap[project.status]?.label || project.status }}
                  </div>
                </BaseTag>
              </div>
              
              <div class="bg-muted-100 dark:bg-muted-800 rounded-lg p-4 mb-4">
                <ul class="space-y-3">
                  <li class="flex items-center gap-3">
                    <div class="bg-primary-500 dark:bg-primary-400 text-white size-8 rounded-full flex items-center justify-center">
                      <Icon name="ph:pencil-duotone" class="size-4" />
                    </div>
                    <div>
                      <div class="font-medium">Created</div>
                      <div class="text-xs text-muted-500">{{ formatDate(project.created_at) }}</div>
                    </div>
                  </li>
                  <li class="flex items-center gap-3">
                    <div class="bg-info-500 dark:bg-info-400 text-white size-8 rounded-full flex items-center justify-center">
                      <Icon name="ph:clock-duotone" class="size-4" />
                    </div>
                    <div>
                      <div class="font-medium">Last Updated</div>
                      <div class="text-xs text-muted-500">{{ formatDate(project.updated_at) }}</div>
                    </div>
                  </li>
                  <li v-if="project.published_at" class="flex items-center gap-3">
                    <div class="bg-success-500 dark:bg-success-400 text-white size-8 rounded-full flex items-center justify-center">
                      <Icon name="ph:broadcast-duotone" class="size-4" />
                    </div>
                    <div>
                      <div class="font-medium">Published</div>
                      <div class="text-xs text-muted-500">{{ formatDate(project.published_at) }}</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </BaseCard>
          
          <!-- Team Collaboration Section with Tabs -->
          <div>
            <BaseTabs
              :tabs="[
                { label: 'Team', value: 'team', icon: 'ph:users-duotone' },
                { label: 'Comments', value: 'comments', icon: 'ph:chat-centered-text-duotone' },
                { label: 'Version History', value: 'history', icon: 'ph:git-branch-duotone' }
              ]"
              v-model="activeTab"
              class="mb-6"
            />

            <!-- Tab Content -->
            <div v-if="activeTab === 'team'">
              <ProjectCollaboration :project-id="projectId" />
            </div>
            
            <div v-else-if="activeTab === 'comments'">
              <ProjectComments :project-id="projectId" />
            </div>
            
            <div v-else-if="activeTab === 'history'">
              <ProjectVersionHistory :project-id="projectId" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar column -->
      <div class="col-span-12 lg:col-span-4">
        <div class="space-y-6">
          <!-- Action buttons -->
          <BaseCard>
            <div class="p-5 space-y-3">
              <BaseButton color="primary" class="w-full" @click="openInEditor">
                <Icon name="ph:play-duotone" class="me-1 size-4" />
                Open in Editor
              </BaseButton>
              <BaseButton color="default" class="w-full" @click="editProject">
                <Icon name="ph:pencil-simple-duotone" class="me-1 size-4" />
                Edit Project Details
              </BaseButton>
            </div>
          </BaseCard>

          <!-- Project details -->
          <BaseCard>
            <div class="p-5">
              <BaseHeading as="h3" size="md" weight="medium" class="mb-4">
                Project Details
              </BaseHeading>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <BaseText class="text-muted-500">Video Type</BaseText>
                  <BaseText class="font-medium">{{ project.video_type }}</BaseText>
                </div>
                <div class="flex justify-between">
                  <BaseText class="text-muted-500">Duration</BaseText>
                  <BaseText class="font-medium">{{ formatDuration(project.settings.duration_target) }}</BaseText>
                </div>
                <div class="flex justify-between">
                  <BaseText class="text-muted-500">Format</BaseText>
                  <BaseText class="font-medium">{{ project.settings.format }}</BaseText>
                </div>
                <div class="flex justify-between">
                  <BaseText class="text-muted-500">Quality</BaseText>
                  <BaseText class="font-medium">{{ project.settings.quality }}</BaseText>
                </div>
                <div class="flex justify-between">
                  <BaseText class="text-muted-500">Category</BaseText>
                  <BaseText class="font-medium">{{ project.metadata?.category || 'Not specified' }}</BaseText>
                </div>
                <div class="flex justify-between">
                  <BaseText class="text-muted-500">Language</BaseText>
                  <BaseText class="font-medium">{{ project.metadata?.language || 'Not specified' }}</BaseText>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Target platforms -->
          <BaseCard>
            <div class="p-5">
              <BaseHeading as="h3" size="md" weight="medium" class="mb-4">
                Target Platforms
              </BaseHeading>
              <div class="space-y-3">
                <div v-for="platform in project.target_platform" :key="platform" class="flex items-center">
                  <div class="me-3">
                    <Icon v-if="platform === 'youtube'" name="logos:youtube-icon" class="size-6" />
                    <Icon v-else-if="platform === 'tiktok'" name="logos:tiktok-icon" class="size-6" />
                    <Icon v-else-if="platform === 'instagram'" name="mdi:instagram" class="size-6" />
                    <Icon v-else-if="platform === 'facebook'" name="mdi:facebook" class="size-6" />
                    <Icon v-else name="ph:social-duotone" class="size-6" />
                  </div>
                  <BaseText>{{ platform.charAt(0).toUpperCase() + platform.slice(1) }}</BaseText>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Publishing schedule (if set) -->
          <BaseCard v-if="project.schedule">
            <div class="p-5">
              <BaseHeading as="h3" size="md" weight="medium" class="mb-4">
                Publishing Schedule
              </BaseHeading>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <BaseText class="text-muted-500">Publish Date</BaseText>
                  <BaseText class="font-medium">{{ formatDate(project.schedule.publish_date) }}</BaseText>
                </div>
                <div class="flex justify-between">
                  <BaseText class="text-muted-500">Time Zone</BaseText>
                  <BaseText class="font-medium">{{ project.schedule.time_zone }}</BaseText>
                </div>
                <div class="flex justify-between">
                  <BaseText class="text-muted-500">Status</BaseText>
                  <BaseTag :color="project.schedule.status === 'scheduled' ? 'info' : 'default'" size="sm">
                    {{ project.schedule.status }}
                  </BaseTag>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </div>
</template>
