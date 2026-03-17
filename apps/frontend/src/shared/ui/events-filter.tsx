'use client'

import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Search, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/popover'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import type { Location } from '@/shared/api/generated/types/Location'

type DateFilter = 'today' | 'tomorrow' | 'custom'

type Props = {
  dateFilter: DateFilter
  customDate: Date | undefined
  search: string
  locations?: Location[]
  locationFilter?: string
  onDateChange: (filter: DateFilter, date?: Date) => void
  onSearchChange: (v: string) => void
  onLocationChange?: (v: string) => void
  className?: string
}

const Separator = () => (
  <div className="w-px mx-1 shrink-0" style={{ backgroundColor: '#CECECE', height: '24px' }} />
)

export function EventsFilter({
  dateFilter, customDate, search,
  locations, locationFilter,
  onDateChange, onSearchChange, onLocationChange,
  className,
}: Props) {
  return (
    <div className={`flex gap-1 items-center px-4 py-3 ${className ?? ''}`} style={{ border: '1px solid #CECECE', borderRadius: '40px' }}>
      <Button
        variant={dateFilter === 'today' ? 'default' : 'outline'}
        className="rounded-full text-lg"
        onClick={() => onDateChange('today', undefined)}
      >
        Сегодня
      </Button>
      <Button
        variant={dateFilter === 'tomorrow' ? 'default' : 'outline'}
        className="rounded-full text-lg"
        onClick={() => onDateChange('tomorrow', undefined)}
      >
        Завтра
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={dateFilter === 'custom' ? 'default' : 'outline'}
            className="rounded-full text-lg"
          >
            {dateFilter === 'custom' && customDate
              ? format(customDate, 'd MMMM', { locale: ru })
              : 'Выбрать дату'}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={customDate}
            onSelect={date => onDateChange('custom', date)}
            locale={ru}
          />
        </PopoverContent>
      </Popover>

      {locations && onLocationChange && (
        <>
          <Separator />
          <Select
            value={locationFilter || 'all'}
            onValueChange={v => onLocationChange(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="w-52 rounded-full text-lg">
              <SelectValue placeholder="Выберите локацию" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-lg">Все локации</SelectItem>
              {locations.map(loc => (
                <SelectItem key={loc.documentId} value={loc.documentId!} className="text-lg">
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Separator />
        </>
      )}

      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по мероприятиям"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9 pr-9 rounded-full text-lg"
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => onSearchChange('')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
