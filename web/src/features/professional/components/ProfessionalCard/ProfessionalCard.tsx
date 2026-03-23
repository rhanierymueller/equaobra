'use client'

import type { ProfessionalCardProps } from './ProfessionalCard.types'

import { PROFESSION_COLORS } from '@/src/types/professional.types'

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--color-star)">
        <polygon points="6,0.5 7.5,4.5 11.5,4.5 8.5,7 9.5,11 6,8.5 2.5,11 3.5,7 0.5,4.5 4.5,4.5" />
      </svg>
      <span className="text-xs font-semibold" style={{ color: 'var(--color-star)' }}>
        {rating.toFixed(1)}
      </span>
    </span>
  )
}

export function ProfessionalCard({
  professional: p,
  selected = false,
  compact = false,
  onClick,
}: ProfessionalCardProps) {
  const professionColor = PROFESSION_COLORS[p.profession]

  return (
    <button
      type="button"
      onClick={() => onClick?.(p)}
      className="w-full text-left transition-all duration-200"
      style={{
        background: selected ? 'var(--color-primary-alpha-10)' : 'var(--color-surface-overlay)',
        border: `1px solid ${selected ? 'var(--color-primary-alpha-50)' : 'var(--color-border-faint)'}`,
        borderRadius: 16,
        padding: compact ? '12px 14px' : '16px',
        cursor: 'pointer',
      }}
      aria-selected={selected}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm"
          style={{
            width: 44,
            height: 44,
            background: `${professionColor}22`,
            border: `2px solid ${professionColor}66`,
            color: professionColor,
          }}
        >
          {p.avatarUrl ? (
            <img
              src={p.avatarUrl}
              alt={p.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            p.avatarInitials
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white truncate">{p.name}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: `${professionColor}20`, color: professionColor }}
                >
                  {p.profession}
                </span>
                {p.available ? (
                  <span className="flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: 'var(--color-success)' }}
                    />
                    <span className="text-xs" style={{ color: 'var(--color-success)' }}>
                      Disponível
                    </span>
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                    Ocupado
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <StarRating rating={p.rating} />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {p.reviewCount} avaliações
              </span>
            </div>
          </div>

          {!compact && (
            <>
              <p
                className="text-xs mt-2 leading-relaxed line-clamp-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {p.bio}
              </p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M6 1a3.5 3.5 0 0 1 3.5 3.5C9.5 7.5 6 11 6 11S2.5 7.5 2.5 4.5A3.5 3.5 0 0 1 6 1z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <circle cx="6" cy="4.5" r="1.2" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    {p.distanceKm} km · {p.location.neighborhood}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                    {p.completedJobs} obras
                  </span>
                </div>

                <div className="flex gap-1 overflow-hidden">
                  {p.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: 'var(--color-border-subtle)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </button>
  )
}
