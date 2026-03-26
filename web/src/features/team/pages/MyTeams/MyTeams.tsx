'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { BackButton } from '@/src/components/BackButton'
import { ConfirmDialog } from '@/src/components/ConfirmDialog'
import { useTeams } from '@/src/features/team/hooks/useTeams'
import { useCurrentUser } from '@/src/hooks/useCurrentUser'
import type { Team } from '@/src/types/team.types'
import { formatDate } from '@/src/utils/date'

function teamCost(team: Team): string {
  const allHaveRate = team.members.every((m) => m.hourlyRate != null)
  if (!allHaveRate || team.members.length === 0) return 'A combinar'
  const total = team.members.reduce((sum, m) => sum + m.hourlyRate! * 8 * team.estimatedDays, 0)
  return `R$ ${total.toLocaleString('pt-BR')}`
}

interface TeamCardProps {
  team: Team
  isOwner: boolean
  onDelete: (id: string) => void
}

function TeamCard({ team, isOwner, onDelete }: TeamCardProps) {
  const leader = team.members.find((m) => m.isLeader && m.status === 'accepted')
  const cost = teamCost(team)
  const hasCost = cost !== 'A combinar'

  return (
    <div
      style={{
        background: 'var(--color-surface-overlay)',
        border: '1px solid var(--color-border-faint)',
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Accent top bar */}
      <div
        style={{
          height: 3,
          background: team.active
            ? 'linear-gradient(to right, var(--color-primary), var(--color-primary-alpha-30), transparent)'
            : 'linear-gradient(to right, var(--color-text-dim), transparent)',
        }}
      />

      {/* Card header zone */}
      <div
        style={{
          padding: '20px 20px 16px',
          background: 'linear-gradient(180deg, var(--color-primary-alpha-10) 0%, transparent 100%)',
          borderBottom: '1px solid var(--color-border-faint)',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="font-bold leading-tight"
                style={{
                  fontSize: 18,
                  letterSpacing: '-0.02em',
                  color: team.active ? 'white' : 'var(--color-text-muted)',
                }}
              >
                {team.name}
              </h3>
              {!team.active && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'var(--color-text-dim)',
                  }}
                >
                  Inativa
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <svg
                width="11"
                height="11"
                viewBox="0 0 13 13"
                fill="none"
                style={{ color: 'var(--color-primary)', flexShrink: 0 }}
              >
                <path
                  d="M6.5 1a4 4 0 0 1 4 4c0 3.5-4 7.5-4 7.5S2.5 8.5 2.5 5a4 4 0 0 1 4-4z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {team.obraLocation}
              </span>
            </div>
          </div>

          {/* Cost badge */}
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 10,
              background: hasCost ? 'rgba(255, 209, 102, 0.1)' : 'var(--color-surface-overlay)',
              border: `1px solid ${hasCost ? 'rgba(255, 209, 102, 0.2)' : 'var(--color-border-faint)'}`,
              textAlign: 'right',
              flexShrink: 0,
            }}
          >
            <p
              className="font-bold"
              style={{
                fontSize: 15,
                color: hasCost ? 'var(--color-star)' : 'var(--color-text-muted)',
                lineHeight: 1,
              }}
            >
              {cost}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-faint)' }}>
              estimado
            </p>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 20px 20px' }}>
        {/* Meta row */}
        <div
          className="flex items-center gap-2 mb-5"
          style={{ color: 'var(--color-text-muted)', fontSize: 12 }}
        >
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{
              background: 'var(--color-surface-overlay)',
              border: '1px solid var(--color-border-faint)',
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDate(team.scheduledStart)}
          </span>
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{
              background: 'var(--color-surface-overlay)',
              border: '1px solid var(--color-border-faint)',
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {team.estimatedDays}d
          </span>
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{
              background: 'var(--color-surface-overlay)',
              border: '1px solid var(--color-border-faint)',
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {team.members.filter((m) => m.status === 'accepted').length}{' '}
            {team.members.filter((m) => m.status === 'accepted').length === 1
              ? 'membro'
              : 'membros'}
          </span>
        </div>

        {/* Members row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {team.members.slice(0, 6).map((m) => (
                <div
                  key={m.professionalId}
                  title={`${m.name}${m.isLeader ? ' (líder)' : ''}`}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `2.5px solid ${m.isLeader ? 'var(--color-primary)' : 'var(--color-background)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: m.isLeader
                      ? 'var(--color-primary-alpha-20)'
                      : 'rgba(255,255,255,0.06)',
                    color: m.isLeader ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    fontWeight: 700,
                    fontSize: 11,
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: m.isLeader ? 2 : 1,
                  }}
                >
                  {m.avatarUrl ? (
                    <Image
                      src={m.avatarUrl}
                      alt={m.name}
                      width={36}
                      height={36}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    m.avatarInitials
                  )}
                </div>
              ))}
              {team.members.length > 6 && (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '2.5px solid var(--color-background)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--color-border-medium)',
                    color: 'var(--color-text-muted)',
                    fontWeight: 700,
                    fontSize: 10,
                    flexShrink: 0,
                  }}
                >
                  +{team.members.length - 6}
                </div>
              )}
            </div>

            {leader && (
              <div>
                <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                  Líder
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--color-text-readable)' }}
                >
                  {leader.name.split(' ')[0]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/team/${team.id}`}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-center transition-all hover:opacity-90"
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
              letterSpacing: '-0.01em',
            }}
          >
            Ver equipe
          </Link>
          {isOwner && (
            <button
              onClick={() => onDelete(team.id)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{
                background: 'var(--color-danger-alpha-08)',
                color: 'var(--color-danger-light)',
                border: '1px solid var(--color-danger-alpha-15)',
                cursor: 'pointer',
              }}
            >
              Excluir
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function MyTeams() {
  const { user } = useCurrentUser()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { teams, deleteTeam } = useTeams()

  const myTeams = user
    ? teams.filter(
        (t) =>
          t.ownerId === user.id ||
          t.members.some((m) => m.professionalId === user.id && m.status === 'accepted'),
      )
    : []

  const totalMembers = myTeams.reduce(
    (sum, t) => sum + t.members.filter((m) => m.status === 'accepted').length,
    0,
  )

  function handleDelete(teamId: string) {
    setDeleteTarget(teamId)
  }

  function confirmDelete() {
    if (deleteTarget) {
      deleteTeam(deleteTarget)
      setDeleteTarget(null)
    }
  }

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
        <BackButton href="/home" />
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-faint)' }}>
          Minhas equipes
        </span>
        <div style={{ width: 40 }} />
      </div>

      {/* Hero header */}
      <div
        style={{
          background: 'linear-gradient(180deg, var(--color-primary-alpha-10) 0%, transparent 100%)',
          borderBottom: '1px solid var(--color-border-subtle)',
          padding: '32px 24px 28px',
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--color-primary)' }}
          >
            Gerenciamento
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1
                className="font-bold text-white"
                style={{ fontSize: 36, lineHeight: 1.05, letterSpacing: '-0.03em' }}
              >
                Minhas
                <br />
                equipes
              </h1>
            </div>
            <Link
              href="/home"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 shrink-0"
              style={{
                background: 'var(--color-primary-alpha-15)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary-alpha-30)',
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Buscar profissionais
            </Link>
          </div>

          {/* Stats strip */}
          {myTeams.length > 0 && (
            <div className="flex items-center gap-6 mt-5">
              <div>
                <p
                  className="font-bold"
                  style={{
                    fontSize: 24,
                    color: 'var(--color-primary)',
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {myTeams.length}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  equipe{myTeams.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div style={{ width: 1, height: 32, background: 'var(--color-border-medium)' }} />
              <div>
                <p
                  className="font-bold"
                  style={{
                    fontSize: 24,
                    color: 'var(--color-text-readable)',
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {totalMembers}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  profissional{totalMembers !== 1 ? 'is' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px 60px' }}>
        {/* Content */}
        <div className="pt-6">
          {myTeams.length === 0 ? (
            <div
              className="py-20 text-center rounded-2xl"
              style={{
                background:
                  'linear-gradient(180deg, var(--color-primary-alpha-10) 0%, transparent 60%)',
                border: '1px dashed var(--color-primary-alpha-30)',
              }}
            >
              <div className="flex justify-center mb-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'var(--color-primary-alpha-15)',
                    border: '1px solid var(--color-primary-alpha-30)',
                  }}
                >
                  <svg
                    width="28"
                    height="28"
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
              <p
                className="font-bold mb-1"
                style={{
                  fontSize: 18,
                  color: 'var(--color-text-readable)',
                  letterSpacing: '-0.02em',
                }}
              >
                Nenhuma equipe ainda
              </p>
              <p className="text-sm mb-7" style={{ color: 'var(--color-text-muted)' }}>
                Adicione profissionais a uma equipe para começar
              </p>
              <Link
                href="/home"
                className="inline-block px-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                  letterSpacing: '-0.01em',
                }}
              >
                Explorar profissionais
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {myTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isOwner={team.ownerId === user.id}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Excluir equipe?"
          description="Essa ação não pode ser desfeita. Todos os dados da equipe serão removidos."
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
