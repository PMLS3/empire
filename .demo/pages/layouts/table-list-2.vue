<script setup lang="ts">
definePageMeta({
  title: 'Table List',
  preview: {
    title: 'Table list 2',
    description: 'For list views and collections',
    categories: ['layouts', 'lists'],
    src: '/img/screens/layouts-table-list-2.png',
    srcDark: '/img/screens/layouts-table-list-2-dark.png',
    order: 45,
  },
})

const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const filter = ref('')
const perPage = ref(10)

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

const { data, pending, error, refresh } = await useFetch('/api/products', {
  query,
})
</script>

<template>
  <div>
    <ContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filter products..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
        />
      </template>
      <template #right>
        <BaseSelect
          v-model="perPage"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
        >
          <option :value="10">
            10 per page
          </option>
          <option :value="25">
            25 per page
          </option>
          <option :value="50">
            50 per page
          </option>
          <option :value="100">
            100 per page
          </option>
        </BaseSelect>
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
                src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
                alt="Placeholder image"
              >
              <img
                class="hidden dark:block"
                src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
                alt="Placeholder image"
              >
            </template>
          </BasePlaceholderPage>
        </div>
        <div v-else>
          <div class="w-full">
            <Table rounded="sm">
              <template #header>
                <TableHeading uppercase spaced>
                  Product
                </TableHeading>
                <TableHeading uppercase spaced>
                  Name
                </TableHeading>
                <TableHeading uppercase spaced>
                  Sku
                </TableHeading>
                <TableHeading uppercase spaced>
                  Price
                </TableHeading>
                <TableHeading uppercase spaced>
                  Stock
                </TableHeading>
                <TableHeading uppercase spaced>
                  Category
                </TableHeading>
                <TableHeading uppercase spaced>
                  Action
                </TableHeading>
              </template>

              <TableRow v-for="item in data?.data" :key="item.id">
                <TableCell spaced>
                  <div class="flex items-center">
                    <img
                      :src="item.image"
                      :alt="item.name"
                      class="max-w-[80px]"
                    >
                  </div>
                </TableCell>
                <TableCell spaced>
                  {{ item.name }}
                </TableCell>
                <TableCell light spaced>
                  {{ item.sku }}
                </TableCell>
                <TableCell spaced>
                  <span class="font-semibold">${{ item.price }}</span>
                </TableCell>
                <TableCell light spaced>
                  {{ item.stock }}
                </TableCell>
                <TableCell light spaced>
                  <span class="text-primary-500 text-sm font-medium">
                    {{ item.category }}
                  </span>
                </TableCell>
                <TableCell spaced>
                  <BaseButtonAction muted>
                    Manage
                  </BaseButtonAction>
                </TableCell>
              </TableRow>
            </Table>
          </div>
          <div class="mt-6">
            <BasePagination
              :total-items="data?.total ?? 0"
              :item-per-page="perPage"
              :current-page="page"
              rounded="lg"
            />
          </div>
        </div>
      </div>
    </ContentWrapper>
  </div>
</template>
