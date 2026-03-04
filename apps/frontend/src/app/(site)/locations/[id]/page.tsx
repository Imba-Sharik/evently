import { use } from 'react'
import { notFound } from 'next/navigation'

import { locations } from '@/shared/mocks/locations'
import LocationPageClient from './LocationPageClient'

export default function LocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const location = locations.find(l => l.id === Number(id))
  if (!location) notFound()
  return <LocationPageClient location={location} />
}
