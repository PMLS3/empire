<script setup lang="ts">

const resolveComponentName = (name: string) => {

  return resolveComponent(name)
}

const chatCanvasElements: any[] = useState('chatCanvasElements', () => { return [] })
const chatCanvasMainElement: any = useState('chatCanvasMainElement', () => {
  return {
    name: 'DashboardPersonal',
    description: 'Create a new publishing book step 1',
    className: '',
    props: {
      default: true,
    },
    route: '/publishing-dashboard'
  }
})
</script>

<template>
  <div class="flex flex-col h-full p-2 relative">
    <div v-if="chatCanvasElements.length > 0 && !chatCanvasMainElement.name" class="flex flex-col h-full">
      <div v-for="element in chatCanvasElements" :key="element" :class="element.class">
        <div class="flex justify-end">
          <Icon name="mdi:close" @click="chatCanvasElements = chatCanvasElements.filter(e => e !== element)" />
          <Icon name="mdi:window" @click="chatCanvasMainElement.name = element.name" />
        </div>
        <component :is="resolveComponentName(element.name)" v-bind="element.props" />
      </div>
    </div>
    <div v-else-if="chatCanvasMainElement.name">

      <component :is="resolveComponentName(chatCanvasMainElement.name)" v-bind="chatCanvasMainElement.props" />
    </div>
    <div v-else class="flex flex-col h-full">
      <div class="flex justify-end text-white">
        <Icon name="mdi:close" @click="chatCanvasElements = chatCanvasElements.filter(e => e !== element)" />
        <Icon name="mdi:window" @click="chatCanvasMainElement.name = element.name" />
      </div>
      <div class="flex justify-center items-center h-full">
        C
      </div>
    </div>
  </div>
</template>
