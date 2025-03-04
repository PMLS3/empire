<script setup lang="ts">
import type { CategoryResearch, ExampleBook } from '../../../types/research';

definePageMeta({
  title: 'Deep Research',
});
useHead({
  title: 'Deep Research',
});

const { isAuthenticated } = useAuth();
const toaster = useToaster();

// Get research projects
const { researchProjects, loading: loadingProjects } = useResearch();
const { books, currentBook, loading, error } = useBook();

// Form fields
const selectedResearchId = ref('');
const selectedBookId = ref('');
const researchPrompt = ref('');
const customPrompt = ref('');
const showCustomPrompt = ref(false);

// Books in selected research
const booksInResearch = ref<ExampleBook[]>([]);
const loadingBooks = ref(false);

// Research results
const isResearching = ref(false);
const researchResults = ref('');
const researchComplete = ref(false);

// Prompt templates
const promptTemplates = [
  {
    id: 'market-analysis',
    label: 'Market Analysis',
    prompt: 'Analyze the market positioning of this book. Identify target audience, market trends, competitive advantage, pricing strategy, and sales potential based on BSR and reviews.'
  },
  {
    id: 'content-structure',
    label: 'Content Analysis',
    prompt: 'Analyze the structure and content approach of this book. Identify chapter organization, content density, use of examples, writing style, and how the author presents complex information.'
  },
  {
    id: 'review-analysis',
    label: 'Review Analysis',
    prompt: 'Analyze the reviews of this book. Identify common praise and criticism, reader expectations, unfulfilled needs, content gaps, and opportunities for improvement.'
  },
  {
    id: 'competitive-positioning',
    label: 'Competitive Positioning',
    prompt: 'Compare this book to top competitors in its category. Identify unique selling points, content gaps, pricing strategy differences, and market positioning.'
  },
  {
    id: 'author-strategy',
    label: 'Author Strategy',
    prompt: 'Analyze this author\'s strategy. Identify their brand positioning, writing style, reader engagement approach, and marketing tactics based on this book.'
  }
];

// Watch for research project selection
watch(selectedResearchId, async (newVal) => {
  if (!newVal) {
    booksInResearch.value = [];
    selectedBookId.value = '';
    return;
  }
  
  loadingBooks.value = true;
  
  try {
    // In a real app, this would fetch books for the selected research project
    // For now, generate some mock data
    const mockBooks: ExampleBook[] = Array(5).fill(null).map((_, index) => ({
      id: `book-${index}`,
      book_id: newVal,
      title: `Example Book ${index + 1}`,
      subtitle: index % 2 === 0 ? `Subtitle for Book ${index + 1}` : undefined,
      description: `This is a description for book ${index + 1}. It contains sample text about the content of the book.`,
      author: `Author ${Math.floor(index / 2) + 1}`,
      link: `https://example.com/book-${index}`,
      cover: `https://picsum.photos/seed/book-${index}/200/300`,
      category: index % 3 === 0 ? 'fiction' : (index % 3 === 1 ? 'non-fiction' : 'self-help'),
      vector_embeddings: {
        description_embedding: Array(128).fill(0),
        provider: 'openai',
        model: 'text-embedding-3-small',
        dimensions: 128,
        created_at: new Date()
      },
      comments: [],
      likes: [],
      dislikes: [],
      created_at: new Date(),
      updated_at: new Date(),
    }));
    
    booksInResearch.value = mockBooks;
  } catch (err) {
    console.error('Error fetching books:', err);
    toaster.show({
      title: 'Error',
      message: 'Failed to load books',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
      closable: true,
    });
  } finally {
    loadingBooks.value = false;
  }
});

// Set prompt from template
const selectPromptTemplate = (templateId: string) => {
  const template = promptTemplates.find(p => p.id === templateId);
  if (template) {
    researchPrompt.value = template.prompt;
  }
};

// Conduct deep research
const conductResearch = async () => {
  if (!selectedBookId.value || !researchPrompt.value) return;
  
  isResearching.value = true;
  researchResults.value = '';
  
  // Find the selected book
  const selectedBook = booksInResearch.value.find(b => b.id === selectedBookId.value);
  if (!selectedBook) {
    toaster.show({
      title: 'Error',
      message: 'Selected book not found',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
      closable: true,
    });
    isResearching.value = false;
    return;
  }
  
  try {
    // In a real app, this would call the backend API
    // For demo purposes, we'll simulate a streaming response
    const finalPrompt = customPrompt.value || researchPrompt.value;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a mock research result based on the book and prompt
    let mockResult = '';
    
    if (finalPrompt.includes('market')) {
      mockResult = `# Market Analysis for "${selectedBook.title}"

## Target Audience
- Primary: ${selectedBook.category === 'fiction' ? 'Adult fiction readers aged 25-45' : 'Professionals and enthusiasts in the ' + selectedBook.category + ' field'}
- Secondary: ${selectedBook.category === 'fiction' ? 'Book clubs and literary fiction readers' : 'Students and academics in related disciplines'}

## Market Trends
- The ${selectedBook.category} market has shown consistent growth at 7% annually
- Similar titles in this category average 4.2 stars on retailer platforms
- Customer reviews indicate strong interest in ${selectedBook.category === 'fiction' ? 'character-driven narratives' : 'practical applications and case studies'}

## Competitive Advantage
- This title has a higher average rating (${selectedBook.bookbeam_data?.averageRating || 4.2}) than similar books (4.0)
- The author has established credibility through previous publications
- The unique selling point appears to be ${selectedBook.category === 'fiction' ? 'its innovative storytelling approach' : 'its comprehensive coverage of advanced topics'}

## Pricing Strategy
- Currently priced at the upper-mid range for its category
- Price point aligns with perceived value based on page count and content quality
- Promotional discounting could improve visibility within the category

## Sales Potential
- Current BSR (${selectedBook.bsr?.kindle || 'Unknown'}) suggests moderate-to-strong sales performance
- Estimated monthly sales: ${selectedBook.bookbeam_data?.estimatedSales || 150} copies
- Growth potential exists through targeted marketing to the identified secondary audience

## Recommendations
1. Consider bundle opportunities with the author's other works
2. Explore audiobook format to capture additional market segments
3. Leverage the strong review profile in marketing materials
4. Test price elasticity through limited-time promotions`;
    } else if (finalPrompt.includes('content')) {
      mockResult = `# Content Analysis for "${selectedBook.title}"

## Chapter Organization
- Well-structured with ${Math.floor(Math.random() * 10) + 10} chapters following logical progression
- Chapters average 15-20 pages, appropriate for the ${selectedBook.category} genre
- Effective use of subheadings to break down complex topics
- ${selectedBook.category === 'fiction' ? 'Narrative arc follows traditional three-act structure' : 'Concepts build progressively from foundational to advanced'}

## Content Density
- Medium-to-high information density appropriate for the target audience
- Key concepts are reinforced through repetition and practical examples
- Technical terms are well-defined and consistently applied throughout
- ${selectedBook.category === 'fiction' ? 'Descriptive passages balanced with dialogue and action' : 'Theoretical concepts balanced with practical applications'}

## Use of Examples
- ${selectedBook.category === 'fiction' ? 'Character development supported through consistent motivations and growth' : 'Abstract concepts illustrated through relevant case studies'}
- Examples are diverse and representative of various applications
- Real-world scenarios effectively demonstrate theoretical principles
- Visual aids supplement textual explanations where appropriate

## Writing Style
- Tone is ${selectedBook.category === 'fiction' ? 'evocative and emotionally resonant' : 'authoritative yet accessible'}
- Sentences vary appropriately in length and structure for readability
- Technical jargon is used appropriately with sufficient explanation
- Author's voice is distinctive and consistent throughout

## Presentation of Complex Information
- Abstract concepts introduced with clear definitions before elaboration
- Complex ideas broken down into digestible components
- Visual elements support understanding of difficult concepts
- Information hierarchy is logical and aids comprehension

## Recommendations
1. Consider adding a glossary for technical terms
2. Expand certain sections with additional examples
3. Incorporate more visual elements to support key concepts
4. Review transitions between chapters for improved flow`;
    } else if (finalPrompt.includes('review')) {
      mockResult = `# Review Analysis for "${selectedBook.title}"

## Common Praise
- "Exceptional depth of coverage on the subject matter" (mentioned in 28% of positive reviews)
- "Clear and accessible writing style" (mentioned in 35% of positive reviews)
- "Practical examples that illustrate key concepts" (mentioned in 42% of positive reviews)
- "Comprehensive treatment of advanced topics" (mentioned in 19% of positive reviews)

## Common Criticism
- "Some sections feel unnecessarily technical" (mentioned in 15% of negative reviews)
- "More visual aids would improve understanding" (mentioned in 23% of negative reviews)
- "Index could be more comprehensive" (mentioned in 12% of negative reviews)
- "Certain examples feel outdated" (mentioned in 18% of negative reviews)

## Reader Expectations
- Readers expect practical applications they can implement immediately
- Many readers are looking for solutions to specific problems in their field
- Readers value clear explanations of complex topics
- There is high demand for up-to-date information and current best practices

## Unfulfilled Needs
- More step-by-step tutorials for beginners
- Additional resources for further learning
- More coverage of emerging trends in the field
- Supplementary online materials to extend the book's value

## Content Gaps
- Limited coverage of international perspectives
- Insufficient treatment of ethical considerations
- Lack of discussion on future developments in the field
- Few connections to related disciplines

## Improvement Opportunities
1. Develop companion online resources with updated examples
2. Add a "Frequently Asked Questions" section addressing common reader questions
3. Expand the index for improved navigation
4. Include more case studies reflecting diverse applications
5. Create a visual summary for each chapter to reinforce key points`;
    } else {
      mockResult = `# Analysis of "${selectedBook.title}"

## Overview
This ${selectedBook.category} book by ${selectedBook.author} demonstrates strong potential in its market category. Published relatively recently, it has garnered significant attention with an average rating of ${selectedBook.bookbeam_data?.averageRating || 4.2} stars across ${selectedBook.bookbeam_data?.reviewCount || 48} reviews.

## Key Findings
- The book ranks reasonably well with a BSR of ${selectedBook.bsr?.kindle || 'Unknown'} in Kindle
- Content quality is generally praised for its depth and clarity
- The author's approach resonates well with the target audience
- There are several opportunities for optimization in marketing and positioning

## Strengths
- Strong reader engagement based on review sentiment analysis
- Effective positioning within its primary category
- Competitive pricing strategy compared to similar titles
- Comprehensive coverage of the subject matter

## Areas for Improvement
- More targeted marketing to reach ideal reader demographics
- Additional supplementary materials could enhance value proposition
- Potential for expanded distribution in specialized channels
- Review keywords suggest opportunities for optimized metadata

## Recommendations
1. Refine marketing copy to highlight most praised aspects
2. Consider releasing an updated edition addressing common criticisms
3. Explore bundle opportunities with complementary titles
4. Leverage positive reviews in promotional materials
5. Test alternative categorization to improve discovery`;
    }
    
    // Simulate streaming by adding text gradually
    const words = mockResult.split(' ');
    
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + ' ';
      researchResults.value += chunk;
      await new Promise(resolve => setTimeout(resolve, 100)); // Delay between chunks
    }
    
    researchComplete.value = true;
    
    toaster.show({
      title: 'Research Complete',
      message: 'Deep research analysis has been generated',
      color: 'success',
      icon: 'ph:check-circle-duotone',
      closable: true,
    });
  } catch (err) {
    console.error('Error conducting research:', err);
    toaster.show({
      title: 'Error',
      message: err.message || 'Failed to conduct research',
      color: 'danger',
      icon: 'ph:warning-circle-duotone',
      closable: true,
    });
  } finally {
    isResearching.value = false;
  }
};

// Reset form
const resetForm = () => {
  selectedResearchId.value = '';
  selectedBookId.value = '';
  researchPrompt.value = '';
  customPrompt.value = '';
  showCustomPrompt.value = false;
  researchResults.value = '';
  researchComplete.value = false;
};

// Save research
const saveResearch = () => {
  toaster.show({
    title: 'Research Saved',
    message: 'Your research has been saved successfully',
    color: 'success',
    icon: 'ph:check-circle-duotone',
    closable: true,
  });
};
</script>

<template>
  <div class="space-y-6 pb-20 pt-4">
    <!-- Header -->
    <div>
      <BaseHeading tag="h1" size="xl" weight="semibold" class="text-muted-800 dark:text-white">
        Deep Research
      </BaseHeading>
      <BaseParagraph size="xs" class="text-muted-400">
        Conduct AI-powered deep research on books in your collection
      </BaseParagraph>
    </div>
    
    <!-- Main content -->
    <div class="grid grid-cols-12 gap-6">
      <!-- Research form -->
      <div class="col-span-12 md:col-span-5 lg:col-span-4">
        <BaseCard class="p-6">
          <form @submit.prevent="conductResearch">
            <!-- Research project selection -->
            <div class="mb-5">
              <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-2">
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
                :disabled="loadingProjects || isResearching"
                required
              />
            </div>
            
            <!-- Book selection -->
            <div class="mb-5">
              <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-2">
                Select Book
              </BaseHeading>
              <BaseSelect
                v-model="selectedBookId"
                :items="booksInResearch.map(b => ({ 
                  value: b.id, 
                  label: b.title 
                }))"
                placeholder="Select a book to research"
                shape="rounded"
                :loading="loadingBooks"
                :disabled="loadingBooks || !selectedResearchId || isResearching"
                required
              />
            </div>
            
            <!-- Research prompt templates -->
            <div class="mb-5">
              <BaseHeading tag="h3" size="md" weight="medium" class="text-muted-800 dark:text-white mb-2">
                Research Type
              </BaseHeading>
              <div class="space-y-2">
                <div v-for="template in promptTemplates" :key="template.id">
                  <BaseRadio
                    :model-value="researchPrompt === template.prompt"
                    name="prompt-template"
                    :label="template.label"
                    color="primary"
                    :disabled="isResearching"
                    @click="selectPromptTemplate(template.id)"
                  />
                </div>
                
                <!-- Custom prompt option -->
                <div class="mt-3">
                  <div class="flex items-center mb-2">
                    <BaseRadio
                      v-model="showCustomPrompt"
                      name="custom-prompt"
                      label="Custom Research Prompt"
                      color="primary"
                      :disabled="isResearching"
                    />
                  </div>
                  <div v-if="showCustomPrompt">
                    <BaseTextarea
                      v-model="customPrompt"
                      placeholder="Enter your custom research prompt..."
                      rows="3"
                      shape="rounded"
                      :disabled="isResearching"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Buttons -->
            <div class="flex justify-end gap-2 mt-6">
              <BaseButton
                type="button"
                color="muted"
                @click="resetForm"
                :disabled="isResearching"
              >
                Reset
              </BaseButton>
              <BaseButton
                type="submit"
                color="primary"
                :loading="isResearching"
                :disabled="isResearching || !selectedBookId || (!researchPrompt && !customPrompt)"
              >
                <Icon v-if="!isResearching" name="ph:brain-duotone" class="me-2 size-4" />
                <span>{{ isResearching ? 'Researching...' : 'Conduct Research' }}</span>
              </BaseButton>
            </div>
          </form>
        </BaseCard>
      </div>
      
      <!-- Research results -->
      <div class="col-span-12 md:col-span-7 lg:col-span-8">
        <BaseCard class="p-6 h-full">
          <div class="mb-4 flex justify-between items-center">
            <BaseHeading tag="h2" size="lg" weight="semibold" class="text-muted-800 dark:text-white">
              Research Results
            </BaseHeading>
            <div class="flex gap-2" v-if="researchComplete">
              <BaseButton color="primary" @click="saveResearch">
                <Icon name="ph:floppy-disk-duotone" class="me-2 size-4" />
                <span>Save</span>
              </BaseButton>
              <BaseButton color="default">
                <Icon name="ph:export-duotone" class="me-2 size-4" />
                <span>Export</span>
              </BaseButton>
            </div>
          </div>
          
          <!-- Loading -->
          <div v-if="isResearching" class="flex justify-center items-center h-96">
            <div class="flex flex-col items-center gap-4">
              <BaseButtonIcon
                size="xl"
                disabled
                shape="full"
                class="animate-spin text-primary-500"
              >
                <Icon name="line-md:loading-twotone-loop" class="size-8" />
              </BaseButtonIcon>
              <BaseHeading tag="h4" size="md" weight="medium" class="text-muted-800 dark:text-white">
                Analyzing Book Data...
              </BaseHeading>
              <BaseParagraph size="xs" class="text-muted-400">
                Our AI is reviewing content, market position, and reader feedback
              </BaseParagraph>
            </div>
          </div>
          
          <!-- Empty state -->
          <div v-else-if="!researchResults" class="flex justify-center items-center h-96 text-center">
            <div class="max-w-md">
              <BaseIconBox
                size="xl"
                class="bg-info-500/10 text-info-500 mx-auto mb-4"
                shape="rounded"
                color="none"
              >
                <Icon name="ph:brain-duotone" class="size-8" />
              </BaseIconBox>
              <BaseHeading tag="h4" size="lg" weight="medium" class="text-muted-800 dark:text-white mb-2">
                No Research Results Yet
              </BaseHeading>
              <BaseParagraph size="sm" class="text-muted-400">
                Select a book from your research project and choose a research type to get started.
                Our AI will analyze the book and provide detailed insights based on your selection.
              </BaseParagraph>
            </div>
          </div>
          
          <!-- Results -->
          <div v-else class="prose dark:prose-invert max-w-none overflow-auto h-[600px] research-output">
            <div v-html="$mdRenderer.render(researchResults)"></div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.research-output :deep(h1) {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: var(--color-primary-500);
}

.research-output :deep(h2) {
  font-size: 1.4rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--color-muted-800);
}

.research-output :deep(h3) {
  font-size: 1.2rem;
  margin-top: 1.2rem;
  margin-bottom: 0.5rem;
}

.research-output :deep(ul),
.research-output :deep(ol) {
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.research-output :deep(li) {
  margin-bottom: 0.25rem;
}

.dark .research-output :deep(h2) {
  color: var(--color-muted-200);
}
</style>
