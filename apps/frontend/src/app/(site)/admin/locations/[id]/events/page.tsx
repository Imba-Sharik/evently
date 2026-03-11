import { notFound } from 'next/navigation'
import { parseISO, isValid } from 'date-fns'
import { auth } from '@/auth'
import { getLocationsid } from '@/shared/api/generated/clients/getLocationsid'
import { strapiConfig } from '@/shared/api/strapi'
import { AdminEventsSchedule } from '@/widgets/admin-events-schedule'

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

  return (
    <div className="p-6">
      <AdminEventsSchedule location={location} selectedDate={selectedDate} />
    </div>
  )
}
