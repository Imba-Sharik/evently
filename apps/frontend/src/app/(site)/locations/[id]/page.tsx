import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Info } from 'lucide-react'
import { parseISO, isValid, format, startOfWeek, endOfWeek } from 'date-fns'

import { getLocationsid } from '@/shared/api/generated/clients/getLocationsid'
import { getEvents } from '@/shared/api/generated/clients/getEvents'
import { strapiConfig } from '@/shared/api/strapi'
import { getDayKey } from '@/shared/lib/date'
import { DAYS, TIME_LABELS } from '@/shared/mocks/locations'
import type { EventDetail } from '@/shared/mocks/events'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'
import { LocationCalendar } from '@/widgets/location-calendar'
import { LocationSchedule } from '@/widgets/location-schedule'
import { LocationEvents } from '@/widgets/location-events'
import { LocationInfo } from '@/widgets/location-info'

type DayRow = { morning: string[]; afternoon: string[]; evening: string[] }

function formatTime(t?: string): string {
  return t ? t.slice(0, 5) : ''
}

export default async function LocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ date?: string }>
}) {
  const { id } = await params
  const { date } = await searchParams

  const parsed = date ? parseISO(date) : null
  const selectedDate = parsed && isValid(parsed) ? parsed : new Date()

  const config = strapiConfig()

  const locationRes = await getLocationsid(id as never, {
    ...config,
    params: { 'populate[0]': 'image', 'populate[1]': 'gallery' },
  } as never)
  const location = locationRes?.data
  if (!location) notFound()

  const weekStart = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const eventsRes = await getEvents({
    'filters[location][documentId][$eq]': id,
    'filters[date][$gte]': weekStart,
    'filters[date][$lte]': weekEnd,
    'pagination[limit]': 100,
    sort: 'startTime:asc',
  } as never, config)
  const weekEvents = eventsRes?.data ?? []

  // Build schedule table from week events
  const schedule: Record<string, DayRow> = Object.fromEntries(
    DAYS.map(day => [day, { morning: [], afternoon: [], evening: [] }])
  )
  for (const ev of weekEvents) {
    if (!ev.date || !ev.timeSlot || !ev.name) continue
    const dayKey = getDayKey(parseISO(ev.date))
    if (dayKey && schedule[dayKey]) {
      schedule[dayKey][ev.timeSlot as keyof DayRow].push(ev.name)
    }
  }

  const selectedDayKey = getDayKey(selectedDate)
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  const dayEvents = weekEvents.filter(e => e.date === selectedDateStr)

  const slots = (['morning', 'afternoon', 'evening'] as const).map(slot => {
    const ev = dayEvents.find(e => e.timeSlot === slot)
    const event: EventDetail = ev
      ? {
          id: String(ev.documentId ?? ev.id ?? slot),
          name: ev.name ?? '',
          timeSlot: slot,
          timeRange: `${formatTime(ev.startTime)} – ${formatTime(ev.endTime)}`,
          totalSpots: ev.totalSpots ?? 0,
          spotsLeft: ev.totalSpots ?? 0,
          description: ev.description ?? '',
        }
      : {
          id: `empty-${slot}`,
          name: '',
          timeSlot: slot,
          timeRange: slot === 'morning' ? '08:00 – 11:00' : slot === 'afternoon' ? '12:00 – 17:00' : '18:30 – 22:00',
          totalSpots: 0,
          spotsLeft: 0,
          description: '',
        }
    return { label: TIME_LABELS[slot], event }
  })

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
            <LocationSchedule schedule={schedule} selectedDayKey={selectedDayKey} />
          </div>

          {/* ── ROW 2 ────────────────────────────────────────────────── */}
          <LocationEvents
            slots={slots}
            selectedDate={selectedDate}
            locationName={location.name ?? ''}
            locationDocumentId={location.documentId ?? id}
          />
          <LocationInfo location={location} />

        </div>
      </div>
    </div>
  )
}
