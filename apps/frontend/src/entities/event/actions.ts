'use server'

import { auth } from '@/auth'
import { STRAPI_API_URL } from '@/shared/api/strapi'
import type { DataTimeSlotEnumKey } from '@/shared/api/generated/types/EventRequest'

export type CreateEventInput = {
  name: string
  date: string // YYYY-MM-DD
  timeSlot: DataTimeSlotEnumKey
  startTime: string // HH:mm
  endTime: string   // HH:mm
  totalSpots: number
  description?: string
  locationDocumentId: string
}

export type CreateEventResult = { error: string } | { success: true }

/** Strapi time fields require HH:mm:ss.SSS */
function toStrapiTime(t: string) {
  if (!t) return t
  const parts = t.split(':')
  if (parts.length === 2) return `${t}:00.000`
  return t
}

export async function createEventAction(input: CreateEventInput): Promise<CreateEventResult> {
  const session = await auth()
  if (!session?.strapiJwt) return { error: 'Не авторизован' }

  const res = await fetch(`${STRAPI_API_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.strapiJwt}`,
    },
    body: JSON.stringify({
      data: {
        name: input.name,
        date: input.date,
        timeSlot: input.timeSlot,
        startTime: toStrapiTime(input.startTime),
        endTime: toStrapiTime(input.endTime),
        totalSpots: input.totalSpots,
        description: input.description,
        location: input.locationDocumentId,
      },
    }),
  })

  if (!res.ok) {
    const data = await res.json()
    return { error: data.error?.message ?? 'Ошибка создания мероприятия' }
  }

  return { success: true }
}

export async function updateEventAction(
  documentId: string,
  input: Omit<CreateEventInput, 'locationDocumentId'>,
): Promise<CreateEventResult> {
  const session = await auth()
  if (!session?.strapiJwt) return { error: 'Не авторизован' }

  const res = await fetch(`${STRAPI_API_URL}/events/${documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.strapiJwt}`,
    },
    body: JSON.stringify({
      data: {
        name: input.name,
        date: input.date,
        timeSlot: input.timeSlot,
        startTime: toStrapiTime(input.startTime),
        endTime: toStrapiTime(input.endTime),
        totalSpots: input.totalSpots,
        description: input.description,
      },
    }),
  })

  if (!res.ok) {
    const data = await res.json()
    return { error: data.error?.message ?? 'Ошибка обновления мероприятия' }
  }

  return { success: true }
}

export async function deleteEventAction(documentId: string): Promise<CreateEventResult> {
  const session = await auth()
  if (!session?.strapiJwt) return { error: 'Не авторизован' }

  const res = await fetch(`${STRAPI_API_URL}/events/${documentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${session.strapiJwt}` },
  })

  if (!res.ok) return { error: 'Ошибка удаления мероприятия' }
  return { success: true }
}
