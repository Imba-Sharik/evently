'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'
import { CalendarIcon, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { TimePicker } from '@/shared/ui/time-picker'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { type FormState, emptyForm } from '@/entities/event/model/types'
import { createEventAction, updateEventAction } from '@/entities/event/actions'
import type { Event } from '@/shared/api/generated/types/Event'

type LocationOption = { documentId: string; name: string }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  locations: LocationOption[]
  event?: Event
  templateEvent?: Event
}

function toFormState(event: Event): FormState {
  return {
    name: event.name ?? '',
    description: event.description ?? '',
    spots: String(event.totalSpots ?? ''),
    startTime: event.startTime ? event.startTime.slice(0, 5) : '',
    endTime: event.endTime ? event.endTime.slice(0, 5) : '',
  }
}

function pluralDates(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return `${n} дата`
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} даты`
  return `${n} дат`
}

export function EventFormDialog({ open, onOpenChange, locations, event, templateEvent }: Props) {
  const router = useRouter()
  const isEdit = !!event
  const source = event ?? templateEvent
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState<FormState>(() => source ? toFormState(source) : emptyForm())
  const [locationId, setLocationId] = useState<string>(source?.location?.documentId ?? '')
  const [dates, setDates] = useState<Date[]>(() =>
    event?.date ? [new Date(event.date + 'T00:00:00')] : []
  )
  const [multipleMode, setMultipleMode] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  function handleOpenChange(val: boolean) {
    if (!val) {
      setForm(source ? toFormState(source) : emptyForm())
      setLocationId(source?.location?.documentId ?? '')
      setDates(event?.date ? [new Date(event.date + 'T00:00:00')] : [])
      setMultipleMode(false)
    }
    onOpenChange(val)
  }

  function toggleMultipleMode() {
    if (multipleMode) {
      setMultipleMode(false)
      setDates(dates.slice(0, 1))
    } else {
      setMultipleMode(true)
    }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const isValid =
    form.name.trim() &&
    form.startTime &&
    form.endTime &&
    form.spots &&
    dates.length > 0 &&
    (isEdit || locationId)

  function handleSave() {
    if (!isValid) return
    startTransition(async () => {
      const base = {
        name: form.name.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
        totalSpots: Number(form.spots),
        description: form.description || undefined,
      }

      let result
      if (isEdit && event?.documentId) {
        result = await updateEventAction(String(event.documentId), { ...base, date: format(dates[0], 'yyyy-MM-dd') })
        if ('error' in result) { toast.error(result.error); return }
      } else {
        const results = await Promise.all(
          dates.map(d => createEventAction({ ...base, date: format(d, 'yyyy-MM-dd'), locationDocumentId: locationId }))
        )
        const err = results.find(r => 'error' in r)
        if (err) { toast.error((err as { error: string }).error); return }
      }

      toast.success(
        isEdit ? 'Мероприятие обновлено'
          : dates.length > 1 ? `Создано ${pluralDates(dates.length)}`
          : 'Мероприятие создано'
      )
      onOpenChange(false)
      router.refresh()
    })
  }

  const primaryDate = dates[0]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEdit ? 'Редактировать мероприятие' : templateEvent ? 'Создать по шаблону' : 'Новое мероприятие'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-lg">
          {/* Location — create mode only */}
          {!isEdit && (
            <div className="space-y-2">
              <label className="font-medium">Локация</label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger className="h-11 border-black text-lg">
                  <SelectValue placeholder="Выберите локацию" />
                </SelectTrigger>
                <SelectContent className="text-lg">
                  {locations.map(loc => (
                    <SelectItem key={loc.documentId} value={loc.documentId}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium">Дата</label>
              {!isEdit && (
                <button
                  type="button"
                  onClick={toggleMultipleMode}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {multipleMode ? 'Одна дата' : '+ Несколько дат'}
                </button>
              )}
            </div>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-11 w-full justify-start gap-2 text-lg border-black font-normal">
                  <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
                  {multipleMode
                    ? dates.length === 0 ? 'Выберите даты' : pluralDates(dates.length)
                    : primaryDate ? format(primaryDate, 'd MMMM yyyy', { locale: ru }) : 'Выберите дату'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                {multipleMode ? (
                  <Calendar
                    mode="multiple"
                    selected={dates}
                    onSelect={d => setDates(d ?? [])}
                    locale={ru}
                  />
                ) : (
                  <Calendar
                    mode="single"
                    selected={primaryDate}
                    onSelect={d => { if (d) { setDates([d]); setCalendarOpen(false) } }}
                    locale={ru}
                  />
                )}
              </PopoverContent>
            </Popover>

            {multipleMode && dates.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {[...dates]
                  .sort((a, b) => a.getTime() - b.getTime())
                  .map(d => (
                    <span
                      key={d.toISOString()}
                      className="inline-flex items-center gap-1 text-sm bg-secondary rounded-md px-2 py-0.5"
                    >
                      {format(d, 'd MMM', { locale: ru })}
                      <button
                        type="button"
                        onClick={() => setDates(dates.filter(x => x.getTime() !== d.getTime()))}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="font-medium">Название</label>
            <Input
              placeholder="Название мероприятия"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              className="text-lg h-11 border-black"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="font-medium">Описание</label>
            <Textarea
              placeholder="Описание мероприятия"
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              className="text-lg border-black resize-none min-h-20"
            />
          </div>

          {/* Time + Spots */}
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex flex-col gap-2">
              <label className="font-medium">Начало</label>
              <TimePicker value={form.startTime} onChange={v => setField('startTime', v)} className="border-black" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Конец</label>
              <TimePicker value={form.endTime} onChange={v => setField('endTime', v)} className="border-black" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Мест</label>
              <Input
                type="number"
                min={1}
                placeholder="0"
                value={form.spots}
                onChange={e => setField('spots', e.target.value)}
                className="w-24 text-lg h-11 border-black"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-3 pt-2">
          <Button variant="outline" className="border-black text-lg h-11 flex-1" onClick={() => handleOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || isPending}
            className="text-lg h-11 flex-1"
          >
            {isPending
              ? (isEdit ? 'Обновление...' : 'Создание...')
              : (isEdit ? 'Обновить' : 'Создать')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
