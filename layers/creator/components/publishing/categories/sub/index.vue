<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    items: any[]
    selected: any
  }>(),
  {
    items: () => [],
    selected: { subCategory: '' },
  },
)
</script>

<template>
  <BaseCard
    v-for="(item, i) in items"
    :key="i"
    shape="curved"
    class="mb-1 flex cursor-pointer items-center gap-3 p-3"
    @click="$emit('selected', item)"
  >
    <div
      class="flex size-10 shrink-0 items-center justify-center rounded-full"
      :class="getRandomColor()"
    >
      <Icon :name="item.icon" class="size-5" />
    </div>
    <div>
      <BaseHeading
        as="h4"
        size="sm"
        weight="medium"
        lead="tight"
        class="text-muted-800 dark:text-white"
        :class="{
          'text-primary-500 dark:text-primary-500 shadow-2xl':
            selected.subCategory === item.name,
        }"
      >
        <span>{{ item.name }}</span>
      </BaseHeading>
      <BaseParagraph size="xs">
        <span
          class="text-muted-400"
          :class="{
            'text-primary-300 dark:text-primary-300 shadow-2xl':
              selected.subCategory === item.name,
          }"
        >
          {{ item.date }}
        </span>
      </BaseParagraph>
    </div>
    <div class="ms-auto flex items-center">
      <BaseButtonIcon
        shape="curved"
        muted
        class="scale-75"
      >
        <Icon name="lucide:arrow-right" class="size-5" />
      </BaseButtonIcon>
    </div>
  </BaseCard>
</template>
