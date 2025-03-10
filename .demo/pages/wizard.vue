<script setup lang="ts">
import type { Project, ProjectStepData } from '../types'

definePageMeta({
  layout: 'empty',
})
useHead({
  titleTemplate: title => `${title} | Wizard - Step ${currentStepId.value + 1}`,
})

const initialState = ref<Project>({
  type: undefined,
  name: '',
  description: '',
  startDate: undefined,
  endDate: undefined,
  customer: {
    name: undefined,
    logo: undefined,
    location: undefined,
  },
  files: null,
  avatar: null,
  team: [],
  tools: [],
  budget: '< 5K',
})

const toaster = useToaster()

const { handleSubmit, currentStepId } = provideMultiStepForm({
  initialState,
  steps: [
    {
      to: '/wizard',
      meta: {
        name: 'Project type',
        title: 'Select project type',
        subtitle: 'Select the type of project you want to create',
      },
      validate({ data, setFieldError, resetFieldError }) {
        resetFieldError(['type'])
        if (!data.value.type) {
          setFieldError('type', 'Please select a type')
        }
      },
    },
    {
      to: '/wizard/step-2',
      meta: {
        name: 'Project info',
        title: 'What is this project about?',
        subtitle: 'Manage better by adding all relevant project information',
      },
      validate({ data, setFieldError, resetFieldError }) {
        resetFieldError(['name'])
        if (!data.value.name) {
          setFieldError('name', 'Please enter a project name')
        }
      },
    },
    {
      to: '/wizard/step-3',
      meta: {
        name: 'Project details',
        title: 'Add more details',
        subtitle: 'Add useful details to your project. You can edit this later',
      },
    },
    {
      to: '/wizard/step-4',
      meta: {
        name: 'Project files',
        title: 'Add files to this project',
        subtitle:
          'Or you can skip this step. You can always add more files later',
      },
    },
    {
      to: '/wizard/step-5',
      meta: {
        name: 'Team members',
        title: 'Who will be working on this project?',
        subtitle: 'Start by adding members to your team',
      },
    },
    {
      to: '/wizard/step-6',
      meta: {
        name: 'Project tools',
        title: 'What tools will you be using?',
        subtitle: 'Choose a set of tools that you\'ll be using in this project',
      },
    },
    {
      to: '/wizard/step-7',
      meta: {
        preview: true,
        name: 'Finish',
        title: 'Make sure it looks good',
        subtitle:
          'You can go back to previous steps if you need to edit anything',
      },
    },
  ],
  onSubmit: async (state, ctx) => {
    // Simulate async request
    await new Promise(resolve => setTimeout(resolve, 4000))

    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Project ${state.name} created!`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })
  },
  onError: (error) => {
    toaster.clearAll()
    toaster.show({
      title: 'Oops!',
      message: error.message,
      color: 'danger',
      icon: 'lucide:alert-triangle',
      closable: true,
    })
  },
})
</script>

<template>
  <SidebarLayout
    :toolbar="false"
    :sidebar="false"
    class="bg-muted-100 dark:bg-muted-900 min-h-screen w-full"
  >
    <template #logo>
      <NuxtLink
        to="/"
        class="text-muted-400 hover:text-primary-500 hover:bg-primary-500/20 flex size-12 items-center justify-center rounded-2xl transition-colors duration-300"
        @click.prevent="$router.back()"
      >
        <Icon name="lucide:arrow-left" class="size-5" />
      </NuxtLink>
    </template>

    <WizardNavigation />

    <form
      action=""
      method="POST"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <div class="pb-32 pt-24">
        <NuxtPage />
      </div>
      <WizardButtons />
    </form>
  </SidebarLayout>
</template>
