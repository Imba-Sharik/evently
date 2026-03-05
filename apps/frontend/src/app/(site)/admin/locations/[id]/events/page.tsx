import { notFound } from 'next/navigation'
import { parseISO, isValid, format, startOfWeek, endOfWeek } from 'date-fns'
import { auth } from '@/auth'
import { getLocationsid } from '@/shared/api/generated/clients/getLocationsid'
import { getEvents } from '@/shared/api/generated/clients/getEvents'
import { strapiConfig } from '@/shared/api/strapi'
import { AdminEventsClient } from './AdminEventsClient'

export default async function LocationEventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ date?: string }>
}) {
  const { id } = await params
  const { date } = await searchParams

  const parsed = date ? parseISO(date) : null
  const selectedDate = parsed && isValid(parsed) ? parsed : new Date()

  const session = await auth()
  const config = strapiConfig(session?.strapiJwt ?? undefined)

  const locationRes = await getLocationsid(id as never, config)
  const location = locationRes?.data
  if (!location) notFound()

  const weekStart = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const eventsRes = await getEvents({
    'filters[location][documentId][$eq]': id,
    'filters[date][$gte]': weekStart,
    'filters[date][$lte]': weekEnd,
    'pagination[limit]': 100,
    sort: 'startTime:asc',
  } as never, config)
  const events = eventsRes?.data ?? []

  return <AdminEventsClient location={location} selectedDate={selectedDate} events={events} />
}
