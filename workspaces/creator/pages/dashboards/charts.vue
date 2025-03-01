<script setup lang="ts">
definePageMeta({
  title: 'Apex Charts',
  preview: {
    title: 'Chart examples',
    description: 'For data visualization',
    categories: ['dashboards'],
    src: '/img/screens/dashboards-charts.png',
    srcDark: '/img/screens/dashboards-charts-dark.png',
    order: 26,
  },
})
</script>

<template>
  <div>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <ChartLine />
      <ChartLineMulti />
      <ChartLineStep />
      <ChartArea />
      <ChartAreaMulti />
      <ChartBar />
      <ChartBarMulti />
      <ChartBarStacked />
      <ChartBarRange />
      <ChartBarHorizontal />
      <ChartBarHorizontalMulti />
      <ChartTimeline />
      <ChartBubble />
      <ChartScatter />
      <ChartPie />
      <ChartDonut />
      <ChartRadial />
      <ChartRadialMulti />
      <ChartRadialGauge />
      <ChartRadialGaugeAlt />
    </div>
  </div>
</template>
