'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import { ru } from 'date-fns/locale'

import { Calendar } from '@/shared/ui/calendar'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
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
    <Card className="rounded-2xl px-5 py-4 gap-0">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-base leading-tight">{event.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {available
              ? `Осталось ${event.spotsLeft} мест`
              : 'Не осталось мест :('}
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground shrink-0">
          <p>{formatDate(date)}</p>
          <p>{event.timeRange}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm mt-3 leading-relaxed">
        <strong>{bold}</strong>
        {rest}
      </p>

      {/* Action row */}
      <div className="flex items-center justify-between mt-4 gap-4">
        <Button
          variant="outline"
          size="sm"
          disabled={!available}
          onClick={available ? onBook : undefined}
        >
          {available ? 'Записаться' : 'Недоступно'}
        </Button>

        {available && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Кол-во мест:</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus className="size-3" />
            </Button>
            <span className="w-4 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">

          {/* ── ROW 1, LEFT: title + calendar ───────────────────────── */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="size-6" />
              </Link>
              <h1 className="text-4xl font-semibold">{location.name}</h1>
            </div>
            <div className="border rounded-2xl overflow-hidden w-fit">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ru}
                className="p-4"
              />
            </div>
          </div>

          {/* ── ROW 1, RIGHT: schedule (stretches to calendar height) ── */}
          <div className="flex flex-col h-full">
            <h2 className="text-3xl font-semibold mb-4">Расписание данной локации</h2>
            <div className="flex-1 bg-black/75 backdrop-blur-sm rounded-xl px-3 pt-2 pb-2">
                <Table className="border-separate border-spacing-0">
                  <TableHeader>
                    <TableRow className="border-white/20 hover:bg-transparent">
                      <TableHead className="text-white text-sm py-2.5 px-3 font-normal">День</TableHead>
                      <TableHead className="text-white text-sm py-2.5 px-3 font-normal">
                        Утро <span className="text-white/50">(08:00–11:00)</span>
                      </TableHead>
                      <TableHead className="text-white text-sm py-2.5 px-3 font-normal">
                        День <span className="text-white/50">(12:00–17:00)</span>
                      </TableHead>
                      <TableHead className="text-white text-sm py-2.5 px-3 font-normal">
                        Вечер <span className="text-white/50">(18:30–22:00)</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DAYS.map((day) => {
                      const isSelected = day === selectedDayKey
                      const cellBase = 'text-sm py-2.5 px-3'
                      const cellColor = isSelected ? 'text-white' : 'text-white/90'
                      const bg = isSelected ? { backgroundColor: '#498BD7' } : undefined
                      return (
                        <TableRow key={day} className="border-0 hover:bg-transparent">
                          <TableCell
                            className={`${cellBase} ${cellColor} font-bold rounded-l-lg border-y border-l border-transparent`}
                            style={bg}
                          >
                            {day}
                          </TableCell>
                          <TableCell className={`${cellBase} ${cellColor} border-y border-transparent`} style={bg}>
                            {location.schedule[day].morning}
                          </TableCell>
                          <TableCell className={`${cellBase} ${cellColor} border-y border-transparent`} style={bg}>
                            {location.schedule[day].afternoon}
                          </TableCell>
                          <TableCell
                            className={`${cellBase} ${cellColor} rounded-r-lg border-y border-r border-transparent`}
                            style={bg}
                          >
                            {location.schedule[day].evening}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
          </div>

          {/* ── ROW 2, LEFT: events ─────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            {[
              { label: TIME_LABELS.morning, event: morningEvent },
              { label: TIME_LABELS.afternoon, event: afternoonEvent },
              { label: TIME_LABELS.evening, event: eveningEvent },
            ].map(({ label, event }) => (
              <div key={label} className="flex flex-col gap-3">
                <h2 className="text-lg font-medium text-muted-foreground">{label}</h2>
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
              <h2 className="text-3xl font-semibold mb-4">Галерея объекта</h2>
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-muted">
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
              <h2 className="text-3xl font-semibold mb-3">Описание</h2>
              <p className="text-muted-foreground leading-relaxed">{location.description}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Booking dialog */}
      <Dialog open={!!booking} onOpenChange={(open) => !open && setBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение записи</DialogTitle>
          </DialogHeader>
          {booking && (
            <div className="flex flex-col gap-3 py-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Мероприятие</span>
                <span className="font-medium">{booking.event.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Дата</span>
                <span>{formatDate(booking.date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Время</span>
                <span>{booking.event.timeRange}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Локация</span>
                <span>{location.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Количество мест</span>
                <span className="font-semibold">{booking.quantity}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBooking(null)}>Отмена</Button>
            <Button onClick={() => setBooking(null)}>Подтвердить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
