'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import { AddToTeamModal } from '@/src/features/team/components/AddToTeamModal'
import { useCurrentUser } from '@/src/hooks/useCurrentUser'
import { api } from '@/src/services/api'
import { PROFESSION_COLORS } from '@/src/types/professional.types'
import type { Professional } from '@/src/types/professional.types'

const REVIEWERS = [
  { name: 'Carlos M.', initials: 'CM' },
  { name: 'Ana L.', initials: 'AL' },
  { name: 'Roberto S.', initials: 'RS' },
  { name: 'Fernanda P.', initials: 'FP' },
  { name: 'João G.', initials: 'JG' },
]

const REVIEW_TEXTS = [
  'Trabalho impecável, prazo cumprido e acabamento perfeito. Profissional exemplar.',
  'Muito atencioso e caprichoso. Explicou cada etapa antes de executar. Recomendo.',
  'Serviço de alta qualidade. Resultado superou as expectativas. Voltarei a contratar.',
  'Eficiente e honesto. Preço justo pelo trabalho entregue. Ótima experiência.',
  'Pontual e muito organizado. O melhor profissional que já contratei para obra.',
]

function generateReviews(id: string, rating: number) {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const deltas = [0, 0.5, -0.5, 0, 0.5]
  return REVIEWERS.map((r, i) => ({
    ...r,
    id: `${id}-r${i}`,
    rating: Math.min(5, Math.max(3.5, rating + deltas[i])),
    text: REVIEW_TEXTS[(seed + i) % REVIEW_TEXTS.length],
    date: `${i + 1} ${i === 0 ? 'mês' : 'meses'} atrás`,
  }))
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="10" height="10" viewBox="0 0 12 12">
          <polygon
            points="6,0.5 7.5,4.5 11.5,4.5 8.5,7 9.5,11 6,8.5 2.5,11 3.5,7 0.5,4.5 4.5,4.5"
            fill={i <= Math.round(rating) ? '#FFD166' : 'rgba(255,255,255,0.1)'}
          />
        </svg>
      ))}
    </span>
  )
}

interface ApiUser extends User {
  phone?: string
  whatsapp?: string
  bio?: string
  location?: string
  rating?: number
}

function apiUserToProfessional(u: ApiUser): Professional {
  const initials = u.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
  const profession = (u.profession as Professional['profession']) ?? 'Pedreiro'
  const rating = u.rating ?? 4.5
  return {
    id: u.id,
    name: u.name,
    profession,
    rating,
    reviewCount: Math.max(1, Math.round(rating * 6)),
    distanceKm: 3,
    available: true,
    phone: u.phone ?? u.whatsapp ?? '',
    bio: u.bio ?? '',
    location: { lat: 0, lng: 0, neighborhood: u.location ?? '', city: u.location ?? '' },
    completedJobs: 12,
    avatarInitials: initials,
    avatarUrl: u.avatarUrl,
    tags: u.professions ?? (u.profession ? [u.profession] : []),
    hourlyRate: u.hourlyRate,
  }
}

export function ProfessionalProfile({ id }: { id: string }) {
  const router = useRouter()
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const { user } = useCurrentUser()
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    api
      .get<ApiUser>(`/api/users/${id}`)
      .then((u) => setProfessional(apiUserToProfessional(u)))
      .catch(() => setProfessional(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: 'var(--color-background)' }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '3px solid var(--color-primary-alpha-30)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!professional) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: 'var(--color-background)' }}
      >
        <div className="text-center">
          <p className="text-white font-semibold mb-3">Profissional não encontrado</p>
          <button
            onClick={() => router.push('/home')}
            style={{ color: 'var(--color-primary)', fontSize: 14 }}
          >
            ← Voltar
          </button>
        </div>
      </div>
    )
  }

  const p = professional
  const color = PROFESSION_COLORS[p.profession] ?? '#E07B2A'
  const reviews = generateReviews(p.id, p.rating)

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh' }}>
      <div
        style={{
          height: 3,
          background: `linear-gradient(to right, ${color}, ${color}44, transparent)`,
        }}
      />

      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-60"
          style={{
            color: 'var(--color-text-secondary)',
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
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-faint)' }}>
          Perfil do profissional
        </span>
        <div style={{ width: 52 }} />
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
            Perfil do profissional
          </p>
          <div className="flex items-start gap-5">
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                overflow: 'hidden',
                flexShrink: 0,
                border: `2px solid ${color}66`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${color}22`,
                color,
                fontWeight: 800,
                fontSize: 22,
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
            <div className="flex-1 min-w-0">
              <h1
                className="font-bold text-white"
                style={{ fontSize: 36, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 10 }}
              >
                {p.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                  style={{ background: `${color}1a`, color, border: `1px solid ${color}33` }}
                >
                  {p.profession}
                </span>
                {p.available ? (
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#4CAF50' }}>
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: '#4CAF50' }}
                    />
                    Disponível
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                    Ocupado
                  </span>
                )}
              </div>
              <div
                className="flex items-center gap-3 text-xs flex-wrap"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span className="flex items-center gap-1">
                  <span style={{ color: '#FFD166' }}>★ {p.rating}</span>
                  <span>({p.reviewCount})</span>
                </span>
                <span>·</span>
                <span>
                  {p.distanceKm} km · {p.location.neighborhood}
                </span>
                <span>·</span>
                <span>{p.completedJobs} obras</span>
              </div>
              <div className="flex gap-2.5 mt-5">
                <a
                  href={`https://wa.me/55${p.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm flex-1 transition-opacity hover:opacity-85"
                  style={{ background: '#25D366', color: 'white', textDecoration: 'none' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.25a.75.75 0 0 0 .92.92l5.405-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.892 0-3.667-.5-5.207-1.376l-.374-.215-3.873 1.053 1.053-3.873-.215-.374A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  Mensagem
                </a>
                {user?.role !== 'profissional' && (
                  <button
                    type="button"
                    onClick={() => (user ? setShowModal(true) : router.push('/auth'))}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm flex-1 transition-all hover:opacity-85"
                    style={{
                      background: successMsg ? `${color}1a` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${successMsg ? color + '55' : 'rgba(255,255,255,0.1)'}`,
                      color: successMsg ? color : 'rgba(245,240,235,0.7)',
                      cursor: 'pointer',
                    }}
                  >
                    {successMsg ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path
                            d="M2 7l3.5 3.5 6.5-7"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Adicionado
                      </>
                    ) : (
                      <>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <line x1="19" y1="8" x2="19" y2="14" />
                          <line x1="22" y1="11" x2="16" y2="11" />
                        </svg>
                        + Equipe
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px 80px' }}>
        <div
          className="flex items-center py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 0 }}
        >
          {[
            { value: p.completedJobs, label: 'obras' },
            { value: `${p.rating}★`, label: 'avaliação' },
            { value: `${Math.max(3, Math.round(p.completedJobs / 20))} anos`, label: 'no ofício' },
            { value: `${p.distanceKm} km`, label: 'de distância' },
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

        <div className="py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,235,0.6)' }}>
            {p.bio}
          </p>
          {p.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(245,240,235,0.45)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
            <span className="text-sm" style={{ color: 'rgba(245,240,235,0.4)' }}>
              {p.phone}
            </span>
          </div>
        </div>

        <div className="py-5 pb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-white">Avaliações</span>
            <span className="text-xs" style={{ color: 'rgba(245,240,235,0.25)' }}>
              {p.reviewCount} no total
            </span>
          </div>

          <div className="flex flex-col" style={{ gap: 1 }}>
            {reviews.map((rev, i) => (
              <div
                key={rev.id}
                className="py-4"
                style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        width: 28,
                        height: 28,
                        flexShrink: 0,
                        background: `${color}18`,
                        color,
                        border: `1px solid ${color}33`,
                        fontSize: 10,
                      }}
                    >
                      {rev.initials}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white">{rev.name}</span>
                      <span className="text-xs ml-2" style={{ color: 'rgba(245,240,235,0.25)' }}>
                        {rev.date}
                      </span>
                    </div>
                  </div>
                  <StarRow rating={rev.rating} />
                </div>
                <p
                  className="text-sm leading-relaxed pl-9"
                  style={{ color: 'rgba(245,240,235,0.5)' }}
                >
                  {rev.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {p.hourlyRate && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
          }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold"
            style={{
              background: 'rgba(18,17,14,0.96)',
              border: `1px solid ${color}44`,
              color,
              boxShadow: `0 4px 24px rgba(0,0,0,0.5)`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            R$ {p.hourlyRate}/hora
          </div>
        </div>
      )}

      {showModal && user && (
        <AddToTeamModal
          professional={p}
          user={user}
          onClose={() => setShowModal(false)}
          onSuccess={(teamName) => {
            setShowModal(false)
            setSuccessMsg(teamName)
          }}
        />
      )}
    </div>
  )
}
