import Link from 'next/link'
import { auth } from '@/auth'
import { STRAPI_API_URL } from '@/shared/api/strapi'
import type { Event } from '@/shared/api/generated/types/Event'
import type { Location } from '@/shared/api/generated/types/Location'
import { Button } from '@/shared/ui/button'
import { AdminEventsTable } from '@/widgets/admin-events-table'
import { AdminTemplatesList } from '@/widgets/admin-templates-list'

export default async function EventsPage() {
  const session = await auth()
  let events: Event[] = []
  let templates: Event[] = []
  let locations: { documentId: string; name: string }[] = []

  if (session?.strapiJwt) {
    const headers = { Authorization: `Bearer ${session.strapiJwt}` }

    const [eventsRes, templatesRes, locationsRes] = await Promise.all([
      fetch(`${STRAPI_API_URL}/events?${new URLSearchParams({
        'populate[0]': 'location',
        'populate[1]': 'bookings',
        'filters[isTemplate][$ne]': 'true',
        'pagination[pageSize]': '200',
        sort: 'date:asc',
      })}`, { headers, cache: 'no-store' }),
      fetch(`${STRAPI_API_URL}/events?${new URLSearchParams({
        'populate[0]': 'location',
        'filters[isTemplate][$eq]': 'true',
        'pagination[pageSize]': '100',
        sort: 'name:asc',
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

    if (templatesRes.ok) {
      const json = await templatesRes.json()
      templates = json.data ?? []
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
    <div className="p-6 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div />
        <Button asChild className="h-11 gap-2 text-lg">
          <Link href="/admin/events/new">
            Создать мероприятие
          </Link>
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Templates sidebar */}
        <div className="w-96 shrink-0">
          <AdminTemplatesList templates={templates} />
        </div>

        {/* Events table */}
        <div className="flex-1 min-w-0 space-y-4">
          <h2 className="text-xl font-semibold">Расписание мероприятий</h2>
          <AdminEventsTable data={events} locations={locations} />
        </div>
      </div>
    </div>
  )
}
