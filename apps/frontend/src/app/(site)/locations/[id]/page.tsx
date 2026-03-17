import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getLocationsid } from '@/shared/api/generated/clients/getLocationsid'
import { getEvents } from '@/shared/api/generated/clients/getEvents'
import { strapiConfig } from '@/shared/api/strapi'
import { LocationEvents } from '@/widgets/location-events'
import { LocationInfo } from '@/widgets/location-info'

export default async function LocationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const config = strapiConfig()

  const locationRes = await getLocationsid(id as never, {
    ...config,
    params: { 'populate[0]': 'image', 'populate[1]': 'gallery' },
  } as never)
  const location = locationRes?.data
  if (!location) notFound()

  const eventsRes = await getEvents({
    populate: 'location',
    'filters[location][documentId][$eq]': id,
    'pagination[limit]': 20,
  } as never, config)
  const events = eventsRes?.data ?? []

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-0">

          {/* ── LEFT: header + filters + events ─────────────────────── */}
          <div className="flex flex-col gap-8 mb-8">
            <div className="flex items-center gap-3 pb-2">
              <Link href="/" className="text-black">
                <ArrowLeft style={{ width: '20px', height: '20px' }} />
              </Link>
              <h1 className="text-4xl font-semibold">{location.name}</h1>
            </div>
            <LocationEvents
              events={events}
              locationName={location.name ?? ''}
              locationDocumentId={location.documentId ?? id}
            />
          </div>

          {/* ── RIGHT: info ──────────────────────────────────────────── */}
          <LocationInfo location={location} />

        </div>
      </div>
    </div>
  )
}
