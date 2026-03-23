'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ConfirmDialog } from '@/src/components/ConfirmDialog'
import { useOpportunities } from '@/src/features/opportunity/hooks/useOpportunities'
import { useTeams } from '@/src/features/team/hooks/useTeams'
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
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="px-5 py-3 flex items-center gap-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div
          style={{ width: 3, height: 14, borderRadius: 99, background: '#E07B2A', flexShrink: 0 }}
        />
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: 'rgba(245,240,235,0.4)' }}
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
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [isFocused, setIsFocused] = useState(false)
  return (
    <input
      {...props}
      style={{
        width: '100%',
        background: isFocused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isFocused ? 'rgba(224,123,42,0.5)' : 'rgba(255,255,255,0.09)'}`,
        color: '#F5F0EB',
        borderRadius: 10,
        padding: '9px 12px',
        fontSize: 13,
        outline: 'none',
        transition: 'border-color 0.15s, background 0.15s',
        ...style,
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
  )
}

export function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loaded, setLoaded] = useState(false)

  const [name, setName] = useState('')
  const [roles, setRoles] = useState<UserRole[]>(['profissional'])
  const [professions, setProfessions] = useState<string[]>([])
  const [profInput, setProfInput] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [showRate, setShowRate] = useState(true)

  const [companyName, setCompanyName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [saveError, setSaveError] = useState('')

  const [cep, setCep] = useState('')
  const [street, setStreet] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [addrState, setAddrState] = useState('')
  const [addrNumber, setAddrNumber] = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')

  const [companyCep, setCompanyCep] = useState('')
  const [companyStreet, setCompanyStreet] = useState('')
  const [companyNeighborhood, setCompanyNeighborhood] = useState('')
  const [companyCity, setCompanyCity] = useState('')
  const [companyAddrState, setCompanyAddrState] = useState('')
  const [companyAddrNumber, setCompanyAddrNumber] = useState('')
  const [companyCepLoading, setCompanyCepLoading] = useState(false)
  const [companyCepError, setCompanyCepError] = useState('')

  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const [saveMsg, setSaveMsg] = useState('')
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  const [oppActive, setOppActive] = useState(false)
  const [oppDescription, setOppDescription] = useState('')
  const [oppLocation, setOppLocation] = useState('')
  const [oppStart, setOppStart] = useState('')
  const [oppDuration, setOppDuration] = useState('')
  const [oppProfessions, setOppProfessions] = useState<string[]>([])
  const [oppProfInput, setOppProfInput] = useState('')
  const [oppSaveMsg, setOppSaveMsg] = useState('')

  const { teams } = useTeams()
  const { publish, updateOpportunity, getContractorOpportunities } = useOpportunities()
  const [myOppId, setMyOppId] = useState<string | undefined>()

  useEffect(() => {
    try {
      const raw = localStorage.getItem('equobra_user')
      if (raw) {
        const u = JSON.parse(raw) as User
        setUser(u)
        setName(u.name)
        setRoles(u.roles ?? [u.role])
        setProfessions(u.professions ?? (u.profession ? [u.profession] : []))
        setHourlyRate(u.hourlyRate != null ? String(u.hourlyRate) : '')
        setShowRate(u.showHourlyRate !== false)
        setCompanyName(u.companyName ?? '')
        setCnpj(u.cnpj ?? '')
        setWebsite(u.website ?? '')
        setInstagram(u.instagram ?? '')
        setFacebook(u.facebook ?? '')
        if (u.address) {
          setCep(u.address.cep ? formatCep(u.address.cep) : '')
          setStreet(u.address.street ?? '')
          setNeighborhood(u.address.neighborhood ?? '')
          setCity(u.address.city ?? '')
          setAddrState(u.address.state ?? '')
          setAddrNumber(u.address.number ?? '')
        }
        if (u.companyAddress) {
          setCompanyCep(u.companyAddress.cep ? formatCep(u.companyAddress.cep) : '')
          setCompanyStreet(u.companyAddress.street ?? '')
          setCompanyNeighborhood(u.companyAddress.neighborhood ?? '')
          setCompanyCity(u.companyAddress.city ?? '')
          setCompanyAddrState(u.companyAddress.state ?? '')
          setCompanyAddrNumber(u.companyAddress.number ?? '')
        }
        if (u.role === 'contratante') {
          const existing = getContractorOpportunities(u.id)[0]
          if (existing) {
            setMyOppId(existing.id)
            setOppActive(existing.active)
            setOppDescription(existing.obraDescription)
            setOppLocation(existing.obraLocation)
            setOppStart(existing.obraStart ?? '')
            setOppDuration(existing.obraDuration ?? '')
            setOppProfessions(existing.lookingForProfessions)
          }
        }
      }
    } catch {}
    setLoaded(true)
  }, [getContractorOpportunities])

  const myTeams = user
    ? teams.filter(
        (t) => t.ownerId === user.id || t.members.some((m) => m.professionalId === user.id),
      )
    : []

  if (!loaded) return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px 0' }} className="flex flex-col gap-4">
        <div className="rounded-2xl animate-pulse" style={{ height: 200, background: 'var(--color-border-subtle)' }} />
        <div className="rounded animate-pulse" style={{ height: 16, width: '60%', background: 'var(--color-border-subtle)' }} />
        <div className="rounded animate-pulse" style={{ height: 16, width: '40%', background: 'var(--color-border-subtle)' }} />
      </div>
    </div>
  )

  if (!user) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#0D0C0B' }}
      >
        <p className="text-white font-semibold">Você precisa estar logado</p>
        <Link
          href="/auth"
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: '#E07B2A' }}
        >
          Entrar
        </Link>
      </div>
    )
  }

  const isPro = roles.includes('profissional')
  const isCont = roles.includes('contratante')
  const displayName = isCont && companyName ? companyName : user.name
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

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

  async function handleSaveProfile() {
    setSaveError('')

    if (!name.trim()) {
      setSaveError('Nome é obrigatório')
      setShowSaveConfirm(false)
      return
    }
    if (roles.length === 0) {
      setSaveError('Selecione um tipo de conta')
      setShowSaveConfirm(false)
      return
    }

    if (isCont) {
      if (!companyName.trim()) {
        setSaveError('Nome da empresa é obrigatório')
        setShowSaveConfirm(false)
        return
      }
      if (!cnpj.trim()) {
        setSaveError('CNPJ é obrigatório')
        setShowSaveConfirm(false)
        return
      }
      const cnpjDigits = cnpj.replace(/\D/g, '')
      if (cnpjDigits.length !== 14) {
        setSaveError('CNPJ deve ter 14 dígitos')
        setShowSaveConfirm(false)
        return
      }
      if (website.trim() && !/^https?:\/\/.+\..+/.test(website.trim())) {
        setSaveError('URL do site inválida (ex: https://site.com)')
        setShowSaveConfirm(false)
        return
      }
      if (instagram.trim() && /\s/.test(instagram.trim())) {
        setSaveError('Instagram inválido')
        setShowSaveConfirm(false)
        return
      }
      if (facebook.trim() && /\s/.test(facebook.trim())) {
        setSaveError('Facebook inválido')
        setShowSaveConfirm(false)
        return
      }
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
      const apiPayload = {
        name: name.trim(),
        professions,
        profession: professions[0] ?? user!.profession,
        hourlyRate: showRate && hourlyRate ? Number(hourlyRate) : null,
        showHourlyRate: showRate,
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
    }

    setSaveMsg('Salvo!')
    setTimeout(() => setSaveMsg(''), 2500)
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
      setOppSaveMsg('Oportunidade removida do feed.')
      setTimeout(() => setOppSaveMsg(''), 3000)
    } else {
      setOppActive(true)
    }
  }

  async function handleSaveOpportunity() {
    if (!user) return
    if (!oppDescription.trim()) {
      setOppSaveMsg('Descreva a obra')
      return
    }
    if (!oppLocation.trim()) {
      setOppSaveMsg('Informe a localização')
      return
    }
    if (oppProfessions.length === 0) {
      setOppSaveMsg('Adicione ao menos uma profissão')
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
      setOppSaveMsg('Publicado! Profissionais já podem ver sua oportunidade.')
      setTimeout(() => setOppSaveMsg(''), 4000)
    } catch {
      setOppSaveMsg('Erro ao publicar. Verifique se você está logado.')
      setTimeout(() => setOppSaveMsg(''), 4000)
    }
  }

  function handleChangePassword() {
    setPwError('')
    setPwSuccess(false)
    const stored = localStorage.getItem('equobra_password') ?? '123456'
    if (pwCurrent !== stored) {
      setPwError('Senha atual incorreta')
      return
    }
    if (pwNew.length < 6) {
      setPwError('A nova senha precisa ter pelo menos 6 caracteres')
      return
    }
    if (pwNew !== pwConfirm) {
      setPwError('As senhas não coincidem')
      return
    }
    localStorage.setItem('equobra_password', pwNew)
    setPwCurrent('')
    setPwNew('')
    setPwConfirm('')
    setPwSuccess(true)
    setTimeout(() => setPwSuccess(false), 3000)
  }

  return (
    <div style={{ background: '#0D0C0B', minHeight: '100vh' }}>
      <div
        style={{
          height: 3,
          background: 'linear-gradient(to right, #E07B2A, #E07B2A44, transparent)',
        }}
      />

      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <button
          onClick={() => router.push('/home')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(245,240,235,0.5)',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 14,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Voltar
        </button>
        <span className="text-xs font-medium" style={{ color: 'rgba(245,240,235,0.25)' }}>
          Meu perfil
        </span>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px 40px' }}>
        <div
          className="py-6 flex items-center gap-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="rounded-full flex items-center justify-center font-bold text-xl shrink-0"
            style={{
              width: 64,
              height: 64,
              background: 'rgba(224,123,42,0.15)',
              color: '#E07B2A',
              border: '2px solid rgba(224,123,42,0.45)',
              boxShadow: '0 0 0 4px rgba(224,123,42,0.08), 0 4px 20px rgba(224,123,42,0.12)',
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className="font-bold text-white text-xl leading-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              {displayName}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(245,240,235,0.4)' }}>
              {user.email}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {isPro && (
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{
                    background: 'rgba(224,123,42,0.12)',
                    color: '#E07B2A',
                    border: '1px solid rgba(224,123,42,0.25)',
                  }}
                >
                  Profissional
                </span>
              )}
              {isCont && (
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{
                    background: 'rgba(76,175,80,0.12)',
                    color: '#66BB6A',
                    border: '1px solid rgba(76,175,80,0.25)',
                  }}
                >
                  Contratante
                </span>
              )}
              {isPro && user.showHourlyRate !== false && user.hourlyRate && (
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{
                    background: 'rgba(255,209,102,0.1)',
                    color: '#FFD166',
                    border: '1px solid rgba(255,209,102,0.2)',
                  }}
                >
                  R$ {user.hourlyRate}/h
                </span>
              )}
              {user.address?.city && (
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(245,240,235,0.5)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {user.address.city}, {user.address.state}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs" style={{ color: 'rgba(245,240,235,0.28)' }}>
                {user.createdAt
                  ? `Desde ${formatDate(user.createdAt.slice(0, 10))}`
                  : 'Novo membro'}
              </span>
              <span style={{ color: 'rgba(245,240,235,0.12)' }}>·</span>
              <span className="text-xs" style={{ color: 'rgba(245,240,235,0.28)' }}>
                {myTeams.length} {myTeams.length === 1 ? 'equipe' : 'equipes'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <Section title="Dados pessoais">
            <Field label="Nome completo">
              <InputField
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
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
                        color: sel ? '#E07B2A' : 'rgba(245,240,235,0.4)',
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
                          background: sel ? '#E07B2A' : 'rgba(255,255,255,0.08)',
                          border: `1.5px solid ${sel ? '#E07B2A' : 'rgba(255,255,255,0.15)'}`,
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
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Construtora Silva Ltda"
                  />
                </Field>
                <Field label="CNPJ *">
                  <InputField
                    value={cnpj}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 14)
                      const formatted = digits
                        .replace(/^(\d{2})(\d)/, '$1.$2')
                        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                        .replace(/\.(\d{3})(\d)/, '.$1/$2')
                        .replace(/(\d{4})(\d)/, '$1-$2')
                      setCnpj(formatted)
                    }}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                </Field>
                <Field label="Site (opcional)">
                  <InputField
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://suaempresa.com.br"
                  />
                </Field>
                <Field label="Instagram (opcional)">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'rgba(245,240,235,0.4)' }}>
                      @
                    </span>
                    <InputField
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value.replace(/^@/, ''))}
                      placeholder="suaempresa"
                      style={{ flex: 1 }}
                    />
                  </div>
                </Field>
                <Field label="Facebook (opcional)">
                  <div className="flex items-center gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="rgba(245,240,235,0.4)"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    <InputField
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      placeholder="facebook.com/suaempresa ou nome de usuário"
                      style={{ flex: 1 }}
                    />
                  </div>
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
                        color: '#E07B2A',
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
                  <InputField
                    value={profInput}
                    onChange={(e) => setProfInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addProfession()
                      }
                    }}
                    placeholder="Ex: Pedreiro, Eletricista..."
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={addProfession}
                    style={{
                      padding: '9px 14px',
                      borderRadius: 10,
                      background: 'rgba(224,123,42,0.15)',
                      color: '#E07B2A',
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
                      background: showRate ? '#E07B2A' : 'rgba(255,255,255,0.1)',
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
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'rgba(245,240,235,0.5)' }}
                    >
                      R$
                    </span>
                    <InputField
                      type="number"
                      min="0"
                      step="1"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="Ex: 85"
                      style={{ flex: 1 }}
                    />
                    <span className="text-sm" style={{ color: 'rgba(245,240,235,0.4)' }}>
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
                    background: '#E07B2A',
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
              <div className="flex gap-2 mb-2">
                <div style={{ flex: '0 0 150px' }}>
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
                        style={{ color: '#E07B2A' }}
                      >
                        ...
                      </span>
                    )}
                  </div>
                  {cepError && (
                    <p className="text-xs mt-0.5" style={{ color: '#FF6B6B' }}>
                      {cepError}
                    </p>
                  )}
                </div>
                <div style={{ flex: '0 0 80px' }}>
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
                      background: '#66BB6A',
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
                <div className="flex gap-2 mb-2">
                  <div style={{ flex: '0 0 150px' }}>
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
                          style={{ color: '#E07B2A' }}
                        >
                          ...
                        </span>
                      )}
                    </div>
                    {companyCepError && (
                      <p className="text-xs mt-0.5" style={{ color: '#FF6B6B' }}>
                        {companyCepError}
                      </p>
                    )}
                  </div>
                  <div style={{ flex: '0 0 80px' }}>
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

            {saveError && (
              <p className="text-xs mb-3" style={{ color: '#FF6B6B' }}>
                {saveError}
              </p>
            )}
            <button
              onClick={() => setShowSaveConfirm(true)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{
                background: 'rgba(224,123,42,0.1)',
                color: '#E07B2A',
                border: '1px solid rgba(224,123,42,0.25)',
                cursor: 'pointer',
              }}
            >
              {saveMsg || 'Salvar alterações'}
            </button>
          </Section>

          <Section title="Alterar senha">
            <Field label="Senha atual">
              <InputField
                type="password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <Field label="Nova senha">
              <InputField
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </Field>
            <Field label="Confirmar nova senha">
              <InputField
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleChangePassword()
                }}
              />
            </Field>
            {pwError && (
              <p className="text-xs mb-3" style={{ color: '#FF6B6B' }}>
                {pwError}
              </p>
            )}
            {pwSuccess && (
              <p className="text-xs mb-3" style={{ color: '#4CAF50' }}>
                Senha alterada com sucesso!
              </p>
            )}
            <button
              onClick={handleChangePassword}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{
                background: 'rgba(224,123,42,0.1)',
                color: '#E07B2A',
                border: '1px solid rgba(224,123,42,0.25)',
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
                    background: oppActive ? '#E07B2A' : 'rgba(255,255,255,0.1)',
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
                      color: '#F5F0EB',
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
                          color: '#E07B2A',
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
                        color: '#E07B2A',
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
                      color: oppSaveMsg.startsWith('Publicado') ? '#4CAF50' : '#FF6B6B',
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
                    background: '#E07B2A',
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
            className="flex items-center justify-between w-full px-5 py-4 rounded-2xl transition-all hover:opacity-80"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(224,123,42,0.1)' }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E07B2A"
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
                <p className="text-sm font-semibold text-white">Minhas equipes</p>
                <p className="text-xs" style={{ color: 'rgba(245,240,235,0.35)' }}>
                  {myTeams.length} equipe{myTeams.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M5 2l5 5-5 5"
                stroke="rgba(245,240,235,0.3)"
                strokeWidth="1.5"
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
