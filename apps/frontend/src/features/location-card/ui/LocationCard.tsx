'use client'

import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { Card } from '@/shared/ui/card'
import type { Location } from '@/shared/mocks/locations'

type Props = {
  location: Location
}

export function LocationCard({ location }: Props) {
  const router = useRouter()

  return (
    <div
      className="group outline-none cursor-pointer"
      onClick={() => router.push(`/locations/${location.id}`)}
    >
      <Card className="cursor-pointer border-transparent p-0 gap-0">
        <div className="h-125 border border-black rounded-xl p-1.5">
          <div className="relative h-full rounded-lg overflow-hidden border border-black">
            <Image
              src={location.image}
              alt={location.name}
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
            {/* <div className="absolute bottom-3 left-3 right-3">
              <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleContent>
                  <div className="mb-2">
                    <ScheduleTable schedule={location.schedule} days={DAYS} size="sm" />
                  </div>
                </CollapsibleContent>
                <CollapsibleTrigger
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-between w-45 bg-linear-to-br from-[#1F1F1F] to-[#666666] text-white text-[18px] font-medium pl-4 pr-2 py-1 rounded-full border border-black"
                >
                  <span>{open ? 'Скрыть расписание' : 'Показать расписание'}</span>
                  <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center ml-2 shrink-0">
                    {open
                      ? <ChevronDown className="w-3.5 h-3.5 text-transparent stroke-black" />
                      : <ChevronUp className="w-3.5 h-3.5 text-transparent stroke-black" />
                    }
                  </span>
                </CollapsibleTrigger>
              </Collapsible>
            </div> */}
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
