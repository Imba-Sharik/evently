import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { STRAPI_API_URL } from '@/shared/api/strapi'
import type { Event } from '@/shared/api/generated/types/Event'
import type { Location } from '@/shared/api/generated/types/Location'
import { EventFormPage } from '@/widgets/admin-events-table'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const headers = { Authorization: `Bearer ${session?.strapiJwt ?? ''}` }

  const [eventRes, locationsRes] = await Promise.all([
    fetch(`${STRAPI_API_URL}/events/${id}?populate=location`, { headers, cache: 'no-store' }),
    fetch(`${STRAPI_API_URL}/locations?${new URLSearchParams({
      'fields[0]': 'documentId',
      'fields[1]': 'name',
      'pagination[pageSize]': '100',
    })}`, { headers, cache: 'no-store' }),
  ])

  if (!eventRes.ok) notFound()
  const eventJson = await eventRes.json()
  const event: Event = eventJson.data
  if (!event) notFound()

  let locations: { documentId: string; name: string }[] = []
  if (locationsRes.ok) {
    const json = await locationsRes.json()
    locations = (json.data as Location[]).map(l => ({
      documentId: String(l.documentId),
      name: l.name ?? '',
    }))
  }

  return <EventFormPage locations={locations} event={event} />
}
