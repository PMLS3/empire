import { ref, computed } from 'vue';
import { useAuth } from '../../auth/composables/auth';
import { useToaster } from '../../shared/composables/toaster';
import type { Book } from '../types/book';
import type { BookAnalytics } from '../types/publishing-platform';

/**
 * Composable for managing book analytics and sales data
 */
export const useBookAnalytics = () => {
  const { user, currentWorkspace } = useAuth();
  const { show: showToast } = useToaster();
  
  // State
  const loading = ref(false);
  const error = ref<string | null>(null);
  const analyticsData = ref<BookAnalytics[]>([]);
  const salesSummary = ref<{
    total_sales: number;
    total_revenue: number;
    currency: string;
    period: string;
  } | null>(null);
  
  // Computed
  const workspaceId = computed(() => currentWorkspace.value?.id);
  
  /**
   * Fetch analytics data for a book
   */
  const fetchBookAnalytics = async (
    bookId: string, 
    platform: 'amazon_kdp' | 'ingramspark' | 'apple_books' | 'google_play_books' | 'aggregate' = 'aggregate',
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time' = 'monthly',
    startDate?: Date | string,
    endDate?: Date | string
  ) => {
    if (!workspaceId.value) return [];
    
    loading.value = true;
    error.value = null;
    
    try {
      let url = `/api/publishing/analytics?bookId=${bookId}&platform=${platform}&period=${period}`;
      
      if (startDate) {
        url += `&startDate=${typeof startDate === 'string' ? startDate : startDate.toISOString()}`;
      }
      
      if (endDate) {
        url += `&endDate=${typeof endDate === 'string' ? endDate : endDate.toISOString()}`;
      }
      
      const response = await useFetch(url);
      if (response.error.value) throw new Error(response.error.value.message);
      
      analyticsData.value = response.data.value as BookAnalytics[];
      
      // Calculate sales summary
      if (analyticsData.value.length > 0) {
        const totalSales = analyticsData.value.reduce((sum, data) => sum + data.sales.units, 0);
        const totalRevenue = analyticsData.value.reduce((sum, data) => sum + data.sales.revenue, 0);
        const currency = analyticsData.value[0].sales.currency;
        
        salesSummary.value = {
          total_sales: totalSales,
          total_revenue: totalRevenue,
          currency,
          period
        };
      }
      
      return analyticsData.value;
    } catch (err: any) {
      error.value = err.message;
      showToast({
        type: 'error',
        message: `Failed to fetch analytics data: ${err.message}`
      });
      return [];
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Get sales breakdown by format
   */
  const getSalesByFormat = () => {
    if (!analyticsData.value.length) return {};
    
    const formatSales: Record<string, number> = {
      ebook: 0,
      paperback: 0,
      hardcover: 0,
      audiobook: 0
    };
    
    analyticsData.value.forEach(data => {
      if (data.sales.by_format) {
        Object.entries(data.sales.by_format).forEach(([format, units]) => {
          formatSales[format] = (formatSales[format] || 0) + units;
        });
      }
    });
    
    return formatSales;
  };
  
  /**
   * Get sales breakdown by country
   */
  const getSalesByCountry = () => {
    if (!analyticsData.value.length) return {};
    
    const countrySales: Record<string, number> = {};
    
    analyticsData.value.forEach(data => {
      if (data.sales.by_country) {
        Object.entries(data.sales.by_country).forEach(([country, units]) => {
          countrySales[country] = (countrySales[country] || 0) + units;
        });
      }
    });
    
    return countrySales;
  };
  
  /**
   * Get royalty data
   */
  const getRoyaltyData = () => {
    if (!analyticsData.value.length) return {
      total: 0,
      currency: 'USD'
    };
    
    const totalRoyalties = analyticsData.value.reduce((sum, data) => sum + data.royalties.amount, 0);
    const currency = analyticsData.value[0].royalties.currency;
    
    return {
      total: totalRoyalties,
      currency
    };
  };
  
  /**
   * Get ranking data
   */
  const getRankingData = () => {
    if (!analyticsData.value.length) return {
      overall: null,
      categories: {}
    };
    
    // Find the most recent data point with ranking information
    const dataWithRanking = [...analyticsData.value]
      .sort((a, b) => {
        const dateA = a.end_date ? new Date(a.end_date).getTime() : 0;
        const dateB = b.end_date ? new Date(b.end_date).getTime() : 0;
        return dateB - dateA;
      })
      .find(data => data.ranking);
    
    if (!dataWithRanking || !dataWithRanking.ranking) {
      return {
        overall: null,
        categories: {}
      };
    }
    
    return {
      overall: dataWithRanking.ranking.overall,
      categories: dataWithRanking.ranking.category || {}
    };
  };
  
  /**
   * Get sales trend data for charts
   */
  const getSalesTrendData = () => {
    if (!analyticsData.value.length) return {
      labels: [],
      sales: [],
      revenue: []
    };
    
    // Sort data by date
    const sortedData = [...analyticsData.value].sort((a, b) => {
      const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
      const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
      return dateA - dateB;
    });
    
    const labels = sortedData.map(data => {
      if (data.start_date) {
        const date = new Date(data.start_date);
        return date.toLocaleDateString();
      }
      return '';
    });
    
    const sales = sortedData.map(data => data.sales.units);
    const revenue = sortedData.map(data => data.sales.revenue);
    
    return {
      labels,
      sales,
      revenue
    };
  };
  
  /**
   * Calculate marketing effectiveness
   */
  const calculateMarketingEffectiveness = (marketingStartDate: Date | string) => {
    if (!analyticsData.value.length) return {
      before: { avg_daily_sales: 0, avg_daily_revenue: 0 },
      after: { avg_daily_sales: 0, avg_daily_revenue: 0 },
      change_percentage: { sales: 0, revenue: 0 }
    };
    
    const startDateTimestamp = typeof marketingStartDate === 'string' 
      ? new Date(marketingStartDate).getTime() 
      : marketingStartDate.getTime();
    
    const beforeData = analyticsData.value.filter(data => {
      if (!data.end_date) return false;
      const endDateTimestamp = new Date(data.end_date).getTime();
      return endDateTimestamp < startDateTimestamp;
    });
    
    const afterData = analyticsData.value.filter(data => {
      if (!data.start_date) return false;
      const startDateTimestamp = new Date(data.start_date).getTime();
      return startDateTimestamp >= startDateTimestamp;
    });
    
    // Calculate before metrics
    const beforeTotalSales = beforeData.reduce((sum, data) => sum + data.sales.units, 0);
    const beforeTotalRevenue = beforeData.reduce((sum, data) => sum + data.sales.revenue, 0);
    const beforeDays = beforeData.length;
    
    // Calculate after metrics
    const afterTotalSales = afterData.reduce((sum, data) => sum + data.sales.units, 0);
    const afterTotalRevenue = afterData.reduce((sum, data) => sum + data.sales.revenue, 0);
    const afterDays = afterData.length;
    
    // Calculate averages
    const beforeAvgDailySales = beforeDays > 0 ? beforeTotalSales / beforeDays : 0;
    const beforeAvgDailyRevenue = beforeDays > 0 ? beforeTotalRevenue / beforeDays : 0;
    const afterAvgDailySales = afterDays > 0 ? afterTotalSales / afterDays : 0;
    const afterAvgDailyRevenue = afterDays > 0 ? afterTotalRevenue / afterDays : 0;
    
    // Calculate change percentage
    const salesChangePercentage = beforeAvgDailySales > 0 
      ? ((afterAvgDailySales - beforeAvgDailySales) / beforeAvgDailySales) * 100 
      : 0;
    const revenueChangePercentage = beforeAvgDailyRevenue > 0 
      ? ((afterAvgDailyRevenue - beforeAvgDailyRevenue) / beforeAvgDailyRevenue) * 100 
      : 0;
    
    return {
      before: {
        avg_daily_sales: beforeAvgDailySales,
        avg_daily_revenue: beforeAvgDailyRevenue
      },
      after: {
        avg_daily_sales: afterAvgDailySales,
        avg_daily_revenue: afterAvgDailyRevenue
      },
      change_percentage: {
        sales: salesChangePercentage,
        revenue: revenueChangePercentage
      }
    };
  };
  
  return {
    // State
    loading,
    error,
    analyticsData,
    salesSummary,
    
    // Methods
    fetchBookAnalytics,
    getSalesByFormat,
    getSalesByCountry,
    getRoyaltyData,
    getRankingData,
    getSalesTrendData,
    calculateMarketingEffectiveness
  };
};