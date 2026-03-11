'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import dynamic from 'next/dynamic'
import type { AddressValue } from '@/features/address-input'
const AddressInput = dynamic(
  () => import('@/features/address-input').then(m => m.AddressInput),
  { ssr: false }
)
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
} from '@/shared/ui/file-upload'
import { GripVertical, UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'
import { createLocationAction, updateLocationAction } from '@/entities/location/actions'
import type { Location } from '@/shared/api/generated/types/Location'

const schema = z.object({
  name:        z.string().min(1, 'Обязательное поле'),
  metro:       z.string().min(1, 'Обязательное поле'),
  description: z.string().min(1, 'Обязательное поле'),
})

type FormValues = z.infer<typeof schema>

type Props =
  | { mode: 'create' }
  | { mode: 'edit'; documentId: string; initialData: Location }

type KeptImage = { kind: 'kept'; id: number; url: string }
type NewImage  = { kind: 'new'; file: File }
type ImageItem = KeptImage | NewImage

export function LocationForm(props: Props) {
  const isEdit = props.mode === 'edit'
  const initial = isEdit ? props.initialData : undefined

  const router = useRouter()

  const [images, setImages] = useState<ImageItem[]>(() => {
    if (!isEdit || !initial) return []
    const gallery = initial.gallery ?? []
    return gallery
      .filter(g => g.id != null && g.url)
      .map(g => ({ kind: 'kept' as const, id: Number(g.id), url: g.url! }))
  })

  const [addressValue, setAddressValue] = useState<AddressValue | undefined>(() => {
    if (!isEdit || !initial?.lat || !initial?.lng) return undefined
    return {
      provider: 'mapbox',
      feature_type: 'address',
      place_id: initial.place_id ?? '',
      city_place_id: initial.city_place_id ?? '',
      lat: initial.lat,
      lng: initial.lng,
      name: initial.address ?? '',
      city_name: initial.city_name ?? '',
      country_code: initial.country_code ?? '',
    }
  })

  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      name:        initial?.name        ?? '',
      metro:       initial?.metro       ?? '',
      description: initial?.description ?? '',
    },
  })

  // Sync FileUpload controlled value with our images state
  function handleFileChange(files: File[]) {
    setImages(prev => {
      const prevNew = prev.filter(i => i.kind === 'new') as NewImage[]
      const added = files
        .filter(f => !prevNew.some(e => e.file.name === f.name && e.file.size === f.size))
        .map(f => ({ kind: 'new' as const, file: f }))
      const removed = prevNew.filter(e =>
        !files.some(f => f.name === e.file.name && f.size === e.file.size)
      )
      return [
        ...prev.filter(i => {
          if (i.kind === 'kept') return true
          return !removed.some(r => r.file.name === (i as NewImage).file.name && r.file.size === (i as NewImage).file.size)
        }),
        ...added,
      ]
    })
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // Drag and drop
  const dragIndex = useRef<number | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)

  function onDragStart(index: number) {
    dragIndex.current = index
    setDragging(index)
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    const from = dragIndex.current
    if (from === null || from === index) return
    setImages(prev => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(index, 0, item)
      return next
    })
    dragIndex.current = index
    setDragging(index)
  }

  function onDragEnd() {
    dragIndex.current = null
    setDragging(null)
  }

  async function onSubmit(values: FormValues) {
    if (!isEdit && images.length < 1) return
    setServerError(null)

    const fd = new FormData()
    fd.append('name', values.name)
    fd.append('metro', values.metro)
    fd.append('description', values.description)
    if (addressValue) {
      fd.append('address', addressValue.name)
      fd.append('lat', String(addressValue.lat))
      fd.append('lng', String(addressValue.lng))
      fd.append('place_id', addressValue.place_id)
      fd.append('city_place_id', addressValue.city_place_id)
      fd.append('city_name', addressValue.city_name)
      fd.append('country_code', addressValue.country_code)
    }
    // Preserve order: send in the order images are arranged
    images.forEach(item => {
      if (item.kind === 'kept') fd.append('keepGalleryId', String(item.id))
      else fd.append('files', item.file)
    })

    const result = isEdit
      ? await updateLocationAction(props.documentId, fd)
      : await createLocationAction(fd)

    if ('error' in result) {
      setServerError(result.error)
    } else {
      toast.success(isEdit ? 'Локация обновлена' : 'Локация создана')
      router.push('/admin/locations')
    }
  }

  const newFiles = images.filter(i => i.kind === 'new').map(i => (i as NewImage).file)
  const requirePhoto = !isEdit
  const canSubmit = isValid && !!addressValue && (requirePhoto ? images.length > 0 : true)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col xl:flex-row gap-8 items-start">

        {/* Левая колонка — фотографии */}
        <div className="w-full xl:w-80 xl:shrink-0 space-y-3">
          <div className="flex items-baseline justify-between">
            <Label className="text-lg">Фотографии</Label>
            <span className="text-lg text-muted-foreground">
              {images.length} / 5
            </span>
          </div>

          {/* Unified draggable image list */}
          {images.length > 0 && (
            <div className="space-y-2">
              {images.map((item, index) => (
                <div
                  key={item.kind === 'kept' ? `kept-${item.id}` : `new-${item.file.name}-${item.file.size}`}
                  draggable
                  onDragStart={() => onDragStart(index)}
                  onDragOver={e => onDragOver(e, index)}
                  onDragEnd={onDragEnd}
                  className={`flex items-center gap-2 border rounded-md p-2 cursor-grab active:cursor-grabbing transition-opacity ${dragging === index ? 'opacity-40' : 'opacity-100'} ${index === 0 ? 'border-primary' : 'border-black'}`}
                >
                  <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                  {item.kind === 'kept' ? (
                    <Image
                      src={item.url}
                      alt=""
                      width={48}
                      height={48}
                      className="size-12 rounded object-cover shrink-0"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={URL.createObjectURL(item.file)}
                      alt=""
                      className="size-12 rounded object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-lg text-muted-foreground truncate block">
                      {item.kind === 'kept' ? item.url.split('/').pop() : item.file.name}
                    </span>
                    {index === 0 && (
                      <span className="text-xs font-medium text-primary">Обложка</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeImage(index)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* FileUpload dropzone for adding new files */}
          {images.length < 5 && (
            <FileUpload
              accept="image/*"
              maxFiles={5 - images.length}
              multiple
              value={newFiles}
              onValueChange={handleFileChange}
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
            </FileUpload>
          )}
        </div>

        {/* Правая колонка — поля */}
        <div className="w-full xl:flex-1 xl:max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-lg">Название</Label>
            <Input id="name" placeholder="Локация #4" className="border-black text-lg h-11" {...register('name')} />
            {errors.name && <p className="text-lg text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-lg">Адрес</Label>
            <AddressInput
              accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
              language="ru"
              placeholder="Москва, ул. Примерная, 1"
              value={addressValue}
              onChange={setAddressValue}
              onClear={() => setAddressValue(undefined)}
              mapClassName="h-48 w-full rounded-xl overflow-hidden border border-black"
            />
            {!addressValue && <p className="text-lg text-muted-foreground">Выберите адрес из списка</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="metro" className="text-lg">Метро</Label>
            <Input id="metro" placeholder="Площадь Революции" className="border-black text-lg h-11" {...register('metro')} />
            {errors.metro && <p className="text-lg text-destructive">{errors.metro.message}</p>}
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
            {errors.description && <p className="text-lg text-destructive">{errors.description.message}</p>}
          </div>

          {serverError && <p className="text-lg text-destructive">{serverError}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="text-lg h-11 px-6" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? (isEdit ? 'Обновление...' : 'Создание...') : isEdit ? 'Обновить' : 'Создать'}
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
