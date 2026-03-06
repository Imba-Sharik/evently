'use client'

import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { Card } from '@/shared/ui/card'
import type { Location } from '@/shared/api/generated/types/Location'

type Props = {
  location: Location
}

export function LocationCard({ location }: Props) {
  const router = useRouter()

  return (
    <div
      className="group outline-none cursor-pointer"
      onClick={() => router.push(`/locations/${location.documentId}`)}
    >
      <Card className="cursor-pointer border-transparent p-0 gap-0 rounded-[35px]">
        <div className="h-125 border border-black p-1.5 rounded-[35px]">
          <div className="relative h-full overflow-hidden border border-black rounded-[27px]">
            <Image
              src={location.image?.url ?? '/location_1.png'}
              alt={location.name ?? ''}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 text-black text-lg font-medium px-3 py-1.5 rounded-full backdrop-blur-sm border border-black">
                {location.address}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between px-1 pt-3">
        <span className="text-4xl font-semibold">{location.name}</span>
        <ArrowUpRight className="w-8 h-8 text-black group-hover:text-primary group-hover:rotate-45 transition-all" />
      </div>
    </div>
  )
}
