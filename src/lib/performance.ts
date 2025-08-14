// Performance monitoring utilities
import { useRef, useEffect, DependencyList } from 'react'

export interface PerformanceMetrics {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, unknown>
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private enabled: boolean = process.env.NODE_ENV === 'development'

  // Start timing a operation
  start(name: string, metadata?: Record<string, unknown>) {
    if (!this.enabled) return

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    })
    
    console.log(`🚀 [PERF] Started: ${name}`, metadata)
  }

  // End timing an operation
  end(name: string) {
    if (!this.enabled) return

    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`⚠️ [PERF] No start time found for: ${name}`)
      return
    }

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    const updatedMetric = {
      ...metric,
      endTime,
      duration,
    }

    this.metrics.set(name, updatedMetric)
    
    // Color code based on duration
    const color = duration < 100 ? '🟢' : duration < 500 ? '🟡' : '🔴'
    console.log(`${color} [PERF] Completed: ${name} in ${duration.toFixed(2)}ms`, metric.metadata)
    
    return updatedMetric
  }

  // Get performance report
  getReport(): PerformanceMetrics[] {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined)
  }

  // Clear all metrics
  clear() {
    this.metrics.clear()
  }

  // Log summary report
  logReport() {
    if (!this.enabled) return

    const report = this.getReport()
    if (report.length === 0) return

    console.group('📊 Performance Report')
    report
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .forEach(metric => {
        const color = (metric.duration || 0) < 100 ? '🟢' : (metric.duration || 0) < 500 ? '🟡' : '🔴'
        console.log(`${color} ${metric.name}: ${(metric.duration || 0).toFixed(2)}ms`)
      })
    console.groupEnd()
  }
}

export const performanceMonitor = new PerformanceMonitor()

// React hook for measuring component render performance
export function usePerformanceMonitor(name: string, deps?: DependencyList) {
  const startTime = useRef<number>(performance.now())
  
  useEffect(() => {
    const renderTime = performance.now() - startTime.current
    if (renderTime > 16) { // Only log if render took longer than one frame
      console.log(`🎨 [RENDER] ${name}: ${renderTime.toFixed(2)}ms`)
    }
  })

  useEffect(() => {
    startTime.current = performance.now()
  }, deps)
}

// Utility functions for common performance measurements
export const perf = {
  // Measure navigation performance
  navigationStart: (page: string) => {
    performanceMonitor.start(`navigation-${page}`, { page })
  },
  
  navigationEnd: (page: string) => {
    performanceMonitor.end(`navigation-${page}`)
  },

  // Measure API call performance
  apiCallStart: (endpoint: string, method = 'GET') => {
    performanceMonitor.start(`api-${endpoint}`, { endpoint, method })
  },
  
  apiCallEnd: (endpoint: string) => {
    performanceMonitor.end(`api-${endpoint}`)
  },

  // Measure data loading performance
  dataLoadStart: (dataType: string, id?: string) => {
    const name = id ? `data-${dataType}-${id}` : `data-${dataType}`
    performanceMonitor.start(name, { dataType, id })
  },
  
  dataLoadEnd: (dataType: string, id?: string) => {
    const name = id ? `data-${dataType}-${id}` : `data-${dataType}`
    performanceMonitor.end(name)
  },

  // Measure component loading performance
  componentLoadStart: (componentName: string) => {
    performanceMonitor.start(`component-${componentName}`, { componentName })
  },
  
  componentLoadEnd: (componentName: string) => {
    performanceMonitor.end(`component-${componentName}`)
  },
}

// Web Vitals tracking (for production monitoring)
export function trackWebVitals() {
  if (typeof window === 'undefined') return

  // Track Core Web Vitals
  import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    onCLS(console.log)
    onINP(console.log) // Updated from onFID to onINP
    onFCP(console.log)
    onLCP(console.log)
    onTTFB(console.log)
  }).catch(() => {
    // web-vitals not available
  })
}