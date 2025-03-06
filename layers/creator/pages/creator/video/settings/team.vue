<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '../../../auth/composables/auth';
import { useAccessControl } from '../../composables/useAccessControl';
import { useToaster } from '../../../shared/composables/toaster';

const { user } = useAuth();
const { getTeamMembers, inviteUser, removeUser, updateUserRole } = useAccessControl();
const toaster = useToaster();

const loading = ref(true);
const inviteLoading = ref(false);
const teamMembers = ref([]);

// Invitation form
const showInviteForm = ref(false);
const inviteForm = ref({
  email: '',
  role: 'editor',
  message: '',
});

// Role descriptions
const roleDescriptions = {
  owner: 'Full access to all projects and settings. Can manage team members and billing.',
  admin: 'Can manage projects, assets, and some settings. Cannot manage billing or delete the account.',
  editor: 'Can create and edit projects they have been invited to. Cannot modify account settings.',
  viewer: 'Read-only access to projects they have been invited to. Cannot make changes.'
};

// Get team members
const loadTeamMembers = async () => {
  loading.value = true;
  
  try {
    const members = await getTeamMembers();
    teamMembers.value = members;
  } catch (error) {
    console.error('Error loading team members:', error);
    toaster.show({
      title: 'Error',
      message: 'Failed to load team members',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    loading.value = false;
  }
};

// Send invite
const sendInvite = async () => {
  if (!inviteForm.value.email || !inviteForm.value.role) {
    toaster.show({
      title: 'Missing information',
      message: 'Please provide an email and role',
      color: 'warning',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  inviteLoading.value = true;
  
  try {
    await inviteUser({
      email: inviteForm.value.email,
      role: inviteForm.value.role,
      message: inviteForm.value.message,
    });
    
    // Add to local list temporarily with pending status
    teamMembers.value.push({
      id: `pending-${Date.now()}`,
      email: inviteForm.value.email,
      name: null,
      avatar: null,
      role: inviteForm.value.role,
      status: 'pending',
      lastActive: null,
    });
    
    toaster.show({
      title: 'Invitation sent',
      message: `Invitation sent to ${inviteForm.value.email}`,
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
    
    // Reset form
    inviteForm.value = {
      email: '',
      role: 'editor',
      message: '',
    };
    
    showInviteForm.value = false;
  } catch (error) {
    console.error('Error sending invite:', error);
    toaster.show({
      title: 'Error',
      message: 'Failed to send invitation',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    inviteLoading.value = false;
  }
};

// Remove team member
const removeTeamMember = async (member) => {
  if (member.role === 'owner') {
    toaster.show({
      title: 'Cannot remove owner',
      message: 'The owner cannot be removed from the team',
      color: 'warning',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  if (!confirm(`Are you sure you want to remove ${member.name || member.email} from the team?`)) {
    return;
  }
  
  try {
    await removeUser(member.id);
    teamMembers.value = teamMembers.value.filter(m => m.id !== member.id);
    
    toaster.show({
      title: 'Team member removed',
      message: `${member.name || member.email} has been removed from the team`,
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    toaster.show({
      title: 'Error',
      message: 'Failed to remove team member',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  }
};

// Update user role
const updateRole = async (member, newRole) => {
  if (member.role === 'owner') {
    toaster.show({
      title: 'Cannot change owner role',
      message: 'The owner role cannot be changed',
      color: 'warning',
      icon: 'ph:warning-circle-duotone',
    });
    return;
  }
  
  try {
    await updateUserRole(member.id, newRole);
    
    // Update local state
    const index = teamMembers.value.findIndex(m => m.id === member.id);
    if (index !== -1) {
      teamMembers.value[index] = { ...teamMembers.value[index], role: newRole };
    }
    
    toaster.show({
      title: 'Role updated',
      message: `${member.name || member.email}'s role has been updated to ${newRole}`,
      color: 'success',
      icon: 'ph:check-circle-duotone',
    });
  } catch (error) {
    console.error('Error updating role:', error);
    toaster.show({
      title: 'Error',
      message: 'Failed to update user role',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  }
};

// Cancel invite
const cancelInviteForm = () => {
  showInviteForm.value = false;
  inviteForm.value = {
    email: '',
    role: 'editor',
    message: '',
  };
};

// Get role badge color
const getRoleBadgeColor = (role) => {
  switch(role) {
    case 'owner': return 'success';
    case 'admin': return 'primary';
    case 'editor': return 'info';
    case 'viewer': return 'warning';
    default: return 'muted';
  }
};

// Check if current user is owner
const isOwner = computed(() => {
  const currentUser = teamMembers.value.find(m => m.id === user.value?.id);
  return currentUser?.role === 'owner';
});

// Load team members on mount
onMounted(loadTeamMembers);

// Mock team members for demo purposes
const mockTeamMembers = [
  {
    id: 'user1',
    name: 'John Smith',
    email: 'john@example.com',
    avatar: 'https://avatars.githubusercontent.com/u/1234567?v=4',
    role: 'owner',
    status: 'active',
    lastActive: '2023-11-07T10:23:45',
  },
  {
    id: 'user2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    avatar: 'https://avatars.githubusercontent.com/u/2345678?v=4',
    role: 'admin',
    status: 'active',
    lastActive: '2023-11-06T15:30:10',
  },
  {
    id: 'user3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    avatar: null,
    role: 'editor',
    status: 'active',
    lastActive: '2023-11-05T09:15:22',
  },
  {
    id: 'invite1',
    name: null,
    email: 'sarah@example.com',
    avatar: null,
    role: 'viewer',
    status: 'pending',
    lastActive: null,
  },
];

// For demo, use mock data
teamMembers.value = mockTeamMembers;
loading.value = false;
</script>

<template>
  <div>
    <BasePageTitle title="Team Management" subtitle="Manage access to your projects and assets" />
    
    <!-- Team Actions -->
    <div class="flex justify-end mb-6">
      <BaseButton 
        color="primary" 
        :disabled="showInviteForm"
        @click="showInviteForm = true"
      >
        <Icon name="ph:user-plus-duotone" class="me-2" />
        Invite Team Member
      </BaseButton>
    </div>
    
    <!-- Invitation Form -->
    <BaseCard v-if="showInviteForm" class="mb-6 p-6">
      <BaseHeading size="sm" weight="medium" class="mb-4">Invite New Team Member</BaseHeading>
      
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            v-model="inviteForm.email"
            label="Email Address"
            placeholder="colleague@company.com"
            type="email"
            required
          />
          
          <BaseSelect
            v-model="inviteForm.role"
            label="Role"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </BaseSelect>
        </div>
        
        <div>
          <BaseTextarea
            v-model="inviteForm.message"
            label="Personal Message (optional)"
            placeholder="Include a personal message with this invitation..."
            :rows="3"
          />
        </div>
        
        <div>
          <BaseText size="sm" class="mb-2 text-muted-500">Role Description:</BaseText>
          <BaseMessage type="info">{{ roleDescriptions[inviteForm.role] }}</BaseMessage>
        </div>
        
        <div class="flex justify-end gap-2">
          <BaseButton color="default" @click="cancelInviteForm">
            Cancel
          </BaseButton>
          
          <BaseButton 
            color="primary"
            :loading="inviteLoading"
            :disabled="!inviteForm.email || !inviteForm.role"
            @click="sendInvite"
          >
            <Icon name="ph:paper-plane-right-duotone" class="me-2" />
            Send Invitation
          </BaseButton>
        </div>
      </div>
    </BaseCard>
    
    <BasePlaceholderPage
      v-if="loading"
      title="Loading team members"
      subtitle="Please wait while we load your team information"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <BaseCard v-else>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-muted-200 dark:border-muted-700">
              <th class="text-left py-4 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">User</th>
              <th class="text-left py-4 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Role</th>
              <th class="text-left py-4 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Status</th>
              <th class="text-left py-4 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Last Active</th>
              <th class="text-center py-4 px-4 text-[0.825rem] font-medium text-muted-800 dark:text-muted-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in teamMembers" :key="member.id" class="border-b border-muted-200 dark:border-muted-700">
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-full bg-muted-200 dark:bg-muted-700 overflow-hidden flex items-center justify-center">
                    <img v-if="member.avatar" :src="member.avatar" class="w-full h-full object-cover" :alt="member.name || 'User avatar'" />
                    <Icon v-else name="ph:user-duotone" class="size-5 text-muted-500" />
                  </div>
                  <div>
                    <div class="font-medium text-muted-900 dark:text-muted-100">{{ member.name || 'Invited User' }}</div>
                    <div class="text-xs text-muted-500">{{ member.email }}</div>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="min-w-[120px]">
                  <div v-if="member.role === 'owner' || member.id === user?.id">
                    <BaseTag :color="getRoleBadgeColor(member.role)" size="sm" :label="member.role" />
                  </div>
                  <BaseSelect
                    v-else
                    v-model="member.role"
                    size="sm"
                    class="w-full"
                    @change="updateRole(member, $event.target.value)"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </BaseSelect>
                </div>
              </td>
              <td class="py-3 px-4">
                <BaseTag
                  :color="member.status === 'active' ? 'success' : 'warning'"
                  size="sm"
                  :label="member.status === 'active' ? 'Active' : 'Pending'"
                />
              </td>
              <td class="py-3 px-4 text-muted-500">
                <span v-if="member.lastActive">
                  {{ new Date(member.lastActive).toLocaleDateString() }}
                </span>
                <span v-else>
                  Never
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center justify-center">
                  <!-- Prevent the owner from being removed or the current user removing themselves -->
                  <BaseButton 
                    v-if="member.role !== 'owner' && member.id !== user?.id"
                    size="xs"
                    color="danger"
                    @click="removeTeamMember(member)"
                  >
                    <Icon name="ph:trash-duotone" class="size-3.5" />
                    Remove
                  </BaseButton>
                  
                  <!-- Resend invite if pending -->
                  <BaseButton 
                    v-if="member.status === 'pending'"
                    size="xs"
                    color="default"
                    class="ms-2"
                  >
                    <Icon name="ph:envelope-duotone" class="size-3.5" />
                    Resend
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>
  </div>
</template>
