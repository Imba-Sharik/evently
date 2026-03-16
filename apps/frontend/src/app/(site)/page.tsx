import Image from 'next/image'
import Link from 'next/link'
import { getLocations } from '@/shared/api/generated/clients/getLocations'
import { getEvents } from '@/shared/api/generated/clients/getEvents'
import { strapiConfig } from '@/shared/api/strapi'
import { HomeClient } from './HomeClient'

export default async function Home() {
  const [locRes, evtRes] = await Promise.all([
    getLocations({ populate: 'image' } as never, strapiConfig()),
    getEvents({
      populate: 'location',
      'pagination[limit]': 100,
      sort: 'date:asc',
    } as never, strapiConfig()),
  ])
  const locations = locRes?.data ?? []
  const events = evtRes?.data ?? []

  return (
    <div>
      {/* Hero */}
      <div className="relative h-72 overflow-hidden">
        <Image
          src="/backround_image.png"
          alt=""
          fill
          priority
          className="object-cover blur-lg scale-110"
        />
        <div className="relative z-10 h-full container mx-auto flex gap-4 px-8 py-6">
          {locations.slice(0, 2).map((location) => (
            <Link
              key={location.documentId}
              href={`/locations/${location.documentId}`}
              className="flex-1 relative rounded-3xl overflow-hidden block"
            >
              <Image
                src={location.image?.url ?? '/location_1.png'}
                alt={location.name ?? ''}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4">
                <span className="bg-white/10 text-white text-lg font-medium px-3 py-1.5 rounded-full backdrop-blur-md border border-white/30">
                  {location.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <HomeClient locations={locations} events={events} />
    </div>
  )
}
