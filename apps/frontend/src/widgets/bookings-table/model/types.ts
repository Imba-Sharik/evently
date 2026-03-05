export type BookingStatus = 'new' | 'confirmed' | 'cancelled'

export type BookingRecord = {
  id: string
  name: string
  email: string
  eventName: string
  locationName: string
  date: string
  timeRange: string
  quantity: number
  status: BookingStatus
}
