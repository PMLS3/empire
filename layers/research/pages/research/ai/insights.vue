<script setup lang="ts">
import type { CategoryResearch } from '../../../types/research';

definePageMeta({
  title: 'Research Insights',
});
useHead({
  title: 'Research Insights',
});

const { isAuthenticated } = useAuth();
const toaster = useToaster();

// Get research projects
const { researchProjects, loading: loadingProjects } = useResearch();

// Selected research project
const selectedResearchId = ref('');
const insightType = ref('market');
const generatingInsights = ref(false);
const insights = ref({
  market: null,
  content: null,
  audience: null
});

// Chart data
const chartData = ref({
  booksByRating: {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Number of Books',
        data: [2, 5, 18, 42, 33],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',   // red
          'rgba(245, 158, 11, 0.7)',   // amber
          'rgba(249, 115, 22, 0.7)',   // orange
          'rgba(59, 130, 246, 0.7)',   // blue
          'rgba(16, 185, 129, 0.7)',   // green
        ],
      }
    ]
  },
  priceDistribution: {
    labels: ['$0-$2.99', '$3-$4.99', '$5-$6.99', '$7-$9.99', '$10+'],
    datasets: [
      {
        label: 'Number of Books',
        data: [10, 25, 35, 20, 10],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      }
    ]
  },
  salesTrend: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Estimated Sales',
        data: [1200, 1500, 1300, 1800, 2200, 2500],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        fill: true,
      }
    ]
  }
});

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8',
        padding: 10,
        usePointStyle: true,
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(148, 163, 184, 0.1)',
      },
      ticks: {
        color: '#94a3b8',
      }
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#94a3b8',
      }
    }
  }
};

// Watch for research project selection
watch(selectedResearchId, async (newVal) => {
  if (!newVal) {
    insights.value = {
      market: null,
      content: null,
      audience: null
    };
    return;
  }
  
  // Reset insights when changing projects
  insights.value = {
    market: null,
    content: null,
    audience: null
  };
});

// Generate insights
const generateInsights = async () => {
  if (!selectedResearchId.value) return;
  
  generatingInsights.value = true;
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock insights data
    const mockInsights = {
      market: {
        summary: "The market analysis reveals strong potential in the selected category with consistent growth. Books in this research set are performing above category averages in both ratings (4.2 vs 3.9 category avg) and sales.",
        keyFindings: [
          "Price point optimization: Books priced between $4.99-$6.99 show the highest ROI",
          "Rating distribution indicates above-market quality perception",
          "Review volume is 32% higher than category average",
          "Page count sweet spot identified at 250-320 pages"
        ],
        recommendations: [
          "Consider price testing in the $4.99-$6.99 range",
          "Emphasize quality positioning in marketing materials",
          "Focus on encouraging reviews through reader engagement",
          "Target content length of 250-320 pages for optimal market fit"
        ]
      },
      content: {
        summary: "Content analysis shows several patterns across successful books in this research set. Books with clear chapter structure, frequent subheadings, and practical examples receive higher ratings and better sales performance.",
        keyFindings: [
          "Chapter length sweet spot: 15-20 pages with 5-7 subsections",
          "Highest-rated books feature 30% more examples and case studies",
          "Visual elements (charts, diagrams) correlate with higher retention",
          "Actionable summaries at chapter ends appear in 78% of top performers"
        ],
        recommendations: [
          "Structure chapters with 15-20 page length and clear subsections",
          "Include practical examples every 3-4 pages",
          "Incorporate visual elements to support complex concepts",
          "Add actionable summaries at the end of each chapter"
        ]
      },
      audience: {
        summary: "Audience analysis reveals a clear demographic profile and preference pattern. The primary reader base is well-educated professionals aged 35-45 with specific content expectations.",
        keyFindings: [
          "Primary demographic: 35-45, college educated, professional",
          "Key content expectation: practical applications over theory",
          "Reading pattern: non-linear, reference-style consumption",
          "Preference for actionable advice and implementation guides"
        ],
        recommendations: [
          "Design content for both linear reading and reference access",
          "Emphasize practical applications over theoretical foundations",
          "Include implementation guides and action steps",
          "Focus marketing on professional development benefits"
        ]
      }
    };
    
    // Update insights for the selected type
    insights.value[insightType.value] = mockInsights[insightType.value];
    
    toaster.show({
      title: 'Insights Generated',
      message: 'Research insights have been generated successfully',
      color: 'success',
      icon: 'ph:check-circle-duotone',
      closable: true,
    });
  } catch (err) {
    console.error('Error generating insights:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to generate insights',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
      closable: true,
    });
  } finally {
    generatingInsights.value = false;
  }
};
</script>

<template>
  <div class="space-y-6 pb-20 pt-4">
    <!-- Header -->
    <div>
      <BaseHeading tag="h1" size="xl" weight="semibold" class="text-muted-800 dark:text-white">
        Research Insights
      </BaseHeading>
      <BaseParagraph size="xs" class="text-muted-400">
        AI-powered insights and analysis for your book research
      </BaseParagraph>
    </div>
    
    <!-- Controls -->
    <BaseCard class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Research project selection -->
        <div>
          <BaseHeading tag="h4" size="sm" weight="medium" class="mb-2 text-muted-700 dark:text-muted-200">
            Research Project
          </BaseHeading>
          <BaseSelect
            v-model="selectedResearchId"
            :items="researchProjects.map(p => ({ 
              value: p.id, 
              label: `${p.main_category}: ${p.sub_category}` 
            }))"
            placeholder="Select a research project"
            shape="rounded"
            :loading="loadingProjects"
            :disabled="loadingProjects || generatingInsights"
          />
        </div>
        
        <!-- Insight type selection -->
        <div>
          <BaseHeading tag="h4" size="sm" weight="medium" class="mb-2 text-muted-700 dark:text-muted-200">
            Insight Type
          </BaseHeading>
          <BaseSelect
            v-model="insightType"
            :items="[
              { value: 'market', label: 'Market Analysis' },
              { value: 'content', label: 'Content Analysis' },
              { value: 'audience', label: 'Audience Analysis' }
            ]"
            placeholder="Select insight type"
            shape="rounded"
            :disabled="!selectedResearchId || generatingInsights"
          />
        </div>
        
        <!-- Generate button -->
        <div class="flex items-end">
          <BaseButton
            color="primary"
            class="w-full"
            :loading="generatingInsights"
            :disabled="!selectedResearchId || generatingInsights"
            @click="generateInsights"
          >
            <Icon v-if="!generatingInsights" name="ph:chart-bar-duotone" class="me-2 size-4" />
            <span>{{ generatingInsights ? 'Generating...' : 'Generate Insights' }}</span>
          </BaseButton>
        </div>
      </div>
    </BaseCard>
    
    <!-- Charts and insights -->
    <div class="grid grid-cols-12 gap-6">
      <!-- Market Analysis -->
      <div v-if="insightType === 'market'" class="col-span-12 md:col-span-6">
        <BaseCard class="p-6 h-full">
          <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-4">
            Book Rating Distribution
          </BaseHeading>
          <div class="h-80">
            <client-only>
              <Doughnut :data="chartData.booksByRating" :options="chartOptions" />
            </client-only>
          </div>
        </BaseCard>
      </div>
      
      <div v-if="insightType === 'market'" class="col-span-12 md:col-span-6">
        <BaseCard class="p-6 h-full">
          <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-4">
            Price Distribution
          </BaseHeading>
          <div class="h-80">
            <client-only>
              <Bar :data="chartData.priceDistribution" :options="chartOptions" />
            </client-only>
          </div>
        </BaseCard>
      </div>
      
      <!-- Content Analysis -->
      <div v-if="insightType === 'content'" class="col-span-12">
        <BaseCard class="p-6 h-full">
          <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-4">
            Content Length vs. Rating
          </BaseHeading>
          <div class="h-80">
            <client-only>
              <Scatter 
                :data="{
                  datasets: [{
                    label: 'Books',
                    data: [
                      { x: 150, y: 3.2 },
                      { x: 220, y: 4.1 },
                      { x: 275, y: 4.5 },
                      { x: 310, y: 4.7 },
                      { x: 350, y: 4.3 },
                      { x: 380, y: 3.9 },
                      { x: 420, y: 3.5 },
                      { x: 180, y: 3.8 },
                      { x: 240, y: 4.2 },
                      { x: 290, y: 4.6 },
                    ],
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                  }]
                }" 
                :options="{
                  ...chartOptions,
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Average Rating'
                      },
                      min: 3,
                      max: 5,
                      ticks: {
                        color: '#94a3b8',
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Page Count'
                      },
                      ticks: {
                        color: '#94a3b8',
                      }
                    }
                  }
                }"
              />
            </client-only>
          </div>
        </BaseCard>
      </div>
      
      <!-- Audience Analysis -->
      <div v-if="insightType === 'audience'" class="col-span-12">
        <BaseCard class="p-6 h-full">
          <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-4">
            Monthly Sales Trend
          </BaseHeading>
          <div class="h-80">
            <client-only>
              <Line :data="chartData.salesTrend" :options="chartOptions" />
            </client-only>
          </div>
        </BaseCard>
      </div>
      
      <!-- Insights panel -->
      <div class="col-span-12">
        <BaseCard v-if="!selectedResearchId" class="p-10 text-center">
          <BaseIconBox
            size="xl"
            class="bg-info-500/10 text-info-500 mx-auto mb-4"
            shape="full"
            color="none"
          >
            <Icon name="ph:chart-pie-slice-duotone" class="size-8" />
          </BaseIconBox>
          <BaseHeading tag="h3" size="lg" weight="medium" class="text-muted-800 dark:text-white mb-2">
            Select a Research Project
          </BaseHeading>
          <BaseParagraph size="sm" class="text-muted-400 max-w-md mx-auto">
            Choose a research project and insight type to generate AI-powered analysis and recommendations.
          </BaseParagraph>
        </BaseCard>
        
        <BaseCard v-else-if="generatingInsights" class="p-10 text-center">
          <div class="flex flex-col items-center justify-center">
            <BaseButtonIcon
              size="xl"
              disabled
              shape="full"
              class="animate-spin text-primary-500 mb-4"
            >
              <Icon name="line-md:loading-twotone-loop" class="size-8" />
            </BaseButtonIcon>
            <BaseHeading tag="h3" size="lg" weight="medium" class="text-muted-800 dark:text-white mb-2">
              Generating Insights
            </BaseHeading>
            <BaseParagraph size="sm" class="text-muted-400 max-w-md mx-auto">
              Our AI is analyzing your research data to provide valuable insights and recommendations.
            </BaseParagraph>
          </div>
        </BaseCard>
        
        <BaseCard v-else-if="!insights[insightType]" class="p-10 text-center">
          <BaseIconBox
            size="xl"
            class="bg-primary-500/10 text-primary-500 mx-auto mb-4"
            shape="full"
            color="none"
          >
            <Icon name="ph:lightbulb-duotone" class="size-8" />
          </BaseIconBox>
          <BaseHeading tag="h3" size="lg" weight="medium" class="text-muted-800 dark:text-white mb-2">
            Generate {{ insightType === 'market' ? 'Market' : insightType === 'content' ? 'Content' : 'Audience' }} Insights
          </BaseHeading>
          <BaseParagraph size="sm" class="text-muted-400 max-w-md mx-auto mb-6">
            Click the "Generate Insights" button to analyze your research data and receive personalized insights.
          </BaseParagraph>
          <BaseButton
            color="primary"
            :disabled="!selectedResearchId"
            @click="generateInsights"
          >
            <Icon name="ph:chart-bar-duotone" class="me-2 size-4" />
            <span>Generate Insights</span>
          </BaseButton>
        </BaseCard>
        
        <BaseCard v-else class="p-6">
          <BaseHeading tag="h2" size="lg" weight="semibold" class="text-muted-800 dark:text-white mb-4">
            {{ insightType === 'market' ? 'Market Analysis' : insightType === 'content' ? 'Content Analysis' : 'Audience Analysis' }} Insights
          </BaseHeading>
          
          <!-- Summary -->
          <div class="mb-6">
            <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-2">
              Summary
            </BaseHeading>
            <BaseParagraph size="sm" class="text-muted-600 dark:text-muted-300">
              {{ insights[insightType].summary }}
            </BaseParagraph>
          </div>
          
          <!-- Key Findings -->
          <div class="mb-6">
            <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-2">
              Key Findings
            </BaseHeading>
            <ul class="space-y-2">
              <li v-for="(finding, index) in insights[insightType].keyFindings" :key="index" class="flex gap-2">
                <BaseIconBox
                  size="sm"
                  class="bg-primary-500/10 text-primary-500 flex-shrink-0 mt-0.5"
                  shape="rounded"
                  color="none"
                >
                  <Icon name="ph:check-duotone" class="size-3" />
                </BaseIconBox>
                <BaseParagraph size="sm" class="text-muted-600 dark:text-muted-300">
                  {{ finding }}
                </BaseParagraph>
              </li>
            </ul>
          </div>
          
          <!-- Recommendations -->
          <div>
            <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-2">
              Recommendations
            </BaseHeading>
            <ul class="space-y-2">
              <li v-for="(recommendation, index) in insights[insightType].recommendations" :key="index" class="flex gap-2">
                <BaseIconBox
                  size="sm"
                  class="bg-success-500/10 text-success-500 flex-shrink-0 mt-0.5"
                  shape="rounded"
                  color="none"
                >
                  <Icon name="ph:light-bulb-fill" class="size-3" />
                </BaseIconBox>
                <BaseParagraph size="sm" class="text-muted-600 dark:text-muted-300">
                  {{ recommendation }}
                </BaseParagraph>
              </li>
            </ul>
          </div>
          
          <!-- Action buttons -->
          <div class="flex justify-end gap-2 mt-6 pt-6 border-t border-muted-200 dark:border-muted-700">
            <BaseButton color="muted">
              <Icon name="ph:export-duotone" class="me-2 size-4" />
              <span>Export Insights</span>
            </BaseButton>
            <BaseButton color="primary">
              <Icon name="ph:file-pdf-duotone" class="me-2 size-4" />
              <span>Save as Report</span>
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
