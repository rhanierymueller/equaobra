'use client'

import type { Opportunity } from '@/src/types/opportunity.types'

interface ContractorHeaderProps {
  displayName: string
  avatarInitials: string
  isMe: boolean
  opp: Opportunity | undefined
  onChat: () => void
}

export function ContractorHeader({
  displayName,
  avatarInitials,
  isMe,
  opp,
  onChat,
}: ContractorHeaderProps) {
  return (
    <div className="py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-start gap-4">
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            flexShrink: 0,
            border: '2px solid var(--color-primary-alpha-50)',
            boxShadow: '0 0 0 4px var(--color-primary-alpha-10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-primary-alpha-10)',
            color: 'var(--color-primary)',
            fontWeight: 800,
            fontSize: 22,
          }}
        >
          {avatarInitials}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <h1
            className="font-bold text-white text-xl leading-tight mb-1"
            style={{ letterSpacing: '-0.02em' }}
          >
            {displayName}
          </h1>
          {opp?.companyName && (
            <p className="text-sm mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              {opp.contractorName}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                background: 'var(--color-primary-alpha-10)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary-alpha-20)',
              }}
            >
              Contratante
            </span>
            {opp?.obraLocation && (
              <span
                className="text-xs flex items-center gap-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <svg width="10" height="10" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M6.5 1a4 4 0 0 1 4 4c0 3.5-4 7.5-4 7.5S2.5 8.5 2.5 5a4 4 0 0 1 4-4z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                </svg>
                {opp.obraLocation}
              </span>
            )}
            {isMe && (
              <span
                className="text-xs px-1.5 py-0.5 rounded font-medium"
                style={{
                  background: 'var(--color-info-alpha-10)',
                  color: 'var(--color-info)',
                  border: '1px solid var(--color-info-alpha-10)',
                }}
              >
                você
              </span>
            )}
          </div>
        </div>
      </div>

      {!isMe && opp && (
        <div className="flex gap-2.5 mt-5">
          <button
            onClick={onChat}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm flex-1 transition-opacity hover:opacity-85"
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
          {opp.contactPhone && (
            <a
              href={`https://wa.me/55${opp.contactPhone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85"
              style={{
                background: 'var(--color-whatsapp-alpha-10)',
                color: 'var(--color-whatsapp)',
                border: '1px solid var(--color-success-alpha-20)',
                textDecoration: 'none',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.25a.75.75 0 0 0 .92.92l5.405-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.892 0-3.667-.5-5.207-1.376l-.374-.215-3.873 1.053 1.053-3.873-.215-.374A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  )
}
