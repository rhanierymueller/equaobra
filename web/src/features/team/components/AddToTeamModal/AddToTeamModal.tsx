'use client'

import { useState } from 'react'

import { useTeams } from '../../hooks/useTeams'

import { ConfirmDialog } from '@/src/components/ConfirmDialog'
import { PROFESSION_COLORS } from '@/src/types/professional.types'
import type { Professional } from '@/src/types/professional.types'
import type { User } from '@/src/types/user.types'

interface AddToTeamModalProps {
  professional: Professional
  user: User
  onClose: () => void
  onSuccess: (teamName: string) => void
}

type Tab = 'existing' | 'new'

interface NewTeamForm {
  name: string
  obraLocation: string
  scheduledStart: string
  estimatedDays: string
  observations: string
}

const EMPTY_FORM: NewTeamForm = {
  name: '',
  obraLocation: '',
  scheduledStart: '',
  estimatedDays: '',
  observations: '',
}

interface FieldProps {
  label: string
  value: string
  placeholder: string
  type?: string
  required?: boolean
  onChange: (v: string) => void
}

function Field({ label, value, placeholder, type = 'text', required, onChange }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium" style={{ color: 'rgba(245,240,235,0.55)' }}>
        {label}
        {required && <span style={{ color: 'var(--color-primary)' }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2.5 rounded-xl text-sm outline-none"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1.5px solid rgba(255,255,255,0.08)',
          color: 'var(--color-text)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'rgba(224,123,42,0.5)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
        }}
      />
    </div>
  )
}

export function AddToTeamModal({ professional: p, user, onClose, onSuccess }: AddToTeamModalProps) {
  const { myTeams, createTeam, addMemberToTeam, isInTeam } = useTeams(user.id)
  const [tab, setTab] = useState<Tab>(myTeams.length > 0 ? 'existing' : 'new')
  const [form, setForm] = useState<NewTeamForm>(EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successTeam, setSuccessTeam] = useState<string | null>(null)
  const [pendingAdd, setPendingAdd] = useState<{ teamId: string; teamName: string } | null>(null)

  if (user.role !== 'contratante') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      >
        <div
          className="rounded-2xl p-6 text-center max-w-sm w-full"
          style={{ background: 'rgba(20,18,16,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.2)' }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-danger-light)"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="text-white font-bold text-base mb-2">Apenas contratantes</h3>
          <p className="text-sm mb-5" style={{ color: 'rgba(245,240,235,0.45)' }}>
            Para montar equipes você precisa de uma conta de contratante. Altere seu tipo de conta
            no perfil.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(245,240,235,0.7)',
              border: '1px solid rgba(255,255,255,0.09)',
              cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    )
  }

  const color =
    PROFESSION_COLORS[p.profession as keyof typeof PROFESSION_COLORS] ?? 'var(--color-primary)'

  const member = {
    professionalId: p.id,
    name: p.name,
    profession: p.profession,
    phone: p.phone,
    avatarUrl: p.avatarUrl,
    avatarInitials: p.avatarInitials,
    hourlyRate: p.hourlyRate,
  }

  function handleAddToExisting(teamId: string, teamName: string) {
    setPendingAdd({ teamId, teamName })
  }

  function confirmAddToExisting() {
    if (!pendingAdd) return
    addMemberToTeam(pendingAdd.teamId, member)
    setSuccessTeam(pendingAdd.teamName)
    setPendingAdd(null)
  }

  async function handleCreate() {
    if (!form.name.trim()) {
      setError('Nome da equipe é obrigatório')
      return
    }
    if (!form.obraLocation.trim()) {
      setError('Local da obra é obrigatório')
      return
    }
    if (!form.scheduledStart) {
      setError('Data de início é obrigatória')
      return
    }
    if (!form.estimatedDays || Number(form.estimatedDays) < 1) {
      setError('Informe o tempo estimado')
      return
    }
    setError('')
    setLoading(true)
    try {
      const ownerMember = {
        professionalId: user.id,
        name: user.name,
        profession:
          user.profession || (user.role === 'profissional' ? 'Profissional' : 'Contratante'),
        phone: '',
        avatarInitials: user.name
          .split(' ')
          .slice(0, 2)
          .map((n) => n[0])
          .join('')
          .toUpperCase(),
        hourlyRate: user.hourlyRate,
      }
      await createTeam(
        {
          name: form.name.trim(),
          obraLocation: form.obraLocation.trim(),
          scheduledStart: form.scheduledStart,
          estimatedDays: Number(form.estimatedDays),
          observations: form.observations.trim(),
        },
        member,
        user.id,
        ownerMember,
      )
      setSuccessTeam(form.name.trim())
    } catch {
      setError('Erro ao criar equipe. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2001,
          width: '100%',
          maxWidth: 460,
          margin: '0 16px',
        }}
      >
        <div
          style={{
            background: 'rgba(18,17,14,0.99)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{ height: 3, background: `linear-gradient(to right, ${color}, ${color}44)` }}
          />

          <div className="flex items-start justify-between p-5 pb-4">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: `2px solid ${color}66`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${color}18`,
                  color,
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  p.avatarInitials
                )}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{p.name}</p>
                <p className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>
                  {p.profession}
                  {p.hourlyRate ? ` · R$ ${p.hourlyRate}/h` : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(245,240,235,0.4)',
                width: 28,
                height: 28,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Fechar"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2 2L8 8M8 2L2 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex px-5 gap-1 mb-4">
            {(['existing', 'new'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: tab === t ? `${color}20` : 'rgba(255,255,255,0.04)',
                  color: tab === t ? color : 'rgba(245,240,235,0.45)',
                  border: `1px solid ${tab === t ? color + '44' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {t === 'existing' ? `Minhas equipes (${myTeams.length})` : 'Nova equipe'}
              </button>
            ))}
          </div>

          <div className="px-5 pb-5">
            {successTeam && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'rgba(76,175,80,0.12)',
                    border: '1.5px solid rgba(76,175,80,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-success)',
                    fontSize: 22,
                  }}
                >
                  ✓
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">
                    {p.name} adicionado à equipe!
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(245,240,235,0.45)' }}>
                    Equipe: <span style={{ color }}>{successTeam}</span>
                  </p>
                </div>
                <div className="flex gap-2 w-full">
                  <a
                    href="/my-teams"
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center"
                    style={{ background: `${color}20`, color, border: `1px solid ${color}44` }}
                  >
                    Ver minha equipe →
                  </a>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(245,240,235,0.6)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}

            {!successTeam && tab === 'existing' && (
              <div>
                {myTeams.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm mb-3" style={{ color: 'rgba(245,240,235,0.4)' }}>
                      Você ainda não tem equipes
                    </p>
                    <button
                      onClick={() => setTab('new')}
                      className="text-sm font-semibold"
                      style={{ color, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Criar primeira equipe →
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {myTeams.map((team) => {
                      const alreadyIn = isInTeam(p.id, team.id)
                      return (
                        <div
                          key={team.id}
                          className="flex items-center justify-between p-3 rounded-xl"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          <div>
                            <p className="text-sm font-semibold text-white">{team.name}</p>
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: 'rgba(245,240,235,0.35)' }}
                            >
                              {team.obraLocation} · {team.members.length}{' '}
                              {team.members.length === 1 ? 'membro' : 'membros'}
                            </p>
                          </div>
                          {alreadyIn ? (
                            <span
                              className="text-xs font-medium px-2.5 py-1 rounded-lg"
                              style={{
                                color: 'var(--color-success)',
                                background: 'var(--color-success-alpha-10)',
                              }}
                            >
                              Adicionado ✓
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddToExisting(team.id, team.name)}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                              style={{
                                background: color,
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              + Adicionar
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {!successTeam && tab === 'new' && (
              <div className="flex flex-col gap-3">
                <Field
                  label="Nome da equipe"
                  required
                  value={form.name}
                  placeholder="Ex: Reforma Apartamento"
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                />
                <Field
                  label="Local da obra"
                  required
                  value={form.obraLocation}
                  placeholder="Endereço ou bairro"
                  onChange={(v) => setForm((f) => ({ ...f, obraLocation: v }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Data de início"
                    required
                    type="date"
                    value={form.scheduledStart}
                    placeholder=""
                    onChange={(v) => setForm((f) => ({ ...f, scheduledStart: v }))}
                  />
                  <Field
                    label="Duração estimada (dias)"
                    required
                    type="number"
                    value={form.estimatedDays}
                    placeholder="Ex: 15"
                    onChange={(v) => setForm((f) => ({ ...f, estimatedDays: v }))}
                  />
                </div>
                <Field
                  label="Observações"
                  value={form.observations}
                  placeholder="Detalhes da obra, requisitos..."
                  onChange={(v) => setForm((f) => ({ ...f, observations: v }))}
                />

                {error && (
                  <p className="text-xs" style={{ color: 'var(--color-danger-light)' }}>
                    {error}
                  </p>
                )}

                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all mt-1"
                  style={{
                    background: loading ? `${color}77` : color,
                    border: 'none',
                    cursor: loading ? 'default' : 'pointer',
                  }}
                >
                  {loading ? 'Criando equipe...' : 'Criar equipe e adicionar'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {pendingAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2500 }}>
          <ConfirmDialog
            title={`Adicionar ${p.name.split(' ')[0]} à equipe?`}
            description={`${p.profession} será adicionado à equipe "${pendingAdd.teamName}".`}
            confirmLabel="Adicionar"
            variant="info"
            onConfirm={confirmAddToExisting}
            onCancel={() => setPendingAdd(null)}
          />
        </div>
      )}
    </>
  )
}
