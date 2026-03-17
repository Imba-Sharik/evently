'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { MapMarker, MarkerContent, MarkerTooltip, MapPopup, useMap } from '@/shared/ui/map'
import type { Location } from '@/shared/api/generated/types/Location'

type Props = {
  location: Location
  zoomOnClick?: boolean
}

export function LocationMarker({ location, zoomOnClick }: Props) {
  const [open, setOpen] = useState(false)
  const { map } = useMap()
  const lng = location.lng ?? 0
  const lat = location.lat ?? 0

  function handleClick() {
    setOpen(p => !p)
    if (zoomOnClick && map) {
      map.flyTo({ center: [lng, lat], zoom: 15, duration: 800 })
    }
  }

  return (
    <>
      <MapMarker longitude={lng} latitude={lat} onClick={handleClick}>
        <MarkerContent>
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform">
            <MapPin className="size-4 fill-current" />
          </div>
        </MarkerContent>
        <MarkerTooltip>{location.name}</MarkerTooltip>
      </MapMarker>
      {open && (
        <MapPopup longitude={lng} latitude={lat} onClose={() => setOpen(false)} closeButton={false}>
          <div className="space-y-1 min-w-36">
            <p className="font-semibold text-foreground">{location.name}</p>
            <p className="text-lg text-muted-foreground">{location.address}</p>
            {location.metro && <p className="text-lg text-muted-foreground">{location.metro}</p>}
          </div>
        </MapPopup>
      )}
    </>
  )
}
