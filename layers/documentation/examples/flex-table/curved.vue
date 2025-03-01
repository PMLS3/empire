<template>
  <FlexTable>
    <template #header>
      <FlexTableHeading type="shrink">
        <div class="flex items-center">
          <BaseCheckbox
            v-model="selectAll"
            rounded="lg"
            color="primary"
          />
        </div>
      </FlexTableHeading>

      <FlexTableHeading type="grow">
        Member
      </FlexTableHeading>

      <FlexTableHeading type="stable">
        Expertise
      </FlexTableHeading>

      <FlexTableHeading type="stable">
        Rate
      </FlexTableHeading>

      <FlexTableHeading type="stable">
        Status
      </FlexTableHeading>

      <FlexTableHeading type="stable">
        Actions
      </FlexTableHeading>
    </template>

    <FlexTableRow
      v-for="member in team"
      :key="member.id"
      rounded="lg"
    >
      <FlexTableCell type="shrink" data-content="Selection">
        <div class="flex items-center">
          <BaseCheckbox
            v-model="selected"
            :value="`checkbox-${member.id}`"
            rounded="lg"
            class="text-primary-500"
          />
        </div>
      </FlexTableCell>

      <FlexTableCell type="grow" data-content="Member">
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
      </FlexTableCell>

      <FlexTableCell
        type="stable"
        data-content="Expertise"
        light
      >
        {{ member.expertise }}
      </FlexTableCell>

      <FlexTableCell type="stable" data-content="Rate">
        <span class="font-medium">${{ member.rate }}/hour</span>
      </FlexTableCell>

      <FlexTableCell type="stable" data-content="Status">
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
      </FlexTableCell>

      <FlexTableCell type="stable" data-content="Actions">
        <BaseButton
          color="primary"
          variant="outline"
          rounded="lg"
          class="scale-90"
        >
          View
        </BaseButton>
      </FlexTableCell>
    </FlexTableRow>
  </FlexTable>
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
