'use client'

import { useState, useEffect, useRef, ReactNode, useLayoutEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TabSliderProps {
  tabs: Array<{
    id: string
    label: ReactNode
    onClick?: () => void
  }>
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
  tabClassName?: string
  activeTabClassName?: string
  size?: 'sm' | 'md' | 'lg'
}

export function TabSlider({
  tabs,
  activeTab,
  onTabChange,
  className,
  tabClassName,
  activeTabClassName,
  size = 'md'
}: TabSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const [sliderStyle, setSliderStyle] = useState({ 
    width: 0, 
    x: 0, 
    opacity: 0 
  })
  const measurementTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Size variants
  const sizeClasses = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-3'
  }

  const containerPadding = {
    sm: 4,  // p-1 = 4px
    md: 4,  // p-1 = 4px  
    lg: 6   // p-1.5 = 6px
  }

  // Enhanced measurement function with retry logic
  const measureTabPosition = useCallback(() => {
    const activeTabElement = tabRefs.current[activeTab]
    const container = containerRef.current

    if (!activeTabElement || !container) {
      return false
    }

    try {
      // Force layout if needed
      activeTabElement.getBoundingClientRect()
      
      const containerRect = container.getBoundingClientRect()
      const tabRect = activeTabElement.getBoundingClientRect()
      
      // Validate measurements
      if (tabRect.width === 0 || containerRect.width === 0) {
        return false
      }
      
      const padding = containerPadding[size]
      
      const newStyle = {
        width: tabRect.width,
        x: tabRect.left - containerRect.left - padding,
        opacity: 1
      }

      // Always update for initial positioning, then use threshold for updates
      if (sliderStyle.opacity === 0 || 
          Math.abs(newStyle.width - sliderStyle.width) > 1 || 
          Math.abs(newStyle.x - sliderStyle.x) > 1) {
        setSliderStyle(newStyle)
      }
      
      return true
    } catch (error) {
      console.warn('TabSlider measurement failed:', error)
      return false
    }
  }, [activeTab, size, sliderStyle, containerPadding])

  // Debounced update with retry mechanism
  const updateSliderPosition = useCallback(() => {
    if (measurementTimeoutRef.current) {
      clearTimeout(measurementTimeoutRef.current)
    }

    measurementTimeoutRef.current = setTimeout(() => {
      let retries = 3
      const attemptMeasurement = () => {
        if (measureTabPosition() || retries <= 0) {
          return
        }
        retries--
        setTimeout(attemptMeasurement, 10)
      }
      attemptMeasurement()
    }, 10)
  }, [measureTabPosition])

  // Enhanced callback ref to handle dynamic content
  const getTabRef = useCallback((tabId: string) => {
    return (el: HTMLButtonElement | null) => {
      tabRefs.current[tabId] = el
      if (el && tabId === activeTab) {
        // Small delay to allow DOM to settle
        setTimeout(() => updateSliderPosition(), 0)
      }
    }
  }, [activeTab, updateSliderPosition])

  // Immediate initial positioning
  useEffect(() => {
    const timer = setTimeout(() => {
      measureTabPosition()
    }, 0)
    
    return () => clearTimeout(timer)
  }, [measureTabPosition]) // Only run once on mount

  // Use layoutEffect for immediate updates before paint
  useLayoutEffect(() => {
    updateSliderPosition()
  }, [activeTab, size, updateSliderPosition])

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      updateSliderPosition()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (measurementTimeoutRef.current) {
        clearTimeout(measurementTimeoutRef.current)
      }
    }
  }, [updateSliderPosition])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
        onTabChange(tabs[prevIndex].id)
        break
      case 'ArrowRight':
        e.preventDefault()
        const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
        onTabChange(tabs[nextIndex].id)
        break
    }
  }

  return (
    <div 
      ref={containerRef}
      onKeyDown={handleKeyDown}
      role="tablist"
      className={cn(
        'relative bg-muted rounded-lg p-1',
        size === 'lg' && 'p-1.5',
        className
      )}
    >
      <motion.div
        className="absolute bg-white dark:bg-white/10 rounded-md shadow-sm border border-border/50 pointer-events-none z-0"
        initial={false}
        animate={{
          width: sliderStyle.width,
          x: sliderStyle.x,
          opacity: sliderStyle.opacity
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8
        }}
        style={{
          top: size === 'lg' ? 6 : 4,
          bottom: size === 'lg' ? 6 : 4,
        }}
      />
      
      <div className="relative flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={getTabRef(tab.id)}
            onClick={() => {
              tab.onClick?.()
              onTabChange(tab.id)
            }}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={cn(
              'relative z-10 font-medium transition-colors rounded-md whitespace-nowrap',
              sizeClasses[size],
              activeTab === tab.id 
                ? cn('text-foreground', activeTabClassName)
                : 'text-muted-foreground hover:text-foreground',
              tabClassName
            )}
          >
            <span className="relative pointer-events-none">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}