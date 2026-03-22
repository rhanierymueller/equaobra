'use client'

import type { UseLoginFormReturn } from '../../hooks/useAuthForm'

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
  onSuccess: () => void
  isLoading?: boolean
}

export function LoginForm({ form, onSuccess, isLoading }: LoginFormProps) {
  const { values, errors, isSubmitting, handleChange, handleBlur, handleSubmit } = form
  const busy = isSubmitting || !!isLoading

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
        <input
          id="login-password"
          type="password"
          value={values.password}
          placeholder="••••••••"
          autoComplete="current-password"
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          className="px-4 py-3 rounded-xl text-white outline-none transition-all duration-200 text-sm"
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
