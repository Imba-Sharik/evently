'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Info, Minus, Plus } from 'lucide-react'
import { ru } from 'date-fns/locale'

import { Calendar } from '@/shared/ui/calendar'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import type { Location } from '@/shared/mocks/locations'
import { DAYS, TIME_LABELS } from '@/shared/mocks/locations'
import { mockEvents, type EventDetail } from '@/shared/mocks/events'
import { ScheduleTable } from '@/entities/location'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'

// ─── helpers ────────────────────────────────────────────────────────────────

const WEEKDAY_MAP: Record<number, string> = {
  0: 'ВС', 1: 'ПН', 2: 'ВТ', 3: 'СР', 4: 'ЧТ', 5: 'ПТ', 6: 'СБ',
}

const MONTHS_RU = [
  'января','февраля','марта','апреля','мая','июня',
  'июля','августа','сентября','октября','ноября','декабря',
]

const WEEKDAYS_SHORT = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']

function formatDate(date: Date) {
  return `${WEEKDAYS_SHORT[date.getDay()]}, ${date.getDate()} ${MONTHS_RU[date.getMonth()]}`
}

function formatDateLong(date: Date) {
  return `${date.getDate()} ${MONTHS_RU[date.getMonth()]}, ${date.getFullYear()}`
}

function getDayKey(date: Date) {
  return WEEKDAY_MAP[date.getDay()]
}

/** Split "EventName – rest of description" into bold + normal parts */
function splitDescription(description: string): [string, string] {
  const idx = description.indexOf(' – ')
  if (idx === -1) return ['', description]
  return [description.slice(0, idx), description.slice(idx)]
}

// ─── EventCard ───────────────────────────────────────────────────────────────

type BookingState = {
  event: EventDetail
  date: Date
  quantity: number
}

function EventCard({
  event,
  date,
  quantity,
  onQuantityChange,
  onBook,
}: {
  event: EventDetail
  date: Date
  quantity: number
  onQuantityChange: (delta: number) => void
  onBook: () => void
}) {
  const available = event.spotsLeft > 0
  const [bold, rest] = splitDescription(event.description)

  return (
    <Card className="rounded-2xl px-5 py-4 gap-0 border-black">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-xl leading-tight">{event.name}</p>
          <p className="text-lg text-muted-foreground mt-0.5">
            {available
              ? `Осталось ${event.spotsLeft} мест`
              : 'Не осталось мест :('}
          </p>
        </div>
        <div className="text-right text-lg text-muted-foreground shrink-0">
          <p>{formatDate(date)}</p>
          <p>{event.timeRange}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-lg mt-3 leading-relaxed">
        <strong>{bold}</strong>
        {rest}
      </p>

      {/* Action row */}
      <div className="flex items-center justify-between mt-4 gap-4">
        <Button
          variant="outline"
          className="text-lg border-black"
          disabled={!available}
          onClick={available ? onBook : undefined}
        >
          {available ? 'Записаться' : 'Недоступно'}
        </Button>

        {available && (
          <div className="flex items-center gap-2 text-lg">
            <span className="text-muted-foreground">Кол-во мест:</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-black"
              onClick={() => onQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus className="size-3" />
            </Button>
            <span className="w-4 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-black"
              onClick={() => onQuantityChange(1)}
              disabled={quantity >= event.spotsLeft}
            >
              <Plus className="size-3" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function LocationPageClient({ location }: { location: Location }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [booking, setBooking] = useState<BookingState | null>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [bookingName, setBookingName] = useState('')
  const [bookingEmail, setBookingEmail] = useState('')

  function closeBooking() {
    setBooking(null)
    setBookingName('')
    setBookingEmail('')
  }

  const selectedDayKey = getDayKey(selectedDate)

  function getQuantity(eventId: string) {
    return quantities[eventId] ?? 1
  }

  function changeQuantity(eventId: string, delta: number) {
    setQuantities(prev => ({
      ...prev,
      [eventId]: Math.max(1, (prev[eventId] ?? 1) + delta),
    }))
  }

  const daySchedule = location.schedule[selectedDayKey]

  function getEventByName(name: string, slot: EventDetail['timeSlot']): EventDetail {
    return mockEvents.find(e => e.name === name) ?? {
      id: name,
      name,
      timeSlot: slot,
      timeRange: slot === 'morning' ? '08:00 – 11:00' : slot === 'afternoon' ? '12:00 – 17:00' : '18:30 – 22:00',
      totalSpots: 30,
      spotsLeft: 15,
      description: `${name} – мероприятие проходит в данной локации.`,
    }
  }

  const morningEvent = getEventByName(daySchedule.morning, 'morning')
  const afternoonEvent = getEventByName(daySchedule.afternoon, 'afternoon')
  const eveningEvent = getEventByName(daySchedule.evening, 'evening')

  const gallery = location.gallery
  const prevSlide = () => setGalleryIndex(i => (i - 1 + gallery.length) % gallery.length)
  const nextSlide = () => setGalleryIndex(i => (i + 1) % gallery.length)

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-0">

          {/* ── HEADER LEFT: title ──────────────────────────────────── */}
          <div className="flex items-end pb-6">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="size-6" />
              </Link>
              <h1 className="text-5xl font-semibold">{location.name}</h1>
            </div>
          </div>

          {/* ── HEADER RIGHT: schedule title ────────────────────────── */}
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

          {/* ── CONTENT LEFT: calendar ──────────────────────────────── */}
          <div className="mb-8 flex flex-col">
            <div className="rounded-2xl overflow-hidden w-full flex-1 bg-linear-to-br from-[#1F1F1F] to-[#666666] border border-black **:data-[selected-single=true]:bg-[#498BD7] **:data-[slot=button]:text-lg">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ru}
                className="p-3 bg-transparent text-white [--cell-size:--spacing(8)]"
                classNames={{
                  root: 'w-full',
                  caption_label: 'font-medium select-none text-lg',
                  weekday: 'flex-1 rounded-md text-base font-normal text-white/60 select-none',
                  outside: 'text-white/30 aria-selected:text-white/30',
                }}
              />
            </div>
          </div>

          {/* ── CONTENT RIGHT: schedule table ───────────────────────── */}
          <div className="mb-8 flex flex-col">
            <ScheduleTable schedule={location.schedule} days={DAYS} selectedDayKey={selectedDayKey} />
          </div>

          {/* ── ROW 2, LEFT: events ─────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            {[
              { label: TIME_LABELS.morning, event: morningEvent },
              { label: TIME_LABELS.afternoon, event: afternoonEvent },
              { label: TIME_LABELS.evening, event: eveningEvent },
            ].map(({ label, event }) => (
              <div key={label} className="flex flex-col gap-3">
                <h2 className="text-2xl font-medium text-muted-foreground">{label}</h2>
                <EventCard
                  event={event}
                  date={selectedDate}
                  quantity={getQuantity(event.id)}
                  onQuantityChange={(delta) => changeQuantity(event.id, delta)}
                  onBook={() => setBooking({ event, date: selectedDate, quantity: getQuantity(event.id) })}
                />
              </div>
            ))}
          </div>

          {/* ── ROW 2, RIGHT: gallery + description ─────────────────── */}
          <div className="flex flex-col gap-10">
            <div>
              <h2 className="text-4xl font-semibold mb-4">Галерея объекта</h2>
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-muted border border-black">
                <Image
                  src={gallery[galleryIndex]}
                  alt={`${location.name} — фото ${galleryIndex + 1}`}
                  fill
                  className="object-cover"
                />
                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      aria-label="Предыдущее фото"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      aria-label="Следующее фото"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {gallery.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setGalleryIndex(i)}
                          className={`h-1.5 rounded-full transition-all ${
                            i === galleryIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                          }`}
                          aria-label={`Фото ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-semibold mb-3">Описание</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">{location.description}</p>
            </div>
            <div>
              <h2 className="text-4xl font-semibold mb-3">Адрес</h2>
              <p className="text-xl text-muted-foreground">{location.address}</p>
              <ul className="mt-2">
                <li className="flex items-center gap-2 text-xl text-muted-foreground">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: '#36D453' }} />
                  {location.metro}
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Booking dialog */}
      <Dialog open={!!booking} onOpenChange={(open) => !open && closeBooking()}>
        <DialogContent className="sm:max-w-sm border-black">
          <DialogHeader>
            <DialogTitle className="text-2xl">Записаться на мероприятие</DialogTitle>
            <Separator />
          </DialogHeader>
          {booking && (
            <div className="flex flex-col gap-2.5">
              <div className="flex gap-2 text-2xl">
                <span className="text-muted-foreground">Название</span>
                <span className="font-semibold">{booking.event.name}</span>
              </div>
              <div className="flex gap-2 text-2xl">
                <span className="text-muted-foreground">Место:</span>
                <span className="font-semibold">{location.name}</span>
              </div>
              <div className="flex gap-2 text-2xl">
                <span className="text-muted-foreground">Дата:</span>
                <span className="font-semibold">{formatDateLong(booking.date)}</span>
              </div>
              <div className="flex gap-2 text-2xl">
                <span className="text-muted-foreground">Время:</span>
                <span className="font-semibold">{booking.event.timeRange}</span>
              </div>
              <div className="flex gap-2 text-2xl">
                <span className="text-muted-foreground">Количество мест:</span>
                <span className="font-semibold">{booking.quantity}</span>
              </div>

              <Separator className="my-1" />

              <div className="flex flex-col gap-2">
                <Label htmlFor="booking-name" className="text-2xl">Как вас зовут?*</Label>
                <Input
                  id="booking-name"
                  className="text-2xl h-14 border-black"
                  placeholder="Иванов Иван Иванович"
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="booking-email" className="text-2xl">Ваш Email*</Label>
                <Input
                  id="booking-email"
                  type="email"
                  className="text-2xl h-14 border-black"
                  placeholder="email@gmail.com"
                  value={bookingEmail}
                  onChange={(e) => setBookingEmail(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-2 flex-row">
            <Button className="text-xl flex-1 h-12" onClick={closeBooking}>Отправить</Button>
            <Button variant="outline" className="text-xl flex-1 h-12 border-black" onClick={closeBooking}>Отменить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
