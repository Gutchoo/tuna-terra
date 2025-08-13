'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Loader2Icon } from 'lucide-react'

interface InlineEditablePortfolioNameProps {
  portfolioId: string
  initialName: string
  canEdit: boolean
  className?: string
  inputClassName?: string
  onNameChange?: (newName: string) => void
  onError?: (error: string) => void
}

export function InlineEditablePortfolioName({
  portfolioId,
  initialName,
  canEdit,
  className,
  inputClassName,
  onNameChange,
  onError
}: InlineEditablePortfolioNameProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialName)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update value when initialName changes
  useEffect(() => {
    setValue(initialName)
  }, [initialName])

  // Focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    if (!canEdit || isLoading) return
    setIsEditing(true)
    setValue(initialName) // Reset to current name in case of previous failed edit
  }

  const handleSave = async () => {
    if (!canEdit || isLoading) return

    const trimmedValue = value.trim()
    
    // Don't save if empty or same as initial
    if (!trimmedValue) {
      setValue(initialName)
      setIsEditing(false)
      return
    }

    if (trimmedValue === initialName) {
      setIsEditing(false)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: trimmedValue }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update portfolio name')
      }

      const { portfolio } = await response.json()
      
      // Update the value to the returned name (in case server modified it)
      setValue(portfolio.name)
      onNameChange?.(portfolio.name)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating portfolio name:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update portfolio name'
      onError?.(errorMessage)
      
      // Reset to original value on error
      setValue(initialName)
      setIsEditing(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setValue(initialName)
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  const handleBlur = () => {
    // Small delay to allow click events to register first
    setTimeout(() => {
      if (isEditing) {
        handleSave()
      }
    }, 100)
  }

  if (isEditing) {
    return (
      <div className={cn('relative flex items-center', className)}>
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={isLoading}
          maxLength={100}
          className={cn(
            'h-auto p-0 border-none shadow-none font-inherit text-inherit bg-transparent focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1',
            inputClassName
          )}
        />
        {isLoading && (
          <Loader2Icon className="h-4 w-4 animate-spin ml-2 flex-shrink-0" />
        )}
      </div>
    )
  }

  return (
    <span
      className={cn(
        canEdit && 'cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors',
        className
      )}
      onClick={handleStartEdit}
      title={canEdit ? 'Click to edit portfolio name' : undefined}
    >
      {value}
    </span>
  )
}