<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(true);
const templates = ref([]);
const selectedCategory = ref('all');
const searchQuery = ref('');

// Template categories
const categories = [
  { id: 'all', name: 'All Templates' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'social', name: 'Social Media' },
  { id: 'education', name: 'Education' },
  { id: 'business', name: 'Business' },
  { id: 'personal', name: 'Personal' }
];

// Fetch templates
const fetchTemplates = async () => {
  loading.value = true;
  
  try {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock templates data
    templates.value = [
      {
        id: 'template1',
        title: 'Product Showcase',
        description: 'Highlight your product features with this professional template',
        thumbnail: 'https://via.placeholder.com/400x225?text=Product+Showcase',
        category: 'marketing',
        duration: 60,
        scenes: 5,
        popularity: 4.8,
        tags: ['product', 'marketing', 'showcase']
      },
      {
        id: 'template2',
        title: 'Social Media Story',
        description: 'Vertical video template perfect for Instagram and TikTok stories',
        thumbnail: 'https://via.placeholder.com/400x225?text=Social+Story',
        category: 'social',
        duration: 30,
        scenes: 3,
        popularity: 4.9,
        tags: ['social media', 'story', 'vertical']
      },
      {
        id: 'template3',
        title: 'Tutorial Walkthrough',
        description: 'Step-by-step tutorial template with annotations and callouts',
        thumbnail: 'https://via.placeholder.com/400x225?text=Tutorial',
        category: 'education',
        duration: 180,
        scenes: 8,
        popularity: 4.7,
        tags: ['tutorial', 'education', 'walkthrough']
      },
      {
        id: 'template4',
        title: 'Company Introduction',
        description: 'Introduce your business with this professional corporate template',
        thumbnail: 'https://via.placeholder.com/400x225?text=Company+Intro',
        category: 'business',
        duration: 120,
        scenes: 6,
        popularity: 4.6,
        tags: ['business', 'corporate', 'introduction']
      },
      {
        id: 'template5',
        title: 'Personal Vlog',
        description: 'Share your experiences with this personal vlog template',
        thumbnail: 'https://via.placeholder.com/400x225?text=Vlog+Template',
        category: 'personal',
        duration: 300,
        scenes: 10,
        popularity: 4.5,
        tags: ['vlog', 'personal', 'storytelling']
      },
      {
        id: 'template6',
        title: 'Product Review',
        description: 'Compare and review products with this detailed template',
        thumbnail: 'https://via.placeholder.com/400x225?text=Review+Template',
        category: 'marketing',
        duration: 240,
        scenes: 7,
        popularity: 4.4,
        tags: ['review', 'comparison', 'product']
      },
      {
        id: 'template7',
        title: 'Explainer Video',
        description: 'Explain complex concepts clearly with this engaging template',
        thumbnail: 'https://via.placeholder.com/400x225?text=Explainer+Video',
        category: 'education',
        duration: 150,
        scenes: 6,
        popularity: 4.8,
        tags: ['explainer', 'education', 'animation']
      },
      {
        id: 'template8',
        title: 'Promotional Ad',
        description: 'Short, impactful template for promotions and offers',
        thumbnail: 'https://via.placeholder.com/400x225?text=Promo+Ad',
        category: 'marketing',
        duration: 20,
        scenes: 3,
        popularity: 4.9,
        tags: ['ad', 'promotion', 'marketing']
      }
    ];
  } catch (error) {
    console.error('Error loading templates:', error);
  } finally {
    loading.value = false;
  }
};

// Filtered templates based on category and search
const filteredTemplates = computed(() => {
  let result = [...templates.value];
  
  // Filter by category
  if (selectedCategory.value !== 'all') {
    result = result.filter(template => template.category === selectedCategory.value);
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(template => 
      template.title.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  return result;
});

// Use template to create new project
const useTemplate = (templateId) => {
  router.push({
    path: '/creator/projects/new',
    query: { template: templateId }
  });
};

// Format duration (seconds to minutes:seconds)
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Initialize
onMounted(fetchTemplates);
</script>

<template>
  <div>
    <BasePageTitle title="Video Templates" subtitle="Start your project with a professionally designed template" />
    
    <!-- Search and Filters -->
    <div class="flex flex-wrap gap-4 items-center justify-between mb-6">
      <div class="flex flex-wrap gap-2 items-center">
        <button
          v-for="category in categories"
          :key="category.id"
          class="px-3 py-1.5 text-sm rounded-full transition-colors"
          :class="selectedCategory === category.id ? 
            'bg-primary-500 text-white' : 
            'bg-muted-100 dark:bg-muted-800 text-muted-800 dark:text-muted-200 hover:bg-muted-200 dark:hover:bg-muted-700'"
          @click="selectedCategory = category.id"
        >
          {{ category.name }}
        </button>
      </div>
      
      <BaseInput
        v-model="searchQuery"
        placeholder="Search templates..."
        icon="ph:magnifying-glass-duotone"
        size="sm"
        class="w-64"
      />
    </div>
    
    <!-- Loading state -->
    <BasePlaceholderPage
      v-if="loading"
      title="Loading templates"
      subtitle="Please wait while we load the available templates"
      :ui="{ wrapper: 'py-8' }"
    />
    
    <!-- Empty state -->
    <div v-else-if="filteredTemplates.length === 0" class="py-12 text-center">
      <div class="mb-4">
        <Icon name="ph:file-search-duotone" class="size-16 mx-auto text-muted-400" />
      </div>
      <BaseHeading size="lg" weight="medium" class="mb-2">No Templates Found</BaseHeading>
      <BaseText class="mb-6">Try adjusting your search or filters to find templates.</BaseText>
      <BaseButton color="primary" @click="selectedCategory = 'all'; searchQuery = ''">
        <Icon name="ph:arrow-counter-clockwise-duotone" class="me-2" />
        Reset Filters
      </BaseButton>
    </div>
    
    <!-- Templates grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="group rounded-lg border border-muted-200 dark:border-muted-700 overflow-hidden hover:shadow-lg transition-all duration-300"
      >
        <!-- Template thumbnail -->
        <div class="aspect-video relative overflow-hidden">
          <img 
            :src="template.thumbnail" 
            :alt="template.title" 
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div class="absolute bottom-2 right-2 bg-black/70 text-white rounded px-2 py-0.5 text-xs">
            {{ formatDuration(template.duration) }}
          </div>
        </div>
        
        <!-- Template details -->
        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <BaseHeading size="sm" weight="medium" class="line-clamp-1">{{ template.title }}</BaseHeading>
            <div class="flex items-center gap-1 text-warning-500">
              <Icon name="ph:star-fill" class="size-3.5" />
              <span class="text-xs">{{ template.popularity.toFixed(1) }}</span>
            </div>
          </div>
          
          <BaseText size="xs" class="text-muted-500 line-clamp-2 mb-3">
            {{ template.description }}
          </BaseText>
          
          <div class="flex items-center justify-between">
            <div class="text-xs text-muted-500">
              {{ template.scenes }} scenes
            </div>
            
            <BaseTag
              :label="categories.find(c => c.id === template.category)?.name || template.category"
              size="xs"
              :color="
                template.category === 'marketing' ? 'info' :
                template.category === 'social' ? 'purple' :
                template.category === 'education' ? 'success' :
                template.category === 'business' ? 'primary' : 'warning'
              "
            />
          </div>
          
          <!-- Template tags -->
          <div class="mt-3 flex flex-wrap gap-1">
            <BaseTag 
              v-for="(tag, index) in template.tags"
              :key="index"
              :label="tag"
              size="xs"
              color="muted"
            />
          </div>
          
          <!-- Action buttons -->
          <div class="mt-4 flex justify-between gap-2">
            <BaseButton size="sm" color="default" class="flex-grow">
              <Icon name="ph:eye-duotone" class="size-4 me-1" />
              Preview
            </BaseButton>
            
            <BaseButton 
              size="sm" 
              color="primary" 
              class="flex-grow"
              @click="useTemplate(template.id)"
            >
              <Icon name="ph:play-duotone" class="size-4 me-1" />
              Use Template
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
