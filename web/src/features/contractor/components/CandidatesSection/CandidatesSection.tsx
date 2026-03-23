'use client'

import { useState } from 'react'

import { useInterests } from '@/src/features/opportunity/hooks/useInterests'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-widest mb-3"
      style={{ color: 'var(--color-text-dim)' }}
    >
      {children}
    </p>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill={i <= Math.round(rating) ? 'var(--color-primary)' : 'var(--color-border-subtle)'}
        >
          <polygon points="6,1 7.5,4.5 11,4.8 8.5,7 9.3,10.5 6,8.5 2.7,10.5 3.5,7 1,4.8 4.5,4.5" />
        </svg>
      ))}
      <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>
        {rating.toFixed(1)}
      </span>
    </span>
  )
}

interface CandidatesSectionProps {
  contractorId: string
  onChat: (candidateId: string, name: string, initials: string, profession?: string) => void
}

export function CandidatesSection({ contractorId, onChat }: CandidatesSectionProps) {
  const { interests } = useInterests(contractorId)
  const [filterProfession, setFilterProfession] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterRating, setFilterRating] = useState<number>(0)

  const availableProfessions = Array.from(
    new Set(interests.map((i) => i.profession).filter(Boolean)),
  ) as string[]

  const filtered = interests.filter((i) => {
    if (filterProfession && i.profession !== filterProfession) return false
    if (filterLocation && !i.location?.toLowerCase().includes(filterLocation.toLowerCase()))
      return false
    if (filterRating > 0 && (i.rating ?? 0) < filterRating) return false
    return true
  })

  const selectStyle: React.CSSProperties = {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '8px 12px',
    fontSize: 12,
    outline: 'none',
  }

  return (
    <div className="py-5 pb-12">
      <SectionTitle>Candidatos ({interests.length})</SectionTitle>

      {interests.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-10 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(245,240,235,0.2)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="mb-3"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p className="text-sm font-medium" style={{ color: 'rgba(245,240,235,0.3)' }}>
            Nenhum candidato ainda
          </p>
          <p
            className="text-xs mt-1 text-center"
            style={{ color: 'rgba(245,240,235,0.2)', maxWidth: 240 }}
          >
            Profissionais que demonstrarem interesse aparecem aqui
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex gap-2">
              <select
                value={filterProfession}
                onChange={(e) => setFilterProfession(e.target.value)}
                style={{
                  ...selectStyle,
                  color: filterProfession ? 'var(--color-text)' : 'var(--color-text-dim)',
                }}
              >
                <option value="" style={{ background: '#1A1916' }}>
                  Todas as profissões
                </option>
                {availableProfessions.map((p) => (
                  <option key={p} value={p} style={{ background: '#1A1916' }}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(Number(e.target.value))}
                style={{
                  ...selectStyle,
                  color: filterRating > 0 ? 'var(--color-text)' : 'var(--color-text-dim)',
                }}
              >
                <option value={0} style={{ background: '#1A1916' }}>
                  Qualquer avaliação
                </option>
                <option value={4} style={{ background: '#1A1916' }}>
                  4+ estrelas
                </option>
                <option value={4.5} style={{ background: '#1A1916' }}>
                  4.5+ estrelas
                </option>
              </select>
            </div>
            <input
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              placeholder="Filtrar por localidade..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--color-text)',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: 'rgba(245,240,235,0.3)' }}>
              Nenhum candidato corresponde ao filtro
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: 'var(--color-primary-alpha-10)',
                      color: 'var(--color-primary)',
                      fontWeight: 800,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid var(--color-primary-alpha-30)',
                    }}
                  >
                    {candidate.professionalInitials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {candidate.professionalName}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      {candidate.profession && (
                        <span className="text-xs" style={{ color: 'rgba(245,240,235,0.45)' }}>
                          {candidate.profession}
                        </span>
                      )}
                      {candidate.location && (
                        <span
                          className="text-xs flex items-center gap-0.5"
                          style={{ color: 'rgba(245,240,235,0.3)' }}
                        >
                          <svg width="8" height="8" viewBox="0 0 13 13" fill="none">
                            <path
                              d="M6.5 1a4 4 0 0 1 4 4c0 3.5-4 7.5-4 7.5S2.5 8.5 2.5 5a4 4 0 0 1 4-4z"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                          </svg>
                          {candidate.location}
                        </span>
                      )}
                    </div>
                    {candidate.rating != null && (
                      <div className="mt-1">
                        <Stars rating={candidate.rating} />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      onChat(
                        candidate.professionalId,
                        candidate.professionalName,
                        candidate.professionalInitials,
                        candidate.profession,
                      )
                    }
                    style={{
                      padding: '7px 14px',
                      borderRadius: 10,
                      flexShrink: 0,
                      background: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    Falar
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
