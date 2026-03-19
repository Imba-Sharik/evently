import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/auth'
import { getLocationsid } from '@/shared/api/generated/clients/getLocationsid'
import { strapiConfig } from '@/shared/api/strapi'
import { LocationForm } from '@/features/location-form'

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const config = strapiConfig(session?.strapiJwt ?? undefined)

  const res = await getLocationsid(id as never, { ...config, params: { 'populate[0]': 'image', 'populate[1]': 'gallery' } } as never)
  const location = res?.data
  if (!location) notFound()

  return (
    <div className="p-4 xl:p-6 2xl:max-w-6xl 2xl:mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/locations" className="inline-flex items-center justify-center size-9 rounded-md hover:bg-accent transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-semibold">Редактировать локацию</h1>
      </div>
      <LocationForm mode="edit" documentId={id} initialData={location} />
    </div>
  )
}
