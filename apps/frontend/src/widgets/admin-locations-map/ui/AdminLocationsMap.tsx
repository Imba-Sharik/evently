'use client'

import { useEffect, useCallback } from 'react'
import { Minimize2 } from 'lucide-react'
import { Map, useMap } from '@/shared/ui/map'
import { LocationMarker } from '@/entities/location'
import type { Location } from '@/shared/api/generated/types/Location'

type Props = {
  locations: Location[]
}

function FitBounds({ locations }: { locations: Location[] }) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded || locations.length === 0) return

    if (locations.length === 1) {
      map.flyTo({ center: [locations[0].lng!, locations[0].lat!], zoom: 14 })
      return
    }

    const lngs = locations.map(l => l.lng!)
    const lats = locations.map(l => l.lat!)
    map.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 60, maxZoom: 14 }
    )
  }, [map, isLoaded, locations])

  return null
}

function ResetButton({ locations }: { locations: Location[] }) {
  const { map } = useMap()

  const handleReset = useCallback(() => {
    if (!map || locations.length === 0) return

    if (locations.length === 1) {
      map.flyTo({ center: [locations[0].lng!, locations[0].lat!], zoom: 14, duration: 800 })
      return
    }

    const lngs = locations.map(l => l.lng!)
    const lats = locations.map(l => l.lat!)
    map.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 60, maxZoom: 14, duration: 800 }
    )
  }, [map, locations])

  return (
    <button
      onClick={handleReset}
      className="absolute bottom-3 right-3 z-10 rounded-lg bg-white shadow-md p-2 text-foreground hover:bg-gray-50 transition-colors"
      title="Показать все локации"
    >
      <Minimize2 className="size-4" />
    </button>
  )
}

export function AdminLocationsMap({ locations }: Props) {
  const validLocations = locations.filter(l =>
    l.lat != null && l.lng != null &&
    !isNaN(l.lat) && !isNaN(l.lng) &&
    l.lat >= -90 && l.lat <= 90 &&
    l.lng >= -180 && l.lng <= 180
  )

  return (
    <div className="w-full h-64 xl:w-96 xl:h-auto shrink-0 xl:sticky xl:top-20 bg-black rounded-xl p-px">
      <Map
        className="h-full w-full rounded-xl overflow-hidden"
        theme="light"
        interactive={true}
        viewport={{ center: [37.6173, 55.7558], zoom: 10 }}
      >
        <FitBounds locations={validLocations} />
        {validLocations.map((location) => (
          <LocationMarker key={location.id} location={location} zoomOnClick />
        ))}
        <ResetButton locations={validLocations} />
      </Map>
    </div>
  )
}
