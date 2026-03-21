'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Opportunity } from '@/src/types/opportunity.types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScreenPos { x: number; y: number }

interface OpportunityMapProps {
  opportunities: Opportunity[]
  selected: Opportunity | null
  onSelect: (o: Opportunity) => void
  onDeselect: () => void
  onChat?: (o: Opportunity) => void
  onInterest?: (o: Opportunity) => void
  flyTo?: [number, number] | null
}

function MapFlyer({ flyTo }: { flyTo?: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (flyTo) map.flyTo(flyTo, 12, { duration: 1.2 })
  }, [map, flyTo])
  useMapEvents({})
  return null
}

// ── Marker factory ────────────────────────────────────────────────────────────

function createObraMarker(opp: Opportunity, isSelected: boolean): L.DivIcon {
  const size = isSelected ? 52 : 42
  const border = isSelected ? 3 : 2
  const shadow = isSelected
    ? '0 0 0 5px rgba(224,123,42,0.25), 0 4px 20px rgba(224,123,42,0.5)'
    : '0 2px 10px rgba(0,0,0,0.6)'

  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div style="
        width:${size}px; height:${size}px; border-radius:50%;
        border:${border}px solid #E07B2A;
        background: rgba(20,18,16,0.96);
        box-shadow:${shadow};
        display:flex; align-items:center; justify-content:center;
        transition: all 0.2s;
      ">
        <svg width="${Math.round(size * 0.4)}" height="${Math.round(size * 0.4)}"
          viewBox="0 0 24 24" fill="none" stroke="#E07B2A"
          stroke-width="2" stroke-linecap="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        </svg>
      </div>`,
  })
}

// ── Map controller ────────────────────────────────────────────────────────────

function MapController({
  opportunities,
  selected,
  onSelect,
  onDeselect,
  onScreenPos,
}: {
  opportunities: Opportunity[]
  selected: Opportunity | null
  onSelect: (o: Opportunity) => void
  onDeselect: () => void
  onScreenPos: (pos: ScreenPos | null) => void
}) {
  const map = useMap()
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  useEffect(() => {
    // Remove stale markers
    const ids = new Set(opportunities.map(o => o.id))
    for (const [id, m] of markersRef.current) {
      if (!ids.has(id)) { m.remove(); markersRef.current.delete(id) }
    }

    opportunities.forEach(opp => {
      if (!opp.lat || !opp.lng) return
      const isSelected = selected?.id === opp.id
      const existing = markersRef.current.get(opp.id)

      if (existing) {
        existing.setIcon(createObraMarker(opp, isSelected))
        return
      }

      const marker = L.marker([opp.lat, opp.lng], {
        icon: createObraMarker(opp, false),
        zIndexOffset: 0,
      })

      marker.on('click', e => {
        L.DomEvent.stopPropagation(e)
        const pt = map.latLngToContainerPoint([opp.lat!, opp.lng!])
        onScreenPos({ x: pt.x, y: pt.y })
        onSelect(opp)
      })

      marker.addTo(map)
      markersRef.current.set(opp.id, marker)
    })
  }, [opportunities, selected, map, onSelect, onScreenPos])

  useEffect(() => {
    const handleMapClick = () => { onDeselect(); onScreenPos(null) }
    map.on('click', handleMapClick)
    return () => { map.off('click', handleMapClick) }
  }, [map, onDeselect, onScreenPos])

  useEffect(() => {
    if (selected?.lat && selected?.lng) {
      const pt = map.latLngToContainerPoint([selected.lat, selected.lng])
      onScreenPos({ x: pt.x, y: pt.y })
    }
    const onMoveEnd = () => {
      if (selected?.lat && selected?.lng) {
        const pt = map.latLngToContainerPoint([selected.lat, selected.lng])
        onScreenPos({ x: pt.x, y: pt.y })
      }
    }
    map.on('moveend', onMoveEnd)
    return () => { map.off('moveend', onMoveEnd) }
  }, [selected, map, onScreenPos])

  return null
}

// ── Floating card ─────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

interface FloatingCardProps {
  opp: Opportunity
  pos: ScreenPos
  containerSize: { w: number; h: number }
  onClose: () => void
  onChat?: (o: Opportunity) => void
  onInterest?: (o: Opportunity) => void
}

function FloatingCard({ opp, pos, containerSize, onClose, onChat, onInterest }: FloatingCardProps) {
  const CARD_W = 280
  const CARD_H = 220
  const MARKER_TIP = 10
  const GAP = 8

  let x = pos.x - CARD_W / 2
  let y = pos.y - CARD_H - MARKER_TIP - GAP

  if (x < 8) x = 8
  if (x + CARD_W > containerSize.w - 8) x = containerSize.w - CARD_W - 8
  if (y < 8) y = pos.y + MARKER_TIP + GAP + 20

  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: CARD_W, zIndex: 1000,
        background: 'rgba(18,17,14,0.98)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16,
        boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Orange top accent */}
      <div style={{ height: 2, background: 'linear-gradient(to right, #E07B2A, transparent)' }} />

      <div style={{ padding: '12px 14px' }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight truncate">
              {opp.companyName ?? opp.contractorName}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,235,0.4)' }}>
              📍 {opp.obraLocation}
            </p>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,235,0.3)', padding: 0, flexShrink: 0, lineHeight: 1 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <p className="text-xs mb-3 leading-relaxed" style={{ color: 'rgba(245,240,235,0.6)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {opp.obraDescription}
        </p>

        {/* Meta */}
        <div className="flex gap-3 mb-3">
          {opp.obraStart && (
            <div>
              <p className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>Início</p>
              <p className="text-xs font-semibold text-white">{formatDate(opp.obraStart)}</p>
            </div>
          )}
          {opp.obraDuration && (
            <div>
              <p className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>Duração</p>
              <p className="text-xs font-semibold text-white">{opp.obraDuration}</p>
            </div>
          )}
        </div>

        {/* Professions */}
        <div className="flex flex-wrap gap-1 mb-3">
          {opp.lookingForProfessions.slice(0, 3).map(p => (
            <span key={p} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(224,123,42,0.12)', color: '#E07B2A', border: '1px solid rgba(224,123,42,0.25)' }}>
              {p}
            </span>
          ))}
          {opp.lookingForProfessions.length > 3 && (
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, color: 'rgba(245,240,235,0.35)' }}>
              +{opp.lookingForProfessions.length - 3}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1.5">
          <a href={`/contractor/${opp.contractorId}`}
            style={{
              flex: 1, padding: '7px 0', borderRadius: 10, fontSize: 11, fontWeight: 700,
              background: 'rgba(255,255,255,0.06)', color: 'rgba(245,240,235,0.7)',
              border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            Ver perfil
          </a>
          {(onInterest || onChat) && (
            <button
              onClick={() => { onInterest?.(opp); onChat?.(opp) }}
              style={{
                flex: 1, padding: '7px 0', borderRadius: 10, fontSize: 11, fontWeight: 700,
                background: '#E07B2A', color: 'white', border: 'none', cursor: 'pointer',
              }}>
              Interesse
            </button>
          )}
          {opp.contactPhone && (
            <a href={`https://wa.me/55${opp.contactPhone.replace(/\D/g, '')}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                width: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, background: 'rgba(37,211,102,0.1)',
                border: '1px solid rgba(37,211,102,0.2)', color: '#25D366',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.25a.75.75 0 0 0 .92.92l5.405-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.892 0-3.667-.5-5.207-1.376l-.374-.215-3.873 1.053 1.053-3.873-.215-.374A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function OpportunityMap({ opportunities, selected, onSelect, onDeselect, onChat, onInterest, flyTo }: OpportunityMapProps) {
  const [screenPos, setScreenPos] = useState<ScreenPos | null>(null)
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 })
  const containerRef = useRef<HTMLDivElement>(null)
  const center = opportunities.find(o => o.lat && o.lng)
  const defaultCenter: [number, number] = center ? [center.lat!, center.lng!] : [-23.5505, -46.6333]

  const handleScreenPos = useCallback((pos: ScreenPos | null) => setScreenPos(pos), [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        setContainerSize({ w: e.contentRect.width, h: e.contentRect.height })
      }
    })
    ro.observe(el)
    setContainerSize({ w: el.offsetWidth, h: el.offsetHeight })
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        center={defaultCenter}
        zoom={11}
        style={{ width: '100%', height: '100%', background: '#0D0C0B' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
        />
        <MapController
          opportunities={opportunities}
          selected={selected}
          onSelect={onSelect}
          onDeselect={onDeselect}
          onScreenPos={handleScreenPos}
        />
        <MapFlyer flyTo={flyTo} />
      </MapContainer>

      {selected && screenPos && (
        <FloatingCard
          opp={selected}
          pos={screenPos}
          containerSize={containerSize}
          onClose={() => { onDeselect(); setScreenPos(null) }}
          onChat={onChat}
          onInterest={onInterest}
        />
      )}
    </div>
  )
}
