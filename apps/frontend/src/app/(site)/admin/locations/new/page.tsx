'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/button'
import { ArrowLeft } from 'lucide-react'
import { LocationForm } from '@/features/location-form'

export default function NewLocationPage() {
  const router = useRouter()
  return (
    <div className="p-4 xl:p-6 2xl:max-w-6xl 2xl:mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/locations')}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Новая локация</h1>
      </div>
      <LocationForm mode="create" />
    </div>
  )
}
