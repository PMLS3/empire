<script setup lang="ts">
definePageMeta({
  title: 'Research Analytics',
});
useHead({
  title: 'Research Analytics',
});

const { isAuthenticated } = useAuth();
const toaster = useToaster();

// Analytics data
const loading = ref(true);
const error = ref(null);
const analyticsData = ref({
  projectsByCategory: [],
  projectsByStatus: [],
  booksByCategory: [],
  monthlyActivity: []
});

// Mock analytics data
const mockAnalyticsData = {
  projectsByCategory: [
    { name: 'Fiction', value: 12 },
    { name: 'Non-Fiction', value: 8 },
    { name: 'Self-Help', value: 5 },
    { name: 'Business', value: 7 },
    { name: 'Technical', value: 4 },
  ],
  projectsByStatus: [
    { name: 'In Progress', value: 18 },
    { name: 'Completed', value: 12 },
    { name: 'Archived', value: 6 },
  ],
  booksByCategory: [
    { name: 'Fiction', value: 45 },
    { name: 'Non-Fiction', value: 32 },
    { name: 'Self-Help', value: 18 },
    { name: 'Business', value: 25 },
    { name: 'Technical', value: 15 },
  ],
  monthlyActivity: [
    { month: 'Jan', projects: 3, books: 12 },
    { month: 'Feb', projects: 5, books: 18 },
    { month: 'Mar', projects: 2, books: 10 },
    { month: 'Apr', projects: 6, books: 24 },
    { month: 'May', projects: 4, books: 15 },
    { month: 'Jun', projects: 8, books: 30 },
    { month: 'Jul', projects: 5, books: 20 },
    { month: 'Aug', projects: 7, books: 28 },
    { month: 'Sep', projects: 6, books: 22 },
    { month: 'Oct', projects: 9, books: 35 },
    { month: 'Nov', projects: 7, books: 27 },
    { month: 'Dec', projects: 6, books: 24 },
  ],
};

// Fetch analytics data
const fetchAnalyticsData = async () => {
  if (!isAuthenticated.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    analyticsData.value = mockAnalyticsData;
  } catch (err) {
    console.error('Error fetching analytics data:', err);
    error.value = err.message || 'Failed to load analytics data';
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

// Generate chart colors
const categoryColors = [
  'rgba(59, 130, 246, 0.7)',  // blue
  'rgba(16, 185, 129, 0.7)',  // green
  'rgba(245, 158, 11, 0.7)',  // yellow
  'rgba(236, 72, 153, 0.7)',  // pink
  'rgba(139, 92, 246, 0.7)',  // purple
  'rgba(249, 115, 22, 0.7)',  // orange
];

// Chart options
const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#94a3b8', // text-muted-400
        padding: 10,
        usePointStyle: true,
      }
    }
  }
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(148, 163, 184, 0.1)', // text-muted-400/10
      },
      ticks: {
        color: '#94a3b8', // text-muted-400
      }
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#94a3b8', // text-muted-400
      }
    }
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#94a3b8', // text-muted-400
        padding: 10,
        usePointStyle: true,
      }
    }
  }
};

// Generate chart data
const projectsByCategoryChart = computed(() => {
  return {
    labels: analyticsData.value.projectsByCategory.map(item => item.name),
    datasets: [
      {
        label: 'Projects',
        data: analyticsData.value.projectsByCategory.map(item => item.value),
        backgroundColor: categoryColors,
        borderWidth: 0,
      }
    ]
  };
});

const projectsByStatusChart = computed(() => {
  return {
    labels: analyticsData.value.projectsByStatus.map(item => item.name),
    datasets: [
      {
        label: 'Projects',
        data: analyticsData.value.projectsByStatus.map(item => item.value),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',   // blue - in progress
          'rgba(16, 185, 129, 0.7)',   // green - completed
          'rgba(148, 163, 184, 0.7)',  // gray - archived
        ],
        borderWidth: 0,
      }
    ]
  };
});

const booksByCategoryChart = computed(() => {
  return {
    labels: analyticsData.value.booksByCategory.map(item => item.name),
    datasets: [
      {
        label: 'Books',
        data: analyticsData.value.booksByCategory.map(item => item.value),
        backgroundColor: categoryColors,
        borderWidth: 0,
      }
    ]
  };
});

const monthlyActivityChart = computed(() => {
  return {
    labels: analyticsData.value.monthlyActivity.map(item => item.month),
    datasets: [
      {
        label: 'Projects',
        data: analyticsData.value.monthlyActivity.map(item => item.projects),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',  // blue
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Books',
        data: analyticsData.value.monthlyActivity.map(item => item.books),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',  // green
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      }
    ]
  };
});

// Watch for authentication state to load data
watch(
  isAuthenticated,
  (newVal) => {
    if (newVal) {
      fetchAnalyticsData();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="space-y-6 pb-20 pt-4">
    <!-- Header -->
    <div>
      <BaseHeading tag="h1" size="xl" weight="semibold" class="text-muted-800 dark:text-white mb-1">
        Research Analytics
      </BaseHeading>
      <BaseParagraph size="xs" class="text-muted-400">
        Insights and statistics about your research projects and books
      </BaseParagraph>
    </div>
    
    <!-- Charts -->
    <div class="grid grid-cols-12 gap-6">
      <!-- Loading state -->
      <div v-if="loading" class="col-span-12 flex items-center justify-center py-20">
        <BaseButtonIcon
          size="lg"
          disabled
          shape="full"
          class="animate-spin text-primary-500"
        >
          <Icon name="line-md:loading-twotone-loop" class="size-6" />
        </BaseButtonIcon>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="col-span-12 py-20 text-center">
        <div class="mb-4 flex justify-center">
          <BaseIconBox
            size="lg"
            class="bg-danger-500/10 text-danger-500"
            shape="full"
            color="none"
          >
            <Icon name="ph:warning-circle-duotone" class="size-10" />
          </BaseIconBox>
        </div>
        <BaseHeading tag="h4" size="lg" weight="medium" class="text-danger-500">
          Error Loading Analytics
        </BaseHeading>
        <BaseParagraph size="sm" class="text-muted-400 mt-2 max-w-md mx-auto">
          {{ error }}
        </BaseParagraph>
        <div class="mt-4">
          <BaseButton color="primary" @click="fetchAnalyticsData">
            <Icon name="ph:arrow-clockwise-duotone" class="me-2 size-4" />
            <span>Retry</span>
          </BaseButton>
        </div>
      </div>
      
      <template v-else>
        <!-- Projects by Category -->
        <div class="col-span-12 md:col-span-6 lg:col-span-6">
          <BaseCard class="p-6 h-full">
            <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-4">
              Projects by Category
            </BaseHeading>
            <div class="h-72">
              <client-only>
                <Pie :data="projectsByCategoryChart" :options="pieChartOptions" />
              </client-only>
            </div>
          </BaseCard>
        </div>
        
        <!-- Projects by Status -->
        <div class="col-span-12 md:col-span-6 lg:col-span-6">
          <BaseCard class="p-6 h-full">
            <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-4">
              Projects by Status
            </BaseHeading>
            <div class="h-72">
              <client-only>
                <Doughnut :data="projectsByStatusChart" :options="pieChartOptions" />
              </client-only>
            </div>
          </BaseCard>
        </div>
        
        <!-- Books by Category -->
        <div class="col-span-12 md:col-span-6 lg:col-span-6">
          <BaseCard class="p-6 h-full">
            <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-4">
              Books by Category
            </BaseHeading>
            <div class="h-72">
              <client-only>
                <Bar :data="booksByCategoryChart" :options="barChartOptions" />
              </client-only>
            </div>
          </BaseCard>
        </div>
        
        <!-- Monthly Activity -->
        <div class="col-span-12 md:col-span-6 lg:col-span-6">
          <BaseCard class="p-6 h-full">
            <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-4">
              Monthly Activity
            </BaseHeading>
            <div class="h-72">
              <client-only>
                <Line :data="monthlyActivityChart" :options="barChartOptions" />
              </client-only>
            </div>
          </BaseCard>
        </div>
        
        <!-- Summary Statistics -->
        <div class="col-span-12">
          <BaseCard class="p-6">
            <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-4">
              Summary
            </BaseHeading>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Total Projects -->
              <div class="p-4 bg-primary-500/10 rounded-md">
                <div class="flex items-center gap-3">
                  <BaseIconBox
                    size="md"
                    class="bg-primary-500 text-white"
                    shape="rounded"
                  >
                    <Icon name="ph:folder-duotone" class="size-5" />
                  </BaseIconBox>
                  <div>
                    <div class="text-xs text-muted-400">Total Projects</div>
                    <div class="text-xl font-semibold text-muted-800 dark:text-white">
                      {{ analyticsData.projectsByStatus.reduce((sum, item) => sum + item.value, 0) }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Total Books -->
              <div class="p-4 bg-success-500/10 rounded-md">
                <div class="flex items-center gap-3">
                  <BaseIconBox
                    size="md"
                    class="bg-success-500 text-white"
                    shape="rounded"
                  >
                    <Icon name="ph:books-duotone" class="size-5" />
                  </BaseIconBox>
                  <div>
                    <div class="text-xs text-muted-400">Total Books</div>
                    <div class="text-xl font-semibold text-muted-800 dark:text-white">
                      {{ analyticsData.booksByCategory.reduce((sum, item) => sum + item.value, 0) }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Most Active Month -->
              <div class="p-4 bg-info-500/10 rounded-md">
                <div class="flex items-center gap-3">
                  <BaseIconBox
                    size="md"
                    class="bg-info-500 text-white"
                    shape="rounded"
                  >
                    <Icon name="ph:calendar-duotone" class="size-5" />
                  </BaseIconBox>
                  <div>
                    <div class="text-xs text-muted-400">Most Active Month</div>
                    <div class="text-xl font-semibold text-muted-800 dark:text-white">
                      {{ analyticsData.monthlyActivity.reduce((prev, current) => 
                          (prev.books > current.books) ? prev : current, { books: 0 }).month }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Top Category -->
              <div class="p-4 bg-yellow-500/10 rounded-md">
                <div class="flex items-center gap-3">
                  <BaseIconBox
                    size="md"
                    class="bg-yellow-500 text-white"
                    shape="rounded"
                  >
                    <Icon name="ph:chart-pie-slice-duotone" class="size-5" />
                  </BaseIconBox>
                  <div>
                    <div class="text-xs text-muted-400">Top Category</div>
                    <div class="text-xl font-semibold text-muted-800 dark:text-white">
                      {{ analyticsData.booksByCategory.reduce((prev, current) => 
                          (prev.value > current.value) ? prev : current, { value: 0 }).name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </template>
    </div>
  </div>
</template>
