'use client'

import { useState, useEffect, useRef } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Button } from '@/shared/ui/button'
import { Clock } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type Props = {
  value: string        // "HH:MM"
  onChange: (value: string) => void
  min?: string         // "HH:MM"
  max?: string         // "HH:MM"
  className?: string
}

function parseTime(t: string): [number, number] {
  const [h, m] = t.split(':').map(Number)
  return [h, m]
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

const MINUTE_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

export function TimePicker({ value, onChange, min = '00:00', max = '23:59', className }: Props) {
  const [open, setOpen] = useState(false)
  const [minH, minM] = parseTime(min)
  const [maxH, maxM] = parseTime(max)
  const [selH, selM] = parseTime(value || min)

  const hourListRef = useRef<HTMLDivElement>(null)
  const minListRef = useRef<HTMLDivElement>(null)

  const hours = Array.from({ length: maxH - minH + 1 }, (_, i) => minH + i)

  function getMinutes(h: number) {
    return MINUTE_STEPS.filter(m => {
      if (h === minH && m < minM) return false
      if (h === maxH && m > maxM) return false
      return true
    })
  }

  const minutes = getMinutes(selH)

  function handleHourClick(h: number) {
    const avail = getMinutes(h)
    const m = avail.includes(selM) ? selM : (avail[0] ?? 0)
    onChange(`${pad(h)}:${pad(m)}`)
  }

  function handleMinuteClick(m: number) {
    onChange(`${pad(selH)}:${pad(m)}`)
    setOpen(false)
  }

  // Scroll selected item into view when popover opens
  useEffect(() => {
    if (!open) return
    setTimeout(() => {
      hourListRef.current?.querySelector('[data-selected]')?.scrollIntoView({ block: 'center' })
      minListRef.current?.querySelector('[data-selected]')?.scrollIntoView({ block: 'center' })
    }, 10)
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('h-11 w-32 justify-start gap-2 text-lg border-black font-normal', className)}
        >
          <Clock className="size-4 text-muted-foreground shrink-0" />
          {value || min}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-0" align="start">
        <div className="flex divide-x">
          {/* Hours */}
          <div className="flex-1 flex flex-col">
            <div className="px-2 py-1.5 text-lg font-medium text-muted-foreground border-b">Часы</div>
            <div ref={hourListRef} className="h-48 overflow-y-auto">
              {hours.map(h => (
                <button
                  key={h}
                  data-selected={h === selH ? '' : undefined}
                  onClick={() => handleHourClick(h)}
                  className={cn(
                    'w-full px-3 py-2 text-lg text-left hover:bg-accent transition-colors',
                    h === selH && 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                >
                  {pad(h)}
                </button>
              ))}
            </div>
          </div>

          {/* Minutes */}
          <div className="flex-1 flex flex-col">
            <div className="px-2 py-1.5 text-lg font-medium text-muted-foreground border-b">Мин</div>
            <div ref={minListRef} className="h-48 overflow-y-auto">
              {minutes.map(m => (
                <button
                  key={m}
                  data-selected={m === selM ? '' : undefined}
                  onClick={() => handleMinuteClick(m)}
                  className={cn(
                    'w-full px-3 py-2 text-lg text-left hover:bg-accent transition-colors',
                    m === selM && 'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                >
                  {pad(m)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
