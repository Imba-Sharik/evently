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
      <div className="relative overflow-hidden" style={{ height: '403px' }}>
        <Image
          src="/bg_2.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
        {/* overlay: fill #000 34% + backdrop-blur 100px */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.34)', backdropFilter: 'blur(100px)', opacity: 0.84 }} />
        <div className="relative z-10 h-full container mx-auto flex flex-col gap-4 pt-10">
          <Image src="/EVENTLY.svg" alt="Evently" width={160} height={32} />
          <div className="flex gap-4 flex-1 items-end pb-8">
          {locations.slice(0, 2).map((location) => (
            <Link
              key={location.documentId}
              href={`/locations/${location.documentId}`}
              className="relative overflow-hidden block border border-white"
              style={{ width: '565px', height: '270px', borderRadius: '40px' }}
            >
              <Image
                src={location.image?.url ?? '/location_1.png'}
                alt={location.name ?? ''}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4">
                <span className="text-white text-lg font-medium px-4 py-2 rounded-full border border-white/20" style={{ backdropFilter: 'blur(16px) brightness(0.65) saturate(140%)', background: 'rgba(0,0,0,0.15)' }}>
                  {location.name}
                </span>
              </div>
            </Link>
          ))}
          </div>
        </div>
      </div>

      <HomeClient locations={locations} events={events} />
    </div>
  )
}
