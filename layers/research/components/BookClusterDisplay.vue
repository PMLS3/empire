<script setup lang="ts">
import type { ExampleBook } from '../types/research';

const props = defineProps<{
  clusters: Array<{ cluster_id: number; books: ExampleBook[] }>;
  loading?: boolean;
}>();

const emit = defineEmits(['book-clicked']);

// Get cluster theme based on books in cluster
const getClusterTheme = (clusterIndex: number) => {
  const cluster = props.clusters[clusterIndex];
  if (!cluster || !cluster.books || cluster.books.length === 0) {
    return 'No books in cluster';
  }

  // Calculate most common category
  const categories = cluster.books.map(book => book.category);
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const [topCategory] = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])[0] || [];
  
  // Get most common words in book titles
  const allTitles = cluster.books.map(book => book.title).join(' ');
  const commonWords = getMostCommonWords(allTitles, 3);

  return `${topCategory || 'Mixed'}: ${commonWords.join(', ')}`;
};

// Helper function to find most common meaningful words
const getMostCommonWords = (text: string, count: number): string[] => {
  if (!text) return [];
  
  // Filter out common stopwords
  const stopwords = [
    'the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  ];
  
  // Clean and split the text
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.includes(word));
  
  // Count word occurrences
  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Sort by frequency and take the top N
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
};

// Get color for cluster
const clusterColors = [
  'primary',
  'success',
  'info',
  'warning',
  'danger',
  'muted',
];

const getClusterColor = (index: number) => {
  return clusterColors[index % clusterColors.length];
};

// Active cluster tab
const activeTab = ref(0);
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-10">
      <BaseButtonIcon
        size="lg"
        disabled
        shape="full"
        class="animate-spin text-primary-500"
      >
        <Icon name="line-md:loading-twotone-loop" class="size-6" />
      </BaseButtonIcon>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="!clusters || clusters.length === 0" class="py-10 text-center">
      <div class="mb-4 flex justify-center">
        <BaseIconBox
          size="lg"
          class="bg-info-500/10 text-info-500"
          shape="full"
          color="none"
        >
          <Icon name="ph:cube-duotone" class="size-10" />
        </BaseIconBox>
      </div>
      <BaseHeading tag="h4" size="lg" weight="medium" class="text-muted-800 dark:text-white">
        No Clusters Generated
      </BaseHeading>
      <BaseParagraph size="sm" class="text-muted-400 mt-2 max-w-md mx-auto">
        Configure clustering parameters and generate clusters to see results here.
      </BaseParagraph>
    </div>
    
    <!-- Clusters display -->
    <div v-else>
      <!-- Cluster tabs -->
      <div class="border-b border-muted-200 dark:border-muted-700 mb-6">
        <div class="flex flex-wrap -mb-px">
          <div
            v-for="(cluster, index) in clusters"
            :key="`cluster-${index}`"
            class="cursor-pointer"
            @click="activeTab = index"
          >
            <div
              class="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-300"
              :class="{
                'border-b-2 border-primary-500 text-primary-500': activeTab === index,
                'text-muted-400 hover:text-primary-500 hover:border-primary-500/50': activeTab !== index
              }"
            >
              <BaseIconBox
                size="xs"
                :class="`bg-${getClusterColor(index)}-500/10 text-${getClusterColor(index)}-500`"
                shape="full"
                color="none"
              >
                {{ index + 1 }}
              </BaseIconBox>
              <span>Cluster {{ index + 1 }}</span>
              <BaseBadge :color="getClusterColor(index)" rounded="full">
                {{ cluster.books.length }}
              </BaseBadge>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Cluster details -->
      <div v-for="(cluster, index) in clusters" :key="`cluster-content-${index}`" v-show="activeTab === index">
        <div class="mb-4">
          <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white">
            Cluster {{ index + 1 }}: {{ getClusterTheme(index) }}
          </BaseHeading>
          <BaseParagraph size="xs" class="text-muted-400">
            {{ cluster.books.length }} books in this semantic cluster
          </BaseParagraph>
        </div>
        
        <!-- Books grid -->
        <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div
            v-for="book in cluster.books"
            :key="book.id"
            class="cursor-pointer"
            @click="$emit('book-clicked', book)"
          >
            <BookCard :book="book" :showActions="false" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
