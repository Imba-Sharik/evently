export type BookingStatus = 'new' | 'confirmed' | 'cancelled'

export type BookingRecord = {
  id: string
  name: string
  email: string
  eventName: string
  locationName: string
  date: string
  rawDate?: string // ISO YYYY-MM-DD, для группировки по датам
  timeRange: string
  quantity: number
  status: BookingStatus
}
