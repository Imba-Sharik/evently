'use client'

import { toast } from 'sonner'
import { EventCard } from '@/entities/event'
import { useBooking, BookingDialog } from '@/features/booking'
import { createBookingAction } from '@/entities/booking/actions'
import type { Event } from '@/shared/api/generated/types/Event'

type Props = {
  events: Event[]
  selectedDate: Date
  locationName: string
  locationDocumentId: string
}

export function LocationEvents({ events, selectedDate, locationName, locationDocumentId }: Props) {
  const {
    booking, bookingName, bookingEmail,
    setBookingName, setBookingEmail,
    getQuantity, changeQuantity,
    openBooking, closeBooking, eventKey,
  } = useBooking()

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
      <div className="flex flex-col gap-6">
        {events.map(event => {
          const key = eventKey(event)
          return (
            <EventCard
              key={key}
              event={event}
              date={selectedDate}
              quantity={getQuantity(key)}
              onQuantityChange={(delta) => changeQuantity(key, delta)}
              onBook={() => openBooking(event, selectedDate)}
            />
          )
        })}
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
