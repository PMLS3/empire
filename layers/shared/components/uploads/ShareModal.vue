<script setup lang="ts">
interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface Workspace {
  id: string
  name: string
  owner_id: string
}

interface ShareSettings {
  public: boolean
  workspace: boolean
  users: string[]
  workspaces: string[]
}

interface SharedItem {
  id: string
  name: string
  type: 'file' | 'folder'
  owner_id: string
  workspace_id: string
  share_settings: ShareSettings
}

const props = defineProps<{
  item: SharedItem
}>()

const emit = defineEmits<{
  close: []
  update: [settings: ShareSettings]
}>()

const { currentWorkspace, workspaces } = useWorkspaces()
const { searchUsers } = useUsers()

const isPublic = ref(props.item.share_settings.public)
const isWorkspaceShared = ref(props.item.share_settings.workspace)
const selectedUsers = ref<User[]>([])
const selectedWorkspaces = ref<Workspace[]>([])
const searchQuery = ref('')
const searchResults = ref<User[]>([])

// Load initial selections
onMounted(async () => {
  if (props.item.share_settings.users.length) {
    // Fetch user details for selected users
    // This would be implemented in useUsers()
    selectedUsers.value = await searchUsers(props.item.share_settings.users)
  }
  
  if (props.item.share_settings.workspaces.length) {
    selectedWorkspaces.value = workspaces.value.filter(w => 
      props.item.share_settings.workspaces.includes(w.id)
    )
  }
})

// Search users as you type
watch(searchQuery, async (query) => {
  if (query.length < 2) {
    searchResults.value = []
    return
  }
  searchResults.value = await searchUsers(query)
})

function addUser(user: User) {
  if (!selectedUsers.value.find(u => u.id === user.id)) {
    selectedUsers.value.push(user)
  }
  searchQuery.value = ''
}

function removeUser(userId: string) {
  selectedUsers.value = selectedUsers.value.filter(u => u.id !== userId)
}

function toggleWorkspace(workspace: Workspace) {
  const index = selectedWorkspaces.value.findIndex(w => w.id === workspace.id)
  if (index === -1) {
    selectedWorkspaces.value.push(workspace)
  } else {
    selectedWorkspaces.value.splice(index, 1)
  }
}

function save() {
  emit('update', {
    public: isPublic.value,
    workspace: isWorkspaceShared.value,
    users: selectedUsers.value.map(u => u.id),
    workspaces: selectedWorkspaces.value.map(w => w.id)
  })
  emit('close')
}
</script>

<template>
  <Modal :open="true" size="lg" @close="emit('close')">
    <template #header>
      <BaseHeading tag="h3" size="lg" weight="medium">
        Share {{ item.name }}
      </BaseHeading>
    </template>

    <div class="space-y-6 p-6">
      <!-- Public Access -->
      <div class="flex items-center justify-between">
        <div>
          <BaseHeading tag="h4" size="sm" weight="medium" class="mb-1">
            Public Access
          </BaseHeading>
          <p class="text-muted-400 text-sm">
            Anyone with the link can view this {{ item.type }}
          </p>
        </div>
        <BaseSwitch v-model="isPublic" />
      </div>

      <!-- Workspace Access -->
      <div class="flex items-center justify-between">
        <div>
          <BaseHeading tag="h4" size="sm" weight="medium" class="mb-1">
            Workspace Access
          </BaseHeading>
          <p class="text-muted-400 text-sm">
            All members of {{ currentWorkspace.name }} can access
          </p>
        </div>
        <BaseSwitch v-model="isWorkspaceShared" />
      </div>

      <!-- User Access -->
      <div>
        <BaseHeading tag="h4" size="sm" weight="medium" class="mb-4">
          Share with Users
        </BaseHeading>
        
        <FormInput
          v-model="searchQuery"
          icon="lucide:search"
          placeholder="Search users by email..."
          class="mb-4"
        />

        <div v-if="searchResults.length" class="mb-4">
          <ul class="border-muted-200 dark:border-muted-700 divide-muted-200 dark:divide-muted-700 divide-y rounded-lg border">
            <li 
              v-for="user in searchResults"
              :key="user.id"
              class="flex items-center justify-between p-3"
            >
              <div class="flex items-center gap-3">
                <BaseAvatar
                  :src="user.avatar"
                  :text="user.name"
                  size="sm"
                />
                <div>
                  <p class="text-muted-800 dark:text-muted-100 text-sm font-medium">
                    {{ user.name }}
                  </p>
                  <p class="text-muted-400 text-xs">
                    {{ user.email }}
                  </p>
                </div>
              </div>
              <BaseButton size="sm" @click="addUser(user)">
                Add
              </BaseButton>
            </li>
          </ul>
        </div>

        <div v-if="selectedUsers.length" class="space-y-2">
          <div 
            v-for="user in selectedUsers"
            :key="user.id"
            class="border-muted-200 dark:border-muted-700 flex items-center justify-between rounded-lg border p-3"
          >
            <div class="flex items-center gap-3">
              <BaseAvatar
                :src="user.avatar"
                :text="user.name"
                size="sm"
              />
              <div>
                <p class="text-muted-800 dark:text-muted-100 text-sm font-medium">
                  {{ user.name }}
                </p>
                <p class="text-muted-400 text-xs">
                  {{ user.email }}
                </p>
              </div>
            </div>
            <button
              class="text-muted-400 hover:text-danger-500"
              @click="removeUser(user.id)"
            >
              <Icon name="lucide:x" class="size-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Workspace Access -->
      <div v-if="workspaces.length > 1">
        <BaseHeading tag="h4" size="sm" weight="medium" class="mb-4">
          Share with Other Workspaces
        </BaseHeading>
        
        <div class="space-y-2">
          <div 
            v-for="workspace in workspaces"
            :key="workspace.id"
            v-show="workspace.id !== currentWorkspace.id"
            class="border-muted-200 dark:border-muted-700 flex items-center justify-between rounded-lg border p-3"
          >
            <div class="flex items-center gap-3">
              <BaseAvatar
                :text="workspace.name"
                size="sm"
              />
              <p class="text-muted-800 dark:text-muted-100 text-sm font-medium">
                {{ workspace.name }}
              </p>
            </div>
            <BaseCheckbox
              :model-value="selectedWorkspaces.some(w => w.id === workspace.id)"
              @update:model-value="toggleWorkspace(workspace)"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton variant="outline" @click="emit('close')">
          Cancel
        </BaseButton>
        <BaseButton @click="save">
          Update Sharing
        </BaseButton>
      </div>
    </template>
  </Modal>
</template> 