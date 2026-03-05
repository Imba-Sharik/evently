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
import { ArrowLeft, UploadCloud, X } from 'lucide-react'

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
