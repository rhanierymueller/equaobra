'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
  onDelete: (id: string) => void
}

function TeamCard({ team, onDelete }: TeamCardProps) {
  const leader = team.members.find((m) => m.isLeader)
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-surface-overlay)', border: '1px solid var(--color-border-faint)' }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-white text-base leading-tight truncate">{team.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              <span className="flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 13 13" fill="none">
                  <path d="M6.5 1a4 4 0 0 1 4 4c0 3.5-4 7.5-4 7.5S2.5 8.5 2.5 5a4 4 0 0 1 4-4z" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                {team.obraLocation}
              </span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-semibold" style={{ color: 'var(--color-star)' }}>
              {teamCost(team)}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
              estimado
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-3 text-xs mb-3"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <span className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDate(team.scheduledStart)}
          </span>
          <span>·</span>
          <span>{team.estimatedDays} dias</span>
          <span>·</span>
          <span>
            {team.members.length} {team.members.length === 1 ? 'membro' : 'membros'}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {team.members.slice(0, 5).map((m) => (
              <div
                key={m.professionalId}
                title={`${m.name}${m.isLeader ? ' (líder)' : ''}`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `2px solid ${m.isLeader ? 'var(--color-primary)' : 'var(--color-background)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--color-primary-alpha-20)',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                  fontSize: 10,
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: m.isLeader ? 2 : 1,
                }}
              >
                {m.avatarUrl ? (
                  <Image
                    src={m.avatarUrl}
                    alt={m.name}
                    width={28}
                    height={28}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  m.avatarInitials
                )}
              </div>
            ))}
          </div>
          {leader && (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Líder:{' '}
              <span style={{ color: 'rgba(245,240,235,0.7)', fontWeight: 600 }}>
                {leader.name.split(' ')[0]}
              </span>
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            href={`/team/${team.id}`}
            className="flex-1 py-2 rounded-xl text-xs font-semibold text-center transition-all hover:opacity-80"
            style={{
              background: 'var(--color-primary-alpha-15)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-primary-alpha-30)',
            }}
          >
            Ver equipe
          </Link>
          <button
            onClick={() => onDelete(team.id)}
            className="px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{
              background: 'var(--color-danger-alpha-08)',
              color: 'var(--color-danger-light)',
              border: '1px solid var(--color-danger-alpha-15)',
              cursor: 'pointer',
            }}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

export function MyTeams() {
  const router = useRouter()
  const { user } = useCurrentUser()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { teams, deleteTeam } = useTeams()

  const myTeams = user
    ? teams.filter(
        (t) => t.ownerId === user.id || t.members.some((m) => m.professionalId === user.id),
      )
    : []

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
          background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-alpha-30), transparent)',
        }}
      />

      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <button
          onClick={() => router.push('/home')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 14,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Voltar
        </button>
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-faint)' }}>
          Minhas equipes
        </span>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px 40px' }}>
        <div
          className="py-6 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <div>
            <h1
              className="font-bold text-white text-xl leading-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              Minhas equipes
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {myTeams.length === 0
                ? 'Nenhuma equipe criada'
                : `${myTeams.length} equipe${myTeams.length !== 1 ? 's' : ''} ativa${myTeams.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link
            href="/home"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
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

        <div className="pt-5">
          {myTeams.length === 0 ? (
            <div
              className="py-16 text-center rounded-2xl"
              style={{
                background: 'var(--color-surface-overlay)',
                border: '1px dashed var(--color-border-subtle)',
              }}
            >
              <div className="flex justify-center mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'var(--color-primary-alpha-10)',
                    border: '1px solid var(--color-primary-alpha-20)',
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
                Você ainda não tem equipes
              </p>
              <p className="text-xs mb-5" style={{ color: 'var(--color-text-faint)' }}>
                Adicione profissionais a uma equipe para começar
              </p>
              <Link
                href="/home"
                className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: 'var(--color-primary-alpha-15)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary-alpha-30)',
                }}
              >
                Explorar profissionais
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myTeams.map((team) => (
                <TeamCard key={team.id} team={team} onDelete={handleDelete} />
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
