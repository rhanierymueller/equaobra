'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ChatModal } from '@/src/features/chat/components/ChatModal/ChatModal'
import { useInterests } from '@/src/features/opportunity/hooks/useInterests'
import type { Interest } from '@/src/features/opportunity/hooks/useInterests'
import { useOpportunities } from '@/src/features/opportunity/hooks/useOpportunities'
import { useCurrentUser } from '@/src/hooks/useCurrentUser'
import type { Opportunity } from '@/src/types/opportunity.types'
import type { TeamMember } from '@/src/types/team.types'
import { formatDate } from '@/src/utils/date'

interface CardProps {
  interest: Interest
  opp: Opportunity | undefined
  onChat: (contractorId: string, name: string, initials: string) => void
}

function ApplicationCard({ interest, opp, onChat }: CardProps) {
  const displayName = opp ? (opp.companyName ?? opp.contractorName) : interest.professionalName
  const initials =
    opp?.avatarInitials ??
    displayName
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()

  return (
    <div
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
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight truncate">
              {opp?.companyName ?? opp?.contractorName ?? '—'}
            </p>
            {opp?.companyName && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {opp.contractorName}
              </p>
            )}
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
              {opp?.obraLocation ?? '—'}
            </p>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-full shrink-0"
            style={{
              background: 'rgba(76,175,80,0.1)',
              color: '#4CAF50',
              border: '1px solid rgba(76,175,80,0.2)',
            }}
          >
            Candidatado
          </span>
        </div>

        {opp?.obraDescription && (
          <p
            className="text-xs mb-3 leading-relaxed"
            style={{
              color: 'rgba(245,240,235,0.55)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {opp.obraDescription}
          </p>
        )}

        {(opp?.obraStart || opp?.obraDuration) && (
          <div className="flex gap-4 mb-3">
            {opp.obraStart && (
              <div>
                <p className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>
                  Início
                </p>
                <p className="text-xs font-semibold text-white">{formatDate(opp.obraStart)}</p>
              </div>
            )}
            {opp.obraDuration && (
              <div>
                <p className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>
                  Duração
                </p>
                <p className="text-xs font-semibold text-white">{opp.obraDuration}</p>
              </div>
            )}
          </div>
        )}

        {opp && opp.lookingForProfessions.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {opp.lookingForProfessions.slice(0, 4).map((p) => (
              <span
                key={p}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--color-primary-alpha-10)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary-alpha-20)',
                }}
              >
                {p}
              </span>
            ))}
            {opp.lookingForProfessions.length > 4 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ color: 'rgba(245,240,235,0.3)' }}
              >
                +{opp.lookingForProfessions.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Link
            href={`/contractor/${interest.contractorId}`}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              background: 'var(--color-surface-overlay)',
              color: 'var(--color-text-readable)',
              border: '1px solid var(--color-border-faint)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Ver perfil
          </Link>
          <button
            onClick={() =>
              onChat(
                interest.contractorId,
                opp?.companyName ?? opp?.contractorName ?? '—',
                initials,
              )
            }
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Falar com contratante
          </button>
        </div>
      </div>
    </div>
  )
}

export function MyApplications() {
  const router = useRouter()
  const { user } = useCurrentUser()
  const [chatTarget, setChatTarget] = useState<Pick<
    TeamMember,
    'professionalId' | 'name' | 'avatarInitials' | 'avatarUrl' | 'profession'
  > | null>(null)

  const { opportunities } = useOpportunities()
  const { interests: myInterests } = useInterests()

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

  function handleChat(contractorId: string, name: string, initials: string) {
    setChatTarget({
      professionalId: contractorId,
      name,
      avatarInitials: initials,
      profession: 'Contratante',
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
          Minhas vagas
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
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--color-primary)' }}
          >
            Candidaturas
          </p>
          <div className="flex items-end justify-between gap-4">
            <h1
              className="font-bold text-white"
              style={{ fontSize: 36, lineHeight: 1, letterSpacing: '-0.03em' }}
            >
              Minhas vagas
            </h1>
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
              Explorar obras
            </Link>
          </div>
          <p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>
            {myInterests.length === 0
              ? 'Nenhuma candidatura ainda'
              : `${myInterests.length} vaga${myInterests.length !== 1 ? 's' : ''} onde você se candidatou`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px 40px' }}>
        <div className="pt-5">
          {myInterests.length === 0 ? (
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
                Você ainda não se candidatou a nenhuma vaga
              </p>
              <p className="text-xs mb-5" style={{ color: 'rgba(245,240,235,0.25)' }}>
                Explore obras disponíveis e demonstre interesse
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
                Ver obras disponíveis
              </Link>
            </div>
          ) : (
            <div style={{ maxHeight: 560, overflowY: 'auto', paddingRight: 4 }}>
              <div className="flex flex-col gap-3">
                {myInterests.map((interest) => {
                  const opp = opportunities.find((o) => o.contractorId === interest.contractorId)
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
        <ChatModal user={user} professional={chatTarget} onClose={() => setChatTarget(null)} />
      )}
    </div>
  )
}
