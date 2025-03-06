<script setup lang="ts">
definePageMeta({
  title: 'Preferences',
  preview: {
    title: 'Settings',
    description: 'For settings management',
    categories: ['layouts', 'settings'],
    src: '/img/screens/layouts-settings.png',
    srcDark: '/img/screens/layouts-settings-dark.png',
    order: 37,
    new: true,
  },
})
const { book, AmazonBookCategories, BookFormats, BookSizeOptions } = usePublishing()
const visibility = ref(true)
const privateMessages = ref(true)
const editsOpen = ref([])
const editItem = (item: string) => {
  console.log(item)
  if (editsOpen.value.includes(item)) {
    editsOpen.value = editsOpen.value.filter((i) => i !== item)
  } else {
    editsOpen.value.push(item)
  }
}

const addNewExample = () => {
  if (book.value) {
    book.value.examples.push({
      id: crypto.randomUUID(),
      title: example.value.title,
      subtitle: example.value.subtitle,
      description: example.value.description,
      author: example.value.author,
      link: example.value.link,
      cover: example.value.cover,
      bsr: {
        kindle: example.value.bsr.kindle,
        paperback: example.value.bsr.paperback,
        audible: example.value.bsr.audible,
      },
      chapters: example.value.chapters,
    })
  }
}

const example = ref({
  title: '',
  subtitle: '',
  description: '',
  author: '',
  link: '',
  cover: '',
  bsr: {
    kindle: null,
    paperback: null,
    audible: null,
  },
  chapters: [],
})

const addExample = ref(false)
</script>

<template>
  <div class="divide-muted-200 dark:divide-muted-800 space-y-20 py-6">

    <Modal :open="addExample" size="2xl" footer-align="start" @close="addExample = false">
      <template #header>
        <!-- Header -->
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3
          class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
        >
          Add Example
        </h3>

          <BaseButtonClose @click="addExample = false" />
        </div>
      </template>

      <!-- Body -->
      <div class="p-4 md:p-6">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12">
            <BaseInput v-model="example.title" label="Title" icon="ph:book-open-duotone"
              placeholder="Ex: The Art of War" />
          </div>
          <div class="col-span-12">
            <BaseInput v-model="example.subtitle" label="Subtitle" icon="ph:book-open-duotone"
              placeholder="Ex: Ancient Wisdom for Modern Success" />
          </div>
          <div class="col-span-12">
            <BaseTextarea v-model="example.description" label="Description" icon="ph:book-open-duotone"
              placeholder="Enter book description..." rows="3" />
          </div>
          <div class="col-span-12 md:col-span-6">
            <BaseInput v-model="example.author" label="Author" icon="ph:user-duotone" placeholder="Ex: Sun Tzu" />
          </div>
          <div class="col-span-12 md:col-span-6">
            <BaseInput v-model="example.link" label="Amazon Link" icon="ph:link-duotone"
              placeholder="https://amazon.com/..." />
          </div>
          <div class="col-span-12">
            <BaseInput v-model="example.cover" type="text" label="Cover" icon="ph:paper-plane-tilt-duotone"
              placeholder="Ex: 912656" />
          </div>
          <div class="col-span-12">
            <div class="bg-muted-100 dark:bg-muted-700/70 flex items-center gap-2 rounded-lg p-4">
              <BaseAvatar size="xs" :src="example.cover" />
              <BaseText size="sm" class="text-muted-500 dark:text-muted-400">
                {{ example.author }}
              </BaseText>
              <div class="ms-auto">
                <NuxtLink to="#" class="text-primary-500 font-sans text-sm underline-offset-4 hover:underline">
                  Change
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <!-- Footer -->
        <div class="p-4 md:p-6">
          <div class="flex gap-x-2">
            <BaseButton @click="addExample = false">
              Decline
            </BaseButton>
            <BaseButton color="primary" variant="solid" @click="addNewExample">
              Submit
            </BaseButton>
          </div>
        </div>
      </template>

    </Modal>
    <!--Grid-->
    <div class="grid gap-8 md:grid-cols-12">
      <!--Column-->
      <div class="md:col-span-4">
        <BaseHeading as="h3" size="md" weight="medium" class="text-muted-800 dark:text-muted-100 mb-1">
          About the category BSR
        </BaseHeading>
        <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
          Some basic information that we need to know about your book, and to
          process legal matters.
        </BaseParagraph>
      </div>
      <!--Column-->
      <div class="md:col-span-8">
        <BaseHeading as="h3" size="xs" weight="medium"
          class="border-muted-200 dark:border-muted-800 text-muted-800 dark:text-muted-100 border-b px-4 pb-4">
          Your bsr info
        </BaseHeading>
        <div class="divide-muted-200 dark:divide-muted-800 flex flex-col divide-y">
          <!--Item-->
          <div class="group">
            <a href="#"
              class="font-heading text-muted-600 dark:text-muted-400 hover:bg-muted-50 dark:hover:bg-muted-800 flex items-center gap-4 p-4 text-sm transition-colors duration-300">
              <div>
                <BaseHeading as="h3" size="xs" weight="medium" class="text-muted-400">
                  Kindle
                </BaseHeading>
                <BaseText size="sm" v-if="!editsOpen.includes('kindle')">{{ book.bsrCriteria.kindle.amount }}</BaseText>
                <BaseInput v-model="book.bsrCriteria.kindle.amount" type="number" v-else />
              </div>
              <Icon name="lucide:edit-3" class="ms-auto size-4" />
              <BaseText size="xs" weight="semibold"
                class="text-primary-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                @click="editItem('kindle')">
                Edit
              </BaseText>
            </a>
          </div>
          <!--Item-->
          <div class="group">
            <a href="#"
              class="font-heading text-muted-600 dark:text-muted-400 hover:bg-muted-50 dark:hover:bg-muted-800 flex items-center gap-4 p-4 text-sm transition-colors duration-300">
              <div>
                <BaseHeading as="h3" size="xs" weight="medium" class="text-muted-400">
                  Paperback
                </BaseHeading>
                <BaseText size="sm" v-if="!editsOpen.includes('paperback')">{{ book.bsrCriteria.paperback.amount }}
                </BaseText>
                <BaseInput v-model="book.bsrCriteria.paperback.amount" type="number" v-else />
              </div>
              <Icon name="lucide:edit-3" class="ms-auto size-4" />
              <BaseText size="xs" weight="semibold"
                class="text-primary-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                @click="editItem('paperback')">
                Edit
              </BaseText>
            </a>
          </div>
          <!--Item-->
          <div class="group">
            <a href="#"
              class="font-heading text-muted-600 dark:text-muted-400 hover:bg-muted-50 dark:hover:bg-muted-800 flex items-center gap-4 p-4 text-sm transition-colors duration-300">
              <div>
                <BaseHeading as="h3" size="xs" weight="medium" class="text-muted-400">
                  Audible
                </BaseHeading>
                <BaseText size="sm" v-if="!editsOpen.includes('audible')">{{ book.bsrCriteria.audible.amount }}
                </BaseText>
                <BaseInput v-model="book.bsrCriteria.audible.amount" type="number" v-else />

              </div>
              <Icon name="lucide:edit-3" class="ms-auto size-4" />
              <BaseText size="xs" weight="semibold"
                class="text-primary-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                @click="editItem('category')">
                Edit
              </BaseText>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!--Additional info-->
    <div class="grid gap-8 md:grid-cols-12">
      <!--Column-->
      <div class="md:col-span-4">
        <BaseHeading as="h3" size="md" weight="medium" class="text-muted-800 dark:text-muted-100 mb-1">
          Additional info
        </BaseHeading>
        <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
          Some useful information that we could need to reach out to you or for
          a few checks.
        </BaseParagraph>
      </div>
      <!--Column-->
      <div class="md:col-span-8">
        <BaseHeading as="h3" size="xs" weight="medium"
          class="border-muted-200 dark:border-muted-800 text-muted-800 dark:text-muted-100 border-b px-4 pb-4">
          Additional info
        </BaseHeading>
        <div class="divide-muted-200 dark:divide-muted-800 flex flex-col divide-y">
          <!--Item-->
          <div class="group">
            <a href="#"
              class="font-heading text-muted-600 dark:text-muted-400 hover:bg-muted-50 dark:hover:bg-muted-800 flex items-center gap-4 p-4 text-sm transition-colors duration-300">
              <div>
                <BaseHeading as="h3" size="xs" weight="medium" class="text-muted-400">
                  Searches
                </BaseHeading>
                <BaseText size="sm" v-if="!editsOpen.includes('searches')">{{ book.searches }}</BaseText>
                <BaseInput v-model="book.searches" v-else type="number" />
              </div>
              <Icon name="lucide:edit-3" class="ms-auto size-4" />
              <BaseText size="xs" weight="semibold"
                class="text-primary-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Edit
              </BaseText>
            </a>
          </div>
          <!--Item-->
          <!--Item-->

        </div>
      </div>
    </div>

    <!--Privacy-->
    <div class="grid gap-8 md:grid-cols-12">
      <!--Column-->
      <div class="md:col-span-4">
        <BaseHeading as="h3" size="md" weight="medium" class="text-muted-800 dark:text-muted-100 mb-1">
          Examples
        </BaseHeading>
        <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
          Here are some examples of how you could use your book.
        </BaseParagraph>
      </div>
      <!--Column-->
      <div class="md:col-span-8">
        <div class="flex justify-between">
          <BaseHeading as="h3" size="xs" weight="medium"
            class="border-muted-200 dark:border-muted-800 text-muted-800 dark:text-muted-100 border-b px-4 pb-4">
            Examples
          </BaseHeading>
          <Icon name="mdi:plus" class="ms-auto size-4" @click="addExample = !addExample" />
        </div>

        <div class="divide-muted-200 dark:divide-muted-800 flex flex-col divide-y">
          <!--Item-->
          <div class="group">
            <div v-if="book.examples && book.examples.length > 0" class="space-y-4">
              <div v-for="example in book.examples" :key="example.id" class="border p-4 rounded-lg">
                <div class="grid grid-cols-12 gap-4">
                  <div class="col-span-12">
                    <h3 class="font-medium text-lg">{{ example.title }}</h3>
                    <p class="text-gray-600">{{ example.subtitle }}</p>
                    <div class="mt-2">
                      <p class="text-sm text-gray-700">{{ example.description }}</p>
                    </div>
                    <div class="mt-2 flex items-center gap-4">
                      <span class="text-sm text-gray-600">By {{ example.author }}</span>
                      <a v-if="example.link" :href="example.link" target="_blank"
                        class="text-sm text-blue-600 hover:underline">View on Amazon</a>
                    </div>
                    <div v-if="example.bsr" class="mt-2 grid grid-cols-3 gap-4">
                      <div v-if="example.bsr.kindle" class="text-sm">
                        <span class="font-medium">Kindle BSR:</span> {{ example.bsr.kindle }}
                      </div>
                      <div v-if="example.bsr.paperback" class="text-sm">
                        <span class="font-medium">Paperback BSR:</span> {{ example.bsr.paperback }}
                      </div>
                      <div v-if="example.bsr.audible" class="text-sm">
                        <span class="font-medium">Audible BSR:</span> {{ example.bsr.audible }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-gray-600 py-4">
              No example books added yet
            </div>
          </div>
          <!--Item-->
          <div class="group">
            <div
              class="font-heading text-muted-600 dark:text-muted-400 hover:bg-muted-50 dark:hover:bg-muted-800 flex items-center gap-2 p-4 text-sm transition-colors duration-300">
              <BaseSwitchThin v-model="privateMessages" />
              <div>
                <BaseHeading as="h3" size="xs" weight="medium" class="text-muted-400">
                  Private messages
                </BaseHeading>
                <BaseText size="sm">
                  Make your messages private
                </BaseText>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
