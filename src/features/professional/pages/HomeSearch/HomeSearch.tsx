'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Navbar } from '@/src/components/Navbar'
import { FilterBar } from '../../components/FilterBar'
import { ProfessionalCard } from '../../components/ProfessionalCard'
import { useProfessionals } from '../../hooks/useProfessionals'
import { AddToTeamModal } from '@/src/features/team/components/AddToTeamModal'
import { useOpportunities } from '@/src/features/opportunity/hooks/useOpportunities'
import { OpportunityFilterBar } from '@/src/features/opportunity/components/OpportunityFilterBar'
import { ChatModal } from '@/src/features/chat/components/ChatModal/ChatModal'
import type { Professional, Profession } from '@/src/types/professional.types'
import type { Opportunity } from '@/src/types/opportunity.types'
import type { TeamMember } from '@/src/types/team.types'
import type { User } from '@/src/types/user.types'

type ChatTarget = Pick<TeamMember, 'professionalId' | 'name' | 'avatarInitials' | 'avatarUrl' | 'profession'>

type MapMode = 'profissionais' | 'obras'

const FILTER_WIDTH = 288
const LIST_WIDTH = 360

const ProfessionalMap = dynamic(
  () => import('../../components/ProfessionalMap').then(m => m.ProfessionalMap),
  { ssr: false, loading: () => <MapSkeleton /> },
)

const OpportunityMap = dynamic(
  () => import('@/src/features/opportunity/components/OpportunityMap').then(m => m.OpportunityMap),
  { ssr: false, loading: () => <MapSkeleton /> },
)

function MapSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#0D0C0B' }}>
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full animate-spin"
          style={{ border: '3px solid rgba(224,123,42,0.2)', borderTopColor: '#E07B2A' }}
        />
        <span className="text-sm" style={{ color: 'rgba(245,240,235,0.4)' }}>Carregando mapa...</span>
      </div>
    </div>
  )
}

// ── Panel toggle button ─────────────────────────────────────────────────────────

interface PanelToggleProps {
  open: boolean
  onToggle: () => void
  side: 'left' | 'right'
  offset: number
}

function PanelToggle({ open, onToggle, side, offset }: PanelToggleProps) {
  const isLeft = side === 'left'
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 hover:scale-110"
      style={{
        [isLeft ? 'left' : 'right']: open ? offset - 1 : 0,
        width: 20,
        height: 48,
        zIndex: 1001,
        background: 'rgba(26,25,22,0.98)',
        border: '1px solid rgba(255,255,255,0.12)',
        [isLeft ? 'borderLeft' : 'borderRight']: 'none',
        borderRadius: isLeft ? '0 8px 8px 0' : '8px 0 0 8px',
        color: 'rgba(245,240,235,0.55)',
        cursor: 'pointer',
        transition: `${isLeft ? 'left' : 'right'} 0.3s`,
      }}
      aria-label={open ? 'Fechar painel' : 'Abrir painel'}
    >
      <svg
        width="9" height="9" viewBox="0 0 10 10" fill="none"
        style={{
          transform: isLeft
            ? (open ? 'rotate(180deg)' : 'none')
            : (open ? 'none' : 'rotate(180deg)'),
          transition: 'transform 0.3s',
        }}
      >
        <path d="M6.5 1L2.5 5L6.5 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  )
}

// ── Map mode toggle pill ────────────────────────────────────────────────────────

interface MapModeToggleProps {
  mode: MapMode
  onChange: (m: MapMode) => void
}

function MapModeToggle({ mode, onChange }: MapModeToggleProps) {
  return (
    <div
      className="absolute flex items-center"
      style={{
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1002,
        background: 'rgba(13,12,11,0.92)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 99,
        padding: 3,
        backdropFilter: 'blur(10px)',
        gap: 2,
      }}
    >
      {(['profissionais', 'obras'] as MapMode[]).map(m => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          style={{
            padding: '5px 14px',
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: mode === m ? '#E07B2A' : 'transparent',
            color: mode === m ? '#fff' : 'rgba(245,240,235,0.45)',
          }}
        >
          {m === 'profissionais' ? '👷 Profissionais' : '🏗️ Obras'}
        </button>
      ))}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

function oppToChatTarget(opp: Opportunity): ChatTarget {
  return {
    professionalId: opp.contractorId,
    name: opp.companyName ?? opp.contractorName,
    profession: 'Contratante',
    avatarInitials: opp.avatarInitials,
  }
}

export default function HomeSearch() {
  const {
    professionals,
    filters,
    selected,
    resultCount,
    setSearch,
    setLocality,
    toggleProfession,
    setMinRating,
    setMaxDistance,
    setAvailableOnly,
    selectProfessional,
    resetFilters,
  } = useProfessionals()

  const { opportunities } = useOpportunities()

  const [filterOpen, setFilterOpen] = useState(true)
  const [listOpen, setListOpen] = useState(true)
  const [teamTarget, setTeamTarget] = useState<Professional | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [mapMode, setMapMode] = useState<MapMode>('profissionais')
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)
  const [chatTarget, setChatTarget] = useState<ChatTarget | null>(null)
  const [oppLocality, setOppLocality] = useState('')
  const [oppProfessions, setOppProfessions] = useState<Profession[]>([])
  const [oppMaxDistance, setOppMaxDistance] = useState(50)
  const [oppCenter, setOppCenter] = useState<[number, number] | null>(null)
  const [mapFlyTo, setMapFlyTo] = useState<[number, number] | null>(null)
  const [userGeoLoc, setUserGeoLoc] = useState<[number, number] | null>(null)
  // Unique key per mount — forces Leaflet MapContainer to re-initialize after navigation
  const [mapKey] = useState(() => Date.now())

  useEffect(() => {
    try {
      const raw = localStorage.getItem('equobra_user')
      if (raw) setUser(JSON.parse(raw) as User)
    } catch { /* ignore */ }
  }, [])

  // Get user geolocation and use as initial map center
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos: [number, number] = [coords.latitude, coords.longitude]
        setUserGeoLoc(pos)
        setMapFlyTo(pos)
        setOppCenter(pos)
      },
      () => { /* permission denied or unavailable — keep default center */ },
      { timeout: 6000 },
    )
  }, [])

  // Sync locality from profissionais filters when switching to obras
  function handleModeChange(m: MapMode) {
    if (m === 'obras' && !oppLocality && filters.locality) {
      setOppLocality(filters.locality)
    }
    setMapMode(m)
    setSelectedOpp(null)
    selectProfessional(null)
  }

  function toggleOppProfession(p: Profession) {
    setOppProfessions(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  function resetOppFilters() {
    setOppLocality('')
    setOppProfessions([])
    setOppMaxDistance(50)
    setOppCenter(userGeoLoc)
  }

  const effectiveCenter = oppCenter ?? userGeoLoc

  function haversineKm(a: [number, number], b: [number, number]): number {
    const R = 6371
    const dLat = (b[0] - a[0]) * Math.PI / 180
    const dLng = (b[1] - a[1]) * Math.PI / 180
    const sin2 = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.asin(Math.sqrt(sin2))
  }

  const filteredOpportunities = opportunities.filter(o => {
    if (oppLocality && !o.obraLocation.toLowerCase().includes(oppLocality.toLowerCase())) return false
    if (oppProfessions.length > 0 && !oppProfessions.some(p => o.lookingForProfessions.includes(p))) return false
    if (effectiveCenter && o.lat && o.lng) {
      if (haversineKm(effectiveCenter, [o.lat, o.lng]) > oppMaxDistance) return false
    }
    return true
  })

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0D0C0B' }}>
      <Navbar searchValue={filters.search} onSearchChange={setSearch} />

      <div className="flex flex-1 overflow-hidden relative" style={{ overflowX: 'hidden' }}>

        {/* ── Left panel: Filters ────────────────────────────────────── */}
        <aside
          className="shrink-0 overflow-hidden transition-all duration-300"
          style={{
            width: filterOpen ? FILTER_WIDTH : 0,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            background: '#111009',
          }}
        >
          <div className="h-full overflow-y-auto overflow-x-hidden w-full">
            <div className="p-4">
              {mapMode === 'profissionais' ? (
                <FilterBar
                  filters={filters}
                  resultCount={resultCount}
                  onToggleProfession={toggleProfession}
                  onSetMinRating={setMinRating}
                  onSetMaxDistance={setMaxDistance}
                  onSetAvailableOnly={setAvailableOnly}
                  onSetLocality={setLocality}
                  onLocationSelect={(lat, lng) => setMapFlyTo([lat, lng])}
                  onReset={resetFilters}
                />
              ) : (
                <OpportunityFilterBar
                  filters={{ locality: oppLocality, professions: oppProfessions, maxDistanceKm: oppMaxDistance }}
                  resultCount={filteredOpportunities.length}
                  onSetLocality={setOppLocality}
                  onLocationSelect={(lat, lng) => { setMapFlyTo([lat, lng]); setOppCenter([lat, lng]) }}
                  onSetMaxDistance={setOppMaxDistance}
                  onToggleProfession={toggleOppProfession}
                  onReset={resetOppFilters}
                />
              )}
            </div>
          </div>
        </aside>

        {/* Left panel toggle */}
        <PanelToggle
          open={filterOpen}
          onToggle={() => setFilterOpen(v => !v)}
          side="left"
          offset={FILTER_WIDTH}
        />

        {/* ── Center: Map ────────────────────────────────────────────── */}
        <div className="flex-1 relative">

          {/* Mode toggle */}
          <MapModeToggle mode={mapMode} onChange={handleModeChange} />

          {mapMode === 'profissionais' ? (
            <ProfessionalMap
              key={mapKey}
              professionals={professionals}
              selected={selected}
              onSelect={pro => selectProfessional(selected?.id === pro.id ? null : pro)}
              onDeselect={() => selectProfessional(null)}
              onAddToTeam={
                user?.role === 'contratante'
                  ? pro => setTeamTarget(pro)
                  : !user
                    ? () => { window.location.href = '/auth' }
                    : undefined
              }
              flyTo={mapFlyTo}
            />
          ) : (
            <OpportunityMap
              key={mapKey}
              opportunities={filteredOpportunities}
              selected={selectedOpp}
              onSelect={opp => setSelectedOpp(selectedOpp?.id === opp.id ? null : opp)}
              onDeselect={() => setSelectedOpp(null)}
              onInterest={user?.role === 'profissional'
                ? opp => setChatTarget(oppToChatTarget(opp))
                : !user
                  ? () => { window.location.href = '/auth' }
                  : undefined
              }
              flyTo={mapFlyTo}
            />
          )}

          {/* Active filter chips — profissionais mode only */}
          {mapMode === 'profissionais' && (filters.professions.length > 0 || filters.availableOnly || filters.minRating > 0 || filters.locality) && (
            <div
              className="absolute left-3 flex gap-2 flex-wrap pointer-events-none"
              style={{ top: 56, right: 12, zIndex: 1001 }}
            >
              {filters.locality && (
                <span
                  className="text-xs px-3 py-1.5 rounded-full font-medium pointer-events-auto"
                  style={{ background: 'rgba(116,185,255,0.15)', border: '1px solid rgba(116,185,255,0.35)', color: '#74B9FF' }}
                >
                  📍 {filters.locality}
                </span>
              )}
              {filters.availableOnly && (
                <span
                  className="text-xs px-3 py-1.5 rounded-full font-medium pointer-events-auto"
                  style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.35)', color: '#4CAF50' }}
                >
                  ● Disponível agora
                </span>
              )}
              {filters.minRating > 0 && (
                <span
                  className="text-xs px-3 py-1.5 rounded-full font-medium pointer-events-auto"
                  style={{ background: 'rgba(255,209,102,0.15)', border: '1px solid rgba(255,209,102,0.3)', color: '#FFD166' }}
                >
                  ★ {filters.minRating}+
                </span>
              )}
              {filters.professions.map(p => (
                <span
                  key={p}
                  className="text-xs px-3 py-1.5 rounded-full font-medium pointer-events-auto"
                  style={{ background: 'rgba(224,123,42,0.15)', border: '1px solid rgba(224,123,42,0.3)', color: '#E07B2A' }}
                >
                  {p}
                </span>
              ))}
            </div>
          )}

          {/* Stats badge */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs px-3 py-2 rounded-xl flex items-center gap-2"
            style={{
              zIndex: 1001,
              background: 'rgba(13,12,11,0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
              color: 'rgba(245,240,235,0.6)',
              whiteSpace: 'nowrap',
            }}
          >
            {mapMode === 'profissionais' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4CAF50' }} />
                {professionals.filter(p => p.available).length} disponíveis agora
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#E07B2A' }} />
                {filteredOpportunities.length} obra{filteredOpportunities.length !== 1 ? 's' : ''} no mapa
              </>
            )}
          </div>
        </div>

        {/* Right panel toggle */}
        <PanelToggle
          open={listOpen}
          onToggle={() => setListOpen(v => !v)}
          side="right"
          offset={LIST_WIDTH}
        />

        {/* ── Right panel: list ─────────────────────────── */}
        <aside
          className="shrink-0 overflow-hidden transition-all duration-300 flex flex-col"
          style={{
            width: listOpen ? LIST_WIDTH : 0,
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            background: '#111009',
          }}
        >
          <div className="flex flex-col h-full w-full overflow-x-hidden">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold text-white">
                {mapMode === 'profissionais' ? 'Profissionais' : 'Obras disponíveis'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,235,0.3)' }}>
                {mapMode === 'profissionais'
                  ? (resultCount > 0
                    ? `${resultCount} resultado${resultCount !== 1 ? 's' : ''} próximos de você`
                    : 'Nenhum profissional encontrado')
                  : `${filteredOpportunities.length} oportunidade${filteredOpportunities.length !== 1 ? 's' : ''} próximas`
                }
              </p>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {mapMode === 'profissionais'
                ? professionals.map(p => (
                  <ProfessionalCard
                    key={p.id}
                    professional={p}
                    selected={selected?.id === p.id}
                    onClick={pro => selectProfessional(selected?.id === pro.id ? null : pro)}
                  />
                ))
                : filteredOpportunities.map(opp => (
                  <button
                    key={opp.id}
                    type="button"
                    onClick={() => setSelectedOpp(selectedOpp?.id === opp.id ? null : opp)}
                    style={{
                      textAlign: 'left',
                      background: selectedOpp?.id === opp.id ? 'rgba(224,123,42,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedOpp?.id === opp.id ? 'rgba(224,123,42,0.4)' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 12,
                      padding: '10px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <p className="text-sm font-semibold text-white truncate">
                      {opp.companyName ?? opp.contractorName}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(245,240,235,0.4)' }}>
                      📍 {opp.obraLocation}
                    </p>
                    <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed" style={{ color: 'rgba(245,240,235,0.6)' }}>
                      {opp.obraDescription}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {opp.lookingForProfessions.slice(0, 3).map(prof => (
                        <span
                          key={prof}
                          style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(224,123,42,0.1)', color: '#E07B2A', border: '1px solid rgba(224,123,42,0.2)' }}
                        >
                          {prof}
                        </span>
                      ))}
                      {opp.lookingForProfessions.length > 3 && (
                        <span style={{ fontSize: 10, color: 'rgba(245,240,235,0.3)' }}>
                          +{opp.lookingForProfessions.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              }
            </div>
          </div>
        </aside>

      </div>

      {teamTarget && user && (
        <AddToTeamModal
          professional={teamTarget}
          user={user}
          onClose={() => setTeamTarget(null)}
          onSuccess={() => setTeamTarget(null)}
        />
      )}

      {chatTarget && user && (
        <ChatModal
          user={user}
          professional={chatTarget}
          onClose={() => setChatTarget(null)}
        />
      )}
    </div>
  )
}
