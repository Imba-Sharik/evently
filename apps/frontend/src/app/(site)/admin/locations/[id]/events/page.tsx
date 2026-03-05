import { use } from 'react'
import { notFound } from 'next/navigation'
import { parseISO, isValid } from 'date-fns'

import { locations } from '@/shared/mocks/locations'
import { AdminEventsClient } from './AdminEventsClient'

export default function LocationEventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ date?: string }>
}) {
  const { id } = use(params)
  const { date } = use(searchParams)

  const location = locations.find((l) => l.id === Number(id))
  if (!location) notFound()

  const parsed = date ? parseISO(date) : null
  const selectedDate = parsed && isValid(parsed) ? parsed : new Date()

  return <AdminEventsClient location={location} selectedDate={selectedDate} />
}
