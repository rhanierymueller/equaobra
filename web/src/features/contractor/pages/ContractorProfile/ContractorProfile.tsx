'use client'

import { useRouter } from 'next/navigation'

import { ChatModal } from '@/src/features/chat/components/ChatModal/ChatModal'
import { CandidatesSection } from '@/src/features/contractor/components/CandidatesSection'
import { ContractorHeader } from '@/src/features/contractor/components/ContractorHeader'
import { OppFormSection } from '@/src/features/contractor/components/OppFormSection'
import { useContractorProfile } from '@/src/features/contractor/hooks/useContractorProfile'
import { formatDate } from '@/src/utils/date'

export function ContractorProfile({ id }: { id: string }) {
  const router = useRouter()
  const {
    user,
    isMe,
    opp,
    displayName,
    avatarInitials,
    chatTarget,
    setChatTarget,
    publish,
    updateOpportunity,
    openChatWithContractor,
    openChatWithCandidate,
  } = useContractorProfile(id)

  if (!opp && !isMe) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: 'var(--color-background)' }}
      >
        <div className="text-center">
          <p className="text-white font-semibold mb-3">Contratante não encontrado</p>
          <button
            onClick={() => router.back()}
            style={{
              color: 'var(--color-primary)',
              fontSize: 14,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ← Voltar
          </button>
        </div>
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
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-60"
          style={{
            color: 'var(--color-text-secondary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Voltar
        </button>
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-faint)' }}>
          {isMe ? 'Meu perfil' : 'Perfil da construtora'}
        </span>
        <div style={{ width: 52 }} />
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px' }}>
        <ContractorHeader
          displayName={displayName}
          avatarInitials={avatarInitials}
          isMe={isMe}
          opp={opp}
          onChat={openChatWithContractor}
        />

        {opp && (
          <div
            className="flex items-center py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 0 }}
          >
            {[
              { value: opp.lookingForProfessions.length, label: 'vagas abertas' },
              { value: opp.obraStart ? formatDate(opp.obraStart) : '—', label: 'início previsto' },
              { value: opp.obraDuration ?? '—', label: 'duração' },
            ].map((stat, i, arr) => (
              <div
                key={stat.label}
                className="flex flex-col items-center flex-1"
                style={{
                  borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <span className="font-bold text-base text-white">{stat.value}</span>
                <span className="text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {opp && !isMe && (
          <>
            <div className="py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,235,0.65)' }}>
                {opp.obraDescription}
              </p>
            </div>

            <div className="py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex flex-wrap gap-2">
                {opp.lookingForProfessions.map((p) => (
                  <span
                    key={p}
                    className="text-sm px-3 py-1.5 rounded-xl font-medium"
                    style={{
                      background: 'var(--color-primary-alpha-10)',
                      color: 'var(--color-primary)',
                      border: '1px solid var(--color-primary-alpha-15)',
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="py-5 pb-12">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(245,240,235,0.25)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span className="text-sm" style={{ color: 'rgba(245,240,235,0.45)' }}>
                    {opp.contactEmail}
                  </span>
                </div>
                {opp.contactPhone && (
                  <div className="flex items-center gap-2.5">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(245,240,235,0.25)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span className="text-sm" style={{ color: 'rgba(245,240,235,0.45)' }}>
                      {opp.contactPhone}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
                    <path
                      d="M6.5 1a4 4 0 0 1 4 4c0 3.5-4 7.5-4 7.5S2.5 8.5 2.5 5a4 4 0 0 1 4-4z"
                      stroke="rgba(245,240,235,0.25)"
                      strokeWidth="1.3"
                    />
                  </svg>
                  <span className="text-sm" style={{ color: 'rgba(245,240,235,0.45)' }}>
                    {opp.obraLocation}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {isMe && user && (
          <>
            <OppFormSection
              contractorId={id}
              user={user}
              opp={opp}
              publish={publish}
              updateOpportunity={updateOpportunity}
            />
            <CandidatesSection contractorId={id} onChat={openChatWithCandidate} />
          </>
        )}
      </div>

      {chatTarget && user && (
        <ChatModal user={user} professional={chatTarget} onClose={() => setChatTarget(null)} />
      )}
    </div>
  )
}
