'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookingsTable } from '@/widgets/bookings-table'
import type { BookingRecord, BookingStatus } from '@/widgets/bookings-table'
import { BookingsDashboard } from '@/widgets/bookings-dashboard'
import { BookingsMap } from '@/widgets/bookings-map/ui/BookingsMap'
import type { MapLocation } from '@/widgets/bookings-map/ui/BookingsMap'
import { updateBookingStatusAction, deleteBookingAction } from '@/entities/booking/actions'

type Props = {
  initialBookings: BookingRecord[]
  locations: MapLocation[]
}

export function BookingsPageClient({ initialBookings, locations }: Props) {
  const router = useRouter()
  const [bookings, setBookings] = useState(initialBookings)
  const [locationFilter, setLocationFilter] = useState('all')

  useEffect(() => {
    setBookings(initialBookings)
  }, [initialBookings])

  async function handleStatusChange(id: string, status: BookingStatus) {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b))
    await updateBookingStatusAction(id, status)
    router.refresh()
  }

  async function handleDelete(id: string) {
    setBookings((prev) => prev.filter((b) => b.id !== id))
    await deleteBookingAction(id)
    router.refresh()
  }

  return (
    <div className="p-6 space-y-6">
      <BookingsDashboard bookings={bookings} />
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <BookingsTable
            bookings={bookings}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            locationFilter={locationFilter}
            onLocationFilterChange={setLocationFilter}
          />
        </div>
        <div className="w-full h-64 xl:w-96 xl:h-auto shrink-0 xl:sticky xl:top-20 bg-black rounded-xl p-px">
          <BookingsMap
            bookings={bookings}
            locations={locations}
            selectedLocation={locationFilter}
            onLocationSelect={setLocationFilter}
          />
        </div>
      </div>
    </div>
  )
}
