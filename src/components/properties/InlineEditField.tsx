'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineEditFieldProps {
  label: string;
  value: string | number | null | undefined;
  onSave: (value: string) => Promise<void>;
  canEdit: boolean;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
  className?: string;
  formatDisplay?: (value: string | number | null | undefined) => string;
}

export function InlineEditField({
  label,
  value,
  onSave,
  canEdit,
  type = 'text',
  placeholder = 'Not set',
  className,
  formatDisplay,
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value || ''));
  const [isSaving, setIsSaving] = useState(false);

  // Update editValue when value prop changes (important for showing updated values)
  useEffect(() => {
    if (!isEditing) {
      // For date inputs, extract just the date part (YYYY-MM-DD) without time/timezone conversion
      if (type === 'date' && value) {
        const dateStr = String(value);
        // Extract YYYY-MM-DD from ISO string or date string
        const dateOnly = dateStr.split('T')[0];
        setEditValue(dateOnly);
      } else {
        setEditValue(String(value || ''));
      }
    }
  }, [value, isEditing, type]);

  const displayValue = formatDisplay
    ? formatDisplay(value)
    : value
    ? String(value)
    : placeholder;

  const handleSave = async () => {
    if (editValue === String(value || '')) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(String(value || ''));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {!isEditing ? (
          <>
            <span
              className={cn(
                'flex-1 text-sm',
                !value && 'text-muted-foreground italic'
              )}
            >
              {displayValue}
            </span>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  // For date inputs, extract just the date part (YYYY-MM-DD)
                  if (type === 'date' && value) {
                    const dateStr = String(value);
                    const dateOnly = dateStr.split('T')[0];
                    setEditValue(dateOnly);
                  } else {
                    setEditValue(String(value || ''));
                  }
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
          </>
        ) : (
          <>
            <Input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8 flex-1"
              autoFocus
              disabled={isSaving}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-green-600 hover:text-green-700"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-600 hover:text-red-700"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
