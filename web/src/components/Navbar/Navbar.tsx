'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { NotificationPanel } from '@/src/features/notifications/components/NotificationPanel/NotificationPanel'
import { useNotifications } from '@/src/features/notifications/hooks/useNotifications'
import { useCurrentUser } from '@/src/hooks/useCurrentUser'
import type { User } from '@/src/types/user.types'

function BellButton({ userId }: { userId: string }) {
  const { unreadCount, refresh } = useNotifications(userId)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center rounded-xl transition-all hover:opacity-80"
        style={{
          width: 38,
          height: 38,
          background: open ? 'rgba(224,123,42,0.12)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? 'rgba(224,123,42,0.3)' : 'rgba(255,255,255,0.08)'}`,
          cursor: 'pointer',
          position: 'relative',
        }}
        aria-label="Notificações"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={open ? 'var(--color-primary)' : 'rgba(245,240,235,0.6)'}
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: 'var(--color-primary)',
              color: 'white',
              borderRadius: '50%',
              width: 18,
              height: 18,
              fontSize: 10,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--color-background)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && <NotificationPanel userId={userId} onClose={() => setOpen(false)} />}
    </div>
  )
}

function UserAvatar({ user }: { user: User }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    localStorage.removeItem('equobra_user')
    router.push('/')
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 hover:opacity-80"
        style={{
          background: open ? 'rgba(224,123,42,0.1)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? 'rgba(224,123,42,0.3)' : 'rgba(255,255,255,0.08)'}`,
          cursor: 'pointer',
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: 'rgba(224,123,42,0.2)',
            color: 'var(--color-primary)',
            border: '1.5px solid rgba(224,123,42,0.4)',
          }}
        >
          {initials}
        </div>
        <span
          className="text-sm font-medium hidden sm:block"
          style={{ color: 'rgba(245,240,235,0.85)' }}
        >
          Perfil
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.18s',
            color: 'rgba(245,240,235,0.35)',
          }}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 180,
            background: 'rgba(15,14,12,0.99)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14,
            boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
            overflow: 'hidden',
            zIndex: 1100,
          }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs font-semibold text-white truncate">
              {
                (user.role === 'contratante' && user.companyName
                  ? user.companyName
                  : user.name
                ).split(' ')[0]
              }
            </p>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(245,240,235,0.35)' }}>
              {user.email}
            </p>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all hover:opacity-80"
            style={{ color: 'rgba(245,240,235,0.75)', textDecoration: 'none', display: 'flex' }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Meu perfil
          </Link>

          {user.role === 'contratante' && (
            <Link
              href="/my-contractor"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all hover:opacity-80"
              style={{
                color: 'rgba(245,240,235,0.75)',
                textDecoration: 'none',
                display: 'flex',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
              Minha construtora
            </Link>
          )}

          {user.role === 'profissional' && (
            <Link
              href="/my-applications"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all hover:opacity-80"
              style={{
                color: 'rgba(245,240,235,0.75)',
                textDecoration: 'none',
                display: 'flex',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Minhas vagas
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all hover:opacity-80"
            style={{
              color: 'var(--color-danger-light)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair
          </button>
        </div>
      )}
    </div>
  )
}

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
}

function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <circle cx="6" cy="6" r="4.5" stroke="rgba(245,240,235,0.35)" strokeWidth="1.5" />
        <path
          d="M10 10L12.5 12.5"
          stroke="rgba(245,240,235,0.35)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <input
        type="search"
        placeholder="Buscar pedreiro, eletricista, bairro..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'var(--color-text)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'rgba(224,123,42,0.5)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
        }}
      />
    </div>
  )
}

interface NavbarProps {
  searchValue?: string
  onSearchChange?: (v: string) => void
}

export function Navbar({ searchValue = '', onSearchChange }: NavbarProps) {
  const { user } = useCurrentUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-50 flex items-center gap-4 px-5 py-3"
      style={{
        background: 'rgba(13,12,11,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        height: 60,
        position: 'relative',
      }}
    >
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <img
          src="/icon_equaobra.png"
          alt="EquaObra"
          width={28}
          height={28}
          style={{ borderRadius: 6, display: 'block' }}
        />
        <span className="flex items-baseline gap-0">
          <span
            className="font-black text-xl tracking-[0.15em] uppercase"
            style={{ color: 'var(--color-primary)' }}
          >
            Equa
          </span>
          <span
            className="font-black text-xl tracking-[0.15em] uppercase"
            style={{ color: 'var(--color-text)' }}
          >
            Obra
          </span>
        </span>
      </Link>

      {onSearchChange && <SearchBar value={searchValue} onChange={onSearchChange} />}

      <div className="ml-auto flex items-center gap-2 shrink-0">
        {user && (
          <Link
            href="/my-teams"
            className="hidden md:flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-all duration-150"
            style={{ color: 'rgba(245,240,235,0.6)' }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Minhas equipes
          </Link>
        )}

        {user?.role === 'profissional' && (
          <Link
            href="/oportunidades"
            className="hidden md:flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-all duration-150"
            style={{ color: 'rgba(245,240,235,0.6)' }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <circle cx="12" cy="14" r="2" />
            </svg>
            Oportunidades
          </Link>
        )}

        {user?.role === 'contratante' && (
          <Link
            href="/my-contractor"
            className="hidden md:flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-all duration-150"
            style={{ color: 'rgba(245,240,235,0.6)' }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
            Minha construtora
          </Link>
        )}

        {/* MVP: "Minhas vagas" oculto da nav superior — ainda acessível via menu do avatar
        {user?.role === 'profissional' && (
          <Link
            href="/my-applications"
            className="hidden md:flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-all duration-150"
            style={{ color: 'rgba(245,240,235,0.6)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Minhas vagas
          </Link>
        )}
        */}

        {user && (
          <button
            type="button"
            className="md:hidden flex items-center justify-center rounded-xl"
            onClick={() => setMobileMenuOpen((v) => !v)}
            style={{
              width: 38,
              height: 38,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
            }}
            aria-label="Menu"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(245,240,235,0.6)"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        )}

        {/* MVP: notificações ocultas temporariamente — reativar após validação do ciclo principal
        {user && <BellButton userId={user.id} />}
        */}

        {user ? (
          <UserAvatar user={user} />
        ) : (
          <Link
            href="/auth"
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            Entrar
          </Link>
        )}
      </div>
      {/* Menu mobile */}
      {user && mobileMenuOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 z-50 py-2"
          style={{
            background: 'rgba(13,12,11,0.98)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <Link
            href="/home"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-5 py-3 text-sm"
            style={{ color: 'rgba(245,240,235,0.75)' }}
          >
            Buscar profissionais
          </Link>
          <Link
            href="/my-teams"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-5 py-3 text-sm"
            style={{ color: 'rgba(245,240,235,0.75)' }}
          >
            Minhas equipes
          </Link>
          {user.role === 'profissional' && (
            <Link
              href="/oportunidades"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-5 py-3 text-sm"
              style={{ color: 'rgba(245,240,235,0.75)' }}
            >
              Oportunidades
            </Link>
          )}
          {user.role === 'contratante' && (
            <Link
              href="/my-contractor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-5 py-3 text-sm"
              style={{ color: 'rgba(245,240,235,0.75)' }}
            >
              Minha construtora
            </Link>
          )}
          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-5 py-3 text-sm"
            style={{ color: 'rgba(245,240,235,0.75)' }}
          >
            Meu perfil
          </Link>
        </div>
      )}
    </header>
  )
}
