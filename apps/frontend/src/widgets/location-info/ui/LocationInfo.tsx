import { LocationGallery } from '@/entities/location'
import type { Location } from '@/shared/mocks/locations'
import { LocationMap } from './LocationMap'

export function LocationInfo({ location }: { location: Location }) {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="text-4xl font-semibold mb-4">Галерея объекта</h2>
        <LocationGallery images={location.gallery} name={location.name} />
      </div>
      <div>
        <h2 className="text-4xl font-semibold mb-3">Описание</h2>
        <p className="text-xl text-muted-foreground leading-relaxed">{location.description}</p>
      </div>
      <div>
        <h2 className="text-4xl font-semibold mb-3">Адрес</h2>
        <p className="text-xl text-muted-foreground">{location.address}</p>
        <ul className="mt-2 mb-4">
          <li className="flex items-center gap-2 text-xl text-muted-foreground">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: '#36D453' }} />
            {location.metro}
          </li>
        </ul>
        <LocationMap location={location} />
      </div>
    </div>
  )
}
