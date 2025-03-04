<template>
  <BaseFocusLoop class="grid grid-cols-2 gap-6 md:max-w-lg md:grid-cols-4">
    <FormSwitchThin
      v-model="values.primary"
      label="Primary"
      color="primary"
    />

    <FormSwitchThin
      v-model="values.info"
      label="Info"
      color="info"
    />

    <FormSwitchThin
      v-model="values.success"
      label="Success"
      color="success"
    />

    <FormSwitchThin
      v-model="values.warning"
      label="Warning"
      color="warning"
    />

    <FormSwitchThin
      v-model="values.danger"
      label="Danger"
      color="danger"
    />
  </BaseFocusLoop>
</template>

<script setup lang="ts">
const values = reactive({
  primary: true,
  info: true,
  success: true,
  warning: true,
  danger: true,
})
</script>
