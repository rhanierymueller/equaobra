'use client'

import { useState, useCallback } from 'react'

import type { UseRegisterFormReturn } from '../../hooks/useAuthForm'

import type { RegisterCredentials } from '@/src/types/auth.types'
import { ALL_PROFESSIONS } from '@/src/types/professional.types'
import type { UserRole } from '@/src/types/user.types'
import { lookupCep, formatCep } from '@/src/utils/cep'

const inputStyle = (hasError?: boolean) => ({
  background: 'rgba(255,255,255,0.06)',
  border: `1.5px solid ${hasError ? '#E53935' : 'rgba(255,255,255,0.1)'}`,
  boxShadow: hasError ? '0 0 0 3px rgba(229,57,53,0.1)' : 'none',
})

function focusInput(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, hasError?: boolean) {
  if (!hasError) {
    e.currentTarget.style.borderColor = '#E07B2A'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(224,123,42,0.15)'
  }
}

function blurInput(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, hasError?: boolean) {
  if (!hasError) {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
    e.currentTarget.style.boxShadow = 'none'
  }
}

interface FieldProps {
  id: string
  label: string
  type?: string
  value: string
  placeholder: string
  error?: string
  autoComplete?: string
  disabled?: boolean
  optional?: boolean
  onChange: (value: string) => void
  onBlur: () => void
}

function Field({
  id,
  label,
  type = 'text',
  value,
  placeholder,
  error,
  autoComplete,
  disabled,
  optional,
  onChange,
  onBlur,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-xs font-medium"
        style={{ color: 'rgba(245,240,235,0.7)' }}
      >
        {label}
        {optional && <span style={{ color: 'rgba(245,240,235,0.3)' }}> (opcional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="px-3 py-2.5 rounded-lg text-white outline-none transition-all duration-200 text-sm"
        style={{
          ...inputStyle(!!error),
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={(e) => focusInput(e, !!error)}
        onBlurCapture={(e) => blurInput(e, !!error)}
      />
      {error && (
        <span className="text-xs" style={{ color: '#FF6B6B' }}>
          {error}
        </span>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mt-2 mb-1">
      <div
        style={{ width: 3, height: 12, borderRadius: 99, background: '#E07B2A', flexShrink: 0 }}
      />
      <span
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: 'rgba(245,240,235,0.5)' }}
      >
        {children}
      </span>
    </div>
  )
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-4">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-1 rounded-full transition-all duration-300"
          style={{
            flex: i === current ? 2 : 1,
            background: i <= current ? '#E07B2A' : 'rgba(255,255,255,0.1)',
          }}
        />
      ))}
    </div>
  )
}

interface AddressBlockProps {
  prefix: '' | 'company'
  label: string
  values: RegisterCredentials
  errors: Record<string, { message: string } | undefined>
  handleChange: (field: keyof RegisterCredentials, value: string) => void
  handleBlur: (field: keyof RegisterCredentials) => void
}

function AddressBlock({
  prefix,
  label,
  values,
  errors,
  handleChange,
  handleBlur,
}: AddressBlockProps) {
  const [loading, setLoading] = useState(false)
  const [cepError, setCepError] = useState('')

  const cepKey = (prefix ? `${prefix}Cep` : 'cep') as keyof RegisterCredentials
  const streetKey = (prefix ? `${prefix}Street` : 'street') as keyof RegisterCredentials
  const neighborhoodKey = (
    prefix ? `${prefix}Neighborhood` : 'neighborhood'
  ) as keyof RegisterCredentials
  const cityKey = (prefix ? `${prefix}City` : 'city') as keyof RegisterCredentials
  const stateKey = (prefix ? `${prefix}State` : 'state') as keyof RegisterCredentials
  const numberKey = (
    prefix ? `${prefix}AddressNumber` : 'addressNumber'
  ) as keyof RegisterCredentials

  const handleCepChange = useCallback(
    async (raw: string) => {
      const formatted = formatCep(raw)
      handleChange(cepKey, formatted)
      setCepError('')

      const digits = raw.replace(/\D/g, '')
      if (digits.length === 8) {
        setLoading(true)
        const result = await lookupCep(digits)
        setLoading(false)
        if (result) {
          handleChange(streetKey, result.street)
          handleChange(neighborhoodKey, result.neighborhood)
          handleChange(cityKey, result.city)
          handleChange(stateKey, result.state)
        } else {
          setCepError('CEP não encontrado')
        }
      }
    },
    [cepKey, streetKey, neighborhoodKey, cityKey, stateKey, handleChange],
  )

  return (
    <div className="flex flex-col gap-2">
      <SectionTitle>{label}</SectionTitle>

      <div className="flex gap-2">
        <div className="flex flex-col gap-1" style={{ flex: '0 0 140px' }}>
          <label className="text-xs font-medium" style={{ color: 'rgba(245,240,235,0.7)' }}>
            CEP
          </label>
          <div className="relative">
            <input
              value={values[cepKey] as string}
              placeholder="00000-000"
              maxLength={9}
              onChange={(e) => handleCepChange(e.target.value)}
              onBlur={() => handleBlur(cepKey)}
              className="w-full px-3 py-2.5 rounded-lg text-white outline-none transition-all duration-200 text-sm"
              style={inputStyle(!!(errors[cepKey] || cepError))}
              onFocus={(e) => focusInput(e, !!(errors[cepKey] || cepError))}
              onBlurCapture={(e) => blurInput(e, !!(errors[cepKey] || cepError))}
            />
            {loading && (
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: '#E07B2A' }}
              >
                ...
              </span>
            )}
          </div>
          {(errors[cepKey] || cepError) && (
            <span className="text-xs" style={{ color: '#FF6B6B' }}>
              {errors[cepKey]?.message || cepError}
            </span>
          )}
        </div>

        <Field
          id={`${prefix}-number`}
          label="Número"
          value={values[numberKey] as string}
          placeholder="Nº"
          optional
          onChange={(v) => handleChange(numberKey, v)}
          onBlur={() => handleBlur(numberKey)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field
          id={`${prefix}-street`}
          label="Rua"
          value={values[streetKey] as string}
          placeholder="Rua / Av."
          disabled={loading}
          onChange={(v) => handleChange(streetKey, v)}
          onBlur={() => handleBlur(streetKey)}
        />
        <Field
          id={`${prefix}-neighborhood`}
          label="Bairro"
          value={values[neighborhoodKey] as string}
          placeholder="Bairro"
          disabled={loading}
          onChange={(v) => handleChange(neighborhoodKey, v)}
          onBlur={() => handleBlur(neighborhoodKey)}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <Field
            id={`${prefix}-city`}
            label="Cidade"
            value={values[cityKey] as string}
            placeholder="Cidade"
            disabled={loading}
            error={errors[cityKey]?.message}
            onChange={(v) => handleChange(cityKey, v)}
            onBlur={() => handleBlur(cityKey)}
          />
        </div>
        <Field
          id={`${prefix}-state`}
          label="Estado"
          value={values[stateKey] as string}
          placeholder="UF"
          disabled={loading}
          onChange={(v) => handleChange(stateKey, v)}
          onBlur={() => handleBlur(stateKey)}
        />
      </div>
    </div>
  )
}

interface RegisterFormProps {
  form: UseRegisterFormReturn
  onSuccess: (credentials: RegisterCredentials) => void
  isLoading?: boolean
}

export function RegisterForm({ form, onSuccess, isLoading }: RegisterFormProps) {
  const { values, errors, isSubmitting, handleChange, handleBlur, handleSubmit } = form
  const busy = isSubmitting || !!isLoading
  const [step, setStep] = useState(0)

  const isPro = values.roles.includes('profissional')
  const isCont = values.roles.includes('contratante')

  function selectRole(r: UserRole) {
    handleChange('role', r)
    handleChange('roles' as keyof RegisterCredentials, JSON.stringify([r]))
  }

  const totalSteps = 3
  const canGoNext = (() => {
    if (step === 0) {
      return (
        values.name.trim().length >= 3 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) &&
        values.roles.length === 1
      )
    }
    if (step === 1) {
      const cepOk = values.cep.replace(/\D/g, '').length === 8 && values.city.trim().length > 0
      if (!cepOk) return false
      if (isCont) {
        const compCepOk =
          values.companyCep.replace(/\D/g, '').length === 8 && values.companyCity.trim().length > 0
        if (!compCepOk) return false
        if (!values.companyName.trim()) return false
      }
      if (isPro && !values.profession.trim()) return false
      return true
    }
    return true
  })()

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        if (step < totalSteps - 1) {
          setStep((s) => s + 1)
          return
        }
        handleSubmit(onSuccess)
      }}
      className="flex flex-col gap-3"
    >
      <StepIndicator current={step} total={totalSteps} />

      {step === 0 && (
        <>
          <Field
            id="reg-name"
            label="Nome completo"
            value={values.name}
            placeholder="Seu nome"
            autoComplete="name"
            error={errors.name?.message}
            onChange={(v) => handleChange('name', v)}
            onBlur={() => handleBlur('name')}
          />

          <Field
            id="reg-email"
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
            <span className="text-xs font-medium" style={{ color: 'rgba(245,240,235,0.7)' }}>
              Tipo de conta
            </span>
            <div className="flex gap-2">
              {[
                {
                  value: 'profissional' as UserRole,
                  label: 'Profissional',
                  desc: 'Quero trabalhar em obras',
                  icon: '🪛',
                },
                {
                  value: 'contratante' as UserRole,
                  label: 'Contratante',
                  desc: 'Quero montar equipes',
                  icon: '🏗️',
                },
              ].map((r) => {
                const selected = values.roles.includes(r.value)
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => selectRole(r.value)}
                    className="flex-1 p-3 rounded-xl text-left transition-all duration-200 relative"
                    style={{
                      background: selected ? 'rgba(224,123,42,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1.5px solid ${selected ? '#E07B2A' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    <div
                      className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{
                        background: selected ? '#E07B2A' : 'rgba(255,255,255,0.08)',
                        border: `1.5px solid ${selected ? '#E07B2A' : 'rgba(255,255,255,0.15)'}`,
                      }}
                    >
                      {selected && (
                        <div
                          style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }}
                        />
                      )}
                    </div>
                    <p className="text-base mb-1">{r.icon}</p>
                    <p className="font-semibold text-sm text-white">{r.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,235,0.5)' }}>
                      {r.desc}
                    </p>
                  </button>
                )
              })}
            </div>
            {errors.role && (
              <span className="text-xs" style={{ color: '#FF6B6B' }}>
                {errors.role.message}
              </span>
            )}
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <AddressBlock
            prefix=""
            label="Seu endereço"
            values={values}
            errors={errors as Record<string, { message: string } | undefined>}
            handleChange={handleChange}
            handleBlur={handleBlur}
          />

          {isPro && (
            <>
              <SectionTitle>Dados profissionais</SectionTitle>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="reg-profession"
                  className="text-xs font-medium"
                  style={{ color: 'rgba(245,240,235,0.7)' }}
                >
                  Profissão
                </label>
                <select
                  id="reg-profession"
                  value={values.profession}
                  onChange={(e) => handleChange('profession', e.target.value)}
                  onBlur={() => handleBlur('profession')}
                  className="px-3 py-2.5 rounded-lg text-white outline-none transition-all duration-200 text-sm"
                  style={inputStyle(!!errors.profession)}
                >
                  <option value="" disabled style={{ background: '#1A1916' }}>
                    Selecione
                  </option>
                  {ALL_PROFESSIONS.map((p) => (
                    <option key={p} value={p} style={{ background: '#1A1916' }}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.profession && (
                  <span className="text-xs" style={{ color: '#FF6B6B' }}>
                    {errors.profession.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="reg-rate"
                  className="text-xs font-medium"
                  style={{ color: 'rgba(245,240,235,0.7)' }}
                >
                  Valor por hora <span style={{ color: 'rgba(245,240,235,0.3)' }}>(opcional)</span>
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
                    style={{ color: 'rgba(245,240,235,0.4)' }}
                  >
                    R$
                  </span>
                  <input
                    id="reg-rate"
                    type="number"
                    min={0}
                    value={values.hourlyRate}
                    placeholder="80"
                    onChange={(e) => handleChange('hourlyRate', e.target.value)}
                    className="w-full pl-9 pr-12 py-2.5 rounded-lg text-white outline-none transition-all duration-200 text-sm"
                    style={inputStyle()}
                    onFocus={(e) => focusInput(e)}
                    onBlur={(e) => blurInput(e)}
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: 'rgba(245,240,235,0.3)' }}
                  >
                    /hora
                  </span>
                </div>
              </div>
            </>
          )}

          {isCont && (
            <>
              <SectionTitle>Dados da empresa</SectionTitle>
              <Field
                id="reg-company"
                label="Nome da empresa"
                value={values.companyName}
                placeholder="Ex: Construtora Silva Ltda"
                error={errors.companyName?.message}
                onChange={(v) => handleChange('companyName', v)}
                onBlur={() => handleBlur('companyName')}
              />

              <AddressBlock
                prefix="company"
                label="Endereço da empresa"
                values={values}
                errors={errors as Record<string, { message: string } | undefined>}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />
            </>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <SectionTitle>Crie sua senha</SectionTitle>

          <Field
            id="reg-password"
            label="Senha"
            type="password"
            value={values.password}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            error={errors.password?.message}
            onChange={(v) => handleChange('password', v)}
            onBlur={() => handleBlur('password')}
          />

          <Field
            id="reg-confirm"
            label="Confirmar senha"
            type="password"
            value={values.confirmPassword}
            placeholder="Repita a senha"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            onChange={(v) => handleChange('confirmPassword', v)}
            onBlur={() => handleBlur('confirmPassword')}
          />
        </>
      )}

      <div className="flex gap-2 mt-1">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(245,240,235,0.7)',
              border: '1.5px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            Voltar
          </button>
        )}
        <button
          type="submit"
          disabled={step < totalSteps - 1 ? !canGoNext : busy}
          className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200"
          style={{
            background: (step < totalSteps - 1 ? !canGoNext : busy)
              ? 'rgba(224,123,42,0.4)'
              : '#E07B2A',
            cursor: (step < totalSteps - 1 ? !canGoNext : busy) ? 'not-allowed' : 'pointer',
          }}
        >
          {step < totalSteps - 1 ? 'Continuar' : busy ? 'Criando conta...' : 'Criar conta'}
        </button>
      </div>
    </form>
  )
}
