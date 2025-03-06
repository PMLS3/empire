<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useCreatorData } from '../composables/useCreatorData';

const { getDataList } = useCreatorData();

const projects = ref([]);
const selectedProject = ref<string | null>(null);
const timeframe = ref('7days');
const analyticsData = ref<Record<string, any>>({});
const loading = ref(true);

// Load projects and analytics data
onMounted(async () => {
  try {
    const projectList = await getDataList('projects', {
      orderBy: 'updated_at',
      orderDirection: 'desc',
    });
    
    projects.value = projectList.filter(project => project.status === 'completed' || project.publications?.length > 0);
    
    // Select first project by default
    if (projects.value.length > 0) {
      selectedProject.value = projects.value[0].id;
      await loadAnalyticsData();
    } else {
      loading.value = false;
    }
  } catch (error) {
    console.error('Error loading projects:', error);
    loading.value = false;
  }
});

// Load analytics data for selected project and timeframe
const loadAnalyticsData = async () => {
  if (!selectedProject.value) return;
  
  loading.value = true;
  
  try {
    const data = await getDataList('analytics', {
      filters: {
        project_id: selectedProject.value,
        timeframe: timeframe.value
      }
    });
    
    if (data && data.length > 0) {
      analyticsData.value = data[0];
    } else {
      // Generate mock data for demo purposes
      analyticsData.value = generateMockAnalytics();
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
  } finally {
    loading.value = false;
  }
};

// Watch for changes to selected project or timeframe
watch([selectedProject, timeframe], async () => {
  await loadAnalyticsData();
});

// Generate mock analytics data for demonstration
const generateMockAnalytics = () => {
  const now = new Date();
  const dates = [];
  const viewsData = [];
  const engagementData = [];
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
    viewsData.push(Math.floor(Math.random() * 1000) + 100);
    engagementData.push(Math.floor(Math.random() * 100) + 10);
  }
  
  return {
    project_id: selectedProject.value,
    timeframe: timeframe.value,
    total_views: viewsData.reduce((sum, val) => sum + val, 0),
    total_engagement: engagementData.reduce((sum, val) => sum + val, 0),
    average_watch_time: Math.floor(Math.random() * 300) + 60,
    completion_rate: Math.floor(Math.random() * 30) + 40,
    dates,
    views_by_date: Object.fromEntries(dates.map((date, i) => [date, viewsData[i]])),
    engagement_by_date: Object.fromEntries(dates.map((date, i) => [date, engagementData[i]])),
    demographics: {
      age: {
        '18-24': Math.floor(Math.random() * 30) + 10,
        '25-34': Math.floor(Math.random() * 30) + 20,
        '35-44': Math.floor(Math.random() * 20) + 5,
        '45-54': Math.floor(Math.random() * 15) + 5,
        '55+': Math.floor(Math.random() * 10) + 5
      },
      gender: {
        'male': Math.floor(Math.random() * 50) + 30,
        'female': Math.floor(Math.random() * 50) + 20,
        'other': Math.floor(Math.random() * 10)
      },
      countries: {
        'United States': Math.floor(Math.random() * 1000) + 500,
        'United Kingdom': Math.floor(Math.random() * 500) + 200,
        'Germany': Math.floor(Math.random() * 300) + 100,
        'France': Math.floor(Math.random() * 200) + 100,
        'Canada': Math.floor(Math.random() * 200) + 50,
        'Australia': Math.floor(Math.random() * 150) + 50,
        'India': Math.floor(Math.random() * 300) + 100,
        'Japan': Math.floor(Math.random() * 200) + 50
      }
    },
    platforms: {
      'YouTube': Math.floor(Math.random() * 1500) + 500,
      'TikTok': Math.floor(Math.random() * 1000) + 300,
      'Instagram': Math.floor(Math.random() * 800) + 200,
      'Facebook': Math.floor(Math.random() * 500) + 100
    }
  };
};

// Format number with commas
const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0';
};

// Prepare data for charts
const viewsChartData = computed(() => {
  if (!analyticsData.value?.dates || !analyticsData.value?.views_by_date) {
    return { labels: [], datasets: [] };
  }
  
  return {
    labels: analyticsData.value.dates,
    datasets: [
      {
        label: 'Views',
        data: analyticsData.value.dates.map(date => analyticsData.value.views_by_date[date] || 0),
        backgroundColor: '#6366F1',
        borderColor: '#6366F1',
        borderWidth: 2,
        tension: 0.4,
        fill: false
      }
    ]
  };
});

// Age chart data
const ageChartData = computed(() => {
  if (!analyticsData.value?.demographics?.age) {
    return { labels: [], datasets: [] };
  }
  
  const { age } = analyticsData.value.demographics;
  
  return {
    labels: Object.keys(age),
    datasets: [
      {
        data: Object.values(age),
        backgroundColor: ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316']
      }
    ]
  };
});

// Platform chart data
const platformChartData = computed(() => {
  if (!analyticsData.value?.platforms) {
    return { labels: [], datasets: [] };
  }
  
  return {
    labels: Object.keys(analyticsData.value.platforms),
    datasets: [
      {
        data: Object.values(analyticsData.value.platforms),
        backgroundColor: ['#EF4444', '#3B82F6', '#EC4899', '#10B981']
      }
    ]
  };
});

// Get current project name
const currentProjectName = computed(() => {
  if (!selectedProject.value) return '';
  const project = projects.value.find(p => p.id === selectedProject.value);
  return project?.title || '';
});
</script>

<template>
  <div>
    <BasePageTitle title="Analytics" subtitle="Track performance metrics for your videos" />
    
    <BasePlaceholderPage
      v-if="loading && projects.length === 0"
      title="Loading analytics"
      subtitle="Please wait while we gather your data"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <div v-else-if="projects.length === 0" class="py-12 text-center">
      <div class="mb-4">
        <Icon name="ph:chart-bar-duotone" class="size-12 mx-auto text-muted-400" />
      </div>
      <BaseHeading size="lg" weight="medium" class="mb-2">No Projects Available</BaseHeading>
      <BaseText>Complete and publish a project to view analytics</BaseText>
      <div class="mt-6">
        <NuxtLink to="/creator/projects/new" class="inline-block">
          <BaseButton color="primary">
            <Icon name="ph:plus-circle-duotone" class="me-2" />
            Create New Project
          </BaseButton>
        </NuxtLink>
      </div>
    </div>
    
    <template v-else>
      <!-- Filters -->
      <div class="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div class="w-full md:w-auto">
          <BaseSelect v-model="selectedProject" label="Select Project" class="w-full md:w-64">
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.title }}
            </option>
          </BaseSelect>
        </div>
        
        <div class="flex rounded-lg overflow-hidden border border-muted-200 dark:border-muted-700">
          <button
            v-for="(label, value) in { '7days': 'Last 7 Days', '30days': 'Last 30 Days', '90days': 'Last 90 Days', 'all': 'All Time' }"
            :key="value"
            class="px-3 py-1.5 text-sm"
            :class="{
              'bg-primary-500 text-white': timeframe === value,
              'bg-muted-100 dark:bg-muted-800 hover:bg-muted-200 dark:hover:bg-muted-700 text-muted-800 dark:text-muted-200': timeframe !== value
            }"
            @click="timeframe = value"
          >
            {{ label }}
          </button>
        </div>
      </div>
      
      <div v-if="loading" class="py-12 flex items-center justify-center">
        <div class="animate-spin size-12 rounded-full border-4 border-muted-200 dark:border-muted-700 border-t-primary-500"></div>
      </div>
      
      <template v-else>
        <!-- Overview Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <BaseCard class="p-4">
            <div class="flex flex-col">
              <BaseText size="xs" class="text-muted-500 mb-1">Total Views</BaseText>
              <BaseHeading size="xl" weight="medium">{{ formatNumber(analyticsData.total_views) }}</BaseHeading>
              <BaseText size="xs" class="text-success-500 mt-1">
                <Icon name="ph:trend-up-duotone" class="size-3 me-1 inline" />
                +12.5% vs previous period
              </BaseText>
            </div>
          </BaseCard>
          
          <BaseCard class="p-4">
            <div class="flex flex-col">
              <BaseText size="xs" class="text-muted-500 mb-1">Engagement</BaseText>
              <BaseHeading size="xl" weight="medium">{{ formatNumber(analyticsData.total_engagement) }}</BaseHeading>
              <BaseText size="xs" class="text-success-500 mt-1">
                <Icon name="ph:trend-up-duotone" class="size-3 me-1 inline" />
                +8.3% vs previous period
              </BaseText>
            </div>
          </BaseCard>
          
          <BaseCard class="p-4">
            <div class="flex flex-col">
              <BaseText size="xs" class="text-muted-500 mb-1">Avg Watch Time</BaseText>
              <BaseHeading size="xl" weight="medium">{{ Math.floor(analyticsData.average_watch_time / 60) }}:{{ (analyticsData.average_watch_time % 60).toString().padStart(2, '0') }}</BaseHeading>
              <BaseText size="xs" class="text-muted-500 mt-1">
                minutes per view
              </BaseText>
            </div>
          </BaseCard>
          
          <BaseCard class="p-4">
            <div class="flex flex-col">
              <BaseText size="xs" class="text-muted-500 mb-1">Completion Rate</BaseText>
              <BaseHeading size="xl" weight="medium">{{ analyticsData.completion_rate }}%</BaseHeading>
              <BaseText size="xs" class="text-warning-500 mt-1">
                <Icon name="ph:trend-down-duotone" class="size-3 me-1 inline" />
                -2.1% vs previous period
              </BaseText>
            </div>
          </BaseCard>
        </div>
        
        <!-- Charts and Graphs -->
        <div class="grid grid-cols-12 gap-6">
          <!-- Views over time -->
          <BaseCard class="col-span-12 p-6">
            <BaseHeading size="sm" weight="medium" class="mb-4">Views over Time</BaseHeading>
            <LineChart 
              :data="viewsChartData" 
              :options="{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }"
              class="h-64"
            />
          </BaseCard>
          
          <!-- Demographics -->
          <BaseCard class="col-span-12 md:col-span-6 p-6">
            <BaseHeading size="sm" weight="medium" class="mb-4">Audience Age</BaseHeading>
            <DoughnutChart 
              :data="ageChartData" 
              :options="{ responsive: true }"
              class="h-64"
            />
          </BaseCard>
          
          <BaseCard class="col-span-12 md:col-span-6 p-6">
            <BaseHeading size="sm" weight="medium" class="mb-4">Platform Distribution</BaseHeading>
            <DoughnutChart 
              :data="platformChartData" 
              :options="{ responsive: true }"
              class="h-64"
            />
          </BaseCard>
          
          <!-- Top Countries -->
          <BaseCard class="col-span-12 md:col-span-6 p-6">
            <BaseHeading size="sm" weight="medium" class="mb-4">Top Countries</BaseHeading>
            <div class="space-y-4">
              <template v-if="analyticsData.demographics?.countries">
                <div 
                  v-for="(views, country, index) in analyticsData.demographics.countries" 
                  :key="country"
                  class="flex items-center"
                  v-show="index < 5"
                >
                  <div class="w-6 text-sm text-muted-400">{{ index + 1 }}</div>
                  <div class="flex-grow">{{ country }}</div>
                  <div class="text-right">{{ formatNumber(views) }}</div>
                </div>
              </template>
            </div>
          </BaseCard>
          
          <!-- Performance tips -->
          <BaseCard class="col-span-12 md:col-span-6 p-6">
            <BaseHeading size="sm" weight="medium" class="mb-4">Performance Insights</BaseHeading>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="rounded-full bg-primary-100 dark:bg-primary-500/20 p-2 mt-0.5">
                  <Icon name="ph:lightbulb-duotone" class="size-4 text-primary-500" />
                </div>
                <div>
                  <BaseHeading size="xs" weight="medium" class="mb-1">Optimize Video Length</BaseHeading>
                  <BaseText size="sm">Your average watch time is {{ Math.floor(analyticsData.average_watch_time / 60) }} minutes. Consider creating videos between 5-8 minutes for better retention.</BaseText>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="rounded-full bg-success-100 dark:bg-success-500/20 p-2 mt-0.5">
                  <Icon name="ph:target-duotone" class="size-4 text-success-500" />
                </div>
                <div>
                  <BaseHeading size="xs" weight="medium" class="mb-1">Target Your Audience</BaseHeading>
                  <BaseText size="sm">Your content performs best with 25-34 age group. Consider creating more content that appeals to this demographic.</BaseText>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="rounded-full bg-warning-100 dark:bg-warning-500/20 p-2 mt-0.5">
                  <Icon name="ph:clock-countdown-duotone" class="size-4 text-warning-500" />
                </div>
                <div>
                  <BaseHeading size="xs" weight="medium" class="mb-1">Improve Retention</BaseHeading>
                  <BaseText size="sm">Your completion rate is {{ analyticsData.completion_rate }}%. Add engaging elements throughout your videos to keep viewers watching.</BaseText>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </template>
    </template>
  </div>
</template>
