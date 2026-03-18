'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
} from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { deleteEventAction } from '@/entities/event/actions'
import { splitDescription } from '@/entities/event/lib/split-description'
import type { Event } from '@/shared/api/generated/types/Event'

const PAGE_SIZE = 4

function formatTime(t?: string) {
  return t ? t.slice(0, 5) : ''
}

function TemplateActions({
  template,
  router,
}: {
  template: Event
  router: ReturnType<typeof useRouter>
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 shrink-0">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="text-lg">
          <DropdownMenuItem
            onClick={() =>
              router.push(`/admin/events/new?template=${template.documentId}`)
            }
          >
            Создать из шаблона
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(`/admin/events/${template.documentId}/edit`)
            }
          >
            Редактировать
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onSelect={(e) => {
              e.preventDefault()
              setDropdownOpen(false)
              setConfirmOpen(true)
            }}
          >
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Удалить шаблон?"
        description={`Шаблон «${template.name}» будет удалён безвозвратно.`}
        onConfirm={async () => {
          if (!template.documentId) return
          const result = await deleteEventAction(String(template.documentId))
          if ('error' in result) {
            toast.error(result.error)
            return
          }
          toast.success('Шаблон удалён')
          router.refresh()
        }}
      />
    </>
  )
}

type Props = {
  templates: Event[]
}

export function AdminTemplatesList({ templates }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    if (!search) return templates
    const q = search.toLowerCase()
    return templates.filter(
      (t) =>
        (t.name ?? '').toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q)
    )
  }, [templates, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safeePage = Math.min(page, pageCount - 1)
  const paged = filtered.slice(
    safeePage * PAGE_SIZE,
    (safeePage + 1) * PAGE_SIZE
  )

  return (
    <div className="space-y-4 p-5 section-border">

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          placeholder="Поиск по шаблонам..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          className="pl-9 border-black text-lg h-11"
        />
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {paged.length === 0 && (
          <p className="text-lg text-muted-foreground py-8 text-center">
            {templates.length === 0
              ? 'Нет сохранённых шаблонов'
              : 'Ничего не найдено'}
          </p>
        )}
        {paged.map((template) => {
          const [bold, rest] = splitDescription(template.description ?? '')
          const timeRange = `${formatTime(template.startTime)} – ${formatTime(template.endTime)}`

          return (
            <Card
              key={String(template.documentId)}
              className="rounded-2xl px-5 py-4 gap-0 border-black"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-xl leading-tight">
                    {template.name}
                  </p>
                  <p className="text-lg text-muted-foreground mt-0.5">
                    {template.totalSpots} мест · {timeRange}
                    {template.location?.name &&
                      ` · ${template.location.name}`}
                  </p>
                </div>
                <TemplateActions template={template} router={router} />
              </div>

              {(bold || rest) && (
                <p className="text-lg mt-2 leading-relaxed line-clamp-3">
                  <strong>{bold}</strong>
                  {rest}
                </p>
              )}
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-lg text-muted-foreground">
          <span>
            {safeePage * PAGE_SIZE + 1}–
            {Math.min((safeePage + 1) * PAGE_SIZE, filtered.length)} из{' '}
            {filtered.length}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8 border-black"
              onClick={() => setPage((p) => p - 1)}
              disabled={safeePage === 0}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8 border-black"
              onClick={() => setPage((p) => p + 1)}
              disabled={safeePage >= pageCount - 1}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
