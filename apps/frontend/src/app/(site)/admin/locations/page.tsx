'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapPopup } from '@/shared/ui/map'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/shared/ui/dropdown-menu'
import {
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
} from 'lucide-react'
import { locations as mockLocations } from '@/shared/mocks/locations'
import type { Location } from '@/shared/mocks/locations'

const PAGE_SIZE_OPTIONS = [5, 10, 20]

export default function LocationsPage() {
  'use no memo'

  const router = useRouter()
  const [data, setData] = useState(mockLocations)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  function handleDelete(id: number) {
    setData((prev) => prev.filter((l) => l.id !== id))
  }

  const columns = useMemo<ColumnDef<Location>[]>(() => [
    {
      id: 'image',
      header: '',
      cell: ({ row }) => (
        <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
          <Image
            src={row.original.image}
            alt={row.original.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Название',
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'address',
      header: 'Адрес',
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'metro',
      header: 'Метро',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <span className="size-2 rounded-full bg-primary inline-block" />
          {getValue<string>()}
        </span>
      ),
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
              <DropdownMenuItem>Редактировать</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/admin/locations/${row.original.id}/events`)}>
                Мероприятия
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => handleDelete(row.original.id)}
              >
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [router])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
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
        row.original.address.toLowerCase().includes(q) ||
        row.original.metro.toLowerCase().includes(q)
      )
    },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()
  const ghostCount = pageSize - table.getRowModel().rows.length

  return (
    <div className="p-6 flex gap-6">
      <div className="flex-1 min-w-0 space-y-4">
      {/* Filters */}
      <div className="flex gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Поиск по названию, адресу, метро..."
            value={globalFilter}
            onChange={(e) => { setGlobalFilter(e.target.value); table.setPageIndex(0) }}
            className="pl-9 border-black text-lg h-11"
          />
        </div>
        <Button className="h-11 gap-2 text-lg" onClick={() => router.push('/admin/locations/new')}>
          <Plus className="size-4" />
          Локация
        </Button>
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

      {/* Pagination */}
      <div className="flex items-center justify-between text-lg text-muted-foreground">
        <span>
          {totalRows === 0
            ? 'Нет локаций'
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
      </div>{/* end flex-1 */}

      <div className="w-96 shrink-0 sticky top-20 bg-black rounded-xl p-px">
        <Map
          className="h-full w-full rounded-xl overflow-hidden"
          theme="light"
          interactive={false}
          viewport={{ center: [37.6173, 55.7558], zoom: 10 }}
        >
          {data.map((location) => (
            <LocationMarker key={location.id} location={location} />
          ))}
        </Map>
      </div>
    </div>
  )
}

function LocationMarker({ location }: { location: Location }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <MapMarker longitude={location.coords.lng} latitude={location.coords.lat} onClick={() => setOpen(p => !p)}>
        <MarkerContent>
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform">
            <MapPin className="size-4 fill-current" />
          </div>
        </MarkerContent>
        <MarkerTooltip>{location.name}</MarkerTooltip>
      </MapMarker>
      {open && (
        <MapPopup longitude={location.coords.lng} latitude={location.coords.lat} onClose={() => setOpen(false)} closeButton={false}>
          <div className="space-y-1 min-w-36">
            <p className="font-semibold text-foreground">{location.name}</p>
            <p className="text-xs text-muted-foreground">{location.address}</p>
            <p className="text-xs text-muted-foreground">{location.metro}</p>
          </div>
        </MapPopup>
      )}
    </>
  )
}
