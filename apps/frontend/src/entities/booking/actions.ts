'use server'

import { postBookings } from '@/shared/api/generated/clients/postBookings'
import { strapiConfig } from '@/shared/api/strapi'

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
