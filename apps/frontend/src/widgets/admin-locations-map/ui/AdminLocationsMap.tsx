'use client'

import { Map } from '@/shared/ui/map'
import { LocationMarker } from '@/entities/location'
import type { Location } from '@/shared/api/generated/types/Location'

type Props = {
  locations: Location[]
}

export function AdminLocationsMap({ locations }: Props) {
  return (
    <div className="w-96 shrink-0 sticky top-20 bg-black rounded-xl p-px">
      <Map
        className="h-full w-full rounded-xl overflow-hidden"
        theme="light"
        interactive={false}
        viewport={{ center: [37.6173, 55.7558], zoom: 10 }}
      >
        {locations.map((location) => (
          <LocationMarker key={location.id} location={location} />
        ))}
      </Map>
    </div>
  )
}
