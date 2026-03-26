'use client'

import Link from 'next/link'
import { useState } from 'react'

import { useTeams } from '../../hooks/useTeams'

import { BackButton } from '@/src/components/BackButton'
import { useCurrentUser } from '@/src/hooks/useCurrentUser'
import { useToast } from '@/src/hooks/useToast'
import { formatDate } from '@/src/utils/date'

export function MyInvitations() {
  const { user } = useCurrentUser()
  const { teams, respondToInvite } = useTeams()
  const toast = useToast()
  const [responding, setResponding] = useState<string | null>(null)

  if (!user) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'var(--color-background)' }}
      >
        <p className="text-white font-semibold">Você precisa estar logado</p>
        <Link
          href="/auth"
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          Entrar
        </Link>
      </div>
    )
  }

  const pendingInvitations = teams.filter((t) =>
    t.members.some((m) => m.professionalId === user.id && m.status === 'pending'),
  )

  async function handleRespond(teamId: string, action: 'accept' | 'reject') {
    setResponding(teamId + action)
    try {
      await respondToInvite(teamId, user!.id, action)
      if (action === 'accept') {
        toast.success('Convite aceito! Você agora faz parte da equipe.')
      } else {
        toast.info('Convite recusado.')
      }
    } catch {
      // error toast already shown by useTeams
    } finally {
      setResponding(null)
    }
  }

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh' }}>
      <div
        style={{
          height: 3,
          background:
            'linear-gradient(to right, var(--color-primary), var(--color-primary-alpha-30), transparent)',
        }}
      />

      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <BackButton />
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-faint)' }}>
          Convites
        </span>
        <div style={{ width: 40 }} />
      </div>

      <div
        style={{
          background: 'linear-gradient(180deg, var(--color-primary-alpha-10) 0%, transparent 100%)',
          borderBottom: '1px solid var(--color-border-subtle)',
          padding: '32px 24px 28px',
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--color-primary)' }}
          >
            Equipes
          </p>
          <h1
            className="font-bold text-white"
            style={{ fontSize: 36, lineHeight: 1, letterSpacing: '-0.03em' }}
          >
            Meus convites
          </h1>
          <p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>
            {pendingInvitations.length === 0
              ? 'Nenhum convite pendente'
              : `${pendingInvitations.length} convite${pendingInvitations.length !== 1 ? 's' : ''} aguardando resposta`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 40px' }}>
        {pendingInvitations.length === 0 ? (
          <div
            className="py-16 text-center rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex justify-center mb-4">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'var(--color-primary-alpha-10)',
                  border: '1px solid var(--color-primary-alpha-20)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
              Nenhum convite pendente
            </p>
            <p className="text-xs" style={{ color: 'rgba(245,240,235,0.25)' }}>
              Quando alguém te convidar para uma equipe, aparecerá aqui
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingInvitations.map((team) => {
              const myMember = team.members.find(
                (m) => m.professionalId === user.id && m.status === 'pending',
              )!
              const isAccepting = responding === team.id + 'accept'
              const isRejecting = responding === team.id + 'reject'
              const busy = isAccepting || isRejecting

              return (
                <div
                  key={team.id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'var(--color-surface-overlay)',
                    border: '1px solid var(--color-border-faint)',
                  }}
                >
                  <div
                    style={{
                      height: 2,
                      background:
                        'linear-gradient(to right, var(--color-primary), var(--color-primary-alpha-30), transparent)',
                    }}
                  />
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 12,
                          flexShrink: 0,
                          background: 'var(--color-primary-alpha-15)',
                          color: 'var(--color-primary)',
                          fontWeight: 800,
                          fontSize: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.5px solid var(--color-primary-alpha-30)',
                        }}
                      >
                        {team.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm leading-tight">{team.name}</p>
                        <p
                          className="text-xs mt-0.5 flex items-center gap-1"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          <svg width="9" height="9" viewBox="0 0 13 13" fill="none">
                            <path
                              d="M6.5 1a4 4 0 0 1 4 4c0 3.5-4 7.5-4 7.5S2.5 8.5 2.5 5a4 4 0 0 1 4-4z"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                          </svg>
                          {team.obraLocation}
                        </p>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                        style={{
                          background: 'rgba(255,209,102,0.1)',
                          color: 'var(--color-star)',
                          border: '1px solid rgba(255,209,102,0.25)',
                        }}
                      >
                        Pendente
                      </span>
                    </div>

                    <div className="flex gap-4 mb-3">
                      <div>
                        <p className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>
                          Início previsto
                        </p>
                        <p className="text-xs font-semibold text-white">
                          {formatDate(team.scheduledStart)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>
                          Duração estimada
                        </p>
                        <p className="text-xs font-semibold text-white">
                          {team.estimatedDays} dias
                        </p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>
                          Membros
                        </p>
                        <p className="text-xs font-semibold text-white">{team.members.length}</p>
                      </div>
                    </div>

                    {myMember.invitationMessage && (
                      <div
                        className="mb-3 px-3 py-2 rounded-xl text-xs leading-relaxed"
                        style={{
                          background: 'var(--color-primary-alpha-10)',
                          border: '1px solid var(--color-primary-alpha-20)',
                          color: 'rgba(245,240,235,0.7)',
                        }}
                      >
                        <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                          Mensagem:{' '}
                        </span>
                        {myMember.invitationMessage}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        disabled={busy}
                        onClick={() => handleRespond(team.id, 'reject')}
                        style={{
                          flex: 1,
                          padding: '9px 0',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 600,
                          background: 'rgba(255,107,107,0.08)',
                          color: 'var(--color-danger-light)',
                          border: '1px solid rgba(255,107,107,0.2)',
                          cursor: busy ? 'not-allowed' : 'pointer',
                          opacity: isRejecting ? 0.6 : 1,
                        }}
                      >
                        {isRejecting ? 'Recusando...' : 'Recusar'}
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => handleRespond(team.id, 'accept')}
                        style={{
                          flex: 2,
                          padding: '9px 0',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          background: isAccepting ? 'rgba(224,123,42,0.6)' : 'var(--color-primary)',
                          color: 'white',
                          border: 'none',
                          cursor: busy ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isAccepting ? 'Aceitando...' : 'Aceitar convite'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
