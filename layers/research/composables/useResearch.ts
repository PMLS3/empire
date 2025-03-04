import { ref, computed } from 'vue';
import type { CategoryResearch } from '../types/research';

export const useResearch = () => {
  const { isAuthenticated, getCurrentWorkspaceId } = useAuth();
  const toaster = useToaster();
  
  const researchProjects = ref<CategoryResearch[]>([]);
  const currentResearch = ref<CategoryResearch | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Filters
  const filters = ref({
    category: null,
    status: null,
    scope: 'all', // 'all', 'owned', 'shared'
  });
  
  // Stats
  const stats = computed(() => {
    return {
      total: researchProjects.value.length,
      inProgress: researchProjects.value.filter(p => p.status === 'in_progress').length,
      completed: researchProjects.value.filter(p => p.status === 'completed').length,
      sharedWithMe: researchProjects.value.filter(p => p.owner_id !== getCurrentWorkspaceId.value).length,
    };
  });
  
  // Fetch all research projects
  const fetchResearchProjects = async () => {
    if (!isAuthenticated.value) return;
    
    loading.value = true;
    error.value = null;
    
    try {
      // Build query params
      const queryParams = new URLSearchParams();
      if (filters.value.category) queryParams.append('main_category', filters.value.category);
      if (filters.value.status) queryParams.append('status', filters.value.status);
      if (filters.value.scope !== 'all') queryParams.append('scope', filters.value.scope);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await $fetch(`/api/research${queryString}`);
      researchProjects.value = response as CategoryResearch[];
    } catch (err) {
      console.error('Error fetching research projects:', err);
      error.value = err.message || 'Failed to load research projects';
      toaster.show({
        title: 'Error',
        message: error.value,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
    } finally {
      loading.value = false;
    }
  };
  
  // Get a single research project by ID
  const getResearchById = async (id: string) => {
    if (!isAuthenticated.value || !id) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch(`/api/research/${id}`);
      currentResearch.value = response as CategoryResearch;
      return currentResearch.value;
    } catch (err) {
      console.error(`Error fetching research project ${id}:`, err);
      error.value = err.message || 'Failed to load research project';
      toaster.show({
        title: 'Error',
        message: error.value,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  // Create a new research project
  const createResearch = async (data: Partial<CategoryResearch>) => {
    if (!isAuthenticated.value) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch('/api/research', {
        method: 'POST',
        body: data,
      });
      
      toaster.show({
        title: 'Success',
        message: 'Research project created successfully!',
        color: 'success',
        icon: 'ph:check-circle-duotone',
        closable: true,
      });
      
      return response as CategoryResearch;
    } catch (err) {
      console.error('Error creating research project:', err);
      error.value = err.message || 'Failed to create research project';
      toaster.show({
        title: 'Error',
        message: error.value,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  // Update an existing research project
  const updateResearch = async (id: string, data: Partial<CategoryResearch>) => {
    if (!isAuthenticated.value || !id) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch(`/api/research/${id}`, {
        method: 'PUT',
        body: data,
      });
      
      // Update current research if it's the one being edited
      if (currentResearch.value?.id === id) {
        currentResearch.value = response as CategoryResearch;
      }
      
      toaster.show({
        title: 'Success',
        message: 'Research project updated successfully!',
        color: 'success',
        icon: 'ph:check-circle-duotone',
        closable: true,
      });
      
      return response as CategoryResearch;
    } catch (err) {
      console.error(`Error updating research project ${id}:`, err);
      error.value = err.message || 'Failed to update research project';
      toaster.show({
        title: 'Error',
        message: error.value,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  // Delete a research project
  const deleteResearch = async (id: string) => {
    if (!isAuthenticated.value || !id) return false;
    
    loading.value = true;
    error.value = null;
    
    try {
      await $fetch(`/api/research/${id}`, {
        method: 'DELETE',
      });
      
      // Remove from list if it's in there
      researchProjects.value = researchProjects.value.filter(p => p.id !== id);
      
      // Clear current research if it's the one being deleted
      if (currentResearch.value?.id === id) {
        currentResearch.value = null;
      }
      
      toaster.show({
        title: 'Success',
        message: 'Research project deleted successfully!',
        color: 'success',
        icon: 'ph:check-circle-duotone',
        closable: true,
      });
      
      return true;
    } catch (err) {
      console.error(`Error deleting research project ${id}:`, err);
      error.value = err.message || 'Failed to delete research project';
      toaster.show({
        title: 'Error',
        message: error.value,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  // Invite a collaborator to a research project
  const inviteCollaborator = async (researchId: string, email: string, role: 'editor' | 'viewer') => {
    if (!isAuthenticated.value || !researchId) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch(`/api/research/${researchId}/collaborators`, {
        method: 'POST',
        body: { email, role },
      });
      
      toaster.show({
        title: 'Success',
        message: `Invitation sent to ${email}!`,
        color: 'success',
        icon: 'ph:check-circle-duotone',
        closable: true,
      });
      
      return response;
    } catch (err) {
      console.error(`Error inviting collaborator to research ${researchId}:`, err);
      error.value = err.message || 'Failed to invite collaborator';
      toaster.show({
        title: 'Error',
        message: error.value,
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  // Watch for authentication state changes to fetch projects when logged in
  watch(
    isAuthenticated,
    (newVal) => {
      if (newVal) {
        fetchResearchProjects();
      } else {
        researchProjects.value = [];
        currentResearch.value = null;
      }
    },
    { immediate: true }
  );
  
  // Watch for filter changes
  watch(
    filters,
    () => {
      fetchResearchProjects();
    },
    { deep: true }
  );
  
  return {
    researchProjects,
    currentResearch,
    loading,
    error,
    filters,
    stats,
    fetchResearchProjects,
    getResearchById,
    createResearch,
    updateResearch,
    deleteResearch,
    inviteCollaborator,
  };
};
