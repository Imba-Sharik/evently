import type { EventDetail } from '@/shared/mocks/events'

export type BookingState = {
  event: EventDetail
  date: Date
  quantity: number
}
