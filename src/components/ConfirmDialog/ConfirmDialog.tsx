'use client'

import { useEffect, useRef } from 'react'

// ── Variant config ────────────────────────────────────────────────────────────

type Variant = 'danger' | 'warning' | 'info'

const VARIANT_STYLES: Record<Variant, { iconBg: string; iconColor: string; confirmBg: string; confirmColor: string; confirmBorder: string }> = {
  danger: {
    iconBg: 'rgba(229,57,53,0.1)',
    iconColor: '#FF6B6B',
    confirmBg: 'rgba(229,57,53,0.15)',
    confirmColor: '#FF6B6B',
    confirmBorder: 'rgba(229,57,53,0.3)',
  },
  warning: {
    iconBg: 'rgba(255,209,102,0.1)',
    iconColor: '#FFD166',
    confirmBg: 'rgba(224,123,42,0.15)',
    confirmColor: '#E07B2A',
    confirmBorder: 'rgba(224,123,42,0.35)',
  },
  info: {
    iconBg: 'rgba(116,185,255,0.1)',
    iconColor: '#74B9FF',
    confirmBg: 'rgba(116,185,255,0.12)',
    confirmColor: '#74B9FF',
    confirmBorder: 'rgba(116,185,255,0.3)',
  },
}

// ── Icons by variant ──────────────────────────────────────────────────────────

function DialogIcon({ variant }: { variant: Variant }) {
  const s = VARIANT_STYLES[variant]
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 14, flexShrink: 0,
      background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {variant === 'danger' && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColor} strokeWidth="2" strokeLinecap="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      )}
      {variant === 'warning' && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColor} strokeWidth="2" strokeLinecap="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )}
      {variant === 'info' && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.iconColor} strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export interface ConfirmDialogProps {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: Variant
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const s = VARIANT_STYLES[variant]
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onCancel() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: 380,
          background: 'rgba(18,17,15,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
          padding: 24,
          animation: 'dialogIn 0.18s ease',
        }}
      >
        <style>{`
          @keyframes dialogIn {
            from { opacity: 0; transform: scale(0.95) translateY(6px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <DialogIcon variant={variant} />
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-bold text-white text-base leading-snug">{title}</h3>
            {description && (
              <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'rgba(245,240,235,0.45)' }}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(245,240,235,0.55)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{
              background: s.confirmBg,
              color: s.confirmColor,
              border: `1px solid ${s.confirmBorder}`,
              cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
