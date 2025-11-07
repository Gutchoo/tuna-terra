'use client';

import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface InlineEditTextareaProps {
  label: string;
  value: string | null | undefined;
  onChange?: (value: string) => void;
  isEditMode?: boolean;
  canEdit: boolean;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function InlineEditTextarea({
  label,
  value,
  onChange,
  isEditMode = false,
  canEdit,
  placeholder = 'No notes',
  className,
  rows = 4,
}: InlineEditTextareaProps) {

  const displayValue = value || placeholder;

  const handleChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex items-start gap-2">
        {!isEditMode ? (
          <span
            className={cn(
              'flex-1 text-sm min-h-[28px] whitespace-pre-wrap',
              !value && 'text-muted-foreground italic'
            )}
          >
            {displayValue}
          </span>
        ) : (
          <Textarea
            value={String(value || '')}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 min-h-24 resize-y"
            rows={rows}
            disabled={!canEdit}
            placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );
}
