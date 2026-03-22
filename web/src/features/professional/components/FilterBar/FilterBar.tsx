'use client'

import { useEffect, useRef, useState } from 'react'
import { ALL_PROFESSIONS, PROFESSION_COLORS } from '@/src/types/professional.types'
import { LocalityAutocomplete } from '@/src/components/LocalityAutocomplete'
import type { Profession, ProfessionalFilters } from '@/src/types/professional.types'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(224,123,42,0.8)' }}>
      {children}
    </p>
  )
}

interface StarSelectorProps {
  value: number
  onChange: (rating: number) => void
}

function StarSelector({ value, onChange }: StarSelectorProps) {
  return (
    <div className="flex gap-1" role="group" aria-label="Avaliação mínima">
      {[0, 3, 4, 4.5].map(rating => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
          style={{
            background: value === rating ? 'rgba(255,209,102,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${value === rating ? 'rgba(255,209,102,0.5)' : 'rgba(255,255,255,0.08)'}`,
            color: value === rating ? '#FFD166' : 'rgba(245,240,235,0.45)',
          }}
          aria-pressed={value === rating}
        >
          {rating === 0 ? 'Todos' : `${rating}+★`}
        </button>
      ))}
    </div>
  )
}

interface ProfessionDropdownProps {
  selected: Profession[]
  onToggle: (p: Profession) => void
}

function ProfessionDropdown({ selected, onToggle }: ProfessionDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const label = selected.length === 0
    ? 'Todas as especialidades'
    : selected.length === 1
      ? selected[0]
      : `${selected.length} especialidades`

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(224,123,42,0.8)' }}>
        Especialidade
      </p>

      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
        style={{
          background: open ? 'rgba(224,123,42,0.08)' : 'rgba(255,255,255,0.04)',
          border: `1.5px solid ${open || selected.length > 0 ? 'rgba(224,123,42,0.5)' : 'rgba(255,255,255,0.08)'}`,
          color: selected.length > 0 ? '#E07B2A' : 'rgba(245,240,235,0.55)',
        }}
      >
        <span className="flex items-center gap-2">
          {selected.length > 0 && (
            <span className="flex gap-1">
              {selected.slice(0, 3).map(p => (
                <span
                  key={p}
                  className="w-2 h-2 rounded-full"
                  style={{ background: PROFESSION_COLORS[p] }}
                />
              ))}
            </span>
          )}
          {label}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden"
          style={{
            zIndex: 50,
            background: 'rgba(18,17,15,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {ALL_PROFESSIONS.map(profession => {
            const active = selected.includes(profession)
            const color = PROFESSION_COLORS[profession]
            return (
              <button
                key={profession}
                type="button"
                onClick={() => onToggle(profession)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all duration-100"
                style={{
                  background: active ? `${color}14` : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
                aria-pressed={active}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-sm flex-1" style={{ color: active ? color : 'rgba(245,240,235,0.65)' }}>
                  {profession}
                </span>
                {active && (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5l3.5 3.5 5.5-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface FilterBarProps {
  filters: ProfessionalFilters
  resultCount: number
  onToggleProfession: (p: Profession) => void
  onSetMinRating: (r: number) => void
  onSetMaxDistance: (km: number) => void
  onSetAvailableOnly: (only: boolean) => void
  onSetLocality: (locality: string) => void
  onLocationSelect?: (lat: number, lng: number) => void
  onReset: () => void
}

export function FilterBar({
  filters,
  resultCount,
  onToggleProfession,
  onSetMinRating,
  onSetMaxDistance,
  onSetAvailableOnly,
  onSetLocality,
  onLocationSelect,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.professions.length > 0 ||
    filters.minRating > 0 ||
    filters.maxDistanceKm < 50 ||
    filters.availableOnly ||
    filters.locality.length > 0

  return (
    <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-white text-sm">Filtros</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,235,0.4)' }}>
            {resultCount} profissional{resultCount !== 1 ? 'is' : ''} encontrado{resultCount !== 1 ? 's' : ''}
          </p>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs px-2.5 py-1.5 rounded-lg transition-colors"
            style={{
              background: 'rgba(229,57,53,0.1)',
              color: '#FF6B6B',
              border: '1px solid rgba(229,57,53,0.2)',
            }}
          >
            Limpar
          </button>
        )}
      </div>

            <div>
        <SectionLabel>Localidade</SectionLabel>
        <LocalityAutocomplete
          value={filters.locality}
          onChange={onSetLocality}
          onSelect={(name, lat, lng) => {
            onSetLocality(name)
            onLocationSelect?.(lat, lng)
          }}
        />
      </div>

            <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'rgba(245,240,235,0.7)' }}>
          Disponível agora
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={filters.availableOnly}
          onClick={() => onSetAvailableOnly(!filters.availableOnly)}
          className="relative transition-all duration-200"
          style={{
            width: 40,
            height: 22,
            borderRadius: 11,
            background: filters.availableOnly ? '#4CAF50' : 'rgba(255,255,255,0.1)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span
            className="absolute top-1 transition-all duration-200"
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: 'white',
              left: filters.availableOnly ? 22 : 4,
            }}
          />
        </button>
      </div>

            <div>
        <SectionLabel>Avaliação mínima</SectionLabel>
        <StarSelector value={filters.minRating} onChange={onSetMinRating} />
      </div>

            <div>
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>Distância máxima</SectionLabel>
          <span className="text-xs font-semibold" style={{ color: '#E07B2A' }}>
            {filters.maxDistanceKm < 50 ? `${filters.maxDistanceKm} km` : 'Qualquer'}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={50}
          value={filters.maxDistanceKm}
          onChange={e => onSetMaxDistance(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #E07B2A ${(filters.maxDistanceKm / 50) * 100}%, rgba(255,255,255,0.1) ${(filters.maxDistanceKm / 50) * 100}%)`,
            accentColor: '#E07B2A',
          }}
          aria-label="Distância máxima em quilômetros"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>1 km</span>
          <span className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>50 km</span>
        </div>
      </div>

            <ProfessionDropdown
        selected={filters.professions}
        onToggle={onToggleProfession}
      />
    </div>
  )
}
