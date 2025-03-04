<script setup lang="ts">
import type { ExampleBook } from '../types/research';

const props = defineProps<{
  book: ExampleBook;
  showActions?: boolean;
}>();

// Format currency
const formatPrice = (price?: number) => {
  if (!price) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

// Get sales estimate label with pretty formatting
const salesEstimate = computed(() => {
  const sales = props.book.bookbeam_data?.estimatedSales;
  if (!sales) return 'N/A';
  
  if (sales >= 1000000) {
    return `${(sales / 1000000).toFixed(1)}M`;
  } else if (sales >= 1000) {
    return `${(sales / 1000).toFixed(1)}K`;
  } else {
    return sales.toString();
  }
});

// Get average rating with stars
const averageRating = computed(() => {
  const rating = props.book.bookbeam_data?.averageRating || 0;
  return rating.toFixed(1);
});

// Truncate description
const truncateDesc = (text: string, length: number = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Determine if book has vector embeddings
const hasEmbeddings = computed(() => {
  return props.book.vector_embeddings && 
         (props.book.vector_embeddings.description_embedding || 
          props.book.vector_embeddings.content_embedding);
});

// Emit events for actions
const emit = defineEmits(['view', 'edit', 'delete', 'analyze', 'find-similar']);
</script>

<template>
  <BaseCard rounded="md" class="overflow-hidden h-full">
    <!-- Book cover -->
    <div class="relative h-52 bg-muted-100 dark:bg-muted-800">
      <img 
        v-if="book.cover" 
        :src="book.cover" 
        :alt="book.title"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div v-else class="absolute inset-0 flex items-center justify-center">
        <Icon name="ph:book-duotone" class="size-12 text-muted-300 dark:text-muted-600" />
      </div>
      
      <!-- Category badge -->
      <div class="absolute top-2 left-2">
        <BaseBadge :color="book.category === 'fiction' ? 'info' : 'warning'" rounded="full" size="sm">
          {{ book.category }}
        </BaseBadge>
      </div>
      
      <!-- Vector badge -->
      <div v-if="hasEmbeddings" class="absolute top-2 right-2">
        <BaseBadge color="primary" rounded="full" size="sm" v-tooltip="'Has vector embeddings'">
          <Icon name="ph:cube-duotone" class="size-3" />
        </BaseBadge>
      </div>
    </div>
    
    <!-- Book info -->
    <div class="p-4">
      <!-- Title and author -->
      <div>
        <BaseHeading 
          tag="h3" 
          size="md" 
          weight="medium" 
          lead="tight"
          class="text-muted-800 dark:text-white mb-1 line-clamp-2"
        >
          {{ book.title }}
        </BaseHeading>
        <div class="text-xs text-muted-400">
          By {{ book.author }}
        </div>
      </div>
      
      <!-- Ratings and sales -->
      <div class="flex justify-between items-center mt-3">
        <!-- Rating -->
        <div class="flex items-center">
          <Icon name="ph:star-fill" class="text-yellow-400 size-4 me-1" />
          <span class="text-sm font-medium">{{ averageRating }}</span>
          <span class="text-xs text-muted-400 ms-1">({{ book.bookbeam_data?.reviewCount || 0 }})</span>
        </div>
        
        <!-- Sales -->
        <div class="text-xs">
          <span class="text-muted-400">Est. sales: </span>
          <span class="font-medium text-muted-700 dark:text-muted-200">{{ salesEstimate }}</span>
        </div>
      </div>
      
      <!-- Description -->
      <div class="mt-3">
        <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400 line-clamp-3">
          {{ book.description }}
        </BaseParagraph>
      </div>
      
      <!-- Action buttons -->
      <div v-if="showActions" class="mt-4 flex justify-end gap-1">
        <BaseButtonIcon
          size="xs"
          shape="rounded"
          color="default"
          v-tooltip="'View Details'"
          @click.stop="emit('view', book)"
        >
          <Icon name="ph:eye-duotone" class="size-4" />
        </BaseButtonIcon>
        
        <BaseButtonIcon
          size="xs"
          shape="rounded"
          color="default"
          v-tooltip="'Edit Book'"
          @click.stop="emit('edit', book)"
        >
          <Icon name="ph:pencil-simple-duotone" class="size-4" />
        </BaseButtonIcon>
        
        <BaseButtonIcon
          size="xs"
          shape="rounded"
          color="primary"
          v-tooltip="'Find Similar'"
          @click.stop="emit('find-similar', book)"
        >
          <Icon name="ph:cube-duotone" class="size-4" />
        </BaseButtonIcon>
        
        <BaseButtonIcon
          size="xs"
          shape="rounded"
          color="info"
          v-tooltip="'AI Analysis'"
          @click.stop="emit('analyze', book)"
        >
          <Icon name="ph:brain-duotone" class="size-4" />
        </BaseButtonIcon>
        
        <BaseButtonIcon
          size="xs"
          shape="rounded"
          color="danger"
          v-tooltip="'Delete Book'"
          @click.stop="emit('delete', book.id)"
        >
          <Icon name="ph:trash-duotone" class="size-4" />
        </BaseButtonIcon>
      </div>
    </div>
  </BaseCard>
</template>
