'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ConfirmDialog } from '@/src/components/ConfirmDialog'
import { LocalityAutocomplete } from '@/src/components/LocalityAutocomplete/LocalityAutocomplete'
import { ChatModal } from '@/src/features/chat/components/ChatModal/ChatModal'
import { useInterests } from '@/src/features/opportunity/hooks/useInterests'
import { useOpportunities } from '@/src/features/opportunity/hooks/useOpportunities'
import type { Opportunity } from '@/src/types/opportunity.types'
import { ALL_PROFESSIONS } from '@/src/types/professional.types'
import type { TeamMember } from '@/src/types/team.types'
import type { User } from '@/src/types/user.types'

const ACCENT = '#E07B2A'

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
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
          style={{ width: 3, height: 14, borderRadius: 99, background: ACCENT, flexShrink: 0 }}
        />
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(245,240,235,0.4)' }}>
      {children}
    </label>
  )
}

function InputEl({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
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

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill={i <= Math.round(rating) ? ACCENT : 'rgba(255,255,255,0.15)'}
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

const EMPTY_FORM = {
  description: '',
  location: '',
  locationLat: undefined as number | undefined,
  locationLng: undefined as number | undefined,
  start: '',
  duration: '',
  professions: [] as string[],
}

interface OppFormProps {
  user: User
  editing: Opportunity | null
  onSaved: () => void
  onCancelEdit: () => void
  publish: ReturnType<typeof useOpportunities>['publish']
  updateOpportunity: ReturnType<typeof useOpportunities>['updateOpportunity']
}

function OppForm({
  user,
  editing,
  onSaved,
  onCancelEdit,
  publish,
  updateOpportunity,
}: OppFormProps) {
  const [description, setDescription] = useState(editing?.obraDescription ?? '')
  const [location, setLocation] = useState(editing?.obraLocation ?? '')
  const [locationLat, setLocationLat] = useState<number | undefined>(editing?.lat)
  const [locationLng, setLocationLng] = useState<number | undefined>(editing?.lng)
  const [start, setStart] = useState(editing?.obraStart ?? '')
  const [duration, setDuration] = useState(editing?.obraDuration ?? '')
  const [professions, setProfessions] = useState<string[]>(editing?.lookingForProfessions ?? [])
  const [profInput, setProfInput] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (editing) {
      setDescription(editing.obraDescription)
      setLocation(editing.obraLocation)
      setLocationLat(editing.lat)
      setLocationLng(editing.lng)
      setStart(editing.obraStart ?? '')
      setDuration(editing.obraDuration ?? '')
      setProfessions(editing.lookingForProfessions)
    } else {
      setDescription(EMPTY_FORM.description)
      setLocation(EMPTY_FORM.location)
      setLocationLat(undefined)
      setLocationLng(undefined)
      setStart(EMPTY_FORM.start)
      setDuration(EMPTY_FORM.duration)
      setProfessions(EMPTY_FORM.professions)
    }
    setProfInput('')
    setMsg('')
  }, [editing?.id])

  async function handleSave() {
    if (!description.trim() || !location.trim() || professions.length === 0) {
      setMsg('Preencha descrição, localização e ao menos uma profissão.')
      setTimeout(() => setMsg(''), 3000)
      return
    }
    const displayName = user.companyName || user.name
    const initials = displayName
      .split(' ')
      .slice(0, 2)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
    const data = {
      contractorId: user.id,
      contractorName: user.name,
      companyName: user.companyName,
      avatarInitials: initials,
      obraDescription: description.trim(),
      obraLocation: location.trim(),
      lat: locationLat,
      lng: locationLng,
      obraStart: start || undefined,
      obraDuration: duration.trim() || undefined,
      lookingForProfessions: professions,
      contactEmail: user.email ?? '',
      contactPhone: undefined,
    }
    try {
      if (editing) {
        await updateOpportunity(editing.id, data)
      } else {
        await publish(data)
      }
      onSaved()
    } catch {
      setMsg('Erro ao salvar vaga. Verifique se você está logado.')
      setTimeout(() => setMsg(''), 4000)
    }
  }

  const isEdit = !!editing

  return (
    <div className="flex flex-col gap-3">
      {isEdit && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1"
          style={{
            background: 'rgba(116,185,255,0.08)',
            border: '1px solid rgba(116,185,255,0.15)',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#74B9FF"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span className="text-xs font-medium" style={{ color: '#74B9FF' }}>
            Editando vaga
          </span>
          <button
            onClick={onCancelEdit}
            className="ml-auto text-xs"
            style={{
              color: 'rgba(116,185,255,0.6)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      )}

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
          <LocalityAutocomplete
            value={location}
            onChange={(val) => {
              setLocation(val)
              setLocationLat(undefined)
              setLocationLng(undefined)
            }}
            onSelect={(name, lat, lng) => {
              setLocation(name)
              setLocationLat(lat)
              setLocationLng(lng)
            }}
            placeholder="Ex: São Paulo, SP"
          />
        </div>
        <div>
          <FieldLabel>Previsão de início</FieldLabel>
          <InputEl type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
      </div>

      <div>
        <FieldLabel>Duração estimada</FieldLabel>
        <InputEl
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Ex: 30 dias, 2 meses..."
        />
      </div>

      <div>
        <FieldLabel>Profissões necessárias *</FieldLabel>
        <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
          {professions.length === 0 ? (
            <p className="text-xs self-center" style={{ color: 'rgba(245,240,235,0.25)' }}>
              Nenhuma adicionada
            </p>
          ) : (
            professions.map((p) => (
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
            ))
          )}
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

      {msg && (
        <p
          className="text-xs px-3 py-2 rounded-xl"
          style={{
            background: 'rgba(229,57,53,0.1)',
            color: '#FF6B6B',
            border: '1px solid rgba(229,57,53,0.2)',
          }}
        >
          {msg}
        </p>
      )}

      <div className="flex gap-2">
        {isEdit && (
          <button
            onClick={onCancelEdit}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(245,240,235,0.6)',
              border: '1px solid rgba(255,255,255,0.09)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Cancelar
          </button>
        )}
        <button
          onClick={handleSave}
          style={{
            flex: 2,
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
          {isEdit ? 'Salvar alterações' : 'Publicar vaga'}
        </button>
      </div>
    </div>
  )
}

interface VagasListProps {
  vagas: Opportunity[]
  onEdit: (opp: Opportunity) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, active: boolean) => void
}

function VagasList({ vagas, onEdit, onDelete, onToggleActive }: VagasListProps) {
  if (vagas.length === 0) {
    return (
      <div
        className="py-8 text-center rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.07)',
        }}
      >
        <p className="text-sm" style={{ color: 'rgba(245,240,235,0.3)' }}>
          Nenhuma vaga publicada ainda
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(245,240,235,0.18)' }}>
          Preencha o formulário acima para criar sua primeira vaga
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        maxHeight: 320,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
      className="pr-1"
    >
      {vagas.map((v) => (
        <div
          key={v.id}
          className="rounded-xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              height: 2,
              background: `linear-gradient(to right, ${v.active ? ACCENT : 'rgba(255,255,255,0.15)'}, transparent)`,
            }}
          />
          <div className="p-3.5">
            <div className="flex items-start gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-tight">
                  {v.obraDescription.slice(0, 55)}
                  {v.obraDescription.length > 55 ? '…' : ''}
                </p>
                <p
                  className="text-xs mt-0.5 flex items-center gap-1"
                  style={{ color: 'rgba(245,240,235,0.4)' }}
                >
                  <svg width="8" height="8" viewBox="0 0 13 13" fill="none">
                    <path
                      d="M6.5 1a4 4 0 0 1 4 4c0 3.5-4 7.5-4 7.5S2.5 8.5 2.5 5a4 4 0 0 1 4-4z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                  </svg>
                  {v.obraLocation}
                </p>
              </div>
              <button
                onClick={() => onToggleActive(v.id, !v.active)}
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 99,
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  flexShrink: 0,
                  background: v.active ? ACCENT : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: v.active ? 18 : 2,
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

            <div className="flex flex-wrap gap-1 mb-2.5">
              {v.lookingForProfessions.slice(0, 3).map((p) => (
                <span
                  key={p}
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    background: `${ACCENT}12`,
                    color: ACCENT,
                    border: `1px solid ${ACCENT}22`,
                    fontSize: 10,
                  }}
                >
                  {p}
                </span>
              ))}
              {v.lookingForProfessions.length > 3 && (
                <span
                  className="text-xs rounded-full"
                  style={{ color: 'rgba(245,240,235,0.3)', fontSize: 10 }}
                >
                  +{v.lookingForProfessions.length - 3}
                </span>
              )}
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => onEdit(v)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(245,240,235,0.65)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  cursor: 'pointer',
                }}
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(v.id)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  background: 'rgba(229,57,53,0.07)',
                  color: '#FF6B6B',
                  border: '1px solid rgba(229,57,53,0.15)',
                  cursor: 'pointer',
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface CandidatesSectionProps {
  contractorId: string
  onChat: (candidateId: string, name: string, initials: string, profession?: string) => void
}

function CandidatesSection({ contractorId, onChat }: CandidatesSectionProps) {
  const { interests } = useInterests(contractorId)
  const [filterProfession, setFilterProfession] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterRating, setFilterRating] = useState(0)

  const availableProfessions = Array.from(
    new Set(interests.map((i) => i.profession).filter(Boolean)),
  ) as string[]
  const filtered = interests.filter((i) => {
    if (filterProfession && i.profession !== filterProfession) return false
    if (filterLocation && !i.location?.toLowerCase().includes(filterLocation.toLowerCase()))
      return false
    if (filterRating > 0 && (i.rating ?? 0) < filterRating) return false
    return true
  })

  if (interests.length === 0) {
    return (
      <div
        className="py-10 text-center rounded-xl"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.07)',
        }}
      >
        <p className="text-sm font-medium" style={{ color: 'rgba(245,240,235,0.3)' }}>
          Nenhum candidato ainda
        </p>
        <p
          className="text-xs mt-1"
          style={{ color: 'rgba(245,240,235,0.18)', maxWidth: 240, margin: '4px auto 0' }}
        >
          Profissionais que demonstrarem interesse aparecem aqui
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
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
            {availableProfessions.map((p) => (
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
        <InputEl
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          placeholder="Filtrar por localidade..."
          style={{ padding: '8px 12px', fontSize: 12 }}
        />
      </div>

      <p className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>
        {filtered.length} de {interests.length} candidato{interests.length !== 1 ? 's' : ''}
      </p>

      <div
        style={{
          maxHeight: 360,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
        className="pr-1"
      >
        {filtered.length === 0 ? (
          <p className="text-xs text-center py-6" style={{ color: 'rgba(245,240,235,0.3)' }}>
            Nenhum candidato com esses filtros
          </p>
        ) : (
          filtered.map((candidate) => (
            <div
              key={candidate.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0,
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
              <div className="flex flex-col gap-1.5 shrink-0">
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
                    padding: '6px 14px',
                    borderRadius: 10,
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
                <Link
                  href={`/professional/${candidate.professionalId}`}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 10,
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(245,240,235,0.6)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    fontSize: 11,
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  Ver perfil
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function MyContractor() {
  const router = useRouter()
  const { publish, updateOpportunity, deleteOpportunity, getContractorOpportunities } =
    useOpportunities()
  const [user, setUser] = useState<User | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [myVagas, setMyVagas] = useState<Opportunity[]>([])
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState('')
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

  function refreshVagas(userId: string) {
    setMyVagas(getContractorOpportunities(userId))
  }

  useEffect(() => {
    if (user) refreshVagas(user.id)
  }, [user])

  if (!loaded) return null

  if (!user || (user.role !== 'contratante' && !user.roles?.includes('contratante'))) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#0D0C0B' }}
      >
        <p className="text-white font-semibold">Área exclusiva para contratantes</p>
        <Link
          href="/auth"
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: ACCENT }}
        >
          Entrar
        </Link>
      </div>
    )
  }

  const displayName = user.companyName || user.name
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
  const hasActiveVaga = myVagas.some((v) => v.active)

  function handleSaved() {
    refreshVagas(user!.id)
    setEditingOpp(null)
    setSavedMsg(editingOpp ? 'Vaga atualizada!' : 'Vaga publicada!')
    setTimeout(() => setSavedMsg(''), 3000)
  }

  function handleDelete(id: string) {
    deleteOpportunity(id)
    refreshVagas(user!.id)
    setDeleteTarget(null)
    if (editingOpp?.id === id) setEditingOpp(null)
  }

  function handleToggleActive(id: string, active: boolean) {
    updateOpportunity(id, { active })
    refreshVagas(user!.id)
  }

  function handleChat(
    candidateId: string,
    name: string,
    avatarInitials: string,
    profession?: string,
  ) {
    setChatTarget({
      professionalId: candidateId,
      name,
      avatarInitials,
      profession: profession ?? 'Profissional',
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
          Minha construtora
        </span>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px 40px' }}>
        <div
          className="py-6 flex items-center gap-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              flexShrink: 0,
              background: `${ACCENT}22`,
              color: ACCENT,
              fontWeight: 800,
              fontSize: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${ACCENT}55`,
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <h1
              className="font-bold text-white text-xl leading-tight truncate"
              style={{ letterSpacing: '-0.02em' }}
            >
              {displayName}
            </h1>
            {user.companyName && (
              <p className="text-sm mt-0.5" style={{ color: 'rgba(245,240,235,0.4)' }}>
                {user.name}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
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
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: hasActiveVaga ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.04)',
                  color: hasActiveVaga ? '#4CAF50' : 'rgba(245,240,235,0.3)',
                  border: `1px solid ${hasActiveVaga ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.07)'}`,
                }}
              >
                {myVagas.length > 0
                  ? `${myVagas.filter((v) => v.active).length} vaga${myVagas.filter((v) => v.active).length !== 1 ? 's' : ''} ativa${myVagas.filter((v) => v.active).length !== 1 ? 's' : ''}`
                  : 'Sem vagas'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-5">
          {savedMsg && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                background: 'rgba(76,175,80,0.1)',
                color: '#4CAF50',
                border: '1px solid rgba(76,175,80,0.2)',
              }}
            >
              ✓ {savedMsg}
            </div>
          )}

          <SectionCard title={editingOpp ? 'Editar vaga' : 'Nova vaga'}>
            <OppForm
              user={user}
              editing={editingOpp}
              onSaved={handleSaved}
              onCancelEdit={() => setEditingOpp(null)}
              publish={publish}
              updateOpportunity={updateOpportunity}
            />
          </SectionCard>

          <SectionCard title={`Minhas vagas (${myVagas.length})`}>
            <VagasList
              vagas={myVagas}
              onEdit={setEditingOpp}
              onDelete={(id) => setDeleteTarget(id)}
              onToggleActive={handleToggleActive}
            />
          </SectionCard>

          <SectionCard title="Candidatos">
            {myVagas.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: 'rgba(245,240,235,0.3)' }}>
                Publique uma vaga para receber candidatos
              </p>
            ) : (
              <CandidatesSection contractorId={user.id} onChat={handleChat} />
            )}
          </SectionCard>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Excluir vaga?"
          description="Essa ação não pode ser desfeita. A vaga será removida do feed e do seu histórico."
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {chatTarget && user && (
        <ChatModal user={user} professional={chatTarget} onClose={() => setChatTarget(null)} />
      )}
    </div>
  )
}
