<script lang="ts" setup>
const props = defineProps<{
  selectedFont: string
  selectedColor: any
  fonts: Array<{ label: string; value: string }>
  colors: Array<{ label: string; value: string }>
}>()

const emit = defineEmits(['update:selectedFont', 'update:selectedColor'])
</script>

<template>
  <div class="h-16 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center space-x-4">
    <!-- Font Selector -->
    <FormSelect
      :model-value="selectedFont"
      @update:model-value="emit('update:selectedFont', $event)"
      size="sm"
      class="w-32"
    >
      <option v-for="font in fonts" :key="font.value" :value="font.value">
        {{ font.label }}
      </option>
    </FormSelect>

    <!-- Color Picker -->
    <FormSelect
      :model-value="selectedColor"
      @update:model-value="emit('update:selectedColor', $event)"
      size="sm"
      class="w-32"
    >
      <template #prefix>
        <div
          class="w-4 h-4 rounded-full"
          :style="{ backgroundColor: selectedColor.value }"
        />
      </template>
      <option v-for="color in colors" :key="color.value" :value="color">
        {{ color.label }}
      </option>
    </FormSelect>

    <!-- Text Alignment -->
    <BaseButtonGroup size="sm">
      <BaseButtonIcon color="gray"><Icon name="material-symbols:align-horizontal-left-rounded" class="h-4 w-4" /></BaseButtonIcon>
      <BaseButtonIcon color="gray"><Icon name="material-symbols:align-horizontal-center" class="h-4 w-4" /></BaseButtonIcon>
      <BaseButtonIcon color="gray"><Icon name="material-symbols:align-horizontal-right-rounded" class="h-4 w-4" /></BaseButtonIcon>
    </BaseButtonGroup>

    <!-- Text Style -->
    <BaseButtonGroup size="sm">
      <BaseButtonIcon color="gray"><Icon name="i-heroicons-bold" class="h-4 w-4" /></BaseButtonIcon>
      <BaseButtonIcon color="gray"><Icon name="i-heroicons-italic" class="h-4 w-4" /></BaseButtonIcon>
      <BaseButtonIcon color="gray"><Icon name="i-heroicons-underline" class="h-4 w-4" /></BaseButtonIcon>
    </BaseButtonGroup>
  </div>
</template>
