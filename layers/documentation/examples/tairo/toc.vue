<template>
  <div class="relative flex">
    <div class="flex grow flex-col gap-1">
      <TocAnchor label="Example Anchor level 1" level="1" />

      <TocAnchor label="Example Anchor level 2" level="2" />

      <TocAnchor label="Example Anchor level 3" level="3" />

      <BaseHeading
        as="h4"
        size="sm"
        weight="medium"
      >
        <TocAnchor
          label="Example Anchor level 4"
          level="4"
          prefix="•"
          prefix-classes="opacity-30 group-hover/toc:opacity-100 group-focus/toc:opacity-100 group-visible/toc:opacity-100 text-primary-500 absolute -start-3 -top-0.5"
        />
      </BaseHeading>
    </div>

    <Toc />
  </div>
</template>
