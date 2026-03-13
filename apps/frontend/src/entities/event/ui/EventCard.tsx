'use client'

import { Minus, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { formatDate } from '@/shared/lib/date'
import { splitDescription } from '../lib/split-description'
import type { Event } from '@/shared/api/generated/types/Event'

function formatTime(t?: string) {
  return t ? t.slice(0, 5) : ''
}

export function EventCard({
  event,
  date,
  locationName,
  quantity,
  onQuantityChange,
  onBook,
}: {
  event: Event
  date: Date
  locationName?: string
  quantity: number
  onQuantityChange: (delta: number) => void
  onBook: () => void
}) {
  const available = event.totalSpots > 0
  const [bold, rest] = splitDescription(event.description ?? '')
  const timeRange = `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`

  return (
    <Card className="rounded-2xl px-5 py-4 gap-0 border-black">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-xl leading-tight">{event.name}</p>
          <p className="text-lg text-muted-foreground mt-0.5">
            {available
              ? `Осталось ${event.totalSpots} мест`
              : 'Не осталось мест :('}
          </p>
        </div>
        <div className="text-right text-lg text-muted-foreground shrink-0">
          <p>{formatDate(date)}</p>
          <p>{timeRange}</p>
          {locationName && <p>{locationName}</p>}
        </div>
      </div>

      {/* Description */}
      <p className="text-lg mt-3 leading-relaxed line-clamp-4">
        <strong>{bold}</strong>
        {rest}
      </p>

      {/* Action row */}
      <div className="flex items-center justify-between mt-4 gap-4">
        <Button
          variant="outline"
          className="text-lg border-black"
          disabled={!available}
          onClick={available ? onBook : undefined}
        >
          {available ? 'Записаться' : 'Недоступно'}
        </Button>

        {available && (
          <div className="flex items-center gap-2 text-lg">
            <span className="text-muted-foreground">Кол-во мест:</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-black"
              onClick={() => onQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus className="size-3" />
            </Button>
            <span className="w-4 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-black"
              onClick={() => onQuantityChange(1)}
              disabled={quantity >= event.totalSpots}
            >
              <Plus className="size-3" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
