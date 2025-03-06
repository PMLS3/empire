<script setup lang="ts">
import { useCreatorData } from '../../../composables/useCreatorData';

definePageMeta({
  title: 'Edit Project',
});

const route = useRoute();
const router = useRouter();
const projectId = computed(() => route.params.id as string);

const { getDataById, loading, error } = useCreatorData();
const project = ref<any | null>(null);
const channelId = ref('');

// Fetch project data
onMounted(async () => {
  try {
    const projectData = await getDataById('projects', projectId.value);
    if (projectData) {
      project.value = projectData;
      channelId.value = projectData.channel_id;
    } else {
      router.push('/projects');
    }
  } catch (err) {
    console.error('Error fetching project:', err);
  }
});

// Handle project update
const handleProjectUpdated = (updatedProject) => {
  router.push(`/projects/${updatedProject.id}`);
};

// Handle cancel
const handleCancel = () => {
  router.push(`/projects/${projectId.value}`);
};
</script>

<template>
  <div class="py-10">
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
            <span>Edit Project</span>
          </BaseHeading>
          <BaseParagraph>
            <span class="text-muted-500">
              Update your project details
            </span>
          </BaseParagraph>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-center gap-2 md:mt-0 md:justify-start">
        <BaseButtonAction :to="`/projects/${projectId}`">
          <Icon name="lucide:arrow-left" class="size-3" />
          <span>Back to Project</span>
        </BaseButtonAction>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <BaseProgressCircle size="lg" />
    </div>

    <BaseMessage v-else-if="error" type="danger" class="mb-6">
      {{ error }}
    </BaseMessage>

    <div v-else-if="project">
      <ProjectForm 
        :channel-id="channelId" 
        :project-id="projectId"
        mode="edit"
        @updated="handleProjectUpdated"
        @canceled="handleCancel"
      />
    </div>

    <div v-else class="text-center py-12">
      <Icon name="ph:warning-circle-duotone" class="size-16 text-danger-500 mx-auto mb-4" />
      <BaseHeading as="h3" size="lg" class="mb-2">Project Not Found</BaseHeading>
      <BaseParagraph class="text-muted-500 mb-6">
        The project you're trying to edit doesn't exist or has been deleted.
      </BaseParagraph>
      <BaseButton to="/projects" color="primary">
        <Icon name="lucide:arrow-left" class="me-2 size-4" />
        <span>Back to Projects</span>
      </BaseButton>
    </div>
  </div>
</template>
