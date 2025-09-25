'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface TerraLogoProps {
  /** Size preset for the logo */
  size?: 'sm' | 'md' | 'lg' | 'responsive'
  /** Custom width (overrides size preset) */
  width?: number
  /** Custom height (overrides size preset) */
  height?: number
  /** CSS classes for the container */
  className?: string
  /** Alt text for the logo */
  alt?: string
}

export function TerraLogo({ 
  size = 'responsive',
  width, 
  height, 
  className = '',
  alt = 'Terra Logo'
}: TerraLogoProps) {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Size presets
  const sizeMap = {
    sm: { width: 24, height: 24, class: 'w-6 h-6' },
    md: { width: 32, height: 32, class: 'w-8 h-8' },
    lg: { width: 48, height: 48, class: 'w-12 h-12' },
    responsive: { width: 44, height: 44, class: 'w-8 h-8 md:w-11 md:h-11' }
  }

  // Use custom dimensions if provided, otherwise use size preset
  const logoWidth = width || sizeMap[size].width
  const logoHeight = height || sizeMap[size].height
  const logoClass = width || height ? className : `${sizeMap[size].class} ${className}`.trim()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Show light logo during hydration to avoid flash
    return (
      <Image
        src="/images/tuna_terra_wireframe_brand_light.svg"
        alt={alt}
        width={logoWidth}
        height={logoHeight}
        className={logoClass}
        priority
      />
    )
  }

  // Determine which logo to show based on theme
  const currentTheme = theme === 'system' ? systemTheme : theme
  const logoSrc = currentTheme === 'dark' 
    ? '/images/tuna_terra_wireframe_brand_dark.svg'
    : '/images/tuna_terra_wireframe_brand_light.svg'

  return (
    <Image
      src={logoSrc}
      alt={alt}
      width={logoWidth}
      height={logoHeight}
      className={logoClass}
      priority
    />
  )
}