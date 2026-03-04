import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Card } from '@/shared/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { DAYS, locations } from '@/shared/mocks/locations'

export default function Home() {
  return (
    <div className="bg-background p-8">
      <h2 className="text-5xl font-semibold mb-6">Выбери локацию</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <Link key={location.id} href={`/locations/${location.id}`} className="group outline-none">
            <Card className="overflow-hidden cursor-pointer group-hover:ring-2 group-hover:ring-primary transition-shadow p-0 gap-0">
              <div className="relative h-125">
                <Image
                  src={location.image}
                  alt={location.name}
                  fill
                  className="object-cover"
                />
                <Image
                  src={location.image}
                  alt=""
                  aria-hidden
                  fill
                  className="object-cover grayscale"
                  style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent 30%, black 70%)', maskImage: 'linear-gradient(to bottom, transparent 30%, black 70%)' }}
                />
                <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-sm rounded-xl px-3 pt-2 pb-2">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20 hover:bg-transparent">
                        <TableHead className="text-white text-sm py-1 px-2 font-normal">День</TableHead>
                        <TableHead className="text-white text-sm py-1 px-2 font-normal">
                          Утро <span className="text-white/50">(08:00–11:00)</span>
                        </TableHead>
                        <TableHead className="text-white text-sm py-1 px-2 font-normal">
                          День <span className="text-white/50">(12:00–17:00)</span>
                        </TableHead>
                        <TableHead className="text-white text-sm py-1 px-2 font-normal">
                          Вечер <span className="text-white/50">(18:30–22:00)</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {DAYS.map((day) => (
                        <TableRow key={day} className="border-white/10 hover:bg-white/5">
                          <TableCell className="text-white font-bold text-sm py-1 px-2">{day}</TableCell>
                          <TableCell className="text-white/90 text-sm py-1 px-2">{location.schedule[day].morning}</TableCell>
                          <TableCell className="text-white/90 text-sm py-1 px-2">{location.schedule[day].afternoon}</TableCell>
                          <TableCell className="text-white/90 text-sm py-1 px-2">{location.schedule[day].evening}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>

            {/* Название + иконка — вне карточки */}
            <div className="flex items-center justify-between px-1 pt-3">
              <span className="text-4xl font-semibold">{location.name}</span>
              <ArrowUpRight className="w-8 h-8 text-muted-foreground group-hover:text-primary group-hover:rotate-45 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
