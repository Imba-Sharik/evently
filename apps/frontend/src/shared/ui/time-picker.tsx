'use client'

import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/utils'

type Props = {
  value: string        // "HH:MM"
  onChange: (value: string) => void
  min?: string         // "HH:MM"
  max?: string         // "HH:MM"
  className?: string
}

export function TimePicker({ value, onChange, min, max, className }: Props) {
  function handleBlur() {
    if (!value) return
    if (min && value < min) onChange(min)
    if (max && value > max) onChange(max)
  }

  return (
    <Input
      type="time"
      value={value}
      min={min}
      max={max}
      onChange={e => onChange(e.target.value)}
      onBlur={handleBlur}
      className={cn(
        'h-11 w-16 text-lg appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none',
        className
      )}
    />
  )
}
