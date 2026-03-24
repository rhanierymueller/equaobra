'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { WorkLogSection } from '../../components/WorkLogSection/WorkLogSection'
import { useTeams } from '../../hooks/useTeams'

import { ConfirmDialog } from '@/src/components/ConfirmDialog'
import { ChatModal } from '@/src/features/chat/components/ChatModal/ChatModal'
import { useCurrentUser } from '@/src/hooks/useCurrentUser'
import { PROFESSION_COLORS } from '@/src/types/professional.types'
import type { Team, TeamMember } from '@/src/types/team.types'
import { formatDate } from '@/src/utils/date'

interface DialogConfig {
  title: string
  description?: string
  confirmLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
}

function teamTotalCost(team: Team): { total: number | null; perMember: (number | null)[] } {
  const perMember = team.members.map((m) =>
    m.hourlyRate != null ? m.hourlyRate * 8 * team.estimatedDays : null,
  )
  const allHave = perMember.every((v) => v != null)
  return {
    total: allHave ? perMember.reduce((s, v) => s! + v!, 0) : null,
    perMember,
  }
}

interface MemberRowProps {
  member: TeamMember
  memberCost: number | null
  isOwner: boolean
  onSetLeader: () => void
  onRemove: () => void
  onEditProfession: (profession: string) => void
  onChat: () => void
}

function MemberRow({
  member: m,
  memberCost,
  isOwner,
  onSetLeader,
  onRemove,
  onEditProfession,
  onChat,
}: MemberRowProps) {
  const color =
    PROFESSION_COLORS[m.profession as keyof typeof PROFESSION_COLORS] ?? 'var(--color-primary)'
  const [editing, setEditing] = useState(false)
  const [profValue, setProfValue] = useState(m.profession)

  function submitEdit() {
    if (profValue.trim() && profValue.trim() !== m.profession) {
      onEditProfession(profValue.trim())
    }
    setEditing(false)
  }

  const BTN = {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as const

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: m.isLeader ? 'var(--color-primary-alpha-10)' : 'var(--color-surface-overlay)',
        border: `1px solid ${m.isLeader ? 'var(--color-primary-alpha-30)' : 'var(--color-border-faint)'}`,
      }}
    >
      {m.isLeader && (
        <div
          style={{
            height: 2,
            background:
              'linear-gradient(to right, var(--color-primary), var(--color-primary-alpha-30), transparent)',
          }}
        />
      )}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
            border: `2.5px solid ${m.isLeader ? 'var(--color-primary)' : color + '55'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${color}18`,
            color,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {m.avatarUrl ? (
            <Image
              src={m.avatarUrl}
              alt={m.name}
              width={44}
              height={44}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            m.avatarInitials
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white" style={{ fontSize: 15 }}>
              {m.name}
            </span>
            {m.isLeader && (
              <span
                className="text-xs px-2 py-0.5 rounded-lg font-bold"
                style={{
                  background: 'var(--color-primary-alpha-20)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary-alpha-30)',
                }}
              >
                líder
              </span>
            )}
            {isOwner && (
              <span
                className="text-xs px-2 py-0.5 rounded-lg font-medium"
                style={{
                  background: 'var(--color-info-alpha-10)',
                  color: 'var(--color-info)',
                  border: '1px solid rgba(116,185,255,0.2)',
                }}
              >
                você
              </span>
            )}
          </div>

          {editing ? (
            <div className="flex items-center gap-1.5 mt-1">
              <input
                autoFocus
                value={profValue}
                onChange={(e) => setProfValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitEdit()
                  if (e.key === 'Escape') setEditing(false)
                }}
                className="text-xs px-2 py-1 rounded-lg outline-none"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid var(--color-primary-alpha-30)',
                  color: 'var(--color-text)',
                  width: 140,
                }}
              />
              <button
                onClick={submitEdit}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-success)',
                  fontSize: 14,
                }}
              >
                ✓
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-sm font-medium" style={{ color }}>
                {m.profession}
              </span>
              <button
                onClick={() => {
                  setProfValue(m.profession)
                  setEditing(true)
                }}
                title="Editar função"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-faint)',
                  padding: 0,
                  flexShrink: 0,
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
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              {m.hourlyRate != null && (
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  R$ {m.hourlyRate}/h
                  {memberCost != null && (
                    <span style={{ color: 'var(--color-text-faint)' }}>
                      {' '}
                      · R$ {memberCost.toLocaleString('pt-BR')} total
                    </span>
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isOwner && m.phone !== '' && (
            <a
              href={`https://wa.me/55${m.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...BTN,
                background: 'var(--color-whatsapp-alpha-10)',
                color: 'var(--color-whatsapp)',
                textDecoration: 'none',
              }}
              title="WhatsApp"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.25a.75.75 0 0 0 .92.92l5.405-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.892 0-3.667-.5-5.207-1.376l-.374-.215-3.873 1.053 1.053-3.873-.215-.374A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
            </a>
          )}
          {!isOwner && (
            <button
              onClick={onChat}
              title="Mensagem"
              style={{
                ...BTN,
                background: 'var(--color-info-alpha-10)',
                color: 'var(--color-info)',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}
          {!m.isLeader && (
            <button
              onClick={onSetLeader}
              title="Definir como líder"
              style={{
                ...BTN,
                background: 'var(--color-primary-alpha-10)',
                color: 'var(--color-primary)',
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          )}
          <button
            onClick={onRemove}
            title="Remover"
            style={{
              ...BTN,
              background: 'var(--color-danger-alpha-08)',
              color: 'var(--color-danger-light)',
              border: '1px solid var(--color-danger-alpha-15)',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 2L10 10M10 2L2 10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export function TeamDetail({ id }: { id: string }) {
  const router = useRouter()
  const { user } = useCurrentUser()
  const { teams, removeMember, setLeader, updateMemberProfession, deleteTeam } = useTeams()
  const team = teams.find((t) => t.id === id) ?? null
  const [chatTarget, setChatTarget] = useState<TeamMember | null>(null)
  const [dialog, setDialog] = useState<DialogConfig | null>(null)

  function confirm(cfg: DialogConfig) {
    setDialog(cfg)
  }
  function closeDialog() {
    setDialog(null)
  }

  if (!team) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: 'var(--color-background)' }}
      >
        <p className="text-white font-semibold">Equipe não encontrada</p>
        <button
          onClick={() => router.push('/profile')}
          style={{
            color: 'var(--color-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          ← Voltar
        </button>
      </div>
    )
  }

  const { total, perMember } = teamTotalCost(team)
  const leader = team.members.find((m) => m.isLeader)
  const userInTeam = user ? team.members.some((m) => m.professionalId === user.id) : false
  const isLeader = leader?.professionalId === user?.id

  function handleDelete() {
    confirm({
      title: 'Excluir equipe?',
      description: `"${team!.name}" e todos os seus dados serão removidos permanentemente.`,
      confirmLabel: 'Excluir',
      variant: 'danger',
      onConfirm: () => {
        deleteTeam(team!.id)
        router.push('/profile')
      },
    })
  }

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh' }}>
      {/* Accent bar */}
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
        <button
          onClick={() => router.push('/profile')}
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
          Minhas equipes
        </button>
        {user?.id === team.ownerId && (
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

      {/* Hero header */}
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
        {/* Stats grid — full width */}
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
              <span
                className="text-sm font-normal ml-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                dias
              </span>
            </p>
          </div>
          <div
            className="rounded-2xl p-5 col-span-2"
            style={{
              background:
                total != null ? 'rgba(255, 209, 102, 0.07)' : 'var(--color-surface-overlay)',
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

        {/* Observations */}
        {team.observations && (
          <div className="py-5" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {team.observations}
            </p>
          </div>
        )}

        {/* Members section */}
        <div className="pt-7 pb-6" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="font-bold text-white"
                style={{ fontSize: 20, letterSpacing: '-0.02em' }}
              >
                Membros
              </h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {team.members.length} {team.members.length === 1 ? 'profissional' : 'profissionais'}
                {leader && (
                  <span>
                    {' '}
                    · líder:{' '}
                    <span style={{ color: 'var(--color-primary)' }}>
                      {leader.name.split(' ')[0]}
                    </span>
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {team.members.map((member, i) => (
              <MemberRow
                key={member.professionalId}
                member={member}
                memberCost={perMember[i]}
                isOwner={user?.id === member.professionalId}
                onSetLeader={() =>
                  confirm({
                    title: `Tornar ${member.name.split(' ')[0]} líder?`,
                    description:
                      'O líder atual perderá o cargo. O novo líder terá permissão para gerenciar todos os registros de horas.',
                    confirmLabel: 'Definir como líder',
                    variant: 'warning',
                    onConfirm: () => setLeader(team.id, member.professionalId),
                  })
                }
                onRemove={() =>
                  confirm({
                    title: `Remover ${member.name.split(' ')[0]}?`,
                    description:
                      'O membro será removido da equipe. Esta ação não pode ser desfeita.',
                    confirmLabel: 'Remover',
                    variant: 'danger',
                    onConfirm: () => removeMember(team.id, member.professionalId),
                  })
                }
                onEditProfession={(profession) =>
                  updateMemberProfession(team.id, member.professionalId, profession)
                }
                onChat={() => setChatTarget(member)}
              />
            ))}
          </div>
        </div>

        {/* Work log section */}
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
            closeDialog()
          }}
          onCancel={closeDialog}
        />
      )}
    </div>
  )
}
