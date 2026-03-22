'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { WorkLogSection } from '../../components/WorkLogSection/WorkLogSection'
import { useTeams } from '../../hooks/useTeams'

import { ConfirmDialog } from '@/src/components/ConfirmDialog'
import { ChatModal } from '@/src/features/chat/components/ChatModal/ChatModal'
import { PROFESSION_COLORS } from '@/src/types/professional.types'
import type { Team, TeamMember } from '@/src/types/team.types'
import type { User } from '@/src/types/user.types'

function formatDate(iso: string): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
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
  const color = PROFESSION_COLORS[m.profession as keyof typeof PROFESSION_COLORS] ?? '#E07B2A'
  const [editing, setEditing] = useState(false)
  const [profValue, setProfValue] = useState(m.profession)

  function submitEdit() {
    if (profValue.trim() && profValue.trim() !== m.profession) {
      onEditProfession(profValue.trim())
    }
    setEditing(false)
  }

  const BTN = {
    width: 34,
    height: 34,
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
      className="rounded-xl overflow-hidden"
      style={{
        background: m.isLeader ? 'rgba(224,123,42,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${m.isLeader ? 'rgba(224,123,42,0.22)' : 'rgba(255,255,255,0.07)'}`,
      }}
    >
      <div className="flex items-center gap-2.5 px-3 pt-2.5 pb-1">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
            border: `2px solid ${m.isLeader ? '#E07B2A' : color + '55'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${color}18`,
            color,
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {m.avatarUrl ? (
            <img
              src={m.avatarUrl}
              alt={m.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            m.avatarInitials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-sm font-semibold text-white truncate">{m.name}</span>
            {m.isLeader && (
              <span
                className="text-xs px-1.5 py-0.5 rounded font-bold shrink-0"
                style={{ background: 'rgba(224,123,42,0.18)', color: '#E07B2A' }}
              >
                líder
              </span>
            )}
            {isOwner && (
              <span
                className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0"
                style={{
                  background: 'rgba(116,185,255,0.1)',
                  color: '#74B9FF',
                  border: '1px solid rgba(116,185,255,0.2)',
                }}
              >
                você
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 pb-2.5">
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-1">
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
                  border: '1px solid rgba(224,123,42,0.4)',
                  color: '#F5F0EB',
                  width: 120,
                }}
              />
              <button
                onClick={submitEdit}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#4CAF50',
                  fontSize: 13,
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
                  color: 'rgba(245,240,235,0.4)',
                  fontSize: 13,
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-1 text-xs overflow-hidden"
              style={{ color: 'rgba(245,240,235,0.4)' }}
            >
              <span className="truncate" style={{ color }}>
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
                  color: 'rgba(245,240,235,0.2)',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <svg
                  width="9"
                  height="9"
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
              {m.hourlyRate && <span className="shrink-0 ml-1">· R$ {m.hourlyRate}/h</span>}
              {memberCost && (
                <span className="shrink-0">· R$ {memberCost.toLocaleString('pt-BR')}</span>
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
                background: 'rgba(37,211,102,0.1)',
                color: '#25D366',
                textDecoration: 'none',
              }}
              title="WhatsApp"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.25a.75.75 0 0 0 .92.92l5.405-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.892 0-3.667-.5-5.207-1.376l-.374-.215-3.873 1.053 1.053-3.873-.215-.374A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
            </a>
          )}
          {!isOwner && (
            <button
              onClick={onChat}
              title="Mensagem"
              style={{ ...BTN, background: 'rgba(116,185,255,0.1)', color: '#74B9FF' }}
            >
              <svg
                width="15"
                height="15"
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
              style={{ ...BTN, background: 'rgba(224,123,42,0.1)', color: '#E07B2A' }}
            >
              <svg
                width="14"
                height="14"
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
            style={{ ...BTN, background: 'rgba(229,57,53,0.08)', color: '#FF6B6B' }}
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
  const { teams, removeMember, setLeader, updateMemberProfession, deleteTeam } = useTeams()
  const [team, setTeam] = useState<Team | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [chatTarget, setChatTarget] = useState<TeamMember | null>(null)

  type DialogConfig = {
    title: string
    description?: string
    confirmLabel?: string
    variant?: 'danger' | 'warning' | 'info'
    onConfirm: () => void
  }
  const [dialog, setDialog] = useState<DialogConfig | null>(null)

  function confirm(cfg: DialogConfig) {
    setDialog(cfg)
  }
  function closeDialog() {
    setDialog(null)
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem('equobra_user')
      if (raw) setUser(JSON.parse(raw) as User)
    } catch {}
  }, [])

  useEffect(() => {
    const found = teams.find((t) => t.id === id) ?? null
    setTeam(found)
  }, [teams, id])

  if (!team) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: '#0D0C0B' }}
      >
        <p className="text-white font-semibold">Equipe não encontrada</p>
        <button
          onClick={() => router.push('/profile')}
          style={{
            color: '#E07B2A',
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
    <div style={{ background: '#0D0C0B', minHeight: '100vh' }}>
      <div
        style={{
          height: 3,
          background: 'linear-gradient(to right, #E07B2A, #E07B2A44, transparent)',
        }}
      />

      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <button
          onClick={() => router.push('/profile')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(245,240,235,0.5)',
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
        <button
          onClick={handleDelete}
          className="text-xs"
          style={{ color: '#FF6B6B', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Excluir equipe
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>
        <div className="py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 className="font-bold text-white text-2xl mb-1" style={{ letterSpacing: '-0.02em' }}>
            {team.name}
          </h1>
          <p className="text-sm mb-5" style={{ color: 'rgba(245,240,235,0.4)' }}>
            📍 {team.obraLocation}
          </p>

          <div className="grid grid-cols-3 gap-3" style={{ maxWidth: 480 }}>
            <div
              className="rounded-2xl p-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <p className="text-xs mb-1" style={{ color: 'rgba(245,240,235,0.35)' }}>
                Início
              </p>
              <p className="text-sm font-bold text-white">{formatDate(team.scheduledStart)}</p>
            </div>
            <div
              className="rounded-2xl p-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <p className="text-xs mb-1" style={{ color: 'rgba(245,240,235,0.35)' }}>
                Duração
              </p>
              <p className="text-sm font-bold text-white">
                {team.estimatedDays}{' '}
                <span className="font-normal text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>
                  dias
                </span>
              </p>
            </div>
            <div
              className="rounded-2xl p-3"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <p className="text-xs mb-1" style={{ color: 'rgba(245,240,235,0.35)' }}>
                Custo total
              </p>
              <p
                className="text-sm font-bold"
                style={{ color: total != null ? '#FFD166' : 'rgba(245,240,235,0.5)' }}
              >
                {total != null ? `R$ ${total.toLocaleString('pt-BR')}` : 'A combinar'}
              </p>
            </div>
          </div>

          {team.observations && (
            <p className="text-sm mt-4" style={{ color: 'rgba(245,240,235,0.45)' }}>
              {team.observations}
            </p>
          )}
        </div>

        <div className="py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white text-base">
              Membros{' '}
              <span className="text-sm font-normal" style={{ color: 'rgba(245,240,235,0.3)' }}>
                ({team.members.length})
              </span>
            </h2>
            {leader && (
              <div
                className="flex items-center gap-1.5 text-xs"
                style={{ color: 'rgba(245,240,235,0.35)' }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#E07B2A" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {leader.name.split(' ')[0]}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
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

        <div className="py-5 pb-10">
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
              className="rounded-2xl p-6 text-center"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed rgba(255,255,255,0.08)',
              }}
            >
              <p className="text-sm" style={{ color: 'rgba(245,240,235,0.3)' }}>
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
