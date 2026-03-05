import { use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'
import { parseISO, isValid } from 'date-fns'

import { locations, TIME_LABELS } from '@/shared/mocks/locations'
import { getDayKey } from '@/shared/lib/date'
import { getEventByName } from '@/entities/event'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'
import { LocationCalendar } from '@/widgets/location-calendar'
import { LocationSchedule } from '@/widgets/location-schedule'
import { LocationEvents } from '@/widgets/location-events'
import { LocationInfo } from '@/widgets/location-info'

export default function LocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ date?: string }>
}) {
  const { id } = use(params)
  const { date } = use(searchParams)

  const location = locations.find(l => l.id === Number(id))
  if (!location) notFound()

  const parsed = date ? parseISO(date) : null
  const selectedDate = parsed && isValid(parsed) ? parsed : new Date()

  const selectedDayKey = getDayKey(selectedDate)
  const daySchedule = location.schedule[selectedDayKey]

  const slots = [
    { label: TIME_LABELS.morning, event: getEventByName(daySchedule.morning, 'morning') },
    { label: TIME_LABELS.afternoon, event: getEventByName(daySchedule.afternoon, 'afternoon') },
    { label: TIME_LABELS.evening, event: getEventByName(daySchedule.evening, 'evening') },
  ]

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-0">

          {/* ── HEADER LEFT ──────────────────────────────────────────── */}
          <div className="flex items-end pb-6">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="size-6" />
              </Link>
              <h1 className="text-5xl font-semibold">{location.name}</h1>
            </div>
          </div>

          {/* ── HEADER RIGHT ─────────────────────────────────────────── */}
          <div className="flex items-center gap-2 pb-6">
            <h2 className="text-4xl font-semibold">Расписание данной локации</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-5 w-5 text-muted-foreground cursor-help shrink-0" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-[18px]">Выбирайте день, вид досуга, время и записывайтесь на любимые мероприятия через удобные интерфейсы нашей системы!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* ── ROW 1 ────────────────────────────────────────────────── */}
          <div className="mb-8 flex flex-col">
            <LocationCalendar selectedDate={selectedDate} />
          </div>
          <div className="mb-8 flex flex-col">
            <LocationSchedule schedule={location.schedule} selectedDayKey={selectedDayKey} />
          </div>

          {/* ── ROW 2 ────────────────────────────────────────────────── */}
          <LocationEvents slots={slots} selectedDate={selectedDate} locationName={location.name} />
          <LocationInfo location={location} />

        </div>
      </div>
    </div>
  )
}
