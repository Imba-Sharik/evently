import { auth } from '@/auth'
import { getLocations } from '@/shared/api/generated/clients/getLocations'
import { strapiConfig } from '@/shared/api/strapi'
import { AdminLocationsTable } from '@/widgets/admin-locations-table'
import { AdminLocationsMap } from '@/widgets/admin-locations-map'

export default async function LocationsPage() {
  const session = await auth()
  const res = await getLocations(
    { populate: 'image' } as never,
    strapiConfig(session?.strapiJwt ?? undefined),
  )
  const locations = res?.data ?? []

  return (
    <div className="p-6 flex gap-6">
      <AdminLocationsTable data={locations} />
      <AdminLocationsMap locations={locations} />
    </div>
  )
}
