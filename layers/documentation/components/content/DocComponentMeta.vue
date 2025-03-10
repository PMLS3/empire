<script setup lang="ts">
import { kebabCase } from 'scule'

const props = defineProps<{
  name: string
}>()
const docs = await useDocumentationMeta(() => props.name as any)

/**
 * Wrap https://... links in markdown with <a href="...">...</a>
 */
function wrapExternalLinks(string: string) {
  return string.replace(
    /https?:\/\/[^\s)]+/g,
    url =>
      `<a class="text-primary-600 dark:text-primary-400 hover:underline" href="${url}" rel="noopener noreferrer" target="_blank">${url}</a>`,
  )
}
</script>

<template>
  <div class="border-muted-200 dark:border-muted-800 mb-10 border-b py-6">
    <div class="mb-4 flex items-center">
      <BaseHeading
        v-if="docs.meta?.pascalName"
        as="h2"
        size="xl"
        anchor
        weight="medium"
        class="text-muted-800 dark:text-white"
      >
        <TocAnchor :label="`<${docs.meta?.pascalName}>`" />
      </BaseHeading>
    </div>
    <div
      class="doc-markdown border-muted-200 divansition-shadow dark:border-muted-700 dark:bg-muted-800 hover:shadow-muted-300/30 dark:hover:shadow-muted-800/20 rounded-lg border bg-white duration-300 hover:shadow-lg"
    >
      <div v-if="docs.noOptions" class="mx-auto w-full">
        <div class="px-6 pb-2 pt-6">
          <BaseHeading
            as="h3"
            size="md"
            weight="semibold"
            class="text-muted-800 dark:text-muted-200"
          >
            <TocAnchor
              :id="`${docs?.meta?.kebabName}-usage`"
              :level="3"
              prefix="•"
              prefix-classes="opacity-30 group-hover/toc:opacity-100 group-focus/toc:opacity-100 group-visible/toc:opacity-100 text-primary-500 absolute -start-3 -top-0.5"
              label="Basic usage"
            />
          </BaseHeading>
        </div>

        <div class="p-6">
          <div class="font-alt w-full">
            <div
              class="border-muted-100 dark:border-muted-700 mb-6 grid grid-cols-1 gap-6 border-b pb-6 text-sm lg:grid-cols-12"
            >
              <div class="col-span-1 lg:col-span-4">
                <div class="flex">
                  <div
                    class="text-muted-600 dark:text-muted-300 font-mono text-xs font-medium"
                  >
                    <span>This component has no props</span>
                  </div>
                </div>
              </div>
              <div class="col-span-1 lg:col-span-8">
                <CodeGroup class="[&_.shiki]:my-4">
                  <code filename="<app>/components/MyComponent.vue" language="vue">
                    <AddonMarkdownRemark
                      :lines="false"
                      class="max-w-none"
                      :source="docs.renderNoOptions()"
                    />
                  </code>
                </CodeGroup>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Model display -->
      <div v-if="docs.model" class="mx-auto w-full">
        <div class="px-6 pb-2 pt-6">
          <BaseHeading
            as="h3"
            size="md"
            weight="semibold"
            class="text-muted-800 dark:text-muted-200"
          >
            <TocAnchor
              :id="`${docs?.meta?.kebabName}-model`"
              :level="3"
              prefix="•"
              prefix-classes="opacity-30 group-hover/toc:opacity-100 group-focus/toc:opacity-100 group-visible/toc:opacity-100 text-primary-500 absolute -start-3 -top-0.5"
              label="Model"
            />
          </BaseHeading>
        </div>

        <div class="hidden lg:block">
          <div class="div-auto font-alt w-full">
            <div
              class="bg-muted-50 text-muted-400 dark:bg-muted-700 px-4 text-xs font-semibold uppercase"
            >
              <div class="grid grid-cols-1 gap-6 px-2 py-4 lg:grid-cols-12">
                <div class="col-span-1 lg:col-span-3">
                  <div class="text-left font-semibold">
                    Name
                  </div>
                </div>
                <div class="col-span-1 lg:col-span-9">
                  <div class="text-left font-semibold">
                    Type
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div class="div-auto font-alt w-full">
            <div
              class="divide-muted-100 dark:divide-muted-700 space-y-12 divide-y text-sm"
            >
              <div
                :key="docs.model.name"
                class="grid grid-cols-1 gap-6 lg:grid-cols-12"
              >
                <div class="col-span-1 lg:col-span-3">
                  <div class="flex">
                    <div class="text-muted-800 dark:text-muted-100 font-medium">
                      <span
                        class="text-muted-800 dark:text-muted-100 font-mono font-medium"
                      >
                        <code>v-model</code>
                      </span>
                    </div>
                  </div>
                  <div
                    v-if="docs.model.description"
                    class="text-muted-400 whitespace-pre-wrap break-words text-left italic"
                  >
                    {{ docs.model.description }}
                  </div>
                  <div
                    v-if="docs.modelModifiers?.length > 0"
                    class="mt-4 space-y-2 break-words"
                  >
                    <div
                      class="text-muted-400 text-xs font-semibold"
                    >
                      modifiers
                    </div>
                    <div
                      v-for="modifier in docs.modelModifiers"
                      :key="modifier"
                      class="text-muted-400 text-xs"
                    >
                      <p>
                        <code>v-model.{{ modifier }}</code>
                      </p>
                    </div>
                  </div>

                  <div
                    v-if="docs.model.tags?.length > 0"
                    class="mt-3 space-y-2 break-words"
                  >
                    <div
                      v-for="tag in docs.model.tags"
                      :key="tag.name"
                      class="text-muted-400 text-xs"
                    >
                      <p class="font-semibold">
                        @{{ tag.name }}
                      </p>
                      <!-- eslint-disable vue/no-v-html -->
                      <p
                        v-if="tag.text"
                        class="block"
                        v-html="wrapExternalLinks(tag.text)"
                      />
                      <!-- eslint-enable vue/no-v-html -->
                    </div>
                  </div>

                  <BaseTag
                    v-if="docs.model.required"
                    color="danger"
                    size="sm"
                    variant="pastel"
                    class="my-2 font-mono"
                  >
                    Required
                  </BaseTag>
                </div>
                <div class="col-span-1 lg:col-span-9">
                  <AddonMarkdownRemark
                    class="inline-sample"
                    :lines="false"
                    :source="`\`\`\`ts\n${docs.model.type.replaceAll('unknown', 'T')}\n\`\`\``"
                  />
                </div>
                <div class="col-span-1 lg:col-span-9 lg:col-start-4">
                  <details class="group">
                    <summary
                      class="nui-focus hover:bg-muted-100 text-muted-500 inline-flex cursor-pointer list-none items-center justify-center gap-2 rounded-lg px-2 py-1.5 font-sans text-[0.8rem] transition-all duration-100"
                    >
                      <span class="inline group-open:hidden">Show example</span>
                      <span class="hidden group-open:inline">Hide example</span>
                      <Icon
                        name="lucide:chevron-down"
                        class="text-muted-400 size-4 transition-transform duration-200 group-open:rotate-180"
                      />
                    </summary>

                    <CodeGroup class="[&_.shiki]:my-4">
                      <code filename="<app>/components/MyComponent.vue" language="vue">
                        <AddonMarkdownRemark
                          :lines="false"
                          class="max-w-none"
                          :source="docs.renderModel(docs.model)"
                        />
                      </code>
                    </CodeGroup>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Props display -->
      <div v-if="docs.props?.length > 0" class="mx-auto w-full">
        <div class="px-6 pb-2 pt-6">
          <BaseHeading
            as="h3"
            size="md"
            weight="semibold"
            class="text-muted-800 dark:text-muted-200"
          >
            <TocAnchor
              :id="`${docs?.meta?.kebabName}-properties`"
              :level="3"
              prefix="•"
              prefix-classes="opacity-30 group-hover/toc:opacity-100 group-focus/toc:opacity-100 group-visible/toc:opacity-100 text-primary-500 absolute -start-3 -top-0.5"
              label="Properties"
            />
          </BaseHeading>
        </div>

        <div class="hidden lg:block">
          <div class="div-auto font-alt w-full">
            <div
              class="bg-muted-50 text-muted-400 dark:bg-muted-700 px-4 text-xs font-semibold uppercase"
            >
              <div class="grid grid-cols-1 gap-6 px-2 py-4 lg:grid-cols-12">
                <div class="col-span-1 lg:col-span-3">
                  <div class="text-left font-semibold">
                    Name
                  </div>
                </div>
                <div class="col-span-2 lg:col-span-9">
                  <div class="text-left font-semibold">
                    Type
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div class="font-alt w-full">
            <div
              v-for="prop in docs.props"
              :key="prop.name"
              class="border-muted-100 dark:border-muted-700 mb-6 grid grid-cols-1 gap-6 border-b pb-6 text-sm lg:grid-cols-12"
            >
              <div class="col-span-1 lg:col-span-3">
                <div class="flex">
                  <div class="text-muted-800 dark:text-muted-100 font-medium">
                    <span
                      class="text-muted-800 dark:text-muted-100 font-mono font-medium"
                    >
                      <code>{{ kebabCase(prop.name) }}</code>
                    </span>
                  </div>
                </div>

                <div
                  v-if="prop.description"
                  class="text-muted-400 whitespace-pre-wrap break-words text-left italic"
                >
                  {{ prop.description }}
                </div>
                <div
                  v-if="prop.tags?.length > 0"
                  class="mt-3 space-y-2 break-words"
                >
                  <div
                    v-for="tag in prop.tags"
                    :key="tag.name"
                    class="text-muted-400 text-xs"
                  >
                    <p class="font-semibold">
                      @{{ tag.name }}
                    </p>
                    <!-- eslint-disable vue/no-v-html -->
                    <p
                      v-if="tag.text"
                      class="block"
                      v-html="wrapExternalLinks(tag.text)"
                    />
                    <!-- eslint-enable vue/no-v-html -->
                  </div>
                </div>

                <BaseTag
                  v-if="prop.required"
                  color="danger"
                  size="sm"
                  variant="pastel"
                  class="my-2 font-mono"
                >
                  Required
                </BaseTag>
              </div>
              <div class="col-span-2 lg:col-span-9">
                <AddonMarkdownRemark
                  class="inline-sample"
                  :lines="false"
                  :source="`\`\`\`ts\n/* default: ${prop.default} */\n${docs.formatPropType(prop.type)}\n\`\`\``"
                />
              </div>
              <!-- <div class="col-span-1 lg:col-span-4">
                <AddonMarkdownRemark
                  class="inline-sample"
                  :lines="false"
                  :source="`\`\`\`ts\n${
                    !prop.default || prop.default === 'undefined'
                      ? 'undefined'
                      : prop.default
                  }\n\`\`\``"
                />
              </div> -->
              <div class="col-span-1 lg:col-span-9 lg:col-start-4">
                <details class="group">
                  <summary
                    class="nui-focus hover:bg-muted-100 text-muted-500 inline-flex cursor-pointer list-none items-center justify-center gap-2 rounded-lg px-2 py-1.5 font-sans text-[0.8rem] transition-all duration-100"
                  >
                    <span class="inline group-open:hidden">Show example</span>
                    <span class="hidden group-open:inline">Hide example</span>
                    <Icon
                      name="lucide:chevron-down"
                      class="text-muted-400 size-4 transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>

                  <CodeGroup class="[&_.shiki]:my-4">
                    <code filename="<app>/components/MyComponent.vue" language="vue">
                      <AddonMarkdownRemark
                        :lines="false"
                        class="max-w-none"
                        :source="docs.renderProperty(prop)"
                      />
                    </code>
                  </CodeGroup>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Configurable Props display -->
      <div v-if="docs.configurableProps?.length > 0" class="mx-auto w-full">
        <div class="px-6 pb-2 pt-6">
          <BaseHeading
            as="h3"
            size="md"
            weight="semibold"
            class="text-muted-800 dark:text-muted-200"
          >
            <TocAnchor
              :id="`${docs?.meta?.kebabName}-properties-app-config`"
              :level="3"
              prefix="•"
              prefix-classes="opacity-30 group-hover/toc:opacity-100 group-focus/toc:opacity-100 group-visible/toc:opacity-100 text-primary-500 absolute -start-3 -top-0.5"
              label="Properties (with app.config)"
            />
          </BaseHeading>
        </div>

        <div class="hidden lg:block">
          <div class="div-auto font-alt w-full">
            <div
              class="bg-muted-50 text-muted-400 dark:bg-muted-700 px-4 text-xs font-semibold uppercase"
            >
              <div class="grid grid-cols-1 gap-6 px-2 py-4 lg:grid-cols-12">
                <div class="col-span-1 lg:col-span-3">
                  <div class="text-left font-semibold">
                    Name
                  </div>
                </div>
                <div class="col-span-2 lg:col-span-9">
                  <div class="text-left font-semibold">
                    Type
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div class="font-alt w-full">
            <div
              v-for="prop in docs.configurableProps"
              :key="prop.name"
              class="border-muted-100 dark:border-muted-700 mb-6 grid grid-cols-1 gap-6 border-b pb-6 text-sm lg:grid-cols-12"
            >
              <div class="col-span-1 lg:col-span-3">
                <div class="flex">
                  <div class="text-muted-800 dark:text-muted-100 font-medium">
                    <span
                      class="text-muted-800 dark:text-muted-100 font-mono font-medium"
                    >
                      <code>{{ kebabCase(prop.name) }}</code>
                    </span>
                  </div>
                </div>

                <div
                  v-if="prop.description"
                  class="text-muted-400 whitespace-pre-wrap break-words text-left italic"
                >
                  {{ prop.description }}
                </div>
                <div
                  v-if="(prop.tags.filter((tag: any) => tag.name !== 'default'))?.length > 0"
                  class="mt-3 space-y-2 break-words"
                >
                  <div
                    v-for="tag in (prop.tags.filter((tag: any) => tag.name !== 'default'))"
                    :key="tag.name"
                    class="text-muted-400 text-xs"
                  >
                    <p class="font-semibold">
                      @{{ tag.name }}
                    </p>
                    <!-- eslint-disable vue/no-v-html -->
                    <p
                      v-if="tag.text"
                      class="block"
                      v-html="wrapExternalLinks(tag.text)"
                    />
                  <!-- eslint-enable vue/no-v-html -->
                  </div>
                </div>

                <BaseTag
                  v-if="prop.required"
                  color="danger"
                  size="sm"
                  variant="pastel"
                  class="my-2 font-mono"
                >
                  Required
                </BaseTag>
              </div>
              <div class="col-span-2 lg:col-span-9">
                <AddonMarkdownRemark
                  class="inline-sample"
                  :lines="false"
                  :source="`\`\`\`ts\n/* app.config.ts\n\ndefineAppConfig(${JSON.stringify({
                    nui: {
                      [docs.meta?.pascalName]: {
                        [prop.name]: prop.tags.find((tag: any) => tag.name === 'default')?.text?.replaceAll('\'', ''),
                      }
                    }
                  }, null, 2)}) */\n\n${docs.formatPropType(prop.type)}\n\`\`\``"
                />
              </div>
              <div class="col-span-1 lg:col-span-9 lg:col-start-4">
                <details class="group">
                  <summary
                    class="nui-focus hover:bg-muted-100 text-muted-500 inline-flex cursor-pointer list-none items-center justify-center gap-2 rounded-lg px-2 py-1.5 font-sans text-[0.8rem] transition-all duration-100"
                  >
                    <span class="inline group-open:hidden">Show example</span>
                    <span class="hidden group-open:inline">Hide example</span>
                    <Icon
                      name="lucide:chevron-down"
                      class="text-muted-400 size-4 transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>
                  <CodeGroup class="[&_.shiki]:my-4">
                    <code filename="<app>/components/MyComponent.vue" language="vue">
                      <AddonMarkdownRemark
                        :lines="false"
                        class="max-w-none"
                        :source="docs.renderProperty(prop)"
                      />
                    </code>
                  </CodeGroup>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Events display -->
      <div v-if="docs.events?.length > 0" class="mx-auto mt-10 w-full">
        <div class="px-6 pb-2 pt-6">
          <BaseHeading
            as="h3"
            size="md"
            weight="semibold"
            class="text-muted-800 dark:text-muted-200"
          >
            <TocAnchor
              :id="`${docs?.meta?.kebabName}-events`"
              :level="3"
              prefix="•"
              prefix-classes="opacity-30 group-hover/toc:opacity-100 group-focus/toc:opacity-100 group-visible/toc:opacity-100 text-primary-500 absolute -start-3 -top-0.5"
              label="Events"
            />
          </BaseHeading>
        </div>

        <div class="hidden lg:block">
          <div class="div-auto font-alt w-full">
            <div
              class="bg-muted-50 text-muted-400 dark:bg-muted-700 px-4 text-xs font-semibold uppercase"
            >
              <div class="grid grid-cols-1 gap-6 px-2 py-4 lg:grid-cols-12">
                <div class="col-span-1 lg:col-span-3">
                  <div class="text-left font-semibold">
                    Name
                  </div>
                </div>
                <div class="col-span-1 lg:col-span-9">
                  <div class="text-left font-semibold">
                    Emitted Value Type
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div class="div-auto font-alt w-full">
            <div
              v-for="event in docs.events"
              :key="event.type"
              class="border-muted-100 dark:border-muted-700 mb-6 grid grid-cols-1 gap-6 border-b pb-6 text-sm lg:grid-cols-12"
            >
              <div class="col-span-1 lg:col-span-3">
                <div class="flex items-center">
                  <div
                    class="text-muted-800 dark:text-muted-100 font-mono font-medium"
                  >
                    <code>@{{ event.name }}</code>
                    <div
                      v-if="event.description"
                      class="text-muted-400 whitespace-pre-wrap break-words text-left italic"
                    >
                      {{ event.description }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-span-1 lg:col-span-9">
                <BaseMessage v-if="event.type === '[]'">
                  This events receive no value
                </BaseMessage>
                <AddonMarkdownRemark
                  v-else
                  class="inline-sample max-w-none"
                  :lines="false"
                  :source="`\`\`\`ts\n${(event.type.startsWith('[')
                    ? event.type.slice(1, -1)
                    : event.type
                  ).replace('value?: ', '')}\n\`\`\``"
                />
              </div>
              <div class="col-span-1 lg:col-span-9 lg:col-start-4">
                <details class="group">
                  <summary
                    class="nui-focus hover:bg-muted-100 text-muted-500 inline-flex cursor-pointer list-none items-center justify-center gap-2 rounded-lg px-2 py-1.5 font-sans text-[0.8rem] transition-all duration-100"
                  >
                    <span class="inline group-open:hidden">Show example</span>
                    <span class="hidden group-open:inline">Hide example</span>
                    <Icon
                      name="lucide:chevron-down"
                      class="text-muted-400 size-4 transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>
                  <CodeGroup class="[&_.shiki]:my-4">
                    <code filename="<app>/components/MyComponent.vue" language="vue">
                      <AddonMarkdownRemark
                        :lines="false"
                        class="max-w-none"
                        :source="docs.renderEvents(event)"
                      />
                    </code>
                  </CodeGroup>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Slots display -->
      <div v-if="docs.slots?.length > 0" class="mx-auto mt-10 w-full">
        <div class="px-6 pb-2 pt-6">
          <BaseHeading
            as="h3"
            size="md"
            weight="semibold"
            class="text-muted-800 dark:text-muted-200"
          >
            <TocAnchor
              :id="`${docs?.meta?.kebabName}-slots`"
              :level="3"
              prefix="•"
              prefix-classes="opacity-30 group-hover/toc:opacity-100 group-focus/toc:opacity-100 group-visible/toc:opacity-100 text-primary-500 absolute -start-3 -top-0.5"
              label="Slots"
            />
          </BaseHeading>
        </div>

        <div class="hidden lg:block">
          <div class="div-auto font-alt w-full">
            <div
              class="bg-muted-50 text-muted-400 dark:bg-muted-700 px-4 text-xs font-semibold uppercase"
            >
              <div class="grid grid-cols-1 gap-6 px-2 py-4 lg:grid-cols-12">
                <div class="col-span-1 lg:col-span-3">
                  <div class="text-left font-semibold">
                    Name
                  </div>
                </div>
                <div class="col-span-1 lg:col-span-9">
                  <div class="text-left font-semibold">
                    Slot Prop Type
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div class="div-auto font-alt w-full">
            <div
              v-for="slot in docs.slots"
              :key="slot.name"
              class="border-muted-100 dark:border-muted-700 mb-6 grid grid-cols-1 gap-6 border-b pb-6 text-sm lg:grid-cols-12"
            >
              <div class="col-span-1 lg:col-span-3">
                <div class="flex items-center">
                  <div
                    class="text-muted-800 dark:text-muted-100 font-mono font-medium"
                  >
                    <code>#{{ slot.name }}</code>
                    <div
                      v-if="slot.description"
                      class="text-muted-400 whitespace-pre-wrap break-words text-left italic"
                    >
                      {{ slot.description }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-span-1 lg:col-span-9">
                <BaseMessage v-if="slot.type === 'Record<string, never>' || slot.type === '{}'">
                  This slot has no inherted props
                </BaseMessage>
                <AddonMarkdownRemark
                  v-else
                  class="inline-sample max-w-none"
                  :lines="false"
                  :source="`\`\`\`ts\n${docs.formatPropType(slot.type)}\n\`\`\``"
                />
              </div>
              <div class="col-span-1 lg:col-span-9 lg:col-start-4">
                <details class="group">
                  <summary
                    class="nui-focus hover:bg-muted-100 text-muted-500 inline-flex cursor-pointer list-none items-center justify-center gap-2 rounded-lg px-2 py-1.5 font-sans text-[0.8rem] transition-all duration-100"
                  >
                    <span class="inline group-open:hidden">Show example</span>
                    <span class="hidden group-open:inline">Hide example</span>
                    <Icon
                      name="lucide:chevron-down"
                      class="text-muted-400 size-4 transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>
                  <CodeGroup class="[&_.shiki]:my-4">
                    <code filename="<app>/components/MyComponent.vue" language="vue">
                      <AddonMarkdownRemark
                        :lines="false"
                        class="max-w-none"
                        :source="docs.renderSlot(slot)"
                      />
                    </code>
                  </CodeGroup>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Exposed display -->
      <div v-if="docs.exposed?.length > 0" class="mx-auto mt-10 w-full">
        <div class="px-6 pb-2 pt-6">
          <BaseHeading
            as="h3"
            size="md"
            weight="semibold"
            class="text-muted-800 dark:text-muted-200"
          >
            <TocAnchor
              :id="`${docs?.meta?.kebabName}-exposed`"
              :level="3"
              prefix="•"
              prefix-classes="opacity-30 group-hover/toc:opacity-100 group-focus/toc:opacity-100 group-visible/toc:opacity-100 text-primary-500 absolute -start-3 -top-0.5"
              label="Exposed"
            />
          </BaseHeading>
        </div>

        <div class="hidden lg:block">
          <div class="div-auto font-alt w-full">
            <div
              class="bg-muted-50 text-muted-400 dark:bg-muted-700 px-4 text-xs font-semibold uppercase"
            >
              <div class="grid grid-cols-1 gap-6 px-2 py-4 lg:grid-cols-12">
                <div class="col-span-1 lg:col-span-3">
                  <div class="text-left font-semibold">
                    Name
                  </div>
                </div>
                <div class="col-span-1 lg:col-span-9">
                  <div class="text-left font-semibold">
                    Type
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div class="div-auto font-alt w-full">
            <div
              v-for="exposed in docs.exposed"
              :key="exposed.name"
              class="border-muted-100 dark:border-muted-700 mb-6 grid grid-cols-1 gap-6 border-b pb-6 text-sm lg:grid-cols-12"
            >
              <div class="col-span-1 lg:col-span-3">
                <div class="flex items-center">
                  <div
                    class="text-muted-800 dark:text-muted-100 font-mono font-medium"
                  >
                    <code>{{ exposed.name }}</code>
                  </div>
                </div>
                <div
                  class="text-muted-400 whitespace-pre-wrap break-words text-left italic"
                >
                  {{ exposed.description }}
                </div>
              </div>
              <div class="col-span-1 lg:col-span-9">
                <AddonMarkdownRemark
                  class="inline-sample max-w-none"
                  :lines="false"
                  :source="`\`\`\`ts\n${exposed.type.replaceAll(' | ', '\n  | ')}\n\`\`\``"
                />
              </div>
              <div class="col-span-1 lg:col-span-9 lg:col-start-4">
                <details class="group">
                  <summary
                    class="nui-focus hover:bg-muted-100 text-muted-500 inline-flex cursor-pointer list-none items-center justify-center gap-2 rounded-lg px-2 py-1.5 font-sans text-[0.8rem] transition-all duration-100"
                  >
                    <span class="inline group-open:hidden">Show example</span>
                    <span class="hidden group-open:inline">Hide example</span>
                    <Icon
                      name="lucide:chevron-down"
                      class="text-muted-400 size-4 transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>
                  <CodeGroup class="[&_.shiki]:my-4">
                    <code filename="<app>/components/MyComponent.vue" language="vue">
                      <AddonMarkdownRemark
                        :lines="false"
                        class="max-w-none"
                        :source="docs.renderExposed(exposed)"
                      />
                    </code>
                  </CodeGroup>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inline-sample:deep(.shiki) {
  @apply my-0;
}
</style>
