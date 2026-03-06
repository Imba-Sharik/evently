'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { AddressSearch } from '@/shared/ui/address-search'
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
import { Map, MapMarker, MarkerContent } from '@/shared/ui/map'
import { UploadCloud, X } from 'lucide-react'
import { createLocationAction, updateLocationAction } from '@/entities/location/actions'
import type { Location } from '@/shared/api/generated/types/Location'

const schema = z.object({
  name:        z.string().min(1, 'Обязательное поле'),
  address:     z.string().min(1, 'Обязательное поле'),
  metro:       z.string().optional(),
  description: z.string().optional(),
  lat:         z.string().optional(),
  lng:         z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const SLOT_CONFIG = [
  { key: 'morning',   label: 'Утро',  min: '05:00', max: '13:00' },
  { key: 'afternoon', label: 'День',  min: '10:00', max: '19:00' },
  { key: 'evening',   label: 'Вечер', min: '16:00', max: '23:55' },
] as const

type SlotKey = typeof SLOT_CONFIG[number]['key']

type Props =
  | { mode: 'create' }
  | { mode: 'edit'; documentId: string; initialData: Location }

export function LocationForm(props: Props) {
  const isEdit = props.mode === 'edit'
  const initial = isEdit ? props.initialData : undefined

  const router = useRouter()

  // Existing gallery items (edit mode) — user can remove any
  const [keptImages, setKeptImages] = useState<{ id: number; url: string }[]>(() => {
    if (!isEdit || !initial) return []
    const gallery = initial.gallery ?? []
    return gallery
      .filter(g => g.id != null && g.url)
      .map(g => ({ id: Number(g.id), url: g.url! }))
  })

  const [newFiles, setNewFiles] = useState<File[]>([])

  const [timeSlots, setTimeSlots] = useState<Record<SlotKey, { start: string; end: string }>>(() => {
    const ts = initial?.timeSlots as Record<SlotKey, { start: string; end: string }> | null | undefined
    return {
      morning:   ts?.morning   ?? { start: '08:00', end: '11:00' },
      afternoon: ts?.afternoon ?? { start: '12:00', end: '17:00' },
      evening:   ts?.evening   ?? { start: '18:30', end: '22:00' },
    }
  })

  const [serverError, setServerError] = useState<string | null>(null)
  const [mapKey, setMapKey] = useState(0)

  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:        initial?.name        ?? '',
      address:     initial?.address     ?? '',
      metro:       initial?.metro       ?? '',
      description: initial?.description ?? '',
      lat:         initial?.lat != null  ? String(initial.lat)  : '',
      lng:         initial?.lng != null  ? String(initial.lng)  : '',
    },
  })

  const addressValue = useWatch({ control, name: 'address' })
  const latValue = useWatch({ control, name: 'lat' })
  const lngValue = useWatch({ control, name: 'lng' })

  function setSlot(slot: SlotKey, field: 'start' | 'end', value: string) {
    setTimeSlots(prev => ({ ...prev, [slot]: { ...prev[slot], [field]: value } }))
  }

  function removeKept(id: number) {
    setKeptImages(prev => prev.filter(img => img.id !== id))
  }

  async function onSubmit(values: FormValues) {
    if (!isEdit && newFiles.length < 1 && keptImages.length < 1) return
    setServerError(null)

    const fd = new FormData()
    fd.append('name', values.name)
    fd.append('address', values.address)
    if (values.metro)       fd.append('metro', values.metro)
    if (values.description) fd.append('description', values.description)
    if (values.lat)         fd.append('lat', values.lat)
    if (values.lng)         fd.append('lng', values.lng)
    fd.append('timeSlots', JSON.stringify(timeSlots))
    newFiles.forEach(f => fd.append('files', f))
    keptImages.forEach(img => fd.append('keepGalleryId', String(img.id)))

    const result = isEdit
      ? await updateLocationAction(props.documentId, fd)
      : await createLocationAction(fd)

    if ('error' in result) {
      setServerError(result.error)
    } else {
      router.push('/admin/locations')
    }
  }

  const requirePhoto = !isEdit
  const canSubmit = requirePhoto ? newFiles.length > 0 : true

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-8 items-start">

        {/* Левая колонка — фотографии */}
        <div className="w-80 shrink-0 space-y-3">
          <div className="flex items-baseline justify-between">
            <Label className="text-lg">Фотографии</Label>
            <span className="text-sm text-muted-foreground">
              {keptImages.length + newFiles.length} / 5
            </span>
          </div>

          {/* Существующие фото (edit mode) */}
          {keptImages.length > 0 && (
            <div className="space-y-2">
              {keptImages.map(img => (
                <div key={img.id} className="flex items-center gap-2 border border-black rounded-md p-2">
                  <Image
                    src={img.url}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 rounded object-cover shrink-0"
                  />
                  <span className="flex-1 text-sm text-muted-foreground truncate">
                    {img.url.split('/').pop()}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeKept(img.id)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Новые файлы */}
          <FileUpload
            accept="image/*"
            maxFiles={5 - keptImages.length}
            multiple
            onValueChange={setNewFiles}
          >
            <FileUploadDropzone className="border-black gap-3 py-8">
              <UploadCloud className="size-8 text-muted-foreground" />
              <div className="space-y-1 text-center">
                <p className="text-[18px] font-medium">
                  {isEdit ? 'Добавить новые фото' : 'Перетащите изображения сюда'}
                </p>
                <p className="text-[18px] text-muted-foreground">PNG, JPG, WEBP · до 10 МБ</p>
              </div>
              <FileUploadTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="border-black">
                  Выбрать файлы
                </Button>
              </FileUploadTrigger>
            </FileUploadDropzone>
            <FileUploadList>
              {newFiles.map((file) => (
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

        {/* Правая колонка — поля */}
        <div className="flex-1 max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-lg">Название</Label>
            <Input id="name" placeholder="Локация #4" className="border-black text-lg h-11" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-lg">Адрес</Label>
            <AddressSearch
              value={addressValue}
              onChange={v => setValue('address', v, { shouldValidate: true })}
              onSelect={s => {
                setValue('address', s.label, { shouldValidate: true })
                setValue('lat', String(s.lat))
                setValue('lng', String(s.lng))
                setMapKey(k => k + 1)
              }}
              placeholder="Москва, ул. Примерная, 1"
              className="border-black text-lg h-11"
            />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
            {(() => {
              const lat = parseFloat(latValue ?? '')
              const lng = parseFloat(lngValue ?? '')
              const valid = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
              if (!valid) return null
              return (
                <Map
                  key={mapKey}
                  className="h-48 w-full rounded-xl overflow-hidden border border-black mt-2"
                  theme="light"
                  viewport={{ center: [lng, lat], zoom: 14 }}
                >
                  <MapMarker
                    longitude={lng}
                    latitude={lat}
                    draggable
                    onDragEnd={({ lng: newLng, lat: newLat }) => {
                      setValue('lat', String(newLat))
                      setValue('lng', String(newLng))
                    }}
                  >
                    <MarkerContent>
                      <div className="size-4 rounded-full bg-primary border-2 border-white shadow-lg cursor-grab" />
                    </MarkerContent>
                  </MapMarker>
                </Map>
              )
            })()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="metro" className="text-lg">Метро</Label>
            <Input id="metro" placeholder="Площадь Революции" className="border-black text-lg h-11" {...register('metro')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-lg">Описание</Label>
            <Textarea
              id="description"
              placeholder="Расскажите о локации..."
              rows={4}
              className="border-black text-[18px] placeholder:text-[19px] resize-none min-h-28"
              {...register('description')}
            />
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

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="text-lg h-11 px-6" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="text-lg h-11 border-black"
              onClick={() => router.push('/admin/locations')}
            >
              Отмена
            </Button>
          </div>
        </div>

      </div>
    </form>
  )
}
