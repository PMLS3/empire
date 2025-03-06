<script setup lang="ts">
import { ref } from 'vue';
import PerformanceViewer from '../../components/testing/PerformanceViewer.vue';
import { usePerformanceTesting } from '../../composables/usePerformanceTesting';

const { measureExecutionTime, startMeasuring } = usePerformanceTesting();

const testResults = ref<string[]>([]);
const testVariables = ref({
  iterations: 1000,
  arraySize: 10000,
  delay: 100,
  fibNumber: 35,
});

// Test function: Calculate Fibonacci sequence (CPU intensive)
const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

// Run a performance test using the Fibonacci function
const runFibonacciTest = async () => {
  testResults.value.push(`Starting Fibonacci test with n=${testVariables.value.fibNumber}...`);
  
  const result = await measureExecutionTime('fibonacci', () => {
    return fibonacci(testVariables.value.fibNumber);
  });
  
  testResults.value.push(`Fibonacci(${testVariables.value.fibNumber}) = ${result}`);
};

// Test function: Array operations (memory intensive)
const runArrayTest = async () => {
  testResults.value.push(`Starting array operations test with size=${testVariables.value.arraySize}...`);
  
  await measureExecutionTime('array-operations', () => {
    const array = Array.from({ length: testVariables.value.arraySize }, (_, i) => i);
    const mapped = array.map(x => x * 2);
    const filtered = mapped.filter(x => x % 3 === 0);
    const sum = filtered.reduce((a, b) => a + b, 0);
    
    return sum;
  });
  
  testResults.value.push('Array operations test completed');
};

// Test function: Simulate asynchronous operations
const runAsyncTest = async () => {
  testResults.value.push(`Starting async operations test with delay=${testVariables.value.delay}ms, iterations=${testVariables.value.iterations}...`);
  
  await measureExecutionTime('async-operations', async () => {
    const promises = Array.from({ length: testVariables.value.iterations }, (_, i) => {
      return new Promise<number>(resolve => {
        setTimeout(() => {
          resolve(i * 2);
        }, testVariables.value.delay);
      });
    });
    
    await Promise.all(promises);
  });
  
  testResults.value.push('Async operations test completed');
};

// Test DOM operations (UI intensive)
const runDOMTest = async () => {
  testResults.value.push(`Starting DOM operations test with ${testVariables.value.iterations} operations...`);
  
  await measureExecutionTime('dom-operations', () => {
    // Create a temporary container
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // Perform DOM operations
    for (let i = 0; i < testVariables.value.iterations; i++) {
      const el = document.createElement('div');
      el.className = `test-element element-${i}`;
      el.style.padding = '2px';
      el.textContent = `Element ${i}`;
      
      container.appendChild(el);
    }
    
    // Force reflow
    container.offsetHeight;
    
    // Clean up
    document.body.removeChild(container);
  });
  
  testResults.value.push('DOM operations test completed');
};

// Clear test results
const clearResults = () => {
  testResults.value = [];
};
</script>

<template>
  <div>
    <BasePageTitle title="Performance Testing" subtitle="Test and measure application performance" />
    
    <div class="grid grid-cols-12 gap-6">
      <!-- Performance metrics column -->
      <div class="col-span-12 lg:col-span-8">
        <BaseCard class="p-6">
          <PerformanceViewer :showControls="true" />
        </BaseCard>
      </div>
      
      <!-- Test controls column -->
      <div class="col-span-12 lg:col-span-4">
        <BaseCard class="p-6">
          <BaseHeading size="sm" weight="medium" class="mb-4">Test Controls</BaseHeading>
          
          <div class="space-y-4">
            <!-- Test configurations -->
            <div class="space-y-2">
              <BaseInput 
                v-model.number="testVariables.iterations" 
                type="number"
                min="1"
                max="10000"
                label="Iterations"
              />
              
              <BaseInput 
                v-model.number="testVariables.arraySize" 
                type="number"
                min="100"
                max="1000000"
                label="Array Size"
              />
              
              <BaseInput 
                v-model.number="testVariables.delay" 
                type="number"
                min="0"
                max="1000"
                label="Delay (ms)"
              />
              
              <BaseInput 
                v-model.number="testVariables.fibNumber" 
                type="number"
                min="1"
                max="45"
                label="Fibonacci Number"
              />
            </div>
            
            <!-- Test buttons -->
            <div class="space-y-2">
              <BaseButton 
                color="primary" 
                block 
                @click="runFibonacciTest"
              >
                <Icon name="ph:function-duotone" class="me-2" />
                Run Fibonacci Test
              </BaseButton>
              
              <BaseButton 
                color="info" 
                block 
                @click="runArrayTest"
              >
                <Icon name="ph:brackets-curly-duotone" class="me-2" />
                Run Array Test
              </BaseButton>
              
              <BaseButton 
                color="success" 
                block 
                @click="runAsyncTest"
              >
                <Icon name="ph:clock-countdown-duotone" class="me-2" />
                Run Async Test
              </BaseButton>
              
              <BaseButton 
                color="warning" 
                block 
                @click="runDOMTest"
              >
                <Icon name="ph:tree-structure-duotone" class="me-2" />
                Run DOM Test
              </BaseButton>
            </div>
          </div>
        </BaseCard>
        
        <!-- Test results -->
        <BaseCard class="p-6 mt-4">
          <div class="flex items-center justify-between mb-4">
            <BaseHeading size="sm" weight="medium">Test Results</BaseHeading>
            <BaseButton 
              color="default" 
              size="sm"
              @click="clearResults"
              :disabled="testResults.length === 0"
            >
              Clear
            </BaseButton>
          </div>
          
          <div class="bg-muted-100 dark:bg-muted-800 rounded-lg p-3 max-h-80 overflow-y-auto font-mono text-sm">
            <div v-if="testResults.length === 0" class="text-center py-4 text-muted-500">
              No test results yet
            </div>
            <div v-else class="space-y-1">
              <div 
                v-for="(result, index) in testResults" 
                :key="index"
                class="py-1"
              >
                {{ result }}
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
