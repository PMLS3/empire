<template>
  <div class="flex flex-wrap items-end justify-end gap-6">
    <Popover size="sm" placement="bottom-end">
      <span class="text-muted-500 flex items-center">
        <Icon name="lucide:help-circle" class="me-1 size-4" />

        <span class="font-sans text-sm">Help text</span>
      </span>

      <template #content>
        <PopoverContentHelp
          title="New design"
          subtitle="Adding new designs"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit solor
                      moranitur lobis em."
          icon="lucide:gem"
          icon-color="info"
        />
      </template>
    </Popover>

    <Popover size="sm" placement="bottom-end">
      <span class="text-muted-500 flex items-center">
        <Icon name="lucide:help-circle" class="me-1 size-4" />

        <span class="font-sans text-sm">Help text</span>
      </span>

      <template #content>
        <PopoverContentHelp
          title="Error"
          subtitle="Handling errors"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit solor
                      moranitur lobis em."
          icon="lucide:x-octagon"
          icon-color="danger"
        />
      </template>
    </Popover>
  </div>
</template>
