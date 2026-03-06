import { auth } from '@/auth'
import { STRAPI_API_URL } from '@/shared/api/strapi'
import type { Booking } from '@/shared/api/generated/types/Booking'
import type { BookingRecord, BookingStatus } from '@/widgets/bookings-table'
import type { MapLocation } from '@/widgets/bookings-map/ui/BookingsMap'
import { BookingsPageClient } from './BookingsPageClient'

const MONTHS_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${parseInt(day)} ${MONTHS_RU[parseInt(month) - 1]} ${year}`
}

function formatTimeRange(start?: string, end?: string): string {
  const fmt = (t: string) => t.slice(0, 5)
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return fmt(start)
  return '—'
}

function mapStatus(status: string): BookingStatus {
  if (status === 'confirmed') return 'confirmed'
  if (status === 'cancelled') return 'cancelled'
  return 'new'
}

function toBookingRecord(b: Booking): BookingRecord {
  return {
    id: b.documentId ?? String(b.id),
    name: b.customerName,
    email: b.customerEmail,
    eventName: b.event?.name ?? '—',
    locationName: b.event?.location?.name ?? '—',
    date: b.event?.date ? formatDate(b.event.date) : '—',
    rawDate: b.event?.date,
    timeRange: formatTimeRange(b.event?.startTime, b.event?.endTime),
    quantity: b.quantity,
    status: mapStatus(b.status),
  }
}

export default async function BookingsPage() {
  const session = await auth()
  let bookings: BookingRecord[] = []
  let mapLocations: MapLocation[] = []

  if (session?.strapiJwt) {
    const params = new URLSearchParams({
      'populate[0]': 'event',
      'populate[1]': 'event.location',
      'pagination[pageSize]': '100',
      sort: 'createdAt:desc',
    })

    const res = await fetch(`${STRAPI_API_URL}/bookings?${params}`, {
      headers: { Authorization: `Bearer ${session.strapiJwt}` },
      cache: 'no-store',
    })

    if (res.ok) {
      const json = await res.json()
      const data: Booking[] = json.data ?? []
      bookings = data.map(toBookingRecord)

      const locationMap = new Map<string, MapLocation>()
      for (const b of data) {
        const loc = b.event?.location
        if (loc?.documentId && loc.lat != null && loc.lng != null) {
          locationMap.set(loc.documentId, {
            documentId: loc.documentId,
            name: loc.name ?? '',
            address: loc.address,
            metro: loc.metro,
            lat: loc.lat,
            lng: loc.lng,
          })
        }
      }
      mapLocations = Array.from(locationMap.values())
    }
  }

  return <BookingsPageClient initialBookings={bookings} locations={mapLocations} />
}
