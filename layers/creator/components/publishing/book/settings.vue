<script setup lang="ts">


const { book, BookSizeOptions } = usePublishing()

// Watch BSR changes and update conditions
watch(() => book.value?.bsrCriteria, (newBsr) => {
  if (!newBsr) return

  // Update Kindle condition
  newBsr.kindle.condition = newBsr.kindle.amount < newBsr.kindle.less

  // Update Paperback condition
  newBsr.paperback.condition = newBsr.paperback.amount < newBsr.paperback.less

  // Update Audible condition
  newBsr.audible.condition = newBsr.audible.amount < newBsr.audible.less
}, { deep: true })

useHead({
  title: 'Project info',
})

const avatarPreview = useNinjaFilePreview(() => book.value.avatar)

// BaseInputFileHeadless gives us a listfile input, but we need to
// extract the file from the list and set it to the form
const inputFile = ref<FileList | null>(null)
watch(inputFile, (value) => {
  const file = value?.item(0) || null
  if (book.value) {
    book.value.avatar = file
  }
})

const bsrPercentage = computed(() => {
  if (!book.value) return { kindle: 0, paperback: 0, audible: 0 }
  return {
    kindle:
      (book.value.bsrCriteria.kindle.amount
      / book.value.bsrCriteria.kindle.less)
      * 100,
    paperback:
      (book.value.bsrCriteria.paperback.amount
      / book.value.bsrCriteria.paperback.less)
      * 100,
    audible:
      (book.value.bsrCriteria.audible.amount
      / book.value.bsrCriteria.audible.less)
      * 100,
  }
})

const bsrRatingLowGoodOutOfFive = computed(() => {
  return {
    kindle: () => {
      if (!book.value) return 0
      const amount = book.value.bsrCriteria.kindle.amount
      if (amount > 30000) return 1
      else if (amount > 20000) return 2
      else if (amount > 10000) return 3
      else if (amount > 5000) return 4
      else return 5
    },
    paperback: () => {
      if (!book.value) return 0
      const amount = book.value.bsrCriteria.paperback.amount
      if (amount > 80000) return 1
      else if (amount > 60000) return 2
      else if (amount > 40000) return 3
      else if (amount > 20000) return 4
      else return 5
    },
    audible: () => {
      if (!book.value) return 0
      const amount = book.value.bsrCriteria.audible.amount
      if (amount > 20000) return 1
      else if (amount > 15000) return 2
      else if (amount > 10000) return 3
      else if (amount > 5000) return 4
      else return 5
    }
  }
})

const addNewExample = () => {
  if (book.value) {
    book.value.examples.push({
      id: crypto.randomUUID(),
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
  }
}
</script>

<template>
  <div>
    <div class="mx-auto flex w-full flex-col gap-3 px-4">
      <div class="grid grid-cols-12 gap-6">
        <div class="ltablet:col-span-8 col-span-12 lg:col-span-8">
          <BaseCard shape="rounded" class="p-4 md:p-8">
            <div class="grid grid-cols-1 gap-4 gap-y-2 text-sm lg:grid-cols-12">
              <div class="col-span-12 mb-10 text-gray-600 sm:col-span-3 sm:mb-0">
                <BaseHeading
                  as="h2"
                  size="lg"
                  weight="medium"
                >
                  {{ book.category }}
                </BaseHeading>
                <BaseText
                  size="xs"
                  class="text-muted-400"
                >
                  Fill in the required fields
                </BaseText>
              </div>

              <div
                class="ltablet:col-span-9 col-span-12 space-y-10 lg:col-span-9"
              >
                <FormGroup
                  label="General info"
                  sublabel="Some general information"
                >
                <div class="col-span-12 md:col-span-6">

                    <BaseInput
                      label="Title"
                      icon="ph:user-duotone"
                      placeholder="Ex: Harry Potter"
                     v-model="book.title"
                      type="text"
                    />
                </div>

                <div class="col-span-12 md:col-span-6">
                    <BaseInput
                      label="Author"
                      icon="ph:user-duotone"
                      placeholder="Ex: J.K Rowling"
                     v-model="book.author"
                      type="text"
                    />
                </div>

                <div class="col-span-12 md:col-span-6">
                    <BaseInput
                      label="ISBN"
                      icon="ph:user-duotone"
                      placeholder="Ex: J.K Rowling"
                     v-model="book.isbn"
                      type="text"
                    />
                </div>



                <div class="col-span-12 md:col-span-6">

                    <BaseInput
                      label="Email Address"
                      icon="ph:envelope-duotone"
                      placeholder="Ex: johndoe@gmail.com"
                     v-model="book.email"
                      type="email"
                    />
                </div>

                <div class="col-span-12 md:col-span-6">

                    <BaseSelect
                      label="Size"
                      icon="ph:first-aid-duotone"
                      v-model="book.size"
                    >
                      <option value="" hidden />
                      <option :value="size" v-for="size in BookSizeOptions" :key="size">
                        {{ size }}
                      </option>

                    </BaseSelect>
                </div>

                <div class="col-span-12">

                    <AddonInputPhone
                      ref="inputPhoneRef"
                      label="Contact Phone"
                      placeholder="Ex: +1 555 555 5555"
                      icon="lucide:phone"
                      v-model="book.contactPhone"
                    />
                </div>

                <div class="col-span-12">

                    <BaseTextarea
                      label="Comments"
                      placeholder="Ex: Lorem ipsum dolor sit amet"
                      rows="3"
                      v-model="book.comments"
                    />
                </div>
                <div class="col-span-12 md:col-span-4">
                      <BaseInput
                        v-model="book.search.amount"
                        label="Search"
                        icon="ph:search-duotone"
                        placeholder="Ex: 10000"
                      />
                    </div>



                  <div class="grid grid-cols-12 gap-4">

                    <div class="col-span-12 md:col-span-4">
                      <BaseInput
                        v-model="book.bsrCriteria.paperback.amount"
                        type="number"
                        label="Bsr Rating Paperback"
                        icon="ph:trophy-duotone"
                        placeholder="Ex: 10000"
                      />
                    </div>

                    <div class="col-span-12 md:col-span-4">
                      <BaseInput
                        v-model="book.bsrCriteria.kindle.amount"
                        type="number"
                        label="Bsr Rating Kindle"
                        icon="ph:trophy-duotone"
                        placeholder="Ex: 10000"
                      />
                    </div>

                    <div class="col-span-12 md:col-span-4">
                      <BaseInput
                        v-model="book.bsrCriteria.audible.amount"
                        type="number"
                        label="Bsr Rating Audible"
                        icon="ph:star-duotone"
                        placeholder="Ex: 10000"
                      />
                    </div>
                  </div>
                </FormGroup>

                <FormGroup
                  label="Examples"
                  sublabel="Add example books to analyze"
                >
                <div v-if="book.examples && book.examples.length > 0">
                  <div v-for="example in book.examples" :key="example.id" class="mb-6">
                    <div class="grid grid-cols-12 gap-4">
                      <div class="col-span-12">
                        <BaseInput
                          v-model="example.title"
                          label="Title"
                          icon="ph:book-open-duotone"
                          placeholder="Ex: The Art of War"
                        />
                      </div>
                      <div class="col-span-12">
                        <BaseInput
                          v-model="example.subtitle"
                          label="Subtitle"
                          icon="ph:book-open-duotone"
                          placeholder="Ex: Ancient Wisdom for Modern Success"
                        />
                      </div>
                      <div class="col-span-12">
                        <BaseTextarea
                          v-model="example.description"
                          label="Description"
                          icon="ph:book-open-duotone"
                          placeholder="Enter book description..."
                          rows="3"
                        />
                      </div>
                      <div class="col-span-12 md:col-span-6">
                        <BaseInput
                          v-model="example.author"
                          label="Author"
                          icon="ph:user-duotone"
                          placeholder="Ex: Sun Tzu"
                        />
                      </div>
                      <div class="col-span-12 md:col-span-6">
                        <BaseInput
                          v-model="example.link"
                          label="Amazon Link"
                          icon="ph:link-duotone"
                          placeholder="https://amazon.com/..."
                        />
                      </div>
                      <div class="col-span-12">
                        <BaseInput
                          v-model="example.cover"
                          type="text"
                          label="Cover"
                          icon="ph:paper-plane-tilt-duotone"
                          placeholder="Ex: 912656"
                        />
                      </div>
                      <div class="col-span-12">
                        <div
                          class="bg-muted-100 dark:bg-muted-700/70 flex items-center gap-2 rounded-lg p-4"
                        >
                          <BaseAvatar
                            size="xs"
                            :src="example.cover"
                          />
                          <BaseText
                            size="sm"
                            class="text-muted-500 dark:text-muted-400"
                          >
                            {{ example.author }}
                          </BaseText>
                          <div class="ms-auto">
                            <NuxtLink
                              to="#"
                              class="text-primary-500 font-sans text-sm underline-offset-4 hover:underline"
                            >
                              Change
                            </NuxtLink>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-4">
                  <BaseButton @click="addNewExample" icon="ph:plus-duotone">
                    Add Example Book
                  </BaseButton>
                </div>
                </FormGroup>
              </div>
            </div>
          </BaseCard>
        </div>
        <div class="ltablet:col-span-4 col-span-12 lg:col-span-4">
          <BaseCard class="ptablet:p-8 p-6 lg:p-8">
            <BaseText
              size="xs"
              weight="medium"
              class="text-muted-400 mb-6 block uppercase tracking-wider"
            >
              Book examples
            </BaseText>
            <div class="mb-4 flex">
              <div class="grow">
                <BaseHeading
                  as="h3"
                  weight="medium"
                >
                  {{ book.category }}
                </BaseHeading>
                <BaseText
                  size="sm"
                  class="text-muted-400"
                >
                  {{ book.category }}
                </BaseText>
              </div>
              <div class="shrink-0">
                <BaseAvatar size="lg" src="/img/avatars/20.svg" />
              </div>
            </div>

            <div
              class="divide-muted-200 dark:divide-muted-700 flex w-full items-center divide-x py-6"
            >
              <div class="xxl:pe-6 flex flex-1 flex-col gap-1 pe-4">
                <BaseHeading
                  as="h3"
                  size="sm"
                  weight="medium"
                  lead="none"
                >
                  {{
                    book?.bsrCriteria.paperback.amount === null ? "n/a" : book?.bsrCriteria.paperback.amount
                  }}
                </BaseHeading>
                <BaseText size="xs" class="text-muted-400">
               Paperback
                </BaseText>
              </div>
              <div class="xxl:px-6 flex flex-1 flex-col gap-1 px-4">
                <BaseHeading
                  as="h3"
                  size="sm"
                  weight="medium"
                  lead="none"
                >
                {{
                  book?.bsrCriteria.kindle.amount === null ? "n/a" : book?.bsrCriteria.kindle.amount
                }}
                  {{
                   bsrRatingLowGoodOutOfFive.kindle()
                  }}
                </BaseHeading>
                <BaseText size="xs" class="text-muted-400">
                 Kindle
                </BaseText>
              </div>
              <div class="xxl:ps-6 flex flex-1 flex-col gap-1 ps-4">
                <BaseHeading
                  as="h3"
                  size="sm"
                  weight="medium"
                  lead="none"
                >
                {{
                  book?.bsrCriteria.audible.amount === null ? "n/a" : book?.bsrCriteria.audible.amount
                }}
                </BaseHeading>
                <BaseText size="xs" class="text-muted-400">
                Audible
                </BaseText>
              </div>
            </div>
            <div>
              <Rating
                rating-text="Kindle"
                current-rating-text="Current rating"
                :current-rating="bsrRatingLowGoodOutOfFive.kindle()"
              />

              <Rating
                rating-text="Paperback"
                current-rating-text="Current rating"
                :current-rating="bsrRatingLowGoodOutOfFive.paperback()"
              />

              <Rating
                rating-text="Audible"
                current-rating-text="Current rating"
                :current-rating="bsrRatingLowGoodOutOfFive.audible()"
              />
            </div>
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
                      <a v-if="example.link" :href="example.link" target="_blank" class="text-sm text-blue-600 hover:underline">View on Amazon</a>
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
          </BaseCard>
        </div>
      </div>
    </div>
  </div>
</template>
