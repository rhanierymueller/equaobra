'use client'

import type { TeamMember } from '@/src/types/team.types'

interface PendingInvitesListProps {
  members: TeamMember[]
  onCancel: (member: TeamMember) => void
}

export function PendingInvitesList({ members, onCancel }: PendingInvitesListProps) {
  if (members.length === 0) return null

  return (
    <div className="pt-6 pb-6" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
      <h2 className="font-bold text-white mb-1" style={{ fontSize: 20, letterSpacing: '-0.02em' }}>
        Convites pendentes
      </h2>
      <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
        {members.length}{' '}
        {members.length === 1 ? 'convite aguardando resposta' : 'convites aguardando resposta'}
      </p>

      <div className="flex flex-col gap-3">
        {members.map((m) => (
          <div
            key={m.professionalId}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,209,102,0.04)',
              border: '1px solid rgba(255,209,102,0.15)',
            }}
          >
            <div
              style={{
                height: 2,
                background:
                  'linear-gradient(to right, rgba(255,209,102,0.6), rgba(255,209,102,0.1), transparent)',
              }}
            />
            <div className="flex items-center gap-3 px-4 py-3">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: 'rgba(255,209,102,0.1)',
                  border: '1.5px solid rgba(255,209,102,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-star)',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {m.avatarInitials}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{m.name}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {m.profession}
                </p>
                {m.invitationMessage && (
                  <p
                    className="text-xs mt-1 italic"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    &ldquo;{m.invitationMessage}&rdquo;
                  </p>
                )}
              </div>

              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mr-2"
                style={{
                  background: 'rgba(255,209,102,0.1)',
                  color: 'var(--color-star)',
                  border: '1px solid rgba(255,209,102,0.25)',
                }}
              >
                Pendente
              </span>

              <button
                onClick={() => onCancel(m)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80 shrink-0"
                style={{
                  background: 'var(--color-danger-alpha-08)',
                  color: 'var(--color-danger-light)',
                  border: '1px solid var(--color-danger-alpha-15)',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
