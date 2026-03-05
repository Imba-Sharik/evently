'use client'

import { useState } from 'react'
import type { EventDetail } from '@/shared/mocks/events'
import type { BookingState } from './types'

export function useBooking() {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [booking, setBooking] = useState<BookingState | null>(null)
  const [bookingName, setBookingName] = useState('')
  const [bookingEmail, setBookingEmail] = useState('')

  function getQuantity(eventId: string) {
    return quantities[eventId] ?? 1
  }

  function changeQuantity(eventId: string, delta: number) {
    setQuantities(prev => ({
      ...prev,
      [eventId]: Math.max(1, (prev[eventId] ?? 1) + delta),
    }))
  }

  function openBooking(event: EventDetail, date: Date) {
    setBooking({ event, date, quantity: getQuantity(event.id) })
  }

  function closeBooking() {
    setBooking(null)
    setBookingName('')
    setBookingEmail('')
  }

  return {
    quantities,
    booking,
    bookingName,
    bookingEmail,
    setBookingName,
    setBookingEmail,
    getQuantity,
    changeQuantity,
    openBooking,
    closeBooking,
  }
}
