<script setup lang="ts">
const { bookCategories } = usePublishing();
</script>
 
<template>
  <BaseCard
    v-for="(item, i) in bookCategories"
    :key="i"
    shape="curved"
    class="flex items-center gap-3 p-3"
  >
    <div
      class="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
      :class="getRandomColor()"
    >
      <Icon :name="item.icon" class="w-5 h-5" />
    </div>
    <div>
      <BaseHeading
        as="h4"
        size="sm"
        weight="medium"
        lead="tight"
        class="text-muted-800 dark:text-white"
      >
        <span>{{ item.name }}</span>
      </BaseHeading>
      <BaseParagraph size="xs">
        <span class="text-muted-400">
          {{ item.date }}
        </span>
      </BaseParagraph>
    </div>
    <div class="flex items-center ms-auto">
    <BaseButtonIcon shape="curved" muted class="scale-75" 
    @click="(e) => $emit('selectCategory', item)"
    >
        <Icon name="lucide:arrow-right" class="w-5 h-5" />
      </BaseButtonIcon>
    </div>
  </BaseCard>
</template>
