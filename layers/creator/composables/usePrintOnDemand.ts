import { ref, computed } from 'vue';
import { useAuth } from '../../auth/composables/auth';
import { useToaster } from '../../shared/composables/toaster';
import type { Book } from '../types/book';
import type { PrintOnDemandOrder } from '../types/publishing-platform';

/**
 * Composable for managing print-on-demand services
 */
export const usePrintOnDemand = () => {
  const { user, currentWorkspace } = useAuth();
  const { show: showToast } = useToaster();
  
  // State
  const loading = ref(false);
  const error = ref<string | null>(null);
  const orders = ref<PrintOnDemandOrder[]>([]);
  const currentOrder = ref<PrintOnDemandOrder | null>(null);
  
  // Computed
  const workspaceId = computed(() => currentWorkspace.value?.id);
  
  /**
   * Fetch all orders for the current workspace
   */
  const fetchOrders = async (bookId?: string) => {
    if (!workspaceId.value) return [];
    
    loading.value = true;
    error.value = null;
    
    try {
      const url = bookId 
        ? `/api/publishing/print-on-demand/orders?workspaceId=${workspaceId.value}&bookId=${bookId}`
        : `/api/publishing/print-on-demand/orders?workspaceId=${workspaceId.value}`;
      
      const response = await useFetch(url);
      if (response.error.value) throw new Error(response.error.value.message);
      orders.value = response.data.value as PrintOnDemandOrder[];
      return orders.value;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to fetch orders: ${err.message}`
      });
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Get an order by ID
   */
  const getOrderById = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/print-on-demand/orders/${id}`);
      if (response.error.value) throw new Error(response.error.value.message);
      currentOrder.value = response.data.value as PrintOnDemandOrder;
      return currentOrder.value;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to fetch order: ${err.message}`
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Create a new print-on-demand order
   */
  const createOrder = async (orderData: Partial<PrintOnDemandOrder>) => {
    if (!workspaceId.value) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch('/api/publishing/print-on-demand/orders', {
        method: 'POST',
        body: {
          ...orderData,
          workspace_id: workspaceId.value,
          status: 'draft',
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      // Refresh orders list
      await fetchOrders(orderData.book_id);
      
      showToast({
        type: 'success',
        message: 'Order created successfully'
      });
      
      return response.data.value as PrintOnDemandOrder;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to create order: ${err.message}`
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Update an existing order
   */
  const updateOrder = async (id: string, orderData: Partial<PrintOnDemandOrder>) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/print-on-demand/orders/${id}`, {
        method: 'PUT',
        body: {
          ...orderData,
          updated_at: new Date()
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      // Update current order if it's the one being edited
      if (currentOrder.value?.id === id) {
        currentOrder.value = { ...currentOrder.value, ...orderData };
      }
      
      // Refresh orders list
      await fetchOrders(currentOrder.value?.book_id);
      
      showToast({
        type: 'success',
        message: 'Order updated successfully'
      });
      
      return response.data.value as PrintOnDemandOrder;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to update order: ${err.message}`
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Delete an order
   */
  const deleteOrder = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/print-on-demand/orders/${id}`, {
        method: 'DELETE'
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      // Clear current order if it's the one being deleted
      const bookId = currentOrder.value?.book_id;
      if (currentOrder.value?.id === id) {
        currentOrder.value = null;
      }
      
      // Refresh orders list
      await fetchOrders(bookId);
      
      showToast({
        type: 'success',
        message: 'Order deleted successfully'
      });
      
      return true;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to delete order: ${err.message}`
      });
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Submit an order to the print-on-demand service
   */
  const submitOrder = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/print-on-demand/orders/${id}/submit`, {
        method: 'POST'
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      // Update current order if it's the one being submitted
      if (currentOrder.value?.id === id) {
        currentOrder.value = {
          ...currentOrder.value,
          status: 'submitted',
          updated_at: new Date()
        };
      }
      
      // Refresh orders list
      await fetchOrders(currentOrder.value?.book_id);
      
      showToast({
        type: 'success',
        message: 'Order submitted successfully'
      });
      
      return true;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to submit order: ${err.message}`
      });
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Calculate pricing for a print-on-demand order
   */
  const calculateOrderPricing = async (bookId: string, quantity: number, format: 'paperback' | 'hardcover', service: 'amazon_kdp' | 'ingramspark' | 'other') => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch('/api/publishing/print-on-demand/calculate-price', {
        method: 'POST',
        body: {
          book_id: bookId,
          quantity,
          format,
          service,
          workspace_id: workspaceId.value
        }
      });
      
      if (response.error.value) throw new Error(response.error.value.message);
      
      return response.data.value as {
        unit_cost: number;
        total_cost: number;
        shipping_cost: number;
        currency: string;
        estimated_delivery_days: number;
      };
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to calculate pricing: ${err.message}`
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Track an order's status
   */
  const trackOrder = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch(`/api/publishing/print-on-demand/orders/${id}/track`);
      if (response.error.value) throw new Error(response.error.value.message);
      
      const trackingInfo = response.data.value as {
        status: string;
        tracking_number?: string;
        tracking_url?: string;
        estimated_delivery_date?: string;
        current_location?: string;
        status_history: Array<{ status: string; date: string; location?: string }>;
      };
      
      // Update current order if it's the one being tracked
      if (currentOrder.value?.id === id) {
        currentOrder.value = {
          ...currentOrder.value,
          status: trackingInfo.status as any,
          tracking_number: trackingInfo.tracking_number,
          tracking_url: trackingInfo.tracking_url,
          estimated_delivery_date: trackingInfo.estimated_delivery_date,
          updated_at: new Date()
        };
      }
      
      return trackingInfo;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to track order: ${err.message}`
      });
      return null;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Get available print-on-demand services
   */
  const getAvailableServices = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await useFetch('/api/publishing/print-on-demand/services');
      if (response.error.value) throw new Error(response.error.value.message);
      
      return response.data.value as Array<{
        id: string;
        name: string;
        description: string;
        formats: string[];
        pricing_tiers: Array<{
          min_quantity: number;
          max_quantity: number;
          unit_price: number;
          currency: string;
        }>;
        shipping_options: Array<{
          method: string;
          estimated_days: number;
          cost: number;
          currency: string;
        }>;
      }>;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to get available services: ${err.message}`
      });
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Create a bulk order for multiple copies
   */
  const createBulkOrder = async (bookId: string, quantity: number, format: 'paperback' | 'hardcover', service: 'amazon_kdp' | 'ingramspark' | 'other', shippingAddress: any) => {
    // This is a convenience method that calls createOrder with bulk order settings
    const pricing = await calculateOrderPricing(bookId, quantity, format, service);
    
    if (!pricing) return null;
    
    const orderData: Partial<PrintOnDemandOrder> = {
      book_id: bookId,
      service,
      quantity,
      format,
      unit_cost: pricing.unit_cost,
      total_cost: pricing.total_cost,
      currency: pricing.currency,
      shipping_address: shippingAddress,
      shipping_method: 'standard',
      shipping_cost: pricing.shipping_cost,
      status: 'draft'
    };
    
    return createOrder(orderData);
  };
  
  return {
    // State
    loading,
    error,
    orders,
    currentOrder,
    
    // Order operations
    fetchOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    submitOrder,
    calculateOrderPricing,
    trackOrder,
    getAvailableServices,
    createBulkOrder
  };
};