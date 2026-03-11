'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { format, startOfWeek } from 'date-fns'
import type { Location } from '@/shared/api/generated/types/Location'
import { createEventAction } from '@/entities/event/actions'
import { EventCard } from '@/entities/event/ui/EventCard'
import { EventEditorPanel } from './EventEditorPanel'
import { type FormState, emptyForm } from '@/entities/event/model/types'

export type { FormState }

export function AdminEventsSchedule({
  location,
  selectedDate,
}: {
  location: Location
  selectedDate: Date
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [createDates, setCreateDates] = useState<Date[]>([selectedDate])
  const [previewQuantity, setPreviewQuantity] = useState(1)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [isPending, startTransition] = useTransition()

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  useEffect(() => {
    setCreateDates([selectedDate])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateStr])

  function handleCreateDatesChange(dates: Date[]) {
    setCreateDates(dates)
    if (dates.length === 0) return
    const primary = dates[0]
    const currentWeekStart = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const newWeekStart = format(startOfWeek(primary, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    if (newWeekStart !== currentWeekStart) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('date', format(primary, 'yyyy-MM-dd'))
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    startTransition(async () => {
      const basePayload = {
        name: form.name.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
        totalSpots: Number(form.spots) || 0,
        description: form.description || undefined,
      }
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
      router.push(`/admin/locations/${location.documentId}/events`)
    })
  }

  const primaryDateStr = createDates[0] ? format(createDates[0], 'yyyy-MM-dd') : format(selectedDate, 'yyyy-MM-dd')

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

      <div className="w-full xl:w-96 xl:shrink-0">
        <EventEditorPanel
          form={form}
          setField={setField}
          isPending={isPending}
          onSave={handleSave}
          createDates={createDates}
          onCreateDatesChange={handleCreateDatesChange}
        />
      </div>
    </div>
  )
}
