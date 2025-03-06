<script setup lang="ts">
import type { Project, ProjectStepData, ProjectType } from '../../types'

definePageMeta({
  title: 'Wizard — Step 1',
})

const {
  getNextStep,
  data: project,
  goToStep,
} = useMultiStepForm<Project, ProjectStepData>()

useHead({
  title: 'Book Category',
})

// Handle category selection
function onSelectType(type: ProjectType) {
  project.value.category = type.name
  const next = getNextStep()
  if (next) {
    goToStep(next)
  }
}

// Listen for category selection from AI
onMounted(() => {
  window.addEventListener('category-selected', ((event: CustomEvent) => {
    console.log('Category selected event received:', event.detail)
    onSelectType({ name: event.detail.category } as ProjectType)
  }) as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('category-selected', ((event: CustomEvent) => {
    onSelectType({ name: event.detail.category } as ProjectType)
  }) as EventListener)
})
</script>

<template>
  <div>
    <WizardStepTitle />
    <div class="mx-auto w-full max-w-6xl px-4 text-center">
      <div class="ltablet:grid-cols-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <publishing-categories @select="onSelectType" />
      </div>
    </div>
  </div>
</template>
