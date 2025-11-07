'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineEditFieldProps {
  label: string;
  value: string | number | null | undefined;
  onChange?: (value: string) => void;
  onSave?: (value: string) => Promise<void>;
  isEditMode?: boolean;
  canEdit: boolean;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
  className?: string;
  formatDisplay?: (value: string | number | null | undefined) => string;
}

export function InlineEditField({
  label,
  value,
  onChange,
  onSave,
  isEditMode = false,
  canEdit,
  type = 'text',
  placeholder = 'Not set',
  className,
  formatDisplay,
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value || ''));
  const [isSaving, setIsSaving] = useState(false);

  // Use batch edit mode if isEditMode is provided, otherwise use old inline edit mode
  const useBatchMode = onChange !== undefined;

  // Update editValue when value prop changes (important for showing updated values)
  useEffect(() => {
    if (!isEditing && !useBatchMode) {
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
  }, [value, isEditing, type, useBatchMode]);

  const displayValue = formatDisplay
    ? formatDisplay(value)
    : value
    ? String(value)
    : placeholder;

  const handleSave = async () => {
    if (!onSave) return;

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
    if (!useBatchMode && e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleChange = (newValue: string) => {
    if (useBatchMode && onChange) {
      onChange(newValue);
    } else {
      setEditValue(newValue);
    }
  };

  // Get the input value for batch mode or individual edit mode
  const getInputValue = () => {
    if (useBatchMode) {
      // For date inputs in batch mode, extract just the date part
      if (type === 'date' && value) {
        const dateStr = String(value);
        return dateStr.split('T')[0];
      }
      return String(value || '');
    }
    return editValue;
  };

  // In batch mode, show input fields when isEditMode is true
  if (useBatchMode) {
    return (
      <div className={cn('flex flex-col space-y-1', className)}>
        <label className="text-sm font-medium text-muted-foreground">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {!isEditMode ? (
            <span
              className={cn(
                'flex-1 text-sm min-h-[28px] flex items-center',
                !value && 'text-muted-foreground italic'
              )}
            >
              {displayValue}
            </span>
          ) : (
            <Input
              type={type}
              value={getInputValue()}
              onChange={(e) => handleChange(e.target.value)}
              className="h-7 flex-1 px-2 py-0.5"
              disabled={!canEdit}
            />
          )}
        </div>
      </div>
    );
  }

  // Original inline edit mode (for backwards compatibility)
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
              className="h-7 flex-1 px-2 py-0.5"
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
