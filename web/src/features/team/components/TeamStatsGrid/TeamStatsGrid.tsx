'use client'

import { teamTotalCost } from '../../pages/TeamDetail/TeamDetail.types'

import type { Team } from '@/src/types/team.types'
import { formatDate } from '@/src/utils/date'

interface TeamStatsGridProps {
  team: Team
}

export function TeamStatsGrid({ team }: TeamStatsGridProps) {
  const acceptedMembers = team.members.filter((m) => m.status === 'accepted')
  const { total } = teamTotalCost({ ...team, members: acceptedMembers })

  return (
    <div
      className="grid grid-cols-2 gap-3 py-6"
      style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
    >
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'var(--color-surface-overlay)',
          border: '1px solid var(--color-border-faint)',
        }}
      >
        <p
          className="text-xs mb-2 uppercase tracking-wider"
          style={{ color: 'var(--color-text-faint)' }}
        >
          Início previsto
        </p>
        <p className="font-bold text-white" style={{ fontSize: 22, letterSpacing: '-0.02em' }}>
          {formatDate(team.scheduledStart)}
        </p>
      </div>

      <div
        className="rounded-2xl p-5"
        style={{
          background: 'var(--color-surface-overlay)',
          border: '1px solid var(--color-border-faint)',
        }}
      >
        <p
          className="text-xs mb-2 uppercase tracking-wider"
          style={{ color: 'var(--color-text-faint)' }}
        >
          Duração estimada
        </p>
        <p className="font-bold text-white" style={{ fontSize: 22, letterSpacing: '-0.02em' }}>
          {team.estimatedDays}
          <span className="text-sm font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
            dias
          </span>
        </p>
      </div>

      <div
        className="rounded-2xl p-5 col-span-2"
        style={{
          background: total != null ? 'rgba(255, 209, 102, 0.07)' : 'var(--color-surface-overlay)',
          border: `1px solid ${total != null ? 'rgba(255, 209, 102, 0.15)' : 'var(--color-border-faint)'}`,
        }}
      >
        <p
          className="text-xs mb-2 uppercase tracking-wider"
          style={{ color: 'var(--color-text-faint)' }}
        >
          Custo total estimado
        </p>
        <p
          className="font-bold"
          style={{
            fontSize: 28,
            letterSpacing: '-0.03em',
            color: total != null ? 'var(--color-star)' : 'var(--color-text-muted)',
          }}
        >
          {total != null ? `R$ ${total.toLocaleString('pt-BR')}` : 'A combinar'}
        </p>
        {total != null && (
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-faint)' }}>
            Baseado em {team.estimatedDays} dias × 8h/dia por membro
          </p>
        )}
      </div>
    </div>
  )
}
