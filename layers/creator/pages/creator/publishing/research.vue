<script setup lang="ts">

import { formatFileSize, formatRelativeTime, getFileIcon, getModelAvatar } from '~/utils/format'

  definePageMeta({
  title: "Research",
    preview: {
    title: "Category Research",
    description: "Research and analyze books in your category",
    categories: ["publishing"],
  },
})

const {loadResearch, research, error, loading, createResearch, loadResearchByCategorySubCategoryAndType, defaultBookResearchCategories, researches, showUploadFiles, handleUse, handleFileDownload } = useResearch()
const { researchExamplesBooks, useFireCrawlBook, createExampleBook, deleteExampleBook, updateExampleBook } = usePublishing()
const { deepResearch } = useBookResearch()

const showScrapeBook = ref(false)
const bookUrls = ref<string[]>([])
const bookUrl = ref<string>('')

const addBookUrl = () => {
  bookUrls.value.push(bookUrl.value)
  bookUrl.value = ''
}

const removeBookUrl = (url: string) => {
  bookUrls.value = bookUrls.value.filter((u) => u !== url)
}

const researchConversations = computed(() => {
  return researchExamplesBooks.value.map((item)=> {
    console.log('ITEM', item)
    if(item.perplexity) {
      console.log('PERPLEXITY', item.perplexity)
      return item.perplexity
    }
    return null
  })
})
</script>

<template>
  <div>
    <Modal
    :open="showUploadFiles"
    size="3xl"
    @close="showUploadFiles = false"
  >
    <template #header>
      <!-- Header -->
      <div class="flex w-full items-center justify-between p-4 md:p-6">
        <h3
          class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
        >
          Upload files
        </h3>

        <BaseButtonClose @click="showUploadFiles = false" />
      </div>
    </template>
    <div
      class="nui-slimscroll max-h-[90vh] overflow-y-auto px-4 pb-4 md:px-6 md:pb-6"
    >
      <Uploads @use="handleUse" />
    </div>
    </Modal>

    <Modal
    :open="showScrapeBook"
    size="3xl"
    @close="showScrapeBook = false"
  >
    <template #header>
      <!-- Header -->
      <div class="flex w-full items-center justify-between p-4 md:p-6">
        <h3
          class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
        >
          Scrape book
        </h3>

        <BaseButtonClose @click="showUploadFiles = false" />
      </div>
    </template>
    <div
      class="nui-slimscroll max-h-[90vh] overflow-y-auto px-4 pb-4 md:px-6 md:pb-6"
    >
      <div class="flex items-center gap-2">
        <BaseInput v-model="bookUrl" placeholder="Enter book URL" />
        <BaseButtonIcon @click="addBookUrl">
          <Icon name="ph:plus-bold" class="size-5" />
        </BaseButtonIcon>
      </div>
      <div v-for="url in bookUrls" :key="url">
        <span>{{ url }}</span>
        <BaseButtonIcon @click="removeBookUrl(url)">
          <Icon name="ph:x-bold" class="size-5" />
        </BaseButtonIcon>
      </div>
      <BaseButton @click="useFireCrawlBook(bookUrls)">Scrape</BaseButton>
    </div>
    </Modal>
    <!-- Show error if exists -->
    <BaseMessage
      v-if="error"
      type="error"
      class="mb-4"
    >
      {{ error }}
    </BaseMessage>

    <!-- Show loading state -->
    <BasePlaceholderPage
      v-if="loading"
      :title="'Loading...'"
      :subtitle="'Please wait while we load the research'"
    />

    <!-- Rest of the template -->
    <div v-else-if="research">
    <!-- Header -->
    <div class="mb-8 flex flex-col justify-between md:flex-row md:items-center">
      <div
        class="ltablet:max-w-full flex max-w-[425px] flex-col items-center gap-4 text-center md:flex-row md:text-left lg:max-w-full"
      >
        <BaseAvatar src="/img/avatars/2.svg" size="lg" />
        <div>
          <BaseHeading
            as="h2"
            size="2xl"
            weight="light"
            lead="tight"
            class="text-muted-800 dark:text-white"
          >
              <span>{{ research.main_category }}</span>
          </BaseHeading>
          <BaseParagraph>
              <span class="text-muted-500">
                {{ research.sub_category ? `Research for ${research.sub_category}` : 'Select a sub-category' }}
              </span>
          </BaseParagraph>
        </div>
      </div>
      <div
        class="mt-4 flex items-center justify-center gap-2 md:mt-0 md:justify-start"
      >
        <BaseButton v-if="research.type" @click="createResearch({main_category: research.main_category, sub_category: research.sub_category, type: 'book'})">
          <span>Create new research</span>
        </BaseButton>
        <BaseButton @click="showScrapeBook = true">
          <span>Scrape book</span>
        </BaseButton>
        <BaseButton 
          v-if="research.id" 
          color="info" 
          :to="`/publishing/book-research?id=${research.id}`"
        >
          <Icon name="ph:brain-duotone" class="mr-1 size-5" />
          <span>AI Research</span>
        </BaseButton>
        <BaseButton color="primary">
          <span>Schedule</span>
        </BaseButton>
      </div>
    </div>

      <!-- Add sub-category selection if not yet selected -->
      <div v-if="!research.type" class="mb-8">
        <BaseHeading as="h2" size="2xl" class="mb-4">
          Select Sub-Category
        </BaseHeading>
        <div class="grid grid-cols-3 gap-4">
          <BaseCard 
            v-for="sub in defaultBookResearchCategories" 
            :key="sub.name"
            class="p-4 cursor-pointer hover:bg-muted-100 dark:hover:bg-muted-900"
            @click="loadResearchByCategorySubCategoryAndType(research.main_category, 'book', sub.name)"
          >
            <h3 class="text-lg font-medium">{{ sub.name }}</h3>
            <p class="text-sm text-muted-500">{{ sub.description }}</p>
          </BaseCard>
        </div>
      </div>

   
      <div class="grid grid-cols-3 gap-4">
          <BaseCard 
            v-for="research in researches" 
            :key="research.id"
            class="p-4 cursor-pointer hover:bg-muted-100 dark:hover:bg-muted-900"
            @click="loadResearch(research.id)"
          >
            <h3 class="text-lg font-medium">{{ research.main_category }}</h3>
            <p class="text-sm text-muted-500">{{ research.sub_category }}</p>
          </BaseCard>
        </div>
      <!-- Show research content only when sub-category is selected -->
      <div v-if="research.id">


    <!-- Grid -->
    <div class="ltablet:gap-4 grid grid-cols-12 gap-6 mt-4">
      <!-- Book Card -->
      <div
            v-for="(book, index) in researchExamplesBooks"
        :key="index"
        class="ltablet:col-span-4 relative col-span-12 sm:col-span-6 lg:col-span-4"
      >
        <BaseCard rounded="lg" class="flex h-full flex-col p-6">
          <div class="mb-6">
            <BaseTag color="primary" v-for="category in book.categories" class="mr-1 mb-1">
              <span>{{ category }}</span>
            </BaseTag>
          </div>
          <div class="mb-6">
            <BaseHeading
              as="h3"
              size="lg"
              weight="medium"
              lead="tight"
              class="mb-2"
            >
              <span class="text-muted-800 dark:text-muted-100">
                {{ book.title }}
              </span>
            </BaseHeading>
            <BaseHeading
              as="h5"
              size="sm"
              lead="tight"
              class="mb-2"
            >
              <span class="text-muted-800 dark:text-muted-100">
                {{ book.subtitle }}
              </span>
            </BaseHeading>
            <BaseParagraph size="sm" class="text-muted-500 dark:text-muted-400">
              <span>{{ book.description }}</span>
            </BaseParagraph>
          </div>
          <div class="mb-8 mt-auto flex items-center justify-between">
            <BaseAvatarGroup :avatars="book.authors" :limit="3" size="sm" />
            <div>
              <BaseButtonAction @click="deepResearch(book)" :color="book.perplexity ? 'info' : 'primary'">
                <span>Deep Research</span>
              </BaseButtonAction>
            </div>
          </div>
          <div class="mb-8">
            <BaseHeading
              as="h4"
              size="md"
              weight="medium"
              lead="tight"
              class="text-muted-800 dark:text-muted-100 mb-2"
            >
              <span>Formats {{ book.format }}</span>
            </BaseHeading>
            <div class="flex gap-6">
              <div class="text-muted-400 flex items-center gap-1">
                <Icon name="ph:calendar-check-duotone" class="size-5" />
                <span class="font-sans text-sm">{{ book.publication_date }}</span>
              </div>
              <div class="text-muted-400 flex items-center gap-1">
                <Icon name="ph:chat-circle-dots-duotone" class="size-5" />
                <span class="font-sans text-sm">
                  {{ book.comments.length }} comments
                </span>
              </div>

              <div class="text-muted-400 flex items-center gap-1">
                <Icon name="ic:baseline-star" class="size-5" />
                <span class="font-sans text-sm">
                  {{ book.reviews.length }} reviews
                </span>
              </div>
            </div>
          </div>
          <div class="mb-8">
            <BaseHeading
              as="h4"
              size="md"
              weight="medium"
              lead="tight"
              class="text-muted-800 dark:text-muted-100 mb-2"
            >
              <span>{{ book.publisher }}</span>
            </BaseHeading>
            <div class="flex gap-6">
              <div class="text-muted-400 flex items-center gap-1">
                <Icon name="ph:calendar-check-duotone" class="size-5" />
                <span class="font-sans text-sm">
                  {{ book.language }} — {{ book.weight }} - {{ book.price }}
                </span>
              </div>
            </div>
          </div>
          <div class="mt-4">
            <div v-if="book.id" class="flex space-x-2">
              <BaseButton color="primary" rounded="lg" class="w-full" v-if="book.id" @click="updateExampleBook(book)">
              <span>Update Book</span>
            </BaseButton>
            <BaseButtonIcon color="warning" rounded="lg" class=""  @click="deleteExampleBook(book.id)">
             <Icon name="ph:trash-duotone" class="size-5" />
            </BaseButtonIcon>
            </div>
           
            <BaseButton color="primary" rounded="lg" class="w-full" v-else @click="createExampleBook(book)">
              <span>Save Book</span>
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </div>
    <!-- Grid -->
    <div class="ltablet:gap-x-4 mt-10 grid grid-cols-12 gap-x-6 gap-y-12">
      <!-- Column -->
      <div class="ltablet:col-span-4 col-span-12 lg:col-span-4">
        <div class="mb-4">
              <div class="flex items-center justify-between">
          <BaseHeading
            as="h2"
            size="lg"
            weight="light"
            lead="tight"
            class="text-muted-800 dark:text-white"
          >
                <span>Research files for {{ research.sub_category }}</span>
          </BaseHeading>

              <BaseButtonIcon v-if="!showUploadFiles" @click="showUploadFiles = true">
                <Icon name="ph:upload-simple-duotone" class="size-5" />
              </BaseButtonIcon>
              </div>
             
          <BaseParagraph size="sm">
            <span class="text-muted-500">
                  Files you will need for research
            </span>
          </BaseParagraph>


        </div>
        <div class="space-y-4">
          <BaseCard
                v-for="file in research?.research_files"
                :key="file.id"
            rounded="lg"
            class="p-4"
          >
            <div class="flex w-full items-center gap-3">
                  <img 
                    :src="getFileIcon(file.type)" 
                    :alt="file.name" 
                    class="size-10 shrink-0" 
                  />
                  <div class="flex-1">
                <BaseHeading
                  as="h2"
                  size="md"
                  weight="light"
                  lead="tight"
                  class="text-muted-800 dark:text-white"
                >
                  <span>{{ file.name }}</span>
                </BaseHeading>
                    <div class="flex items-center gap-2 text-xs text-muted-400">
                      <span>{{ formatFileSize(file.size) }}</span>
                      <span>•</span>
                      <span>{{ formatRelativeTime(file.created_at) }}</span>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <BaseButton
                      color="primary"
                      variant="solid"
                      @click="handleFileDownload(file.url)"
                    >
                      <Icon name="ph:download-bold" class="size-4" />
                    </BaseButton>
                  </div>
              </div>
              </BaseCard>

              <div v-if="!research?.research_files?.length" class="text-center py-4">
                <p class="text-muted-400">No files uploaded yet</p>
              </div>
        </div>
      </div>
      <!-- Column -->
      <div class="ltablet:col-span-8 col-span-12 lg:col-span-8">
        <div class="mb-4">
          <BaseHeading
            as="h2"
            size="lg"
            weight="light"
            lead="tight"
            class="text-muted-800 dark:text-white"
          >
            <span>Insights</span>
          </BaseHeading>
          <BaseParagraph size="sm">
            <span class="text-muted-500">Insights of the research</span>
          </BaseParagraph>
        </div>
        <div class="space-y-2">
          <FlexTableRow
                v-for="(student, studentIndex) in researchConversations"
            :key="studentIndex"
            rounded="lg"
            spaced
          >
            <template #start>
              <FlexTableStart
                label="Student"
                hide-label
                :title="student?.model"
                :subtitle="student?.completion"
                :avatar="student?.avatar"
              />
            </template>
            <template #end>
              <!-- <FlexTableCell label="location" hide-label class="w-full sm:w-32">
                <span
                  class="text-muted-500 dark:text-muted-400 line-clamp-1 font-sans text-sm"
                >
                  {{ student. }}
                </span>
              </FlexTableCell>
              <FlexTableCell label="status" hide-label class="w-full sm:w-16">
                <BaseTag
                  :color="student?.status === 'Online' ? 'success' : 'muted'"
                  rounded="full"
                  variant="pastel"
                  size="sm"
                >
                  {{ student?.status }}
                </BaseTag>
              </FlexTableCell> -->
              <FlexTableCell label="location" hide-label class="w-full ">
                <span
                  class="text-muted-500 dark:text-muted-400 font-sans text-sm"
                  v-for="(choice, choiceIndex) in student?.choices" :key="choiceIndex"
                >
                  {{ choice?.message.content }}
                </span>
              </FlexTableCell>
              <FlexTableCell label="action" hide-label>
                <BaseButtonAction>Chat</BaseButtonAction>
              </FlexTableCell>
            </template>
          </FlexTableRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
