import { ref, onMounted, onUnmounted } from 'vue';
import { performanceTracker } from '../utils/performanceTesting';

export function usePerformanceTesting() {
  const isRecording = ref(false);
  const metrics = ref<Record<string, any>>({});
  const frameTimes = ref<number[]>([]);
  const averageFrameRate = ref<number>(60);
  
  // FPS monitoring
  let frameCounter = 0;
  let lastTime = 0;
  let frameCounterInterval: number | null = null;
  let frameRequestId: number | null = null;
  
  /**
   * Start recording performance metrics
   */
  const startRecording = () => {
    isRecording.value = true;
    lastTime = performance.now();
    
    // Start tracking FPS
    startFpsMonitoring();
  };
  
  /**
   * Stop recording metrics
   */
  const stopRecording = () => {
    isRecording.value = false;
    
    if (frameCounterInterval) {
      clearInterval(frameCounterInterval);
      frameCounterInterval = null;
    }
    
    if (frameRequestId) {
      cancelAnimationFrame(frameRequestId);
      frameRequestId = null;
    }
    
    // Gather metrics
    metrics.value = performanceTracker.getMetrics();
  };
  
  /**
   * Start monitoring frame rate
   */
  const startFpsMonitoring = () => {
    frameCounter = 0;
    lastTime = performance.now();
    
    // Set up interval to calculate average FPS every second
    frameCounterInterval = window.setInterval(() => {
      const now = performance.now();
      const elapsed = now - lastTime;
      
      const fps = frameCounter / (elapsed / 1000);
      frameTimes.value.push(fps);
      
      // Limit array size
      if (frameTimes.value.length > 60) {
        frameTimes.value.shift();
      }
      
      // Calculate average frame rate
      averageFrameRate.value = frameTimes.value.reduce((sum, val) => sum + val, 0) / frameTimes.value.length;
      
      // Reset for next interval
      frameCounter = 0;
      lastTime = now;
    }, 1000);
    
    // Request animation frame to count frames
    const countFrame = () => {
      frameCounter++;
      
      if (isRecording.value) {
        frameRequestId = requestAnimationFrame(countFrame);
      }
    };
    
    frameRequestId = requestAnimationFrame(countFrame);
  };
  
  /**
   * Measure execution time of a function
   */
  const measureExecutionTime = async <T>(name: string, fn: () => T | Promise<T>): Promise<T> => {
    return performanceTracker.measureExecutionTime(name, fn);
  };
  
  /**
   * Start measuring a specific action
   */
  const startMeasuring = (name: string) => {
    return performanceTracker.startMeasuring(name);
  };
  
  /**
   * Export performance data
   */
  const exportPerformanceData = () => {
    return {
      metrics: performanceTracker.getMetrics(),
      frameTimes: frameTimes.value,
      averageFrameRate: averageFrameRate.value,
    };
  };
  
  /**
   * Clear all performance data
   */
  const clearPerformanceData = () => {
    performanceTracker.clearMetrics();
    frameTimes.value = [];
  };
  
  // Clean up on component unmount
  onUnmounted(() => {
    if (frameCounterInterval) {
      clearInterval(frameCounterInterval);
    }
    
    if (frameRequestId) {
      cancelAnimationFrame(frameRequestId);
    }
  });
  
  return {
    isRecording,
    metrics,
    frameTimes,
    averageFrameRate,
    startRecording,
    stopRecording,
    measureExecutionTime,
    startMeasuring,
    exportPerformanceData,
    clearPerformanceData,
  };
}
