"use client"

import { useState } from 'react'
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapPopup } from '@/shared/ui/map'
import type { BookingRecord } from '@/widgets/bookings-table'

export type MapLocation = {
  documentId: string
  name: string
  address?: string
  metro?: string
  lat: number
  lng: number
}

type Props = {
  bookings: BookingRecord[]
  locations: MapLocation[]
  selectedLocation: string
  onLocationSelect: (locationName: string) => void
}

const INNER = 36   // px — inner dot diameter
const MIN_AURA = 64
const MAX_AURA = 112

function BookingMarker({
  location,
  count,
  maxCount,
  selected,
  onSelect,
}: {
  location: MapLocation
  count: number
  maxCount: number
  selected: boolean
  onSelect: () => void
}) {
  const [open, setOpen] = useState(false)

  const ratio = maxCount > 0 ? count / maxCount : 0
  const auraSize = Math.round(MIN_AURA + ratio * (MAX_AURA - MIN_AURA))

  const handleClick = () => {
    setOpen((prev) => !prev)
    onSelect()
  }

  return (
    <>
      <MapMarker
        longitude={location.lng}
        latitude={location.lat}
        onClick={handleClick}
      >
        <MarkerContent>
          <div className="relative flex items-center justify-center cursor-pointer">
            {/* Static aura */}
            <div
              className="absolute rounded-full transition-all duration-300"
              style={{
                width: auraSize,
                height: auraSize,
                backgroundColor: selected ? 'rgba(249,115,22,0.30)' : 'rgba(249,115,22,0.18)',
              }}
            />
            {/* Inner dot */}
            <div
              className="relative z-10 flex items-center justify-center rounded-full text-white text-sm font-bold border-2 border-white shadow-md transition-transform duration-200 hover:scale-110"
              style={{
                width: INNER,
                height: INNER,
                backgroundColor: selected ? '#ea580c' : '#f97316',
                transform: selected ? 'scale(1.15)' : undefined,
              }}
            >
              {count}
            </div>
          </div>
        </MarkerContent>
        <MarkerTooltip>{location.name}</MarkerTooltip>
      </MapMarker>

      {open && (
        <MapPopup
          longitude={location.lng}
          latitude={location.lat}
          onClose={() => setOpen(false)}
          closeButton={false}
        >
          <div className="space-y-1 min-w-36">
            <p className="font-semibold text-foreground">{location.name}</p>
            {location.address && <p className="text-lg text-muted-foreground">{location.address}</p>}
            {location.metro && <p className="text-lg text-muted-foreground">{location.metro}</p>}
            <div className="pt-1 border-t border-border">
              <p className="text-lg font-medium text-foreground">
                Заявок: <span className="text-orange-500">{count}</span>
              </p>
            </div>
          </div>
        </MapPopup>
      )}
    </>
  )
}

export function BookingsMap({ bookings, locations, selectedLocation, onLocationSelect }: Props) {
  const counts = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.locationName] = (acc[b.locationName] ?? 0) + 1
    return acc
  }, {})

  const maxCount = Math.max(...locations.map((l) => counts[l.name] ?? 0), 1)

  return (
    <Map
      className="h-full w-full rounded-xl overflow-hidden"
      theme="light"
      interactive={false}
      viewport={{
        center: [37.6173, 55.7558],
        zoom: 10,
      }}
    >
      {locations.map((location) => (
        <BookingMarker
          key={location.documentId}
          location={location}
          count={counts[location.name] ?? 0}
          maxCount={maxCount}
          selected={selectedLocation === location.name}
          onSelect={() =>
            onLocationSelect(
              selectedLocation === location.name ? 'all' : location.name
            )
          }
        />
      ))}
    </Map>
  )
}
