'use client'

import { useState } from 'react'

import type { UseLoginFormReturn } from '../../hooks/useAuthForm'

import type { LoginCredentials } from '@/src/types/auth.types'

interface FieldProps {
  id: string
  label: string
  type: string
  value: string
  placeholder: string
  error?: string
  autoComplete?: string
  onChange: (value: string) => void
  onBlur: () => void
}

function Field({
  id,
  label,
  type,
  value,
  placeholder,
  error,
  autoComplete,
  onChange,
  onBlur,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium"
        style={{ color: 'rgba(245,240,235,0.8)' }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="px-4 py-3 rounded-xl text-white outline-none transition-all duration-200 text-sm"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1.5px solid ${error ? '#E53935' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: error ? '0 0 0 3px rgba(229,57,53,0.1)' : 'none',
        }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderColor = '#E07B2A'
          if (!error) e.currentTarget.style.boxShadow = '0 0 0 3px rgba(224,123,42,0.15)'
        }}
        onBlurCapture={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
      />
      {error && (
        <span className="text-xs" style={{ color: '#FF6B6B' }}>
          {error}
        </span>
      )}
    </div>
  )
}

interface LoginFormProps {
  form: UseLoginFormReturn
  onSuccess: (credentials: LoginCredentials) => void
  isLoading?: boolean
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export function LoginForm({ form, onSuccess, isLoading }: LoginFormProps) {
  const { values, errors, isSubmitting, handleChange, handleBlur, handleSubmit } = form
  const busy = isSubmitting || !!isLoading
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit(onSuccess)
      }}
      className="flex flex-col gap-5"
    >
      <Field
        id="login-email"
        label="E-mail"
        type="email"
        value={values.email}
        placeholder="seu@email.com"
        autoComplete="email"
        error={errors.email?.message}
        onChange={(v) => handleChange('email', v)}
        onBlur={() => handleBlur('email')}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="login-password"
            className="text-sm font-medium"
            style={{ color: 'rgba(245,240,235,0.8)' }}
          >
            Senha
          </label>
          <button type="button" className="text-xs transition-colors" style={{ color: '#E07B2A' }}>
            Esqueceu a senha?
          </button>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            value={values.password}
            placeholder="••••••••"
            autoComplete="current-password"
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            className="w-full px-4 py-3 pr-11 rounded-xl text-white outline-none transition-all duration-200 text-sm"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: `1.5px solid ${errors.password ? '#E53935' : 'rgba(255,255,255,0.1)'}`,
              boxShadow: errors.password ? '0 0 0 3px rgba(229,57,53,0.1)' : 'none',
            }}
            onFocus={(e) => {
              if (!errors.password) e.currentTarget.style.borderColor = '#E07B2A'
              if (!errors.password)
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(224,123,42,0.15)'
            }}
            onBlurCapture={(e) => {
              if (!errors.password) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: 'rgba(245,240,235,0.4)', cursor: 'pointer' }}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
        {errors.password && (
          <span className="text-xs" style={{ color: '#FF6B6B' }}>
            {errors.password.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 mt-1"
        style={{
          background: busy ? 'rgba(224,123,42,0.6)' : '#E07B2A',
          cursor: busy ? 'not-allowed' : 'pointer',
        }}
      >
        {busy ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
