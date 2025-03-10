<script setup lang="ts">
definePageMeta({
  title: 'Tiles',
  preview: {
    title: 'Tile grid 2',
    description: 'For item grids and collections',
    categories: ['layouts'],
    src: '/img/screens/layouts-tile-grid-2.png',
    srcDark: '/img/screens/layouts-tile-grid-2-dark.png',
    order: 62,
  },
})

const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const filter = ref('')
const perPage = ref(25)

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const query = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
  }
})

const { data, pending, error, refresh } = await useFetch(
  '/api/company/documents',
  {
    query,
  },
)
</script>

<template>
  <div>
    <ContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          rounded="lg"
          placeholder="Filter files..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
      </template>
      <template #right>
        <BaseButton class="w-full sm:w-32" rounded="lg">
          Manage
        </BaseButton>
        <BaseButton
          color="primary"
          class="w-full sm:w-32"
          rounded="lg"
        >
          <Icon name="lucide:plus" class="size-4" />
          <span>Upload</span>
        </BaseButton>
      </template>
      <div>
        <div v-if="!pending && data?.data.length === 0">
          <BasePlaceholderPage
            title="No matching results"
            subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms."
          >
            <template #image>
              <img
                class="block dark:hidden"
                src="/img/illustrations/placeholders/flat/placeholder-search-5.svg"
                alt="Placeholder image"
              >
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-5-dark.svg"
                alt="Placeholder image"
              >
            </template>
          </BasePlaceholderPage>
        </div>
        <div
          v-else
          class="ltablet:grid-cols-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <TransitionGroup
            enter-active-class="transform-gpu"
            enter-from-class="opacity-0 -translate-x-full"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="absolute transform-gpu"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-full"
          >
            <BaseCard
              v-for="(item, index) in data?.data"
              :key="index"
              rounded="lg"
              class="p-3"
            >
              <div class="flex w-full items-center gap-2">
                <img
                  :src="item.icon"
                  :alt="item.name"
                  class="max-w-[46px]"
                >
                <div>
                  <BaseHeading
                    tag="h3"
                    size="sm"
                    weight="medium"
                  >
                    {{ item.name }}
                  </BaseHeading>
                  <BaseParagraph size="xs" class="text-muted-400">
                    <span>{{ item.size }}</span>
                    <span class="px-1 text-base leading-tight">&middot;</span>
                    <span>v{{ item.version }}</span>
                  </BaseParagraph>
                </div>
                <div class="ms-auto">
                  <BaseDropdown
                    variant="context"
                    label="Dropdown"
                    placement="bottom-end"
                    size="md"
                    class="z-20"
                    rounded="lg"
                  >
                    <BaseDropdownItem
                      to="#"
                      title="Upload"
                      text="Upload a new version"
                    >
                      <template #start>
                        <Icon
                          name="ph:upload-duotone"
                          class="me-2 block size-5"
                        />
                      </template>
                    </BaseDropdownItem>
                    <BaseDropdownItem
                      to="#"
                      title="Download"
                      text="Download this file"
                    >
                      <template #start>
                        <Icon
                          name="ph:download-duotone"
                          class="me-2 block size-5"
                        />
                      </template>
                    </BaseDropdownItem>
                    <BaseDropdownDivider />
                    <BaseDropdownItem
                      to="#"
                      title="Permissions"
                      text="Manage permissions"
                    >
                      <template #start>
                        <Icon
                          name="ph:lock-duotone"
                          class="me-2 block size-5"
                        />
                      </template>
                    </BaseDropdownItem>
                    <BaseDropdownItem
                      to="#"
                      title="Share"
                      text="Share this file"
                    >
                      <template #start>
                        <Icon
                          name="ph:share-duotone"
                          class="me-2 block size-5"
                        />
                      </template>
                    </BaseDropdownItem>
                    <BaseDropdownDivider />
                    <BaseDropdownItem
                      to="#"
                      title="Delete"
                      text="Delete this file"
                    >
                      <template #start>
                        <Icon
                          name="ph:trash-duotone"
                          class="me-2 block size-5"
                        />
                      </template>
                    </BaseDropdownItem>
                  </BaseDropdown>
                </div>
              </div>
            </BaseCard>
          </TransitionGroup>
        </div>
        <div v-if="!pending && data?.data.length !== 0" class="mt-4">
          <BasePagination
            :total-items="data?.total ?? 0"
            :item-per-page="perPage"
            :current-page="page"
            rounded="lg"
          />
        </div>
      </div>
    </ContentWrapper>
  </div>
</template>
