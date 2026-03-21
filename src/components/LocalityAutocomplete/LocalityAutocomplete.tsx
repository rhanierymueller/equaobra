'use client'

import { useEffect, useRef, useState } from 'react'

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
}

interface LocalityAutocompleteProps {
  value: string
  onChange: (name: string) => void
  onSelect: (name: string, lat: number, lng: number) => void
  placeholder?: string
}

export function LocalityAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Bairro ou cidade...',
}: LocalityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleChange(text: string) {
    onChange(text)
    setSuggestions([])

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!text.trim() || text.length < 2) { setOpen(false); return }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5&countrycodes=br&accept-language=pt-BR`,
          { headers: { 'Accept-Language': 'pt-BR' } },
        )
        const data: NominatimResult[] = await res.json()
        setSuggestions(data)
        setOpen(data.length > 0)
      } catch {
        setSuggestions([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 350)
  }

  function handleSelect(result: NominatimResult) {
    // Use only the first segment (city name) so it matches professional location.city
    const short = result.display_name.split(',')[0].trim()
    onChange(short)
    onSelect(short, parseFloat(result.lat), parseFloat(result.lon))
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          width="13" height="13" viewBox="0 0 13 13" fill="none"
        >
          <path
            d="M6.5 1a4 4 0 0 1 4 4c0 3.5-4 7.5-4 7.5S2.5 8.5 2.5 5a4 4 0 0 1 4-4z"
            stroke="rgba(245,240,235,0.3)" strokeWidth="1.3"
          />
          <circle cx="6.5" cy="5" r="1.4" stroke="rgba(245,240,235,0.3)" strokeWidth="1.3" />
        </svg>

        {loading && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full animate-spin"
            style={{ border: '2px solid rgba(224,123,42,0.2)', borderTopColor: '#E07B2A' }}
          />
        )}

        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${value ? 'rgba(224,123,42,0.5)' : 'rgba(255,255,255,0.08)'}`,
            color: '#F5F0EB',
            paddingRight: loading ? 32 : 12,
          }}
          onBlur={e => {
            if (!value) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          }}
          autoComplete="off"
        />
      </div>

      {open && suggestions.length > 0 && (
        <div
          className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden"
          style={{
            zIndex: 200,
            background: 'rgba(18,17,15,0.99)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {suggestions.map((r, i) => {
            const parts = r.display_name.split(',')
            const main = parts[0].trim()
            const sub = parts.slice(1, 3).join(',').trim()
            return (
              <button
                key={i}
                type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(r) }}
                className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                style={{ borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              >
                <svg width="12" height="12" viewBox="0 0 13 13" fill="none" className="shrink-0 mt-0.5">
                  <path d="M6.5 1a4 4 0 0 1 4 4c0 3.5-4 7.5-4 7.5S2.5 8.5 2.5 5a4 4 0 0 1 4-4z"
                    stroke="#E07B2A" strokeWidth="1.3" />
                  <circle cx="6.5" cy="5" r="1.4" stroke="#E07B2A" strokeWidth="1.3" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#F5F0EB' }}>{main}</p>
                  {sub && <p className="text-xs truncate" style={{ color: 'rgba(245,240,235,0.4)' }}>{sub}</p>}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
