import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Card } from '@/shared/ui/card'
import { DAYS, locations } from '@/shared/mocks/locations'
import { ScheduleTable } from '@/entities/location'

export default function Home() {
  return (
    <div className="bg-background p-8">
      <div className="container mx-auto">
      <h2 className="text-5xl font-semibold mb-6">Выбери локацию</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Link key={location.id} href={`/locations/${location.id}`} className="group outline-none">
            <Card className="cursor-pointer border-transparent p-0 gap-0">
              <div className="h-125 border border-black rounded-xl p-1.5">
                <div className="relative h-full rounded-lg overflow-hidden">
                  <Image
                    src={location.image}
                    alt={location.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <Image
                    src={location.image}
                    alt=""
                    aria-hidden
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover grayscale"
                    style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent 30%, black 70%)', maskImage: 'linear-gradient(to bottom, transparent 30%, black 70%)' }}
                  />
                  <div className="absolute bottom-3 left-3 right-3">
                    <ScheduleTable schedule={location.schedule} days={DAYS} size="sm" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Название + иконка — вне карточки */}
            <div className="flex items-center justify-between px-1 pt-3">
              <span className="text-4xl font-semibold">{location.name}</span>
              <ArrowUpRight className="w-8 h-8 text-black group-hover:text-primary group-hover:rotate-45 transition-all" />
            </div>
          </Link>
        ))}
      </div>
      </div>
    </div>
  )
}
