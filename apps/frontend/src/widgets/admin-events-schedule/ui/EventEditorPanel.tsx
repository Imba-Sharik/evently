'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { TimePicker } from '@/shared/ui/time-picker'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { CalendarIcon, X } from 'lucide-react'
import type { FormState } from '@/entities/event/model/types'

function pluralDates(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return `${n} дата`
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} даты`
  return `${n} дат`
}

export function EventEditorPanel({
  form,
  setField,
  isPending,
  onSave,
  createDates,
  onCreateDatesChange,
}: {
  form: FormState
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void
  isPending: boolean
  onSave: () => void
  createDates: Date[]
  onCreateDatesChange: (dates: Date[]) => void
}) {
  const [multipleMode, setMultipleMode] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

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
      <h3 className="text-xl font-semibold">Новое мероприятие</h3>

      <div className="space-y-2">
        {/* Date picker */}
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

      <Button
        onClick={onSave}
        disabled={
          isPending ||
          !form.name.trim() ||
          !form.startTime ||
          !form.endTime ||
          !form.spots ||
          createDates.length === 0
        }
        className="h-10 text-lg"
      >
        {isPending ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </div>
  )
}
