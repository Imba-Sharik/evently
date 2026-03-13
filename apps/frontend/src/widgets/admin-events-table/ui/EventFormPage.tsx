'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { TimePicker } from '@/shared/ui/time-picker'
import { Calendar } from '@/shared/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Checkbox } from '@/shared/ui/checkbox'
import { type FormState, emptyForm } from '@/entities/event/model/types'
import { createEventAction, updateEventAction } from '@/entities/event/actions'
import { EventCard } from '@/entities/event/ui/EventCard'
import type { Event } from '@/shared/api/generated/types/Event'

type LocationOption = { documentId: string; name: string }

type Props = {
  locations: LocationOption[]
  event?: Event
  templateEvent?: Event
  templates?: Event[]
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

const calendarClassNames = {
  root: 'w-full',
  caption_label: 'font-medium select-none text-lg',
  weekday: 'flex-1 rounded-md text-lg font-normal text-white/60 select-none',
  outside: 'text-white/30 aria-selected:text-white/30',
  day: 'flex-1',
  day_button: 'w-full h-8 rounded-md text-lg',
  today: 'rounded-md bg-white/15 text-white data-[selected=true]:bg-transparent',
}

export function EventFormPage({ locations, event, templateEvent, templates = [] }: Props) {
  const router = useRouter()
  const isEdit = !!event
  const source = event ?? templateEvent
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState<FormState>(() => source ? toFormState(source) : emptyForm())
  const [locationId, setLocationId] = useState<string>(source?.location?.documentId ?? '')
  const [dates, setDates] = useState<Date[]>(() =>
    event?.date ? [new Date(event.date + 'T00:00:00')] : []
  )
  const [previewQuantity, setPreviewQuantity] = useState(1)
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState('__none__')

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const isValid =
    form.name.trim() &&
    form.startTime &&
    form.endTime &&
    form.spots &&
    (saveAsTemplate || dates.length > 0) &&
    (isEdit || saveAsTemplate || locationId)

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

      if (isEdit && event?.documentId) {
        const result = await updateEventAction(String(event.documentId), { ...base, date: format(dates[0], 'yyyy-MM-dd') })
        if ('error' in result) { toast.error(result.error); return }
      } else {
        const results = await Promise.all(
          saveAsTemplate
            ? [createEventAction({ ...base, isTemplate: true, locationDocumentId: locationId || undefined })]
            : dates.map(d => createEventAction({ ...base, date: format(d, 'yyyy-MM-dd'), locationDocumentId: locationId }))
        )
        const err = results.find(r => 'error' in r)
        if (err) { toast.error((err as { error: string }).error); return }
      }

      const successMsg = isEdit ? 'Мероприятие обновлено'
        : dates.length > 1 ? `Создано ${pluralDates(dates.length)}`
        : 'Мероприятие создано'
      router.push(`/admin/events?success=${encodeURIComponent(successMsg)}`)
    })
  }

  const primaryDate = dates[0]
  const title = isEdit ? 'Редактировать мероприятие' : templateEvent ? 'Создать по шаблону' : 'Новое мероприятие'
  const locationName = isEdit
    ? (event?.location?.name ?? undefined)
    : (locations.find(l => l.documentId === locationId)?.name ?? undefined)

  const previewEvent: Event = {
    name: form.name || 'Название мероприятия',
    date: primaryDate ? format(primaryDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: form.startTime || '00:00',
    endTime: form.endTime || '00:00',
    totalSpots: Number(form.spots) || 0,
    description: form.description || undefined,
  }

  return (
    <div className="p-4 xl:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/events')}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Left: calendar + preview */}
        <div className="flex flex-col gap-4 w-full xl:flex-1 xl:max-w-sm">
          {/* Date calendar */}
          <div className="rounded-2xl overflow-hidden w-full bg-linear-to-br from-[#1F1F1F] to-[#666666] border border-black **:data-[selected-single=true]:bg-[#498BD7]">
            <Calendar
              mode="single"
              selected={primaryDate}
              onSelect={d => { if (d) setDates([d]) }}
              locale={ru}
              className="p-3 bg-transparent text-white"
              classNames={calendarClassNames}
            />
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-2">
            <p className="text-lg">Предпросмотр карточки мероприятия:</p>
            <EventCard
              event={previewEvent}
              date={primaryDate ?? new Date()}
              locationName={locationName}
              quantity={previewQuantity}
              onQuantityChange={delta =>
                setPreviewQuantity(q => Math.max(1, Math.min(previewEvent.totalSpots || 1, q + delta)))
              }
              onBook={() => {}}
            />
          </div>
        </div>

        {/* Form */}
        <div className="border border-black rounded-xl p-5 space-y-5 w-full xl:w-120 xl:shrink-0">
          {/* Header: title + template select */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">{title}</h3>
              {primaryDate && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {format(primaryDate, 'd MMMM yyyy', { locale: ru })} · {format(primaryDate, 'EEEEEE', { locale: ru }).toUpperCase()} · {form.startTime || '00:00'}–{form.endTime || '00:00'}
                </p>
              )}
            </div>
            {!isEdit && templates.length > 0 && (
              <div className="flex flex-col gap-1 shrink-0">
                <label className="text-sm font-medium">Готовый шаблон</label>
                <Select value={selectedTemplateId} onValueChange={id => {
                  setSelectedTemplateId(id)
                  if (id === '__none__') {
                    setForm(emptyForm())
                    setLocationId('')
                    return
                  }
                  const t = templates.find(t => t.documentId === id)
                  if (!t) return
                  setForm({
                    name: t.name ?? '',
                    description: t.description ?? '',
                    spots: String(t.totalSpots ?? ''),
                    startTime: t.startTime ? t.startTime.slice(0, 5) : '',
                    endTime: t.endTime ? t.endTime.slice(0, 5) : '',
                  })
                  if (t.location?.documentId) setLocationId(String(t.location.documentId))
                }}>
                  <SelectTrigger className="h-10 text-lg w-44 border-black">
                    <span className={selectedTemplateId === '__none__' ? 'text-muted-foreground' : ''}>
                      {selectedTemplateId === '__none__'
                        ? 'Не выбрано'
                        : templates.find(t => t.documentId === selectedTemplateId)?.name}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="text-lg" position="popper">
                    <SelectItem value="__none__" className="text-lg text-muted-foreground">
                      Не выбрано
                    </SelectItem>
                    {templates.map(t => (
                      <SelectItem key={t.documentId} value={t.documentId!} className="text-lg">
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-4 text-lg">
            {/* Name */}
            <div className="space-y-2">
              <label className="font-medium">Введите название</label>
              <Input
                placeholder="Название мероприятия"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                className="text-lg h-11 border-black"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="font-medium">Добавьте описание</label>
              <Textarea
                placeholder="Описание"
                value={form.description}
                onChange={e => setField('description', e.target.value)}
                className="text-lg md:text-lg border-black resize-none min-h-20"
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
              <div className="flex flex-col gap-2 flex-1">
                <label className="font-medium">Кол-во мест</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Кол-во мест"
                  value={form.spots}
                  onChange={e => setField('spots', e.target.value)}
                  className="w-full text-lg h-11 border-black"
                />
              </div>
            </div>

            {/* Location + Save as template — create mode only */}
            {!isEdit && (
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="space-y-2 flex-1">
                  <label className="font-medium">Выберите локацию</label>
                  <Select value={locationId} onValueChange={setLocationId}>
                    <SelectTrigger className="border-black text-lg w-full" style={{ height: '44px' }}>
                      <SelectValue placeholder="Выберите локацию" />
                    </SelectTrigger>
                    <SelectContent className="text-lg" position="popper">
                      {locations.map(loc => (
                        <SelectItem key={loc.documentId} value={loc.documentId} className="text-lg">
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedTemplateId === '__none__' && (
                  <label className="flex items-center justify-between gap-2 h-11 px-3 cursor-pointer border border-black rounded-lg">
                    Сохранить как шаблон
                    <Checkbox
                      checked={saveAsTemplate}
                      onCheckedChange={v => setSaveAsTemplate(!!v)}
                      className="border-black"
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-between">
            <Button variant="outline" className="border-black text-lg h-11" onClick={() => router.push('/admin/events')}>
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid || isPending}
              className="text-lg h-11"
            >
              {isPending
                ? (isEdit ? 'Обновление...' : 'Создание...')
                : (isEdit ? 'Обновить' : 'Создать')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
