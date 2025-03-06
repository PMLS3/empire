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
const {book, AmazonBookCategories, BookFormats, BookSizeOptions } = usePublishing()
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
</script>

<template>
  <div class="divide-muted-200 dark:divide-muted-800 space-y-20 py-6">
    <!--Grid-->
    <div class="grid gap-8 md:grid-cols-12">
      <!--Column-->
      <div class="md:col-span-4">
        <BaseHeading
          as="h3"
          size="md"
          weight="medium"
          class="text-muted-800 dark:text-muted-100 mb-1"
        >
          About the book
        </BaseHeading>
        <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
          Some basic information that we need to know about your book, and to
          process legal matters.
        </BaseParagraph>
      </div>
      <!--Column-->
      <div class="md:col-span-8">
        <BaseHeading
          as="h3"
          size="xs"
          weight="medium"
          class="border-muted-200 dark:border-muted-800 text-muted-800 dark:text-muted-100 border-b px-4 pb-4"
        >
          Your book info
        </BaseHeading>
        <div
          class="divide-muted-200 dark:divide-muted-800 flex flex-col divide-y"
        >
          <!--Item-->
          <div class="group">
            <a
              href="#"
              class="font-heading text-muted-600 dark:text-muted-400 hover:bg-muted-50 dark:hover:bg-muted-800 flex items-center gap-4 p-4 text-sm transition-colors duration-300"
            >
              <div>
                <BaseHeading
                  as="h3"
                  size="xs"
                  weight="medium"
                  class="text-muted-400"
                >
                  Book title
                </BaseHeading>
                <BaseText size="sm" v-if="!editsOpen.includes('title')">{{ book.title }}</BaseText>
                <BaseInput v-model="book.title" type="text" v-else />
              </div>
              <Icon name="lucide:edit-3" class="ms-auto size-4" />
              <BaseText
                size="xs"
                weight="semibold"
                class="text-primary-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                @click="editItem('title')"
              >
                Edit
              </BaseText>
            </a>
          </div>
          <!--Item-->
          <div class="group">
            <a
              href="#"
              class="font-heading text-muted-600 dark:text-muted-400 hover:bg-muted-50 dark:hover:bg-muted-800 flex items-center gap-4 p-4 text-sm transition-colors duration-300"
            >
              <div>
                <BaseHeading
                  as="h3"
                  size="xs"
                  weight="medium"
                  class="text-muted-400"
                >
                 Subtitle
                </BaseHeading>
                <BaseText size="sm">{{ book.subtitle }}</BaseText>
              </div>
              <Icon name="lucide:edit-3" class="ms-auto size-4" />
              <BaseText
                size="xs"
                weight="semibold"
                class="text-primary-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                @click="editItem('subtitle')"
              >
                Edit
              </BaseText>
            </a>
          </div>
          <!--Item-->
          <div class="group">
            <a
              href="#"
              class="font-heading text-muted-600 dark:text-muted-400 hover:bg-muted-50 dark:hover:bg-muted-800 flex items-center gap-4 p-4 text-sm transition-colors duration-300"
            >
              <div>
                <BaseHeading
                  as="h3"
                  size="xs"
                  weight="medium"
                  class="text-muted-400"
                >
                  Category
                </BaseHeading>
                <BaseText size="sm" v-if="!editsOpen.includes('category')">{{ book.category }}</BaseText>
                <BaseSelect v-model="book.category" v-else >
                  <option v-for="category in AmazonBookCategories" :value="category">
                    {{ category }}
                  </option>
                </BaseSelect>

              </div>
              <Icon name="lucide:edit-3" class="ms-auto size-4" />
              <BaseText
                size="xs"
                weight="semibold"
                class="text-primary-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                @click="editItem('category')"
                >
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
        <BaseHeading
          as="h3"
          size="md"
          weight="medium"
          class="text-muted-800 dark:text-muted-100 mb-1"
        >
          Additional info
        </BaseHeading>
        <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
          Some useful information that we could need to reach out to you or for
          a few checks.
        </BaseParagraph>
      </div>
      <!--Column-->
      <div class="md:col-span-8">
        <BaseHeading
          as="h3"
          size="xs"
          weight="medium"
          class="border-muted-200 dark:border-muted-800 text-muted-800 dark:text-muted-100 border-b px-4 pb-4"
        >
          Additional info
        </BaseHeading>
        <div
          class="divide-muted-200 dark:divide-muted-800 flex flex-col divide-y"
        >
          <!--Item-->
          <div class="group">
            <a
              href="#"
              class="font-heading text-muted-600 dark:text-muted-400 hover:bg-muted-50 dark:hover:bg-muted-800 flex items-center gap-4 p-4 text-sm transition-colors duration-300"
            >
              <div>
                <BaseHeading
                  as="h3"
                  size="xs"
                  weight="medium"
                  class="text-muted-400"
                >
                 Published date
                </BaseHeading>
                <BaseText size="sm" v-if="!editsOpen.includes('publishedDate')">{{ book.publishedDate }}</BaseText>
                <BaseInput v-model="book.publishedDate" v-else type="date" />
              </div>
              <Icon name="lucide:edit-3" class="ms-auto size-4" />
              <BaseText
                size="xs"
                weight="semibold"
                class="text-primary-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                Edit
              </BaseText>
            </a>
          </div>
          <!--Item-->
          <div class="group">
            <a
              href="#"
              class="font-heading text-muted-600 dark:text-muted-400 hover:bg-muted-50 dark:hover:bg-muted-800 flex items-center gap-4 p-4 text-sm transition-colors duration-300"
            >
              <div>
                <BaseHeading
                  as="h3"
                  size="xs"
                  weight="medium"
                  class="text-muted-400"
                >
                  Size
                </BaseHeading>
                <BaseText size="sm" v-if="!editsOpen.includes('size')">{{ book.size.label }} {{ book.size.dimensions }}</BaseText>
                <BaseSelect
                      label="Size"
                      icon="ph:first-aid-duotone"
                      v-model="book.size"
                      v-else
                    >
                      <option value="" hidden />
                      <option :value="size" v-for="size in BookSizeOptions" :key="size">
                        {{ size.label }} {{ size.dimensions }}
                      </option>

                    </BaseSelect>
              </div>
              <Icon name="lucide:edit-3" class="ms-auto size-4" />
              <BaseText
                size="xs"
                weight="semibold"
                class="text-primary-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                @click="editItem('size')"
                >
                Edit
              </BaseText>
            </a>
          </div>
          <!--Item-->

        </div>
      </div>
    </div>

    <!--Privacy-->
    <div class="grid gap-8 md:grid-cols-12">
      <!--Column-->
      <div class="md:col-span-4">
        <BaseHeading
          as="h3"
          size="md"
          weight="medium"
          class="text-muted-800 dark:text-muted-100 mb-1"
        >
          Space and Page settings
        </BaseHeading>
        <BaseParagraph size="xs" class="text-muted-500 dark:text-muted-400">
          Tell us how you woould like us to handle your personal data and information.
        </BaseParagraph>
      </div>
      <!--Column-->
      <div class="md:col-span-8">
        <BaseHeading
          as="h3"
          size="xs"
          weight="medium"
          class="border-muted-200 dark:border-muted-800 text-muted-800 dark:text-muted-100 border-b px-4 pb-4"
        >
          Page
        </BaseHeading>
        <div
          class="divide-muted-200 dark:divide-muted-800 flex flex-col divide-y"
        >
          <!--Item-->
          <div class="group">
            <div
              class="font-heading text-muted-600 dark:text-muted-400 hover:bg-muted-50 dark:hover:bg-muted-800 flex items-center gap-2 p-4 text-sm transition-colors duration-300"
            >
              <BaseSwitchThin v-model="visibility" />
              <div>
                <BaseHeading
                  as="h3"
                  size="xs"
                  weight="medium"
                  class="text-muted-400"
                  v-if="book.bleed"
                >
                 Bleed
                </BaseHeading>
                <BaseText size="sm">
                  Add extra space to the edges of the book
                </BaseText>
              </div>
            </div>
          </div>
          <!--Item-->
          <div class="group">
            <div
              class="font-heading text-muted-600 dark:text-muted-400 hover:bg-muted-50 dark:hover:bg-muted-800 flex items-center gap-2 p-4 text-sm transition-colors duration-300"
            >
              <BaseSwitchThin v-model="privateMessages" />
              <div>
                <BaseHeading
                  as="h3"
                  size="xs"
                  weight="medium"
                  class="text-muted-400"
                >
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
