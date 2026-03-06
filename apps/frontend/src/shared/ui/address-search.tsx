'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/utils'

export type AddressSuggestion = {
  label: string
  lat: number
  lng: number
}

type Props = {
  value: string
  onChange: (value: string) => void
  onSelect: (suggestion: AddressSuggestion) => void
  placeholder?: string
  className?: string
}

export function AddressSearch({ value, onChange, onSelect, placeholder, className }: Props) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&accept-language=ru&countrycodes=ru`,
        { headers: { 'Accept': 'application/json', 'User-Agent': 'evently-app' } }
      )
      const data = await res.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items: AddressSuggestion[] = (data ?? []).map((f: any) => ({
        label: f.display_name,
        lat: parseFloat(f.lat),
        lng: parseFloat(f.lon),
      }))
      setSuggestions(items)
      setOpen(items.length > 0)
    } catch {
      setSuggestions([])
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 400)
  }

  function handleSelect(s: AddressSuggestion) {
    onChange(s.label)
    onSelect(s)
    setOpen(false)
    setSuggestions([])
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={cn(className)}
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border border-black bg-background shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-3 py-2.5 text-[18px] cursor-pointer hover:bg-muted border-b border-border last:border-0"
              onMouseDown={() => handleSelect(s)}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
