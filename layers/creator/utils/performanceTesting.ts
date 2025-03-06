/**
 * Performance testing utility for measuring and tracking performance metrics
 */
export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Record<string, { 
    times: number[],
    average: number,
    min: number,
    max: number,
    lastValue: number 
  }> = {};

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  /**
   * Measure execution time of a function
   */
  public async measureExecutionTime<T>(
    name: string, 
    fn: () => T | Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = fn instanceof Function ? await fn() : fn;
      this.recordMetric(name, performance.now() - startTime);
      return result;
    } catch (error) {
      this.recordMetric(`${name}:error`, performance.now() - startTime);
      throw error;
    }
  }

  /**
   * Record metric measurement
   */
  public recordMetric(name: string, value: number): void {
    if (!this.metrics[name]) {
      this.metrics[name] = {
        times: [],
        average: value,
        min: value,
        max: value,
        lastValue: value
      };
    }

    const metric = this.metrics[name];
    metric.times.push(value);

    // Limit array size to prevent memory issues
    if (metric.times.length > 100) {
      metric.times.shift();
    }
    
    metric.lastValue = value;
    metric.min = Math.min(metric.min, value);
    metric.max = Math.max(metric.max, value);
    
    // Calculate average
    metric.average = metric.times.reduce((sum, val) => sum + val, 0) / metric.times.length;
  }

  /**
   * Start measuring a custom metric
   */
  public startMeasuring(name: string): () => number {
    const startTime = performance.now();
    
    // Return end function
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
      return duration;
    };
  }

  /**
   * Get all metrics
   */
  public getMetrics(): Record<string, any> {
    return this.metrics;
  }

  /**
   * Get specific metric
   */
  public getMetric(name: string): any {
    return this.metrics[name];
  }

  /**
   * Clear metrics
   */
  public clearMetrics(): void {
    this.metrics = {};
  }

  /**
   * Export metrics as JSON
   */
  public exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}

export const performanceTracker = PerformanceTracker.getInstance();

/**
 * Hook to profile a component's render performance
 */
export function usePerformanceMonitoring(componentName: string) {
  let mounted = false;
  
  onMounted(() => {
    const mountTime = window.performance.mark(`${componentName}:mounted`);
    performanceTracker.recordMetric(`${componentName}:mount`, performance.now() - mountTime);
    mounted = true;
  });
  
  onUpdated(() => {
    if (mounted) {
      performanceTracker.recordMetric(`${componentName}:update`, performance.now());
    }
  });
  
  return {
    measureAction: (actionName: string, action: () => any) => {
      return performanceTracker.measureExecutionTime(`${componentName}:${actionName}`, action);
    },
    startMeasuring: (actionName: string) => {
      return performanceTracker.startMeasuring(`${componentName}:${actionName}`);
    }
  };
}
