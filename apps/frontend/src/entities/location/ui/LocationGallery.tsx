'use client'

import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/shared/ui/carousel'
import { Dialog, DialogPortal, DialogOverlay } from '@/shared/ui/dialog'
import { Dialog as DialogPrimitive, VisuallyHidden } from 'radix-ui'
import { useState, useEffect, useCallback } from 'react'

export function LocationGallery({ images, name }: { images: string[]; name: string }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [open, setOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    if (!api) return
    api.on('select', () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  const prev = useCallback(() =>
    setLightboxIndex(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() =>
    setLightboxIndex(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, prev, next])

  const openAt = (index: number) => {
    setLightboxIndex(index)
    setOpen(true)
  }

  if (!images.length) return null

  return (
    <>
      <div className="relative mt-12 rounded-2xl overflow-hidden bg-muted border border-black h-85">
        <Carousel setApi={setApi} className="h-full" opts={{ loop: true }}>
          <CarouselContent className="ml-0">
            {images.map((src, i) => (
              <CarouselItem key={i} className="pl-0">
                <div className="relative h-85">
                  <Image
                    src={src}
                    alt={`${name} — фото ${i + 1}`}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 640px"
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <button
            onClick={() => openAt(current)}
            className="absolute top-3 right-3 z-10 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/60"
            aria-label="Открыть фото"
          >
            <Maximize2 className="size-4" />
          </button>

          {images.length > 1 && (
            <>
              <CarouselPrevious
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white hover:text-white border-none rounded-full size-9 [&>svg]:size-5"
              />
              <CarouselNext
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white hover:text-white border-none rounded-full size-9 [&>svg]:size-5"
              />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); api?.scrollTo(i) }}
                    className={`h-1.5 rounded-full transition-all ${
                      i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                    }`}
                    aria-label={`Фото ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </Carousel>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/90" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center outline-none"
          >
            <VisuallyHidden.Root>
              <DialogPrimitive.Title>Галерея</DialogPrimitive.Title>
            </VisuallyHidden.Root>

            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 left-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <X className="size-5" />
            </button>

            <div className="relative flex max-h-[80vh] max-w-[90vw] items-center justify-center">
              <Image
                src={images[lightboxIndex]}
                alt={`${name} — фото ${lightboxIndex + 1}`}
                width={1200}
                height={800}
                className="max-h-[80vh] w-auto rounded-lg object-contain"
                sizes="90vw"
                priority
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}

            <p className="mt-4 text-sm text-white/80">
              {lightboxIndex + 1} / {images.length}
            </p>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  )
}
