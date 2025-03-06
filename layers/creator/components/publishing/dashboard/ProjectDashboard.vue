<script lang="ts" setup>
const { books } = usePublishing()
const toaster = useToaster()

interface ProjectFilter {
  status: 'all' | 'draft' | 'published'
  sort: 'recent' | 'name' | 'status'
}

const filter = ref<ProjectFilter>({
  status: 'all',
  sort: 'recent'
})

const filteredBooks = computed(() => {
  let result = [...books.value]
  
  // Apply status filter
  if (filter.value.status !== 'all') {
    result = result.filter(book => book.status === filter.value.status)
  }

  // Apply sorting
  switch (filter.value.sort) {
    case 'name':
      result.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'status':
      result.sort((a, b) => a.status.localeCompare(b.status))
      break
    case 'recent':
    default:
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  return result
})

const createNewProject = () => {
  useRouter().push('/publishing/book/new')
}

const openProjectSettings = (bookId: string) => {
  useRouter().push(`/publishing/book/${bookId}/settings`)
}

const deleteProject = async (bookId: string) => {
  try {
    // Add actual delete logic here
    toaster.show({
      title: "Success",
      message: "Project deleted successfully",
      color: "success",
      icon: "ph:check-circle",
      closable: true,
    })
  } catch (error) {
    toaster.show({
      title: "Error",
      message: "Failed to delete project",
      color: "danger",
      icon: "ph:x-circle",
      closable: true,
    })
  }
}

const openLayoutLibrary = () => {
  useRouter().push('/publishing/layouts')
}

const openPuzzleGenerator = () => {
  useRouter().push('/publishing/puzzles')
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">Manage your book projects</p>
      </div>
      <div class="flex gap-4">
        <button
          class="btn btn-secondary"
          @click="openLayoutLibrary"
        >
          <icon-ph-layout class="w-4 h-4" />
          <span>Layout Library</span>
        </button>
        <button
          class="btn btn-secondary"
          @click="openPuzzleGenerator"
        >
          <icon-ph-puzzle class="w-4 h-4" />
          <span>Puzzle Generator</span>
        </button>
        <BaseButton
          color="primary"
          @click="createNewProject"
        >
          <Icon name="ph:plus" class="h-5 w-5" />
          <span>New Book</span>
        </BaseButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4">
      <FormSelect
        v-model="filter.status"
        size="sm"
        class="w-32"
      >
        <option value="all">All Status</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </FormSelect>

      <FormSelect
        v-model="filter.sort"
        size="sm"
        class="w-32"
      >
        <option value="recent">Most Recent</option>
        <option value="name">Name</option>
        <option value="status">Status</option>
      </FormSelect>
    </div>

    <!-- Project Grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <BaseCard
        v-for="book in filteredBooks"
        :key="book.id"
        class="relative group"
      >
        <!-- Preview -->
        <div class="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
          <img
            v-if="book.coverImage"
            :src="book.coverImage"
            :alt="book.title"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-gray-400"
          >
            <Icon name="ph:book" class="h-12 w-12" />
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">{{ book.title }}</h3>
              <p class="text-sm text-gray-500">Last edited {{ new Date(book.updatedAt).toLocaleDateString() }}</p>
            </div>
            <BaseDropdown>
              <BaseButton
                color="gray"
                variant="ghost"
                class="!p-1"
              >
                <Icon name="ph:dots-three-vertical" class="h-5 w-5" />
              </BaseButton>

              <template #content>
                <BaseDropdownItem @click="useRouter().push(`/publishing/book/${book.id}`)">
                  <Icon name="ph:pencil" class="h-5 w-5" />
                  <span>Edit</span>
                </BaseDropdownItem>
                <BaseDropdownItem @click="openProjectSettings(book.id)">
                  <Icon name="ph:gear" class="h-5 w-5" />
                  <span>Settings</span>
                </BaseDropdownItem>
                <BaseDropdownItem
                  @click="deleteProject(book.id)"
                  color="danger"
                >
                  <Icon name="ph:trash" class="h-5 w-5" />
                  <span>Delete</span>
                </BaseDropdownItem>
              </template>
            </BaseDropdown>
          </div>

          <!-- Status Badge -->
          <BaseTag
            :color="book.status === 'published' ? 'success' : 'warning'"
            class="mt-2"
          >
            {{ book.status === 'published' ? 'Published' : 'Draft' }}
          </BaseTag>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
