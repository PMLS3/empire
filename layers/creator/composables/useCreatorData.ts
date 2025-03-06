import { ref, computed } from 'vue';
import { useAuth } from '../../auth/composables/auth';
import { useToaster } from '../../shared/composables/toaster';

export const useCreatorData = () => {
  const { isAuthenticated } = useAuth();
  const toaster = useToaster();

  const dataList = ref<any[]>([]); // Generic data list
  const currentData = ref<any | null>(null); // Currently selected data item

  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch all items from a collection
  const fetchData = async (collectionName: string, filters: any = {}) => {
    if (!isAuthenticated.value) return;

    loading.value = true;
    error.value = null;

    try {
      const response: any = await $fetch(`/api/data/read`, {
        method: 'POST',
        body: {
          collection: collectionName,
          readType: 'query',
          filters: filters,
        },
      });

      if (response.status === 404) {
        dataList.value = [];
      } else {
        dataList.value = response.data as any[];
      }
    } catch (err: any) {
      console.error(`Error fetching ${collectionName}:`, err);
      error.value = err.message || `Failed to load ${collectionName}`;
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

  // Get a single item by ID from a collection
  const getDataById = async (collectionName: string, id: string) => {
    if (!isAuthenticated.value || !id) return null;

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch(`/api/data/read`, {
        method: 'POST',
        body: {
          collection: collectionName,
          readType: 'id',
          id: id,
        },
      });
      currentData.value = response as any;
      return currentData.value;
    } catch (err: any) {
      console.error(`Error fetching ${collectionName} ${id}:`, err);
      error.value = err.message || `Failed to load ${collectionName} ${id}`;
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

  // Create a new item in a collection
  const createData = async (collectionName: string, data: any, col_vec?: string[]) => {
    if (!isAuthenticated.value) return null;

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch('/api/data/write', {
        method: 'POST',
        body: { collection: collectionName, ...data, col_vec: col_vec },
      });

      toaster.show({
        title: 'Success',
        message: `${collectionName} created successfully!`,
        color: 'success',
        icon: 'ph:check-circle-duotone',
        closable: true,
      });

      return response as any;
    } catch (err: any) {
      console.error(`Error creating ${collectionName}:`, err);
      error.value = err.message || `Failed to create ${collectionName}`;
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

  // Update an existing item in a collection
  const updateData = async (collectionName: string, id: string, data: any) => {
    if (!isAuthenticated.value || !id) return null;

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch(`/api/data/update`, {
        method: 'POST',
        body: { id: id, ...data, collection: collectionName }
      });

      // Update current data if it's the one being edited
      if (currentData.value?.id === id) {
        currentData.value = response as any;
      }

      toaster.show({
        title: 'Success',
        message: `${collectionName} updated successfully!`,
        color: 'success',
        icon: 'ph:check-circle-duotone',
        closable: true,
      });

      return response as any;
    } catch (err: any) {
      console.error(`Error updating ${collectionName} ${id}:`, err);
      error.value = err.message || `Failed to update ${collectionName}`;
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

  // Delete an item from a collection
  const deleteData = async (collectionName: string, id: string) => {
    if (!isAuthenticated.value || !id) return false;

    loading.value = true;
    error.value = null;

    try {
      await $fetch(`/api/data/delete`, {
        method: 'POST',
        body: { id, collection: collectionName },
      });

      // Remove from list if it's in there
      dataList.value = dataList.value.filter(item => item.id !== id);

      // Clear current data if it's the one being deleted
      if (currentData.value?.id === id) {
        currentData.value = null;
      }

      toaster.show({
        title: 'Success',
        message: `${collectionName} deleted successfully!`,
        color: 'success',
        icon: 'ph:check-circle-duotone',
        closable: true,
      });

      return true;
    } catch (err: any) {
      console.error(`Error deleting ${collectionName} ${id}:`, err);
      error.value = err.message || `Failed to delete ${collectionName}`;
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

  /**
   * Query data with filters and optional vector search
   */
  const queryData = async (
    collection: string, 
    {
      filters = {},
      limit = 20,
      orderBy = null,
      orderDirection = 'desc',
      startAfter = null,
      vectorQuery = null,
      vectorField = null,
      vectorDimensions = 768,
      vectorDistance = 0.5
    } = {}
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const queryParams = {
        collection,
        filters,
        limit,
        orderBy,
        orderDirection,
        startAfter,
      };

      // Add vector search parameters if provided
      if (vectorQuery) {
        queryParams['vec'] = {
          query: vectorQuery,
          field: vectorField || 'embedding',
          dimensions: vectorDimensions,
          distance: vectorDistance
        };
      }

      const response = await $fetch('/api/data/read', {
        method: 'POST',
        body: queryParams,
      });

      loading.value = false;
      return response;
    } catch (err) {
      console.error(`Error querying ${collection}:`, err);
      error.value = `Failed to query ${collection}`;
      loading.value = false;
      throw err;
    }
  };

  /**
   * Search for content using vector search
   */
  const searchByVector = async (
    collection: string,
    searchQuery: string,
    {
      filters = {},
      limit = 20,
      vectorField = 'embedding',
      vectorDimensions = 768,
      vectorDistance = 0.5
    } = {}
  ) => {
    if (!searchQuery.trim()) {
      return [];
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch('/api/data/read', {
        method: 'POST',
        body: {
          collection,
          filters,
          limit,
          vec: {
            query: searchQuery,
            field: vectorField,
            dimensions: vectorDimensions,
            distance: vectorDistance,
          },
        },
      });

      loading.value = false;
      return response;
    } catch (err) {
      console.error(`Error searching ${collection}:`, err);
      error.value = `Failed to search ${collection}`;
      loading.value = false;
      throw err;
    }
  };

  return {
    dataList,
    currentData,
    loading,
    error,
    fetchData,
    getDataById,
    createData,
    updateData,
    deleteData,
    queryData,
    searchByVector,
  };
};
