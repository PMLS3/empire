<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCreatorData } from '../../composables/useCreatorData';
import { useToaster } from '../../../shared/composables/toaster';

const props = defineProps<{
  projectId: string;
}>();

const { getDataById } = useCreatorData();
const toaster = useToaster();

// UI state variables
const loading = ref(false);
const refreshing = ref(false);
const projectData = ref<any>(null);
const error = ref<string | null>(null);

// Analytics data
const analyticsData = ref<Record<string, any>>({});
const analyticsTimeframe = ref<string>('7days'); // 7days, 30days, 90days

// Platform-specific data
const platformAnalytics = ref<{
  youtube?: Record<string, any>;
  tiktok?: Record<string, any>;
  instagram?: Record<string, any>;
  facebook?: Record<string, any>;
}>({});

// Load project and analytics data
onMounted(async () => {
  await loadData();
});

// Load project data and analytics
const loadData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Load project data
    const data = await getDataById('projects', props.projectId);
    projectData.value = data;
    
    // Check if the project has been published
    const hasPublications = data?.publications && data.publications.length > 0;
    if (!hasPublications) {
      error.value = 'This video has not been published yet.';
      loading.value = false;
      return;
    }
    
    // Load analytics data for each platform
    await fetchAnalyticsData();
  } catch (err) {
    console.error('Error loading project data:', err);
    error.value = 'Failed to load project data';
    toaster.show({
      title: 'Error',
      message: 'Failed to load project data',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    loading.value = false;
  }
};

// Fetch analytics data from all connected platforms
const fetchAnalyticsData = async () => {
  refreshing.value = true;
  
  try {
    // Get published platforms
    const publishedPlatforms = new Set<string>();
    
    if (projectData.value?.publications) {
      projectData.value.publications.forEach(pub => {
        pub.platforms.forEach(platform => {
          publishedPlatforms.add(platform);
        });
      });
    }
    
    // Fetch data for each platform
    const platformPromises = Array.from(publishedPlatforms).map(async (platform) => {
      try {
        const response = await $fetch(`/api/social/analytics/${platform}`, {
          method: 'GET',
          params: {
            project_id: props.projectId,
            timeframe: analyticsTimeframe.value
          }
        });
        
        if (response?.data) {
          platformAnalytics.value[platform] = response.data;
        }
      } catch (err) {
        console.error(`Error fetching ${platform} analytics:`, err);
        // Don't fail the entire operation for one platform's error
      }
    });
    
    // Wait for all platform data to load
    await Promise.all(platformPromises);
    
    // Aggregate analytics across platforms
    aggregateAnalytics();
  } catch (err) {
    console.error('Error fetching analytics:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to fetch analytics data',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
    });
  } finally {
    refreshing.value = false;
  }
};

// Refresh analytics data
const refreshAnalytics = async () => {
  await fetchAnalyticsData();
  
  toaster.show({
    title: 'Success',
    message: 'Analytics data refreshed',
    color: 'success',
    icon: 'ph:check-circle-duotone',
  });
};

// Change timeframe and reload analytics
const changeTimeframe = async (timeframe: string) => {
  analyticsTimeframe.value = timeframe;
  await fetchAnalyticsData();
};

// Aggregate analytics from all platforms
const aggregateAnalytics = () => {
  // Reset aggregated data
  analyticsData.value = {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    watchTime: 0, // In minutes
    engagementRate: 0,
    viewsByDay: {},
    viewsByCountry: {},
    viewsByAge: {
      '13-17': 0,
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0,
    },
    viewsByGender: {
      male: 0,
      female: 0,
      other: 0,
    },
  };
  
  // Process each platform's data
  Object.entries(platformAnalytics.value).forEach(([platform, data]) => {
    // Metrics that can be summed directly
    analyticsData.value.views += data.views || 0;
    analyticsData.value.likes += data.likes || 0;
    analyticsData.value.comments += data.comments || 0;
    analyticsData.value.shares += data.shares || 0;
    analyticsData.value.watchTime += data.watchTime || 0;
    
    // Process views by day
    if (data.viewsByDay) {
      Object.entries(data.viewsByDay).forEach(([date, count]) => {
        analyticsData.value.viewsByDay[date] = (analyticsData.value.viewsByDay[date] || 0) + (count as number);
      });
    }
    
    // Process views by country
    if (data.viewsByCountry) {
      Object.entries(data.viewsByCountry).forEach(([country, count]) => {
        analyticsData.value.viewsByCountry[country] = (analyticsData.value.viewsByCountry[country] || 0) + (count as number);
      });
    }
    
    // Process demographic data if available
    if (data.viewsByAge) {
      Object.entries(data.viewsByAge).forEach(([ageGroup, count]) => {
        if (analyticsData.value.viewsByAge[ageGroup] !== undefined) {
          analyticsData.value.viewsByAge[ageGroup] += count as number;
        }
      });
    }
    
    if (data.viewsByGender) {
      Object.entries(data.viewsByGender).forEach(([gender, count]) => {
        if (analyticsData.value.viewsByGender[gender] !== undefined) {
          analyticsData.value.viewsByGender[gender] += count as number;
        }
      });
    }
  });
  
  // Calculate engagement rate (sum of likes, comments, shares, divided by views)
  const totalEngagements = analyticsData.value.likes + analyticsData.value.comments + analyticsData.value.shares;
  if (analyticsData.value.views > 0) {
    analyticsData.value.engagementRate = (totalEngagements / analyticsData.value.views) * 100;
  }
};

// Format large numbers with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

// Format decimal numbers
const formatDecimal = (num: number, places: number = 2): string => {
  return num.toFixed(places);
};

// Top countries for display
const topCountries = computed(() => {
  if (!analyticsData.value?.viewsByCountry) return [];
  
  return Object.entries(analyticsData.value.viewsByCountry)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([country, views]) => ({ country, views }));
});

// Generate chart data for views by day
const viewsByDayChartData = computed(() => {
  if (!analyticsData.value?.viewsByDay || Object.keys(analyticsData.value.viewsByDay).length === 0) {
    return {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: '#6366F1',
      }],
    };
  }
  
  // Sort dates in ascending order
  const sortedDates = Object.keys(analyticsData.value.viewsByDay).sort();
  
  return {
    labels: sortedDates.map(date => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }),
    datasets: [{
      data: sortedDates.map(date => analyticsData.value.viewsByDay[date]),
      backgroundColor: '#6366F1',
    }],
  };
});

// Generate chart data for audience age
const audienceAgeChartData = computed(() => {
  if (!analyticsData.value?.viewsByAge) {
    return {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
      }],
    };
  }
  
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316', '#EAB308'];
  
  return {
    labels: Object.keys(analyticsData.value.viewsByAge),
    datasets: [{
      data: Object.values(analyticsData.value.viewsByAge),
      backgroundColor: colors.slice(0, Object.keys(analyticsData.value.viewsByAge).length),
    }],
  };
});

// Generate chart data for audience gender
const audienceGenderChartData = computed(() => {
  if (!analyticsData.value?.viewsByGender) {
    return {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
      }],
    };
  }
  
  return {
    labels: Object.keys(analyticsData.value.viewsByGender).map(key => 
      key.charAt(0).toUpperCase() + key.slice(1)
    ),
    datasets: [{
      data: Object.values(analyticsData.value.viewsByGender),
      backgroundColor: ['#3B82F6', '#EC4899', '#8B5CF6'],
    }],
  };
});

// Check if we have data
const hasData = computed(() => {
  return Object.keys(platformAnalytics.value).length > 0;
});

// Generate mock data for demo purposes
const generateMockData = () => {
  platformAnalytics.value = {
    youtube: {
      views: 15248,
      likes: 1832,
      comments: 421,
      shares: 203,
      watchTime: 45762, // minutes
      viewsByDay: {
        '2023-06-01': 1254,
        '2023-06-02': 1588,
        '2023-06-03': 2341,
        '2023-06-04': 2045,
        '2023-06-05': 1875,
        '2023-06-06': 3254,
        '2023-06-07': 2891,
      },
      viewsByCountry: {
        'United States': 6423,
        'United Kingdom': 2154,
        'Canada': 1235,
        'Australia': 987,
        'Germany': 876,
        'France': 654,
        'India': 1532,
      },
      viewsByAge: {
        '13-17': 1254,
        '18-24': 4532,
        '25-34': 5467,
        '35-44': 2345,
        '45-54': 987,
        '55+': 663,
      },
      viewsByGender: {
        male: 8765,
        female: 6234,
        other: 249,
      },
    },
    tiktok: {
      views: 24587,
      likes: 5432,
      comments: 876,
      shares: 1234,
      watchTime: 12543, // minutes
      viewsByDay: {
        '2023-06-01': 2543,
        '2023-06-02': 3214,
        '2023-06-03': 4321,
        '2023-06-04': 5432,
        '2023-06-05': 4321,
        '2023-06-06': 3214,
        '2023-06-07': 1542,
      },
      viewsByCountry: {
        'United States': 8765,
        'United Kingdom': 3214,
        'Canada': 1542,
        'Australia': 876,
        'Brazil': 2345,
        'Japan': 1234,
        'South Korea': 2543,
      },
      viewsByAge: {
        '13-17': 4532,
        '18-24': 8765,
        '25-34': 6543,
        '35-44': 2345,
        '45-54': 1542,
        '55+': 860,
      },
      viewsByGender: {
        male: 10543,
        female: 13876,
        other: 168,
      },
    }
  };
  
  aggregateAnalytics();
};

// Generate mock data for demo purposes if running in development mode
if (process.dev) {
  onMounted(() => {
    setTimeout(() => {
      if (!hasData.value) {
        generateMockData();
      }
    }, 500);
  });
}
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap gap-3 items-center justify-between">
      <BaseHeading as="h3" size="md" weight="medium">
        Analytics Dashboard
      </BaseHeading>
      
      <div class="flex items-center gap-2">
        <!-- Timeframe selector -->
        <div class="flex rounded-lg overflow-hidden border border-muted-200 dark:border-muted-700">
          <button
            v-for="(label, value) in { '7days': '7 Days', '30days': '30 Days', '90days': '90 Days' }"
            :key="value"
            class="px-3 py-1 text-sm"
            :class="{
              'bg-primary-500 text-white': analyticsTimeframe === value,
              'bg-muted-100 dark:bg-muted-800 hover:bg-muted-200 dark:hover:bg-muted-700 text-muted-800 dark:text-muted-200': analyticsTimeframe !== value
            }"
            @click="changeTimeframe(value)"
          >
            {{ label }}
          </button>
        </div>
        
        <!-- Refresh button -->
        <BaseButton size="sm" color="default" @click="refreshAnalytics" :loading="refreshing">
          <Icon name="ph:arrows-clockwise-duotone" class="size-4" />
        </BaseButton>
      </div>
    </div>
    
    <BasePlaceholderPage
      v-if="loading"
      title="Loading analytics"
      subtitle="Please wait while we fetch your analytics data"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <BaseMessage v-else-if="error" type="danger" class="mb-4">
      {{ error }}
    </BaseMessage>
    
    <div v-else>
      <!-- Overview Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <BaseCard class="p-4">
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-8 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <Icon name="ph:eye-duotone" class="size-4 text-primary-500" />
              </div>
              <BaseText size="xs" class="text-muted-500">Total Views</BaseText>
            </div>
            <BaseHeading size="xl" weight="medium" class="mb-1">
              {{ formatNumber(analyticsData.views) }}
            </BaseHeading>
            <BaseText size="xs" class="text-success-500">
              <Icon name="ph:trend-up-duotone" class="size-3 me-1 inline" />
              +12.5% vs previous period
            </BaseText>
          </div>
        </BaseCard>
        
        <BaseCard class="p-4">
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-8 rounded-full bg-success-100 dark:bg-success-500/20 flex items-center justify-center">
                <Icon name="ph:clock-duotone" class="size-4 text-success-500" />
              </div>
              <BaseText size="xs" class="text-muted-500">Watch Time</BaseText>
            </div>
            <BaseHeading size="xl" weight="medium" class="mb-1">
              {{ formatNumber(Math.round(analyticsData.watchTime / 60)) }}
            </BaseHeading>
            <BaseText size="xs" class="text-muted-500">
              hours total watch time
            </BaseText>
          </div>
        </BaseCard>
        
        <BaseCard class="p-4">
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-8 rounded-full bg-info-100 dark:bg-info-500/20 flex items-center justify-center">
                <Icon name="ph:thumbs-up-duotone" class="size-4 text-info-500" />
              </div>
              <BaseText size="xs" class="text-muted-500">Likes</BaseText>
            </div>
            <BaseHeading size="xl" weight="medium" class="mb-1">
              {{ formatNumber(analyticsData.likes) }}
            </BaseHeading>
            <BaseText size="xs" class="text-info-500">
              <Icon name="ph:trend-up-duotone" class="size-3 me-1 inline" />
              +8.2% vs previous period
            </BaseText>
          </div>
        </BaseCard>
        
        <BaseCard class="p-4">
          <div class="flex flex-col">
            <div class="flex items-center gap-2 mb-2">
              <div class="size-8 rounded-full bg-warning-100 dark:bg-warning-500/20 flex items-center justify-center">
                <Icon name="ph:chart-line-duotone" class="size-4 text-warning-500" />
              </div>
              <BaseText size="xs" class="text-muted-500">Engagement Rate</BaseText>
            </div>
            <BaseHeading size="xl" weight="medium" class="mb-1">
              {{ formatDecimal(analyticsData.engagementRate) }}%
            </BaseHeading>
            <BaseText size="xs" class="text-warning-500">
              <Icon name="ph:trend-up-duotone" class="size-3 me-1 inline" />
              +3.4% vs previous period
            </BaseText>
          </div>
        </BaseCard>
      </div>
      
      <!-- Detailed Stats -->
      <div class="grid grid-cols-12 gap-6">
        <!-- Line chart for views over time -->
        <BaseCard class="p-4 col-span-12 lg:col-span-8">
          <BaseHeading size="sm" weight="medium" class="mb-4">Views Over Time</BaseHeading>
          <LineChart 
            v-if="viewsByDayChartData.labels.length > 0"
            :data="viewsByDayChartData"
            :options="{
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }"
            class="h-64"
          />
          <div v-else class="h-64 flex items-center justify-center">
            <BaseText class="text-muted-400">No data available for this timeframe</BaseText>
          </div>
        </BaseCard>
        
        <!-- Geographic distribution -->
        <BaseCard class="p-4 col-span-12 lg:col-span-4">
          <BaseHeading size="sm" weight="medium" class="mb-4">Top Countries</BaseHeading>
          
          <div class="space-y-4">
            <div v-if="topCountries.length === 0" class="h-64 flex items-center justify-center">
              <BaseText class="text-muted-400">No data available</BaseText>
            </div>
            
            <div v-for="(entry, i) in topCountries" :key="`country-${i}`" class="flex items-center gap-3">
              <div class="w-4 font-mono text-xs text-muted-400">{{ i + 1 }}</div>
              <div class="flex-grow">
                <BaseText size="sm" weight="medium">{{ entry.country }}</BaseText>
              </div>
              <div>
                <BaseText size="sm">{{ formatNumber(entry.views) }}</BaseText>
              </div>
            </div>
          </div>
        </BaseCard>
        
        <!-- Demographics -->
        <BaseCard class="p-4 col-span-12 lg:col-span-6">
          <BaseHeading size="sm" weight="medium" class="mb-4">Audience Age</BaseHeading>
          
          <div class="h-64 flex items-center justify-center">
            <DoughnutChart 
              v-if="Object.values(analyticsData.viewsByAge || {}).some(val => val > 0)"
              :data="audienceAgeChartData"
              :options="{
                plugins: {
                  legend: { position: 'right' }
                }
              }"
            />
            <BaseText v-else class="text-muted-400">No age data available</BaseText>
          </div>
        </BaseCard>
        
        <BaseCard class="p-4 col-span-12 lg:col-span-6">
          <BaseHeading size="sm" weight="medium" class="mb-4">Audience Gender</BaseHeading>
          
          <div class="h-64 flex items-center justify-center">
            <DoughnutChart 
              v-if="Object.values(analyticsData.viewsByGender || {}).some(val => val > 0)"
              :data="audienceGenderChartData"
              :options="{
                plugins: {
                  legend: { position: 'right' }
                }
              }"
            />
            <BaseText v-else class="text-muted-400">No gender data available</BaseText>
          </div>
        </BaseCard>
        
        <!-- Platform breakdown -->
        <BaseCard class="p-4 col-span-12">
          <BaseHeading size="sm" weight="medium" class="mb-4">Platform Performance</BaseHeading>
          
          <div class="overflow-x-auto">
            <table class="w-full table-auto">
              <thead>
                <tr class="border-b border-muted-200 dark:border-muted-700">
                  <th class="text-left py-2 px-2">Platform</th>
                  <th class="text-left py-2 px-2">Views</th>
                  <th class="text-left py-2 px-2">Likes</th>
                  <th class="text-left py-2 px-2">Comments</th>
                  <th class="text-left py-2 px-2">Shares</th>
                  <th class="text-left py-2 px-2">Engagement Rate</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="Object.keys(platformAnalytics).length > 0">
                  <tr v-for="(data, platform) in platformAnalytics" :key="platform" class="border-b border-muted-200 dark:border-muted-700">
                    <td class="py-2 px-2">
                      <div class="flex items-center gap-2">
                        <Icon :name="platform === 'youtube' ? 'logos:youtube-icon' :
                             platform === 'tiktok' ? 'logos:tiktok-icon' :
                             platform === 'instagram' ? 'mdi:instagram' :
                             'mdi:facebook'" class="size-5" />
                        <span class="capitalize">{{ platform }}</span>
                      </div>
                    </td>
                    <td class="py-2 px-2">{{ formatNumber(data.views) }}</td>
                    <td class="py-2 px-2">{{ formatNumber(data.likes) }}</td>
                    <td class="py-2 px-2">{{ formatNumber(data.comments) }}</td>
                    <td class="py-2 px-2">{{ formatNumber(data.shares) }}</td>
                    <td class="py-2 px-2">
                      {{ formatDecimal((data.likes + data.comments + data.shares) / data.views * 100) }}%
                    </td>
                  </tr>
                </template>
                <tr v-else>
                  <td colspan="6" class="py-4 text-center text-muted-400">
                    No platform data available
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
