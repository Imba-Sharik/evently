import { auth } from '@/auth'
import { STRAPI_API_URL } from '@/shared/api/strapi'
import type { Event } from '@/shared/api/generated/types/Event'
import type { Location } from '@/shared/api/generated/types/Location'
import { AdminEventsTable } from '@/widgets/admin-events-table'

export default async function EventsPage() {
  const session = await auth()
  let events: Event[] = []
  let locations: { documentId: string; name: string }[] = []

  if (session?.strapiJwt) {
    const headers = { Authorization: `Bearer ${session.strapiJwt}` }

    const [eventsRes, locationsRes] = await Promise.all([
      fetch(`${STRAPI_API_URL}/events?${new URLSearchParams({
        'populate[0]': 'location',
        'populate[1]': 'bookings',
        'pagination[pageSize]': '200',
        sort: 'date:asc',
      })}`, { headers, cache: 'no-store' }),
      fetch(`${STRAPI_API_URL}/locations?${new URLSearchParams({
        'fields[0]': 'documentId',
        'fields[1]': 'name',
        'pagination[pageSize]': '100',
      })}`, { headers, cache: 'no-store' }),
    ])

    if (eventsRes.ok) {
      const json = await eventsRes.json()
      events = json.data ?? []
    }

    if (locationsRes.ok) {
      const json = await locationsRes.json()
      locations = (json.data as Location[]).map((l) => ({
        documentId: String(l.documentId),
        name: l.name ?? '',
      }))
    }
  }

  return (
    <div className="p-6">
      <AdminEventsTable data={events} locations={locations} />
    </div>
  )
}
