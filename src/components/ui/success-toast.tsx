'use client'

import { useEffect, useState } from 'react'
import { CheckCircleIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  message: string
  description?: string
  duration?: number
  onClose?: () => void
}

export function SuccessToast({ message, description, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsLeaving(true)
        setTimeout(() => {
          setIsVisible(false)
          onClose?.()
        }, 300) // Animation duration
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex w-full max-w-sm items-start gap-3 rounded-lg border bg-background p-4 shadow-lg transition-all duration-300",
        isLeaving 
          ? "opacity-0 translate-x-full scale-95" 
          : "opacity-100 translate-x-0 scale-100",
        "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/10 dark:text-green-100"
      )}
    >
      <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
      
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{message}</p>
        {description && (
          <p className="text-xs text-green-700 dark:text-green-300">{description}</p>
        )}
      </div>

      <button
        onClick={handleClose}
        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

// Hook for managing toast notifications
export function useSuccessToast() {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([])

  const showToast = (toast: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = {
      ...toast,
      id,
      onClose: () => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }
    }
    
    setToasts(prev => [...prev, newToast])
  }

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <SuccessToast key={toast.id} {...toast} />
      ))}
    </div>
  )

  return { showToast, ToastContainer }
}