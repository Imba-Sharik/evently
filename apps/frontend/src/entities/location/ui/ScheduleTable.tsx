import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

type Props = {
  schedule: Record<string, string[]>
  days: readonly string[]
  selectedDayKey?: string
  size?: 'sm' | 'lg'
}

export function ScheduleTable({ schedule, days, selectedDayKey = '', size = 'lg' }: Props) {
  const text = size === 'sm' ? 'text-sm' : 'text-lg'
  const pad = size === 'sm' ? 'py-1 px-2' : 'py-1 px-3'
  const pt = size === 'sm' ? 'pt-1' : 'pt-4'

  return (
    <div className={`bg-linear-to-br from-[#1F1F1F] to-[#666666] rounded-xl px-3 ${pt} pb-2 flex-1 border border-black`}>
      <Table className="border-separate border-spacing-0">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={`text-white ${text} ${pad} font-normal`}>День</TableHead>
            <TableHead className={`text-white ${text} ${pad} font-normal`}>Мероприятия</TableHead>
          </TableRow>
          <TableRow className="hover:bg-transparent">
            <TableHead colSpan={2} className="h-px p-0" style={{ backgroundColor: 'rgba(168,162,167,0.38)' }} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {days.map((day) => {
            const isSelected = day === selectedDayKey
            const cellBase = `${text} ${pad}`
            const cellColor = isSelected ? 'text-white' : 'text-white/90'
            const bg = isSelected ? { backgroundColor: '#498BD7' } : undefined
            const names = schedule[day] ?? []
            return (
              <TableRow key={day} className="border-0 hover:bg-transparent">
                <TableCell
                  className={`${cellBase} ${cellColor} font-bold rounded-l-lg border-y border-l border-transparent`}
                  style={bg}
                >
                  {day}
                </TableCell>
                <TableCell
                  className={`${cellBase} ${cellColor} rounded-r-lg border-y border-r border-transparent`}
                  style={bg}
                >
                  <div className="flex flex-col gap-0.5">
                    {names.map((n, i) => <span key={i}>{n}</span>)}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
