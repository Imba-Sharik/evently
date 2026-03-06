'use client'

import { useState, useCallback, useRef } from 'react'
import { Loader2, X } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { cn } from '@/shared/lib/utils'

export type AddressSuggestion = {
  label: string
  lat: number
  lng: number
}

type Props = {
  defaultValue?: AddressSuggestion
  onSelect: (suggestion: AddressSuggestion | null) => void
  placeholder?: string
  className?: string
}

export function AddressSearch({ defaultValue, onSelect, placeholder, className }: Props) {
  const [selected, setSelected] = useState<AddressSuggestion | null>(defaultValue ?? null)
  const [inputValue, setInputValue] = useState(defaultValue?.label ?? '')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    setInputValue(val)
    if (!val.trim()) {
      setSelected(null)
      onSelect(null)
      setSuggestions([])
      setOpen(false)
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 400)
  }

  function handleSelect(s: AddressSuggestion) {
    setSelected(s)
    setInputValue(s.label)
    onSelect(s)
    setOpen(false)
    setSuggestions([])
  }

  function handleBlur() {
    // delay to allow mousedown on suggestion to fire first
    setTimeout(() => {
      setInputValue(selected?.label ?? '')
      setOpen(false)
    }, 150)
  }

  function handleClear() {
    setSelected(null)
    setInputValue('')
    setSuggestions([])
    setOpen(false)
    onSelect(null)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(className, (selected || loading) && 'pr-9')}
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
        )}
        {!loading && selected && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
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
