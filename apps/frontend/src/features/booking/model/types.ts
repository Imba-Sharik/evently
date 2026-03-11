import type { Event } from '@/shared/api/generated/types/Event'

export type BookingState = {
  event: Event
  date: Date
  quantity: number
}
