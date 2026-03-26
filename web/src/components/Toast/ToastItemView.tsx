'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { ToastItem, ToastVariant } from './Toast.types'
import { ToastIcon } from './ToastIcon'

const VARIANT: Record<ToastVariant, { accent: string; bg: string; border: string; label: string }> =
  {
    success: {
      accent: 'var(--color-success)',
      bg: 'var(--color-success-alpha-10)',
      border: 'var(--color-success-alpha-20)',
      label: 'Sucesso',
    },
    error: {
      accent: 'var(--color-danger-light)',
      bg: 'var(--color-danger-alpha-08)',
      border: 'var(--color-danger-alpha-15)',
      label: 'Erro',
    },
    warning: {
      accent: 'var(--color-star)',
      bg: 'var(--color-star-alpha-08)',
      border: 'var(--color-star-alpha-20)',
      label: 'Atenção',
    },
    info: {
      accent: 'var(--color-info)',
      bg: 'var(--color-info-alpha-10)',
      border: 'var(--color-info-alpha-20)',
      label: 'Info',
    },
  }

interface ToastItemViewProps {
  item: ToastItem
  onRemove: (id: string) => void
}

export function ToastItemView({ item, onRemove }: ToastItemViewProps) {
  const v = VARIANT[item.variant]
  const [exiting, setExiting] = useState(false)
  const [hovered, setHovered] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismiss = useCallback(() => {
    if (exiting) return
    setExiting(true)
    setTimeout(() => onRemove(item.id), 280)
  }, [exiting, item.id, onRemove])

  useEffect(() => {
    timerRef.current = setTimeout(dismiss, item.duration)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [dismiss, item.duration])

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        width: '100%',
        maxWidth: 360,
        background: 'var(--color-toast-bg)',
        border: `1px solid ${v.border}`,
        borderRadius: 14,
        padding: '12px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden',
        animation: exiting ? 'toastOut 0.28s ease forwards' : 'toastIn 0.22s ease',
        cursor: 'default',
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: v.accent,
          borderRadius: '14px 0 0 14px',
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          flexShrink: 0,
          background: v.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 6,
        }}
      >
        <ToastIcon variant={item.variant} color={v.accent} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <p
          className="text-xs font-bold uppercase tracking-wider mb-0.5"
          style={{ color: v.accent }}
        >
          {v.label}
        </p>
        <p className="text-sm leading-snug" style={{ color: 'var(--color-text-readable)' }}>
          {item.message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={dismiss}
        aria-label="Fechar"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 2,
          color: hovered ? 'var(--color-text-muted)' : 'var(--color-text-faint)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          transition: 'color 0.15s',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 2L10 10M10 2L2 10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: v.bg,
        }}
      >
        <div
          style={{
            height: '100%',
            background: v.accent,
            transformOrigin: 'left',
            animation: `progressShrink ${item.duration}ms linear forwards`,
            opacity: 0.6,
          }}
        />
      </div>
    </div>
  )
}
