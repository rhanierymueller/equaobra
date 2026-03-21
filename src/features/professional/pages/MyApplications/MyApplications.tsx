'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useOpportunities } from '@/src/features/opportunity/hooks/useOpportunities'
import { useInterests } from '@/src/features/opportunity/hooks/useInterests'
import { ChatModal } from '@/src/features/chat/components/ChatModal/ChatModal'
import type { Interest } from '@/src/features/opportunity/hooks/useInterests'
import type { Opportunity } from '@/src/types/opportunity.types'
import type { TeamMember } from '@/src/types/team.types'
import type { User } from '@/src/types/user.types'

const ACCENT = '#E07B2A'

function formatDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ── Application card ───────────────────────────────────────────────────────────

interface CardProps {
  interest: Interest
  opp: Opportunity | undefined
  onChat: (contractorId: string, name: string, initials: string) => void
}

function ApplicationCard({ interest, opp, onChat }: CardProps) {
  const displayName = opp ? (opp.companyName ?? opp.contractorName) : interest.professionalName
  const initials = opp?.avatarInitials ?? displayName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {/* Orange top accent */}
      <div style={{ height: 2, background: `linear-gradient(to right, ${ACCENT}, ${ACCENT}44, transparent)` }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div style={{
            width: 46, height: 46, borderRadius: 12, flexShrink: 0,
            background: `${ACCENT}22`, color: ACCENT, fontWeight: 800, fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1.5px solid ${ACCENT}44`,
          }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight truncate">{opp?.companyName ?? opp?.contractorName ?? '—'}</p>
            {opp?.companyName && (
              <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,235,0.4)' }}>{opp.contractorName}</p>
            )}
            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'rgba(245,240,235,0.4)' }}>
              <svg width="9" height="9" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1a4 4 0 0 1 4 4c0 3.5-4 7.5-4 7.5S2.5 8.5 2.5 5a4 4 0 0 1 4-4z" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              {opp?.obraLocation ?? '—'}
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
            style={{ background: 'rgba(76,175,80,0.1)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.2)' }}>
            Candidatado
          </span>
        </div>

        {/* Description */}
        {opp?.obraDescription && (
          <p className="text-xs mb-3 leading-relaxed"
            style={{ color: 'rgba(245,240,235,0.55)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {opp.obraDescription}
          </p>
        )}

        {/* Meta */}
        {(opp?.obraStart || opp?.obraDuration) && (
          <div className="flex gap-4 mb-3">
            {opp.obraStart && (
              <div>
                <p className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>Início</p>
                <p className="text-xs font-semibold text-white">{formatDate(opp.obraStart)}</p>
              </div>
            )}
            {opp.obraDuration && (
              <div>
                <p className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>Duração</p>
                <p className="text-xs font-semibold text-white">{opp.obraDuration}</p>
              </div>
            )}
          </div>
        )}

        {/* Professions */}
        {opp && opp.lookingForProfessions.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {opp.lookingForProfessions.slice(0, 4).map(p => (
              <span key={p} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
                {p}
              </span>
            ))}
            {opp.lookingForProfessions.length > 4 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'rgba(245,240,235,0.3)' }}>
                +{opp.lookingForProfessions.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/contractor/${interest.contractorId}`}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 12, fontWeight: 600,
              background: 'rgba(255,255,255,0.05)', color: 'rgba(245,240,235,0.7)',
              border: '1px solid rgba(255,255,255,0.09)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            Ver perfil
          </Link>
          <button
            onClick={() => onChat(interest.contractorId, opp?.companyName ?? opp?.contractorName ?? '—', initials)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 12, fontWeight: 700,
              background: ACCENT, color: 'white', border: 'none', cursor: 'pointer',
            }}>
            Falar com contratante
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function MyApplications() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [chatTarget, setChatTarget] = useState<Pick<TeamMember, 'professionalId' | 'name' | 'avatarInitials' | 'avatarUrl' | 'profession'> | null>(null)

  const { opportunities } = useOpportunities()

  useEffect(() => {
    try {
      const raw = localStorage.getItem('equobra_user')
      if (raw) setUser(JSON.parse(raw) as User)
    } catch { /* ignore */ }
    setLoaded(true)
  }, [])

  // Read interests where this user is the professional
  const [myInterests, setMyInterests] = useState<Interest[]>([])
  useEffect(() => {
    if (!user) return
    try {
      const raw = localStorage.getItem('equobra_interests')
      const all: Interest[] = raw ? JSON.parse(raw) : []
      setMyInterests(all.filter(i => i.professionalId === user.id))
    } catch { /* ignore */ }
  }, [user])

  if (!loaded) return null

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0D0C0B' }}>
        <p className="text-white font-semibold">Você precisa estar logado</p>
        <Link href="/auth" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: ACCENT }}>
          Entrar
        </Link>
      </div>
    )
  }

  function handleChat(contractorId: string, name: string, initials: string) {
    setChatTarget({ professionalId: contractorId, name, avatarInitials: initials, profession: 'Contratante' })
  }

  return (
    <div style={{ background: '#0D0C0B', minHeight: '100vh' }}>
      <div style={{ height: 3, background: `linear-gradient(to right, ${ACCENT}, ${ACCENT}44, transparent)` }} />

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
        <span className="text-xs font-medium" style={{ color: 'rgba(245,240,235,0.25)' }}>Minhas vagas</span>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px 40px' }}>

        {/* Header */}
        <div className="py-6 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h1 className="font-bold text-white text-xl leading-tight" style={{ letterSpacing: '-0.02em' }}>Minhas vagas</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.4)' }}>
              {myInterests.length === 0
                ? 'Nenhuma candidatura ainda'
                : `${myInterests.length} vaga${myInterests.length !== 1 ? 's' : ''} onde você se candidatou`}
            </p>
          </div>
          <Link
            href="/home"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}44` }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Explorar obras
          </Link>
        </div>

        {/* List */}
        <div className="pt-5">
          {myInterests.length === 0 ? (
            <div className="py-16 text-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <div className="flex justify-center mb-4">
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${ACCENT}12`, border: `1px solid ${ACCENT}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: 'rgba(245,240,235,0.5)' }}>Você ainda não se candidatou a nenhuma vaga</p>
              <p className="text-xs mb-5" style={{ color: 'rgba(245,240,235,0.25)' }}>Explore obras disponíveis e demonstre interesse</p>
              <Link href="/home"
                className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}44` }}>
                Ver obras disponíveis
              </Link>
            </div>
          ) : (
            <div style={{ maxHeight: 560, overflowY: 'auto', paddingRight: 4 }}>
              <div className="flex flex-col gap-3">
                {myInterests.map(interest => {
                  const opp = opportunities.find(o => o.contractorId === interest.contractorId)
                  return (
                    <ApplicationCard
                      key={interest.id}
                      interest={interest}
                      opp={opp}
                      onChat={handleChat}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {chatTarget && user && (
        <ChatModal
          user={user}
          professional={chatTarget}
          onClose={() => setChatTarget(null)}
        />
      )}
    </div>
  )
}
