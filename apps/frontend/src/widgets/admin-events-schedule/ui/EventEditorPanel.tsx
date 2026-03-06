'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { TimePicker } from '@/shared/ui/time-picker'
import { X, Trash2 } from 'lucide-react'
import { deleteEventAction } from '@/entities/event/actions'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import type { SelectedSlot, SlotMeta, FormState } from './AdminEventsSchedule'

export function EventEditorPanel({
  selectedSlot,
  activeSlotMeta,
  slotDate,
  form,
  setField,
  isPending,
  onClose,
  onSave,
  onDeleted,
}: {
  selectedSlot: SelectedSlot
  activeSlotMeta: SlotMeta
  slotDate: string
  form: FormState
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void
  isPending: boolean
  onClose: () => void
  onSave: () => void
  onDeleted: () => void
}) {
  const [isDeleting, startDeleteTransition] = useTransition()

  function handleDelete() {
    if (!selectedSlot.documentId) return
    startDeleteTransition(async () => {
      const result = await deleteEventAction(selectedSlot.documentId!)
      if ('error' in result) { alert(result.error); return }
      toast.success('Мероприятие удалено')
      onDeleted()
    })
  }

  return (
    <div className="border border-black rounded-xl p-5 space-y-5 w-full md:w-80 md:shrink-0">
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
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="space-y-2">
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
        <Button onClick={onSave} disabled={!form.name.trim() || isPending} className="h-10 text-lg">
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
