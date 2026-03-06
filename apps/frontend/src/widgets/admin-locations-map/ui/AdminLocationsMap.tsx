'use client'

import { useEffect } from 'react'
import { Map, useMap } from '@/shared/ui/map'
import { LocationMarker } from '@/entities/location'
import type { Location } from '@/shared/api/generated/types/Location'

type Props = {
  locations: Location[]
}

function FitBounds({ locations }: { locations: Location[] }) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded) return

    const valid = locations.filter(l =>
      l.lat != null && l.lng != null &&
      l.lat >= -90 && l.lat <= 90 &&
      l.lng >= -180 && l.lng <= 180
    )

    if (valid.length === 0) return

    if (valid.length === 1) {
      map.flyTo({ center: [valid[0].lng!, valid[0].lat!], zoom: 14 })
      return
    }

    const lngs = valid.map(l => l.lng!)
    const lats = valid.map(l => l.lat!)
    map.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 60, maxZoom: 14 }
    )
  }, [map, isLoaded, locations])

  return null
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
        <FitBounds locations={locations} />
        {locations.map((location) => (
          <LocationMarker key={location.id} location={location} />
        ))}
      </Map>
    </div>
  )
}
