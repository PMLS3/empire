<template>
  <Table rounded="md">
    <template #header>
      <TableHeading uppercase class="p-4">
        <div class="flex items-center">
          <BaseCheckbox
            v-model="selectAll"
            rounded="md"
            color="primary"
          />
        </div>
      </TableHeading>

      <TableHeading uppercase>
        Collaborator
      </TableHeading>

      <TableHeading uppercase>
        Expertise
      </TableHeading>

      <TableHeading uppercase>
        Rate
      </TableHeading>

      <TableHeading uppercase>
        Status
      </TableHeading>

      <TableHeading uppercase class="p-4">
        <span class="sr-only">View</span>
      </TableHeading>
    </template>

    <TableRow v-for="member in team" :key="member.id">
      <TableCell class="p-4">
        <div class="flex items-center">
          <BaseCheckbox
            v-model="selected"
            :value="`table-4-${member.id}`"
            rounded="md"
            color="primary"
          />
        </div>
      </TableCell>

      <TableCell>
        <div class="flex items-center">
          <BaseAvatar :src="member.src" size="sm" />

          <div class="ms-3 leading-none">
            <h4 class="font-sans text-sm font-medium">
              {{ member.name }}
            </h4>

            <p class="text-muted-400 font-sans text-xs font-normal">
              {{ member.role }}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell light>
        {{ member.expertise }}
      </TableCell>

      <TableCell>${{ member.rate }}/hour</TableCell>

      <TableCell>
        <BaseTag
          v-if="member.status === 'Available'"
          color="success"
          variant="pastel"
          rounded="full"
          class="font-medium"
        >
          {{ member.status }}
        </BaseTag>

        <BaseTag
          v-else-if="member.status === 'New'"
          color="info"
          variant="pastel"
          rounded="full"
          class="font-medium"
        >
          {{ member.status }}
        </BaseTag>

        <BaseTag
          v-else-if="member.status === 'Hired'"
          color="warning"
          variant="pastel"
          rounded="full"
          class="font-medium"
        >
          {{ member.status }}
        </BaseTag>
      </TableCell>

      <TableCell>
        <a
          href="#"
          class="text-primary-500 dark:text-primary-400 underline-offset-4 transition-opacity duration-300 hover:underline hover:opacity-75"
        >
          View
        </a>
      </TableCell>
    </TableRow>
  </Table>
</template>

<script setup lang="ts">
const selected = ref([])
const selectAll = ref(false)

const team = [
  {
    id: 0,
    src: '/img/avatars/22.svg',
    name: 'Anna Vrinkof',
    role: 'UI/UX designer',
    expertise: 'UX Design',
    rate: 49,
    status: 'Available',
  },
  {
    id: 1,
    src: '/img/avatars/3.svg',
    name: 'John Cambell',
    role: 'Sales manager',
    expertise: 'Management',
    rate: 74,
    status: 'Hired',
  },
  {
    id: 2,
    src: '/img/avatars/9.svg',
    name: 'Beth Delanoe',
    role: 'Product designer',
    expertise: 'Product',
    rate: 43,
    status: 'Available',
  },
  {
    id: 3,
    src: '/img/avatars/14.svg',
    name: 'Andrew Higgs',
    role: 'Project manager',
    expertise: 'Project',
    rate: 69,
    status: 'New',
  },
]
</script>
