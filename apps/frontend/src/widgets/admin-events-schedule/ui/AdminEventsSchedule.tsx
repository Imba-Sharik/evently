'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { addDays, format, parseISO, startOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Plus, Pencil } from 'lucide-react'
import { LocationCalendar } from '@/widgets/location-calendar'
import { DAYS } from '@/shared/mocks/locations'
import { getDayKey } from '@/shared/lib/date'
import type { Location } from '@/shared/api/generated/types/Location'
import type { Event as StrapiEvent, EventTimeSlotEnum2Key as EventTimeSlotEnumKey } from '@/shared/api/generated/types/Event'
import { createEventAction, updateEventAction } from '@/entities/event/actions'
import { EventEditorPanel } from './EventEditorPanel'

export type TimeSlot = EventTimeSlotEnumKey

export type SlotMeta = { key: TimeSlot; label: string; time: string; min: string; max: string }

export type SelectedSlot = {
  day: string
  date: string
  timeSlot: TimeSlot
  mode: 'create' | 'edit'
  documentId?: string
}

export type FormState = {
  name: string
  description: string
  spots: string
  startTime: string
  endTime: string
}

const SLOT_LABELS: Record<TimeSlot, string> = {
  morning:   'Утро',
  afternoon: 'День',
  evening:   'Вечер',
}

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

const emptyForm = (): FormState => ({ name: '', description: '', spots: '', startTime: '', endTime: '' })

function toPickerTime(t: string | undefined | null) {
  if (!t) return ''
  return t.slice(0, 5)
}

export function AdminEventsSchedule({
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
  const [hoveredCell, setHoveredCell] = useState<{ day: string; timeSlot: TimeSlot } | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [isPending, startTransition] = useTransition()

  const selectedDayKey = getDayKey(selectedDate)

  const eventsByDate = useMemo(() => {
    const map: Record<string, Record<TimeSlot, StrapiEvent[]>> = {}
    for (const ev of events) {
      if (!ev.date) continue
      if (!map[ev.date]) map[ev.date] = { morning: [], afternoon: [], evening: [] }
      if (ev.timeSlot) map[ev.date][ev.timeSlot as TimeSlot].push(ev)
    }
    return map
  }, [events])

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
      if ('error' in result) { alert(result.error); return }
      toast.success(selectedSlot.mode === 'edit' ? 'Мероприятие обновлено' : 'Мероприятие создано')
      router.refresh()
      setSelectedSlot(null)
    })
  }

  const activeSlotMeta = selectedSlot ? TIME_SLOTS.find(s => s.key === selectedSlot.timeSlot)! : null
  const slotDate = selectedSlot ? format(parseISO(selectedSlot.date), 'd MMMM yyyy', { locale: ru }) : ''

  return (
    <div className="p-4 xl:p-6 flex flex-col xl:flex-row gap-4 xl:gap-6 items-start">
      {/* Левая колонка: календарь + таблица */}
      <div className="flex flex-col gap-4 min-w-0 w-full xl:flex-1 xl:max-w-3xl">
        <LocationCalendar selectedDate={selectedDate} />

        <div className="bg-linear-to-br from-[#1F1F1F] to-[#666666] rounded-xl px-3 pt-2 pb-2 border border-black overflow-x-auto">
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
                      const slotEvents = daySlotMap?.[slot.key] ?? []
                      const hovered = hoveredCell?.day === day && hoveredCell?.timeSlot === slot.key
                      const active = selectedSlot?.day === day && selectedSlot?.timeSlot === slot.key
                      const isLast = idx === TIME_SLOTS.length - 1
                      return (
                        <TableCell
                          key={slot.key}
                          className={`text-lg py-1 px-3 ${isLast ? 'rounded-r-lg border-y border-r' : 'border-y'} border-transparent ${isDaySelected ? 'text-white' : 'text-white/90'}`}
                          style={rowBg}
                          onMouseEnter={() => setHoveredCell({ day, timeSlot: slot.key })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <div className="flex flex-col gap-0.5 min-h-7 justify-center">
                            {slotEvents.map(event => {
                              const isActiveEvent = active && selectedSlot?.mode === 'edit' && selectedSlot?.documentId === String(event.documentId)
                              return (
                                <button
                                  key={String(event.documentId)}
                                  onClick={() => openEdit(day, dateStr, slot.key, event)}
                                  className="flex items-center gap-1 text-left cursor-pointer w-fit"
                                >
                                  <span className={`hover:underline ${isActiveEvent ? 'underline' : ''}`}>
                                    {event.name}
                                  </span>
                                  <Pencil className={`size-3 shrink-0 opacity-60 ${hovered ? 'visible' : 'invisible'}`} />
                                </button>
                              )
                            })}
                            <button
                              onClick={() => openCreate(day, dateStr, slot.key)}
                              className={`flex items-center gap-0.5 text-lg text-white/60 hover:text-white/90 transition-colors cursor-pointer shrink-0 ${(hovered || active) ? 'visible' : 'invisible'}`}
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

      {/* Правая колонка: панель редактора */}
      {selectedSlot && activeSlotMeta && (
        <EventEditorPanel
          selectedSlot={selectedSlot}
          activeSlotMeta={activeSlotMeta}
          slotDate={slotDate}
          form={form}
          setField={setField}
          isPending={isPending}
          onClose={() => setSelectedSlot(null)}
          onSave={handleSave}
          onDeleted={() => { router.refresh(); setSelectedSlot(null) }}
        />
      )}
    </div>
  )
}
