'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { ValidationError } from 'yup'

import { AvatarUpload } from '@/src/components/AvatarUpload'
import { BackButton } from '@/src/components/BackButton'
import { ConfirmDialog } from '@/src/components/ConfirmDialog'
import { useOpportunities } from '@/src/features/opportunity/hooks/useOpportunities'
import { passwordSchema, profileSchema } from '@/src/features/profile/validation/profileSchema'
import { useTeams } from '@/src/features/team/hooks/useTeams'
import { useToast } from '@/src/hooks/useToast'
import { api } from '@/src/services/api'
import { ALL_PROFESSIONS } from '@/src/types/professional.types'
import type { User, UserRole, Address } from '@/src/types/user.types'
import { lookupCep, formatCep } from '@/src/utils/cep'
import { formatDate } from '@/src/utils/date'

function saveUser(user: User) {
  localStorage.setItem('equobra_user', JSON.stringify(user))
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden mb-4"
      style={{
        background: 'var(--color-surface-overlay)',
        border: '1px solid var(--color-border-faint)',
      }}
    >
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <div
          style={{
            width: 3,
            height: 16,
            borderRadius: 99,
            background: 'var(--color-primary)',
            flexShrink: 0,
          }}
        />
        <h3 className="font-bold text-white" style={{ fontSize: 15 }}>
          {title}
        </h3>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function InputField({
  style,
  onFocus,
  onBlur,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const [isFocused, setIsFocused] = useState(false)
  const hasError = !!error
  const { flex, flexGrow, flexShrink, flexBasis, ...inputStyle } = (style ?? {}) as Record<
    string,
    unknown
  >
  const wrapperStyle =
    flex !== undefined || flexGrow !== undefined || flexShrink !== undefined
      ? ({ flex, flexGrow, flexShrink, flexBasis } as React.CSSProperties)
      : undefined
  return (
    <div style={wrapperStyle}>
      <input
        {...props}
        style={{
          width: '100%',
          background: isFocused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${hasError ? 'var(--color-danger-light)' : isFocused ? 'rgba(224,123,42,0.5)' : 'rgba(255,255,255,0.09)'}`,
          color: 'var(--color-text)',
          borderRadius: 10,
          padding: '9px 12px',
          fontSize: 13,
          outline: 'none',
          transition: 'border-color 0.15s, background 0.15s',
          ...(inputStyle as React.CSSProperties),
        }}
        onFocus={(e) => {
          setIsFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          onBlur?.(e)
        }}
      />
      {hasError && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-danger-light)' }}>
          {error}
        </p>
      )}
    </div>
  )
}

function readStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('equobra_user')
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function ProfilePage() {
  const [storedUser] = useState(readStoredUser)
  const [user, setUser] = useState<User | null>(storedUser)
  const loaded = true

  const [name, setName] = useState(storedUser?.name ?? '')
  const [roles, setRoles] = useState<UserRole[]>(
    storedUser?.roles ?? (storedUser ? [storedUser.role] : ['profissional']),
  )
  const [professions, setProfessions] = useState<string[]>(
    storedUser?.professions ?? (storedUser?.profession ? [storedUser.profession] : []),
  )
  const [profInput, setProfInput] = useState('')
  const [hourlyRate, setHourlyRate] = useState(
    storedUser?.hourlyRate != null ? String(storedUser.hourlyRate) : '',
  )
  const [showRate, setShowRate] = useState(storedUser?.showHourlyRate !== false)

  const [companyName, setCompanyName] = useState(storedUser?.companyName ?? '')
  const [cnpj, setCnpj] = useState(storedUser?.cnpj ?? '')
  const [website, setWebsite] = useState(storedUser?.website ?? '')
  const [instagram, setInstagram] = useState(storedUser?.instagram ?? '')
  const [facebook, setFacebook] = useState(storedUser?.facebook ?? '')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [cep, setCep] = useState(storedUser?.address?.cep ? formatCep(storedUser.address.cep) : '')
  const [street, setStreet] = useState(storedUser?.address?.street ?? '')
  const [neighborhood, setNeighborhood] = useState(storedUser?.address?.neighborhood ?? '')
  const [city, setCity] = useState(storedUser?.address?.city ?? '')
  const [addrState, setAddrState] = useState(storedUser?.address?.state ?? '')
  const [addrNumber, setAddrNumber] = useState(storedUser?.address?.number ?? '')
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')

  const [companyCep, setCompanyCep] = useState(
    storedUser?.companyAddress?.cep ? formatCep(storedUser.companyAddress.cep) : '',
  )
  const [companyStreet, setCompanyStreet] = useState(storedUser?.companyAddress?.street ?? '')
  const [companyNeighborhood, setCompanyNeighborhood] = useState(
    storedUser?.companyAddress?.neighborhood ?? '',
  )
  const [companyCity, setCompanyCity] = useState(storedUser?.companyAddress?.city ?? '')
  const [companyAddrState, setCompanyAddrState] = useState(storedUser?.companyAddress?.state ?? '')
  const [companyAddrNumber, setCompanyAddrNumber] = useState(
    storedUser?.companyAddress?.number ?? '',
  )
  const [companyCepLoading, setCompanyCepLoading] = useState(false)
  const [companyCepError, setCompanyCepError] = useState('')

  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [showPwCurrent, setShowPwCurrent] = useState(false)
  const [showPwNew, setShowPwNew] = useState(false)
  const [showPwConfirm, setShowPwConfirm] = useState(false)

  const [saveMsg, setSaveMsg] = useState('')
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null)
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null)
  const [removingAvatar, setRemovingAvatar] = useState(false)

  const toast = useToast()
  const { teams } = useTeams()
  const { publish, updateOpportunity, getContractorOpportunities } = useOpportunities()

  const [initialOpp] = useState(() => {
    if (!storedUser || storedUser.role !== 'contratante') return null
    return getContractorOpportunities(storedUser.id)[0] ?? null
  })

  const [myOppId] = useState<string | undefined>(initialOpp?.id)
  const [oppActive, setOppActive] = useState(initialOpp?.active ?? false)
  const [oppDescription, setOppDescription] = useState(initialOpp?.obraDescription ?? '')
  const [oppLocation, setOppLocation] = useState(initialOpp?.obraLocation ?? '')
  const [oppStart, setOppStart] = useState(initialOpp?.obraStart ?? '')
  const [oppDuration, setOppDuration] = useState(initialOpp?.obraDuration ?? '')
  const [oppProfessions, setOppProfessions] = useState<string[]>(
    initialOpp?.lookingForProfessions ?? [],
  )
  const [oppProfInput, setOppProfInput] = useState('')
  const [oppSaveMsg, setOppSaveMsg] = useState('')

  const myTeams = user
    ? teams.filter(
        (t) => t.ownerId === user.id || t.members.some((m) => m.professionalId === user.id),
      )
    : []

  if (!loaded)
    return (
      <div style={{ background: 'var(--color-background)', minHeight: '100vh' }}>
        <div
          style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px 0' }}
          className="flex flex-col gap-4"
        >
          <div
            className="rounded-2xl animate-pulse"
            style={{ height: 200, background: 'var(--color-border-subtle)' }}
          />
          <div
            className="rounded animate-pulse"
            style={{ height: 16, width: '60%', background: 'var(--color-border-subtle)' }}
          />
          <div
            className="rounded animate-pulse"
            style={{ height: 16, width: '40%', background: 'var(--color-border-subtle)' }}
          />
        </div>
      </div>
    )

  if (!user) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'var(--color-background)' }}
      >
        <p className="text-white font-semibold">Você precisa estar logado</p>
        <Link
          href="/auth"
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          Entrar
        </Link>
      </div>
    )
  }

  const isPro = roles.includes('profissional')
  const isCont = roles.includes('contratante')
  const displayName = isCont && companyName ? companyName : user.name

  async function handleCepChange(raw: string) {
    const formatted = formatCep(raw)
    setCep(formatted)
    setCepError('')
    const digits = raw.replace(/\D/g, '')
    if (digits.length === 8) {
      setCepLoading(true)
      const result = await lookupCep(digits)
      setCepLoading(false)
      if (result) {
        setStreet(result.street)
        setNeighborhood(result.neighborhood)
        setCity(result.city)
        setAddrState(result.state)
      } else setCepError('CEP não encontrado')
    }
  }

  async function handleCompanyCepChange(raw: string) {
    const formatted = formatCep(raw)
    setCompanyCep(formatted)
    setCompanyCepError('')
    const digits = raw.replace(/\D/g, '')
    if (digits.length === 8) {
      setCompanyCepLoading(true)
      const result = await lookupCep(digits)
      setCompanyCepLoading(false)
      if (result) {
        setCompanyStreet(result.street)
        setCompanyNeighborhood(result.neighborhood)
        setCompanyCity(result.city)
        setCompanyAddrState(result.state)
      } else setCompanyCepError('CEP não encontrado')
    }
  }

  function yupErrorsToRecord(err: ValidationError): Record<string, string> {
    const map: Record<string, string> = {}
    if (err.inner.length === 0 && err.path) {
      map[err.path] = err.message
    } else {
      for (const e of err.inner) {
        if (e.path && !map[e.path]) map[e.path] = e.message
      }
    }
    return map
  }

  async function handleSaveProfile() {
    setFieldErrors({})

    try {
      await profileSchema.validate(
        { name, roles, companyName, cnpj, website, instagram, facebook },
        { abortEarly: false, context: { isCont } },
      )
    } catch (err) {
      const errors = yupErrorsToRecord(err as ValidationError)
      setFieldErrors(errors)
      setShowSaveConfirm(false)
      const firstKey = Object.keys(errors)[0]
      const el = document.getElementById(`profile-${firstKey}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus()
      }
      return
    }

    const addrCep = cep.replace(/\D/g, '')
    const compAddrCep = companyCep.replace(/\D/g, '')

    const addressObj: Address | undefined =
      addrCep.length === 8
        ? { cep: addrCep, street, neighborhood, city, state: addrState, number: addrNumber }
        : user!.address

    const companyAddressObj: Address | undefined =
      isCont && compAddrCep.length === 8
        ? {
            cep: compAddrCep,
            street: companyStreet,
            neighborhood: companyNeighborhood,
            city: companyCity,
            state: companyAddrState,
            number: companyAddrNumber,
          }
        : user!.companyAddress

    try {
      // Upload avatar if pending or remove if flagged
      let resolvedAvatarUrl = user!.avatarUrl ?? null
      if (pendingAvatarFile) {
        const formData = new FormData()
        formData.append('avatar', pendingAvatarFile)
        const uploaded = await api.upload<User>('/api/upload/avatar', formData)
        resolvedAvatarUrl = uploaded.avatarUrl ?? null
        setPendingAvatarFile(null)
        setPendingAvatarPreview(null)
      } else if (removingAvatar) {
        await api.delete('/api/upload/avatar')
        resolvedAvatarUrl = null
        setRemovingAvatar(false)
      }

      const apiPayload = {
        name: name.trim(),
        role: roles[0],
        roles,
        professions,
        profession: professions[0] ?? user!.profession,
        hourlyRate: showRate && hourlyRate ? Number(hourlyRate) : null,
        showHourlyRate: showRate,
        avatarUrl: resolvedAvatarUrl,
        companyName: isCont ? companyName.trim() || null : null,
        cnpj: isCont ? cnpj.replace(/\D/g, '') || null : null,
        website: isCont ? website.trim() || null : null,
        instagram: isCont ? instagram.trim() || null : null,
        facebook: isCont ? facebook.trim() || null : null,
        addrCep: addressObj?.cep ?? null,
        addrStreet: addressObj?.street ?? null,
        addrNeighborhood: addressObj?.neighborhood ?? null,
        addrCity: addressObj?.city ?? null,
        addrState: addressObj?.state ?? null,
        addrNumber: addressObj?.number ?? null,
        compAddrCep: companyAddressObj?.cep ?? null,
        compAddrStreet: companyAddressObj?.street ?? null,
        compAddrNeighborhood: companyAddressObj?.neighborhood ?? null,
        compAddrCity: companyAddressObj?.city ?? null,
        compAddrState: companyAddressObj?.state ?? null,
        compAddrNumber: companyAddressObj?.number ?? null,
      }
      const apiUser = await api.patch<User>('/api/users/me', apiPayload)

      saveUser(apiUser)
      setUser(apiUser)
      toast.success('Perfil salvo com sucesso.')
      setSaveMsg('')
    } catch {
      const updated: User = {
        ...user!,
        name: name.trim(),
        role: roles[0],
        roles,
        professions,
        profession: professions[0] ?? user!.profession,
        hourlyRate: showRate && hourlyRate ? Number(hourlyRate) : undefined,
        showHourlyRate: showRate,
        companyName: isCont ? companyName.trim() : user!.companyName,
        cnpj: isCont ? cnpj.replace(/\D/g, '') : user!.cnpj,
        website: isCont ? website.trim() : user!.website,
        instagram: isCont ? instagram.trim() : user!.instagram,
        facebook: isCont ? facebook.trim() : user!.facebook,
        address: addressObj,
        companyAddress: companyAddressObj,
      }
      saveUser(updated)
      setUser(updated)
      toast.warning('Salvo localmente. Sem conexão com o servidor.')
    }

    setShowSaveConfirm(false)
  }

  function addProfession() {
    const v = profInput.trim()
    if (v && !professions.includes(v)) setProfessions((p) => [...p, v])
    setProfInput('')
  }

  function removeProfession(p: string) {
    setProfessions((prev) => prev.filter((x) => x !== p))
  }

  function handleToggleOpportunity(on: boolean) {
    if (!user) return
    if (!on) {
      if (myOppId) updateOpportunity(myOppId, { active: false })
      setOppActive(false)
      toast.info('Oportunidade removida do feed.')
    } else {
      setOppActive(true)
    }
  }

  async function handleSaveOpportunity() {
    if (!user) return
    if (!oppDescription.trim()) {
      toast.warning('Descreva a obra antes de publicar.')
      return
    }
    if (!oppLocation.trim()) {
      toast.warning('Informe a localização da obra.')
      return
    }
    if (oppProfessions.length === 0) {
      toast.warning('Adicione ao menos uma profissão necessária.')
      return
    }
    try {
      await publish({
        contractorId: user.id,
        contractorName: user.name,
        companyName: user.companyName,
        avatarInitials: user.name
          .split(' ')
          .slice(0, 2)
          .map((n) => n[0])
          .join('')
          .toUpperCase(),
        obraDescription: oppDescription.trim(),
        obraLocation: oppLocation.trim(),
        obraStart: oppStart || undefined,
        obraDuration: oppDuration.trim() || undefined,
        lookingForProfessions: oppProfessions,
        contactEmail: user.email,
      })
      setOppActive(true)
      setOppSaveMsg('Publicado!')
      setTimeout(() => setOppSaveMsg(''), 2000)
      toast.success('Oportunidade publicada! Profissionais já podem ver sua vaga.')
    } catch {
      toast.error('Erro ao publicar. Verifique se você está logado.')
    }
  }

  async function handleChangePassword() {
    setPwError('')
    setPwSuccess(false)

    try {
      await passwordSchema.validate(
        { currentPassword: pwCurrent, newPassword: pwNew, confirmPassword: pwConfirm },
        { abortEarly: true },
      )
    } catch (err) {
      const msg = (err as ValidationError).message
      setPwError(msg)
      toast.error(msg)
      return
    }

    try {
      await api.post('/api/auth/change-password', {
        currentPassword: pwCurrent,
        newPassword: pwNew,
      })
      setPwCurrent('')
      setPwNew('')
      setPwConfirm('')
      setPwSuccess(true)
      setTimeout(() => setPwSuccess(false), 3000)
      toast.success('Senha alterada com sucesso.')
    } catch {
      const msg = 'Senha atual incorreta ou erro ao alterar'
      setPwError(msg)
      toast.error(msg)
    }
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
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <BackButton href="/home" />
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-faint)' }}>
          Meu perfil
        </span>
        <div style={{ width: 40 }} />
      </div>

      {/* Hero header */}
      <div
        style={{
          background: 'linear-gradient(180deg, var(--color-primary-alpha-10) 0%, transparent 100%)',
          borderBottom: '1px solid var(--color-border-subtle)',
          padding: '32px 24px 28px',
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--color-primary)' }}
          >
            Meu perfil
          </p>
          <h1
            className="font-bold text-white"
            style={{ fontSize: 36, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 10 }}
          >
            {displayName}
          </h1>
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            {user.email}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {isPro && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{
                  background: 'var(--color-primary-alpha-15)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary-alpha-30)',
                }}
              >
                Profissional
              </span>
            )}
            {isCont && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{
                  background: 'var(--color-success-alpha-10)',
                  color: 'var(--color-success)',
                  border: '1px solid var(--color-success-alpha-20)',
                }}
              >
                Contratante
              </span>
            )}
            {isPro && user.showHourlyRate !== false && user.hourlyRate && (
              <span
                className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                style={{
                  background: 'var(--color-star-alpha-15)',
                  color: 'var(--color-star)',
                  border: '1px solid rgba(255,209,102,0.2)',
                }}
              >
                R$ {user.hourlyRate}/h
              </span>
            )}
            {user.address?.city && (
              <span
                className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{
                  background: 'var(--color-surface-overlay)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border-medium)',
                }}
              >
                {user.address.city}, {user.address.state}
              </span>
            )}
          </div>
          <div className="flex items-center gap-6 mt-5">
            <div>
              <p
                className="font-bold text-white"
                style={{ fontSize: 20, lineHeight: 1, letterSpacing: '-0.02em' }}
              >
                {myTeams.length}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                equipe{myTeams.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ width: 1, height: 28, background: 'var(--color-border-medium)' }} />
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-faint)' }}>
                {user.createdAt
                  ? `Membro desde ${formatDate(user.createdAt.slice(0, 10))}`
                  : 'Novo membro'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px 40px' }}>
        <div className="pt-5">
          <Section title="Dados pessoais">
            <div
              className="mb-5 pb-5"
              style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
            >
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-muted)' }}>
                Foto de perfil
              </p>
              <AvatarUpload
                user={user}
                pendingPreview={pendingAvatarPreview}
                onFileReady={(file, preview) => {
                  setPendingAvatarFile(file)
                  setPendingAvatarPreview(preview)
                  setRemovingAvatar(false)
                }}
                onClear={() => {
                  if (pendingAvatarPreview) {
                    // só descarta o pending, não remove a foto atual
                    setPendingAvatarFile(null)
                    setPendingAvatarPreview(null)
                  } else {
                    // marca para remoção da foto atual ao salvar
                    setRemovingAvatar(true)
                    setUser((u) => (u ? { ...u, avatarUrl: undefined } : u))
                  }
                }}
              />
            </div>

            <Field label="Nome completo">
              <InputField
                id="profile-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setFieldErrors((prev) => ({ ...prev, name: '' }))
                }}
                placeholder="Seu nome"
                error={fieldErrors.name}
              />
            </Field>

            <Field label="Tipo de conta">
              <p className="text-xs mb-2" style={{ color: 'rgba(245,240,235,0.3)' }}>
                Selecione apenas um tipo
              </p>
              <div className="flex gap-2">
                {[
                  {
                    v: 'profissional' as UserRole,
                    l: 'Profissional',
                    desc: 'Quero trabalhar em obras',
                  },
                  { v: 'contratante' as UserRole, l: 'Contratante', desc: 'Quero montar equipes' },
                ].map((r) => {
                  const sel = roles[0] === r.v
                  return (
                    <button
                      key={r.v}
                      onClick={() => setRoles([r.v])}
                      className="flex-1 p-3 rounded-xl text-left transition-all relative"
                      style={{
                        background: sel ? 'rgba(224,123,42,0.15)' : 'rgba(255,255,255,0.04)',
                        color: sel ? 'var(--color-primary)' : 'rgba(245,240,235,0.4)',
                        border: `1px solid ${sel ? 'rgba(224,123,42,0.4)' : 'rgba(255,255,255,0.07)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          flexShrink: 0,
                          background: sel ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
                          border: `1.5px solid ${sel ? 'var(--color-primary)' : 'rgba(255,255,255,0.15)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {sel && (
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: 'white',
                            }}
                          />
                        )}
                      </div>
                      <p className="text-xs font-bold">{r.l}</p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: 'rgba(245,240,235,0.35)', fontSize: 10 }}
                      >
                        {r.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </Field>

            {isCont && (
              <>
                <Field label="Nome da empresa *">
                  <InputField
                    id="profile-companyName"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value)
                      setFieldErrors((prev) => ({ ...prev, companyName: '' }))
                    }}
                    placeholder="Ex: Construtora Silva Ltda"
                    error={fieldErrors.companyName}
                  />
                </Field>
                <Field label="CNPJ *">
                  <InputField
                    id="profile-cnpj"
                    value={cnpj}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 14)
                      const formatted = digits
                        .replace(/^(\d{2})(\d)/, '$1.$2')
                        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                        .replace(/\.(\d{3})(\d)/, '.$1/$2')
                        .replace(/(\d{4})(\d)/, '$1-$2')
                      setCnpj(formatted)
                      setFieldErrors((prev) => ({ ...prev, cnpj: '' }))
                    }}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    error={fieldErrors.cnpj}
                  />
                </Field>
                <Field label="Site (opcional)">
                  <InputField
                    id="profile-website"
                    value={website}
                    onChange={(e) => {
                      setWebsite(e.target.value)
                      setFieldErrors((prev) => ({ ...prev, website: '' }))
                    }}
                    placeholder="https://suaempresa.com.br"
                    error={fieldErrors.website}
                  />
                </Field>
                <Field label="Instagram (opcional)">
                  <div
                    className="flex items-center w-full"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${fieldErrors.instagram ? 'var(--color-danger-light)' : 'rgba(255,255,255,0.09)'}`,
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}
                  >
                    <span
                      className="text-sm px-3"
                      style={{ color: 'rgba(245,240,235,0.35)', flexShrink: 0 }}
                    >
                      @
                    </span>
                    <input
                      id="profile-instagram"
                      value={instagram}
                      onChange={(e) => {
                        setInstagram(e.target.value.replace(/^@/, ''))
                        setFieldErrors((prev) => ({ ...prev, instagram: '' }))
                      }}
                      placeholder="suaempresa"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--color-text)',
                        padding: '9px 12px 9px 0',
                        fontSize: 13,
                      }}
                    />
                  </div>
                  {fieldErrors.instagram && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-danger-light)' }}>
                      {fieldErrors.instagram}
                    </p>
                  )}
                </Field>
                <Field label="Facebook (opcional)">
                  <div
                    className="flex items-center w-full"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${fieldErrors.facebook ? 'var(--color-danger-light)' : 'rgba(255,255,255,0.09)'}`,
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}
                  >
                    <span className="flex items-center px-3" style={{ flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(245,240,235,0.35)">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    </span>
                    <input
                      id="profile-facebook"
                      value={facebook}
                      onChange={(e) => {
                        setFacebook(e.target.value)
                        setFieldErrors((prev) => ({ ...prev, facebook: '' }))
                      }}
                      placeholder="facebook.com/suaempresa ou nome de usuário"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--color-text)',
                        padding: '9px 12px 9px 0',
                        fontSize: 13,
                      }}
                    />
                  </div>
                  {fieldErrors.facebook && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-danger-light)' }}>
                      {fieldErrors.facebook}
                    </p>
                  )}
                </Field>
              </>
            )}

            {isPro && (
              <Field label="Profissões">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {professions.length === 0 && (
                    <p className="text-xs" style={{ color: 'rgba(245,240,235,0.25)' }}>
                      Nenhuma profissão adicionada
                    </p>
                  )}
                  {professions.map((p) => (
                    <span
                      key={p}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(224,123,42,0.12)',
                        color: 'var(--color-primary)',
                        border: '1px solid rgba(224,123,42,0.25)',
                      }}
                    >
                      {p}
                      <button
                        onClick={() => removeProfession(p)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'rgba(224,123,42,0.6)',
                          padding: 0,
                          lineHeight: 1,
                          display: 'flex',
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2 2L10 10M10 2L2 10"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    value={profInput}
                    onChange={(e) => setProfInput(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      color: profInput ? 'var(--color-text)' : 'rgba(245,240,235,0.35)',
                      borderRadius: 10,
                      padding: '9px 12px',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  >
                    <option value="" style={{ background: '#1A1916' }}>
                      Selecione uma profissão...
                    </option>
                    {ALL_PROFESSIONS.filter((p) => !professions.includes(p)).map((p) => (
                      <option key={p} value={p} style={{ background: '#1A1916' }}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addProfession}
                    style={{
                      padding: '9px 14px',
                      borderRadius: 10,
                      background: 'rgba(224,123,42,0.15)',
                      color: 'var(--color-primary)',
                      border: '1px solid rgba(224,123,42,0.3)',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    + Adicionar
                  </button>
                </div>
              </Field>
            )}

            {isPro && (
              <Field label="Valor por hora">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs" style={{ color: 'rgba(245,240,235,0.45)' }}>
                    {showRate ? 'Visível para contratantes' : 'Oculto — aparece como "A combinar"'}
                  </p>
                  <button
                    onClick={() => setShowRate((v) => !v)}
                    style={{
                      width: 40,
                      height: 22,
                      borderRadius: 99,
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      flexShrink: 0,
                      background: showRate ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.2s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: showRate ? 21 : 3,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: 'white',
                        transition: 'left 0.2s',
                        display: 'block',
                      }}
                    />
                  </button>
                </div>
                {showRate && (
                  <div
                    className="flex items-center w-full"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}
                  >
                    <span
                      className="text-sm font-semibold px-3"
                      style={{ color: 'rgba(245,240,235,0.4)', flexShrink: 0 }}
                    >
                      R$
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="Ex: 85"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--color-text)',
                        padding: '9px 0',
                        fontSize: 13,
                      }}
                    />
                    <span
                      className="text-sm px-3"
                      style={{ color: 'rgba(245,240,235,0.4)', flexShrink: 0 }}
                    >
                      /h
                    </span>
                  </div>
                )}
              </Field>
            )}

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div
                  style={{
                    width: 3,
                    height: 12,
                    borderRadius: 99,
                    background: 'var(--color-primary)',
                    flexShrink: 0,
                  }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'rgba(245,240,235,0.4)' }}
                >
                  Seu endereço
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="col-span-2">
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'rgba(245,240,235,0.4)' }}
                  >
                    CEP
                  </label>
                  <div className="relative">
                    <InputField
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {cepLoading && (
                      <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        ...
                      </span>
                    )}
                  </div>
                  {cepError && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-danger-light)' }}>
                      {cepError}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'rgba(245,240,235,0.4)' }}
                  >
                    Número
                  </label>
                  <InputField
                    value={addrNumber}
                    onChange={(e) => setAddrNumber(e.target.value)}
                    placeholder="Nº"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'rgba(245,240,235,0.4)' }}
                  >
                    Rua
                  </label>
                  <InputField
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Rua / Av."
                    disabled={cepLoading}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'rgba(245,240,235,0.4)' }}
                  >
                    Bairro
                  </label>
                  <InputField
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Bairro"
                    disabled={cepLoading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'rgba(245,240,235,0.4)' }}
                  >
                    Cidade
                  </label>
                  <InputField
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cidade"
                    disabled={cepLoading}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'rgba(245,240,235,0.4)' }}
                  >
                    Estado
                  </label>
                  <InputField
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    placeholder="UF"
                    disabled={cepLoading}
                  />
                </div>
              </div>
            </div>

            {isCont && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    style={{
                      width: 3,
                      height: 12,
                      borderRadius: 99,
                      background: 'var(--color-success)',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'rgba(245,240,235,0.4)' }}
                  >
                    Endereço da empresa
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="col-span-2">
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: 'rgba(245,240,235,0.4)' }}
                    >
                      CEP
                    </label>
                    <div className="relative">
                      <InputField
                        value={companyCep}
                        onChange={(e) => handleCompanyCepChange(e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      {companyCepLoading && (
                        <span
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          ...
                        </span>
                      )}
                    </div>
                    {companyCepError && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-danger-light)' }}>
                        {companyCepError}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: 'rgba(245,240,235,0.4)' }}
                    >
                      Número
                    </label>
                    <InputField
                      value={companyAddrNumber}
                      onChange={(e) => setCompanyAddrNumber(e.target.value)}
                      placeholder="Nº"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: 'rgba(245,240,235,0.4)' }}
                    >
                      Rua
                    </label>
                    <InputField
                      value={companyStreet}
                      onChange={(e) => setCompanyStreet(e.target.value)}
                      placeholder="Rua / Av."
                      disabled={companyCepLoading}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: 'rgba(245,240,235,0.4)' }}
                    >
                      Bairro
                    </label>
                    <InputField
                      value={companyNeighborhood}
                      onChange={(e) => setCompanyNeighborhood(e.target.value)}
                      placeholder="Bairro"
                      disabled={companyCepLoading}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: 'rgba(245,240,235,0.4)' }}
                    >
                      Cidade
                    </label>
                    <InputField
                      value={companyCity}
                      onChange={(e) => setCompanyCity(e.target.value)}
                      placeholder="Cidade"
                      disabled={companyCepLoading}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: 'rgba(245,240,235,0.4)' }}
                    >
                      Estado
                    </label>
                    <InputField
                      value={companyAddrState}
                      onChange={(e) => setCompanyAddrState(e.target.value)}
                      placeholder="UF"
                      disabled={companyCepLoading}
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowSaveConfirm(true)}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
              }}
            >
              {saveMsg || 'Salvar alterações'}
            </button>
          </Section>

          <Section title="Alterar senha">
            <Field label="Senha atual">
              <div className="relative">
                <InputField
                  type={showPwCurrent ? 'text' : 'password'}
                  value={pwCurrent}
                  onChange={(e) => setPwCurrent(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(245,240,235,0.35)', cursor: 'pointer' }}
                >
                  <EyeIcon open={showPwCurrent} />
                </button>
              </div>
            </Field>
            <Field label="Nova senha">
              <div className="relative">
                <InputField
                  type={showPwNew ? 'text' : 'password'}
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(245,240,235,0.35)', cursor: 'pointer' }}
                >
                  <EyeIcon open={showPwNew} />
                </button>
              </div>
            </Field>
            <Field label="Confirmar nova senha">
              <div className="relative">
                <InputField
                  type={showPwConfirm ? 'text' : 'password'}
                  value={pwConfirm}
                  onChange={(e) => setPwConfirm(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingRight: 40 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleChangePassword()
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(245,240,235,0.35)', cursor: 'pointer' }}
                >
                  <EyeIcon open={showPwConfirm} />
                </button>
              </div>
            </Field>
            {pwError && (
              <p className="text-xs mb-3" style={{ color: 'var(--color-danger-light)' }}>
                {pwError}
              </p>
            )}
            {pwSuccess && (
              <p className="text-xs mb-3" style={{ color: 'var(--color-success)' }}>
                Senha alterada com sucesso!
              </p>
            )}
            <button
              onClick={handleChangePassword}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{
                background: 'var(--color-primary-alpha-15)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary-alpha-30)',
                cursor: 'pointer',
              }}
            >
              Alterar senha
            </button>
          </Section>

          {isCont && (
            <Section title="Estou buscando profissionais">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {oppActive ? 'Visível no feed de oportunidades' : 'Oculto do feed'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,235,0.35)' }}>
                    {oppActive
                      ? 'Profissionais estão vendo sua obra'
                      : 'Ative para atrair profissionais para sua obra'}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleOpportunity(!oppActive)}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 99,
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    flexShrink: 0,
                    background: oppActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.2s',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 3,
                      left: oppActive ? 23 : 3,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'white',
                      transition: 'left 0.2s',
                      display: 'block',
                    }}
                  />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <Field label="Descrição da obra *">
                  <textarea
                    value={oppDescription}
                    onChange={(e) => setOppDescription(e.target.value)}
                    placeholder="Ex: Reforma de apartamento 80m², troca de revestimentos e pintura..."
                    rows={3}
                    style={{
                      width: '100%',
                      resize: 'none',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      color: 'var(--color-text)',
                      borderRadius: 10,
                      padding: '9px 12px',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="Localização *">
                    <InputField
                      value={oppLocation}
                      onChange={(e) => setOppLocation(e.target.value)}
                      placeholder="Ex: São Paulo, SP"
                    />
                  </Field>
                  <Field label="Previsão de início">
                    <InputField
                      type="date"
                      value={oppStart}
                      onChange={(e) => setOppStart(e.target.value)}
                      placeholder=""
                    />
                  </Field>
                </div>

                <Field label="Duração estimada">
                  <InputField
                    value={oppDuration}
                    onChange={(e) => setOppDuration(e.target.value)}
                    placeholder="Ex: 30 dias, 2 meses..."
                  />
                </Field>

                <Field label="Profissões necessárias *">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {oppProfessions.length === 0 && (
                      <p className="text-xs" style={{ color: 'rgba(245,240,235,0.25)' }}>
                        Nenhuma adicionada
                      </p>
                    )}
                    {oppProfessions.map((p) => (
                      <span
                        key={p}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                        style={{
                          background: 'rgba(224,123,42,0.12)',
                          color: 'var(--color-primary)',
                          border: '1px solid rgba(224,123,42,0.25)',
                        }}
                      >
                        {p}
                        <button
                          onClick={() => setOppProfessions((prev) => prev.filter((x) => x !== p))}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'rgba(224,123,42,0.6)',
                            padding: 0,
                            lineHeight: 1,
                            display: 'flex',
                          }}
                        >
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2 2L10 10M10 2L2 10"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={oppProfInput}
                      onChange={(e) => setOppProfInput(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: oppProfInput ? '#F5F0EB' : 'rgba(245,240,235,0.35)',
                        borderRadius: 10,
                        padding: '9px 12px',
                        fontSize: 13,
                        outline: 'none',
                      }}
                    >
                      <option value="" style={{ background: '#1A1916' }}>
                        Selecione...
                      </option>
                      {ALL_PROFESSIONS.filter((p) => !oppProfessions.includes(p)).map((p) => (
                        <option key={p} value={p} style={{ background: '#1A1916' }}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (oppProfInput && !oppProfessions.includes(oppProfInput)) {
                          setOppProfessions((prev) => [...prev, oppProfInput])
                          setOppProfInput('')
                        }
                      }}
                      style={{
                        padding: '9px 14px',
                        borderRadius: 10,
                        background: 'rgba(224,123,42,0.15)',
                        color: 'var(--color-primary)',
                        border: '1px solid rgba(224,123,42,0.3)',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </Field>

                {oppSaveMsg && (
                  <p
                    className="text-xs px-3 py-2 rounded-xl"
                    style={{
                      background: oppSaveMsg.startsWith('Publicado')
                        ? 'rgba(76,175,80,0.1)'
                        : 'rgba(229,57,53,0.1)',
                      color: oppSaveMsg.startsWith('Publicado')
                        ? 'var(--color-success)'
                        : 'var(--color-danger-light)',
                      border: `1px solid ${oppSaveMsg.startsWith('Publicado') ? 'rgba(76,175,80,0.2)' : 'rgba(229,57,53,0.2)'}`,
                    }}
                  >
                    {oppSaveMsg}
                  </p>
                )}

                <button
                  onClick={handleSaveOpportunity}
                  className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {oppActive ? 'Atualizar oportunidade' : 'Publicar no feed de profissionais'}
                </button>
              </div>
            </Section>
          )}

          <Link
            href="/my-teams"
            className="flex items-center justify-between w-full rounded-2xl transition-all hover:opacity-90"
            style={{
              background:
                'linear-gradient(135deg, var(--color-primary-alpha-15) 0%, var(--color-primary-alpha-10) 100%)',
              border: '1px solid var(--color-primary-alpha-30)',
              padding: '18px 20px',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="rounded-xl flex items-center justify-center shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  background: 'var(--color-primary-alpha-20)',
                  border: '1px solid var(--color-primary-alpha-30)',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-white" style={{ fontSize: 15 }}>
                  Minhas equipes
                </p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-primary)' }}>
                  {myTeams.length} equipe{myTeams.length !== 1 ? 's' : ''} ativa
                  {myTeams.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M5 2l5 5-5 5"
                stroke="var(--color-primary)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        </div>
      </div>

      {showSaveConfirm && (
        <ConfirmDialog
          title="Salvar alterações?"
          description="As informações do seu perfil serão atualizadas."
          confirmLabel="Salvar"
          variant="warning"
          onConfirm={handleSaveProfile}
          onCancel={() => setShowSaveConfirm(false)}
        />
      )}
    </div>
  )
}
