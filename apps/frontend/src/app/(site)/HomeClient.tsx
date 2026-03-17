'use client'

import { useState } from 'react'
import { format, parseISO, addDays } from 'date-fns'
import { toast } from 'sonner'

import type { Event } from '@/shared/api/generated/types/Event'
import type { Location } from '@/shared/api/generated/types/Location'
import { Button } from '@/shared/ui/button'
import { useBooking, BookingDialog } from '@/features/booking'
import { createBookingAction } from '@/entities/booking/actions'
import { EventCard } from '@/entities/event'
import { EventsFilter } from '@/shared/ui/events-filter'


type Props = {
  locations: Location[]
  events: Event[]
}

export function HomeClient({ locations, events }: Props) {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'custom'>('today')
  const [customDate, setCustomDate] = useState<Date | undefined>()
  const [locationFilter, setLocationFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const PAGE_SIZE = 20

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
    if (dateTarget && event.date !== dateTarget) return false
    if (locationFilter && event.location?.documentId !== locationFilter) return false
    if (search && !event.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleSubmit() {
    if (!booking || !bookingName || !bookingEmail) return
    try {
      await createBookingAction({
        customerName: bookingName,
        customerEmail: bookingEmail,
        quantity: booking.quantity,
        eventDocumentId: String(booking.event.documentId ?? booking.event.id),
        locationDocumentId: String(booking.event.location?.documentId ?? ''),
      })
      closeBooking()
      toast.success('Вы успешно записались на мероприятие!')
    } catch {
      toast.error('Не удалось оформить запись. Попробуйте ещё раз.')
    }
  }

  return (
    <div className="container mx-auto py-6">
      <EventsFilter
        className="mb-6"
        dateFilter={dateFilter}
        customDate={customDate}
        search={search}
        locations={locations}
        locationFilter={locationFilter}
        onDateChange={(filter, date) => { setDateFilter(filter); setCustomDate(date); setPage(1) }}
        onSearchChange={v => { setSearch(v); setPage(1) }}
        onLocationChange={v => { setLocationFilter(v); setPage(1) }}
      />

      {/* Events list */}
      <div className="flex flex-col gap-4 p-4" style={{ border: '1px solid #CECECE', borderRadius: '40px' }}>
        {paginated.map(event => {
          const key = eventKey(event)
          const date = event.date ? parseISO(event.date) : new Date()
          return (
            <EventCard
              key={key}
              event={event}
              date={date}
              locationName={event.location?.name}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button
            variant="outline"
            className="text-lg"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Назад
          </Button>
          <span className="text-lg text-muted-foreground">{page} / {totalPages}</span>
          <Button
            variant="outline"
            className="text-lg"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Вперёд
          </Button>
        </div>
      )}

      <BookingDialog
        booking={booking}
        locationName={booking?.event.location?.name ?? ''}
        bookingName={bookingName}
        bookingEmail={bookingEmail}
        onNameChange={setBookingName}
        onEmailChange={setBookingEmail}
        onSubmit={handleSubmit}
        onCancel={closeBooking}
      />
    </div>
  )
}
