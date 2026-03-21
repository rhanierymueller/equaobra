'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '../../components/LoginForm'
import { RegisterForm } from '../../components/RegisterForm'
import { useLoginForm, useRegisterForm } from '../../hooks/useAuthForm'
import { api, setToken } from '@/src/services/api'
import type { AuthMode } from '@/src/types/auth.types'
import type { LoginCredentials, RegisterCredentials } from '@/src/types/auth.types'

// ── Persist user from API response ────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function persistUser(user: any) {
  if (typeof window === 'undefined') return
  localStorage.setItem('equobra_user', JSON.stringify(user))
}

// ── Background decorations ─────────────────────────────────────────────────────

function BackgroundGrid() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="auth-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(224,123,42,0.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#auth-grid)" />
    </svg>
  )
}

function CitylineSilhouette() {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: 120 }}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-full">
        <path
          d="M0,120 L0,80 L60,80 L60,40 L100,40 L100,20 L130,20 L130,40 L160,40 L160,60
             L200,60 L200,30 L240,30 L240,0 L280,0 L280,30 L310,30 L310,60
             L360,60 L360,40 L400,40 L400,70 L440,70 L440,50 L480,50 L480,20
             L520,20 L520,50 L560,50 L560,70 L600,70 L600,45 L640,45 L640,65
             L680,65 L680,35 L720,35 L720,10 L760,10 L760,35 L800,35 L800,60
             L840,60 L840,45 L880,45 L880,70 L920,70 L920,50 L960,50 L960,30
             L1000,30 L1000,55 L1040,55 L1040,75 L1080,75 L1080,40 L1120,40
             L1120,25 L1160,25 L1160,45 L1200,45 L1200,65 L1240,65 L1240,55
             L1280,55 L1280,80 L1320,80 L1320,60 L1360,60 L1360,80 L1440,80 L1440,120 Z"
          fill="rgba(224,123,42,0.07)"
        />
        <path
          d="M0,120 L0,90 L80,90 L80,70 L120,70 L120,55 L150,55 L150,70
             L190,70 L190,85 L230,85 L230,65 L270,65 L270,45 L300,45 L300,65
             L340,65 L340,80 L380,80 L380,90 L420,90 L420,75 L460,75 L460,55
             L500,55 L500,75 L540,75 L540,85 L580,85 L580,70 L620,70 L620,60
             L660,60 L660,75 L700,75 L700,90 L740,90 L740,70 L780,70 L780,50
             L820,50 L820,70 L860,70 L860,80 L900,80 L900,90 L940,90 L940,75
             L980,75 L980,60 L1020,60 L1020,75 L1060,75 L1060,85 L1100,85
             L1100,70 L1140,70 L1140,55 L1180,55 L1180,70 L1220,70 L1220,80
             L1260,80 L1260,90 L1300,90 L1300,80 L1360,80 L1360,90 L1440,90
             L1440,120 Z"
          fill="rgba(224,123,42,0.04)"
        />
      </svg>
    </div>
  )
}

// ── Tab toggle ─────────────────────────────────────────────────────────────────

interface TabsProps {
  mode: AuthMode
  onChange: (mode: AuthMode) => void
}

function Tabs({ mode, onChange }: TabsProps) {
  return (
    <div
      className="flex rounded-xl p-1 mb-8"
      style={{ background: 'rgba(255,255,255,0.06)' }}
    >
      {(['login', 'register'] as AuthMode[]).map(m => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
          style={{
            background: mode === m ? '#E07B2A' : 'transparent',
            color: mode === m ? '#ffffff' : 'rgba(245,240,235,0.5)',
          }}
        >
          {m === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')
  const [authError, setAuthError] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const loginForm = useLoginForm()
  const registerForm = useRegisterForm()

  const handleModeChange = useCallback((next: AuthMode) => {
    setMode(next)
    setAuthError('')
    loginForm.reset()
    registerForm.reset()
  }, [loginForm, registerForm])

  const handleLoginSuccess = useCallback(async (creds: LoginCredentials) => {
    setIsAuthenticating(true)
    setAuthError('')
    try {
      const res = await api.post<{ token: string; user: unknown }>('/api/auth/login', {
        email: creds.email,
        password: creds.password,
      })
      setToken(res.token)
      persistUser(res.user)
      router.push('/home')
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'Erro ao entrar. Tente novamente.')
    } finally {
      setIsAuthenticating(false)
    }
  }, [router])

  const handleRegisterSuccess = useCallback(async (creds: RegisterCredentials) => {
    setIsAuthenticating(true)
    setAuthError('')
    try {
      const res = await api.post<{ token: string; user: unknown }>('/api/auth/register', {
        name: creds.name,
        email: creds.email,
        password: creds.password,
        role: creds.roles[0] || creds.role,
        roles: creds.roles,
        profession: creds.profession || undefined,
        professions: creds.profession ? [creds.profession] : undefined,
        hourlyRate: creds.hourlyRate ? Number(creds.hourlyRate) : undefined,
        companyName: creds.companyName || undefined,
        addrCep: creds.cep ? creds.cep.replace(/\D/g, '') : undefined,
        addrStreet: creds.street || undefined,
        addrNeighborhood: creds.neighborhood || undefined,
        addrCity: creds.city || undefined,
        addrState: creds.state || undefined,
        addrNumber: creds.addressNumber || undefined,
        compAddrCep: creds.companyCep ? creds.companyCep.replace(/\D/g, '') : undefined,
        compAddrStreet: creds.companyStreet || undefined,
        compAddrNeighborhood: creds.companyNeighborhood || undefined,
        compAddrCity: creds.companyCity || undefined,
        compAddrState: creds.companyState || undefined,
        compAddrNumber: creds.companyAddressNumber || undefined,
      })
      setToken(res.token)
      persistUser(res.user)
      router.push('/home')
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'Erro ao criar conta. Tente novamente.')
    } finally {
      setIsAuthenticating(false)
    }
  }, [router])

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#0D0C0B' }}
    >
      <BackgroundGrid />
      <CitylineSilhouette />

      {/* Ambient orange glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224,123,42,0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md mx-4 rounded-2xl p-8"
        style={{
          background: 'rgba(26,25,22,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(224,123,42,0.1)',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-baseline gap-0">
            <span className="font-black text-3xl tracking-[0.15em] uppercase" style={{ color: '#E07B2A' }}>
              Equa
            </span>
            <span className="font-black text-3xl tracking-[0.15em] uppercase" style={{ color: '#F5F0EB' }}>
              Obra
            </span>
          </a>
          <p className="text-sm mt-2" style={{ color: 'rgba(245,240,235,0.45)' }}>
            {mode === 'login'
              ? 'Bem-vindo de volta'
              : 'Crie sua conta gratuitamente'}
          </p>
        </div>

        <Tabs mode={mode} onChange={handleModeChange} />

        {/* API error banner */}
        {authError && (
          <div className="mb-4 px-3 py-2.5 rounded-xl text-xs" style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.25)', color: '#E53935' }}>
            {authError}
          </div>
        )}

        {/* Form with slide transition */}
        <div
          className="transition-all duration-300"
          style={{
            opacity: 1,
            transform: 'translateY(0)',
          }}
        >
          {mode === 'login' ? (
            <LoginForm form={loginForm} onSuccess={() => handleLoginSuccess(loginForm.values)} isLoading={isAuthenticating} />
          ) : (
            <RegisterForm form={registerForm} onSuccess={() => handleRegisterSuccess(registerForm.values)} isLoading={isAuthenticating} />
          )}
        </div>

        {/* Footer toggle */}
        <p className="text-center text-sm mt-6" style={{ color: 'rgba(245,240,235,0.4)' }}>
          {mode === 'login' ? 'Não tem conta?' : 'Já tem uma conta?'}{' '}
          <button
            type="button"
            onClick={() => handleModeChange(mode === 'login' ? 'register' : 'login')}
            className="font-semibold transition-colors"
            style={{ color: '#E07B2A' }}
          >
            {mode === 'login' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>

        {/* Guest access */}
        <button
          type="button"
          onClick={() => router.push('/home')}
          className="w-full text-center text-xs mt-4 transition-colors"
          style={{ color: 'rgba(245,240,235,0.25)' }}
        >
          Continuar como visitante →
        </button>
      </div>
    </div>
  )
}
