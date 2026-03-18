'use client'

import { useState } from 'react'
import { format, addDays, parseISO } from 'date-fns'
import { toast } from 'sonner'

import type { Event } from '@/shared/api/generated/types/Event'
import { EventCard } from '@/entities/event'
import { EventsFilter } from '@/shared/ui/events-filter'
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
      <EventsFilter
        dateFilter={dateFilter}
        customDate={customDate}
        search={search}
        onDateChange={(filter, date) => { setDateFilter(filter); setCustomDate(date) }}
        onSearchChange={setSearch}
      />

      {/* Events list */}
      <div className="flex flex-col gap-4 p-4 section-border">
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
