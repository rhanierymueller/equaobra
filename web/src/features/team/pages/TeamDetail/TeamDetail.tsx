'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { MemberRow } from '../../components/MemberRow'
import { PendingInvitesList } from '../../components/PendingInvitesList'
import { TeamStatsGrid } from '../../components/TeamStatsGrid'
import { WorkLogSection } from '../../components/WorkLogSection/WorkLogSection'
import { useTeams } from '../../hooks/useTeams'

import { teamTotalCost, type DialogConfig } from './TeamDetail.types'

import { BackButton } from '@/src/components/BackButton'
import { ConfirmDialog } from '@/src/components/ConfirmDialog'
import { ChatModal } from '@/src/features/chat/components/ChatModal/ChatModal'
import { useCurrentUser } from '@/src/hooks/useCurrentUser'
import { useToast } from '@/src/hooks/useToast'
import type { TeamMember } from '@/src/types/team.types'

export function TeamDetail({ id }: { id: string }) {
  const router = useRouter()
  const { user } = useCurrentUser()
  const { teams, removeMember, leaveTeam, setLeader, updateMemberProfession, deleteTeam } =
    useTeams()
  const toast = useToast()
  const team = teams.find((t) => t.id === id) ?? null
  const [chatTarget, setChatTarget] = useState<TeamMember | null>(null)
  const [dialog, setDialog] = useState<DialogConfig | null>(null)

  function confirm(cfg: DialogConfig) {
    setDialog(cfg)
  }

  if (!team) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: 'var(--color-background)' }}
      >
        <p className="text-white font-semibold">Equipe não encontrada</p>
        <BackButton href="/profile" />
      </div>
    )
  }

  const isOwner = user?.id === team.ownerId
  const myMembership = user ? team.members.find((m) => m.professionalId === user.id) : null
  const isPendingMember = !isOwner && myMembership?.status === 'pending'

  if (isPendingMember) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-4 px-6 text-center"
        style={{ background: 'var(--color-background)' }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: 'var(--color-primary-alpha-10)',
            border: '1px solid var(--color-primary-alpha-30)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
        <div>
          <p className="font-bold text-white mb-1" style={{ fontSize: 18 }}>
            Convite pendente
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Você foi convidado para a equipe{' '}
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{team.name}</span>.
            <br />
            Aceite o convite para ter acesso aos detalhes.
          </p>
        </div>
        <BackButton href="/my-invitations" label="Ver meus convites" />
      </div>
    )
  }

  const acceptedMembers = team.members.filter((m) => m.status === 'accepted')
  const pendingMembers = team.members.filter((m) => m.status === 'pending')
  const { perMember } = teamTotalCost({ ...team, members: acceptedMembers })
  const leader = acceptedMembers.find((m) => m.isLeader)
  const userInTeam = !!myMembership && myMembership.status === 'accepted'
  const isLeader = leader?.professionalId === user?.id

  function handleDelete() {
    confirm({
      title: 'Excluir equipe?',
      description: `"${team!.name}" e todos os seus dados serão removidos permanentemente.`,
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: () => {
        deleteTeam(team!.id)
        toast.success('Equipe excluída com sucesso.')
        router.push('/profile')
      },
    })
  }

  function handleLeave() {
    if (!user) return
    confirm({
      title: 'Sair da equipe?',
      description: `Você será removido de "${team!.name}". Esta ação não pode ser desfeita.`,
      confirmLabel: 'Sair da equipe',
      variant: 'danger',
      onConfirm: () => {
        leaveTeam(team!.id, user.id)
        toast.info('Você saiu da equipe.')
        router.push('/profile')
      },
    })
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

      {/* Nav */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <BackButton href="/profile" label="Minhas equipes" />
        {isOwner && (
          <button
            onClick={handleDelete}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{
              color: 'var(--color-danger-light)',
              background: 'var(--color-danger-alpha-08)',
              border: '1px solid var(--color-danger-alpha-15)',
              cursor: 'pointer',
            }}
          >
            Excluir equipe
          </button>
        )}
      </div>

      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(180deg, var(--color-primary-alpha-10) 0%, transparent 100%)',
          borderBottom: '1px solid var(--color-border-subtle)',
          padding: '32px 24px 28px',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--color-primary)' }}
          >
            Detalhes da equipe
          </p>
          <h1
            className="font-bold text-white"
            style={{ fontSize: 40, lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 10 }}
          >
            {team.name}
          </h1>
          <div className="flex items-center gap-2">
            <svg
              width="13"
              height="13"
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
            <span className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
              {team.obraLocation}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px' }}>
        {/* Inactive alert */}
        {!team.active && (
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-4 mt-6"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-dim)"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                Equipe inativa
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
                Todos os membros foram removidos. Convide profissionais para reativar esta equipe.
              </p>
            </div>
          </div>
        )}

        <TeamStatsGrid team={team} />

        {/* Observations */}
        {team.observations && (
          <div className="py-5" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {team.observations}
            </p>
          </div>
        )}

        {/* Members */}
        <div className="pt-7 pb-6" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div className="mb-5">
            <h2 className="font-bold text-white" style={{ fontSize: 20, letterSpacing: '-0.02em' }}>
              Membros
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {acceptedMembers.length}{' '}
              {acceptedMembers.length === 1 ? 'profissional' : 'profissionais'}
              {leader && (
                <span>
                  {' '}
                  · líder:{' '}
                  <span style={{ color: 'var(--color-primary)' }}>{leader.name.split(' ')[0]}</span>
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {acceptedMembers.map((member, i) => (
              <MemberRow
                key={member.professionalId}
                member={member}
                memberCost={perMember[i]}
                isCurrentUser={user?.id === member.professionalId}
                isTeamOwner={isOwner}
                onSetLeader={() =>
                  confirm({
                    title: `Tornar ${member.name.split(' ')[0]} líder?`,
                    description:
                      'O líder atual perderá o cargo. O novo líder terá permissão para gerenciar todos os registros de horas.',
                    confirmLabel: 'Definir como líder',
                    variant: 'warning',
                    onConfirm: () => {
                      setLeader(team.id, member.professionalId)
                      toast.success(`${member.name.split(' ')[0]} é o novo líder.`)
                    },
                  })
                }
                onRemove={() =>
                  confirm({
                    title: `Remover ${member.name.split(' ')[0]}?`,
                    description:
                      'O membro será removido da equipe. Esta ação não pode ser desfeita.',
                    confirmLabel: 'Remover',
                    variant: 'danger',
                    onConfirm: () => {
                      removeMember(team.id, member.professionalId)
                      toast.success(`${member.name.split(' ')[0]} foi removido da equipe.`)
                    },
                  })
                }
                onLeave={handleLeave}
                onEditProfession={(profession) => {
                  updateMemberProfession(team.id, member.professionalId, profession)
                  toast.success('Função atualizada.')
                }}
                onChat={() => setChatTarget(member)}
              />
            ))}
          </div>
        </div>

        {/* Pending invites — owner only */}
        {isOwner && (
          <PendingInvitesList
            members={pendingMembers}
            onCancel={(m) =>
              confirm({
                title: `Cancelar convite de ${m.name.split(' ')[0]}?`,
                description: 'O convite será cancelado e o profissional removido da lista.',
                confirmLabel: 'Cancelar convite',
                variant: 'danger',
                onConfirm: () => {
                  removeMember(team.id, m.professionalId)
                  toast.success(`Convite de ${m.name.split(' ')[0]} cancelado.`)
                },
              })
            }
          />
        )}

        {/* Work logs */}
        <div className="pt-7">
          {user && userInTeam ? (
            <WorkLogSection
              team={team}
              currentUser={{ id: user.id, name: user.name }}
              isLeader={isLeader}
              leaderId={leader?.professionalId ?? ''}
              onRequestConfirm={confirm}
            />
          ) : (
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: 'var(--color-surface-overlay)',
                border: '1px dashed var(--color-border-medium)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Apenas membros da equipe podem ver o registro de horas
              </p>
            </div>
          )}
        </div>
      </div>

      {chatTarget && user && (
        <ChatModal user={user} professional={chatTarget} onClose={() => setChatTarget(null)} />
      )}

      {dialog && (
        <ConfirmDialog
          title={dialog.title}
          description={dialog.description}
          confirmLabel={dialog.confirmLabel}
          variant={dialog.variant}
          onConfirm={() => {
            dialog.onConfirm()
            setDialog(null)
          }}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  )
}
