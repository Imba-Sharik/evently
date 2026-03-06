'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { postBookings } from '@/shared/api/generated/clients/postBookings'
import { strapiConfig, STRAPI_API_URL } from '@/shared/api/strapi'
import type { BookingStatus } from '@/widgets/bookings-table'

const STATUS_TO_STRAPI: Record<BookingStatus, string> = {
  new: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
}

export async function createBookingAction(params: {
  customerName: string
  customerEmail: string
  quantity: number
  eventDocumentId: string
  locationDocumentId: string
}) {
  await postBookings(
    {
      data: {
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        quantity: params.quantity,
        status: 'pending',
        event: params.eventDocumentId,
        location: params.locationDocumentId,
      },
    },
    strapiConfig() as never,
  )
}

export async function updateBookingStatusAction(documentId: string, status: BookingStatus) {
  const session = await auth()
  if (!session?.strapiJwt) return { error: 'Не авторизован' }

  const res = await fetch(`${STRAPI_API_URL}/bookings/${documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.strapiJwt}`,
    },
    body: JSON.stringify({ data: { status: STATUS_TO_STRAPI[status] } }),
  })

  if (!res.ok) return { error: 'Ошибка обновления статуса' }
  revalidatePath('/admin/bookings')
  return { success: true }
}

export async function deleteBookingAction(documentId: string) {
  const session = await auth()
  if (!session?.strapiJwt) return { error: 'Не авторизован' }

  const res = await fetch(`${STRAPI_API_URL}/bookings/${documentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${session.strapiJwt}` },
  })

  if (!res.ok) return { error: 'Ошибка удаления заявки' }
  revalidatePath('/admin/bookings')
  return { success: true }
}
