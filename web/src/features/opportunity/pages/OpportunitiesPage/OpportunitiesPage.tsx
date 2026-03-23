'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useOpportunities } from '../../hooks/useOpportunities'

import { ChatModal } from '@/src/features/chat/components/ChatModal/ChatModal'
import { useCurrentUser } from '@/src/hooks/useCurrentUser'
import type { Opportunity } from '@/src/types/opportunity.types'
import { ALL_PROFESSIONS } from '@/src/types/professional.types'
import type { TeamMember } from '@/src/types/team.types'
import type { User } from '@/src/types/user.types'
import { formatDate } from '@/src/utils/date'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m || 1}min atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

interface CardProps {
  opp: Opportunity
  currentUser: User | null
  onChat: (opp: Opportunity) => void
}

function OpportunityCard({ opp, currentUser, onChat }: CardProps) {
  const initials = opp.avatarInitials
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:border-opacity-20"
      style={{
        background: 'var(--color-surface-overlay)',
        border: '1px solid var(--color-border-medium)',
      }}
    >
      <div
        style={{
          height: 2,
          background: 'linear-gradient(to right, var(--color-primary), transparent)',
        }}
      />

      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="rounded-full flex items-center justify-center font-bold text-sm shrink-0"
            style={{
              width: 44,
              height: 44,
              background: 'var(--color-primary-alpha-15)',
              color: 'var(--color-primary)',
              border: '1.5px solid var(--color-primary-alpha-30)',
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight">
              {opp.companyName ?? opp.contractorName}
            </p>
            {opp.companyName && (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {opp.contractorName}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                📍 {opp.obraLocation}
              </span>
              <span style={{ color: 'var(--color-border-subtle)' }}>·</span>
              <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                {timeAgo(opp.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-text-readable)' }}>
          {opp.obraDescription}
        </p>

        {(opp.obraStart || opp.obraDuration) && (
          <div className="flex gap-4 mb-4">
            {opp.obraStart && (
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-dim)' }}>
                  Início previsto
                </p>
                <p className="text-sm font-semibold text-white">{formatDate(opp.obraStart)}</p>
              </div>
            )}
            {opp.obraDuration && (
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-dim)' }}>
                  Duração
                </p>
                <p className="text-sm font-semibold text-white">{opp.obraDuration}</p>
              </div>
            )}
          </div>
        )}

        <div className="mb-4">
          <p
            className="text-xs mb-2 font-semibold"
            style={{
              color: 'var(--color-text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Buscando
          </p>
          <div className="flex flex-wrap gap-1.5">
            {opp.lookingForProfessions.map((p) => (
              <span
                key={p}
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: 'var(--color-primary-alpha-10)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary-alpha-20)',
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href={`/contractor/${opp.contractorId}`}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{
              background: 'var(--color-surface-overlay)',
              color: 'var(--color-text-readable)',
              border: '1px solid var(--color-border-faint)',
              textDecoration: 'none',
            }}
          >
            Ver perfil
          </a>
          {currentUser ? (
            <button
              onClick={() => onChat(opp)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Demonstrar interesse
            </button>
          ) : (
            <a
              href="/auth"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
              style={{ background: 'var(--color-primary)', color: 'white', textDecoration: 'none' }}
            >
              Entrar para demonstrar interesse
            </a>
          )}
          {opp.contactPhone && (
            <a
              href={`https://wa.me/55${opp.contactPhone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-xl transition-all hover:opacity-80"
              style={{
                width: 44,
                background: 'var(--color-whatsapp-alpha-10)',
                border: '1px solid var(--color-success-alpha-20)',
                color: 'var(--color-whatsapp)',
              }}
              title="WhatsApp"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.25a.75.75 0 0 0 .92.92l5.405-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.892 0-3.667-.5-5.207-1.376l-.374-.215-3.873 1.053 1.053-3.873-.215-.374A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export function OpportunitiesPage() {
  const router = useRouter()
  const { user } = useCurrentUser()
  const { opportunities } = useOpportunities()
  const [filterProfession, setFilterProfession] = useState('')
  const [chatTarget, setChatTarget] = useState<{ opp: Opportunity } | null>(null)

  const filtered = filterProfession
    ? opportunities.filter((o) => o.lookingForProfessions.includes(filterProfession))
    : opportunities

  function oppToMember(opp: Opportunity): TeamMember {
    return {
      professionalId: opp.contractorId,
      name: opp.companyName ?? opp.contractorName,
      profession: 'Contratante',
      phone: opp.contactPhone ?? '',
      avatarInitials: opp.avatarInitials,
      isLeader: false,
    }
  }

  const isActiveFilter = (p: string) => filterProfession === p

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh' }}>
      <div
        style={{
          height: 3,
          background: 'linear-gradient(to right, var(--color-primary), transparent)',
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
          Oportunidades
        </span>
        <div style={{ width: 52 }} />
      </div>

      <div
        style={{
          background: 'linear-gradient(180deg, var(--color-primary-alpha-10) 0%, transparent 100%)',
          borderBottom: '1px solid var(--color-border-subtle)',
          padding: '32px 24px 28px',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--color-primary)' }}
          >
            Para profissionais
          </p>
          <h1
            className="font-bold text-white"
            style={{ fontSize: 36, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 10 }}
          >
            Oportunidades
            <br />
            de obra
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {filtered.length} {filtered.length === 1 ? 'obra disponível' : 'obras disponíveis'}
          </p>

          {user?.role === 'profissional' && (
            <div
              className="mt-4 px-4 py-3 rounded-xl flex items-center gap-3"
              style={{
                background: 'var(--color-primary-alpha-10)',
                border: '1px solid var(--color-primary-alpha-15)',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-xs" style={{ color: 'var(--color-text-readable)' }}>
                Clique em{' '}
                <strong style={{ color: 'var(--color-primary)' }}>Demonstrar interesse</strong> para
                enviar uma mensagem direta ao contratante.
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 48px' }}>
        <div className="mb-6 pt-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterProfession('')}
              className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
              style={{
                background: !filterProfession
                  ? 'var(--color-primary)'
                  : 'var(--color-surface-overlay)',
                color: !filterProfession ? 'white' : 'var(--color-text-secondary)',
                border: `1px solid ${!filterProfession ? 'var(--color-primary)' : 'var(--color-border-medium)'}`,
                cursor: 'pointer',
              }}
            >
              Todas
            </button>
            {ALL_PROFESSIONS.filter((p) =>
              opportunities.some((o) => o.lookingForProfessions.includes(p)),
            ).map((p) => (
              <button
                key={p}
                onClick={() => setFilterProfession(isActiveFilter(p) ? '' : p)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                style={{
                  background: isActiveFilter(p)
                    ? 'var(--color-primary)'
                    : 'var(--color-surface-overlay)',
                  color: isActiveFilter(p) ? 'white' : 'var(--color-text-secondary)',
                  border: `1px solid ${isActiveFilter(p) ? 'var(--color-primary)' : 'var(--color-border-medium)'}`,
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div
            className="py-16 text-center rounded-2xl"
            style={{
              background: 'var(--color-surface-overlay)',
              border: '1px dashed var(--color-border-faint)',
            }}
          >
            <p className="text-sm font-semibold text-white mb-1">Nenhuma oportunidade encontrada</p>
            <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
              {filterProfession
                ? `Nenhuma obra está buscando ${filterProfession} no momento`
                : 'Nenhuma obra disponível no momento'}
            </p>
            {filterProfession && (
              <button
                onClick={() => setFilterProfession('')}
                className="mt-4 text-xs px-4 py-2 rounded-xl"
                style={{
                  background: 'var(--color-primary-alpha-10)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary-alpha-20)',
                  cursor: 'pointer',
                }}
              >
                Ver todas
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opp={opp}
                currentUser={user}
                onChat={(o) => setChatTarget({ opp: o })}
              />
            ))}
          </div>
        )}

        {user?.role === 'contratante' && (
          <div
            className="mt-8 px-5 py-4 rounded-2xl flex items-center justify-between gap-4"
            style={{
              background: 'var(--color-surface-overlay)',
              border: '1px solid var(--color-border-faint)',
            }}
          >
            <div>
              <p className="text-sm font-semibold text-white">Quer atrair profissionais?</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Publique sua obra no perfil e apareça aqui
              </p>
            </div>
            <button
              onClick={() => router.push('/profile')}
              className="text-sm font-bold px-4 py-2 rounded-xl shrink-0 transition-all hover:opacity-90"
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Publicar obra
            </button>
          </div>
        )}
      </div>

      {chatTarget && user && (
        <ChatModal
          user={user}
          professional={oppToMember(chatTarget.opp)}
          onClose={() => setChatTarget(null)}
        />
      )}
    </div>
  )
}
