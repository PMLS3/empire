<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { usePerformanceTesting } from '../../composables/usePerformanceTesting';

const props = defineProps<{
  autoStart?: boolean;
  showControls?: boolean;
}>();

const {
  isRecording,
  metrics,
  frameTimes,
  averageFrameRate,
  startRecording,
  stopRecording,
  clearPerformanceData,
  exportPerformanceData,
} = usePerformanceTesting();

// Filter to view specific types of metrics
const metricFilter = ref<string>('all');

// Available filters
const metricFilters = computed(() => {
  const filters = new Set<string>(['all']);
  
  // Extract component names from metrics
  Object.keys(metrics.value).forEach(metricKey => {
    const parts = metricKey.split(':');
    if (parts.length > 0) {
      filters.add(parts[0]);
    }
  });
  
  return Array.from(filters);
});

// Filtered metrics based on selection
const filteredMetrics = computed(() => {
  if (metricFilter.value === 'all') {
    return metrics.value;
  }
  
  return Object.entries(metrics.value)
    .filter(([key]) => key.startsWith(metricFilter.value + ':'))
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
});

// Format metric values
const formatMetric = (value: number): string => {
  if (value > 1000) {
    return `${(value / 1000).toFixed(2)}s`;
  } else {
    return `${value.toFixed(2)}ms`;
  }
};

// Export metrics to file
const downloadMetrics = () => {
  const data = JSON.stringify(exportPerformanceData(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `performance-metrics-${new Date().toISOString()}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
};

// Start recording if autoStart is true
onMounted(() => {
  if (props.autoStart) {
    startRecording();
  }
});
</script>

<template>
  <div class="performance-viewer">
    <!-- Controls -->
    <div v-if="showControls" class="mb-4 flex flex-wrap gap-3 justify-between items-center">
      <div>
        <BaseHeading size="sm" weight="medium">Performance Metrics</BaseHeading>
      </div>
      
      <div class="flex items-center gap-2">
        <BaseButton
          v-if="!isRecording"
          color="primary"
          size="sm"
          @click="startRecording"
        >
          <Icon name="ph:record-fill" class="size-4 me-1 text-danger-500" />
          Start Recording
        </BaseButton>
        
        <BaseButton
          v-else
          color="danger"
          size="sm"
          @click="stopRecording"
        >
          <Icon name="ph:stop-fill" class="size-4 me-1" />
          Stop Recording
        </BaseButton>
        
        <BaseButton
          color="default"
          size="sm"
          @click="clearPerformanceData"
        >
          Clear
        </BaseButton>
        
        <BaseButton
          color="default"
          size="sm"
          @click="downloadMetrics"
        >
          <Icon name="ph:download-simple-duotone" class="size-4 me-1" />
          Export
        </BaseButton>
      </div>
    </div>
    
    <!-- Frame rate display -->
    <BaseCard v-if="isRecording || frameTimes.length > 0" class="p-4 mb-4">
      <div class="flex items-center justify-between">
        <BaseHeading size="xs" weight="medium">Frame Rate</BaseHeading>
        <div :class="{ 
          'text-success-500': averageFrameRate >= 55, 
          'text-warning-500': averageFrameRate >= 30 && averageFrameRate < 55,
          'text-danger-500': averageFrameRate < 30
        }">
          {{ Math.round(averageFrameRate) }} FPS
        </div>
      </div>
      
      <!-- Frame rate chart -->
      <div class="mt-2 h-24 flex items-end gap-px">
        <div
          v-for="(fps, index) in frameTimes"
          :key="index"
          class="w-1 flex-grow-0"
          :class="{
            'bg-success-500': fps >= 55,
            'bg-warning-500': fps >= 30 && fps < 55,
            'bg-danger-500': fps < 30
          }"
          :style="{ height: `${(fps / 60) * 100}%` }"
        ></div>
      </div>
    </BaseCard>
    
    <!-- Metrics display -->
    <BaseCard v-if="Object.keys(metrics).length > 0" class="p-4">
      <div class="flex items-center justify-between mb-3">
        <BaseHeading size="xs" weight="medium">Execution Time Metrics</BaseHeading>
        
        <!-- Filter selector -->
        <div class="flex items-center gap-2">
          <BaseText size="xs" class="text-muted-500">Filter:</BaseText>
          <BaseSelect v-model="metricFilter" size="sm" class="w-40">
            <option v-for="filter in metricFilters" :key="filter" :value="filter">
              {{ filter }}
            </option>
          </BaseSelect>
        </div>
      </div>
      
      <!-- Metrics table -->
      <table class="w-full">
        <thead>
          <tr class="border-b border-muted-200 dark:border-muted-700 text-left">
            <th class="py-2 px-2 text-[0.825rem] text-muted-500">Metric</th>
            <th class="py-2 px-2 text-[0.825rem] text-muted-500">Last</th>
            <th class="py-2 px-2 text-[0.825rem] text-muted-500">Average</th>
            <th class="py-2 px-2 text-[0.825rem] text-muted-500">Min</th>
            <th class="py-2 px-2 text-[0.825rem] text-muted-500">Max</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(metric, name) in filteredMetrics"
            :key="name"
            class="border-b border-muted-200 dark:border-muted-700"
          >
            <td class="py-2 px-2">{{ name }}</td>
            <td class="py-2 px-2">{{ formatMetric(metric.lastValue) }}</td>
            <td class="py-2 px-2">{{ formatMetric(metric.average) }}</td>
            <td class="py-2 px-2">{{ formatMetric(metric.min) }}</td>
            <td class="py-2 px-2">{{ formatMetric(metric.max) }}</td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="Object.keys(filteredMetrics).length === 0" class="py-4 text-center text-muted-500">
        No metrics available for this filter
      </div>
    </BaseCard>
    
    <div v-else-if="!isRecording" class="py-8 text-center text-muted-500">
      <div class="mb-2">
        <Icon name="ph:chart-line-duotone" class="size-16 mx-auto mb-3 opacity-50" />
      </div>
      <BaseText>No performance metrics recorded yet</BaseText>
      <BaseText size="xs" class="mt-1">Click "Start Recording" to begin collecting metrics</BaseText>
    </div>
  </div>
</template>
