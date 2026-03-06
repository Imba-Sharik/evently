'use client'

import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ArrowDown, ArrowUp, ChevronDown, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, MoreHorizontal, Search } from 'lucide-react'
import type { BookingRecord, BookingStatus } from '../model/types'

const STATUS_LABELS: Record<BookingStatus | 'all', string> = {
  all: 'Все статусы',
  new: 'Новая',
  confirmed: 'Подтверждена',
  cancelled: 'Отменена',
}

const STATUS_CLASSES: Record<BookingStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const PAGE_SIZE_OPTIONS = [5, 10, 20]

type Props = {
  bookings: BookingRecord[]
  onStatusChange: (id: string, status: BookingStatus) => void
  onDelete: (id: string) => void
  locationFilter: string
  onLocationFilterChange: (value: string) => void
}

export function BookingsTable({ bookings, onStatusChange, onDelete, locationFilter, onLocationFilterChange }: Props) {
  'use no memo'

  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')

  const locations = Array.from(new Set(bookings.map((b) => b.locationName)))

  const columns = useMemo<ColumnDef<BookingRecord>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Имя',
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
    },
    { accessorKey: 'eventName', header: 'Мероприятие' },
    { accessorKey: 'locationName', header: 'Локация' },
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
      sortingFn: (a, b) => {
        const MONTHS: Record<string, number> = {
          января: 1, февраля: 2, марта: 3, апреля: 4, мая: 5, июня: 6,
          июля: 7, августа: 8, сентября: 9, октября: 10, ноября: 11, декабря: 12,
        }
        const parse = (d: string) => {
          const [day, month, year] = d.split(' ')
          return Number(year) * 10000 + (MONTHS[month] ?? 0) * 100 + Number(day)
        }
        return parse(a.original.date) - parse(b.original.date)
      },
    },
    { accessorKey: 'timeRange', header: 'Время' },
    {
      accessorKey: 'quantity',
      header: () => <span className="flex justify-center w-full">Мест</span>,
      cell: ({ getValue }) => <span className="flex justify-center">{getValue<number>()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      cell: ({ getValue }) => {
        const status = getValue<BookingStatus>()
        return (
          <span className={`px-2 py-0.5 rounded-full text-lg font-medium ${STATUS_CLASSES[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-lg">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Изменить статус</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="text-lg">
                  <DropdownMenuItem onClick={() => onStatusChange(row.original.id, 'new')}>Новая</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(row.original.id, 'confirmed')}>Подтверждена</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(row.original.id, 'cancelled')}>Отменена</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete(row.original.id)}
              >
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [onStatusChange, onDelete])

  const filteredData = useMemo(
    () => bookings.filter((b) => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter
      const matchesLocation = locationFilter === 'all' || b.locationName === locationFilter
      return matchesStatus && matchesLocation
    }),
    [bookings, statusFilter, locationFilter]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
    globalFilterFn: (row, _colId, value) => {
      const q = value.toLowerCase()
      return (
        row.original.name.toLowerCase().includes(q) ||
        row.original.email.toLowerCase().includes(q) ||
        row.original.eventName.toLowerCase().includes(q)
      )
    },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()
  const ghostCount = pageSize - table.getRowModel().rows.length

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Поиск по имени, email, мероприятию..."
            value={globalFilter}
            onChange={(e) => { setGlobalFilter(e.target.value); table.setPageIndex(0) }}
            className="pl-9 border-black text-lg h-11"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-black text-lg h-11 gap-2">
              {STATUS_LABELS[statusFilter]}
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-lg">
            <DropdownMenuRadioGroup
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v as BookingStatus | 'all'); table.setPageIndex(0) }}
            >
              <DropdownMenuRadioItem value="all">Все статусы</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="new">Новая</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="confirmed">Подтверждена</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="cancelled">Отменена</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

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
              onValueChange={(v) => { onLocationFilterChange(v); table.setPageIndex(0) }}
            >
              <DropdownMenuRadioItem value="all">Все локации</DropdownMenuRadioItem>
              {locations.map((loc) => (
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
                  <TableCell key={cell.id}>
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

      {/* Pagination footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-lg text-muted-foreground">
        <span>
          {totalRows === 0
            ? 'Нет заявок'
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
