/**
 * Animation utilities for property card diagonal animations and financial modeling page
 */

export interface DiagonalAnimation {
  initial: {
    opacity: number
    x: number
    y: number
    scale: number
  }
  animate: {
    opacity: number
    x: number
    y: number
    scale: number
  }
  transition: {
    duration: number
    delay: number
  }
}

/**
 * Calculate diagonal animation properties based on card position in grid
 */
export function calculateDiagonalAnimation(
  index: number,
  totalCards: number,
  columns: number = 4
): DiagonalAnimation {
  // Calculate row and column position
  const row = Math.floor(index / columns)
  const col = index % columns
  
  // Calculate total rows
  const totalRows = Math.ceil(totalCards / columns)
  
  // Calculate center position
  const centerRow = (totalRows - 1) / 2
  const centerCol = (columns - 1) / 2
  
  // Calculate relative position from center
  const relativeRow = row - centerRow
  const relativeCol = col - centerCol
  
  // Determine animation direction based on quadrant
  let xOffset = 0
  let yOffset = 0
  
  if (relativeRow < 0 && relativeCol < 0) {
    // Top-left quadrant: animate from top-left
    xOffset = -60
    yOffset = -60
  } else if (relativeRow < 0 && relativeCol > 0) {
    // Top-right quadrant: animate from top-right
    xOffset = 60
    yOffset = -60
  } else if (relativeRow > 0 && relativeCol < 0) {
    // Bottom-left quadrant: animate from bottom-left
    xOffset = -60
    yOffset = 60
  } else if (relativeRow > 0 && relativeCol > 0) {
    // Bottom-right quadrant: animate from bottom-right
    xOffset = 60
    yOffset = 60
  } else if (relativeRow === 0 && relativeCol < 0) {
    // Middle-left: animate from left
    xOffset = -60
    yOffset = 0
  } else if (relativeRow === 0 && relativeCol > 0) {
    // Middle-right: animate from right
    xOffset = 60
    yOffset = 0
  } else if (relativeRow < 0 && relativeCol === 0) {
    // Top-middle: animate from top
    xOffset = 0
    yOffset = -60
  } else if (relativeRow > 0 && relativeCol === 0) {
    // Bottom-middle: animate from bottom
    xOffset = 0
    yOffset = 60
  }
  
  // Calculate distance from center for staggered delay
  const distance = Math.sqrt(relativeRow * relativeRow + relativeCol * relativeCol)
  const baseDelay = 0.1
  const delayIncrement = 0.05
  const delay = baseDelay + (distance * delayIncrement)
  
  return {
    initial: {
      opacity: 0,
      x: xOffset,
      y: yOffset,
      scale: 0.8
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1
    },
    transition: {
      duration: 0.6,
      delay: Math.min(delay, 1.0) // Cap delay at 1 second
    }
  }
}

/**
 * Calculate responsive column count based on screen width
 */
export function calculateColumns(containerWidth: number): number {
  if (containerWidth >= 1536) return 4 // 2xl
  if (containerWidth >= 1280) return 3 // xl  
  if (containerWidth >= 1024) return 2 // lg
  return 1 // mobile
}

/**
 * Get hover animation for cards
 */
export function getCardHoverAnimation() {
  return {
    whileHover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    whileTap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  }
}

/**
 * Professional animations for the assumptions page
 */
export const assumptionsPageAnimations = {
  // Main page entrance
  pageContainer: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  },
  
  // Metrics cards staggered animation
  metricsGrid: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  },
  
  metricsCard: {
    initial: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1
    },
    hover: {
      y: -4,
      scale: 1.01
    }
  },
  
  // Section content transitions
  sectionContent: {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0
    },
    exit: { 
      opacity: 0, 
      y: -10
    }
  },
  
  // Navigation card animations
  navCard: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1
    },
    hover: {
      y: -2,
      scale: 1.008
    },
    tap: {
      scale: 0.995
    }
  }
}

/**
 * Number counting animation utility
 */
export function createCountAnimation(
  start: number, 
  end: number, 
  duration: number = 0.8
) {
  return {
    initial: start,
    animate: end,
    transition: {
      duration,
      ease: "easeOut"
    }
  }
}

/**
 * Enhanced reduced motion support
 */
export function getReducedMotionVariants(variants: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.2 } }
    }
  }
  return variants
}