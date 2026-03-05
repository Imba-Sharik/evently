'use client'

import { useOptimistic, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar } from '@/shared/ui/calendar'

export function LocationCalendar({ selectedDate }: { selectedDate: Date }) {
  const [optimisticDate, setOptimisticDate] = useOptimistic(selectedDate)
  const [, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  function handleSelect(date: Date | undefined) {
    if (!date) return
    startTransition(() => {
      setOptimisticDate(date)
      router.replace(`${pathname}?date=${format(date, 'yyyy-MM-dd')}`, { scroll: false })
    })
  }

  return (
    <div className="rounded-2xl overflow-hidden w-full flex-1 bg-linear-to-br from-[#1F1F1F] to-[#666666] border border-black **:data-[selected-single=true]:bg-[#498BD7] **:data-[slot=button]:text-lg">
      <Calendar
        mode="single"
        selected={optimisticDate}
        onSelect={handleSelect}
        locale={ru}
        className="p-3 bg-transparent text-white [--cell-size:--spacing(8)]"
        classNames={{
          root: 'w-full',
          caption_label: 'font-medium select-none text-lg',
          weekday: 'flex-1 rounded-md text-base font-normal text-white/60 select-none',
          outside: 'text-white/30 aria-selected:text-white/30',
        }}
      />
    </div>
  )
}
