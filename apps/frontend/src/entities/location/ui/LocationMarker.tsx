'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { MapMarker, MarkerContent, MarkerTooltip, MapPopup } from '@/shared/ui/map'
import type { Location } from '@/shared/api/generated/types/Location'

type Props = {
  location: Location
}

export function LocationMarker({ location }: Props) {
  const [open, setOpen] = useState(false)
  const lng = location.lng ?? 0
  const lat = location.lat ?? 0
  return (
    <>
      <MapMarker longitude={lng} latitude={lat} onClick={() => setOpen(p => !p)}>
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
            <p className="text-xs text-muted-foreground">{location.address}</p>
            {location.metro && <p className="text-xs text-muted-foreground">{location.metro}</p>}
          </div>
        </MapPopup>
      )}
    </>
  )
}
