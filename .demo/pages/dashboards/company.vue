<script setup lang="ts">
import { Calendar } from 'v-calendar'

import 'v-calendar/dist/style.css'
import '~/assets/css/vcalendar.css'

definePageMeta({
  title: 'Company',
  preview: {
    title: 'Company dashboard',
    description: 'For corporate business',
    categories: ['dashboards'],
    src: '/img/screens/dashboards-company.png',
    srcDark: '/img/screens/dashboards-company-dark.png',
    order: 11,
  },
})

const gaugePersonal = reactive(useGaugePersonal())
const barSalesProfit = reactive(useBarSalesProfit())

function useGaugePersonal() {
  const { primary } = useTailwindColors()
  const type = 'radialBar'
  const height = 220

  const options = {
    title: {
      text: undefined,
    },
    chart: {
      sparkline: {
        enabled: true,
      },
      toolbar: {
        show: false,
      },
    },
    colors: [primary.value],
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: '#e7e7e7',
          strokeWidth: '97%',
          margin: 5, // margin is in pixels
          dropShadow: {
            enabled: false,
            top: 2,
            left: 0,
            color: '#999',
            opacity: 1,
            blur: 2,
          },
        },
        hollow: {
          margin: 0,
          size: '35%',
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            offsetY: -2,
            fontSize: '22px',
          },
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        shadeIntensity: 0.1,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 53, 91],
      },
    },
    labels: ['Average Results'],
  }

  const series = shallowRef([76])

  return {
    type,
    height,
    options,
    series,
  }
}

function useBarSalesProfit() {
  const { primary, info, success } = useTailwindColors()
  const type = 'bar'
  const height = 250

  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    colors: [primary.value, info.value, success.value],
    legend: {
      position: 'top',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        endingShape: 'rounded',
        columnWidth: '55%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: [
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
      ],
    },
    yaxis: {
      labels: {
        formatter: function (val: string) {
          return val + 70
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val: string) {
          return val + 70
        },
      },
    },
  }

  const series = shallowRef([
    {
      name: 'Net Profit',
      data: [-26, -15, -13, -14, -9, -12, -7, -10, -4],
    },
    {
      name: 'Revenue',
      data: [6, 15, 31, 28, 17, 35, 21, 44, 24],
    },
    {
      name: 'Free Cash Flow',
      data: [-35, -29, -34, -44, -25, -22, -18, -17, -29],
    },
  ])

  return {
    type,
    height,
    options,
    series,
  }
}

const team = shallowRef([
  {
    id: '0',
    src: '/img/avatars/22.svg',
    name: 'Anna Vrinkof',
    role: 'UI/UX designer',
    expertise: 'UX Design',
    rate: 49,
    status: 'Available',
  },
  {
    id: '1',
    src: '/img/avatars/3.svg',
    name: 'John Cambell',
    role: 'Sales manager',
    expertise: 'Management',
    rate: 74,
    status: 'Hired',
  },
  {
    id: '2',
    src: '/img/avatars/9.svg',
    name: 'Beth Delanoe',
    role: 'Product designer',
    expertise: 'Product',
    rate: 43,
    status: 'Available',
  },
  {
    id: '3',
    src: '/img/avatars/14.svg',
    name: 'Andrew Higgs',
    role: 'Project manager',
    expertise: 'Project',
    rate: 69,
    status: 'New',
  },
])

const selected = ref<string[]>([])

const isAllVisibleSelected = computed(() => {
  return selected.value.length === team.value?.length
})

function toggleAllVisibleSelection() {
  if (isAllVisibleSelected.value) {
    selected.value = []
  }
  else {
    selected.value = team.value?.map(item => item.id) ?? []
  }
}
</script>

<template>
  <div class="relative overflow-hidden">
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <BaseCard class="p-6">
        <div
          class="xs:divide-y divide-muted-200 dark:divide-muted-700 flex w-full flex-col items-center sm:flex-row sm:divide-x"
        >
          <!-- Item -->
          <div class="flex-1">
            <div class="flex flex-col p-4 text-center sm:py-0">
              <Icon
                name="ph:users-duotone"
                class="text-primary-500 mx-auto size-8"
              />
              <h4
                class="text-muted-800 dark:text-muted-100 font-sans text-xl font-semibold"
              >
                162
              </h4>
              <p class="text-muted-400 font-sans text-sm">
                New Users
              </p>
            </div>
          </div>
          <!-- Item -->
          <div class="flex-1">
            <div class="flex flex-col p-4 text-center sm:py-0">
              <Icon
                name="ph:coins-duotone"
                class="text-primary-500 mx-auto size-8"
              />
              <h4
                class="text-muted-800 dark:text-muted-100 font-sans text-xl font-semibold"
              >
                $8,579
              </h4>
              <p class="text-muted-400 font-sans text-sm">
                Daily Income
              </p>
            </div>
          </div>
          <!-- Item -->
          <div class="flex-1">
            <div class="flex flex-col p-4 text-center sm:py-0">
              <Icon
                name="ph:briefcase-duotone"
                class="text-primary-500 mx-auto size-8"
              />
              <h4
                class="text-muted-800 dark:text-muted-100 font-sans text-xl font-semibold"
              >
                192
              </h4>
              <p class="text-muted-400 font-sans text-sm">
                Completed Projects
              </p>
            </div>
          </div>
          <!-- Item -->
          <div class="flex-1">
            <div class="flex flex-col p-4 text-center sm:py-0">
              <Icon
                name="ph:ticket-duotone"
                class="text-primary-500 mx-auto size-8"
              />
              <h4
                class="text-muted-800 dark:text-muted-100 font-sans text-xl font-semibold"
              >
                32
              </h4>
              <p class="text-muted-400 font-sans text-sm">
                Active Tickets
              </p>
            </div>
          </div>
        </div>
      </BaseCard>
      <!-- Grid -->
      <div class="grid grid-cols-12 gap-6">
        <!-- Widget -->
        <div class="ptablet:col-span-6 col-span-12 sm:col-span-4">
          <BaseCard class="h-full p-6">
            <CompanyOverview />
          </BaseCard>
        </div>
        <!-- Widget -->
        <div class="ptablet:col-span-6 col-span-12 sm:col-span-4">
          <BaseCard class="relative h-full">
            <ChartAreaStats />
          </BaseCard>
        </div>
        <!-- Widget -->
        <div class="ptablet:col-span-12 col-span-12 sm:col-span-4">
          <BaseCard class="relative h-full">
            <ChartBarSocialChannels />
          </BaseCard>
        </div>
        <!-- Widget -->
        <div class="col-span-12">
          <Table rounded="sm">
            <template #header>
              <TableHeading uppercase class="px-4 py-6">
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
              <TableHeading uppercase>
                Collaborator
              </TableHeading>
              <TableHeading uppercase>
                Expertise
              </TableHeading>
              <TableHeading uppercase>
                Rate
              </TableHeading>
              <TableHeading uppercase>
                Status
              </TableHeading>
              <TableHeading uppercase class="px-4 py-6">
                <span class="sr-only">View</span>
              </TableHeading>
            </template>

            <TableRow v-for="member in team" :key="member.id">
              <TableCell class="p-4">
                <div class="flex items-center">
                  <BaseCheckbox
                    v-model="selected"
                    :value="member.id"
                    :name="member.id"
                    rounded="sm"
                    color="primary"
                  />
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center">
                  <BaseAvatar :src="member.src" size="sm" />
                  <div class="ms-3 leading-none">
                    <h4 class="font-heading text-sm font-semibold">
                      {{ member.name }}
                    </h4>
                    <p class="text-muted-400 font-sans text-xs">
                      {{ member.role }}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell light>
                {{ member.expertise }}
              </TableCell>
              <TableCell>${{ member.rate }}/hour</TableCell>
              <TableCell>
                <BaseTag
                  v-if="member.status === 'Available'"
                  color="success"
                  variant="pastel"
                  rounded="full"
                  class="font-medium"
                >
                  {{ member.status }}
                </BaseTag>
                <BaseTag
                  v-else-if="member.status === 'New'"
                  color="info"
                  variant="pastel"
                  rounded="full"
                  class="font-medium"
                >
                  {{ member.status }}
                </BaseTag>
                <BaseTag
                  v-else-if="member.status === 'Hired'"
                  color="warning"
                  variant="pastel"
                  rounded="full"
                  class="font-medium"
                >
                  {{ member.status }}
                </BaseTag>
              </TableCell>
              <TableCell>
                <a
                  href="#"
                  class="text-violet-500 transition-opacity duration-300 hover:opacity-75 dark:text-violet-400"
                >
                  View
                </a>
              </TableCell>
            </TableRow>
          </Table>
        </div>
        <!-- Widget -->
        <div class="ptablet:col-span-6 col-span-12 sm:col-span-3">
          <BaseCard class="flex h-full flex-col p-6">
            <div class="mb-6 flex items-center justify-between">
              <BaseHeading
                as="h3"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>Personal Score</span>
              </BaseHeading>
            </div>
            <div class="py-16">
              <AddonApexcharts v-bind="gaugePersonal" class="-mt-14" />
            </div>
            <div class="mt-auto text-center">
              <BaseParagraph size="sm">
                <span class="text-muted-400">
                  Your score has been calculated based on the latest metrics
                </span>
              </BaseParagraph>
            </div>
          </BaseCard>
        </div>
        <!-- Chart -->
        <div class="ptablet:col-span-6 col-span-12 sm:col-span-6">
          <BaseCard class="relative p-6">
            <div class="mb-6">
              <BaseHeading
                as="h3"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>Profit</span>
              </BaseHeading>
            </div>
            <AddonApexcharts v-bind="barSalesProfit" />
          </BaseCard>
        </div>
        <!-- Widget -->
        <div class="ptablet:hidden col-span-12 sm:col-span-3">
          <BaseCard class="flex h-full flex-col p-2">
            <Calendar
              :attributes="[
                {
                  key: 'today',
                  highlight: true,
                  order: 0,
                  dates: [new Date()],
                },
              ]"
              title-position="left"
              expanded
              borderless
              transparent
              trim-weeks
              class="max-w-full rounded-md"
            />
          </BaseCard>
        </div>
        <!-- Widget -->
        <div class="col-span-12">
          <BaseCard class="p-6">
            <!-- Title -->
            <div class="mb-10 flex items-center justify-between">
              <BaseHeading
                as="h3"
                size="md"
                weight="semibold"
                lead="tight"
                class="text-muted-800 dark:text-white"
              >
                <span>Pending tickets</span>
              </BaseHeading>
              <BaseButton
                color="primary"
                size="sm"
                variant="pastel"
                rounded="md"
              >
                View all
              </BaseButton>
            </div>
            <PendingTickets />
          </BaseCard>
        </div>
      </div>
    </div>
  </div>
</template>
