'use client'

import { useState } from 'react'

import { useOpportunities } from '@/src/features/opportunity/hooks/useOpportunities'
import { ALL_PROFESSIONS } from '@/src/types/professional.types'
import type { Opportunity } from '@/src/types/opportunity.types'
import type { User } from '@/src/types/user.types'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-dim)' }}>
      {children}
    </p>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
      {children}
    </label>
  )
}

function InputField({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        background: 'var(--color-border-subtle)',
        border: '1px solid var(--color-border-faint)',
        color: 'var(--color-text)',
        borderRadius: 10,
        padding: '9px 12px',
        fontSize: 13,
        outline: 'none',
        ...style,
      }}
    />
  )
}

interface OppFormSectionProps {
  contractorId: string
  user: User
  opp: Opportunity | undefined
  publish: ReturnType<typeof useOpportunities>['publish']
  updateOpportunity: ReturnType<typeof useOpportunities>['updateOpportunity']
}

export function OppFormSection({ contractorId, user, opp, publish, updateOpportunity }: OppFormSectionProps) {
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

  function addProfession() {
    if (profInput && !professions.includes(profInput)) {
      setProfessions((prev) => [...prev, profInput])
      setProfInput('')
    }
  }

  function removeProfession(p: string) {
    setProfessions((prev) => prev.filter((x) => x !== p))
  }

  const saveMsgIsSuccess = saveMsg.includes('sucesso')

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
            background: active ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
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
              color: 'var(--color-text)',
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
            <InputField
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: São Paulo, SP"
            />
          </div>
          <div>
            <FieldLabel>Previsão de início</FieldLabel>
            <InputField type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
        </div>

        <div>
          <FieldLabel>Duração estimada</FieldLabel>
          <InputField
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Ex: 30 dias, 2 meses..."
          />
        </div>

        <div>
          <FieldLabel>Profissões necessárias *</FieldLabel>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {professions.length === 0 && (
              <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                Nenhuma adicionada
              </p>
            )}
            {professions.map((p) => (
              <span
                key={p}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: 'var(--color-primary-alpha-10)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary-alpha-20)',
                }}
              >
                {p}
                <button
                  onClick={() => removeProfession(p)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-primary)',
                    padding: 0,
                    lineHeight: 1,
                    display: 'flex',
                  }}
                >
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
                color: profInput ? 'var(--color-text)' : 'var(--color-text-dim)',
                borderRadius: 10,
                padding: '9px 12px',
                fontSize: 13,
                outline: 'none',
              }}
            >
              <option value="" style={{ background: '#1A1916' }}>Selecione...</option>
              {ALL_PROFESSIONS.filter((p) => !professions.includes(p)).map((p) => (
                <option key={p} value={p} style={{ background: '#1A1916' }}>{p}</option>
              ))}
            </select>
            <button
              onClick={addProfession}
              style={{
                padding: '9px 14px',
                borderRadius: 10,
                background: 'var(--color-primary-alpha-15)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary-alpha-30)',
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
              background: saveMsgIsSuccess ? 'var(--color-success-alpha-10)' : 'var(--color-danger-alpha-08)',
              color: saveMsgIsSuccess ? 'var(--color-success)' : 'var(--color-danger-light)',
              border: `1px solid ${saveMsgIsSuccess ? 'var(--color-success-alpha-20)' : 'var(--color-danger-alpha-15)'}`,
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
            background: 'var(--color-primary)',
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
