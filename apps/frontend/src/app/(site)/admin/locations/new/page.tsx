'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemDelete,
} from '@/shared/ui/file-upload'
import { TimePicker } from '@/shared/ui/time-picker'
import { ArrowLeft, UploadCloud, X } from 'lucide-react'

const SLOT_CONFIG = [
  { key: 'morning',   label: 'Утро',  min: '05:00', max: '13:00' },
  { key: 'afternoon', label: 'День',  min: '10:00', max: '19:00' },
  { key: 'evening',   label: 'Вечер', min: '16:00', max: '23:55' },
] as const

type SlotKey = typeof SLOT_CONFIG[number]['key']

export default function NewLocationPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    address: '',
    metro: '',
    description: '',
    lat: '',
    lng: '',
  })
  const [files, setFiles] = useState<File[]>([])
  const [timeSlots, setTimeSlots] = useState<Record<SlotKey, { start: string; end: string }>>({
    morning:   { start: '08:00', end: '11:00' },
    afternoon: { start: '12:00', end: '17:00' },
    evening:   { start: '18:30', end: '22:00' },
  })

  function setSlot(slot: SlotKey, field: 'start' | 'end', value: string) {
    setTimeSlots(prev => ({ ...prev, [slot]: { ...prev[slot], [field]: value } }))
  }

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (files.length < 1) return
    // TODO: save to backend
    router.push('/admin/locations')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/locations')}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Новая локация</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-8 items-start">

          {/* Левая колонка — загрузка фото */}
          <div className="w-80 shrink-0 space-y-2">
            <div className="flex items-baseline justify-between">
              <Label className="text-lg">Фотографии</Label>
              <span className="text-sm text-muted-foreground">{files.length} / 5</span>
            </div>
            <FileUpload
              accept="image/*"
              maxFiles={5}
              multiple
              onValueChange={setFiles}
            >
              <FileUploadDropzone className="border-black gap-3 py-8">
                <UploadCloud className="size-8 text-muted-foreground" />
                <div className="space-y-1 text-center">
                  <p className="text-[18px] font-medium">Перетащите изображения сюда</p>
                  <p className="text-[18px] text-muted-foreground">PNG, JPG, WEBP · до 10 МБ</p>
                </div>
                <FileUploadTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="border-black">
                    Выбрать файлы
                  </Button>
                </FileUploadTrigger>
              </FileUploadDropzone>
              <FileUploadList>
                {files.map((file) => (
                  <FileUploadItem key={`${file.name}-${file.size}`} value={file} className="border-black">
                    <FileUploadItemPreview className="size-12 rounded" />
                    <FileUploadItemMetadata size="sm" />
                    <FileUploadItemDelete asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 ml-auto shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-4" />
                      </Button>
                    </FileUploadItemDelete>
                  </FileUploadItem>
                ))}
              </FileUploadList>
            </FileUpload>
          </div>

          {/* Правая колонка — поля формы */}
          <div className="flex-1 max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg">Название</Label>
              <Input
                id="name"
                placeholder="Локация #4"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="border-black text-lg h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-lg">Адрес</Label>
              <Input
                id="address"
                placeholder="Москва, ул. Примерная, 1"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                className="border-black text-lg h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metro" className="text-lg">Метро</Label>
              <Input
                id="metro"
                placeholder="Площадь Революции"
                value={form.metro}
                onChange={(e) => set('metro', e.target.value)}
                className="border-black text-lg h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg">Описание</Label>
              <Textarea
                id="description"
                placeholder="Расскажите о локации..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={4}
                className="border-black text-[18px] placeholder:text-[19px] resize-none min-h-28"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="lat" className="text-lg">Широта</Label>
                <Input
                  id="lat"
                  placeholder="55.7558"
                  value={form.lat}
                  onChange={(e) => set('lat', e.target.value)}
                  className="border-black text-lg h-11"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="lng" className="text-lg">Долгота</Label>
                <Input
                  id="lng"
                  placeholder="37.6173"
                  value={form.lng}
                  onChange={(e) => set('lng', e.target.value)}
                  className="border-black text-lg h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-lg">Временные слоты</Label>
              <div className="space-y-3">
                {SLOT_CONFIG.map(slot => (
                  <div key={slot.key} className="flex items-center gap-3">
                    <span className="text-lg font-medium w-14 shrink-0">{slot.label}</span>
                    <TimePicker
                      value={timeSlots[slot.key].start}
                      onChange={v => setSlot(slot.key, 'start', v)}
                      min={slot.min}
                      max={slot.max}
                      className="border-black"
                    />
                    <span className="text-muted-foreground">—</span>
                    <TimePicker
                      value={timeSlots[slot.key].end}
                      onChange={v => setSlot(slot.key, 'end', v)}
                      min={slot.min}
                      max={slot.max}
                      className="border-black"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="text-lg h-11 px-6" disabled={files.length < 1}>
                Создать
              </Button>
              <Button type="button" variant="outline" className="text-lg h-11 border-black" onClick={() => router.push('/admin/locations')}>
                Отмена
              </Button>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}
