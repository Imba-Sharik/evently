'use client'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { formatDateLong } from '@/shared/lib/date'
import type { BookingState } from '../model/types'

type Props = {
  booking: BookingState | null
  locationName: string
  bookingName: string
  bookingEmail: string
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onSubmit: () => void
  onCancel: () => void
}

export function BookingDialog({
  booking,
  locationName,
  bookingName,
  bookingEmail,
  onNameChange,
  onEmailChange,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <Dialog open={!!booking} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-sm border-black">
        <DialogHeader>
          <DialogTitle className="text-2xl">Записаться на мероприятие</DialogTitle>
          <Separator />
        </DialogHeader>
        {booking && (
          <div className="flex flex-col gap-2.5">
            <div className="flex gap-2 text-2xl">
              <span className="text-muted-foreground">Название</span>
              <span className="font-semibold">{booking.event.name}</span>
            </div>
            <div className="flex gap-2 text-2xl">
              <span className="text-muted-foreground">Место:</span>
              <span className="font-semibold">{locationName}</span>
            </div>
            <div className="flex gap-2 text-2xl">
              <span className="text-muted-foreground">Дата:</span>
              <span className="font-semibold">{formatDateLong(booking.date)}</span>
            </div>
            <div className="flex gap-2 text-2xl">
              <span className="text-muted-foreground">Время:</span>
              <span className="font-semibold">{booking.event.timeRange}</span>
            </div>
            <div className="flex gap-2 text-2xl">
              <span className="text-muted-foreground">Количество мест:</span>
              <span className="font-semibold">{booking.quantity}</span>
            </div>

            <Separator className="my-1" />

            <div className="flex flex-col gap-2">
              <Label htmlFor="booking-name" className="text-2xl">Как вас зовут?*</Label>
              <Input
                id="booking-name"
                className="text-2xl h-14 border-black"
                placeholder="Иванов Иван Иванович"
                value={bookingName}
                onChange={(e) => onNameChange(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="booking-email" className="text-2xl">Ваш Email*</Label>
              <Input
                id="booking-email"
                type="email"
                className="text-2xl h-14 border-black"
                placeholder="email@gmail.com"
                value={bookingEmail}
                onChange={(e) => onEmailChange(e.target.value)}
              />
            </div>
          </div>
        )}
        <DialogFooter className="mt-2 flex-row">
          <Button className="text-xl flex-1 h-12" onClick={onSubmit}>Отправить</Button>
          <Button variant="outline" className="text-xl flex-1 h-12 border-black" onClick={onCancel}>Отменить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
