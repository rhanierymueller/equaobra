'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTeams } from '@/src/features/team/hooks/useTeams'
import { ConfirmDialog } from '@/src/components/ConfirmDialog'
import type { User } from '@/src/types/user.types'
import type { Team } from '@/src/types/team.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function teamCost(team: Team): string {
  const allHaveRate = team.members.every(m => m.hourlyRate != null)
  if (!allHaveRate || team.members.length === 0) return 'A combinar'
  const total = team.members.reduce((sum, m) => sum + (m.hourlyRate! * 8 * team.estimatedDays), 0)
  return `R$ ${total.toLocaleString('pt-BR')}`
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ── Team card ─────────────────────────────────────────────────────────────────

interface TeamCardProps { team: Team; onDelete: (id: string) => void }

function TeamCard({ team, onDelete }: TeamCardProps) {
  const leader = team.members.find(m => m.isLeader)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-white text-base leading-tight truncate">{team.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,235,0.4)' }}>📍 {team.obraLocation}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-semibold" style={{ color: '#FFD166' }}>{teamCost(team)}</p>
            <p className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>estimado</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'rgba(245,240,235,0.4)' }}>
          <span>🗓 {formatDate(team.scheduledStart)}</span>
          <span>·</span>
          <span>{team.estimatedDays} dias</span>
          <span>·</span>
          <span>{team.members.length} {team.members.length === 1 ? 'membro' : 'membros'}</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {team.members.slice(0, 5).map(m => (
              <div key={m.professionalId} title={`${m.name}${m.isLeader ? ' (líder)' : ''}`}
                style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${m.isLeader ? '#E07B2A' : '#1a1916'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(224,123,42,0.2)', color: '#E07B2A', fontWeight: 700, fontSize: 10, flexShrink: 0, position: 'relative', zIndex: m.isLeader ? 2 : 1 }}
              >
                {m.avatarUrl
                  ? <img src={m.avatarUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : m.avatarInitials}
              </div>
            ))}
          </div>
          {leader && (
            <span className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>
              Líder: <span style={{ color: 'rgba(245,240,235,0.7)', fontWeight: 600 }}>{leader.name.split(' ')[0]}</span>
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/team/${team.id}`}
            className="flex-1 py-2 rounded-xl text-xs font-semibold text-center transition-all hover:opacity-80"
            style={{ background: 'rgba(224,123,42,0.15)', color: '#E07B2A', border: '1px solid rgba(224,123,42,0.3)' }}
          >
            Ver equipe
          </Link>
          <button onClick={() => onDelete(team.id)}
            className="px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(229,57,53,0.08)', color: '#FF6B6B', border: '1px solid rgba(229,57,53,0.15)', cursor: 'pointer' }}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function MyTeams() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { teams, deleteTeam } = useTeams()

  useEffect(() => {
    try {
      const raw = localStorage.getItem('equobra_user')
      if (raw) setUser(JSON.parse(raw) as User)
    } catch { /* ignore */ }
    setLoaded(true)
  }, [])

  const myTeams = user
    ? teams.filter(t => t.ownerId === user.id || t.members.some(m => m.professionalId === user.id))
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

  if (!loaded) return null

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0D0C0B' }}>
        <p className="text-white font-semibold">Você precisa estar logado</p>
        <Link href="/auth" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#E07B2A' }}>
          Entrar
        </Link>
      </div>
    )
  }

  return (
    <div style={{ background: '#0D0C0B', minHeight: '100vh' }}>
      <div style={{ height: 3, background: 'linear-gradient(to right, #E07B2A, #E07B2A44, transparent)' }} />

      {/* Topbar */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => router.push('/home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,235,0.5)', padding: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Voltar
        </button>
        <span className="text-xs font-medium" style={{ color: 'rgba(245,240,235,0.25)' }}>Minhas equipes</span>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px 40px' }}>

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="py-6 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h1 className="font-bold text-white text-xl leading-tight" style={{ letterSpacing: '-0.02em' }}>Minhas equipes</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.4)' }}>
              {myTeams.length === 0
                ? 'Nenhuma equipe criada'
                : `${myTeams.length} equipe${myTeams.length !== 1 ? 's' : ''} ativa${myTeams.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <Link
            href="/home"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(224,123,42,0.15)', color: '#E07B2A', border: '1px solid rgba(224,123,42,0.3)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Buscar profissionais
          </Link>
        </div>

        {/* ── Teams list ──────────────────────────────────────── */}
        <div className="pt-5">
          {myTeams.length === 0 ? (
            <div className="py-16 text-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(224,123,42,0.1)', border: '1px solid rgba(224,123,42,0.2)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E07B2A" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: 'rgba(245,240,235,0.5)' }}>Você ainda não tem equipes</p>
              <p className="text-xs mb-5" style={{ color: 'rgba(245,240,235,0.25)' }}>Adicione profissionais a uma equipe para começar</p>
              <Link href="/home"
                className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(224,123,42,0.15)', color: '#E07B2A', border: '1px solid rgba(224,123,42,0.3)' }}>
                Explorar profissionais
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myTeams.map(team => (
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
