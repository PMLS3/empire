<script setup lang="ts">
import type { Project, ProjectStepData } from "../../types";

definePageMeta({
  title: "Book Summary",
  preview: {
    title: "Book Summary",
    description: "Review your book details",
    categories: ["publishing", "wizard", "forms"],
  },
});

const { book, createBook } = usePublishing();
const router = useRouter();

const {
  data: project,
  complete,
  getStep,
} = useMultiStepForm<Project, ProjectStepData>();

useHead({
  title: "Submit project",
});

const avatarPreview = useNinjaFilePreview(() => project.value.avatar);

const handleCreateBook = async () => {
  try {
    const response = await createBook(book.value);
    if (response && !response.error) {
      router.push('/publishing/book/editor');
    }
  } catch (error) {
    console.error('Error creating book:', error);
  }
};
</script>

<template>
  <div>
    <WizardStepTitle />

    <div v-if="!complete">
      <div class="flex flex-col px-4">
        <div
          class="group relative mx-auto mb-2 flex w-16 items-center justify-center"
        >
          <BaseAvatar
            v-if="avatarPreview"
            size="lg"
            :src="avatarPreview"
            class="dark:bg-muted-700/60 bg-white"
          />
          <BaseAvatar
            v-else
            size="lg"
            text="P"
            class="bg-pink-500/10 text-pink-600"
          />
          <!-- Edit -->
          <div class="absolute bottom-0 end-0 z-10">
            <BaseButtonIcon
              small
              shape="full"
              class="hover:border-primary-500 hover:text-primary-500 dark:hover:border-primary-500 dark:hover:text-primary-500 pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
              :to="getStep(1).to"
            >
              <Icon name="lucide:edit-2" class="pointer-events-none h-3 w-3" />
            </BaseButtonIcon>
          </div>
        </div>
        <div class="mx-auto flex w-full max-w-xl flex-col gap-4">
          <!-- Title -->
          <h3
            class="text-muted-800 dark:text-muted-100 text-center font-sans text-xl font-medium"
          >
            {{ project.name === "" ? "Project title goes here" : project.name }}
          </h3>

          <div class="grid grid-cols-12 gap-4">
            <!-- Description -->

            <!-- Type -->
            <div class="col-span-12 sm:col-span-6">
              <BaseCard shape="curved" class="group relative p-6">
                <!-- Edit -->
                <div class="absolute end-3 top-3 z-10">
                  <BaseButtonIcon
                    small
                    shape="full"
                    class="hover:border-primary-500 hover:text-primary-500 dark:hover:border-primary-500 dark:hover:text-primary-500 pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
                    :to="getStep(0).to"
                  >
                    <Icon
                      name="lucide:edit-2"
                      class="pointer-events-none h-3 w-3"
                    />
                  </BaseButtonIcon>
                </div>
                <div class="flex w-full items-center gap-2">
                  <BaseIconBox
                    v-if="project.type === undefined"
                    size="sm"
                    class="bg-primary-500/10 text-primary-600"
                  >
                    <Icon name="ph:briefcase-duotone" class="h-5 w-5" />
                  </BaseIconBox>
                  <BaseIconBox
                    v-else-if="project.type === 'design'"
                    size="sm"
                    class="bg-orange-500/10 text-orange-600"
                  >
                    <Icon name="ph:bounding-box-duotone" class="h-5 w-5" />
                  </BaseIconBox>
                  <BaseIconBox
                    v-else-if="project.type === 'development'"
                    size="sm"
                    class="bg-emerald-500/10 text-emerald-600"
                  >
                    <Icon name="ph:bounding-box-duotone" class="h-5 w-5" />
                  </BaseIconBox>
                  <BaseIconBox
                    v-else-if="project.type === 'marketing'"
                    size="sm"
                    class="bg-yellow-500/10 text-yellow-500"
                  >
                    <Icon name="ph:bounding-box-duotone" class="h-5 w-5" />
                  </BaseIconBox>
                  <div>
                    <div class="text-muted-400 text-xs">
                      <span>Book Category</span>
                    </div>
                    <div
                      class="text-muted-800 dark:text-muted-100 text-sm font-medium capitalize"
                    >
                      <span>
                        {{ book.category || 'Not specified' }}
                      </span>
                    </div>
                  </div>
                </div>
              </BaseCard>
            </div>
            <!-- Customer -->
            <div class="col-span-12 sm:col-span-6">
              <BaseCard shape="curved" class="group relative p-6">
                <!-- Edit -->
                <div class="absolute end-3 top-3 z-10">
                  <BaseButtonIcon
                    small
                    shape="full"
                    class="hover:border-primary-500 hover:text-primary-500 dark:hover:border-primary-500 dark:hover:text-primary-500 pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
                    :to="getStep(2).to"
                  >
                    <Icon
                      name="lucide:edit-2"
                      class="pointer-events-none h-3 w-3"
                    />
                  </BaseButtonIcon>
                </div>
                <div class="flex w-full items-center gap-2">
                  <BaseAvatar
                    v-if="project.customer?.logo === undefined"
                    src="/img/avatars/placeholder-file.png"
                    size="sm"
                  />
                  <BaseAvatar
                    v-else
                    :src="project.customer?.logo"
                    size="sm"
                    class="bg-muted-100 dark:bg-muted-700"
                  />
                  <div>
                    <div class="text-muted-400 text-xs">
                      <span>Customer</span>
                    </div>
                    <div
                      class="text-muted-800 dark:text-muted-100 text-sm font-medium"
                    >
                      <span>
                        {{
                          project.customer?.name === undefined
                            ? "No customer selected"
                            : project.customer?.name
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </BaseCard>
            </div>
            <!-- Budget -->
            <div class="col-span-12 sm:col-span-4">
              <BaseCard shape="curved" class="group relative p-6">
                <div class="flex flex-col gap-1">
                  <span class="text-muted-400 text-sm">Kindle BSR</span>
                  <span class="font-medium">{{ book.bsrCriteria?.kindle?.amount || 'Not set' }}</span>
                  <div v-if="book.bsrCriteria?.kindle?.condition" class="text-success-500 text-xs">
                    Meets criteria
                  </div>
                  <div v-else class="text-danger-500 text-xs">
                    Does not meet criteria
                  </div>
                </div>
              </BaseCard>
            </div>
            <!-- Due Date -->
            <div class="col-span-12 sm:col-span-4">
              <BaseCard shape="curved" class="group relative h-full p-6">
                <div class="flex flex-col gap-1">
                  <span class="text-muted-400 text-sm">Paperback BSR</span>
                  <span class="font-medium">{{ book.bsrCriteria?.paperback?.amount || 'Not set' }}</span>
                  <div v-if="book.bsrCriteria?.paperback?.condition" class="text-success-500 text-xs">
                    Meets criteria
                  </div>
                  <div v-else class="text-danger-500 text-xs">
                    Does not meet criteria
                  </div>
                </div>
              </BaseCard>
            </div>
            <!-- Files -->
            <div class="col-span-12 sm:col-span-4">
              <BaseCard shape="curved" class="group relative p-6">
                <!-- Edit -->
                <div class="flex flex-col gap-1">
                  <span class="text-muted-400 text-sm">Audible BSR</span>
                  <span class="font-medium">{{ book.bsrCriteria?.audible?.amount || 'Not set' }}</span>
                  <div v-if="book.bsrCriteria?.audible?.condition" class="text-success-500 text-xs">
                    Meets criteria
                  </div>
                  <div v-else class="text-danger-500 text-xs">
                    Does not meet criteria
                  </div>
                </div>
              </BaseCard>
            </div>
            <!-- Team -->
            <div class="col-span-12 sm:col-span-6">
              <BaseCard shape="curved" class="group relative p-6">
                <!-- Edit -->
                <div class="absolute end-3 top-3 z-10">
                  <BaseButtonIcon
                    small
                    shape="full"
                    class="hover:border-primary-500 hover:text-primary-500 dark:hover:border-primary-500 dark:hover:text-primary-500 pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
                    :to="getStep(2).to"
                  >
                    <Icon
                      name="lucide:edit-2"
                      class="pointer-events-none h-3 w-3"
                    />
                  </BaseButtonIcon>
                </div>
                <BaseHeading size="xs" class="mb-4 uppercase">
                  <span class="text-muted-500 dark:text-muted-400">
                    Project team
                  </span>
                </BaseHeading>
                <div>
                  <div
                    v-if="project.team && project.team.length > 0"
                    class="space-y-4"
                  >
                    <div
                      v-for="member in project.team"
                      :key="member.name"
                      class="flex items-center gap-2"
                    >
                      <BaseAvatar size="xs" :src="member.picture" />
                      <div class="flex flex-col">
                        <h3
                          class="text-muted-800 dark:text-muted-100 font-sans text-sm font-medium"
                        >
                          {{ member.name }}
                        </h3>
                        <p
                          class="text-muted-500 dark:text-muted-400 font-sans text-xs"
                        >
                          {{ member.role }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <BaseParagraph size="sm" class="text-muted-400">
                      No team members invited
                    </BaseParagraph>
                  </div>
                </div>
              </BaseCard>
            </div>
            <!-- Tools -->
            <div class="col-span-12 sm:col-span-6">
              <BaseCard shape="curved" class="group relative p-6">
                <!-- Edit -->
                <div class="absolute end-3 top-3 z-10">
                  <BaseButtonIcon
                    small
                    shape="full"
                    class="hover:border-primary-500 hover:text-primary-500 dark:hover:border-primary-500 dark:hover:text-primary-500 pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
                    :to="getStep(2).to"
                  >
                    <Icon
                      name="lucide:edit-2"
                      class="pointer-events-none h-3 w-3"
                    />
                  </BaseButtonIcon>
                </div>
                <BaseHeading size="xs" class="mb-4 uppercase">
                  <span class="text-muted-500 dark:text-muted-400">
                    Project tools
                  </span>
                </BaseHeading>
                <div>
                  <div
                    v-if="project.tools && project.tools.length > 0"
                    class="space-y-4"
                  >
                    <div
                      v-for="tool in project.tools"
                      :key="tool.name"
                      class="flex items-center gap-2"
                    >
                      <img :src="tool.logo" class="h-8 w-8" />
                      <div>
                        <div
                          class="text-muted-800 dark:text-muted-100 text-sm font-medium"
                        >
                          {{ tool.name }}
                        </div>
                        <div class="text-muted-400 text-xs">
                          {{ tool.description }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    <BaseParagraph size="sm" class="text-muted-400">
                      No tools selected
                    </BaseParagraph>
                  </div>
                </div>
              </BaseCard>
            </div>

            <div class="col-span-12">
              <BaseCard shape="curved" class="group relative p-6">
                <!-- Edit -->
                <div class="absolute end-3 top-3 z-10">
                  <BaseButtonIcon
                    small
                    shape="full"
                    class="hover:border-primary-500 hover:text-primary-500 dark:hover:border-primary-500 dark:hover:text-primary-500 pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
                    :to="getStep(1).to"
                  >
                    <Icon
                      name="lucide:edit-2"
                      class="pointer-events-none h-3 w-3"
                    />
                  </BaseButtonIcon>
                </div>
                <BaseHeading size="xs" class="mb-4 uppercase">
                  <span class="text-muted-500 dark:text-muted-400">
                    Book Examples
                  </span>
                </BaseHeading>
                <div>
                  <div v-if="book.examples && book.examples.length > 0" class="space-y-4">
            <BaseCard
              v-for="(example, index) in book.examples"
              :key="index"
              shape="curved"
              class="bg-muted-100 dark:bg-muted-900 p-4"
            >
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 sm:col-span-6">
                  <div class="flex flex-col gap-1">
                    <span class="text-muted-400 text-sm">Title</span>
                    <span class="font-medium">{{ example.title }}</span>
                  </div>
                </div>
                <div class="col-span-12 sm:col-span-6">
                  <div class="flex flex-col gap-1">
                    <span class="text-muted-400 text-sm">Author</span>
                    <span class="font-medium">{{ example.author }}</span>
                  </div>
                </div>
                <div class="col-span-12">
                  <div class="flex flex-col gap-1">
                    <span class="text-muted-400 text-sm">Description</span>
                    <span class="font-medium">{{ example.description }}</span>
                  </div>
                </div>
                <div class="col-span-12">
                  <div class="flex flex-col gap-1">
                    <span class="text-muted-400 text-sm">Link</span>
                    <a :href="example.link" target="_blank" class="text-primary-500 hover:underline">
                      {{ example.link }}
                    </a>
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>
          <div v-else class="text-muted-400 text-sm">
            No example books added yet
          </div>
                </div>
              </BaseCard>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="mx-auto max-w-2xl px-4">
        <div class="mb-10 text-center">
          <BaseHeading
            tag="h1"
            size="2xl"
            class="text-muted-800 dark:text-white"
          >
            <span>Congrats! You're all set</span>
          </BaseHeading>
          <BaseParagraph size="sm" class="text-muted-500 dark:text-muted-400">
            <span>Awesome, you just finished creating this project.</span>
          </BaseParagraph>
        </div>

        <BasePlaceholderPage
          title="Get ready for next steps"
          subtitle="You, and the team members you've added can already start working and creating tasks."
        >
          <template #image>
            <img
              src="/img/illustrations/wizard/finish.svg"
              class="mx-auto max-w-[210px] rounded-full"
              alt="Upload files"
            />
          </template>
          <div class="mt-2 text-center">
            <BaseButton to="/book/editor" shape="curved" color="primary" class="w-48">
              <span>View Project</span>
            </BaseButton>
          </div>
        </BasePlaceholderPage>
      </div>
    </div>
  </div>
</template>
