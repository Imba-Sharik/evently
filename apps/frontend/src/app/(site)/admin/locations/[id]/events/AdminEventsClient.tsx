'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addDays, format, parseISO, startOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { TimePicker } from '@/shared/ui/time-picker'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { Plus, Pencil, X, Trash2 } from 'lucide-react'
import { LocationCalendar } from '@/widgets/location-calendar'
import { DAYS } from '@/shared/mocks/locations'
import { getDayKey } from '@/shared/lib/date'
import type { Location } from '@/shared/api/generated/types/Location'
import type { Event as StrapiEvent, EventTimeSlotEnumKey } from '@/shared/api/generated/types/Event'
import { createEventAction, updateEventAction, deleteEventAction } from '@/entities/event/actions'

type TimeSlot = EventTimeSlotEnumKey

const SLOT_LABELS: Record<TimeSlot, string> = {
  morning:   'Утро',
  afternoon: 'День',
  evening:   'Вечер',
}

type SlotMeta = { key: TimeSlot; label: string; time: string; min: string; max: string }

function buildTimeSlots(raw: Record<TimeSlot, { start: string; end: string }> | null | undefined): SlotMeta[] {
  return (['morning', 'afternoon', 'evening'] as const).map(key => {
    const slot = raw?.[key]
    return {
      key,
      label: SLOT_LABELS[key],
      time:  slot ? `${slot.start}–${slot.end}` : '',
      min:   slot?.start ?? '00:00',
      max:   slot?.end   ?? '23:59',
    }
  })
}

type SelectedSlot = {
  day: string
  date: string // YYYY-MM-DD
  timeSlot: TimeSlot
  mode: 'create' | 'edit'
  documentId?: string // for edit mode
}

type HoveredCell = { day: string; timeSlot: TimeSlot }

type FormState = {
  name: string
  description: string
  spots: string
  startTime: string
  endTime: string
}

const emptyForm = (): FormState => ({ name: '', description: '', spots: '', startTime: '', endTime: '' })

/** Strip seconds/ms from Strapi time (HH:mm:ss.SSS → HH:mm) */
function toPickerTime(t: string | undefined | null) {
  if (!t) return ''
  return t.slice(0, 5)
}

export function AdminEventsClient({
  location,
  selectedDate,
  events,
}: {
  location: Location
  selectedDate: Date
  events: StrapiEvent[]
}) {
  const router = useRouter()
  const TIME_SLOTS = buildTimeSlots(location.timeSlots as Record<TimeSlot, { start: string; end: string }> | null)
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [isPending, startTransition] = useTransition()

  const selectedDayKey = getDayKey(selectedDate)

  // Map events by date → timeSlot for fast lookup
  const eventsByDate = useMemo(() => {
    const map: Record<string, Record<TimeSlot, StrapiEvent | null>> = {}
    for (const ev of events) {
      if (!ev.date) continue
      if (!map[ev.date]) map[ev.date] = { morning: null, afternoon: null, evening: null }
      if (ev.timeSlot) map[ev.date][ev.timeSlot as TimeSlot] = ev
    }
    return map
  }, [events])

  // Compute ISO dates for each day of the week (Mon–Sun)
  const weekDates = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    return DAYS.map((key, i) => ({
      key,
      dateStr: format(addDays(weekStart, i), 'yyyy-MM-dd'),
    }))
  }, [selectedDate])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function openCreate(day: string, dateStr: string, timeSlot: TimeSlot) {
    const slotMeta = TIME_SLOTS.find(s => s.key === timeSlot)!
    setSelectedSlot({ day, date: dateStr, timeSlot, mode: 'create' })
    setForm({ ...emptyForm(), startTime: slotMeta.min, endTime: slotMeta.max })
  }

  function openEdit(day: string, dateStr: string, timeSlot: TimeSlot, event: StrapiEvent) {
    const slotMeta = TIME_SLOTS.find(s => s.key === timeSlot)!
    setSelectedSlot({ day, date: dateStr, timeSlot, mode: 'edit', documentId: String(event.documentId) })
    setForm({
      name: event.name,
      description: event.description ?? '',
      spots: String(event.totalSpots),
      startTime: toPickerTime(event.startTime) || slotMeta.min,
      endTime: toPickerTime(event.endTime) || slotMeta.max,
    })
  }

  function handleSave() {
    if (!selectedSlot || !form.name.trim()) return
    startTransition(async () => {
      const payload = {
        name: form.name.trim(),
        date: selectedSlot.date,
        timeSlot: selectedSlot.timeSlot,
        startTime: form.startTime,
        endTime: form.endTime,
        totalSpots: Number(form.spots) || 0,
        description: form.description || undefined,
      }
      const result = selectedSlot.mode === 'edit' && selectedSlot.documentId
        ? await updateEventAction(selectedSlot.documentId, payload)
        : await createEventAction({ ...payload, locationDocumentId: String(location.documentId) })
      if ('error' in result) {
        alert(result.error)
        return
      }
      router.refresh()
      setSelectedSlot(null)
    })
  }

  function isCellHovered(day: string, timeSlot: TimeSlot) {
    return hoveredCell?.day === day && hoveredCell?.timeSlot === timeSlot
  }

  function isCellActive(day: string, timeSlot: TimeSlot) {
    return selectedSlot?.day === day && selectedSlot?.timeSlot === timeSlot
  }

  const activeSlotMeta = selectedSlot ? TIME_SLOTS.find(s => s.key === selectedSlot.timeSlot)! : null
  const slotDate = selectedSlot ? format(parseISO(selectedSlot.date), 'd MMMM yyyy', { locale: ru }) : ''

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LocationCalendar selectedDate={selectedDate} />

        {/* Interactive schedule table */}
        <div className="bg-linear-to-br from-[#1F1F1F] to-[#666666] rounded-xl px-3 pt-2 pb-2 flex-1 border border-black">
          <Table className="border-separate border-spacing-0">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-white text-lg py-1 px-3 font-normal">День</TableHead>
                {TIME_SLOTS.map(slot => (
                  <TableHead key={slot.key} className="text-white text-lg py-1 px-3 font-normal">
                    {slot.label} <span className="text-white/50">({slot.time})</span>
                  </TableHead>
                ))}
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableHead colSpan={4} className="h-px p-0" style={{ backgroundColor: 'rgba(168,162,167,0.38)' }} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {weekDates.map(({ key: day, dateStr }) => {
                const isDaySelected = day === selectedDayKey
                const rowBg = isDaySelected ? { backgroundColor: '#498BD7' } : undefined
                const daySlotMap = eventsByDate[dateStr]
                return (
                  <TableRow key={day} className="border-0 hover:bg-transparent">
                    <TableCell
                      className={`text-lg py-1 px-3 font-bold rounded-l-lg border-y border-l border-transparent ${isDaySelected ? 'text-white' : 'text-white/90'}`}
                      style={rowBg}
                    >
                      {day}
                    </TableCell>
                    {TIME_SLOTS.map((slot, idx) => {
                      const event = daySlotMap?.[slot.key] ?? null
                      const name = event?.name ?? null
                      const hovered = isCellHovered(day, slot.key)
                      const active = isCellActive(day, slot.key)
                      const isLast = idx === TIME_SLOTS.length - 1
                      return (
                        <TableCell
                          key={slot.key}
                          className={`text-lg py-1 px-3 ${isLast ? 'rounded-r-lg border-y border-r' : 'border-y'} border-transparent ${isDaySelected ? 'text-white' : 'text-white/90'}`}
                          style={rowBg}
                          onMouseEnter={() => setHoveredCell({ day, timeSlot: slot.key })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <div className="flex items-center gap-2 h-7">
                            {name ? (
                              <button
                                onClick={() => openEdit(day, dateStr, slot.key, event!)}
                                className="flex items-center gap-1 text-left cursor-pointer w-fit"
                              >
                                <span className={`hover:underline ${active && selectedSlot?.mode === 'edit' ? 'underline' : ''}`}>
                                  {name}
                                </span>
                                <Pencil className={`size-3 shrink-0 opacity-60 ${hovered ? 'visible' : 'invisible'}`} />
                              </button>
                            ) : null}
                            <button
                              onClick={() => openCreate(day, dateStr, slot.key)}
                              className={`flex items-center gap-0.5 text-sm text-white/60 hover:text-white/90 transition-colors cursor-pointer shrink-0 ${(hovered || active) ? 'visible' : 'invisible'}`}
                            >
                              <Plus className="size-3" />
                              <span>добавить</span>
                            </button>
                          </div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Event editor panel */}
      {selectedSlot && activeSlotMeta && (
        <div className="border border-black rounded-xl p-5 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                {selectedSlot.mode === 'create' ? 'Новое мероприятие' : 'Редактировать мероприятие'}
              </h3>
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: 18 }}>
                {slotDate}
                {' · '}
                {selectedSlot.day}
                {' · '}
                {activeSlotMeta.label}
                {' '}
                <span className="text-muted-foreground/70">({activeSlotMeta.time})</span>
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedSlot(null)}>
              <X className="size-4" />
            </Button>
          </div>

          {/* Fields */}
          <div className="space-y-2">
            {/* Name */}
            <div className="space-y-2 max-w-md">
              <label className="text-lg font-medium">Название</label>
              <Input
                placeholder="Название мероприятия"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                className="text-lg h-11 border-black"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2 max-w-md">
              <label className="text-lg font-medium">Описание</label>
              <Textarea
                placeholder="Описание мероприятия"
                value={form.description}
                onChange={e => setField('description', e.target.value)}
                className="text-lg border-black resize-none min-h-20"
              />
            </div>

            {/* Spots + Times */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-lg font-medium whitespace-nowrap">Количество мест</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="0"
                  value={form.spots}
                  onChange={e => setField('spots', e.target.value)}
                  className="w-28 text-lg h-11 border-black"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-lg font-medium">Начало</label>
                <TimePicker
                  value={form.startTime}
                  onChange={v => setField('startTime', v)}
                  min={activeSlotMeta.min}
                  max={activeSlotMeta.max}
                  className="border-black"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-lg font-medium">Конец</label>
                <TimePicker
                  value={form.endTime}
                  onChange={v => setField('endTime', v)}
                  min={activeSlotMeta.min}
                  max={activeSlotMeta.max}
                  className="border-black"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button onClick={handleSave} disabled={!form.name.trim() || isPending} className="h-10 text-lg">
              {isPending
                ? (selectedSlot?.mode === 'edit' ? 'Обновление...' : 'Сохранение...')
                : (selectedSlot?.mode === 'edit' ? 'Обновить' : 'Сохранить')}
            </Button>

            {selectedSlot?.mode === 'edit' && selectedSlot.documentId && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={isPending}>
                    <Trash2 className="size-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="text-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg">Удалить мероприятие?</AlertDialogTitle>
                    <AlertDialogDescription className="text-lg">
                      Это действие нельзя отменить. Мероприятие «{form.name}» будет удалено безвозвратно.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="sm:justify-start">
                    <AlertDialogCancel className="text-lg">Отмена</AlertDialogCancel>
                    <AlertDialogAction
                      className="text-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => {
                        startTransition(async () => {
                          const result = await deleteEventAction(selectedSlot.documentId!)
                          if ('error' in result) { alert(result.error); return }
                          router.refresh()
                          setSelectedSlot(null)
                        })
                      }}
                    >
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
