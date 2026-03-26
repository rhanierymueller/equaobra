'use client'

import { useEffect, useRef, useState } from 'react'

import { ALL_PROFESSIONS, PROFESSION_COLORS } from '@/src/types/professional.types'
import type { Profession, ProfessionalFilters } from '@/src/types/professional.types'

const BRAZIL_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-widest mb-3"
      style={{ color: 'rgba(224,123,42,0.8)' }}
    >
      {children}
    </p>
  )
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

interface SearchableDropdownProps {
  label: string
  placeholder: string
  value: string
  options: { value: string; label: string }[]
  onSelect: (value: string, label: string) => void
  onClear: () => void
  loading?: boolean
  disabled?: boolean
  active?: boolean
}

function SearchableDropdown({
  label,
  placeholder,
  value,
  options,
  onSelect,
  onClear,
  loading = false,
  disabled = false,
  active = false,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  useEffect(() => {
    if (open) {
      setSearch('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const filtered = options
    .filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 120)

  const isActive = active || !!value

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <SectionLabel>{label}</SectionLabel>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
        style={{
          background: open ? 'rgba(224,123,42,0.08)' : 'rgba(255,255,255,0.04)',
          border: `1.5px solid ${isActive || open ? 'rgba(224,123,42,0.5)' : 'rgba(255,255,255,0.08)'}`,
          color: isActive
            ? 'var(--color-primary)'
            : disabled
              ? 'rgba(245,240,235,0.25)'
              : 'rgba(245,240,235,0.55)',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span className="truncate text-left">{value || placeholder}</span>
        <span className="flex items-center gap-1.5 shrink-0 ml-2">
          {value && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation()
                onClear()
                setOpen(false)
              }}
              className="flex items-center justify-center rounded-full transition-colors"
              style={{
                width: 16,
                height: 16,
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(245,240,235,0.6)',
                cursor: 'pointer',
                fontSize: 10,
                lineHeight: 1,
              }}
            >
              ✕
            </span>
          )}
          <span
            style={{
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
              display: 'flex',
            }}
          >
            <ChevronDown />
          </span>
        </span>
      </button>

      {open && (
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
          <div className="p-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar..."
              className="w-full text-sm px-2.5 py-1.5 rounded-lg"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(245,240,235,0.9)',
                outline: 'none',
                fontSize: 12,
              }}
            />
          </div>

          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {loading ? (
              <p
                className="text-xs px-3 py-4 text-center"
                style={{ color: 'rgba(245,240,235,0.35)' }}
              >
                Carregando...
              </p>
            ) : filtered.length === 0 ? (
              <p
                className="text-xs px-3 py-4 text-center"
                style={{ color: 'rgba(245,240,235,0.35)' }}
              >
                Nenhum resultado
              </p>
            ) : (
              filtered.map((o) => {
                const selected = value === o.label
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      onSelect(o.value, o.label)
                      setOpen(false)
                    }}
                    className="w-full flex items-center justify-between text-left px-3 py-2 transition-all"
                    style={{
                      background: selected ? 'rgba(224,123,42,0.1)' : 'transparent',
                      color: selected ? 'var(--color-primary)' : 'rgba(245,240,235,0.7)',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      fontSize: 13,
                    }}
                  >
                    <span>{o.label}</span>
                    {selected && (
                      <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                        <path
                          d="M2 6.5l3.5 3.5 5.5-6"
                          stroke="var(--color-primary)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface StarSelectorProps {
  value: number
  onChange: (rating: number) => void
}

function StarSelector({ value, onChange }: StarSelectorProps) {
  return (
    <div className="flex gap-1" role="group" aria-label="Avaliação mínima">
      {[0, 3, 4, 4.5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
          style={{
            background: value === rating ? 'rgba(255,209,102,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${value === rating ? 'rgba(255,209,102,0.5)' : 'rgba(255,255,255,0.08)'}`,
            color: value === rating ? 'var(--color-star)' : 'rgba(245,240,235,0.45)',
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

  const label =
    selected.length === 0
      ? 'Todas as especialidades'
      : selected.length === 1
        ? selected[0]
        : `${selected.length} especialidades`

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <SectionLabel>Especialidade</SectionLabel>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-150"
        style={{
          background: open ? 'rgba(224,123,42,0.08)' : 'rgba(255,255,255,0.04)',
          border: `1.5px solid ${open || selected.length > 0 ? 'rgba(224,123,42,0.5)' : 'rgba(255,255,255,0.08)'}`,
          color: selected.length > 0 ? 'var(--color-primary)' : 'rgba(245,240,235,0.55)',
        }}
      >
        <span className="flex items-center gap-2">
          {selected.length > 0 && (
            <span className="flex gap-1">
              {selected.slice(0, 3).map((p) => (
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
        <span
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
            display: 'flex',
          }}
        >
          <ChevronDown />
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden"
          style={{
            zIndex: 200,
            background: 'rgba(18,17,15,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {ALL_PROFESSIONS.map((profession) => {
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
                <span
                  className="text-sm flex-1"
                  style={{ color: active ? color : 'rgba(245,240,235,0.65)' }}
                >
                  {profession}
                </span>
                {active && (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path
                      d="M2 6.5l3.5 3.5 5.5-6"
                      stroke={color}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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
  onSetState: (uf: string) => void
  onSetCity: (city: string) => void
  onStateCitiesChange: (cities: string[]) => void
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
  onSetState,
  onSetCity,
  onStateCitiesChange,
  onLocationSelect,
  onReset,
}: FilterBarProps) {
  const [cities, setCities] = useState<string[]>([])
  const [loadingCities, setLoadingCities] = useState(false)

  // Load cities from IBGE when state changes (including pre-load from geolocation)
  useEffect(() => {
    if (!filters.state) {
      setCities([])
      onStateCitiesChange([])
      return
    }
    setLoadingCities(true)
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${filters.state}/municipios`)
      .then((r) => r.json())
      .then((data: { nome: string }[]) => {
        const sorted = data.map((c) => c.nome).sort((a, b) => a.localeCompare(b, 'pt-BR'))
        setCities(sorted)
        onStateCitiesChange(sorted)
        setLoadingCities(false)
      })
      .catch(() => setLoadingCities(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.state])

  async function handleSelectCity(cityName: string) {
    onSetCity(cityName)
    // Geocode the city to update map center and reference location
    if (!onLocationSelect) return
    try {
      const stateName = BRAZIL_STATES.find((s) => s.uf === filters.state)?.name ?? ''
      const query = stateName ? `${cityName}, ${stateName}, Brasil` : `${cityName}, Brasil`
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`,
        { headers: { 'User-Agent': 'equaobra-app' } },
      )
      const data = await res.json()
      if (data[0]) {
        onLocationSelect(parseFloat(data[0].lat), parseFloat(data[0].lon))
      }
    } catch {
      // ignore geocoding errors
    }
  }

  const stateOptions = BRAZIL_STATES.map((s) => ({ value: s.uf, label: s.name }))
  const cityOptions = cities.map((c) => ({ value: c, label: c }))

  const selectedStateName = BRAZIL_STATES.find((s) => s.uf === filters.state)?.name ?? ''

  const hasActiveFilters =
    filters.professions.length > 0 ||
    filters.minRating > 0 ||
    filters.maxDistanceKm < 50 ||
    filters.availableOnly ||
    !!filters.state ||
    !!filters.city

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-white text-sm">Filtros</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {resultCount === 1
              ? '1 profissional encontrado'
              : `${resultCount} profissionais encontrados`}
          </p>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs px-2.5 py-1.5 rounded-lg transition-colors"
            style={{
              background: 'rgba(229,57,53,0.1)',
              color: 'var(--color-danger-light)',
              border: '1px solid rgba(229,57,53,0.2)',
            }}
          >
            Limpar
          </button>
        )}
      </div>

      {/* Estado */}
      <SearchableDropdown
        label="Estado"
        placeholder="Selecione o estado"
        value={selectedStateName}
        options={stateOptions}
        onSelect={(uf) => {
          onSetState(uf)
          onSetCity('')
        }}
        onClear={() => {
          onSetState('')
          onSetCity('')
          setCities([])
          onStateCitiesChange([])
        }}
        active={!!filters.state}
      />

      {/* Cidade */}
      <SearchableDropdown
        label="Cidade"
        placeholder={filters.state ? 'Selecione a cidade' : 'Selecione o estado primeiro'}
        value={filters.city}
        options={cityOptions}
        onSelect={(_, cityName) => handleSelectCity(cityName)}
        onClear={() => onSetCity('')}
        loading={loadingCities}
        disabled={!filters.state}
        active={!!filters.city}
      />

      {/* Distância máxima */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>Distância máxima</SectionLabel>
          <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
            {filters.maxDistanceKm < 50 ? `${filters.maxDistanceKm} km` : 'Qualquer'}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={50}
          value={filters.maxDistanceKm}
          onChange={(e) => onSetMaxDistance(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--color-primary) ${(filters.maxDistanceKm / 50) * 100}%, rgba(255,255,255,0.1) ${(filters.maxDistanceKm / 50) * 100}%)`,
            accentColor: 'var(--color-primary)',
          }}
          aria-label="Distância máxima em quilômetros"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>
            1 km
          </span>
          <span className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>
            50 km
          </span>
        </div>
      </div>

      {/* Avaliação mínima */}
      <div>
        <SectionLabel>Avaliação mínima</SectionLabel>
        <StarSelector value={filters.minRating} onChange={onSetMinRating} />
      </div>

      {/* Especialidade */}
      <ProfessionDropdown selected={filters.professions} onToggle={onToggleProfession} />

      {/* Disponível agora */}
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
            background: filters.availableOnly ? 'var(--color-success)' : 'rgba(255,255,255,0.1)',
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
    </div>
  )
}
