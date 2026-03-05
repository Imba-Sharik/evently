import { getLocations } from '@/shared/api/generated/clients/getLocations'
import { strapiConfig } from '@/shared/api/strapi'
import { LocationCard } from '@/features/location-card/ui/LocationCard'

export default async function Home() {
  const res = await getLocations({ populate: 'image' } as never, strapiConfig())
  const locations = res?.data ?? []

  return (
    <div className="bg-background p-8">
      <div className="container mx-auto">
        <h2 className="text-5xl font-semibold mb-6">Выбери локацию</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <LocationCard key={location.documentId} location={location} />
          ))}
        </div>
      </div>
    </div>
  )
}
