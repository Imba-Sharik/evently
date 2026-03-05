'use client'

import { useMemo, useState } from 'react'
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
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/shared/ui/dropdown-menu'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react'

type Manager = {
  id: string
  name: string
  email: string
  since: string
}

const mockManagers: Manager[] = [
  { id: '1', name: 'Алексей Петров', email: 'petrov@evently.ru', since: '1 января 2025' },
  { id: '2', name: 'Мария Соколова', email: 'sokolova@evently.ru', since: '15 февраля 2025' },
  { id: '3', name: 'Дмитрий Козлов', email: 'kozlov@evently.ru', since: '3 марта 2025' },
  { id: '4', name: 'Елена Новикова', email: 'novikova@evently.ru', since: '20 апреля 2025' },
  { id: '5', name: 'Сергей Фёдоров', email: 'fedorov@evently.ru', since: '5 июня 2025' },
  { id: '6', name: 'Анна Смирнова', email: 'smirnova@evently.ru', since: '11 августа 2025' },
]

const MONTHS: Record<string, number> = {
  января: 1, февраля: 2, марта: 3, апреля: 4, мая: 5, июня: 6,
  июля: 7, августа: 8, сентября: 9, октября: 10, ноября: 11, декабря: 12,
}

function parseDate(d: string) {
  const [day, month, year] = d.split(' ')
  return Number(year) * 10000 + (MONTHS[month] ?? 0) * 100 + Number(day)
}

const PAGE_SIZE_OPTIONS = [5, 10, 20]

export default function TeamPage() {
  'use no memo'

  const [managers] = useState(mockManagers)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'since', desc: false }])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<Manager>[]>(() => [
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
    {
      accessorKey: 'since',
      header: ({ column }) => (
        <span
          className="flex items-center gap-1 cursor-pointer select-none"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          В команде с
          {column.getIsSorted() === 'asc'
            ? <ArrowUp className="size-4" />
            : <ArrowDown className="size-4" />}
        </span>
      ),
      sortingFn: (a, b) => parseDate(a.original.since) - parseDate(b.original.since),
    },
  ], [])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: managers,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
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
        row.original.email.toLowerCase().includes(q)
      )
    },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()
  const ghostCount = pageSize - table.getRowModel().rows.length

  return (
    <div className="p-6 space-y-6">

      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Поиск по имени или email..."
              value={globalFilter}
              onChange={(e) => { setGlobalFilter(e.target.value); table.setPageIndex(0) }}
              className="pl-9 border-black text-lg h-11"
            />
          </div>
        </div>

        {/* Table */}
        <div className="border border-black rounded-md overflow-hidden">
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
        <div className="flex items-center justify-between text-lg text-muted-foreground">
          <span>
            {totalRows === 0
              ? 'Нет менеджеров'
              : `${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, totalRows)} из ${totalRows}`}
          </span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Строк на странице</span>
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
    </div>
  )
}
