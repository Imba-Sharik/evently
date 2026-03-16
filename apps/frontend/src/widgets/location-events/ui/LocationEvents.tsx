'use client'

import { useState } from 'react'
import { format, addDays, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Search, X } from 'lucide-react'
import { toast } from 'sonner'

import type { Event } from '@/shared/api/generated/types/Event'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/popover'
import { EventCard } from '@/entities/event'
import { useBooking, BookingDialog } from '@/features/booking'
import { createBookingAction } from '@/entities/booking/actions'

type Props = {
  events: Event[]
  locationName: string
  locationDocumentId: string
}

export function LocationEvents({ events, locationName, locationDocumentId }: Props) {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'custom'>('today')
  const [customDate, setCustomDate] = useState<Date | undefined>()
  const [search, setSearch] = useState('')

  const {
    booking, bookingName, bookingEmail,
    setBookingName, setBookingEmail,
    getQuantity, changeQuantity,
    openBooking, closeBooking, eventKey,
  } = useBooking()

  const dateTarget =
    dateFilter === 'today' ? todayStr
    : dateFilter === 'tomorrow' ? tomorrowStr
    : customDate ? format(customDate, 'yyyy-MM-dd')
    : null

  const filtered = events.filter(event => {
    if (event.location?.documentId !== locationDocumentId) return false
    if (dateTarget && event.date !== dateTarget) return false
    if (search && !event.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function handleSubmit() {
    if (!booking || !bookingName || !bookingEmail) return
    try {
      await createBookingAction({
        customerName: bookingName,
        customerEmail: bookingEmail,
        quantity: booking.quantity,
        eventDocumentId: String(booking.event.documentId ?? booking.event.id),
        locationDocumentId,
      })
      closeBooking()
      toast.success('Вы успешно записались на мероприятие!')
    } catch {
      toast.error('Не удалось оформить запись. Попробуйте ещё раз.')
    }
  }

  return (
    <>
      {/* Filter row */}
      <div className="flex gap-3 flex-wrap items-center">
        <Button
          variant={dateFilter === 'today' ? 'default' : 'outline'}
          className="rounded-full text-lg"
          onClick={() => { setDateFilter('today'); setCustomDate(undefined) }}
        >
          Сегодня
        </Button>
        <Button
          variant={dateFilter === 'tomorrow' ? 'default' : 'outline'}
          className="rounded-full text-lg"
          onClick={() => { setDateFilter('tomorrow'); setCustomDate(undefined) }}
        >
          Завтра
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={dateFilter === 'custom' ? 'default' : 'outline'}
              className="rounded-full text-lg"
            >
              {dateFilter === 'custom' && customDate
                ? format(customDate, 'd MMMM', { locale: ru })
                : 'Выбрать дату'}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={customDate}
              onSelect={date => {
                setCustomDate(date)
                setDateFilter('custom')
              }}
              locale={ru}
            />
          </PopoverContent>
        </Popover>

        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по мероприятиям"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-9 rounded-full text-lg"
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch('')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Events list */}
      <div className="flex flex-col gap-6">
        {filtered.map(event => {
          const key = eventKey(event)
          const date = event.date ? parseISO(event.date) : new Date()
          return (
            <EventCard
              key={key}
              event={event}
              date={date}
              quantity={getQuantity(key)}
              onQuantityChange={(delta) => changeQuantity(key, delta)}
              onBook={() => openBooking(event, date)}
            />
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-lg">
            Мероприятий не найдено
          </div>
        )}
      </div>

      <BookingDialog
        booking={booking}
        locationName={locationName}
        bookingName={bookingName}
        bookingEmail={bookingEmail}
        onNameChange={setBookingName}
        onEmailChange={setBookingEmail}
        onSubmit={handleSubmit}
        onCancel={closeBooking}
      />
    </>
  )
}
