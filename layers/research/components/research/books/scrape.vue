<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import type { ExampleBook, CategoryResearch } from '../../../types/research';
import { useBook } from '../../../composables/useBook';
import { useToaster } from '../../../../shared/composables/toaster';

definePageMeta({
  title: 'Book Scraper',
});
useHead({
  title: 'Book Scraper',
});

// Get research projects for the dropdown
const { researchProjects, loading: loadingProjects } = useResearch();
const { scrapeBookFromAmazon } = useBook();

// Form schema
const validationSchema = toTypedSchema(
  z.object({
    urls: z.string().min(1, 'At least one URL is required'),
    research_id: z.string().min(1, 'Please select a research project'),
    custom_prompt: z.string().optional(),
  })
);

// Form state
const { handleSubmit, isSubmitting, values, errors, resetForm } = useForm({
  validationSchema,
  initialValues: {
    urls: '',
    research_id: '',
    custom_prompt: '',
  },
});

// UI state
const toaster = useToaster();
const showAdvancedOptions = ref(false);
const scrapedBooks = ref<ExampleBook[]>([]);
const showResults = ref(false);

// Process URLs from textarea
const processUrls = (urlsText: string): string[] => {
  return urlsText
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0 && (url.includes('amazon.com') || url.includes('amzn.to')));
};

// Submit handler
const onSubmit = handleSubmit(async (formValues) => {
  try {
    const urls = processUrls(formValues.urls);
    
    if (urls.length === 0) {
      toaster.show({
        title: 'Error',
        message: 'No valid Amazon URLs found',
        color: 'danger',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
      return;
    }
    
    // Scrape the books using the composable
    const result = await scrapeBookFromAmazon(urls, formValues.custom_prompt || undefined);
    
    if (Array.isArray(result) && result.length > 0) {
      scrapedBooks.value = result;
      showResults.value = true;
      
      toaster.show({
        title: 'Success',
        message: `${result.length} books scraped successfully`,
        color: 'success',
        icon: 'ph:check-circle-duotone',
        closable: true,
      });
    } else {
      toaster.show({
        title: 'Warning',
        message: 'No books were found or scraped',
        color: 'warning',
        icon: 'ph:warning-circle-duotone',
        closable: true,
      });
    }
  } catch (error) {
    console.error('Error scraping books:', error);
    toaster.show({
      title: 'Error',
      message: error.message || 'Failed to scrape books',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
      closable: true,
    });
  }
});
</script>

<template>
  <div class="space-y-6 pb-20 pt-4">
    <!-- Header -->
    <div class="flex items-center mb-6">
      <NuxtLink 
        to="/research/books" 
        class="me-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted-100 dark:bg-muted-900 hover:bg-primary-500/20 hover:text-primary-500"
      >
        <Icon name="ph:arrow-left-duotone" class="size-5" />
      </NuxtLink>
      <div>
        <BaseHeading tag="h1" size="xl" weight="semibold" class="text-muted-800 dark:text-white">
          Book Scraper
        </BaseHeading>
        <BaseParagraph size="xs" class="text-muted-400">
          Add books to your research by scraping Amazon book pages
        </BaseParagraph>
      </div>
    </div>
    
    <!-- Main content -->
    <div class="grid grid-cols-12 gap-4">
      <!-- Scraper form -->
      <div class="col-span-12 lg:col-span-7">
        <BaseCard class="p-6">
          <form @submit.prevent="onSubmit">
            <div class="space-y-5">
              <!-- Research project selection -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-2">
                  Research Project
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  Select the research project to add these books to
                </BaseParagraph>
                
                <BaseSelect
                  v-model="values.research_id"
                  :items="researchProjects.map(p => ({ 
                    value: p.id, 
                    label: `${p.main_category}: ${p.sub_category}` 
                  }))"
                  placeholder="Select a research project"
                  shape="rounded"
                  :loading="loadingProjects"
                  :disabled="loadingProjects"
                  :error="errors.research_id"
                  required
                ><option v-if="loadingProjects" disabled>Loading...</option>
              <options v-for="option in categoryOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </options>
              </BaseSelect>

              </div>
              
              <!-- URL input -->
              <div>
                <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-2">
                  Book URLs
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 mb-3">
                  Enter Amazon book URLs, one per line (maximum 10)
                </BaseParagraph>
                
                <BaseTextarea
                  v-model="values.urls"
                  placeholder="https://www.amazon.com/dp/ASIN1&#10;https://www.amazon.com/dp/ASIN2&#10;..."
                  rows="6"
                  shape="rounded"
                  :error="errors.urls"
                  required
                />
              </div>
              
              <!-- Advanced options -->
              <div>
                <div 
                  class="flex items-center cursor-pointer mb-2" 
                  @click="showAdvancedOptions = !showAdvancedOptions"
                >
                  <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white">
                    Advanced Options
                  </BaseHeading>
                  <Icon 
                    :name="showAdvancedOptions ? 'ph:caret-up-duotone' : 'ph:caret-down-duotone'" 
                    class="ms-2 size-4 text-muted-400"
                  />
                </div>
                
                <div v-if="showAdvancedOptions" class="space-y-4">
                  <div>
                    <BaseHeading tag="h4" size="sm" weight="medium" class="text-muted-700 dark:text-muted-200 mb-1">
                      Custom Extraction Prompt
                    </BaseHeading>
                    <BaseParagraph size="xs" class="text-muted-400 mb-2">
                      Optional: Provide a custom prompt to guide the extraction process
                    </BaseParagraph>
                    <BaseTextarea
                      v-model="values.custom_prompt"
                      placeholder="E.g., Focus on extracting pricing strategy information and sales rank details"
                      rows="3"
                      shape="rounded"
                    />
                  </div>
                </div>
              </div>
              
              <!-- Buttons -->
              <div class="flex justify-end gap-2 pt-4">
                <BaseButton
                  type="button"
                  color="muted"
                  @click="resetForm"
                >
                  Reset
                </BaseButton>
                <BaseButton
                  type="submit"
                  color="primary"
                  :loading="isSubmitting"
                  :disabled="isSubmitting"
                >
                  <Icon v-if="!isSubmitting" name="ph:spider-duotone" class="me-2 size-4" />
                  <span>{{ isSubmitting ? 'Scraping...' : 'Start Scraping' }}</span>
                </BaseButton>
              </div>
            </div>
          </form>
        </BaseCard>
      </div>
      
      <!-- Info panel -->
      <div class="col-span-12 lg:col-span-5">
        <BaseCard class="p-6 h-full">
          <BaseHeading tag="h3" size="lg" weight="semibold" class="text-muted-800 dark:text-white mb-4">
            How It Works
          </BaseHeading>
          
          <div class="space-y-5">
            <div class="flex gap-3">
              <BaseIconBox
                size="md"
                color="primary"
                shape="rounded"
                class="flex-shrink-0 mt-1"
              >
                <span class="font-semibold text-sm">1</span>
              </BaseIconBox>
              <div>
                <BaseHeading tag="h4" size="sm" weight="medium" class="text-muted-800 dark:text-white mb-1">
                  Paste Amazon URLs
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400">
                  Copy and paste the URLs of the books you want to research from Amazon.
                </BaseParagraph>
              </div>
            </div>
            
            <div class="flex gap-3">
              <BaseIconBox
                size="md"
                color="primary"
                shape="rounded"
                class="flex-shrink-0 mt-1"
              >
                <span class="font-semibold text-sm">2</span>
              </BaseIconBox>
              <div>
                <BaseHeading tag="h4" size="sm" weight="medium" class="text-muted-800 dark:text-white mb-1">
                  Automated Extraction
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400">
                  Our scraper extracts key data including title, author, description, pricing, BSR, and reviews.
                </BaseParagraph>
              </div>
            </div>
            
            <div class="flex gap-3">
              <BaseIconBox
                size="md"
                color="primary"
                shape="rounded"
                class="flex-shrink-0 mt-1"
              >
                <span class="font-semibold text-sm">3</span>
              </BaseIconBox>
              <div>
                <BaseHeading tag="h4" size="sm" weight="medium" class="text-muted-800 dark:text-white mb-1">
                  Review & Save
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400">
                  Review the extracted data and save it to your research project for analysis.
                </BaseParagraph>
              </div>
            </div>
            
            <div class="flex gap-3">
              <BaseIconBox
                size="md"
                color="primary"
                shape="rounded"
                class="flex-shrink-0 mt-1"
              >
                <span class="font-semibold text-sm">4</span>
              </BaseIconBox>
              <div>
                <BaseHeading tag="h4" size="sm" weight="medium" class="text-muted-800 dark:text-white mb-1">
                  Vector Embeddings
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400">
                  Automatically generates vector embeddings for semantic search and clustering.
                </BaseParagraph>
              </div>
            </div>
            
            <BaseMessage color="warning" class="mt-8">
              <template #icon>
                <Icon name="ph:warning-circle-duotone" class="size-5" />
              </template>
              <div>
                <b>Note:</b> Please respect Amazon's terms of service and copyright restrictions.
                This tool is intended for research purposes only.
              </div>
            </BaseMessage>
          </div>
        </BaseCard>
      </div>
    </div>
    
    <!-- Scraped books results -->
    <BaseCard v-if="showResults && scrapedBooks.length > 0" class="p-6">
      <div class="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <BaseHeading tag="h2" size="lg" weight="semibold" class="text-muted-800 dark:text-white">
            Scraped Books
          </BaseHeading>
          <BaseParagraph size="xs" class="text-muted-400">
            {{ scrapedBooks.length }} books were successfully scraped
          </BaseParagraph>
        </div>
        
        <div class="flex gap-2">
          <BaseButton color="success">
            <Icon name="ph:check-circle-duotone" class="me-2 size-4" />
            <span>Save All to Project</span>
          </BaseButton>
          <BaseButton color="muted" @click="showResults = false">
            <span>Hide Results</span>
          </BaseButton>
        </div>
      </div>
      
      <div class="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="(book, index) in scrapedBooks" :key="index" class="relative">
          <BookCard :book="book" :showActions="false" />
          
          <!-- Edit overlay button -->
          <div class="absolute top-2 right-2">
            <BaseButtonIcon
              color="primary"
              size="sm"
              shape="full"
              v-tooltip="'Edit Book'"
            >
              <Icon name="ph:pencil-duotone" class="size-4" />
            </BaseButtonIcon>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
