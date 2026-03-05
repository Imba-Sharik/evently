'use client'

import { useState } from 'react'
import { BookingsTable } from '@/widgets/bookings-table'
import type { BookingRecord, BookingStatus } from '@/widgets/bookings-table'
import { BookingsDashboard } from '@/widgets/bookings-dashboard'

const mockBookings: BookingRecord[] = [
  {
    id: '1',
    name: 'Иванова Мария Сергеевна',
    email: 'ivanova@gmail.com',
    eventName: 'Wellness-утро',
    locationName: 'Парк Горького',
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
    locationName: 'Музей Современного Искусства',
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
    locationName: 'Арт-кластер Флакон',
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
    locationName: 'Парк Горького',
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
    locationName: 'Музей Современного Искусства',
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
    locationName: 'Арт-кластер Флакон',
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
    locationName: 'Парк Горького',
    date: '8 марта 2026',
    timeRange: '08:00 – 11:00',
    quantity: 1,
    status: 'confirmed',
  },
]

export default function BookingsPage() {
  const [bookings, setBookings] = useState(mockBookings)

  function handleStatusChange(id: string, status: BookingStatus) {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b))
  }

  function handleDelete(id: string) {
    setBookings((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      <BookingsDashboard bookings={bookings} />
      <BookingsTable
        bookings={bookings}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  )
}
