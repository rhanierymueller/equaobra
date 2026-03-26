'use client'

import L from 'leaflet'
import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'

import 'leaflet/dist/leaflet.css'
import type { Professional } from '@/src/types/professional.types'
import { PROFESSION_COLORS } from '@/src/types/professional.types'

interface ScreenPos {
  x: number
  y: number
}

interface ProfessionalMapProps {
  professionals: Professional[]
  selected: Professional | null
  onSelect: (p: Professional) => void
  onDeselect: () => void
  onAddToTeam?: (p: Professional) => void
  flyTo?: [number, number] | null
}

function MapFlyer({ flyTo }: { flyTo?: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (flyTo) map.flyTo(flyTo, 13, { duration: 1.2 })
  }, [map, flyTo])
  useMapEvents({})
  return null
}

function createCircleMarker(pro: Professional, isSelected: boolean): L.DivIcon {
  const color = PROFESSION_COLORS[pro.profession] ?? '#E07B2A'
  const size = isSelected ? 52 : 42
  const border = isSelected ? 3 : 2
  const shadow = isSelected
    ? `0 0 0 5px ${color}28, 0 4px 20px ${color}55`
    : '0 2px 10px rgba(0,0,0,0.6)'

  const img = pro.avatarUrl
    ? `<img src="${pro.avatarUrl}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:50%" onerror="this.style.display='none';this.nextSibling.style.display='flex'" /><div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;color:${color};font-weight:800;font-size:${Math.round(size * 0.3)}px;background:${color}22;border-radius:50%">${pro.avatarInitials}</div>`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:${color};font-weight:800;font-size:${Math.round(size * 0.32)}px;background:${color}22;border-radius:50%">${pro.avatarInitials}</div>`

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${size}px;height:${size + 10}px;cursor:pointer">
        <div style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;border:${border}px solid ${color};box-shadow:${shadow};transition:all 0.2s">${img}</div>
        <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:10px solid ${color};filter:drop-shadow(0 2px 3px rgba(0,0,0,0.4))"></div>
      </div>
    `,
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size + 10],
  })
}

interface MapControllerProps {
  professionals: Professional[]
  selected: Professional | null
  onSelect: (p: Professional) => void
  onPositionChange: (pos: ScreenPos | null) => void
}

function MapController({
  professionals,
  selected,
  onSelect,
  onPositionChange,
}: MapControllerProps) {
  const map = useMap()
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  useEffect(() => {
    if (selected && !(selected.location.lat === 0 && selected.location.lng === 0)) {
      map.flyTo([selected.location.lat, selected.location.lng], Math.max(map.getZoom(), 15), {
        duration: 0.9,
      })
    }
  }, [map, selected])

  useEffect(() => {
    if (!selected) {
      onPositionChange(null)
      return
    }
    const latlng = L.latLng(selected.location.lat, selected.location.lng)
    const update = () => {
      const pt = map.latLngToContainerPoint(latlng)
      onPositionChange({ x: pt.x, y: pt.y })
    }
    update()
    map.on('move zoom moveend zoomend', update)
    return () => {
      map.off('move zoom moveend zoomend', update)
    }
  }, [map, selected, onPositionChange])

  useEffect(() => {
    markersRef.current.forEach((m) => m.remove())
    markersRef.current.clear()

    professionals.forEach((pro) => {
      const { lat, lng } = pro.location
      if (lat === 0 && lng === 0) return

      const isSelected = selected?.id === pro.id
      const icon = createCircleMarker(pro, isSelected)
      const marker = L.marker([lat, lng], {
        icon,
        zIndexOffset: isSelected ? 1000 : 0,
      })
      marker.on('click', () => onSelect(pro))
      marker.addTo(map)
      markersRef.current.set(pro.id, marker)
    })

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current.clear()
    }
  }, [professionals, selected, onSelect, map])

  return null
}

const CARD_WIDTH = 360

interface FloatingCardProps {
  professional: Professional
  pos: ScreenPos
  containerSize: { w: number; h: number }
  onClose: () => void
  onAddToTeam?: (p: Professional) => void
}

function FloatingCard({
  professional: p,
  pos,
  containerSize,
  onClose,
  onAddToTeam,
}: FloatingCardProps) {
  const color = PROFESSION_COLORS[p.profession] ?? '#E07B2A'
  const MARKER_TIP = 10

  const rawLeft = pos.x - CARD_WIDTH / 2
  const left = Math.max(8, Math.min(rawLeft, containerSize.w - CARD_WIDTH - 8))

  const CARD_APPROX_HEIGHT = 210
  const showBelow = pos.y < CARD_APPROX_HEIGHT + 20
  const top = showBelow ? pos.y + MARKER_TIP + 12 : pos.y - MARKER_TIP

  const arrowUp = showBelow
  const translateY = showBelow ? '0' : '-100%'

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width: CARD_WIDTH,
        transform: `translateY(${translateY})`,
        zIndex: 1002,
        pointerEvents: 'auto',
        filter: 'drop-shadow(0 12px 40px rgba(0,0,0,0.7))',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {arrowUp && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: -1 }}>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderBottom: `11px solid ${color}55`,
            }}
          />
        </div>
      )}

      <div
        style={{
          background: 'rgba(14,13,11,0.97)',
          border: `1px solid ${color}44`,
          borderRadius: 16,
          overflow: 'hidden',
          backdropFilter: 'blur(24px)',
          boxShadow: `0 0 0 1px ${color}18 inset, 0 2px 0 ${color}33 inset`,
        }}
      >
        <div
          style={{ height: 3, background: `linear-gradient(to right, ${color}cc, ${color}33)` }}
        />

        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                border: `2.5px solid ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${color}22`,
                color,
                fontWeight: 800,
                fontSize: 15,
                boxShadow: `0 0 0 3px ${color}22`,
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

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <p
                  style={{
                    color: 'var(--color-text)',
                    fontWeight: 700,
                    fontSize: 14,
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {p.name}
                </p>
                <button
                  onClick={onClose}
                  style={{
                    flexShrink: 0,
                    background: 'rgba(255,255,255,0.07)',
                    border: 'none',
                    color: 'rgba(245,240,235,0.45)',
                    cursor: 'pointer',
                    width: 22,
                    height: 22,
                    borderRadius: 6,
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 4,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 20,
                    background: `${color}20`,
                    color,
                    letterSpacing: '0.02em',
                  }}
                >
                  {p.profession}
                </span>
                {p.available ? (
                  <span
                    style={{
                      color: '#4CAF50',
                      fontSize: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: '#4CAF50',
                        display: 'inline-block',
                      }}
                    />
                    Disponível
                  </span>
                ) : (
                  <span style={{ color: 'rgba(245,240,235,0.35)', fontSize: 10 }}>Ocupado</span>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 9,
              fontSize: 11,
              color: 'rgba(245,240,235,0.5)',
              flexWrap: 'wrap',
            }}
          >
            <span>
              <span style={{ color: '#FFD166' }}>★ {p.rating}</span>
              <span style={{ color: 'rgba(245,240,235,0.35)' }}> ({p.reviewCount})</span>
            </span>
            <span>
              📍 {p.distanceKm} km · {p.location.neighborhood}
            </span>
            <span>{p.completedJobs} obras</span>
          </div>

          <p
            style={{
              color: 'rgba(245,240,235,0.48)',
              fontSize: 11,
              lineHeight: 1.55,
              margin: '0 0 12px',
              maxHeight: 58,
              overflowY: 'auto',
              paddingRight: 2,
            }}
          >
            {p.bio}
          </p>

          <div style={{ display: 'flex', gap: 6 }}>
            <a
              href={`https://wa.me/55${p.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                background: '#25D366',
                color: 'white',
                fontWeight: 700,
                fontSize: 11,
                textAlign: 'center',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.25a.75.75 0 0 0 .92.92l5.405-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.892 0-3.667-.5-5.207-1.376l-.374-.215-3.873 1.053 1.053-3.873-.215-.374A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Mensagem
            </a>
            <a
              href={`/professional/${p.id}`}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                background: color,
                color: 'white',
                fontWeight: 700,
                fontSize: 11,
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Ver perfil
            </a>
            {onAddToTeam && (
              <button
                onClick={() => onAddToTeam(p)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(245,240,235,0.8)',
                  fontWeight: 700,
                  fontSize: 11,
                  border: `1px solid ${color}30`,
                  cursor: 'pointer',
                }}
              >
                + Equipe
              </button>
            )}
          </div>
        </div>
      </div>

      {!arrowUp && (
        <div
          style={{
            display: 'flex',
            justifyContent: `${left === rawLeft ? 'center' : `${pos.x - left}px`}`,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: `11px solid ${color}44`,
              marginLeft: left !== rawLeft ? pos.x - left - 9 : 0,
            }}
          />
        </div>
      )}
    </div>
  )
}

const BLUMENAU_CENTER: [number, number] = [-26.9194, -49.0661]

export function ProfessionalMap({
  professionals,
  selected,
  onSelect,
  onDeselect,
  onAddToTeam,
  flyTo,
}: ProfessionalMapProps) {
  const [markerPos, setMarkerPos] = useState<ScreenPos | null>(null)
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 })
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handlePositionChange = useCallback((pos: ScreenPos | null) => {
    setMarkerPos(pos)
  }, [])

  useEffect(() => {
    if (!wrapperRef.current) return
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setContainerSize({ w: width, h: height })
    })
    obs.observe(wrapperRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <style>{`
        .leaflet-container { background: #0D0C0B; }
        .leaflet-control-attribution {
          background: rgba(13,12,11,0.8) !important;
          color: rgba(245,240,235,0.25) !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color: rgba(245,240,235,0.35) !important; }
        .leaflet-control-zoom { display: none !important; }
      `}</style>

      <div
        ref={wrapperRef}
        style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
      >
        <MapContainer
          center={BLUMENAU_CENTER}
          zoom={13}
          className="w-full h-full"
          zoomControl={false}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            subdomains="abcd"
            maxZoom={20}
          />
          <MapController
            professionals={professionals}
            selected={selected}
            onSelect={onSelect}
            onPositionChange={handlePositionChange}
          />
          <MapFlyer flyTo={flyTo} />
        </MapContainer>

        {selected && markerPos && (
          <FloatingCard
            professional={selected}
            pos={markerPos}
            containerSize={containerSize}
            onClose={onDeselect}
            onAddToTeam={onAddToTeam}
          />
        )}
      </div>
    </>
  )
}
