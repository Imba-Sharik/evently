'use server'

import { revalidatePath } from 'next/cache'
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

  const body = {
    data: {
      name: formData.get('name'),
      address: formData.get('address'),
      metro: formData.get('metro') || null,
      description: formData.get('description') || null,
      lat: latRaw ? parseFloat(latRaw) : null,
      lng: lngRaw ? parseFloat(lngRaw) : null,
      place_id: formData.get('place_id') || null,
      city_place_id: formData.get('city_place_id') || null,
      city_name: formData.get('city_name') || null,
      country_code: formData.get('country_code') || null,
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
  revalidatePath('/admin/locations')
  return { success: true, id: created.data?.documentId ?? created.data?.id }
}

export async function updateLocationAction(documentId: string, formData: FormData): Promise<CreateLocationResult> {
  const session = await auth()
  if (!session?.strapiJwt) return { error: 'Не авторизован' }

  const jwt = session.strapiJwt
  const files = formData.getAll('files') as File[]
  const keepGalleryIds = (formData.getAll('keepGalleryId') as string[]).map(Number)

  let imageId: number | null = keepGalleryIds[0] ?? null
  let galleryIds: number[] = keepGalleryIds

  if (files.length > 0) {
    const uploadFd = new FormData()
    files.forEach((f) => uploadFd.append('files', f))

    const uploadRes = await fetch(`${STRAPI_API_URL}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}` },
      body: uploadFd,
    })

    if (!uploadRes.ok) return { error: 'Ошибка загрузки файлов' }

    const uploaded: { id: number }[] = await uploadRes.json()
    const newIds = uploaded.map((f) => f.id)
    galleryIds = [...keepGalleryIds, ...newIds]
    imageId = galleryIds[0] ?? null
  }

  const latRaw = formData.get('lat') as string
  const lngRaw = formData.get('lng') as string

  const res = await fetch(`${STRAPI_API_URL}/locations/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({
      data: {
        name: formData.get('name'),
        address: formData.get('address'),
        metro: formData.get('metro') || null,
        description: formData.get('description') || null,
        lat: latRaw ? parseFloat(latRaw) : null,
        lng: lngRaw ? parseFloat(lngRaw) : null,
        place_id: formData.get('place_id') || null,
        city_place_id: formData.get('city_place_id') || null,
        city_name: formData.get('city_name') || null,
        country_code: formData.get('country_code') || null,
        image: imageId,
        gallery: galleryIds,
      },
    }),
  })

  if (!res.ok) {
    const data = await res.json()
    return { error: data.error?.message ?? 'Ошибка обновления локации' }
  }

  revalidatePath('/admin/locations')
  return { success: true, id: documentId }
}

export async function deleteLocationAction(documentId: string): Promise<{ error: string } | { success: true }> {
  const session = await auth()
  if (!session?.strapiJwt) return { error: 'Не авторизован' }

  const res = await fetch(`${STRAPI_API_URL}/locations/${documentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${session.strapiJwt}` },
  })

  if (!res.ok) return { error: 'Ошибка удаления локации' }
  revalidatePath('/admin/locations')
  return { success: true }
}
