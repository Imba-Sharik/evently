'use client'

import { EventCard } from '@/entities/event'
import { useBooking, BookingDialog } from '@/features/booking'
import type { EventDetail } from '@/shared/mocks/events'

type EventSlot = {
  label: string
  event: EventDetail
}

type Props = {
  slots: EventSlot[]
  selectedDate: Date
  locationName: string
}

export function LocationEvents({ slots, selectedDate, locationName }: Props) {
  const {
    booking, bookingName, bookingEmail,
    setBookingName, setBookingEmail,
    getQuantity, changeQuantity,
    openBooking, closeBooking,
  } = useBooking()

  return (
    <>
      <div className="flex flex-col gap-6">
        {slots.map(({ label, event }) => (
          <div key={label} className="flex flex-col gap-3">
            <h2 className="text-2xl font-medium text-muted-foreground">{label}</h2>
            <EventCard
              event={event}
              date={selectedDate}
              quantity={getQuantity(event.id)}
              onQuantityChange={(delta) => changeQuantity(event.id, delta)}
              onBook={() => openBooking(event, selectedDate)}
            />
          </div>
        ))}
      </div>

      <BookingDialog
        booking={booking}
        locationName={locationName}
        bookingName={bookingName}
        bookingEmail={bookingEmail}
        onNameChange={setBookingName}
        onEmailChange={setBookingEmail}
        onSubmit={closeBooking}
        onCancel={closeBooking}
      />
    </>
  )
}
