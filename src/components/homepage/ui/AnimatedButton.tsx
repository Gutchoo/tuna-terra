'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode
  className?: string
  premium?: boolean
}

export function AnimatedButton({ 
  children, 
  className, 
  premium = false,
  ...props 
}: AnimatedButtonProps) {
  return (
    <Button
      className={cn(
        premium && "glow-primary",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}