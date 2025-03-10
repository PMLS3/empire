<script setup lang="ts">
import { usePanels } from '../../../../shared/composables/panels'

definePageMeta({
  title: 'Project Details',
  preview: [
    {
      title: 'Project details',
      description: 'For displaying fitness project details',
      categories: ['layouts', 'projects'],
      src: '/img/screens/layouts-projects-details.png',
      srcDark: '/img/screens/layouts-projects-details-dark.png',
      order: 72,
      params: {
        slug: 'health-and-fitness-dashboard',
      },
    },
    {
      title: 'Project details',
      description: 'For displaying banking project details',
      categories: ['layouts', 'projects'],
      src: '/img/screens/layouts-projects-details.png',
      srcDark: '/img/screens/layouts-projects-details-dark.png',
      order: 72,
      params: {
        slug: 'banking-and-finance-dashboard',
      },
    },
  ],
})

const { open } = usePanels()

const route = useRoute()
const slug = computed(() => route.params.slug)

const query = computed(() => {
  return {
    slug: slug.value,
  }
})

const { data, pending, error, refresh } = await useFetch(
  '/api/data/read',
  {
    method: 'POST',
    body: {
          collection: 'research_projects',
          readType: 'id',
          id: slug.value,
        },
    
  },
)

if (!data.value?.project) {
  // await navigateTo('/layouts/projects')
}

const currentTask = ref()

function openTaskPanel(id: number, tasks: any) {
  currentTask.value = tasks.find((task: any) => task.id === id)
  open('task', { task: currentTask })
}
</script>

<template>
  <div class="relative">
    <div class="absolute end-12 top-2.5 z-20 hidden sm:block">
      <BaseButton
        size="sm"
        rounded="lg"
        :to="`/layouts/projects/board/${slug}`"
      >
        <Icon name="ph:kanban-duotone" class="size-4" />
        <span>Open Board</span>
      </BaseButton>
    </div>
    <div class="absolute end-0 top-2 z-20">
      <BaseDropdown
        variant="context"
        label="Dropdown"
        placement="bottom-end"
        size="md"
        class="z-20"
        rounded="lg"
      >
        <BaseDropdownItem
          :to="`/layouts/projects/board/${slug}`"
          title="Board view"
          text="Swicth to board view"
          class="sm:hidden"
        >
          <template #start>
            <Icon name="ph:kanban-duotone" class="me-2 block size-5" />
          </template>
        </BaseDropdownItem>
        <BaseDropdownDivider />
        <BaseDropdownItem
          to="#"
          title="Edit"
          text="Edit this project"
        >
          <template #start>
            <Icon name="ph:pencil-duotone" class="me-2 block size-5" />
          </template>
        </BaseDropdownItem>
        <BaseDropdownDivider />
        <BaseDropdownItem
          to="#"
          title="Permissions"
          text="Manage permissions"
        >
          <template #start>
            <Icon name="ph:lock-duotone" class="me-2 block size-5" />
          </template>
        </BaseDropdownItem>
        <BaseDropdownItem
          to="#"
          title="Files"
          text="Manage files"
        >
          <template #start>
            <Icon name="ph:file-duotone" class="me-2 block size-5" />
          </template>
        </BaseDropdownItem>
        <BaseDropdownDivider />
        <BaseDropdownItem
          to="#"
          title="Delete"
          text="Delete this project"
        >
          <template #start>
            <Icon name="ph:trash-duotone" class="me-2 block size-5" />
          </template>
        </BaseDropdownItem>
      </BaseDropdown>
    </div>
    <div v-if="data?.data === undefined">
      <BasePlaceholderPage
        title="Project not found"
        subtitle="We couldn't find a project matching this namespace."
      >
        <template #image>
          <img
            class="block dark:hidden"
            src="/img/illustrations/placeholders/flat/placeholder-projects.svg"
            alt="Placeholder image"
          >
          <img
            class="hidden dark:block"
            src="/img/illustrations/placeholders/flat/placeholder-projects-dark.svg"
            alt="Placeholder image"
          >
        </template>
      </BasePlaceholderPage>
    </div>
    <div v-else class="h-full">
      <BaseTabs
        model-value="overview"
        :tabs="[
          {
            label: 'Overview',
            value: 'overview',
          },
          {
            label: 'Team',
            value: 'team',
          },
          {
            label: 'Files',
            value: 'files',
          },
          {
            label: 'Books',
            value: 'books',
          },
          {
            label: 'Tasks',
            value: 'tasks',
          },
        ]"
      >
        <template #tab="{ activeValue }">
          <!-- Overview -->
          <div v-if="activeValue === 'overview'">
            <div class="grid grid-cols-12 gap-6">
              <div class="ltablet:col-span-8 col-span-12 lg:col-span-8">
                <BaseCard class="space-y-12 p-10">
                  <div
                    class="border-muted-200 dark:border-muted-700 flex flex-col items-center justify-between gap-8 border-b pb-12 sm:flex-row"
                  >
                    <div>
                      <BaseHeading
                        tag="h2"
                        size="2xl"
                        weight="medium"
                      >
                        {{ data?.data.name }}
                      </BaseHeading>
                      <BaseParagraph
                        size="lg"
                        class="text-muted-600 dark:text-muted-400"
                      >
                        {{ data?.data.main_category }}
                      </BaseParagraph>
                      <BaseParagraph size="sm" class="text-muted-400 py-4">
                        {{ data?.data.description }}
                      </BaseParagraph>
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <BaseAvatar
                            :src="data?.data?.owner?.avatar"
                            :data-nui-tooltip="`${data?.data?.owner?.name} owns this project`"
                          />
                          <div>
                            <BaseHeading
                              tag="h3"
                              size="sm"
                              weight="medium"
                            >
                              {{ data?.data?.owner?.name }}
                            </BaseHeading>
                            <BaseParagraph size="xs" class="text-muted-400">
                              Project owner
                            </BaseParagraph>
                          </div>
                        </div>
                        <BaseAvatarGroup
                        v-if="data?.data?.team"
                          :avatars="data?.data?.team"
                          :limit="3"
                        />
                      </div>
                    </div>
                    <div class="w-full shrink-0 sm:w-72">
                      <img
                        :src="data?.data?.image"
                        :alt="data?.data?.name"
                        class="rounded-lg"
                      >
                    </div>
                  </div>
                  <div
                    class="border-muted-200 dark:border-muted-700 grid gap-4 border-b pb-12 sm:grid-cols-4"
                  >
                    <div>
                      <Icon
                        name="ph:pen-nib-duotone"
                        class="text-primary-500 mb-2 size-6"
                      />
                      <div>
                        <BaseHeading
                          tag="h3"
                          size="sm"
                          weight="medium"
                        >
                          UI/UX Design
                        </BaseHeading>
                        <BaseParagraph
                          size="xs"
                          lead="tight"
                          class="text-muted-400"
                        >
                          Designing a perfect user experience is in the scope of
                          this project.
                        </BaseParagraph>
                      </div>
                    </div>
                    <div>
                      <Icon
                        name="ph:timer-duotone"
                        class="text-primary-500 mb-2 size-6"
                      />
                      <div>
                        <BaseHeading
                          tag="h3"
                          size="sm"
                          weight="medium"
                        >
                          1 Week Sprints
                        </BaseHeading>
                        <BaseParagraph
                          size="xs"
                          lead="tight"
                          class="text-muted-400"
                        >
                          This project development iterations follow a 1 week
                          sprint pattern.
                        </BaseParagraph>
                      </div>
                    </div>
                    <div>
                      <Icon
                        name="ph:calendar-blank-duotone"
                        class="text-primary-500 mb-2 size-6"
                      />
                      <div>
                        <BaseHeading
                          tag="h3"
                          size="sm"
                          weight="medium"
                        >
                          3 Months
                        </BaseHeading>
                        <BaseParagraph
                          size="xs"
                          lead="tight"
                          class="text-muted-400"
                        >
                          This project and all related tasks should completed
                          within 3 months.
                        </BaseParagraph>
                      </div>
                    </div>
                    <div>
                      <Icon
                        name="ph:sketch-logo-duotone"
                        class="text-primary-500 mb-2 size-6"
                      />
                      <div>
                        <BaseHeading
                          tag="h3"
                          size="sm"
                          weight="medium"
                        >
                          Fixed
                        </BaseHeading>
                        <BaseParagraph
                          size="xs"
                          lead="tight"
                          class="text-muted-400"
                        >
                          This project's budget planning is based on an imutable
                          fixed bid.
                        </BaseParagraph>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4
                      class="text-muted-400 mb-6 font-sans text-xs font-semibold uppercase"
                    >
                      Recent files
                    </h4>
                    <div class="grid gap-8 pb-6 sm:grid-cols-2">
                      <div
                        v-for="(file, index) in data?.data.files"
                        :key="index"
                        rounded="lg"
                      >
                        <div class="flex w-full items-center gap-2">
                          <img
                            :src="file.icon"
                            :alt="file.name"
                            class="max-w-[46px]"
                          >
                          <div>
                            <BaseHeading
                              tag="h3"
                              size="sm"
                              weight="medium"
                            >
                              {{ file.name }}
                            </BaseHeading>
                            <BaseParagraph size="xs" class="text-muted-400">
                              <span>{{ file.size }}</span>
                              <span class="px-1 text-base leading-tight">
                                &middot;
                              </span>
                              <span>v{{ file.version }}</span>
                            </BaseParagraph>
                          </div>
                          <div class="ms-auto">
                            <BaseButtonIcon
                              rounded="full"
                              data-nui-tooltip="Download file"
                              size="sm"
                            >
                              <Icon name="lucide:arrow-down" />
                            </BaseButtonIcon>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </BaseCard>
              </div>
              <div class="ltablet:col-span-4 col-span-12 lg:col-span-4">
                <div class="space-y-6">
                  <!-- Customer -->
                  <BaseCard class="p-8">
                    <h4
                      class="text-muted-400 mb-6 font-sans text-xs font-semibold uppercase"
                    >
                      Customer
                    </h4>

                    <div class="mb-4 flex items-center gap-2">
                      <BaseAvatar
                        :src="data?.data?.customer?.logo"
                        size="md"
                        :data-nui-tooltip="data?.data?.customer?.name"
                        class="bg-muted-100 dark:bg-muted-700"
                      />
                      <div>
                        <BaseHeading
                          tag="h5"
                          size="lg"
                          weight="medium"
                          lead="none"
                          class="line-clamp-1"
                        >
                          {{ data?.data?.customer?.name }}
                        </BaseHeading>
                        <BaseParagraph size="sm" class="text-muted-400">
                          {{ data?.data?.customer?.text }}
                        </BaseParagraph>
                      </div>
                    </div>
                    <div class="w-full space-y-1">
                      <div class="flex items-center justify-between">
                        <h4
                          class="text-muted-700 dark:text-muted-100 font-sans text-sm font-medium"
                        >
                          Progress
                        </h4>
                        <div>
                          <span class="text-muted-400 font-sans text-sm">
                            {{ data?.data.completed }}%
                          </span>
                        </div>
                      </div>
                      <BaseProgress
                        size="xs"
                        color="primary"
                        :value="data?.data.completed"
                      />
                    </div>
                  </BaseCard>
                  <!-- Tools -->
                  <BaseCard class="p-8">
                    <h4
                      class="text-muted-400 mb-6 font-sans text-xs font-semibold uppercase"
                    >
                      Project Tools
                    </h4>
                    <div class="space-y-8">
                      <div
                        v-for="tool in data?.data.tools"
                        :key="tool.name"
                        class="flex items-center gap-2"
                      >
                        <BaseAvatar
                          :src="tool.icon"
                          size="xs"
                          :data-nui-tooltip="tool.name"
                          class="bg-muted-100 dark:bg-muted-700"
                        />
                        <div>
                          <BaseHeading
                            tag="h5"
                            size="sm"
                            weight="medium"
                            lead="none"
                            class="line-clamp-1"
                          >
                            {{ tool.name }}
                          </BaseHeading>
                          <BaseParagraph size="xs" class="text-muted-400">
                            {{ tool.description }}
                          </BaseParagraph>
                        </div>
                      </div>
                    </div>
                  </BaseCard>
                  <!-- Stacks -->
                  <BaseCard class="p-8">
                    <h4
                      class="text-muted-400 mb-6 font-sans text-xs font-semibold uppercase"
                    >
                      Project Stacks
                    </h4>
                    <div class="space-y-8">
                      <div
                        v-for="stack in data?.data.stacks"
                        :key="stack.name"
                        class="flex items-center gap-2"
                      >
                        <BaseAvatar
                          :src="stack.icon"
                          size="xs"
                          :data-nui-tooltip="stack.name"
                          class="bg-muted-100 dark:bg-muted-700"
                        />
                        <div>
                          <BaseHeading
                            tag="h5"
                            size="sm"
                            weight="medium"
                            lead="none"
                            class="line-clamp-1"
                          >
                            {{ stack.name }}
                          </BaseHeading>
                          <BaseParagraph size="xs" class="text-muted-400">
                            {{ stack.description }}
                          </BaseParagraph>
                        </div>
                      </div>
                    </div>
                  </BaseCard>
                </div>
              </div>
            </div>
          </div>
          <!-- Books -->
          <div v-else-if="activeValue === 'files'">
            <ResearchFiles />

            </div>
              <!-- Files -->
          <div v-else-if="activeValue === 'books'">
            <ResearchBooks  />

            </div>
          <!-- Team -->
          <div v-else-if="activeValue === 'team'">
            <div class="grid gap-6 sm:grid-cols-3">
              <BaseCard
                elevated-hover
                class="hover:!border-primary-500 relative"
              >
                <NuxtLink to="#">
                  <Icon
                    name="uiw:star-on"
                    class="text-primary-500 absolute end-6 top-6"
                  />
                  <div class="flex flex-col items-center p-5 sm:flex-row">
                    <div class="flex flex-col gap-3 sm:flex-row">
                      <BaseAvatar
                        :src="data?.data?.owner?.avatar"
                        :badge-src="data?.data?.owner?.badge"
                        :text="data?.data?.owner?.name"
                        size="lg"
                        class="bg-muted-500/20 text-muted-500"
                      />
                      <div class="text-center leading-none sm:text-left">
                        <h4
                          class="text-muted-800 dark:text-muted-100 font-sans text-base font-medium"
                        >
                          {{ data?.data?.owner?.name }}
                        </h4>
                        <p class="text-muted-400 mb-2 font-sans text-xs">
                          Project owner
                        </p>
                        <p
                          class="text-muted-500 dark:text-muted-400 font-sans text-xs"
                        >
                          {{ data?.data?.owner?.bio }}
                        </p>
                      </div>
                    </div>
                  </div>
                </NuxtLink>
              </BaseCard>
              <BaseCard
                v-for="item in data?.data.team"
                :key="item.id"
                elevated-hover
                class="hover:!border-primary-500"
              >
                <NuxtLink to="#">
                  <div class="flex flex-col items-center p-5 sm:flex-row">
                    <div class="flex flex-col gap-3 sm:flex-row">
                      <BaseAvatar
                        :src="item.src"
                        :badge-src="item.badge"
                        :text="item.text"
                        size="lg"
                        class="bg-muted-500/20 text-muted-500"
                      />
                      <div class="text-center leading-none sm:text-left">
                        <h4
                          class="text-muted-800 dark:text-muted-100 font-sans text-base font-medium"
                        >
                          {{ item.tooltip }}
                        </h4>
                        <p class="text-muted-400 mb-2 font-sans text-xs">
                          {{ item.role }}
                        </p>
                        <p
                          class="text-muted-500 dark:text-muted-400 font-sans text-xs"
                        >
                          {{ item.bio }}
                        </p>
                      </div>
                    </div>
                  </div>
                </NuxtLink>
              </BaseCard>
              <!-- Invite -->
              <div>
                <button
                  type="button"
                  class="border-muted-300 dark:border-muted-800 hover:border-primary-500 dark:hover:border-primary-500 group flex size-full items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors duration-300"
                >
                  <span class="block text-center font-sans">
                    <span
                      class="text-muted-800 dark:text-muted-100 group-hover:text-primary-500 dark:group-hover:text-primary-500 block transition-colors duration-300"
                    >
                      Invite a new member
                    </span>
                    <span class="text-muted-400 block text-sm">
                      Send an invitation to join your project team
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <!-- Tasks -->
          <div v-else-if="activeValue === 'tasks'">
            <div class="grid gap-6 sm:grid-cols-3">
              <BaseCard
                v-for="item in data?.data.tasks"
                :key="item.id"
                elevated-hover
                class="hover:!border-primary-500 flex cursor-pointer flex-col"
                @click="openTaskPanel(item.id, data?.data?.tasks)"
              >
                <div class="flex flex-col items-center p-5 sm:flex-row">
                  <div class="flex flex-col gap-3 sm:flex-row">
                    <Icon
                      v-if="item.status === 0"
                      name="ph:plus-circle-duotone"
                      class="text-muted-400 size-6 shrink-0"
                    />
                    <Icon
                      v-else-if="item.status === 5"
                      name="ph:check-circle-duotone"
                      class="text-success-500 size-6 shrink-0"
                    />
                    <Icon
                      v-else-if="item.status === 1"
                      name="ph:timer-duotone"
                      class="text-muted-400 size-6 shrink-0"
                    />
                    <Icon
                      v-else-if="item.status === 2 || item.status === 3"
                      name="ph:warning-duotone"
                      class="text-warning-500 size-6 shrink-0"
                    />
                    <div class="text-center leading-none sm:text-left">
                      <h4
                        class="text-muted-800 dark:text-muted-100 mb-2 font-sans text-base font-medium leading-tight"
                      >
                        {{ item.name }}
                      </h4>
                      <p class="text-muted-400 line-clamp-2 font-sans text-xs">
                        {{ item.description }}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  class="bg-muted-50 dark:bg-muted-700/50 mt-auto flex items-center justify-between rounded-b-lg px-5 py-3"
                >
                  <div class="flex max-w-[180px] grow items-center gap-2">
                    <BaseAvatar
                      size="xxs"
                      :src="item.assignee.src"
                      :data-nui-tooltip="item.assignee.tooltip"
                    />
                    <BaseProgress
                      :value="item.completion"
                      size="xs"
                      :color="item.status === 5 ? 'success' : 'primary'"
                    />
                  </div>
                  <div class="text-muted-400 flex items-center gap-4">
                    <div class="flex items-center gap-1 text-sm">
                      <Icon name="ph:paperclip-duotone" class="size-4" />
                      <span class="font-sans">
                        {{ item.files.length }}
                      </span>
                    </div>
                    <div class="flex items-center gap-1 text-sm">
                      <Icon name="ph:chat-circle-duotone" class="size-4" />
                      <span class="font-sans">
                        {{ item.comments.length }}
                      </span>
                    </div>
                  </div>
                </div>
              </BaseCard>
              <!-- Invite -->
              <div>
                <button
                  type="button"
                  class="border-muted-300 dark:border-muted-800 hover:border-primary-500 dark:hover:border-primary-500 group flex size-full items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors duration-300"
                >
                  <span class="block text-center font-sans">
                    <span
                      class="text-muted-800 dark:text-muted-100 group-hover:text-primary-500 dark:group-hover:text-primary-500 block transition-colors duration-300"
                    >
                      Create a new task
                    </span>
                    <span class="text-muted-400 block text-sm">
                      Add a new task to your project
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </template>
      </BaseTabs>
    </div>
  </div>
</template>
