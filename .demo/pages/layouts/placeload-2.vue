<script setup lang="ts">
definePageMeta({
  title: 'Placeload',
  preview: {
    title: 'Placeload 2',
    description: 'For loading states',
    categories: ['layouts'],
    src: '/img/screens/layouts-placeload-2.png',
    srcDark: '/img/screens/layouts-placeload-2-dark.png',
    order: 54,
  },
})
const fake = ref('')
const fakePerPage = ref('')
const fakeAll = ref(true)
const fakeItems = ref([])
</script>

<template>
  <div>
    <ContentWrapper>
      <template #left>
        <BaseInput
          v-model="fake"
          icon="lucide:search"
          placeholder="Filter users..."
          :classes="{
            wrapper: 'w-full sm:w-auto',
          }"
          disabled
        />
      </template>
      <template #right>
        <BaseSelect
          v-model="fakePerPage"
          placeholder="Items per page"
          label=""
          :classes="{
            wrapper: 'w-full sm:w-40',
          }"
          disabled
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
        <div class="w-full">
          <Table rounded="sm">
            <template #header>
              <TableHeading
                uppercase
                spaced
                class="p-4"
              >
                <div class="flex items-center">
                  <BaseCheckbox
                    v-model="fakeAll"
                    rounded="full"
                    color="primary"
                  />
                </div>
              </TableHeading>
              <TableHeading uppercase spaced>
                Type
              </TableHeading>
              <TableHeading uppercase spaced>
                Name
              </TableHeading>
              <TableHeading uppercase spaced>
                Size
              </TableHeading>
              <TableHeading uppercase spaced>
                Version
              </TableHeading>
              <TableHeading uppercase spaced>
                Last Updated
              </TableHeading>
              <TableHeading uppercase spaced>
                Action
              </TableHeading>
            </template>

            <TableRow v-for="index in 10" :key="index">
              <TableCell spaced>
                <div class="flex items-center">
                  <BaseCheckbox
                    v-model="fakeItems"
                    :value="`placeload-item-checkbox-${index}`"
                    rounded="full"
                    color="primary"
                  />
                </div>
              </TableCell>
              <TableCell light spaced>
                <BasePlaceload class="size-[46px] shrink-0 rounded-xl" />
              </TableCell>
              <TableCell spaced>
                <BasePlaceload class="h-3 w-24 rounded-lg" />
              </TableCell>
              <TableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TableCell>
              <TableCell light spaced>
                <BasePlaceload class="h-3 w-12 rounded-lg" />
              </TableCell>
              <TableCell spaced>
                <div class="flex items-center gap-2">
                  <BasePlaceload class="size-8 shrink-0 rounded-full" />
                  <div class="space-y-1">
                    <BasePlaceload class="h-2 w-[70px] rounded-lg" />
                    <BasePlaceload class="h-2 w-[50px] rounded-lg" />
                  </div>
                </div>
              </TableCell>
              <TableCell spaced>
                <BasePlaceload class="h-8 w-16 rounded-lg" />
              </TableCell>
            </TableRow>
          </Table>
        </div>
      </div>
    </ContentWrapper>
  </div>
</template>
