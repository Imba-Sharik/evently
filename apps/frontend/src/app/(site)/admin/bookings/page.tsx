'use client'

import { useState } from 'react'
import { BookingsTable } from '@/widgets/bookings-table'
import type { BookingRecord, BookingStatus } from '@/widgets/bookings-table'
import { BookingsDashboard } from '@/widgets/bookings-dashboard'
import { BookingsMap } from '@/widgets/bookings-map/ui/BookingsMap'

const mockBookings: BookingRecord[] = [
  {
    id: '1',
    name: 'Иванова Мария Сергеевна',
    email: 'ivanova@gmail.com',
    eventName: 'Wellness-утро',
    locationName: 'Локация #1',
    date: '5 марта 2026',
    timeRange: '08:00 – 11:00',
    quantity: 2,
    status: 'new',
  },
  {
    id: '2',
    name: 'Петров Алексей Игоревич',
    email: 'petrov@mail.ru',
    eventName: 'Open Mic',
    locationName: 'Локация #2',
    date: '5 марта 2026',
    timeRange: '19:00 – 22:00',
    quantity: 1,
    status: 'confirmed',
  },
  {
    id: '3',
    name: 'Смирнова Анна Дмитриевна',
    email: 'smirnova@yandex.ru',
    eventName: 'Social Dance',
    locationName: 'Локация #3',
    date: '6 марта 2026',
    timeRange: '18:30 – 22:00',
    quantity: 3,
    status: 'cancelled',
  },
  {
    id: '4',
    name: 'Козлов Дмитрий Викторович',
    email: 'kozlov@gmail.com',
    eventName: 'Фото-маршрут',
    locationName: 'Локация #1',
    date: '6 марта 2026',
    timeRange: '12:00 – 17:00',
    quantity: 1,
    status: 'new',
  },
  {
    id: '5',
    name: 'Новикова Елена Павловна',
    email: 'novikova@mail.ru',
    eventName: 'Park Quest',
    locationName: 'Локация #2',
    date: '7 марта 2026',
    timeRange: '13:00 – 16:00',
    quantity: 4,
    status: 'confirmed',
  },
  {
    id: '6',
    name: 'Федоров Сергей Александрович',
    email: 'fedorov@yandex.ru',
    eventName: 'Кино-вечер',
    locationName: 'Локация #3',
    date: '7 марта 2026',
    timeRange: '19:00 – 22:00',
    quantity: 2,
    status: 'new',
  },
  {
    id: '7',
    name: 'Морозова Ксения Олеговна',
    email: 'morozova@gmail.com',
    eventName: 'Йога + дыхание',
    locationName: 'Локация #1',
    date: '8 марта 2026',
    timeRange: '08:00 – 11:00',
    quantity: 1,
    status: 'confirmed',
  },
]

export default function BookingsPage() {
  const [bookings, setBookings] = useState(mockBookings)
  const [locationFilter, setLocationFilter] = useState('all')

  function handleStatusChange(id: string, status: BookingStatus) {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b))
  }

  function handleDelete(id: string) {
    setBookings((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      <BookingsDashboard bookings={bookings} />
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <BookingsTable
            bookings={bookings}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            locationFilter={locationFilter}
            onLocationFilterChange={setLocationFilter}
          />
        </div>
        <div className="w-96 shrink-0 sticky top-20 bg-black rounded-xl p-px">
          <BookingsMap
            bookings={bookings}
            selectedLocation={locationFilter}
            onLocationSelect={setLocationFilter}
          />
        </div>
      </div>
    </div>
  )
}
