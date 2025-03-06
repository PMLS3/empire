<script setup lang="ts">
defineProps<{
  item: any;
}>();
const authors = useState("authors", () => {
  return [];
});
const isModalMdOpen = ref(false);
</script>

<template>
  <div class="ltablet:col-span-4 col-span-12 lg:col-span-4">
    <div class="bg-muted-200 dark:bg-muted-800/70 rounded-2xl p-6">
      <Modal :open="isModalMdOpen" size="2xl" @close="isModalMdOpen = false">
        <!-- Body -->
        <!-- <forms-experience
                :selected-experience="selectedExperience"
                :is-edit-modal="isEditModal"
                :selected-experience-index="selectedExperienceIndex"
                @close="isModalMdOpen = false"
              /> -->
        <div class="h-screen overflow-auto p-4">
          <PublishingAuthorCreate />
        </div>
      </Modal>
      <!-- Title -->
      <div class="mb-8 flex items-center justify-between">
        <BaseHeading
          as="h3"
          size="md"
          weight="semibold"
          lead="tight"
          class="text-muted-800 dark:text-white"
        >
          <span>{{ item.title }} </span>
        </BaseHeading>
        <div class="flex scale-90 gap-2 sm:justify-end">
          <BaseButtonAction small @click="isModalMdOpen = !isModalMdOpen">
            Author
          </BaseButtonAction>
          <BaseButtonAction small> Popular </BaseButtonAction>
        </div>
      </div>
      <!-- Posts-->
      <div class="ptablet:grid ptablet:grid-cols-2 flex flex-col gap-6">
        <!-- Post -->
        <NuxtLink class="flex flex-col">
          <img
            src="/img/illustrations/dashboards/writer/post-1.svg"
            alt="Post image"
            class="bg-muted-200 rounded-xl"
          />
          <BaseCard
            class="shadow-muted-300/30 dark:shadow-muted-900/20 -mt-8 !rounded-2xl p-6 shadow-xl"
          >
            <div class="mb-3">
              <BaseHeading
                as="h4"
                size="md"
                weight="light"
                lead="tight"
                class="text-muted-800 mb-1 dark:text-white"
              >
                <span>{{ item.title }} {{ item.subTitle }}</span>
              </BaseHeading>
              <BaseParagraph size="xs">
                <span class="text-muted-400">
                  {{ item.description }}
                </span>
              </BaseParagraph>
            </div>
            <div class="flex gap-3">
              <BaseAvatar
                src="/img/avatars/6.svg"
                text="BT"
                size="xs"
                class="bg-primary-100 dark:bg-primary-500/20 text-primary-500 shrink-0"
              />
              <div>
                <BaseHeading
                  as="h4"
                  size="xs"
                  weight="light"
                  lead="tight"
                  class="text-muted-800 dark:text-white"
                >
                  <span>{{ item.author ? item.author.name : "author" }}</span>
                </BaseHeading>
                <BaseParagraph size="xs">
                  <span class="text-muted-400">Novel writer</span>
                </BaseParagraph>
                <BaseSelect
                  v-model="item.author"
                  shape="rounded"
                  label="Currency"
                  class="w-16"
                >
                  <option value=""></option>
                  <option
                    v-for="(auth, index) in authors"
                    :key="index"
                    :value="auth"
                  >
                    {{ auth.first_name }} {{ auth.last_name }}
                  </option>
                </BaseSelect>
              </div>
            </div>
          </BaseCard>
        </NuxtLink>
        <!-- Post -->
        <!-- <NuxtLink to="#" class="flex flex-col">
          <img
            src="/img/illustrations/dashboards/writer/post-2.svg"
            alt="Post image"
            class="bg-muted-200 rounded-xl"
          />
          <BaseCard
            class="shadow-muted-300/30 dark:shadow-muted-900/20 -mt-8 !rounded-2xl p-6 shadow-xl"
          >
            <div class="mb-3">
              <BaseHeading
                as="h4"
                size="md"
                weight="light"
                lead="tight"
                class="text-muted-800 mb-1 dark:text-white"
              >
                <span>5 writing tips just for you</span>
              </BaseHeading>
              <BaseParagraph size="xs">
                <span class="text-muted-400">
                  Some article content and lorem ipsum sit dolor amet as a nice
                  dummy subtitle
                </span>
              </BaseParagraph>
            </div>
            <div class="flex gap-3">
              <BaseAvatar
                src="/img/avatars/5.svg"
                text="BT"
                size="xs"
                class="bg-primary-100 dark:bg-primary-500/20 text-primary-500 shrink-0"
              />
              <div>
                <BaseHeading
                  as="h4"
                  size="xs"
                  weight="light"
                  lead="tight"
                  class="text-muted-800 dark:text-white"
                >
                  <span>Clarissa Miller</span>
                </BaseHeading>
                <BaseParagraph size="xs">
                  <span class="text-muted-400">Novel writer</span>
                </BaseParagraph>
              </div>
            </div>
          </BaseCard>
        </NuxtLink> -->
      </div>
    </div>
  </div>
</template>