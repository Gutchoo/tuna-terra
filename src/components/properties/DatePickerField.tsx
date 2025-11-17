'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerFieldProps {
  label: string;
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  isEditMode: boolean;
  canEdit: boolean;
  placeholder?: string;
  formatDisplay?: (value: string | number | null | undefined) => string;
  className?: string;
}

export function DatePickerField({
  label,
  value,
  onChange,
  isEditMode,
  canEdit,
  placeholder = 'Not set',
  formatDisplay,
  className,
}: DatePickerFieldProps) {
  // Parse the date value from YYYY-MM-DD string to Date object
  const parseDate = (dateValue: string | number | null | undefined): Date | undefined => {
    if (!dateValue) return undefined;

    const dateStr = String(dateValue);
    // Extract date parts from YYYY-MM-DD format to avoid timezone issues
    const dateParts = dateStr.split('T')[0].split('-');

    if (dateParts.length === 3) {
      const [year, month, day] = dateParts;
      // Create date in local timezone, not UTC
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    return undefined;
  };

  // Convert Date object back to YYYY-MM-DD string for storage
  const formatDateForStorage = (date: Date | undefined): string => {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const [open, setOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    const formattedDate = formatDateForStorage(date);
    onChange(formattedDate);
    setOpen(false); // Close the popover after selection
  };

  const selectedDate = parseDate(value);

  // Use custom display formatter if provided, otherwise use default
  const displayValue = formatDisplay
    ? formatDisplay(value)
    : value
    ? format(selectedDate || new Date(), 'PPP')
    : placeholder;

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
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-7 flex-1 justify-between text-left font-normal text-sm px-2 py-0.5',
                  !selectedDate && 'text-muted-foreground'
                )}
                disabled={!canEdit}
              >
                {selectedDate ? format(selectedDate, 'PPP') : <span>{placeholder}</span>}
                <CalendarIcon className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                captionLayout="dropdown"
                fromYear={1900}
                toYear={new Date().getFullYear() + 50}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
