'use client'

import { Button } from '@/shared/ui/button'
import { formatDate } from '@/shared/lib/date'
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
  const available = (event.totalSpots ?? 0) > 0
  const startTime = formatTime(event.startTime)

  return (
    <div className="bg-white p-6 border border-black" style={{ borderRadius: '30px' }}>
      <div className="flex justify-between items-start mb-4">
        <div className="max-w-137.5">
          <p className="text-lg font-bold">{event.name}</p>
          <p className="text-lg text-muted-foreground">
            {available ? `Осталось ${event.totalSpots} мест` : 'Не осталось мест :('}
          </p>
          <p className="text-lg mt-2">
            <span className="font-bold">{event.name}</span>
            {event.description ? ` – ${event.description}` : ''}
          </p>
        </div>
        <div className="text-right text-lg text-muted-foreground shrink-0 ml-4">
          <p>{formatDate(date)}</p>
          <p>Начало: {startTime}</p>
          {locationName && <p>{locationName}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={!available}
          className="text-lg"
          onClick={available ? onBook : undefined}
        >
          {available ? 'Записаться' : 'Недоступно'}
        </Button>

        {available && (
          <div className="flex items-center gap-2 text-lg">
            <span className="text-muted-foreground">Кол-во мест:</span>
            <button
              className="w-7 h-7 rounded border flex items-center justify-center hover:bg-gray-50"
              onClick={() => onQuantityChange(-1)}
            >
              −
            </button>
            <span className="w-6 text-center">{quantity}</span>
            <button
              className="w-7 h-7 rounded border flex items-center justify-center hover:bg-gray-50"
              onClick={() => onQuantityChange(1)}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
