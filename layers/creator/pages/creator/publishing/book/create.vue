<script setup lang="ts">
import type { Project, ProjectStepData } from '../../types'

const { book, createBook } = usePublishing()
const toaster = useToaster()

const { sendContextInfo } = useChatGemini()

definePageMeta({
  layout: 'empty',
})


onMounted(async () => {
  sendContextInfo('We are creating a book'. wizardSteps)
})

const wizardSteps = [
  {
    to: '/publishing/book/create',
    meta: {
      name: 'Book Category',
      title: 'Select book category',
      subtitle: 'Select the category of your book',
    } satisfies ProjectStepData,
  },
  {
    to: '/publishing/book/create/step-2',
    meta: {
      name: 'Book Topic Research',
      title: 'What is your book about?',
      subtitle:
        'The first step in writing a book is to decide what you want to write about.',
    } satisfies ProjectStepData,
  },
  {
    to: '/publishing/book/create/step-3',
    meta: {
      preview: true,
      name: 'Finish',
      title: 'Make sure it looks good',
      subtitle:
        'You can go back to previous steps if you need to edit anything',
    } satisfies ProjectStepData,
  },

]

const router = useRouter()

const { handleSubmit, currentStep } = provideMultiStepForm({
  initialState: book.value,
  steps: wizardSteps,
  onSubmit: async (state, ctx) => {

    console.log('state', state)

    await createBook(state)

    toaster.clearAll()
    toaster.show({
      title: 'Success',
      message: `Workspace ${state.name} created!`,
      color: 'success',
      icon: 'ph:check',
      closable: true,
    })

    if (result.id) {
      useNotification('Success', 'You are registered 🔥🔥')
      router.push('/')
    }
  },
  onError: (error) => {
    useNotification('Oops', `Something went wrong 😢😢 `)
  },
})

useHead({
  titleTemplate: (title: any) =>
    `${title} | Book - Step ${currentStep.value + 1}`,
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
        <RouterView />
      </div>
      <WizardButtons />
    </form>
  </SidebarLayout>
</template>
