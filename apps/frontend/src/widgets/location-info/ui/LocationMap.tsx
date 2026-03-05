"use client"

import { useEffect, useState } from 'react'
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapPopup, useMap } from '@/shared/ui/map'
import type { Location } from '@/shared/mocks/locations'

function MarkerWithZoom({ location }: { location: Location }) {
  const { map } = useMap()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleOutsideClick = (e: PointerEvent) => {
      const container = map?.getContainer()
      if (container && !container.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleOutsideClick)
    return () => document.removeEventListener('pointerdown', handleOutsideClick)
  }, [map])

  return (
    <>
      <MapMarker
        longitude={location.coords.lng}
        latitude={location.coords.lat}
        onClick={() => {
          setOpen((prev) => !prev)
          map?.flyTo({ center: [location.coords.lng, location.coords.lat], zoom: 17 })
        }}
      >
        <MarkerContent>
          <div className="size-4 rounded-full bg-primary border-2 border-white shadow-lg cursor-pointer" />
        </MarkerContent>
        <MarkerTooltip>{location.name}</MarkerTooltip>
      </MapMarker>

      {open && (
        <MapPopup
          longitude={location.coords.lng}
          latitude={location.coords.lat}
          onClose={() => setOpen(false)}
          closeButton={false}
        >
          <div className="space-y-1">
            <p className="font-medium text-foreground">{location.name}</p>
            <p className="text-xs text-muted-foreground">{location.address}</p>
            <p className="text-xs text-muted-foreground">{location.metro}</p>
          </div>
        </MapPopup>
      )}
    </>
  )
}

export function LocationMap({ location }: { location: Location }) {
  return (
    <Map
      className="h-72 w-full rounded-xl overflow-hidden"
      theme="light"
      viewport={{
        center: [location.coords.lng, location.coords.lat],
        zoom: 10,
      }}
    >
      <MarkerWithZoom location={location} />
    </Map>
  )
}
