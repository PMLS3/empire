import { Tool } from "@langchain/core/tools";
import { z } from "zod";
// Using require for d3 to avoid TypeScript errors
import * as d3 from "d3";
import { promises as fs } from "fs";
import path from "path";
import { createFolder, fileExists } from "./files";

export class DataAnalysisTool extends Tool {
  name = "data_analysis";
  description = "A tool for analyzing data using various statistical methods. Input should be a JSON string with 'data' (array of objects or CSV string), 'operation' (e.g., 'summary', 'correlation', 'regression'), and optional 'options'.";
  
  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { data, operation, options = {} } = params;

      if (!data) {
        throw new Error("Data is required");
      }

      if (!operation) {
        throw new Error("Operation is required");
      }

      // Parse data if it's a CSV string
      let parsedData = data;
      if (typeof data === "string") {
        parsedData = d3.csvParse(data);
      }

      // Perform the requested operation
      switch (operation.toLowerCase()) {
        case "summary":
          return this.generateSummaryStatistics(parsedData, options);
        case "correlation":
          return this.calculateCorrelation(parsedData, options);
        case "regression":
          return this.performRegression(parsedData, options);
        case "cluster":
          return this.performClustering(parsedData, options);
        case "outliers":
          return this.detectOutliers(parsedData, options);
        case "timeseries":
          return this.analyzeTimeSeries(parsedData, options);
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Data analysis error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in data analysis');
    }
  }

  private generateSummaryStatistics(data: any[], options: Record<string, any>): string {
    try {
      const { columns = Object.keys(data[0]) } = options;
      
      const summary: Record<string, any> = {};
      
      for (const column of columns) {
        // Skip non-numeric columns unless explicitly requested
        if (!options.includeNonNumeric && isNaN(Number(data[0][column]))) {
          continue;
        }
        
        const values = data.map(d => d[column]).filter(d => d !== null && d !== undefined);
        const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
        
        if (numericValues.length > 0) {
          summary[column] = {
            count: numericValues.length,
            min: d3.min(numericValues),
            max: d3.max(numericValues),
            mean: d3.mean(numericValues),
            median: d3.median(numericValues),
            standardDeviation: d3.deviation(numericValues),
            quartiles: d3.quantile(numericValues.sort(d3.ascending), [0.25, 0.5, 0.75])
          };
        } else {
          // For non-numeric columns, provide count and unique values
          const uniqueValues = new Set(values);
          summary[column] = {
            count: values.length,
            uniqueValues: uniqueValues.size,
            type: "non-numeric",
            mostCommon: this.getMostCommonValues(values, 5)
          };
        }
      }
      
      return JSON.stringify(summary, null, 2);
    } catch (error: any) {
      console.error("Error generating summary statistics:", error);
      throw new Error(`Failed to generate summary statistics: ${error.message}`);
    }
  }

  private getMostCommonValues(values: any[], limit: number): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const value of values) {
      counts[value] = (counts[value] || 0) + 1;
    }
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as Record<string, number>);
  }

  private calculateCorrelation(data: any[], options: Record<string, any>): string {
    try {
      const { xColumn, yColumn, method = "pearson" } = options;
      
      if (!xColumn || !yColumn) {
        throw new Error("xColumn and yColumn are required for correlation analysis");
      }
      
      const xValues = data.map(d => Number(d[xColumn])).filter(v => !isNaN(v));
      const yValues = data.map(d => Number(d[yColumn])).filter(v => !isNaN(v));
      
      if (xValues.length !== yValues.length) {
        throw new Error("X and Y values must have the same length");
      }
      
      let correlation;
      
      if (method === "pearson") {
        correlation = this.calculatePearsonCorrelation(xValues, yValues);
      } else if (method === "spearman") {
        correlation = this.calculateSpearmanCorrelation(xValues, yValues);
      } else {
        throw new Error(`Unsupported correlation method: ${method}`);
      }
      
      return JSON.stringify({
        method,
        correlation,
        interpretation: this.interpretCorrelation(correlation)
      }, null, 2);
    } catch (error: any) {
      console.error("Error calculating correlation:", error);
      throw new Error(`Failed to calculate correlation: ${error.message}`);
    }
  }

  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const xMean = d3.mean(x) || 0;
    const yMean = d3.mean(y) || 0;
    
    let numerator = 0;
    let xDenominator = 0;
    let yDenominator = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      
      numerator += xDiff * yDiff;
      xDenominator += xDiff * xDiff;
      yDenominator += yDiff * yDiff;
    }
    
    return numerator / Math.sqrt(xDenominator * yDenominator);
  }

  private calculateSpearmanCorrelation(x: number[], y: number[]): number {
    // Convert values to ranks
    const xRanks = this.rankValues(x);
    const yRanks = this.rankValues(y);
    
    // Calculate Pearson correlation on the ranks
    return this.calculatePearsonCorrelation(xRanks, yRanks);
  }

  private rankValues(values: number[]): number[] {
    // Create array of indices
    const indices = values.map((_, i) => i);
    
    // Sort indices by values
    indices.sort((a, b) => values[a] - values[b]);
    
    // Assign ranks
    const ranks = new Array(values.length);
    
    for (let i = 0; i < indices.length; i++) {
      ranks[indices[i]] = i + 1;
    }
    
    return ranks;
  }

  private interpretCorrelation(correlation: number): string {
    const abs = Math.abs(correlation);
    
    if (abs < 0.1) return "No or negligible correlation";
    if (abs < 0.3) return "Weak correlation";
    if (abs < 0.5) return "Moderate correlation";
    if (abs < 0.7) return "Moderately strong correlation";
    if (abs < 0.9) return "Strong correlation";
    return "Very strong correlation";
  }

  private performRegression(data: any[], options: Record<string, any>): string {
    try {
      const { xColumn, yColumn, type = "linear" } = options;
      
      if (!xColumn || !yColumn) {
        throw new Error("xColumn and yColumn are required for regression analysis");
      }
      
      const xValues = data.map(d => Number(d[xColumn])).filter(v => !isNaN(v));
      const yValues = data.map(d => Number(d[yColumn])).filter(v => !isNaN(v));
      
      if (xValues.length !== yValues.length) {
        throw new Error("X and Y values must have the same length");
      }
      
      if (type === "linear") {
        const result = this.performLinearRegression(xValues, yValues);
        
        // Calculate R-squared
        const yMean = d3.mean(yValues) || 0;
        let totalSumOfSquares = 0;
        let residualSumOfSquares = 0;
        
        for (let i = 0; i < xValues.length; i++) {
          const predicted = result.slope * xValues[i] + result.intercept;
          totalSumOfSquares += Math.pow(yValues[i] - yMean, 2);
          residualSumOfSquares += Math.pow(yValues[i] - predicted, 2);
        }
        
        const rSquared = 1 - (residualSumOfSquares / totalSumOfSquares);
        
        return JSON.stringify({
          type: "linear",
          slope: result.slope,
          intercept: result.intercept,
          equation: `y = ${result.slope.toFixed(4)}x + ${result.intercept.toFixed(4)}`,
          rSquared,
          interpretation: this.interpretRSquared(rSquared)
        }, null, 2);
      } else {
        throw new Error(`Unsupported regression type: ${type}`);
      }
    } catch (error: any) {
      console.error("Error performing regression:", error);
      throw new Error(`Failed to perform regression: ${error.message}`);
    }
  }

  private performLinearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
    const n = x.length;
    const xMean = d3.mean(x) || 0;
    const yMean = d3.mean(y) || 0;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - xMean) * (y[i] - yMean);
      denominator += Math.pow(x[i] - xMean, 2);
    }
    
    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;
    
    return { slope, intercept };
  }

  private interpretRSquared(rSquared: number): string {
    if (rSquared < 0.3) return "Weak fit";
    if (rSquared < 0.5) return "Moderate fit";
    if (rSquared < 0.7) return "Good fit";
    return "Strong fit";
  }

  private performClustering(data: any[], options: Record<string, any>): string {
    // Simplified k-means clustering implementation
    try {
      const { columns, k = 3, iterations = 10 } = options;
      
      if (!columns || !Array.isArray(columns) || columns.length === 0) {
        throw new Error("At least one column must be specified for clustering");
      }
      
      // Extract numeric values for the specified columns
      const points = data.map(d => {
        const point: number[] = [];
        for (const column of columns) {
          const value = Number(d[column]);
          if (isNaN(value)) {
            throw new Error(`Non-numeric value found in column ${column}`);
          }
          point.push(value);
        }
        return point;
      });
      
      // Initialize centroids randomly
      const centroids: number[][] = [];
      const usedIndices = new Set<number>();
      
      for (let i = 0; i < k; i++) {
        let index;
        do {
          index = Math.floor(Math.random() * points.length);
        } while (usedIndices.has(index));
        
        usedIndices.add(index);
        centroids.push([...points[index]]);
      }
      
      // Perform k-means clustering
      const assignments: number[] = new Array(points.length).fill(-1);
      
      for (let iter = 0; iter < iterations; iter++) {
        // Assign points to nearest centroid
        let changed = false;
        
        for (let i = 0; i < points.length; i++) {
          const point = points[i];
          let minDistance = Infinity;
          let minIndex = -1;
          
          for (let j = 0; j < centroids.length; j++) {
            const distance = this.euclideanDistance(point, centroids[j]);
            if (distance < minDistance) {
              minDistance = distance;
              minIndex = j;
            }
          }
          
          if (assignments[i] !== minIndex) {
            assignments[i] = minIndex;
            changed = true;
          }
        }
        
        if (!changed) break;
        
        // Update centroids
        const counts: number[] = new Array(k).fill(0);
        const newCentroids: number[][] = Array.from({ length: k }, () => 
          new Array(columns.length).fill(0)
        );
        
        for (let i = 0; i < points.length; i++) {
          const cluster = assignments[i];
          counts[cluster]++;
          
          for (let j = 0; j < points[i].length; j++) {
            newCentroids[cluster][j] += points[i][j];
          }
        }
        
        for (let i = 0; i < k; i++) {
          if (counts[i] > 0) {
            for (let j = 0; j < newCentroids[i].length; j++) {
              newCentroids[i][j] /= counts[i];
            }
          }
        }
        
        centroids.splice(0, centroids.length, ...newCentroids);
      }
      
      // Prepare result
      const clusters: Record<number, any[]> = {};
      
      for (let i = 0; i < assignments.length; i++) {
        const cluster = assignments[i];
        if (!clusters[cluster]) {
          clusters[cluster] = [];
        }
        
        const point: Record<string, any> = { ...data[i] };
        point._distance = this.euclideanDistance(points[i], centroids[cluster]);
        clusters[cluster].push(point);
      }
      
      // Calculate cluster statistics
      const clusterStats: Record<string, any> = {};
      
      for (const [cluster, points] of Object.entries(clusters)) {
        const stats: Record<string, any> = {
          count: points.length,
          centroid: {}
        };
        
        for (let i = 0; i < columns.length; i++) {
          const column = columns[i];
          stats.centroid[column] = centroids[Number(cluster)][i];
        }
        
        clusterStats[`cluster_${cluster}`] = stats;
      }
      
      return JSON.stringify({
        k,
        columns,
        clusterStats,
        pointCount: points.length
      }, null, 2);
    } catch (error: any) {
      console.error("Error performing clustering:", error);
      throw new Error(`Failed to perform clustering: ${error.message}`);
    }
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }

  private detectOutliers(data: any[], options: Record<string, any>): string {
    try {
      const { column, method = "iqr", threshold = 1.5 } = options;
      
      if (!column) {
        throw new Error("Column is required for outlier detection");
      }
      
      const values = data.map(d => Number(d[column])).filter(v => !isNaN(v));
      
      if (method === "iqr") {
        // Interquartile Range method
        const sorted = [...values].sort(d3.ascending);
        const q1 = d3.quantile(sorted, 0.25) || 0;
        const q3 = d3.quantile(sorted, 0.75) || 0;
        const iqr = q3 - q1;
        
        const lowerBound = q1 - threshold * iqr;
        const upperBound = q3 + threshold * iqr;
        
        const outliers = data.filter(d => {
          const value = Number(d[column]);
          return !isNaN(value) && (value < lowerBound || value > upperBound);
        });
        
        return JSON.stringify({
          method: "IQR",
          threshold,
          q1,
          q3,
          iqr,
          lowerBound,
          upperBound,
          outlierCount: outliers.length,
          outlierPercentage: (outliers.length / data.length) * 100,
          outliers: outliers.slice(0, 100) // Limit to 100 outliers in the response
        }, null, 2);
      } else if (method === "zscore") {
        // Z-score method
        const mean = d3.mean(values) || 0;
        const std = d3.deviation(values) || 1;
        
        const outliers = data.filter(d => {
          const value = Number(d[column]);
          if (isNaN(value)) return false;
          
          const zscore = Math.abs((value - mean) / std);
          return zscore > threshold;
        });
        
        return JSON.stringify({
          method: "Z-score",
          threshold,
          mean,
          standardDeviation: std,
          outlierCount: outliers.length,
          outlierPercentage: (outliers.length / data.length) * 100,
          outliers: outliers.slice(0, 100) // Limit to 100 outliers in the response
        }, null, 2);
      } else {
        throw new Error(`Unsupported outlier detection method: ${method}`);
      }
    } catch (error: any) {
      console.error("Error detecting outliers:", error);
      throw new Error(`Failed to detect outliers: ${error.message}`);
    }
  }

  private analyzeTimeSeries(data: any[], options: Record<string, any>): string {
    try {
      const { dateColumn, valueColumn, interval = "day" } = options;
      
      if (!dateColumn || !valueColumn) {
        throw new Error("dateColumn and valueColumn are required for time series analysis");
      }
      
      // Parse dates and values
      const timeData = data.map(d => {
        const date = new Date(d[dateColumn]);
        const value = Number(d[valueColumn]);
        
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date format in column ${dateColumn}`);
        }
        
        if (isNaN(value)) {
          throw new Error(`Non-numeric value found in column ${valueColumn}`);
        }
        
        return { date, value };
      }).sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Group by interval
      const grouped: Record<string, number[]> = {};
      
      for (const point of timeData) {
        let key;
        
        switch (interval) {
          case "hour":
            key = new Date(
              point.date.getFullYear(),
              point.date.getMonth(),
              point.date.getDate(),
              point.date.getHours()
            ).toISOString();
            break;
          case "day":
            key = new Date(
              point.date.getFullYear(),
              point.date.getMonth(),
              point.date.getDate()
            ).toISOString();
            break;
          case "week":
            const d = new Date(point.date);
            d.setDate(d.getDate() - d.getDay());
            key = new Date(
              d.getFullYear(),
              d.getMonth(),
              d.getDate()
            ).toISOString();
            break;
          case "month":
            key = new Date(
              point.date.getFullYear(),
              point.date.getMonth(),
              1
            ).toISOString();
            break;
          case "year":
            key = new Date(
              point.date.getFullYear(),
              0,
              1
            ).toISOString();
            break;
          default:
            throw new Error(`Unsupported interval: ${interval}`);
        }
        
        if (!grouped[key]) {
          grouped[key] = [];
        }
        
        grouped[key].push(point.value);
      }
      
      // Calculate statistics for each interval
      const result: Record<string, any> = {
        interval,
        periods: Object.keys(grouped).length,
        totalPoints: timeData.length,
        timeSeries: []
      };
      
      for (const [key, values] of Object.entries(grouped)) {
        result.timeSeries.push({
          period: key,
          count: values.length,
          min: d3.min(values),
          max: d3.max(values),
          mean: d3.mean(values),
          median: d3.median(values),
          sum: d3.sum(values)
        });
      }
      
      // Sort time series by period
      result.timeSeries.sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
      
      // Calculate overall trend
      if (result.timeSeries.length > 1) {
        const firstPeriod = result.timeSeries[0];
        const lastPeriod = result.timeSeries[result.timeSeries.length - 1];
        
        const change = lastPeriod.mean - firstPeriod.mean;
        const percentChange = (change / firstPeriod.mean) * 100;
        
        result.trend = {
          absoluteChange: change,
          percentChange,
          direction: change > 0 ? "increasing" : change < 0 ? "decreasing" : "stable"
        };
      }
      
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      console.error("Error analyzing time series:", error);
      throw new Error(`Failed to analyze time series: ${error.message}`);
    }
  }
}

export class DataVisualizationTool extends Tool {
  name = "data_visualization";
  description = "A tool for creating data visualizations. Input should be a JSON string with 'data' (array of objects or CSV string), 'type' (e.g., 'bar', 'line', 'scatter'), 'options', and 'outputPath' (where to save the visualization).";
  
  /** @ignore */
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const { data, type, options = {}, outputPath } = params;

      if (!data) {
        throw new Error("Data is required");
      }

      if (!type) {
        throw new Error("Visualization type is required");
      }

      if (!outputPath) {
        throw new Error("Output path is required");
      }

      // Parse data if it's a CSV string
      let parsedData = data;
      if (typeof data === "string") {
        parsedData = d3.csvParse(data);
      }

      // Create the output directory if it doesn't exist
      const outputDir = path.dirname(outputPath);
      await createFolder(outputDir);

      // For simplicity, we'll just create a basic HTML file with a message
      // In a real implementation, this would generate actual visualizations
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Data Visualization</title>
</head>
<body>
  <h1>Data Visualization</h1>
  <p>This is a placeholder for a ${type} chart visualization.</p>
  <p>In a real implementation, this would contain a D3.js or Chart.js visualization.</p>
  <pre>${JSON.stringify(parsedData.slice(0, 5), null, 2)}</pre>
</body>
</html>`;

      // Write the HTML to the output file
      await fs.writeFile(outputPath, html, "utf-8");

      return JSON.stringify({
        success: true,
        message: `Visualization saved to ${outputPath}`,
        outputPath
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Data visualization error: ${error.message}`);
      }
      throw new Error('An unknown error occurred in data visualization');
    }
  }
}
