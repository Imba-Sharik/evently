'use client'

import { useState } from 'react'
import type { Event } from '@/shared/api/generated/types/Event'
import type { BookingState } from './types'

function eventKey(event: Event) {
  return String(event.documentId ?? event.id ?? event.name)
}

export function useBooking() {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [booking, setBooking] = useState<BookingState | null>(null)
  const [bookingName, setBookingName] = useState('')
  const [bookingEmail, setBookingEmail] = useState('')

  function getQuantity(key: string) {
    return quantities[key] ?? 1
  }

  function changeQuantity(key: string, delta: number) {
    setQuantities(prev => ({
      ...prev,
      [key]: Math.max(1, (prev[key] ?? 1) + delta),
    }))
  }

  function openBooking(event: Event, date: Date) {
    const key = eventKey(event)
    setBooking({ event, date, quantity: getQuantity(key) })
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
    eventKey,
  }
}
