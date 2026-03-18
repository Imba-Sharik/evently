'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
} from 'lucide-react'
import type { Event } from '@/shared/api/generated/types/Event'
import { deleteEventAction } from '@/entities/event/actions'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'

const MONTHS_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${parseInt(day)} ${MONTHS_RU[parseInt(month) - 1]} ${year}`
}

function formatTime(t?: string): string {
  return t ? t.slice(0, 5) : '—'
}

const PAGE_SIZE_OPTIONS = [5, 10, 20]

type LocationOption = { documentId: string; name: string }

function EventActions({ event, router }: { event: Event; router: ReturnType<typeof useRouter> }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  return (
    <div className="flex justify-end">
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="text-lg">
          <DropdownMenuItem onClick={() => router.push(`/admin/events/${event.documentId}/edit`)}>
            Редактировать
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onSelect={e => { e.preventDefault(); setDropdownOpen(false); setConfirmOpen(true) }}
          >
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Удалить мероприятие?"
        description={`Мероприятие «${event.name}» будет удалено безвозвратно.`}
        onConfirm={async () => {
          if (!event.documentId) return
          const result = await deleteEventAction(String(event.documentId))
          if ('error' in result) { toast.error(result.error); return }
          toast.success('Мероприятие удалено')
          router.refresh()
        }}
      />
    </div>
  )
}

type Props = {
  data: Event[]
  locations: LocationOption[]
}

export function AdminEventsTable({ data, locations }: Props) {
  'use no memo'

  const router = useRouter()
  const searchParams = useSearchParams()
  const successShown = useRef(false)

  useEffect(() => {
    if (successShown.current) return
    const msg = searchParams.get('success')
    if (!msg) return
    successShown.current = true
    toast.success(msg)
    const url = new URL(window.location.href)
    url.searchParams.delete('success')
    router.replace(url.pathname + (url.search || ''))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: false }])
  const [globalFilter, setGlobalFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')

  const locationNames = useMemo(
    () => Array.from(new Set(data.map((e) => e.location?.name ?? '').filter(Boolean))),
    [data]
  )

  const columns = useMemo<ColumnDef<Event>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Название',
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <span
          className="flex items-center gap-1 cursor-pointer select-none"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Дата
          {column.getIsSorted() === 'asc'
            ? <ArrowUp className="size-4" />
            : <ArrowDown className="size-4" />}
        </span>
      ),
      cell: ({ getValue }) => {
        const v = getValue<string>()
        return v ? formatDate(v) : '—'
      },
      sortingFn: (a, b) => {
        const da = a.original.date ?? ''
        const db = b.original.date ?? ''
        return da < db ? -1 : da > db ? 1 : 0
      },
    },
    {
      id: 'time',
      header: 'Время',
      cell: ({ row }) => (
        <span>
          {formatTime(row.original.startTime)} – {formatTime(row.original.endTime)}
        </span>
      ),
    },
    {
      id: 'locationName',
      header: 'Локация',
      accessorFn: (row) => row.location?.name ?? '—',
      cell: ({ getValue }) => (
        <span>{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'totalSpots',
      header: () => <span className="flex justify-center w-full">Мест</span>,
      cell: ({ getValue }) => <span className="flex justify-center">{getValue<number>()}</span>,
    },
    {
      id: 'bookingsCount',
      header: () => <span className="flex justify-center w-full">Заявок</span>,
      accessorFn: (row) => row.bookings?.length ?? 0,
      cell: ({ getValue }) => <span className="flex justify-center">{getValue<number>()}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => <EventActions event={row.original} router={router} />,
    },
  ], [router])

  const filteredData = useMemo(() => {
    return data.filter((e) => {
      const matchesLocation = locationFilter === 'all' || (e.location?.name ?? '') === locationFilter
      const matchesDate = !dateFilter || e.date === dateFilter
      return matchesLocation && matchesDate
    })
  }, [data, locationFilter, dateFilter])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
    globalFilterFn: (row, _colId, value) => {
      const q = value.toLowerCase()
      return (
        (row.original.name ?? '').toLowerCase().includes(q) ||
        (row.original.location?.name ?? '').toLowerCase().includes(q)
      )
    },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()
  const ghostCount = pageSize - table.getRowModel().rows.length

  return (
    <div className="space-y-4 p-5 section-border">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Поиск по названию, локации..."
            value={globalFilter}
            onChange={(e) => { setGlobalFilter(e.target.value); table.setPageIndex(0) }}
            className="pl-9 border-black text-lg h-11"
          />
        </div>

        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); table.setPageIndex(0) }}
          className="border-black text-lg h-11 w-44"
        />
        {dateFilter && (
          <Button
            variant="outline"
            className="border-black text-lg h-11"
            onClick={() => { setDateFilter(''); table.setPageIndex(0) }}
          >
            Сбросить дату
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-black text-lg h-11 gap-2">
              {locationFilter === 'all' ? 'Все локации' : locationFilter}
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-lg">
            <DropdownMenuRadioGroup
              value={locationFilter}
              onValueChange={(v) => { setLocationFilter(v); table.setPageIndex(0) }}
            >
              <DropdownMenuRadioItem value="all">Все локации</DropdownMenuRadioItem>
              {locationNames.map((loc) => (
                <DropdownMenuRadioItem key={loc} value={loc}>{loc}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>

      {/* Table */}
      <div className="border border-black rounded-md overflow-x-auto">
        <Table className="text-lg">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-1.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {Array.from({ length: ghostCount }).map((_, i) => (
              <TableRow key={`ghost-${i}`} className="pointer-events-none select-none">
                <TableCell colSpan={columns.length}>&nbsp;</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-lg text-muted-foreground">
        <span>
          {totalRows === 0
            ? 'Нет мероприятий'
            : `${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, totalRows)} из ${totalRows}`}
        </span>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Строк на странице</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 w-16 border-black gap-1 text-lg px-2">
                  {pageSize}
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-lg">
                <DropdownMenuRadioGroup
                  value={String(pageSize)}
                  onValueChange={(v) => { table.setPageSize(Number(v)); table.setPageIndex(0) }}
                >
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <DropdownMenuRadioItem key={s} value={String(s)}>{s}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <span>Страница {pageIndex + 1} из {pageCount}</span>

          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="size-8 border-black"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronFirst className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-8 border-black"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-8 border-black"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-8 border-black"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronLast className="size-4" />
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}
