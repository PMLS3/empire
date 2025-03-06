<script lang="ts" setup>
const step = ref<'select' | 'customize'>('select')
const selectedTemplate = ref<any>(null)
const toaster = useToaster()

const emit = defineEmits(['select'])

const handleTemplateSelect = (template: any) => {
  selectedTemplate.value = template
  step.value = 'customize'
}

const handleCustomizationSave = (customizedTemplate: any) => {
  emit('select', customizedTemplate)
  toaster.show({
    title: "Success",
    message: "Template applied successfully",
    color: "success",
    icon: "ph:check-circle",
    closable: true,
  })
}

const handleCustomizationCancel = () => {
  step.value = 'select'
  selectedTemplate.value = null
}
</script>

<template>
  <div>
    <PublishingTemplatesGrid
      v-if="step === 'select'"
      @select="handleTemplateSelect"
    />

    <PublishingTemplatesCustomizer
      v-else
      :template="selectedTemplate"
      @save="handleCustomizationSave"
      @cancel="handleCustomizationCancel"
    />
  </div>
</template>
