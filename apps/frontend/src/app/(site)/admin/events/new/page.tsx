import { auth } from '@/auth'
import { STRAPI_API_URL } from '@/shared/api/strapi'
import type { Event } from '@/shared/api/generated/types/Event'
import type { Location } from '@/shared/api/generated/types/Location'
import { EventFormPage } from '@/widgets/admin-events-table'

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>
}) {
  const { template } = await searchParams
  const session = await auth()
  const headers = { Authorization: `Bearer ${session?.strapiJwt ?? ''}` }

  const [locationsRes, templateRes, templatesRes] = await Promise.all([
    fetch(`${STRAPI_API_URL}/locations?${new URLSearchParams({
      'fields[0]': 'documentId',
      'fields[1]': 'name',
      'pagination[pageSize]': '100',
    })}`, { headers, cache: 'no-store' }),
    template
      ? fetch(`${STRAPI_API_URL}/events/${template}?populate=location`, { headers, cache: 'no-store' })
      : Promise.resolve(null),
    fetch(`${STRAPI_API_URL}/events?${new URLSearchParams({
      'filters[isTemplate][$eq]': 'true',
      'fields[0]': 'documentId',
      'fields[1]': 'name',
      'fields[2]': 'startTime',
      'fields[3]': 'endTime',
      'fields[4]': 'totalSpots',
      'fields[5]': 'description',
      'populate[location][fields][0]': 'documentId',
      'populate[location][fields][1]': 'name',
      'pagination[pageSize]': '100',
    })}`, { headers, cache: 'no-store' }),
  ])

  let locations: { documentId: string; name: string }[] = []
  let templateEvent: Event | undefined
  let templates: Event[] = []

  if (locationsRes.ok) {
    const json = await locationsRes.json()
    locations = (json.data as Location[]).map(l => ({
      documentId: String(l.documentId),
      name: l.name ?? '',
    }))
  }

  if (templateRes?.ok) {
    const json = await templateRes.json()
    templateEvent = json.data
  }

  if (templatesRes.ok) {
    const json = await templatesRes.json()
    templates = json.data as Event[]
  }

  return <EventFormPage locations={locations} templateEvent={templateEvent} templates={templates} />
}
