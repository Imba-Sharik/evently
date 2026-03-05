'use server'

import { auth } from '@/auth'
import { STRAPI_API_URL } from '@/shared/api/strapi'

export type CreateLocationResult = { error: string } | { success: true; id: string }

export async function createLocationAction(formData: FormData): Promise<CreateLocationResult> {
  const session = await auth()
  if (!session?.strapiJwt) {
    return { error: 'Не авторизован' }
  }

  const jwt = session.strapiJwt

  // 1. Upload files → получаем ID медиафайлов
  const files = formData.getAll('files') as File[]
  let imageId: number | null = null
  const galleryIds: number[] = []

  if (files.length > 0) {
    const uploadFd = new FormData()
    files.forEach((f) => uploadFd.append('files', f))

    const uploadRes = await fetch(`${STRAPI_API_URL}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}` },
      body: uploadFd,
    })

    if (!uploadRes.ok) {
      return { error: 'Ошибка загрузки файлов' }
    }

    const uploaded: { id: number }[] = await uploadRes.json()
    imageId = uploaded[0]?.id ?? null
    galleryIds.push(...uploaded.map((f) => f.id))
  }

  // 2. Создаём локацию
  const latRaw = formData.get('lat') as string
  const lngRaw = formData.get('lng') as string
  const timeSlotsRaw = formData.get('timeSlots') as string

  const body = {
    data: {
      name: formData.get('name'),
      address: formData.get('address'),
      metro: formData.get('metro') || null,
      description: formData.get('description') || null,
      lat: latRaw ? parseFloat(latRaw) : null,
      lng: lngRaw ? parseFloat(lngRaw) : null,
      timeSlots: timeSlotsRaw ? JSON.parse(timeSlotsRaw) : null,
      image: imageId,
      gallery: galleryIds,
    },
  }

  const res = await fetch(`${STRAPI_API_URL}/locations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const data = await res.json()
    return { error: data.error?.message ?? 'Ошибка создания локации' }
  }

  const created = await res.json()
  return { success: true, id: created.data?.documentId ?? created.data?.id }
}

export async function deleteLocationAction(documentId: string): Promise<{ error: string } | { success: true }> {
  const session = await auth()
  if (!session?.strapiJwt) return { error: 'Не авторизован' }

  const res = await fetch(`${STRAPI_API_URL}/locations/${documentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${session.strapiJwt}` },
  })

  if (!res.ok) return { error: 'Ошибка удаления локации' }
  return { success: true }
}
