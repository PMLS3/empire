<script setup lang="ts">
definePageMeta({
  title: 'Table List',
  preview: {
    title: 'Table list 1',
    description: 'For list views and collections',
    categories: ['layouts', 'lists'],
    src: '/img/screens/layouts-table-list-1.png',
    srcDark: '/img/screens/layouts-table-list-1-dark.png',
    order: 44,
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

const { data, pending, error, refresh } = await useFetch(
  '/api/company/members/',
  {
    query,
  },
)

const selected = ref<number[]>([])

const isAllVisibleSelected = computed(() => {
  return selected.value.length === data.value?.data.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  }
  else {
    selected.value = data.value?.data.map(item => item.id) ?? []
  }
}
</script>

<template>
  <div>
    <ContentWrapper>
      <template #left>
        <BaseInput
          v-model="filter"
          icon="lucide:search"
          placeholder="Filter users..."
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
            <Table rounded="sm" :scrollable="false">
              <template #header>
                <TableHeading
                  uppercase
                  spaced
                  class="p-4"
                >
                  <div class="flex items-center">
                    <BaseCheckbox
                      :model-value="isAllVisibleSelected"
                      :indeterminate="
                        selected.length > 0 && !isAllVisibleSelected
                      "
                      name="table-1-main"
                      rounded="sm"
                      color="primary"
                      @click="toggleAllVisibleSelection"
                    />
                  </div>
                </TableHeading>
                <TableHeading uppercase spaced>
                  Collaborator
                </TableHeading>
                <TableHeading uppercase spaced>
                  Location
                </TableHeading>
                <TableHeading uppercase spaced>
                  Status
                </TableHeading>
                <TableHeading uppercase spaced>
                  Completed
                </TableHeading>
                <TableHeading
                  uppercase
                  spaced
                  class="text-end"
                >
                  Action
                </TableHeading>
              </template>

              <TableRow v-if="selected.length > 0" :hoverable="false">
                <TableCell
                  colspan="6"
                  class="bg-success-100 text-success-700 dark:bg-success-700 dark:text-success-100 p-4"
                >
                  You have selected {{ selected.length }} items of the total
                  {{ data?.total }} items.
                  <a
                    href="#"
                    class="outline-none hover:underline focus:underline"
                  >Click here to everything</a>
                </TableCell>
              </TableRow>

              <TableRow v-for="item in data?.data" :key="item.id">
                <TableCell spaced>
                  <div class="flex items-center">
                    <BaseCheckbox
                      v-model="selected"
                      :value="item.id"
                      :name="`item-checkbox-${item.id}`"
                      rounded="sm"
                      color="primary"
                    />
                  </div>
                </TableCell>
                <TableCell spaced>
                  <div class="flex items-center">
                    <BaseAvatar
                      :src="item.picture"
                      :text="item.initials"
                      :class="getRandomColor()"
                    />
                    <div class="ms-3 leading-none">
                      <h4 class="font-sans text-sm font-medium">
                        {{ item.username }}
                      </h4>
                      <p class="text-muted-400 font-sans text-xs">
                        {{ item.position }}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell light spaced>
                  {{ item.location }}
                </TableCell>
                <TableCell spaced class="capitalize">
                  <BaseTag
                    v-if="item.status === 'available'"
                    color="success"
                    variant="pastel"
                    rounded="full"
                    size="sm"
                    class="font-medium"
                  >
                    {{ item.status }}
                  </BaseTag>
                  <BaseTag
                    v-else-if="item.status === 'new'"
                    color="info"
                    variant="pastel"
                    rounded="full"
                    size="sm"
                    class="font-medium"
                  >
                    {{ item.status }}
                  </BaseTag>
                  <BaseTag
                    v-else-if="item.status === 'busy'"
                    color="warning"
                    variant="pastel"
                    rounded="full"
                    size="sm"
                    class="font-medium"
                  >
                    {{ item.status }}
                  </BaseTag>
                  <BaseTag
                    v-else-if="item.status === 'offline'"
                    color="muted"
                    variant="pastel"
                    rounded="full"
                    size="sm"
                    class="font-medium"
                  >
                    {{ item.status }}
                  </BaseTag>
                </TableCell>
                <TableCell spaced>
                  <div class="flex items-center">
                    <div class="relative">
                      <BaseProgressCircle
                        :value="item.completed"
                        :thickness="1"
                        :size="50"
                        class="text-success-500"
                      />
                      <span
                        class="absolute start-1/2 top-1/2 z-10 ms-0.5 -translate-x-1/2 -translate-y-1/2 font-sans text-[0.65rem] font-semibold rtl:me-0.5 rtl:ms-0 rtl:translate-x-1/2"
                      >
                        {{ item.completed }}%
                      </span>
                    </div>
                    <span class="text-muted-400 font-sans text-xs">
                      Tasks completed
                    </span>
                  </div>
                </TableCell>
                <TableCell spaced>
                  <div class="flex justify-end">
                    <BaseDropdown
                      variant="context"
                      label="Dropdown"
                      placement="bottom-end"
                      rounded="md"
                    >
                      <BaseDropdownItem
                        to="#"
                        title="User"
                        text="View details"
                        rounded="md"
                      />
                    </BaseDropdown>
                  </div>
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
