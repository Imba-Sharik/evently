'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { format, parseISO, startOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Pencil, Plus } from 'lucide-react'
// import { LocationCalendar } from '@/widgets/location-calendar'
import { getDayKey } from '@/shared/lib/date'
import type { Location } from '@/shared/api/generated/types/Location'
import type { Event as StrapiEvent } from '@/shared/api/generated/types/Event'
import { createEventAction, updateEventAction } from '@/entities/event/actions'
import { EventCard } from '@/entities/event/ui/EventCard'
import { EventEditorPanel } from './EventEditorPanel'

export type SelectedSlot = {
  day: string
  date: string
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
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedDayKey = getDayKey(selectedDate)
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')

  const [createDates, setCreateDates] = useState<Date[]>([selectedDate])
  const [previewQuantity, setPreviewQuantity] = useState(1)
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot>({
    day: selectedDayKey,
    date: selectedDateStr,
    mode: 'create',
  })
  const [form, setForm] = useState<FormState>(emptyForm())
  const [isPending, startTransition] = useTransition()

  // При смене даты (из URL) сбрасываем в режим создания
  useEffect(() => {
    setSelectedSlot({ day: selectedDayKey, date: selectedDateStr, mode: 'create' })
    setCreateDates([selectedDate])
    setForm(emptyForm())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateStr])

  function handleCreateDatesChange(dates: Date[]) {
    setCreateDates(dates)
    if (dates.length === 0) return
    const primary = dates[0]
    const currentWeekStart = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const newWeekStart = format(startOfWeek(primary, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    // Обновляем URL только при переходе на другую неделю (чтобы сервер перегрузил события)
    if (newWeekStart !== currentWeekStart) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('date', format(primary, 'yyyy-MM-dd'))
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }

  // Для списка событий: в режиме создания — первая выбранная дата, в редактировании — дата события
  const primaryDateStr = selectedSlot.mode === 'edit'
    ? selectedSlot.date
    : createDates[0] ? format(createDates[0], 'yyyy-MM-dd') : selectedDateStr

  const dayEvents = useMemo(
    () => events.filter(ev => ev.date === primaryDateStr),
    [events, primaryDateStr],
  )

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function openCreate() {
    setSelectedSlot({ day: selectedDayKey, date: selectedDateStr, mode: 'create' })
    setForm(emptyForm())
  }

  function openEdit(event: StrapiEvent) {
    setSelectedSlot({ day: selectedDayKey, date: event.date ?? selectedDateStr, mode: 'edit', documentId: String(event.documentId) })
    setForm({
      name: event.name,
      description: event.description ?? '',
      spots: String(event.totalSpots),
      startTime: toPickerTime(event.startTime) || '00:00',
      endTime: toPickerTime(event.endTime) || '23:59',
    })
  }

  function handleSave() {
    if (!form.name.trim()) return
    startTransition(async () => {
      const basePayload = {
        name: form.name.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
        totalSpots: Number(form.spots) || 0,
        description: form.description || undefined,
      }

      if (selectedSlot.mode === 'edit' && selectedSlot.documentId) {
        const result = await updateEventAction(selectedSlot.documentId, {
          ...basePayload,
          date: selectedSlot.date,
        })
        if ('error' in result) { alert(result.error); return }
        toast.success('Мероприятие обновлено')
      } else {
        const results = await Promise.all(
          createDates.map(date => createEventAction({
            ...basePayload,
            date: format(date, 'yyyy-MM-dd'),
            locationDocumentId: String(location.documentId),
          }))
        )
        const errorResult = results.find(r => 'error' in r)
        if (errorResult) { alert((errorResult as { error: string }).error); return }
        toast.success(createDates.length > 1 ? `Создано ${createDates.length} мероприятий` : 'Мероприятие создано')
      }

      router.refresh()
      openCreate()
    })
  }

  const previewEvent = {
    name: form.name || 'Название мероприятия',
    date: primaryDateStr,
    startTime: form.startTime || '00:00',
    endTime: form.endTime || '00:00',
    totalSpots: Number(form.spots) || 0,
    description: form.description || undefined,
  }

  return (
    <div className="p-4 xl:p-6 flex flex-col xl:flex-row gap-4 xl:gap-6 items-start">
      <div className="flex flex-col gap-4 min-w-0 w-full xl:flex-1 xl:max-w-sm">
        {/* <LocationCalendar selectedDate={selectedDate} /> */}
        <div className="flex flex-col gap-2">
          <p className="text-lg">Предпросмотр карточки мероприятия:</p>
          <EventCard
            event={previewEvent}
            date={createDates[0] ?? selectedDate}
            locationName={location.name ?? undefined}
            quantity={previewQuantity}
            onQuantityChange={delta => setPreviewQuantity(q => Math.max(1, Math.min(previewEvent.totalSpots, q + delta)))}
            onBook={() => {}}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full xl:w-96 xl:shrink-0">
        {/* Список мероприятий на выбранный день */}
        {dayEvents.length > 0 && (
          <div className="border border-black rounded-xl p-4 space-y-1.5">
            <p className="text-lg font-medium pb-1">
              {format(parseISO(primaryDateStr), 'd MMMM yyyy', { locale: ru })}
            </p>
            {dayEvents.map(event => {
              const isActive = selectedSlot.mode === 'edit' && selectedSlot.documentId === String(event.documentId)
              return (
                <button
                  key={String(event.documentId)}
                  onClick={() => openEdit(event)}
                  className={`flex items-center gap-2 w-full text-left text-lg hover:underline ${isActive ? 'font-medium underline' : 'text-muted-foreground'}`}
                >
                  <Pencil className="size-3 shrink-0" />
                  {event.name}
                </button>
              )
            })}
            {selectedSlot.mode === 'edit' && (
              <button
                onClick={openCreate}
                className="flex items-center gap-1 text-lg text-muted-foreground hover:text-foreground transition-colors pt-1"
              >
                <Plus className="size-3" />
                <span>Добавить мероприятие</span>
              </button>
            )}
          </div>
        )}

        <EventEditorPanel
          selectedSlot={selectedSlot}
          form={form}
          setField={setField}
          isPending={isPending}
          onClose={openCreate}
          onSave={handleSave}
          onDeleted={() => { router.refresh(); openCreate() }}
          createDates={createDates}
          onCreateDatesChange={handleCreateDatesChange}
        />
      </div>
    </div>
  )
}
