'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { TimePicker } from '@/shared/ui/time-picker'
import { Plus, Pencil, X } from 'lucide-react'
import { LocationCalendar } from '@/widgets/location-calendar'
import type { Location, TimeSlot } from '@/shared/mocks/locations'
import { DAYS } from '@/shared/mocks/locations'
import { getDayKey } from '@/shared/lib/date'

const TIME_SLOTS: { key: TimeSlot; label: string; time: string; min: string; max: string }[] = [
  { key: 'morning',   label: 'Утро',  time: '08:00–11:00', min: '08:00', max: '11:00' },
  { key: 'afternoon', label: 'День',  time: '12:00–17:00', min: '12:00', max: '17:00' },
  { key: 'evening',   label: 'Вечер', time: '18:30–22:00', min: '18:30', max: '22:00' },
]

type SelectedSlot = {
  day: string
  timeSlot: TimeSlot
  mode: 'create' | 'edit'
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

export function AdminEventsClient({
  location,
  selectedDate,
}: {
  location: Location
  selectedDate: Date
}) {
  const [schedule, setSchedule] = useState(location.schedule)
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())

  const selectedDayKey = getDayKey(selectedDate)

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function openCreate(day: string, timeSlot: TimeSlot) {
    const slotMeta = TIME_SLOTS.find(s => s.key === timeSlot)!
    setSelectedSlot({ day, timeSlot, mode: 'create' })
    setForm({ ...emptyForm(), startTime: slotMeta.min, endTime: slotMeta.max })
  }

  function openEdit(day: string, timeSlot: TimeSlot, name: string) {
    const slotMeta = TIME_SLOTS.find(s => s.key === timeSlot)!
    setSelectedSlot({ day, timeSlot, mode: 'edit' })
    setForm({ name, description: '', spots: '', startTime: slotMeta.min, endTime: slotMeta.max })
  }

  function handleSave() {
    if (!selectedSlot || !form.name.trim()) return
    setSchedule(prev => ({
      ...prev,
      [selectedSlot.day]: {
        ...prev[selectedSlot.day],
        [selectedSlot.timeSlot]: form.name.trim(),
      },
    }))
    setSelectedSlot(null)
  }

  function isCellHovered(day: string, timeSlot: TimeSlot) {
    return hoveredCell?.day === day && hoveredCell?.timeSlot === timeSlot
  }

  function isCellActive(day: string, timeSlot: TimeSlot) {
    return selectedSlot?.day === day && selectedSlot?.timeSlot === timeSlot
  }

  const activeSlotMeta = selectedSlot ? TIME_SLOTS.find(s => s.key === selectedSlot.timeSlot)! : null
  const formattedDate = format(selectedDate, 'd MMMM yyyy', { locale: ru })

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
              {DAYS.map(day => {
                const isDaySelected = day === selectedDayKey
                const rowBg = isDaySelected ? { backgroundColor: '#498BD7' } : undefined
                return (
                  <TableRow key={day} className="border-0 hover:bg-transparent">
                    <TableCell
                      className={`text-lg py-1 px-3 font-bold rounded-l-lg border-y border-l border-transparent ${isDaySelected ? 'text-white' : 'text-white/90'}`}
                      style={rowBg}
                    >
                      {day}
                    </TableCell>
                    {TIME_SLOTS.map((slot, idx) => {
                      const name = schedule[day][slot.key]
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
                                onClick={() => openEdit(day, slot.key, name)}
                                className="flex items-center gap-1 text-left cursor-pointer w-fit"
                              >
                                <span className={`hover:underline ${active && selectedSlot?.mode === 'edit' ? 'underline' : ''}`}>
                                  {name}
                                </span>
                                <Pencil className={`size-3 shrink-0 opacity-60 ${hovered ? 'visible' : 'invisible'}`} />
                              </button>
                            ) : null}
                            <button
                              onClick={() => openCreate(day, slot.key)}
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
              <p className="text-muted-foreground text-sm mt-0.5">
                {formattedDate}
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

          <Button onClick={handleSave} disabled={!form.name.trim()} className="h-10 text-base">
            Сохранить
          </Button>
        </div>
      )}
    </div>
  )
}
