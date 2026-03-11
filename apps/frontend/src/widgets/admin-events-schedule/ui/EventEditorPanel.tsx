'use client'

import { useState, useTransition } from 'react'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { TimePicker } from '@/shared/ui/time-picker'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { CalendarIcon, X, Trash2 } from 'lucide-react'
import { deleteEventAction } from '@/entities/event/actions'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import type { SelectedSlot, FormState } from './AdminEventsSchedule'

function pluralDates(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return `${n} дата`
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} даты`
  return `${n} дат`
}

export function EventEditorPanel({
  selectedSlot,
  form,
  setField,
  isPending,
  onClose,
  onSave,
  onDeleted,
  createDates,
  onCreateDatesChange,
}: {
  selectedSlot: SelectedSlot
  form: FormState
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void
  isPending: boolean
  onClose: () => void
  onSave: () => void
  onDeleted: () => void
  createDates: Date[]
  onCreateDatesChange: (dates: Date[]) => void
}) {
  const [isDeleting, startDeleteTransition] = useTransition()
  const [multipleMode, setMultipleMode] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  function handleDelete() {
    if (!selectedSlot.documentId) return
    startDeleteTransition(async () => {
      const result = await deleteEventAction(selectedSlot.documentId!)
      if ('error' in result) { alert(result.error); return }
      toast.success('Мероприятие удалено')
      onDeleted()
    })
  }

  function toggleMultipleMode() {
    if (multipleMode) {
      setMultipleMode(false)
      onCreateDatesChange(createDates.slice(0, 1))
    } else {
      setMultipleMode(true)
    }
  }

  const primaryDate = createDates[0]

  return (
    <div className="border border-black rounded-xl p-5 space-y-5 w-full xl:w-80 xl:shrink-0">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold">
            {selectedSlot.mode === 'create' ? 'Новое мероприятие' : 'Редактировать мероприятие'}
          </h3>
          {selectedSlot.mode === 'edit' && (
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: 18 }}>
              {format(parseISO(selectedSlot.date), 'd MMMM yyyy', { locale: ru })}
              {' · '}
              {selectedSlot.day}
            </p>
          )}
        </div>
        {selectedSlot.mode === 'edit' && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {/* Date picker — only in create mode */}
        {selectedSlot.mode === 'create' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-lg font-medium">Дата</label>
              <button
                type="button"
                onClick={toggleMultipleMode}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {multipleMode ? 'Одна дата' : '+ Несколько дат'}
              </button>
            </div>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-11 w-full justify-start gap-2 text-lg border-black font-normal">
                  <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
                  {multipleMode
                    ? createDates.length === 0 ? 'Выберите даты' : pluralDates(createDates.length)
                    : primaryDate ? format(primaryDate, 'd MMMM yyyy', { locale: ru }) : 'Выберите дату'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                {multipleMode ? (
                  <Calendar
                    mode="multiple"
                    selected={createDates}
                    onSelect={dates => onCreateDatesChange(dates ?? [])}
                    locale={ru}
                  />
                ) : (
                  <Calendar
                    mode="single"
                    selected={primaryDate}
                    onSelect={date => {
                      if (date) {
                        onCreateDatesChange([date])
                        setCalendarOpen(false)
                      }
                    }}
                    locale={ru}
                  />
                )}
              </PopoverContent>
            </Popover>

            {multipleMode && createDates.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {[...createDates]
                  .sort((a, b) => a.getTime() - b.getTime())
                  .map(d => (
                    <span
                      key={d.toISOString()}
                      className="inline-flex items-center gap-1 text-sm bg-secondary rounded-md px-2 py-0.5"
                    >
                      {format(d, 'd MMM', { locale: ru })}
                      <button
                        type="button"
                        onClick={() => onCreateDatesChange(createDates.filter(x => x.getTime() !== d.getTime()))}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>
        )}

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

        <div className="space-y-2 max-w-md">
          <label className="text-lg font-medium">Описание</label>
          <Textarea
            placeholder="Описание мероприятия"
            value={form.description}
            onChange={e => setField('description', e.target.value)}
            className="text-lg border-black resize-none min-h-20"
          />
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-lg font-medium">Начало</label>
            <TimePicker
              value={form.startTime}
              onChange={v => setField('startTime', v)}
              className="border-black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-lg font-medium">Конец</label>
            <TimePicker
              value={form.endTime}
              onChange={v => setField('endTime', v)}
              className="border-black"
            />
          </div>
        </div>

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
      </div>

      <div className="flex items-center justify-between">
        <Button
          onClick={onSave}
          disabled={!form.name.trim() || isPending || (selectedSlot.mode === 'create' && createDates.length === 0)}
          className="h-10 text-lg"
        >
          {isPending
            ? (selectedSlot.mode === 'edit' ? 'Обновление...' : 'Сохранение...')
            : (selectedSlot.mode === 'edit' ? 'Обновить' : 'Сохранить')}
        </Button>

        {selectedSlot.mode === 'edit' && selectedSlot.documentId && (
          <ConfirmDialog
            title="Удалить мероприятие?"
            description={`Это действие нельзя отменить. Мероприятие «${form.name}» будет удалено безвозвратно.`}
            onConfirm={handleDelete}
            trigger={
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={isPending || isDeleting}>
                <Trash2 className="size-5" />
              </Button>
            }
          />
        )}
      </div>
    </div>
  )
}
