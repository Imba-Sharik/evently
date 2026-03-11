'use client'

import { useState } from 'react'
import { format, parseISO, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Search, X } from 'lucide-react'
import { toast } from 'sonner'

import type { Event } from '@/shared/api/generated/types/Event'
import type { Location } from '@/shared/api/generated/types/Location'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/popover'
import { useBooking, BookingDialog } from '@/features/booking'
import { createBookingAction } from '@/entities/booking/actions'

function spotsLabel(n: number): string {
  if (n === 0) return 'Не осталось мест :('
  const mod100 = n % 100
  const mod10 = n % 10
  if (mod100 >= 11 && mod100 <= 19) return `Осталось ${n} мест`
  if (mod10 === 1) return `Осталось ${n} место`
  if (mod10 >= 2 && mod10 <= 4) return `Осталось ${n} места`
  return `Осталось ${n} мест`
}

type Props = {
  locations: Location[]
  events: Event[]
}

export function HomeClient({ locations, events }: Props) {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'custom'>('today')
  const [customDate, setCustomDate] = useState<Date | undefined>()
  const [locationFilter, setLocationFilter] = useState('')
  const [search, setSearch] = useState('')

  const {
    booking, bookingName, bookingEmail,
    setBookingName, setBookingEmail,
    getQuantity, changeQuantity,
    openBooking, closeBooking, eventKey,
  } = useBooking()

  const dateTarget =
    dateFilter === 'today' ? todayStr
    : dateFilter === 'tomorrow' ? tomorrowStr
    : customDate ? format(customDate, 'yyyy-MM-dd')
    : null

  const filtered = events.filter(event => {
    if (dateTarget && event.date !== dateTarget) return false
    if (locationFilter && event.location?.documentId !== locationFilter) return false
    if (search && !event.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  async function handleSubmit() {
    if (!booking || !bookingName || !bookingEmail) return
    try {
      await createBookingAction({
        customerName: bookingName,
        customerEmail: bookingEmail,
        quantity: booking.quantity,
        eventDocumentId: String(booking.event.documentId ?? booking.event.id),
        locationDocumentId: String(booking.event.location?.documentId ?? ''),
      })
      closeBooking()
      toast.success('Вы успешно записались на мероприятие!')
    } catch {
      toast.error('Не удалось оформить запись. Попробуйте ещё раз.')
    }
  }

  return (
    <div className="container mx-auto px-8 py-6">
      {/* Filter row */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <Button
          variant={dateFilter === 'today' ? 'default' : 'outline'}
          className="rounded-full text-lg"
          onClick={() => setDateFilter('today')}
        >
          Сегодня
        </Button>
        <Button
          variant={dateFilter === 'tomorrow' ? 'default' : 'outline'}
          className="rounded-full text-lg"
          onClick={() => setDateFilter('tomorrow')}
        >
          Завтра
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={dateFilter === 'custom' ? 'default' : 'outline'}
              className="rounded-full text-lg"
            >
              {dateFilter === 'custom' && customDate
                ? format(customDate, 'd MMMM', { locale: ru })
                : 'Выбрать дату'}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={customDate}
              onSelect={date => {
                setCustomDate(date)
                setDateFilter('custom')
              }}
              locale={ru}
            />
          </PopoverContent>
        </Popover>

        <Select
          value={locationFilter || 'all'}
          onValueChange={v => setLocationFilter(v === 'all' ? '' : v)}
        >
          <SelectTrigger className="w-52 rounded-full text-lg">
            <SelectValue placeholder="Выберите локацию" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-lg">Все локации</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc.documentId} value={loc.documentId!} className="text-lg">
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по мероприятиям"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-9 rounded-full text-lg"
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch('')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Events list */}
      <div className="flex flex-col gap-4">
        {filtered.map(event => {
          const key = eventKey(event)
          const qty = getQuantity(key)
          const available = (event.totalSpots ?? 0) > 0
          const dateFormatted = event.date
            ? format(parseISO(event.date), 'EEE, d MMMM', { locale: ru })
            : ''
          const dateCapitalized = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1)
          const startTime = event.startTime?.slice(0, 5) ?? ''

          return (
            <div key={key} className="bg-white rounded-2xl border p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-lg font-bold">{event.name}</p>
                  <p className="text-lg text-muted-foreground">{spotsLabel(event.totalSpots ?? 0)}</p>
                </div>
                <div className="text-right text-lg text-muted-foreground shrink-0 ml-4">
                  <p>{dateCapitalized}</p>
                  <p>Начало: {startTime}</p>
                  <p>{event.location?.name}</p>
                </div>
              </div>

              <p className="text-lg mb-4">
                <span className="font-bold italic">{event.name}</span>
                {event.description ? ` – ${event.description}` : ''}
              </p>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  disabled={!available}
                  className="text-lg"
                  onClick={() => available && openBooking(event, parseISO(event.date!))}
                >
                  {available ? 'Записаться' : 'Недоступно'}
                </Button>

                {available && (
                  <div className="flex items-center gap-2 text-lg">
                    <span className="text-muted-foreground">Кол-во мест:</span>
                    <button
                      className="w-7 h-7 rounded border flex items-center justify-center hover:bg-gray-50"
                      onClick={() => changeQuantity(key, 1)}
                    >
                      +
                    </button>
                    <span className="w-6 text-center">{qty}</span>
                    <button
                      className="w-7 h-7 rounded border flex items-center justify-center hover:bg-gray-50"
                      onClick={() => changeQuantity(key, -1)}
                    >
                      −
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-lg">
            Мероприятий не найдено
          </div>
        )}
      </div>

      <BookingDialog
        booking={booking}
        locationName={booking?.event.location?.name ?? ''}
        bookingName={bookingName}
        bookingEmail={bookingEmail}
        onNameChange={setBookingName}
        onEmailChange={setBookingEmail}
        onSubmit={handleSubmit}
        onCancel={closeBooking}
      />
    </div>
  )
}
