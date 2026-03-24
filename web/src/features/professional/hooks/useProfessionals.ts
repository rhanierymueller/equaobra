'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'

import { api } from '@/src/services/api'
import type { Professional, ProfessionalFilters, Profession } from '@/src/types/professional.types'
import { haversineKm } from '@/src/utils/geolocation'

const DEFAULT_FILTERS: ProfessionalFilters = {
  search: '',
  locality: '',
  professions: [],
  minRating: 0,
  maxDistanceKm: 50,
  availableOnly: false,
}

interface RawUser {
  id: string
  name: string
  profession?: string
  rating?: number
  reviewCount?: number
  available?: boolean
  phone?: string
  bio?: string
  address?: { lat?: number; lng?: number; neighborhood?: string; city?: string }
  avatarUrl?: string
  tags?: string[]
  hourlyRate?: number
}

function userToProfessional(u: RawUser): Professional {
  return {
    id: u.id,
    name: u.name,
    profession: (u.profession ?? '') as Profession,
    rating: u.rating ?? 0,
    reviewCount: u.reviewCount ?? 0,
    distanceKm: 0,
    available: u.available ?? true,
    phone: u.phone ?? '',
    bio: u.bio ?? '',
    location: {
      lat: u.address?.lat ?? 0,
      lng: u.address?.lng ?? 0,
      neighborhood: u.address?.neighborhood ?? '',
      city: u.address?.city ?? '',
    },
    completedJobs: 0,
    avatarInitials: u.name
      .split(' ')
      .slice(0, 2)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase(),
    avatarUrl: u.avatarUrl ?? undefined,
    tags: u.tags ?? [],
    hourlyRate: u.hourlyRate ?? undefined,
  }
}

function isValidCoord(lat: number, lng: number): boolean {
  return lat !== 0 || lng !== 0
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10
}

function withDistance(pros: Professional[], origin: [number, number] | null): Professional[] {
  if (!origin || !isValidCoord(origin[0], origin[1])) return pros
  return pros.map((p) => {
    if (!isValidCoord(p.location.lat, p.location.lng)) return p
    const km = haversineKm(origin, [p.location.lat, p.location.lng])
    return { ...p, distanceKm: roundToOneDecimal(km) }
  })
}

function matchesFilters(p: Professional, f: ProfessionalFilters, hasRef: boolean): boolean {
  if (f.search) {
    const q = f.search.toLowerCase()
    const matches =
      p.name.toLowerCase().includes(q) ||
      p.profession.toLowerCase().includes(q) ||
      p.location.neighborhood.toLowerCase().includes(q) ||
      p.location.city.toLowerCase().includes(q)
    if (!matches) return false
  }
  if (f.locality) {
    const loc = f.locality.toLowerCase()
    const city = p.location.city.toLowerCase()
    const hood = p.location.neighborhood.toLowerCase()
    const matches =
      hood.includes(loc) || loc.includes(hood) || city.includes(loc) || loc.includes(city)
    if (!matches) return false
  }
  if (f.professions.length > 0 && !f.professions.includes(p.profession)) return false
  if (p.rating < f.minRating) return false
  if (hasRef && f.maxDistanceKm < 50 && p.distanceKm > f.maxDistanceKm) return false
  if (f.availableOnly && !p.available) return false
  return true
}

export interface UseProfessionalsReturn {
  professionals: Professional[]
  filters: ProfessionalFilters
  selected: Professional | null
  resultCount: number
  isLoading: boolean
  isError: boolean
  setSearch: (search: string) => void
  setLocality: (locality: string) => void
  toggleProfession: (profession: Profession) => void
  setMinRating: (rating: number) => void
  setMaxDistance: (km: number) => void
  setAvailableOnly: (only: boolean) => void
  selectProfessional: (p: Professional | null) => void
  resetFilters: () => void
}

export function useProfessionals(
  referenceLocation: [number, number] | null = null,
  currentUserId?: string,
): UseProfessionalsReturn {
  const [allProfessionals, setAllProfessionals] = useState<Professional[]>([])
  const [filters, setFilters] = useState<ProfessionalFilters>(DEFAULT_FILTERS)
  const [selected, setSelected] = useState<Professional | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    api
      .get<RawUser[]>('/api/users/professionals')
      .then((data) => {
        setAllProfessionals(data.map(userToProfessional))
        setIsLoading(false)
      })
      .catch(() => {
        setIsError(true)
        setIsLoading(false)
      })
  }, [])

  const withDist = useMemo(
    () => withDistance(allProfessionals, referenceLocation),
    [allProfessionals, referenceLocation],
  )

  const hasRef =
    referenceLocation !== null && (referenceLocation[0] !== 0 || referenceLocation[1] !== 0)

  const professionals = useMemo(
    () =>
      withDist
        .filter((p) => p.id !== currentUserId && matchesFilters(p, filters, hasRef))
        .sort((a, b) => a.distanceKm - b.distanceKm),
    [withDist, filters, hasRef, currentUserId],
  )

  const setSearch = useCallback((search: string) => setFilters((prev) => ({ ...prev, search })), [])
  const setLocality = useCallback(
    (locality: string) => setFilters((prev) => ({ ...prev, locality })),
    [],
  )
  const toggleProfession = useCallback((profession: Profession) => {
    setFilters((prev) => ({
      ...prev,
      professions: prev.professions.includes(profession)
        ? prev.professions.filter((p) => p !== profession)
        : [...prev.professions, profession],
    }))
  }, [])
  const setMinRating = useCallback(
    (minRating: number) => setFilters((prev) => ({ ...prev, minRating })),
    [],
  )
  const setMaxDistance = useCallback(
    (maxDistanceKm: number) => setFilters((prev) => ({ ...prev, maxDistanceKm })),
    [],
  )
  const setAvailableOnly = useCallback(
    (availableOnly: boolean) => setFilters((prev) => ({ ...prev, availableOnly })),
    [],
  )
  const selectProfessional = useCallback((p: Professional | null) => setSelected(p), [])
  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  return {
    professionals,
    filters,
    selected,
    resultCount: professionals.length,
    isLoading,
    isError,
    setSearch,
    setLocality,
    toggleProfession,
    setMinRating,
    setMaxDistance,
    setAvailableOnly,
    selectProfessional,
    resetFilters,
  }
}
