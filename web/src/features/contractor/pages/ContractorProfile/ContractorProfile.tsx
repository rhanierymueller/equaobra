'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ChatModal } from '@/src/features/chat/components/ChatModal/ChatModal'
import { useInterests } from '@/src/features/opportunity/hooks/useInterests'
import { useOpportunities } from '@/src/features/opportunity/hooks/useOpportunities'
import type { Opportunity } from '@/src/types/opportunity.types'
import { ALL_PROFESSIONS } from '@/src/types/professional.types'
import type { TeamMember } from '@/src/types/team.types'
import type { User } from '@/src/types/user.types'

const ACCENT = '#E07B2A'

function formatDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-widest mb-3"
      style={{ color: 'rgba(245,240,235,0.3)' }}
    >
      {children}
    </p>
  )
}

function InputStyle({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.09)',
        color: '#F5F0EB',
        borderRadius: 10,
        padding: '9px 12px',
        fontSize: 13,
        outline: 'none',
        ...style,
      }}
    />
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(245,240,235,0.4)' }}>
      {children}
    </label>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill={i <= Math.round(rating) ? '#E07B2A' : 'rgba(255,255,255,0.15)'}
        >
          <polygon points="6,1 7.5,4.5 11,4.8 8.5,7 9.3,10.5 6,8.5 2.7,10.5 3.5,7 1,4.8 4.5,4.5" />
        </svg>
      ))}
      <span className="text-xs ml-1" style={{ color: 'rgba(245,240,235,0.4)' }}>
        {rating.toFixed(1)}
      </span>
    </span>
  )
}

interface OppFormProps {
  contractorId: string
  user: User
  opp: Opportunity | undefined
  publish: ReturnType<typeof useOpportunities>['publish']
  updateOpportunity: ReturnType<typeof useOpportunities>['updateOpportunity']
}

function OppFormSection({ contractorId, user, opp, publish, updateOpportunity }: OppFormProps) {
  const [active, setActive] = useState(opp?.active ?? false)
  const [description, setDescription] = useState(opp?.obraDescription ?? '')
  const [location, setLocation] = useState(opp?.obraLocation ?? '')
  const [start, setStart] = useState(opp?.obraStart ?? '')
  const [duration, setDuration] = useState(opp?.obraDuration ?? '')
  const [professions, setProfessions] = useState<string[]>(opp?.lookingForProfessions ?? [])
  const [profInput, setProfInput] = useState('')
  const [saveMsg, setSaveMsg] = useState('')

  function handleSave() {
    if (!description.trim() || !location.trim() || professions.length === 0) {
      setSaveMsg('Preencha descrição, localização e ao menos uma profissão.')
      setTimeout(() => setSaveMsg(''), 3000)
      return
    }
    const displayName = user.companyName || user.name
    const initials = displayName
      .split(' ')
      .slice(0, 2)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
    publish({
      contractorId,
      contractorName: user.name,
      companyName: user.companyName,
      avatarInitials: initials,
      obraDescription: description.trim(),
      obraLocation: location.trim(),
      obraStart: start || undefined,
      obraDuration: duration.trim() || undefined,
      lookingForProfessions: professions,
      contactEmail: user.email ?? '',
      contactPhone: undefined,
    })
    setActive(true)
    setSaveMsg('Vaga publicada com sucesso!')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  function handleToggle(val: boolean) {
    setActive(val)
    if (!val) {
      if (opp) updateOpportunity(opp.id, { active: false })
      setSaveMsg('Vaga removida do feed.')
    } else {
      handleSave()
    }
    setTimeout(() => setSaveMsg(''), 3000)
  }

  return (
    <div className="py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <SectionTitle>Minha vaga</SectionTitle>

      <div
        className="flex items-center justify-between mb-4 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <p className="text-sm font-semibold text-white">
            {active ? 'Visível no feed' : 'Oculto do feed'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,235,0.35)' }}>
            {active ? 'Profissionais estão vendo sua obra' : 'Ative para atrair profissionais'}
          </p>
        </div>
        <button
          onClick={() => handleToggle(!active)}
          style={{
            width: 44,
            height: 24,
            borderRadius: 99,
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            flexShrink: 0,
            background: active ? ACCENT : 'rgba(255,255,255,0.1)',
            transition: 'background 0.2s',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 3,
              left: active ? 23 : 3,
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
        <div>
          <FieldLabel>Descrição da obra *</FieldLabel>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel>Localização *</FieldLabel>
            <InputStyle
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: São Paulo, SP"
            />
          </div>
          <div>
            <FieldLabel>Previsão de início</FieldLabel>
            <InputStyle type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
        </div>

        <div>
          <FieldLabel>Duração estimada</FieldLabel>
          <InputStyle
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Ex: 30 dias, 2 meses..."
          />
        </div>

        <div>
          <FieldLabel>Profissões necessárias *</FieldLabel>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {professions.length === 0 && (
              <p className="text-xs" style={{ color: 'rgba(245,240,235,0.25)' }}>
                Nenhuma adicionada
              </p>
            )}
            {professions.map((p) => (
              <span
                key={p}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(224,123,42,0.12)',
                  color: ACCENT,
                  border: '1px solid rgba(224,123,42,0.25)',
                }}
              >
                {p}
                <button
                  onClick={() => setProfessions((prev) => prev.filter((x) => x !== p))}
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
              value={profInput}
              onChange={(e) => setProfInput(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: profInput ? '#F5F0EB' : 'rgba(245,240,235,0.35)',
                borderRadius: 10,
                padding: '9px 12px',
                fontSize: 13,
                outline: 'none',
              }}
            >
              <option value="" style={{ background: '#1A1916' }}>
                Selecione...
              </option>
              {ALL_PROFESSIONS.filter((p) => !professions.includes(p)).map((p) => (
                <option key={p} value={p} style={{ background: '#1A1916' }}>
                  {p}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (profInput && !professions.includes(profInput)) {
                  setProfessions((prev) => [...prev, profInput])
                  setProfInput('')
                }
              }}
              style={{
                padding: '9px 14px',
                borderRadius: 10,
                background: 'rgba(224,123,42,0.15)',
                color: ACCENT,
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
        </div>

        {saveMsg && (
          <p
            className="text-xs px-3 py-2 rounded-xl"
            style={{
              background: saveMsg.includes('sucesso')
                ? 'rgba(76,175,80,0.1)'
                : 'rgba(229,57,53,0.1)',
              color: saveMsg.includes('sucesso') ? '#4CAF50' : '#FF6B6B',
              border: `1px solid ${saveMsg.includes('sucesso') ? 'rgba(76,175,80,0.2)' : 'rgba(229,57,53,0.2)'}`,
            }}
          >
            {saveMsg}
          </p>
        )}

        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: 12,
            background: ACCENT,
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Salvar vaga
        </button>
      </div>
    </div>
  )
}

interface CandidatesProps {
  contractorId: string
  onChat: (candidateId: string, name: string, initials: string, profession?: string) => void
}

function CandidatesSection({ contractorId, onChat }: CandidatesProps) {
  const { interests } = useInterests(contractorId)
  const [filterProfession, setFilterProfession] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterRating, setFilterRating] = useState<number>(0)

  const all_professions = Array.from(
    new Set(interests.map((i) => i.profession).filter(Boolean)),
  ) as string[]

  const filtered = interests.filter((i) => {
    if (filterProfession && i.profession !== filterProfession) return false
    if (filterLocation && !i.location?.toLowerCase().includes(filterLocation.toLowerCase()))
      return false
    if (filterRating > 0 && (i.rating ?? 0) < filterRating) return false
    return true
  })

  return (
    <div className="py-5 pb-12">
      <SectionTitle>Candidatos ({interests.length})</SectionTitle>

      {interests.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-10 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(245,240,235,0.2)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="mb-3"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p className="text-sm font-medium" style={{ color: 'rgba(245,240,235,0.3)' }}>
            Nenhum candidato ainda
          </p>
          <p
            className="text-xs mt-1 text-center"
            style={{ color: 'rgba(245,240,235,0.2)', maxWidth: 240 }}
          >
            Profissionais que demonstrarem interesse aparecem aqui
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex gap-2">
              <select
                value={filterProfession}
                onChange={(e) => setFilterProfession(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: filterProfession ? '#F5F0EB' : 'rgba(245,240,235,0.3)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 12,
                  outline: 'none',
                }}
              >
                <option value="" style={{ background: '#1A1916' }}>
                  Todas as profissões
                </option>
                {all_professions.map((p) => (
                  <option key={p} value={p} style={{ background: '#1A1916' }}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(Number(e.target.value))}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: filterRating > 0 ? '#F5F0EB' : 'rgba(245,240,235,0.3)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 12,
                  outline: 'none',
                }}
              >
                <option value={0} style={{ background: '#1A1916' }}>
                  Qualquer avaliação
                </option>
                <option value={4} style={{ background: '#1A1916' }}>
                  4+ estrelas
                </option>
                <option value={4.5} style={{ background: '#1A1916' }}>
                  4.5+ estrelas
                </option>
              </select>
            </div>
            <input
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              placeholder="Filtrar por localidade..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F5F0EB',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: 'rgba(245,240,235,0.3)' }}>
              Nenhum candidato corresponde ao filtro
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: `${ACCENT}22`,
                      color: ACCENT,
                      fontWeight: 800,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1.5px solid ${ACCENT}44`,
                    }}
                  >
                    {candidate.professionalInitials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {candidate.professionalName}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      {candidate.profession && (
                        <span className="text-xs" style={{ color: 'rgba(245,240,235,0.45)' }}>
                          {candidate.profession}
                        </span>
                      )}
                      {candidate.location && (
                        <span
                          className="text-xs flex items-center gap-0.5"
                          style={{ color: 'rgba(245,240,235,0.3)' }}
                        >
                          <svg width="8" height="8" viewBox="0 0 13 13" fill="none">
                            <path
                              d="M6.5 1a4 4 0 0 1 4 4c0 3.5-4 7.5-4 7.5S2.5 8.5 2.5 5a4 4 0 0 1 4-4z"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                          </svg>
                          {candidate.location}
                        </span>
                      )}
                    </div>
                    {candidate.rating != null && (
                      <div className="mt-1">
                        <Stars rating={candidate.rating} />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      onChat(
                        candidate.professionalId,
                        candidate.professionalName,
                        candidate.professionalInitials,
                        candidate.profession,
                      )
                    }
                    style={{
                      padding: '7px 14px',
                      borderRadius: 10,
                      flexShrink: 0,
                      background: ACCENT,
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    Falar
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function ContractorProfile({ id }: { id: string }) {
  const router = useRouter()
  const { opportunities, publish, updateOpportunity } = useOpportunities()
  const { addInterest } = useInterests(id)
  const [user, setUser] = useState<User | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [chatTarget, setChatTarget] = useState<Pick<
    TeamMember,
    'professionalId' | 'name' | 'avatarInitials' | 'avatarUrl' | 'profession'
  > | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('equobra_user')
      if (raw) setUser(JSON.parse(raw) as User)
    } catch {}
    setLoaded(true)
  }, [])

  const isMe = loaded && user?.id === id
  const opp: Opportunity | undefined = opportunities.find((o) => o.contractorId === id)

  if (!loaded) return null

  if (!opp && !isMe) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#0D0C0B' }}>
        <div className="text-center">
          <p className="text-white font-semibold mb-3">Contratante não encontrado</p>
          <button
            onClick={() => router.back()}
            style={{
              color: ACCENT,
              fontSize: 14,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ← Voltar
          </button>
        </div>
      </div>
    )
  }

  const displayName = opp
    ? (opp.companyName ?? opp.contractorName)
    : user?.companyName || user?.name || 'Perfil'

  const avatarInitials =
    opp?.avatarInitials ??
    displayName
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()

  function handleChat() {
    if (!user) {
      router.push('/auth')
      return
    }
    if (opp) {
      addInterest({
        contractorId: id,
        professionalId: user.id,
        professionalName: user.name,
        professionalInitials: user.name
          .split(' ')
          .slice(0, 2)
          .map((n: string) => n[0])
          .join('')
          .toUpperCase(),
        profession: user.professions?.[0] ?? user.profession,
        location: user.address?.city ? `${user.address.city}, ${user.address.state}` : undefined,
        rating: undefined,
      })
    }
    setChatTarget({
      professionalId: id,
      name: displayName,
      profession: 'Contratante',
      avatarInitials,
    })
  }

  function handleChatWithCandidate(
    candidateId: string,
    name: string,
    initials: string,
    profession?: string,
  ) {
    if (!user) return
    setChatTarget({
      professionalId: candidateId,
      name,
      profession: profession ?? 'Profissional',
      avatarInitials: initials,
    })
  }

  return (
    <div style={{ background: '#0D0C0B', minHeight: '100vh' }}>
      <div
        style={{
          height: 3,
          background: `linear-gradient(to right, ${ACCENT}, ${ACCENT}44, transparent)`,
        }}
      />

      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-60"
          style={{
            color: 'rgba(245,240,235,0.5)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Voltar
        </button>
        <span className="text-xs font-medium" style={{ color: 'rgba(245,240,235,0.25)' }}>
          {isMe ? 'Meu perfil' : 'Perfil da construtora'}
        </span>
        <div style={{ width: 52 }} />
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px' }}>
        <div className="py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-start gap-4">
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                flexShrink: 0,
                border: `2px solid ${ACCENT}66`,
                boxShadow: `0 0 0 4px ${ACCENT}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${ACCENT}22`,
                color: ACCENT,
                fontWeight: 800,
                fontSize: 22,
              }}
            >
              {avatarInitials}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h1
                className="font-bold text-white text-xl leading-tight mb-1"
                style={{ letterSpacing: '-0.02em' }}
              >
                {displayName}
              </h1>
              {opp?.companyName && (
                <p className="text-sm mb-1.5" style={{ color: 'rgba(245,240,235,0.45)' }}>
                  {opp.contractorName}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: `${ACCENT}1a`,
                    color: ACCENT,
                    border: `1px solid ${ACCENT}33`,
                  }}
                >
                  Contratante
                </span>
                {opp?.obraLocation && (
                  <span
                    className="text-xs flex items-center gap-1"
                    style={{ color: 'rgba(245,240,235,0.4)' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 13 13" fill="none">
                      <path
                        d="M6.5 1a4 4 0 0 1 4 4c0 3.5-4 7.5-4 7.5S2.5 8.5 2.5 5a4 4 0 0 1 4-4z"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                    </svg>
                    {opp.obraLocation}
                  </span>
                )}
                {isMe && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: 'rgba(116,185,255,0.1)',
                      color: '#74B9FF',
                      border: '1px solid rgba(116,185,255,0.2)',
                    }}
                  >
                    você
                  </span>
                )}
              </div>
            </div>
          </div>
          {!isMe && opp && (
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={handleChat}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm flex-1 transition-opacity hover:opacity-85"
                style={{ background: ACCENT, color: 'white', border: 'none', cursor: 'pointer' }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Demonstrar interesse
              </button>
              {opp.contactPhone && (
                <a
                  href={`https://wa.me/55${opp.contactPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85"
                  style={{
                    background: 'rgba(37,211,102,0.1)',
                    color: '#25D366',
                    border: '1px solid rgba(37,211,102,0.2)',
                    textDecoration: 'none',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.25a.75.75 0 0 0 .92.92l5.405-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.892 0-3.667-.5-5.207-1.376l-.374-.215-3.873 1.053 1.053-3.873-.215-.374A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
        {opp && (
          <div
            className="flex items-center py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 0 }}
          >
            {[
              { value: opp.lookingForProfessions.length, label: 'vagas abertas' },
              { value: opp.obraStart ? formatDate(opp.obraStart) : '—', label: 'início previsto' },
              { value: opp.obraDuration ?? '—', label: 'duração' },
            ].map((s, i, arr) => (
              <div
                key={s.label}
                className="flex flex-col items-center flex-1"
                style={{
                  borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <span className="font-bold text-base text-white">{s.value}</span>
                <span className="text-xs mt-0.5" style={{ color: 'rgba(245,240,235,0.35)' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}
        {opp && !isMe && (
          <div className="py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,235,0.65)' }}>
              {opp.obraDescription}
            </p>
          </div>
        )}
        {opp && !isMe && (
          <div className="py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex flex-wrap gap-2">
              {opp.lookingForProfessions.map((p) => (
                <span
                  key={p}
                  className="text-sm px-3 py-1.5 rounded-xl font-medium"
                  style={{
                    background: `${ACCENT}12`,
                    color: ACCENT,
                    border: `1px solid ${ACCENT}28`,
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
        {opp && !isMe && (
          <div className="py-5 pb-12">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(245,240,235,0.25)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="text-sm" style={{ color: 'rgba(245,240,235,0.45)' }}>
                  {opp.contactEmail}
                </span>
              </div>
              {opp.contactPhone && (
                <div className="flex items-center gap-2.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(245,240,235,0.25)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="text-sm" style={{ color: 'rgba(245,240,235,0.45)' }}>
                    {opp.contactPhone}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M6.5 1a4 4 0 0 1 4 4c0 3.5-4 7.5-4 7.5S2.5 8.5 2.5 5a4 4 0 0 1 4-4z"
                    stroke="rgba(245,240,235,0.25)"
                    strokeWidth="1.3"
                  />
                </svg>
                <span className="text-sm" style={{ color: 'rgba(245,240,235,0.45)' }}>
                  {opp.obraLocation}
                </span>
              </div>
            </div>
          </div>
        )}
        {isMe && user && (
          <>
            <OppFormSection
              contractorId={id}
              user={user}
              opp={opp}
              publish={publish}
              updateOpportunity={updateOpportunity}
            />
            <CandidatesSection contractorId={id} onChat={handleChatWithCandidate} />
          </>
        )}
      </div>

      {chatTarget && user && (
        <ChatModal user={user} professional={chatTarget} onClose={() => setChatTarget(null)} />
      )}
    </div>
  )
}
