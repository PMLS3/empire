<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCreatorData } from '../../composables/useCreatorData';
import { useToaster } from '../../../shared/composables/toaster';
import type { VideoProject } from '../../types/project';

const props = defineProps<{
  projectId: string;
}>();

const emit = defineEmits(['updated']);

const { getDataById, updateData } = useCreatorData();
const toaster = useToaster();

const project = ref<VideoProject | null>(null);
const loading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);

// Team members for the project
const teamMembers = ref<Array<{
  id: string;
  email: string;
  role: string;
  added_at: string;
  avatar?: string;
}>>([]);

// New team member form
const newTeamMember = ref({
  email: '',
  role: 'editor'
});

// Role options
const roleOptions = [
  { value: 'admin', label: 'Admin', description: 'Full access to manage project and team' },
  { value: 'editor', label: 'Editor', description: 'Can edit content but cannot manage team' },
  { value: 'viewer', label: 'Viewer', description: 'Can view content only' },
];

// Get project data and team members
onMounted(async () => {
  await fetchProjectData();
});

const fetchProjectData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const projectData = await getDataById('projects', props.projectId);
    if (projectData) {
      project.value = projectData as VideoProject;
      
      // Extract team members from project data
      if (project.value.team_members && project.value.team_members.length > 0) {
        // In a real implementation, we'd fetch user details for each team member
        // For now, we'll mock the data with emails based on IDs
        teamMembers.value = project.value.team_members.map(member => ({
          id: member.user_id,
          email: `user-${member.user_id.substring(0, 5)}@example.com`,
          role: member.role,
          added_at: typeof member.added_at === 'string' ? member.added_at : new Date(member.added_at).toISOString(),
          avatar: `https://i.pravatar.cc/150?u=${member.user_id}`,
        }));
      }
    }
  } catch (err) {
    console.error('Error fetching project data:', err);
    error.value = 'Failed to load project collaboration data';
  } finally {
    loading.value = false;
  }
};

// Add new team member
const addTeamMember = async () => {
  if (!newTeamMember.value.email || !project.value) return;
  
  saving.value = true;
  
  try {
    // In a real implementation, you would look up the user ID by email
    // For now, we'll generate a mock ID
    const userId = `user-${Date.now()}`;
    
    // Create new team member object
    const newMember = {
      user_id: userId,
      role: newTeamMember.value.role,
      added_at: new Date().toISOString(),
    };
    
    // Update project team members
    const updatedTeamMembers = [...(project.value.team_members || []), newMember];
    
    // Save to Firestore
    await updateData('projects', props.projectId, {
      team_members: updatedTeamMembers,
    });
    
    // Update local state
    teamMembers.value.push({
      id: userId,
      email: newTeamMember.value.email,
      role: newTeamMember.value.role,
      added_at: newMember.added_at,
      avatar: `https://i.pravatar.cc/150?u=${userId}`,
    });
    
    // Reset form
    newTeamMember.value.email = '';
    
    // Notify parent component
    emit('updated');
    
    // Show success message
    toaster.show({
      title: 'Success',
      message: 'Team member added successfully',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (err) {
    console.error('Error adding team member:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to add team member',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    saving.value = false;
  }
};

// Update team member role
const updateTeamMemberRole = async (memberId: string, newRole: string) => {
  if (!project.value) return;
  
  saving.value = true;
  
  try {
    // Find and update the team member in the project
    const updatedTeamMembers = project.value.team_members?.map(member => {
      if (member.user_id === memberId) {
        return {
          ...member,
          role: newRole,
        };
      }
      return member;
    });
    
    // Save to Firestore
    await updateData('projects', props.projectId, {
      team_members: updatedTeamMembers,
    });
    
    // Update local state
    const memberIndex = teamMembers.value.findIndex(m => m.id === memberId);
    if (memberIndex !== -1) {
      teamMembers.value[memberIndex].role = newRole;
    }
    
    // Notify parent component
    emit('updated');
    
    // Show success message
    toaster.show({
      title: 'Success',
      message: 'Team member role updated',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (err) {
    console.error('Error updating team member:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to update team member role',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    saving.value = false;
  }
};

// Remove team member
const removeTeamMember = async (memberId: string) => {
  if (!project.value) return;
  
  saving.value = true;
  
  try {
    // Filter out the team member from the project
    const updatedTeamMembers = project.value.team_members?.filter(
      member => member.user_id !== memberId
    );
    
    // Save to Firestore
    await updateData('projects', props.projectId, {
      team_members: updatedTeamMembers,
    });
    
    // Update local state
    teamMembers.value = teamMembers.value.filter(m => m.id !== memberId);
    
    // Notify parent component
    emit('updated');
    
    // Show success message
    toaster.show({
      title: 'Success',
      message: 'Team member removed',
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (err) {
    console.error('Error removing team member:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to remove team member',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    saving.value = false;
  }
};

// Get color for role badge
const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'primary';
    case 'editor':
      return 'info';
    case 'viewer':
      return 'muted';
    default:
      return 'default';
  }
};

// Format date to relative time
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`;
  } else {
    return date.toLocaleDateString();
  }
};
</script>

<template>
  <BaseCard>
    <div class="p-5">
      <BaseHeading as="h3" size="md" weight="medium" class="mb-4">
        Team Collaboration
      </BaseHeading>

      <!-- Loading state -->
      <BasePlaceholderPage
        v-if="loading"
        title="Loading team members"
        subtitle="Please wait while we load the collaboration data"
        :ui="{ wrapper: 'py-8' }"
      />

      <!-- Error state -->
      <BaseMessage v-else-if="error" type="danger" class="mb-4">
        {{ error }}
      </BaseMessage>

      <!-- Add team member form -->
      <div v-else class="space-y-6">
        <div class="mb-6 border-muted-200 dark:border-muted-700 border-b pb-4">
          <BaseHeading as="h4" size="sm" weight="medium" class="mb-3">
            Add Team Member
          </BaseHeading>

          <div class="flex flex-col md:flex-row gap-3">
            <div class="flex-grow">
              <BaseInput
                v-model="newTeamMember.email"
                placeholder="Email address"
                label="Email"
              />
            </div>
            <div class="w-full md:w-48">
              <BaseSelect v-model="newTeamMember.role" label="Role">
                <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                  {{ role.label }}
                </option>
              </BaseSelect>
            </div>
            <div class="flex items-end">
              <BaseButton color="primary" @click="addTeamMember" :loading="saving" :disabled="saving">
                <Icon name="ph:plus-duotone" class="me-1 size-4" />
                Add Member
              </BaseButton>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-1 gap-2">
            <div v-for="role in roleOptions" :key="role.value" class="flex items-center gap-2">
              <BaseTag
                :color="getRoleColor(role.value)"
                size="sm"
                rounded="md"
                class="w-20 text-center"
              >
                {{ role.label }}
              </BaseTag>
              <BaseText size="xs" class="text-muted-400">{{ role.description }}</BaseText>
            </div>
          </div>
        </div>

        <!-- Team members list -->
        <div>
          <BaseHeading as="h4" size="sm" weight="medium" class="mb-3">
            Team Members
          </BaseHeading>

          <div class="space-y-3">
            <div v-if="teamMembers.length === 0" class="text-center py-8">
              <Icon name="ph:users-duotone" class="size-12 text-muted-400 mx-auto mb-2" />
              <BaseText class="text-muted-400">
                No team members added yet. Add someone to collaborate on this project.
              </BaseText>
            </div>

            <BaseCard
              v-for="member in teamMembers"
              :key="member.id"
              class="border-muted-200 dark:border-muted-700 border p-4"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <BaseAvatar
                    :src="member.avatar"
                    :text="member.email.charAt(0).toUpperCase()"
                    size="lg"
                  />
                  <div>
                    <BaseText weight="medium">{{ member.email }}</BaseText>
                    <div class="flex items-center gap-2">
                      <BaseTag
                        :color="getRoleColor(member.role)"
                        size="sm"
                        rounded="md"
                      >
                        {{ member.role.charAt(0).toUpperCase() + member.role.slice(1) }}
                      </BaseTag>
                      <BaseText size="xs" class="text-muted-400">
                        Added {{ formatDate(member.added_at) }}
                      </BaseText>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <BaseSelect
                    v-model="member.role"
                    size="sm"
                    class="w-32"
                    @update:model-value="updateTeamMemberRole(member.id, $event)"
                  >
                    <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                      {{ role.label }}
                    </option>
                  </BaseSelect>
                  <BaseButtonIcon
                    color="danger"
                    size="sm"
                    variant="ghost"
                    @click="removeTeamMember(member.id)"
                  >
                    <Icon name="ph:trash-duotone" class="size-4" />
                  </BaseButtonIcon>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
