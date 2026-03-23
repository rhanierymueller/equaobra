'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  label?: string
  href?: string
}

export function BackButton({ label = 'Voltar', href }: BackButtonProps) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => (href ? router.push(href) : router.back())}
      className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-60"
      style={{ color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {label}
    </button>
  )
}
